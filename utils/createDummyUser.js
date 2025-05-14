const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    createDummyUser();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createDummyUser() {
  try {
    // Check if dummy user already exists
    const existingUser = await User.findOne({ email: 'dummy@example.com' });
    
    if (existingUser) {
      console.log('Dummy user already exists with ID:', existingUser._id);
      console.log('Use this ID in the blog routes for testing likes');
    } else {
      // Create a new dummy user
      const dummyUser = new User({
        name: 'Dummy User',
        email: 'dummy@example.com',
        password: 'password123'
      });
      
      const savedUser = await dummyUser.save();
      console.log('Dummy user created with ID:', savedUser._id);
      console.log('Use this ID in the blog routes for testing likes');
    }
    
    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating dummy user:', error);
    mongoose.disconnect();
  }
}
