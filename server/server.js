const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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
app.use('/upload_images', express.static(path.join(__dirname, '../upload_images')));

// Database configuration
let databaseType = process.env.DATABASE_TYPE || 'turso'; // Default to turso for Vercel
let dbClient = null;
let dbInitialized = false;

console.log(`🔍 Initializing with database type: ${databaseType}`);

// Database initialization
async function initializeDatabase() {
  console.log(`🔄 Initializing ${databaseType.toUpperCase()} database...`);
  
  try {
    if (databaseType === 'mysql') {
      await initializeMySQL();
    } else if (databaseType === 'turso') {
      await initializeTurso();
    } else {
      console.log('⚠️  Unsupported database type, defaulting to MySQL');
      await initializeMySQL();
    }
    
    dbInitialized = true;
    console.log(`✅ ${databaseType.toUpperCase()} database initialized successfully!`);
    
  } catch (error) {
    console.error(`❌ ${databaseType.toUpperCase()} initialization failed:`, error.message);
    console.log('⚠️  Running in NO-DATABASE mode');
  }
}

// MySQL initialization for local development
async function initializeMySQL() {
  const mysql = require('mysql2/promise');
  
  const connectionConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USERNAME || 'clickfit_user',
    password: process.env.DATABASE_PASSWORD || 'ClickFit2024!',
    database: process.env.DATABASE_NAME || 'clickfit_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  console.log('🔌 MySQL Connection Config:', {
    host: connectionConfig.host,
    user: connectionConfig.user,
    database: connectionConfig.database
  });
  
  dbClient = await mysql.createPool(connectionConfig);
  
  // Test connection
  const connection = await dbClient.getConnection();
  console.log('✅ MySQL connection established!');
  
  // Create users table if not exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      userId INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'user',
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  
  // Check if we have any users
  const [result] = await connection.query('SELECT COUNT(*) as count FROM users');
  const userCount = result[0].count;
  
  if (userCount === 0) {
    console.log('📝 Inserting sample users into MySQL...');
    await connection.query(`
      INSERT INTO users (email, password, type, active) VALUES
      ('admin@clickfit.com', 'admin123', 'admin', 1),
      ('user@clickfit.com', 'user123', 'user', 1),
      ('trainer@clickfit.com', 'trainer123', 'trainer', 1)
      ON DUPLICATE KEY UPDATE email=email
    `);
    console.log('✅ Sample users inserted into MySQL');
  }
  
  connection.release();
}

