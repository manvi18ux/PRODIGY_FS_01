const express = require('express');
const router = express.Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
// ============================================
// ROUTE 1: REGISTER NEW USER
// ============================================

router.post('/register', async function(req, res) {
  try {
    // Get data from request body
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = await User.create({
      name: name,
      email: email,
      password: password  // Will be automatically hashed!
    });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },                    // Put user ID in token
      process.env.JWT_SECRET,              // Sign with secret key
      { expiresIn: process.env.JWT_EXPIRE } // Token expires in 7 days
    );
    
    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
  console.log("🔥 REGISTER ERROR 🔥");
  console.log(error);            // full error
  console.log(error.message);    // message only

  res.status(500).json({
    success: false,
    error: error.message
  });
}
});

// ============================================
// ROUTE 2: LOGIN USER
// ============================================

router.post('/login', async function(req, res) {
  try {
    // Get credentials from request
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email: email }).select('+password'); // We need password for comparison, so select it explicitly
    
    // If user doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;

// ============================================
// ROUTE 3: GET CURRENT USER (Protected)
// ============================================

router.get('/me', protect, async function(req, res) {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// ============================================
// ROUTE 4: UPDATE USER DETAILS (Protected)
// ============================================

router.put('/updatedetails', protect, async function(req, res) {
  try {
    const { name, email } = req.body;
    
    // Fields to update
    const fieldsToUpdate = {
      name: name,
      email: email
    };
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,              // Return updated document
        runValidators: true     // Run model validators
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user details'
    });
  }
});

// ============================================
// ROUTE 5: UPDATE PASSWORD (Protected)
// ============================================

router.put('/updatepassword', protect, async function(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get user with password (it's excluded by default)
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Set new password (will be hashed automatically)
    user.password = newPassword;
    await user.save();
    
    // Generate new token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: token
    });
    
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// ============================================
// ROUTE 6: LOGOUT (Protected)
// ============================================

router.get('/logout', protect, function(req, res) {
  // With JWT, logout is handled on client side by deleting token
  // But we can still have an endpoint for consistency
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete your token on client side.'
  });
});

// ============================================
// ROUTE 7: ADMIN ONLY ROUTE (Protected + Admin)
// ============================================

router.get('/admin', protect, authorize('admin'), function(req, res) {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! This is a protected admin-only route.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ============================================
// ROUTE 8: GET ALL USERS (Admin Only)
// ============================================

router.get('/users', protect, authorize('admin'), async function(req, res) {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

module.exports = router;