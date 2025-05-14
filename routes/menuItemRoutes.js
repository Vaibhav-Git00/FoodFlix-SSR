const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// Get all menu items
router.get('/', menuItemController.getAllMenuItems);

// Show add menu item form
router.get('/add', menuItemController.showAddMenuItemForm);

// Add a new menu item
router.post('/add', menuItemController.addMenuItem);

// Get menu item details
router.get('/:id', menuItemController.getMenuItemDetails);

// Show edit menu item form
router.get('/:id/edit', menuItemController.showEditMenuItemForm);

// Update a menu item
router.post('/:id/edit', menuItemController.updateMenuItem);

// Delete a menu item
router.get('/:id/delete', menuItemController.deleteMenuItem);

// Rate a menu item
router.post('/:id/rate', menuItemController.rateMenuItem);

module.exports = router;
