const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Blog = require('../models/Blog');

// Path to JSON data
const blogDataPath = path.join(__dirname, 'blogData.json');

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
    // Check if JSON file exists
    if (fs.existsSync(blogDataPath)) {
      // Read JSON data
      const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf-8'));
      
      // Clear existing data
      await Blog.deleteMany({});
      
      // Prepare blog data for MongoDB
      const blogs = blogData.map(blog => {
        return {
          title: blog.title,
          summary: blog.summary,
          author: blog.author,
          date: blog.date,
          image: blog.image,
          likes: []
        };
      });
      
      // Insert data into MongoDB
      if (blogs.length > 0) {
        await Blog.insertMany(blogs);
        console.log(`${blogs.length} blogs migrated successfully`);
      } else {
        console.log('No blogs to migrate');
      }
    } else {
      console.log('Blog data file not found');
    }
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration error:', error);
    mongoose.disconnect();
  }
}
