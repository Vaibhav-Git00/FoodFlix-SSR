const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Blog = require('../models/Blog');
const Restaurant = require('../models/Restaurant');
const UserProfile = require('../models/UserProfile');
const Comment = require('../models/Comment');

// Paths to JSON data
const blogDataPath = path.join(__dirname, 'blogData.json');
const restaurantDataPath = path.join(__dirname, 'restaurantData.json');
const userDataPath = path.join(__dirname, 'userData.json');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    migrateData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateData() {
  try {
    // Migrate blog data
    if (fs.existsSync(blogDataPath)) {
      const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf-8'));
      await Blog.deleteMany({});
      
      const blogs = blogData.map(blog => {
        return {
          title: blog.title,
          summary: blog.summary,
          author: blog.author,
          date: blog.date,
          image: blog.image,
          category: blog.category || 'Other',
          likes: []
        };
      });
      
      if (blogs.length > 0) {
        await Blog.insertMany(blogs);
        console.log(`${blogs.length} blogs migrated successfully`);
      }
    }
    
    // Migrate restaurant data
    if (fs.existsSync(restaurantDataPath)) {
      const restaurantData = JSON.parse(fs.readFileSync(restaurantDataPath, 'utf-8'));
      await Restaurant.deleteMany({});
      
      const restaurants = restaurantData.map(restaurant => {
        return {
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          location: restaurant.location,
          status: restaurant.status,
          image: restaurant.image
        };
      });
      
      if (restaurants.length > 0) {
        await Restaurant.insertMany(restaurants);
        console.log(`${restaurants.length} restaurants migrated successfully`);
      }
    }
    
    // Migrate user data
    if (fs.existsSync(userDataPath)) {
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
      await UserProfile.deleteMany({});
      
      const users = userData.map(user => {
        return {
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };
      });
      
      if (users.length > 0) {
        await UserProfile.insertMany(users);
        console.log(`${users.length} users migrated successfully`);
      }
    }
    
    console.log('Migration completed');
    mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error);
    mongoose.disconnect();
  }
}
