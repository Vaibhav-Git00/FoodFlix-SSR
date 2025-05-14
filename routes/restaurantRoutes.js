const express = require('express');
const router = express.Router();
const { getRestaurants, addRestaurant, getRestaurantById, editRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const menuItemController = require('../controllers/menuItemController');

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

// Show add menu item form for a specific restaurant
router.get('/:restaurantId/menu/add', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    console.log('Accessing add menu item form for restaurant ID:', restaurantId);

    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(restaurantId);

    console.log('Restaurant found:', restaurant ? 'Yes' : 'No');

    if (!restaurant) {
      console.log('Restaurant not found with ID:', restaurantId);
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }

    console.log('Rendering addMenuItem view with restaurant:', restaurant.name);

    res.render('addMenuItem', {
      title: 'Add Menu Item',
      restaurant,
      singleRestaurant: true
    });
  } catch (error) {
    console.error('Error showing add menu item form:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Add a new menu item to a specific restaurant
router.post('/:restaurantId/menu/add', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const menuItemData = {
      ...req.body,
      restaurant: restaurantId,
      dietaryInfo: {
        isVegetarian: req.body.isVegetarian === 'on',
        isVegan: req.body.isVegan === 'on',
        isGlutenFree: req.body.isGlutenFree === 'on',
        containsNuts: req.body.containsNuts === 'on'
      },
      spicyLevel: parseInt(req.body.spicyLevel || 0),
      preparationTime: parseInt(req.body.preparationTime || 15),
      isAvailable: req.body.isAvailable === 'on',
      isPopular: req.body.isPopular === 'on',
      isRecommended: req.body.isRecommended === 'on'
    };

    const MenuItem = require('../models/MenuItem');
    const newMenuItem = new MenuItem(menuItemData);
    await newMenuItem.save();

    res.redirect(`/restaurants/${restaurantId}/menu`);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).render('error', { message: 'Error adding menu item' });
  }
});

// Get restaurant menu
router.get('/:restaurantId/menu', menuItemController.getMenuItemsByRestaurant);

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
