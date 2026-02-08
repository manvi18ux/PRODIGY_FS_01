const mongoose = require('mongoose');

// Function to connect to MongoDB
async function connectDB() {
  try {
    // Connect using the URI from .env file
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // Stop the server if database fails
  }
}

module.exports = connectDB;