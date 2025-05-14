const mongoose = require('mongoose');

const FoodBlogCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  foodBlog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodBlog',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodBlogComment', FoodBlogCommentSchema);
