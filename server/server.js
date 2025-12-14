// server/server.js - FIXED VERSION
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();

// 🔍 DEBUG: Show loaded environment variables
console.log('\n🔍 DEBUG - Environment Variables:');
console.log('   DATABASE_HOST:', process.env.DATABASE_HOST || 'NOT SET');
console.log('   DATABASE_USERNAME:', process.env.DATABASE_USERNAME || 'NOT SET');
console.log('   DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '***SET***' : 'NOT SET');
console.log('   DATABASE_NAME:', process.env.DATABASE_NAME || 'NOT SET');
console.log('   PORT:', process.env.PORT || '3000 (default)');
console.log('');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directory
const uploadDir = path.join(__dirname, '../upload_images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created');
}

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/upload_images', express.static(uploadDir));

// Database connection pool
let pool = null;
let dbInitialized = false;

// Initialize database
async function initializeDatabase() {
  console.log('\n========================================');
  console.log('🔄 INITIALIZING DATABASE');
  console.log('========================================\n');
  
  // Check if database credentials are provided
  if (!process.env.DATABASE_HOST || !process.env.DATABASE_USERNAME || !process.env.DATABASE_PASSWORD) {
    console.log('⚠️  Database credentials not found in .env file');
    console.log('⚠️  Running in NO-DATABASE mode');
    console.log('\n💡 To enable database:');
    console.log('   1. Create/edit server/.env file');
    console.log('   2. Add these lines:');
    console.log('      DATABASE_HOST=your_host');
    console.log('      DATABASE_USERNAME=your_username');
    console.log('      DATABASE_PASSWORD=your_password');
    console.log('      DATABASE_NAME=clickfit_db');
    console.log('   3. Restart server\n');
    return false;
  }

  try {
    const mysql = require('mysql2/promise');
    
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: process.env.DATABASE_HOST.includes('psdb.cloud') || process.env.DATABASE_HOST.includes('planetscale') 
        ? { rejectUnauthorized: true } 
        : false,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    console.log('🔌 Testing MySQL connection...');
    console.log(`   Host: ${process.env.DATABASE_HOST}`);
    console.log(`   Database: ${process.env.DATABASE_NAME}`);
    console.log(`   User: ${process.env.DATABASE_USERNAME}`);

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection established!');
    
    // Check if users table exists
    try {
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table exists (${rows[0].count} users found)`);
      dbInitialized = true;
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️  Users table not found, creating schema...');
        await createSchema(connection);
        dbInitialized = true;
      } else {
        console.error('❌ Error checking users table:', err.message);
        throw err;
      }
    }
    
    connection.release();
    console.log('\n✅ Database initialized successfully!\n');
    return true;
    
  } catch (error) {
    console.error('\n❌ DATABASE INITIALIZATION FAILED!');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.error('Issue: Cannot resolve database host');
      console.error('Check: DATABASE_HOST value in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Issue: Access denied - incorrect credentials');
      console.error('Check: DATABASE_USERNAME and DATABASE_PASSWORD in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Issue: Database does not exist');
      console.error('Check: DATABASE_NAME in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Issue: Connection refused - MySQL server not running?');
      console.error('Check: Is MySQL/MariaDB running on your system?');
    }
    
    console.log('\n⚠️  Server will run in NO-DATABASE mode\n');
    console.log('========================================\n');
    return false;
  }
}

// Create database schema
async function createSchema(connection) {
  try {
    console.log('📝 Creating users table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userId INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        type ENUM('user', 'admin', 'trainer') DEFAULT 'user',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_type (type),
        INDEX idx_active (active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // Insert sample users
    console.log('📝 Inserting sample users...');
    await connection.query(`
      INSERT IGNORE INTO users (email, password, type, active) VALUES
      ('admin@clickfit.com', 'admin123', 'admin', TRUE),
      ('user@clickfit.com', 'user123', 'user', TRUE),
      ('trainer@clickfit.com', 'trainer123', 'trainer', TRUE)
    `);
    console.log('✅ Sample users inserted');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    throw error;
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP allowed.'));
    }
  }
});

console.log('✅ File upload configured');

// ==================== API ROUTES ====================

// Root endpoint - Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    database: dbInitialized ? 'connected' : 'not configured',
    upload: 'enabled',
    port: process.env.PORT || 3000,
    timestamp: new Date().toISOString()
  });
});

// Database status
app.get('/api/db-status', async (req, res) => {
  if (!pool) {
    return res.json({ 
      success: false, 
      configured: false,
      connected: false,
      initialized: false,
      message: 'Database not configured. Add credentials to .env file.'
    });
  }

  try {
    await pool.query('SELECT 1 as test');
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    res.json({ 
      success: true, 
      configured: true,
      connected: true,
      initialized: dbInitialized,
      userCount: userCount[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      success: false, 
      configured: true,
      connected: false,
      initialized: false,
      error: error.message 
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  if (!dbInitialized || !pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not initialized',
      message: 'Database connection is not available. Check server logs.',
      hint: 'Visit /api/db-status for details'
    });
  }
  
  try {
    const [rows] = await pool.query(
      'SELECT userId, email, type, active, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ 
      success: true, 
      count: rows.length, 
      users: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  if (!dbInitialized || !pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not initialized' 
    });
  }
  
  try {
    const [rows] = await pool.query(
      'SELECT userId, email, type, active, created_at FROM users WHERE userId = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  if (!dbInitialized || !pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not initialized' 
    });
  }
  
  try {
    const { email, password, type, active } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO users (email, password, type, active) VALUES (?, ?, ?, ?)',
      [email, password, type || 'user', active !== false]
    );
    
    res.json({ 
      success: true, 
      userId: result.insertId,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log('✅ File uploaded:', req.file.filename);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      url: `/upload_images/${req.file.filename}`,
      path: `/upload_images/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete image
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete file' 
      });
    }
    console.log('✅ File deleted:', filename);
    res.json({ 
      success: true, 
      message: 'File deleted successfully',
      filename: filename
    });
  });
});

