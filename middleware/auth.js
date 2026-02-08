// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../model/User');

// ============================================
// PROTECT MIDDLEWARE - Check if user is logged in
// ============================================

async function protect(req, res, next) {
  let token;
  
  // Step 1: Get token from Authorization header
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token (remove "Bearer " part)
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Step 2: Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }
  
  try {
    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Step 4: Get user from database (using ID from token)
    req.user = await User.findById(decoded.id).select('-password'); // Don't include password in req.user
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      });
    }
    
    // Step 5: User is authenticated! Continue to route handler
    next();
    
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.'
    });
  }
}

// ============================================
// AUTHORIZE MIDDLEWARE - Check user role
// ============================================

function authorize(...roles) {
  return function(req, res, next) {
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
}

module.exports = { protect, authorize };