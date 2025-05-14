const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Clear cart and add new item
router.post('/clear-and-add', cartController.clearCartAndAddItem);

// Update cart item
router.post('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', cartController.removeCartItem);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
