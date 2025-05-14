const mongoose = require('mongoose');

const FoodBlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Recipes', 'Restaurant Reviews', 'Cooking Tips', 'Nutrition', 'Food Travel', 'Desserts', 'Beverages', 'Other'],
    default: 'Other'
  },
  cuisine: {
    type: String,
    enum: ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'French', 'American', 'Mediterranean', 'Other'],
    default: 'Other'
  },
  preparationTime: {
    type: Number,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  ingredients: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodBlog', FoodBlogSchema);
