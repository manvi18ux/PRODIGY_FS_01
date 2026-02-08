

require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const cors = require('cors');
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourapp.vercel.app' : 'http://localhost:3000',
  credentials: true
}));

const app = express();

// ============================================
// CONNECT DATABASE
// ============================================

connectDB();
app.use(cors());
// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Auth routes
const authRoutes = require('../routes/auth');

// Use auth routes
app.use('/api/auth', authRoutes);

// Home route
app.get('/', function (req, res) {
  res.json({
    message: 'Authentication API',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log('================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log('================================');
});