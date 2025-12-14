const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Turso Database Connection
let dbClient;
let dbInitialized = false;

async function initializeTursoDB() {
  console.log('🔄 Initializing Turso Database...');
  
  try {
    // For Vercel + Turso
    const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://clickfit-db-engrmumtazali01.turso.io';
    const authToken = process.env.TURSO_AUTH_TOKEN || '';
    
    dbClient = createClient({
      url: dbUrl,
      authToken: authToken
    });
    
    console.log('✅ Turso database connected!');
    
    // Create users table if not exists
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        type TEXT DEFAULT 'user',
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await dbClient.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await dbClient.execute('CREATE INDEX IF NOT EXISTS idx_users_type ON users(type)');
    await dbClient.execute('CREATE INDEX IF NOT EXISTS idx_users_active ON users(active)');
    
    // Check if we have any users
    const result = await dbClient.execute('SELECT COUNT(*) as count FROM users');
    const userCount = result.rows[0].count;
    
    if (userCount === 0) {
      // Insert sample users
      await dbClient.execute(`
        INSERT INTO users (email, password, type, active) VALUES
        ('admin@clickfit.com', 'admin123', 'admin', 1),
        ('user@clickfit.com', 'user123', 'user', 1),
        ('trainer@clickfit.com', 'trainer123', 'trainer', 1)
      `);
      console.log('✅ Sample users inserted');
    }
    
    dbInitialized = true;
    console.log('✅ Turso database initialized!');
    
  } catch (error) {
    console.error('❌ Turso initialization failed:', error.message);
    console.log('⚠️  Running in NO-DATABASE mode');
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: dbInitialized ? 'turso-connected' : 'not-configured',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  if (!dbInitialized) {
    return res.json({
      success: false,
      error: 'Database not initialized',
      users: []
    });
  }
  
  try {
    const result = await dbClient.execute(`
      SELECT userId, email, type, active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  if (!dbInitialized) {
    return res.status(503).json({
      success: false,
      error: 'Database not initialized'
    });
  }
  
  try {
    const { email, password, type = 'user', active = true } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
    
    const result = await dbClient.execute({
      sql: 'INSERT INTO users (email, password, type, active) VALUES (?, ?, ?, ?)',
      args: [email, password, type, active ? 1 : 0]
    });
    
    res.json({
      success: true,
      userId: result.lastInsertRowid,
      message: 'User created successfully'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  if (!dbInitialized) {
    return res.json({
      success: false,
      connected: false,
      message: 'Turso database not connected.',
      help: 'Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables'
    });
  }
  
  try {
    const result = await dbClient.execute('SELECT COUNT(*) as count FROM users');
    
    res.json({
      success: true,
      connected: true,
      database: 'Turso (SQLite)',
      userCount: result.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../upload.html'));
});

app.get('/api-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../api-test.html'));
});

// Initialize and start server
async function startServer() {
  await initializeTursoDB();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`
🚀 ClickFit Server Running with Turso!
📍 http://localhost:${PORT}
📊 Database: ${dbInitialized ? '✅ Turso Connected' : '⚠️  Not Configured'}
💡 Health Check: http://localhost:${PORT}/health
📋 Users API: http://localhost:${PORT}/api/users
📊 DB Status: http://localhost:${PORT}/api/db-status
    `);
  });
}

// Export for Vercel
module.exports = app;

// Start if not in Vercel environment
if (require.main === module) {
  startServer();
}