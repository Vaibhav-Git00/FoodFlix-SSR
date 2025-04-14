const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../utils/blogData.json');

const getBlogs = () => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const getBlogById = (id) => {
  const blogs = getBlogs();
  return blogs.find((blog) => blog.id === parseInt(id));
};

const addBlog = (newBlog) => {
  const blogs = getBlogs();
  newBlog.id = blogs.length ? blogs[blogs.length - 1].id + 1 : 1; // Generate unique ID
  blogs.push(newBlog);
  fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2)); // Save to JSON file
};

const deleteBlog = (id) => {
  const blogs = getBlogs();
  const updatedBlogs = blogs.filter((blog) => blog.id !== parseInt(id)); // Filter out the blog with the given ID
  fs.writeFileSync(filePath, JSON.stringify(updatedBlogs, null, 2)); // Save updated data
};

const editBlog = (id, updatedBlog) => {
  const blogs = getBlogs();
  const index = blogs.findIndex((blog) => blog.id === parseInt(id));
  if (index !== -1) {
    blogs[index] = { ...blogs[index], ...updatedBlog };
    fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2)); // Save updated data
  }
};

exports.getAllBlogs = (req, res) => {
  const blogs = getBlogs();
  res.render('blog', { blogs });
};

exports.getBlogById = (req, res) => {
  const blog = getBlogById(req.params.id);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404).json({ message: 'Blog not found' });
  }
};

exports.createBlog = (req, res) => {
  const newBlog = { ...req.body };
  addBlog(newBlog);
  res.status(201).json(newBlog);
};

exports.updateBlog = (req, res) => {
  const blogs = getBlogs();
  const blog = blogs.find(b => b.id === parseInt(req.params.id));
  if (blog) {
    Object.assign(blog, req.body);
    fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2));
    res.json(blog);
  } else {
    res.status(404).json({ message: 'Blog not found' });
  }
};

exports.deleteBlog = (req, res) => {
  const blogId = req.params.id;
  const blogs = getBlogs();
  const blogExists = blogs.some(b => b.id === parseInt(blogId));
  if (blogExists) {
    deleteBlog(blogId);
    res.json({ message: 'Blog deleted' });
  } else {
    res.status(404).json({ message: 'Blog not found' });
  }
};

module.exports = { getBlogs, getBlogById, addBlog, deleteBlog, editBlog };
