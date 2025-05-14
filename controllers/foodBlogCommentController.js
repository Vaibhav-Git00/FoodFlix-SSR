const FoodBlogComment = require('../models/FoodBlogComment');
const FoodBlog = require('../models/FoodBlog');

// Add a new comment
const addComment = async (commentData) => {
  try {
    // Validate required fields
    if (!commentData.content || !commentData.author || !commentData.foodBlog) {
      throw new Error('Missing required fields for comment');
    }
    
    // Create and save the comment
    const newComment = new FoodBlogComment(commentData);
    const savedComment = await newComment.save();
    
    console.log(`New comment added to food blog ${commentData.foodBlog} by ${commentData.author}`);
    
    return savedComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Delete a comment
const deleteComment = async (id) => {
  try {
    await FoodBlogComment.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// Get comments for a food blog
const getCommentsByFoodBlogId = async (foodBlogId) => {
  try {
    return await FoodBlogComment.find({ foodBlog: foodBlogId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Get average rating for a food blog
const getAverageRating = async (foodBlogId) => {
  try {
    const result = await FoodBlogComment.aggregate([
      { $match: { foodBlog: mongoose.Types.ObjectId(foodBlogId), rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    
    return result.length > 0 ? result[0].avgRating : 0;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};

module.exports = {
  addComment,
  deleteComment,
  getCommentsByFoodBlogId,
  getAverageRating
};
