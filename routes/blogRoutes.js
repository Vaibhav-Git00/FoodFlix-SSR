const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, editBlog, addBlog, deleteBlog } = require('../controllers/blogController');

router.get('/', (req, res) => {
  const blogs = getBlogs();
  res.render('blog', { title: '📝 Blogs', blogs });
});

router.get('/add', (req, res) => {
  res.render('addBlog', { title: 'Add Blog' });
});

router.post('/add', (req, res) => {
  addBlog(req.body); // Add the blog data to the JSON file
  res.redirect('/blogs'); // Redirect back to the main blog page
});

router.get('/edit/:id', (req, res) => {
  const blog = getBlogById(req.params.id);
  res.render('editBlog', { title: 'Edit Blog', blog });
});

router.post('/edit/:id', (req, res) => {
  editBlog(req.params.id, req.body);
  res.redirect('/blogs');
});

router.get('/delete/:id', (req, res) => {
  deleteBlog(req.params.id); // Delete the blog by ID
  res.redirect('/blogs'); // Redirect back to the main blog page
});

module.exports = router;
