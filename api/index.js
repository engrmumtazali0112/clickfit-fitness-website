// api/index.js - Minimal Vercel serverless function
const express = require('express');
const cors = require('cors');
// api/index.js - Vercel Serverless Entry Point
const app = require('../server/server');

module.exports = app;
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ClickFit API v2 is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '2.0'
  });
});

module.exports = app;