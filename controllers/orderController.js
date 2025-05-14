const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Get checkout page
exports.getCheckout = async (req, res) => {
  try {
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6821feba86cb835017d39a04'; // Default user ID for testing
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.menuItem',
      populate: {
        path: 'restaurant',
        select: 'name deliveryInfo'
      }
    });
    
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart');
    }
    
    // Get user's saved addresses and payment methods
    const user = await User.findById(userId);
    
    // Get restaurant info
    const restaurant = await Restaurant.findById(cart.restaurant);
    
    if (!restaurant) {
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }
    
    // Calculate tax (assuming 8% tax rate)
    const taxRate = 0.08;
    const taxAmount = cart.subtotal * taxRate;
    
    // Get delivery fee from restaurant
    const deliveryFee = restaurant.deliveryInfo.deliveryFee || 0;
    
    // Calculate total
    const totalAmount = cart.subtotal + taxAmount + deliveryFee;
    
    res.render('checkout', {
      title: 'Checkout',
      cart,
      user,
      restaurant,
      taxAmount,
      deliveryFee,
      totalAmount,
      addresses: user.addresses || [],
      paymentMethods: user.paymentMethods || []
    });
  } catch (error) {
    console.error('Error getting checkout page:', error);
    res.status(500).render('error', { message: 'Error loading checkout page' });
  }
};

// Place order
exports.placeOrder = async (req, res) => {
  try {
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6821feba86cb835017d39a04'; // Default user ID for testing
    
    const {
      orderType,
      paymentMethod,
      addressId,
      specialInstructions,
      tipAmount
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }
    
    // Get restaurant info
    const restaurant = await Restaurant.findById(cart.restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Get user info for address
    const user = await User.findById(userId);
    let deliveryAddress = null;
    
    if (orderType === 'Delivery') {
      // Find the selected address
      deliveryAddress = user.addresses.find(addr => addr._id.toString() === addressId);
      
      if (!deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Delivery address not found' });
      }
    }
    
    // Calculate tax (assuming 8% tax rate)
    const taxRate = 0.08;
    const taxAmount = cart.subtotal * taxRate;
    
    // Get delivery fee from restaurant
    const deliveryFee = orderType === 'Delivery' ? (restaurant.deliveryInfo.deliveryFee || 0) : 0;
    
    // Parse tip amount
    const parsedTipAmount = parseFloat(tipAmount) || 0;
    
    // Calculate total
    const totalAmount = cart.subtotal + taxAmount + deliveryFee + parsedTipAmount;
    
    // Create order
    const order = new Order({
      user: userId,
      restaurant: cart.restaurant,
      items: cart.items.map(item => ({
        menuItem: item.menuItem._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      })),
      orderType,
      paymentMethod,
      paymentStatus: 'Completed', // In a real app, this would be set after payment processing
      transactionId: 'TXN' + Date.now(), // In a real app, this would come from payment gateway
      subtotal: cart.subtotal,
      taxAmount,
      deliveryFee,
      tipAmount: parsedTipAmount,
      totalAmount,
      orderNotes: specialInstructions,
      status: 'Confirmed'
    });
    
    // Add delivery address if delivery order
    if (orderType === 'Delivery' && deliveryAddress) {
      order.deliveryAddress = {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode,
        specialInstructions: specialInstructions
      };
      
      // Set estimated delivery time (30 minutes from now)
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
      order.estimatedDeliveryTime = estimatedTime;
    }
    
    // Save order
    await order.save();
    
    // Add order to user's order history
    user.orderHistory.push(order._id);
    await user.save();
    
    // Clear cart
    await Cart.findOneAndDelete({ user: userId });
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
};

// Get order confirmation page
exports.getOrderConfirmation = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('user');
    
    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    res.render('orderConfirmation', {
      title: 'Order Confirmation',
      order,
      orderDate: order.createdAt.toLocaleString()
    });
  } catch (error) {
    console.error('Error getting order confirmation:', error);
    res.status(500).render('error', { message: 'Error loading order confirmation' });
  }
};

// Get order tracking page
exports.getOrderTracking = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('user');
    
    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    res.render('orderTracking', {
      title: 'Track Your Order',
      order,
      orderDate: order.createdAt.toLocaleString()
    });
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).render('error', { message: 'Error loading order tracking' });
  }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6821feba86cb835017d39a04'; // Default user ID for testing
    
    const orders = await Order.find({ user: userId })
      .populate('restaurant')
      .sort({ createdAt: -1 });
    
    res.render('orderHistory', {
      title: 'Order History',
      orders
    });
  } catch (error) {
    console.error('Error getting order history:', error);
    res.status(500).render('error', { message: 'Error loading order history' });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('user');
    
    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }
    
    res.render('orderDetails', {
      title: 'Order Details',
      order,
      orderDate: order.createdAt.toLocaleString()
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).render('error', { message: 'Error loading order details' });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order can be cancelled (only pending or confirmed orders)
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order cannot be cancelled as it is already being prepared or delivered'
      });
    }
    
    // Update order status
    order.status = 'Cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Error cancelling order' });
  }
};

// Rate order
exports.rateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { foodRating, deliveryRating, review } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order rating
    order.rating = {
      food: parseInt(foodRating),
      delivery: parseInt(deliveryRating),
      review
    };
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('Error rating order:', error);
    res.status(500).json({ success: false, message: 'Error submitting rating' });
  }
};
