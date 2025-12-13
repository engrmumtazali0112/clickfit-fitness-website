// Node.js Express Server for ClickFit - VERCEL OPTIMIZED

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create MySQL connection pool
let pool;
if (process.env.DATABASE_HOST) {
  pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  console.log('✅ MySQL connection pool created');
}

// Configure Cloudinary
let cloudinary, streamifier;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  try {
    cloudinary = require('cloudinary').v2;
    streamifier = require('streamifier');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    console.log('✅ Cloudinary configured');
  } catch (error) {
    console.log('⚠️  Cloudinary not available:', error.message);
  }
}

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ClickFit API is running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    database: !!pool,
    cloudinary: !!cloudinary
  });
});

// API Routes
if (pool) {
  // Get all users
  app.get('/api/users', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT userId, email, type, active, created_at FROM users');
      res.json({ success: true, count: rows.length, users: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user by ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT userId, email, type, active, created_at FROM users WHERE userId = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, user: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create user
  app.post('/api/users', async (req, res) => {
    try {
      const { email, password, type, active } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }
      const [result] = await pool.query(
        'INSERT INTO users (email, password, type, active) VALUES (?, ?, ?, ?)',
        [email, password, type || 'user', active !== false]
      );
      res.json({ success: true, userId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// Upload routes
if (cloudinary && streamifier) {
  app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'clickfit', resource_type: 'image' },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
        res.json({
          success: true,
          filename: result.public_id,
          url: result.secure_url,
          path: result.secure_url
        });
      }
    );
    
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });
}

// Error handler
app.use((error, req, res, next) => {
  res.status(500).json({ success: false, error: error.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = app;