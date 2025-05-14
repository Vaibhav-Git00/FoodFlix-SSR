const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Show add menu item form for a specific restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    console.log('Accessing add menu item form for restaurant ID:', restaurantId);
    
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
router.post('/:restaurantId', async (req, res) => {
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
    
    const newMenuItem = new MenuItem(menuItemData);
    await newMenuItem.save();
    
    res.redirect(`/restaurants/${restaurantId}/menu`);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).render('error', { message: 'Error adding menu item' });
  }
});

module.exports = router;
