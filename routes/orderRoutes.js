const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get checkout page
router.get('/checkout', orderController.getCheckout);

// Place order
router.post('/place', orderController.placeOrder);

// Get order confirmation page
router.get('/confirmation/:id', orderController.getOrderConfirmation);

// Get order tracking page
router.get('/track/:id', orderController.getOrderTracking);

// Get order history
router.get('/history', orderController.getOrderHistory);

// Get order details
router.get('/:id', orderController.getOrderDetails);

// Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

// Rate order
router.post('/:id/rate', orderController.rateOrder);

module.exports = router;
