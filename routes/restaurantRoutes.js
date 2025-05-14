const express = require('express');
const router = express.Router();
const { getRestaurants, addRestaurant, getRestaurantById, editRestaurant, deleteRestaurant } = require('../controllers/restaurantController');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await getRestaurants();
    res.render('restaurant', { title: '🥘 Restaurants', restaurants });
  } catch (error) {
    console.error('Error in restaurant route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Show add restaurant form
router.get('/add', (req, res) => {
  res.render('addRestaurant', { title: 'Add Restaurant' });
});

// Add a new restaurant
router.post('/add', async (req, res) => {
  try {
    await addRestaurant(req.body);
    res.redirect('/restaurants');
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).render('error', { message: 'Error adding restaurant' });
  }
});

// Show edit restaurant form
router.get('/edit/:id', async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (restaurant) {
      res.render('editRestaurant', { title: 'Edit Restaurant', restaurant });
    } else {
      res.status(404).render('error', { message: 'Restaurant not found' });
    }
  } catch (error) {
    console.error('Error in edit restaurant route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Update a restaurant
router.post('/edit/:id', async (req, res) => {
  try {
    await editRestaurant(req.params.id, req.body);
    res.redirect('/restaurants');
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).render('error', { message: 'Error updating restaurant' });
  }
});

// Delete a restaurant
router.get('/delete/:id', async (req, res) => {
  try {
    await deleteRestaurant(req.params.id);
    res.redirect('/restaurants');
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).render('error', { message: 'Error deleting restaurant' });
  }
});

module.exports = router;
