const express = require('express');
const router = express.Router();
const { getRestaurants, addRestaurant, getRestaurantById, editRestaurant, deleteRestaurant } = require('../controllers/restaurantController');

router.get('/', (req, res) => {
  const restaurants = getRestaurants();
  res.render('restaurant', { title: '🥘 Restaurants', restaurants });
});

router.get('/add', (req, res) => {
  res.render('addRestaurant', { title: 'Add Restaurant' });
});

router.post('/add', (req, res) => {
  addRestaurant(req.body); // Add the restaurant data to the JSON file
  res.redirect('/restaurants'); // Redirect back to the main restaurant page
});

router.get('/edit/:id', (req, res) => {
  const restaurant = getRestaurantById(req.params.id);
  if (restaurant) {
    res.render('editRestaurant', { title: 'Edit Restaurant', restaurant });
  } else {
    res.status(404).send('Restaurant not found');
  }
});

router.post('/edit/:id', (req, res) => {
  editRestaurant(req.params.id, req.body);
  res.redirect('/restaurants');
});

router.get('/delete/:id', (req, res) => {
  deleteRestaurant(req.params.id); // Delete the restaurant by ID
  res.redirect('/restaurants'); // Redirect back to the main page
});

module.exports = router;
