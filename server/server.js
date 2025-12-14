// server/server.js - FINAL FIXED VERSION
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../upload_images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created');
}

// ⭐ SERVE STATIC FILES (Frontend) - MUST BE BEFORE ROUTES
app.use(express.static(path.join(__dirname, '..')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/upload_images', express.static(uploadDir));

// MySQL connection
let pool = null;
let dbInitialized = false;

async function initializeDatabase() {
  if (!process.env.DATABASE_HOST) {
    console.log('⚠️ Database not configured');
    return false;
  }

  try {
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ MySQL connected');
    
    try {
      await connection.query('SELECT 1 FROM users LIMIT 1');
      console.log('✅ Users table exists');
      dbInitialized = true;
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️ Creating users table...');
        await createSchema(connection);
        dbInitialized = true;
      } else {
        throw err;
      }
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL initialization failed:', error.message);
    return false;
  }
}

async function createSchema(connection) {
  try {
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

    await connection.query(`
      INSERT INTO users (email, password, type, active) VALUES
      ('admin@clickfit.com', 'admin123', 'admin', TRUE),
      ('user@clickfit.com', 'user123', 'user', TRUE),
      ('trainer@clickfit.com', 'trainer123', 'trainer', TRUE)
      ON DUPLICATE KEY UPDATE email=email
    `);
    console.log('✅ Sample users inserted');
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    throw error;
  }
}

// ⭐ LOCAL FILE UPLOAD CONFIGURATION
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

console.log('✅ Local file upload configured');

// ======================
// API ROUTES
// ======================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    database: dbInitialized,
    upload: true,
    port: process.env.PORT || 3001
  });
});

// Database status
app.get('/api/db-status', async (req, res) => {
  if (!pool) {
    return res.json({ 
      success: false, 
      configured: false,
      message: 'Database not configured' 
    });
  }

  try {
    await pool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      configured: true,
      connected: true,
      initialized: dbInitialized
    });
  } catch (error) {
    res.json({ 
      success: false, 
      configured: true,
      connected: false,
      error: error.message 
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  if (!dbInitialized) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not initialized' 
    });
  }
  
  try {
    const [rows] = await pool.query(
      'SELECT userId, email, type, active, created_at FROM users'
    );
    res.json({ success: true, count: rows.length, users: rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  if (!dbInitialized) {
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
  if (!dbInitialized) {
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
    
    res.json({ success: true, userId: result.insertId });
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

// ⭐ UPLOAD ENDPOINT
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
      filename: req.file.filename,
      url: `/upload_images/${req.file.filename}`,
      path: `/upload_images/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
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
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete file' 
      });
    }
    res.json({ success: true, message: 'File deleted' });
  });
});

// ⭐ HTML ROUTES - THESE MUST BE AFTER API ROUTES
app.get('/upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../upload.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message || 'Internal server error'
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    tip: 'Make sure the file exists in your project'
  });
});

// Initialize and start server
async function startServer() {
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 SERVER STARTED SUCCESSFULLY!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbInitialized ? '✅ Connected' : '❌ Not configured'}`);
    console.log(`📁 Upload: ✅ Enabled (Local Storage)`);
    console.log(`📂 Upload Directory: ${uploadDir}`);
    console.log(`\n📄 Available Routes:`);
    console.log(`   ✅ http://localhost:${PORT}/ (Main page)`);
    console.log(`   ✅ http://localhost:${PORT}/upload.html (Upload test page)`);
    console.log(`   ✅ http://localhost:${PORT}/api/users`);
    console.log(`   ✅ http://localhost:${PORT}/health`);
    console.log(`\n💡 Ready to accept uploads!\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.log(`💡 Try: netstat -ano | findstr :${PORT}`);
      console.log(`   Then: taskkill /PID <PID> /F`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
}

// Export for Vercel
module.exports = app;

// Start server locally
if (require.main === module) {
  startServer();
}