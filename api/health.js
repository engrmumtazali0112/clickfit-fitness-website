// api/health.js
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
}