// Turso initialization for Vercel deployment
async function initializeTurso() {
  const { createClient } = require('@libsql/client');
  
  const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://clickfit-db-vercel-icfg-sg2aam83vn0bjlnpfwmileet.aws-us-east-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU3NDUwMzQsImlkIjoiMmM1YzUyZjEtOTQ0Ny00YzQ4LWFiYTEtN2MyNTczYTA3NTY0IiwicmlkIjoiNzBmNDUwNGUtZGZjZS00MTIyLTkzZmEtN2M4MzY3MWU2NDI0In0.CqujQOilROckiSRfPATQ5RFqPE0mHTvZOQh0HHo-3zg8c0DEOjcXLpUeZPTDp17_Yh-v5ONBcdLLMvflUWg_Bg';
  
  console.log('🔌 Turso Connection Config:', {
    url: dbUrl.replace(authToken.substring(0, 20) + '...', 'TOKEN_HIDDEN'),
    tokenLength: authToken.length
  });
  
  dbClient = createClient({
    url: dbUrl,
    authToken: authToken
  });
  
  // Test connection
  try {
    await dbClient.execute('SELECT 1');
    console.log('✅ Turso connection established!');
    
    // Create users table if not exists
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        type TEXT DEFAULT 'user',
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await dbClient.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await dbClient.execute('CREATE INDEX IF NOT EXISTS idx_users_type ON users(type)');
    
    // Check if we have any users
    const result = await dbClient.execute('SELECT COUNT(*) as count FROM users');
    const userCount = result.rows[0].count;
    
    if (userCount === 0) {
      console.log('📝 Inserting sample users into Turso...');
      try {
        await dbClient.execute(`
          INSERT INTO users (email, password, type, active) VALUES
          ('admin@clickfit.com', 'admin123', 'admin', 1),
          ('user@clickfit.com', 'user123', 'user', 1),
          ('trainer@clickfit.com', 'trainer123', 'trainer', 1)
        `);
        console.log('✅ Sample users inserted into Turso');
      } catch (insertError) {
        console.log('⚠️  Sample users may already exist:', insertError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Turso connection failed:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: {
      type: databaseType,
      connected: dbInitialized,
      mode: process.env.VERCEL ? 'vercel' : 'local'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  if (!dbInitialized) {
    return res.json({
      success: false,
      error: 'Database not initialized',
      users: [],
      database: databaseType
    });
  }
  
  try {
    let users;
    
    if (databaseType === 'mysql') {
      const [rows] = await dbClient.query(
        'SELECT userId, email, type, active, created_at FROM users ORDER BY created_at DESC'
      );
      users = rows;
    } else if (databaseType === 'turso') {
      const result = await dbClient.execute(
        'SELECT userId, email, type, active, created_at FROM users ORDER BY created_at DESC'
      );
      users = result.rows;
    }
    
    res.json({
      success: true,
      count: users.length,
      users: users,
      database: databaseType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: databaseType
    });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  if (!dbInitialized) {
    return res.status(503).json({
      success: false,
      error: 'Database not initialized',
      database: databaseType
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
    
    let result;
    
    if (databaseType === 'mysql') {
      const [insertResult] = await dbClient.query(
        'INSERT INTO users (email, password, type, active) VALUES (?, ?, ?, ?)',
        [email, password, type, active]
      );
      result = { userId: insertResult.insertId };
    } else if (databaseType === 'turso') {
      const insertResult = await dbClient.execute({
        sql: 'INSERT INTO users (email, password, type, active) VALUES (?, ?, ?, ?)',
        args: [email, password, type, active ? 1 : 0]
      });
      result = { userId: insertResult.lastInsertRowid };
    }
    
    res.json({
      success: true,
      userId: result.userId,
      message: 'User created successfully',
      database: databaseType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate email errors
    if (error.code === 'ER_DUP_ENTRY' || error.code === 11000 || 
        error.message.includes('UNIQUE constraint') || 
        error.message.includes('duplicate key')) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
        database: databaseType
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      database: databaseType
    });
  }
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  if (!dbInitialized) {
    return res.json({
      success: false,
      configured: false,
      connected: false,
      type: databaseType,
      mode: process.env.VERCEL ? 'vercel' : 'local',
      message: `${databaseType.toUpperCase()} database not initialized.`,
      help: process.env.VERCEL 
        ? 'Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN on Vercel'
        : 'Check DATABASE_HOST, DATABASE_USERNAME, DATABASE_PASSWORD for MySQL'
    });
  }
  
  try {
    let userCount;
    
    if (databaseType === 'mysql') {
      const [result] = await dbClient.query('SELECT COUNT(*) as count FROM users');
      userCount = result[0].count;
    } else if (databaseType === 'turso') {
      const result = await dbClient.execute('SELECT COUNT(*) as count FROM users');
      userCount = result.rows[0].count;
    }
    
    res.json({
      success: true,
      configured: true,
      connected: true,
      type: databaseType,
      mode: process.env.VERCEL ? 'vercel' : 'local',
      userCount: userCount || 0,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: databaseType
    });
  }
});

// File upload setup
const uploadDir = path.join(__dirname, '../upload_images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'image-' + uniqueSuffix + ext);
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
      cb(new Error('Invalid file type. Only images allowed.'));
    }
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

// Delete image endpoint
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

// Serve HTML pages
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
  console.log('\n========================================');
  console.log('🚀 STARTING CLICKFIT DUAL-DATABASE SERVER');
  console.log('========================================\n');
  
  console.log('📊 Configuration:');
  console.log(`   Database Type: ${databaseType}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port: ${process.env.PORT || 3000}`);
  console.log(`   Vercel: ${process.env.VERCEL ? 'Yes' : 'No'}`);
  
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbInitialized ? `✅ ${databaseType.toUpperCase()} Connected` : '⚠️  Not Configured'}`);
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
    console.log(`   http://localhost:${PORT}/upload`);
    console.log('\n========================================');
    console.log('💡 Ready to accept requests!');
    console.log('========================================\n');
    
    if (!dbInitialized) {
      console.log('⚠️  IMPORTANT: Database is not connected!');
      console.log('\n💡 For LOCAL (MySQL):');
      console.log('   DATABASE_TYPE=mysql');
      console.log('   DATABASE_HOST=localhost');
      console.log('   DATABASE_USERNAME=clickfit_user');
      console.log('   DATABASE_PASSWORD=ClickFit2024!');
      console.log('   DATABASE_NAME=clickfit_db\n');
      console.log('💡 For VERCEL (Turso):');
      console.log('   DATABASE_TYPE=turso');
      console.log('   TURSO_DATABASE_URL=your_turso_url');
      console.log('   TURSO_AUTH_TOKEN=your_turso_token\n');
    }
  });
}

// Export for Vercel
module.exports = app;

// Start if not in Vercel environment
if (require.main === module) {
  startServer();
}