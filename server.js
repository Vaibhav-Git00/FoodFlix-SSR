const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const foodBlogRoutes = require('./routes/foodBlogRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Set HBS as the templating engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Register Handlebars helpers
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
});
hbs.registerHelper('truncate', function(text, length) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
});
hbs.registerHelper('join', function(array) {
  if (!array || !Array.isArray(array)) return '';
  return array.join(', ');
});
hbs.registerHelper('times', function(n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});
hbs.registerHelper('subtract', function(a, b) {
  return a - b;
});
hbs.registerHelper('floor', function(num) {
  return Math.floor(num);
});
hbs.registerHelper('ceiling', function(num) {
  return Math.ceil(num);
});
hbs.registerHelper('decimal', function(num) {
  return num % 1 >= 0.5;
});
hbs.registerHelper('formatNumber', function(num, decimals) {
  return num.toFixed(decimals);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(bodyParser.json()); // Parse JSON data
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request body:', JSON.stringify(req.body));
  }
  next();
});

// Home route
app.get('/', async (req, res) => {
  try {
    const foodBlogCount = await require('./models/FoodBlog').countDocuments();
    const restaurantCount = await require('./models/Restaurant').countDocuments();
    const userCount = await require('./models/UserProfile').countDocuments();

    res.render('home', {
      title: 'FoodFlix - Home',
      counts: {
        foodBlogs: foodBlogCount,
        restaurants: restaurantCount,
        users: userCount
      }
    });
  } catch (error) {
    console.error('Error in home route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Routes
app.use('/foodblogs', foodBlogRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', { message: 'Server error: ' + (err.message || 'Unknown error') });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
