const FoodBlog = require('../models/FoodBlog');
const FoodBlogComment = require('../models/FoodBlogComment');

// Get all food blogs
const getFoodBlogs = async () => {
  try {
    return await FoodBlog.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching food blogs:', error);
    return [];
  }
};

// Get food blog by ID
const getFoodBlogById = async (id) => {
  try {
    const foodBlog = await FoodBlog.findById(id);
    if (foodBlog) {
      // Increment view count
      foodBlog.views += 1;
      await foodBlog.save();
    }
    return foodBlog;
  } catch (error) {
    console.error('Error fetching food blog by ID:', error);
    return null;
  }
};

// Get related food blogs by category
const getRelatedFoodBlogs = async (foodBlogId, category, limit = 3) => {
  try {
    return await FoodBlog.find({
      _id: { $ne: foodBlogId },
      category: category
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  } catch (error) {
    console.error('Error fetching related food blogs:', error);
    return [];
  }
};

// Get related food blogs by cuisine
const getRelatedByCuisine = async (foodBlogId, cuisine, limit = 3) => {
  try {
    return await FoodBlog.find({
      _id: { $ne: foodBlogId },
      cuisine: cuisine
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  } catch (error) {
    console.error('Error fetching related food blogs by cuisine:', error);
    return [];
  }
};

// Add a new food blog
const addFoodBlog = async (foodBlogData) => {
  try {
    // Convert tags and ingredients strings to arrays if provided
    if (foodBlogData.tags && typeof foodBlogData.tags === 'string') {
      foodBlogData.tags = foodBlogData.tags.split(',').map(tag => tag.trim());
    }
    
    if (foodBlogData.ingredients && typeof foodBlogData.ingredients === 'string') {
      foodBlogData.ingredients = foodBlogData.ingredients.split(',').map(ingredient => ingredient.trim());
    }
    
    const newFoodBlog = new FoodBlog(foodBlogData);
    return await newFoodBlog.save();
  } catch (error) {
    console.error('Error adding food blog:', error);
    throw error;
  }
};

// Delete a food blog
const deleteFoodBlog = async (id) => {
  try {
    // Delete the food blog
    await FoodBlog.findByIdAndDelete(id);
    // Delete all comments associated with the food blog
    await FoodBlogComment.deleteMany({ foodBlog: id });
    return true;
  } catch (error) {
    console.error('Error deleting food blog:', error);
    return false;
  }
};

// Edit a food blog
const editFoodBlog = async (id, updatedData) => {
  try {
    // Convert tags and ingredients strings to arrays if provided
    if (updatedData.tags && typeof updatedData.tags === 'string') {
      updatedData.tags = updatedData.tags.split(',').map(tag => tag.trim());
    }
    
    if (updatedData.ingredients && typeof updatedData.ingredients === 'string') {
      updatedData.ingredients = updatedData.ingredients.split(',').map(ingredient => ingredient.trim());
    }
    
    return await FoodBlog.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (error) {
    console.error('Error updating food blog:', error);
    return null;
  }
};

// Like a food blog
const likeFoodBlog = async (foodBlogId, userId) => {
  try {
    const foodBlog = await FoodBlog.findById(foodBlogId);
    if (!foodBlog) {
      throw new Error('Food blog not found');
    }
    
    // Convert userId to string for comparison
    userId = userId.toString();
    
    // Check if user already liked the food blog
    const alreadyLiked = foodBlog.likes.some(id => id.toString() === userId);
    
    if (alreadyLiked) {
      // Remove like
      foodBlog.likes = foodBlog.likes.filter(id => id.toString() !== userId);
    } else {
      // Add like
      foodBlog.likes.push(userId);
    }
    
    // Save the updated food blog
    const updatedFoodBlog = await foodBlog.save();
    console.log(`Food blog ${foodBlogId} likes updated. Current likes: ${updatedFoodBlog.likes.length}`);
    return updatedFoodBlog;
  } catch (error) {
    console.error('Error liking food blog:', error);
    throw error;
  }
};

// Get comments for a food blog
const getFoodBlogComments = async (foodBlogId) => {
  try {
    return await FoodBlogComment.find({ foodBlog: foodBlogId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching food blog comments:', error);
    return [];
  }
};

// Get comment count for a food blog
const getCommentCount = async (foodBlogId) => {
  try {
    return await FoodBlogComment.countDocuments({ foodBlog: foodBlogId });
  } catch (error) {
    console.error('Error counting food blog comments:', error);
    return 0;
  }
};

// Get comment counts for multiple food blogs
const getCommentCounts = async (foodBlogIds) => {
  try {
    const counts = {};
    await Promise.all(
      foodBlogIds.map(async (id) => {
        counts[id] = await getCommentCount(id);
      })
    );
    return counts;
  } catch (error) {
    console.error('Error getting comment counts:', error);
    return {};
  }
};

// Search food blogs
const searchFoodBlogs = async (query) => {
  try {
    return await FoodBlog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { ingredients: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error searching food blogs:', error);
    return [];
  }
};

module.exports = {
  getFoodBlogs,
  getFoodBlogById,
  addFoodBlog,
  deleteFoodBlog,
  editFoodBlog,
  likeFoodBlog,
  getFoodBlogComments,
  getRelatedFoodBlogs,
  getRelatedByCuisine,
  getCommentCount,
  getCommentCounts,
  searchFoodBlogs
};