// HTML routes
app.get('/upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../upload.html'));
});

app.get('/api-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../api-test.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path
  });
});

// Start server
async function startServer() {
  console.log('\n========================================');
  console.log('🚀 STARTING CLICKFIT SERVER');
  console.log('========================================\n');
  
  // Initialize database
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3000; // ⭐ CHANGED TO 3000
  const server = app.listen(PORT, () => {
    console.log('========================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbInitialized ? '✅ Connected & Initialized' : '⚠️  Not configured'}`);
    console.log(`📁 Upload: ✅ Enabled (Local Storage)`);
    console.log(`📂 Upload Directory: ${uploadDir}`);
    console.log('\n📄 Available Pages:');
    console.log(`   http://localhost:${PORT}/`);
    console.log(`   http://localhost:${PORT}/upload.html`);
    console.log(`   http://localhost:${PORT}/api-test.html`);
    console.log('\n🔌 API Endpoints:');
    console.log(`   http://localhost:${PORT}/health`);
    console.log(`   http://localhost:${PORT}/api/users`);
    console.log(`   http://localhost:${PORT}/api/db-status`);
    console.log('\n========================================');
    console.log('💡 Ready to accept requests!');
    console.log('========================================\n');
    
    if (!dbInitialized) {
      console.log('⚠️  IMPORTANT: Database is not configured!');
      console.log('\n💡 Create server/.env with:');
      console.log('   DATABASE_HOST=your_host');
      console.log('   DATABASE_USERNAME=your_username');
      console.log('   DATABASE_PASSWORD=your_password');
      console.log('   DATABASE_NAME=clickfit_db\n');
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
      console.log('\n💡 Solutions:');
      console.log('   1. Stop the other server using that port');
      console.log('   2. Or change PORT in .env file');
      console.log(`   3. On Windows: netstat -ano | findstr :${PORT}`);
      console.log('   4. Then: taskkill /PID <PID> /F\n');
    } else {
      console.error('\n❌ Server error:', err);
    }
    process.exit(1);
  });
}

// Export for Vercel
module.exports = app;

// Start server if run directly
if (require.main === module) {
  startServer();
}