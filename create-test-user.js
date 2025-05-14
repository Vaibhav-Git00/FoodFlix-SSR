const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Food')
  .then(() => {
    console.log('MongoDB connected successfully');
    createTestUser();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestUser() {
  try {
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (testUser) {
      console.log('Test user already exists:', testUser._id);
    } else {
      // Create a test user
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '123-456-7890',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        addresses: [
          {
            street: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            isDefault: true,
            label: 'Home'
          }
        ],
        paymentMethods: [
          {
            type: 'Credit Card',
            cardNumber: '4111111111111111',
            nameOnCard: 'Test User',
            expiryDate: '12/25',
            isDefault: true,
            lastFourDigits: '1111'
          }
        ],
        role: 'customer'
      });
      
      await testUser.save();
      console.log('Created test user:', testUser._id);
    }
    
    // Update the default user ID in the cart controller
    console.log('Use this ID in your cart controller:');
    console.log(testUser._id.toString());
    console.log('Update the default user ID in controllers/cartController.js:');
    console.log(`const userId = req.session.userId || '${testUser._id.toString()}'; // Default user ID for testing`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test user:', error);
    mongoose.disconnect();
  }
}
