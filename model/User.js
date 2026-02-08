const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  
  // Name field
  name: {
    type: String,           // Must be text
    required: true,         // Must provide a name
  },
  
  // Email field
  email: {
    type: String,
    required: true,
    unique: true,           // No two users can have same email
    lowercase: true,        // Convert to lowercase
  },
  
  // Password field
  password: {
    type: String,
    required: true,
    minlength: 6,   
    select: false   // Don't return password unless we ask for it        // At least 6 characters
  },

  role: {
    type: String,
    enum: ['user', 'admin'], // Only these values allowed
    default: 'user'          // New users are regular users by default
  },
  // When was this user created?
  createdAt: {
    type: Date,
    default: Date.now       // Automatically set to now
  }
});

// ============================================
// HASH PASSWORD BEFORE SAVING
// ============================================

// This runs BEFORE saving a user to database
userSchema.pre('save', async function() {
  
  // Only hash if password is new or changed
  if (!this.isModified('password')) {
    return ;
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// ============================================
// METHOD: Compare Passwords
// ============================================

// Check if entered password matches hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;