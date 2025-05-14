const express = require('express');
const router = express.Router();
const {
  getFoodBlogs,
  getFoodBlogById,
  editFoodBlog,
  addFoodBlog,
  deleteFoodBlog,
  likeFoodBlog,
  getFoodBlogComments,
  getRelatedFoodBlogs,
  getRelatedByCuisine,
  getCommentCount,
  getCommentCounts,
  searchFoodBlogs
} = require('../controllers/foodBlogController');
const { addComment, deleteComment, getAverageRating } = require('../controllers/foodBlogCommentController');
const FoodBlogComment = require('../models/FoodBlogComment');

// Get all food blogs
router.get('/', async (req, res) => {
  try {
    const foodBlogs = await getFoodBlogs();
    
    // Get comment counts for each food blog
    const foodBlogsWithCommentCounts = await Promise.all(foodBlogs.map(async (foodBlog) => {
      const commentCount = await getCommentCount(foodBlog._id);
      return {
        ...foodBlog.toObject(),
        commentCount
      };
    }));
    
    res.render('foodBlog', {
      title: '🍽️ Food Blogs',
      foodBlogs: foodBlogsWithCommentCounts
    });
  } catch (error) {
    console.error('Error in food blog route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Search food blogs
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const foodBlogs = await searchFoodBlogs(query);
    
    // Get comment counts for each food blog
    const foodBlogsWithCommentCounts = await Promise.all(foodBlogs.map(async (foodBlog) => {
      const commentCount = await getCommentCount(foodBlog._id);
      return {
        ...foodBlog.toObject(),
        commentCount
      };
    }));
    
    res.render('foodBlog', {
      title: `Search Results for "${query}"`,
      foodBlogs: foodBlogsWithCommentCounts,
      searchQuery: query
    });
  } catch (error) {
    console.error('Error in food blog search route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Show add food blog form
router.get('/add', (req, res) => {
  res.render('addFoodBlog', { title: 'Add Food Blog' });
});

// Add a new food blog
router.post('/add', async (req, res) => {
  try {
    await addFoodBlog(req.body);
    res.redirect('/foodblogs');
  } catch (error) {
    console.error('Error adding food blog:', error);
    res.status(500).render('error', { message: 'Error adding food blog' });
  }
});

// Show food blog details with comments
router.get('/view/:id', async (req, res) => {
  try {
    const foodBlog = await getFoodBlogById(req.params.id);
    if (!foodBlog) {
      return res.status(404).render('error', { message: 'Food blog not found' });
    }
    
    const comments = await getFoodBlogComments(req.params.id);
    
    // Get related food blogs with the same category
    const relatedByCategory = await getRelatedFoodBlogs(foodBlog._id, foodBlog.category, 3);
    
    // Get related food blogs with the same cuisine
    const relatedByCuisine = await getRelatedByCuisine(foodBlog._id, foodBlog.cuisine, 3);
    
    // Get average rating
    const averageRating = await getAverageRating(req.params.id);
    
    res.render('foodBlogDetail', {
      title: foodBlog.title,
      foodBlog,
      comments,
      likesCount: foodBlog.likes.length,
      relatedByCategory,
      relatedByCuisine,
      averageRating
    });
  } catch (error) {
    console.error('Error viewing food blog:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Show edit food blog form
router.get('/edit/:id', async (req, res) => {
  try {
    const foodBlog = await getFoodBlogById(req.params.id);
    if (!foodBlog) {
      return res.status(404).render('error', { message: 'Food blog not found' });
    }
    res.render('editFoodBlog', { title: 'Edit Food Blog', foodBlog });
  } catch (error) {
    console.error('Error in edit food blog route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Update a food blog
router.post('/edit/:id', async (req, res) => {
  try {
    await editFoodBlog(req.params.id, req.body);
    res.redirect('/foodblogs');
  } catch (error) {
    console.error('Error updating food blog:', error);
    res.status(500).render('error', { message: 'Error updating food blog' });
  }
});

// Delete a food blog
router.get('/delete/:id', async (req, res) => {
  try {
    await deleteFoodBlog(req.params.id);
    res.redirect('/foodblogs');
  } catch (error) {
    console.error('Error deleting food blog:', error);
    res.status(500).render('error', { message: 'Error deleting food blog' });
  }
});

// Like a food blog
router.post('/like/:id', async (req, res) => {
  try {
    // For simplicity, we're using a dummy user ID
    // In a real app, this would come from authentication
    const userId = '6821feba86cb835017d39a04'; // Use the ID from the created dummy user
    
    // Get the food blog and update likes
    const foodBlog = await likeFoodBlog(req.params.id, userId);
    
    // Log the like action
    console.log(`Food blog ${req.params.id} liked by user ${userId}. New like count: ${foodBlog.likes.length}`);
    
    // Return JSON response with updated like count
    return res.json({
      success: true,
      likesCount: foodBlog.likes.length
    });
  } catch (error) {
    console.error('Error liking food blog:', error);
    return res.status(500).json({ success: false, message: 'Error liking food blog' });
  }
});

// Add a comment to a food blog
router.post('/comment/:id', async (req, res) => {
  try {
    const { content, author, rating } = req.body;
    
    // Validate required fields
    if (!content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Content and author are required'
      });
    }
    
    // Create the comment
    const comment = await addComment({
      content,
      author,
      foodBlog: req.params.id,
      rating: rating ? parseInt(rating) : undefined
    });
    
    // Log the comment action
    console.log(`New comment added to food blog ${req.params.id} by ${author}`);
    
    // Get updated comment count
    const comments = await getFoodBlogComments(req.params.id);
    
    // Get updated average rating
    const averageRating = await getAverageRating(req.params.id);
    
    // Return JSON with the new comment and updated count
    return res.json({
      success: true,
      comment,
      commentsCount: comments.length,
      averageRating
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

// Delete a comment
router.get('/comment/delete/:id', async (req, res) => {
  try {
    const comment = await FoodBlogComment.findById(req.params.id);
    const foodBlogId = comment.foodBlog;
    
    await deleteComment(req.params.id);
    res.redirect(`/foodblogs/view/${foodBlogId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).render('error', { message: 'Error deleting comment' });
  }
});

module.exports = router;
