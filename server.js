const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');

const blogRoutes = require('./routes/blogRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

// Set HBS as the templating engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Register Handlebars helpers
hbs.registerHelper('eq', (a, b) => a === b);

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(bodyParser.json()); // Parse JSON data
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/blogs', blogRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
