const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const foodBlogRoutes = require('./routes/foodBlogRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const userRoutes = require('./routes/userRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuItemAddRoutes = require('./routes/menuItemAddRoutes');

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
hbs.registerHelper('multiply', function(a, b) {
  return (a * b).toFixed(2);
});
hbs.registerHelper('calculateTax', function(subtotal) {
  return (subtotal * 0.08).toFixed(2);
});
hbs.registerHelper('calculateTotal', function(subtotal, deliveryFee) {
  return (subtotal + (deliveryFee || 0) + (subtotal * 0.08)).toFixed(2);
});
hbs.registerHelper('gt', function(a, b) {
  return a > b;
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(bodyParser.json()); // Parse JSON data
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'foodflix_secret_key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/Food',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
  }
}));

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
app.use('/menu', menuItemRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/add-menu-item', menuItemAddRoutes);

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
