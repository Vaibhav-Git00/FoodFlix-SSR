const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const FoodBlog = require('../models/FoodBlog');

// Paths to JSON data
const blogDataPath = path.join(__dirname, 'blogData.json');
const articleDataPath = path.join(__dirname, 'articleData.json');

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
    // Clear existing data
    await FoodBlog.deleteMany({});
    console.log('Cleared existing food blog data');
    
    let migratedCount = 0;
    
    // Migrate blog data if exists
    if (fs.existsSync(blogDataPath)) {
      const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf-8'));
      
      const foodBlogs = blogData.map(blog => {
        return {
          title: blog.title,
          content: blog.summary || '',
          author: blog.author,
          date: blog.date,
          image: blog.image,
          category: mapBlogCategory(blog.category),
          cuisine: 'Other',
          tags: blog.tags || [],
          likes: [],
          views: 0
        };
      });
      
      if (foodBlogs.length > 0) {
        await FoodBlog.insertMany(foodBlogs);
        migratedCount += foodBlogs.length;
        console.log(`${foodBlogs.length} blogs migrated successfully`);
      }
    }
    
    // Migrate article data if exists
    if (fs.existsSync(articleDataPath)) {
      const articleData = JSON.parse(fs.readFileSync(articleDataPath, 'utf-8'));
      
      const foodBlogs = articleData.map(article => {
        return {
          title: article.title,
          content: article.content || '',
          author: article.author,
          date: article.date,
          image: article.image,
          category: mapArticleCategory(article.category),
          cuisine: 'Other',
          tags: article.tags || [],
          likes: article.likes || [],
          views: article.views || 0
        };
      });
      
      if (foodBlogs.length > 0) {
        await FoodBlog.insertMany(foodBlogs);
        migratedCount += foodBlogs.length;
        console.log(`${foodBlogs.length} articles migrated successfully`);
      }
    }
    
    console.log(`Total migration: ${migratedCount} items migrated to food blogs`);
    
    // Create sample food blogs if no data was migrated
    if (migratedCount === 0) {
      await createSampleFoodBlogs();
    }
    
    console.log('Migration completed');
    mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error);
    mongoose.disconnect();
  }
}

// Map blog categories to food blog categories
function mapBlogCategory(category) {
  const categoryMap = {
    'Technology': 'Cooking Tips',
    'Food': 'Recipes',
    'Travel': 'Food Travel',
    'Health': 'Nutrition',
    'Lifestyle': 'Other'
  };
  
  return categoryMap[category] || 'Other';
}

// Map article categories to food blog categories
function mapArticleCategory(category) {
  const categoryMap = {
    'News': 'Food Travel',
    'Tutorial': 'Cooking Tips',
    'Review': 'Restaurant Reviews',
    'Opinion': 'Nutrition',
    'Interview': 'Other'
  };
  
  return categoryMap[category] || 'Other';
}

// Create sample food blogs
async function createSampleFoodBlogs() {
  const sampleFoodBlogs = [
    {
      title: 'Homemade Italian Pizza Recipe',
      content: 'Learn how to make authentic Italian pizza at home with this simple recipe. The key is in the dough and using fresh ingredients.',
      author: 'Chef Mario',
      date: new Date(),
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      category: 'Recipes',
      cuisine: 'Italian',
      preparationTime: 60,
      difficulty: 'Medium',
      ingredients: ['Flour', 'Yeast', 'Olive Oil', 'Salt', 'Tomatoes', 'Mozzarella', 'Basil'],
      tags: ['pizza', 'italian', 'homemade'],
      likes: [],
      views: 0
    },
    {
      title: 'Top 10 Sushi Restaurants in Tokyo',
      content: 'Discover the best sushi restaurants in Tokyo, from high-end Michelin-starred establishments to hidden local gems.',
      author: 'Food Explorer',
      date: new Date(),
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      category: 'Restaurant Reviews',
      cuisine: 'Japanese',
      tags: ['sushi', 'tokyo', 'restaurants', 'japan'],
      likes: [],
      views: 0
    },
    {
      title: 'Essential Knife Skills Every Home Cook Should Know',
      content: 'Master the basic knife skills that will improve your cooking efficiency and food presentation.',
      author: 'Chef Academy',
      date: new Date(),
      image: 'https://images.unsplash.com/photo-1566454419290-57a0589c9b17',
      category: 'Cooking Tips',
      cuisine: 'Other',
      tags: ['knife skills', 'cooking basics', 'kitchen tips'],
      likes: [],
      views: 0
    }
  ];
  
  await FoodBlog.insertMany(sampleFoodBlogs);
  console.log(`${sampleFoodBlogs.length} sample food blogs created`);
}
