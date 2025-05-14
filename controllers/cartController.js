const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    // In a real app, userId would come from authentication
    // Make sure this ID exists in your database
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.menuItem',
      populate: {
        path: 'restaurant',
        select: 'name deliveryInfo'
      }
    });

    if (!cart) {
      cart = { items: [], subtotal: 0 };
    } else {
      // Populate restaurant information
      if (cart.restaurant) {
        cart.restaurantInfo = await Restaurant.findById(cart.restaurant, 'name deliveryInfo');
      }
    }

    res.render('cart', {
      title: 'Your Cart',
      cart,
      isEmpty: cart.items.length === 0
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).render('error', { message: 'Error fetching cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        restaurant: menuItem.restaurant._id,
        items: []
      });
    } else if (cart.restaurant && cart.restaurant.toString() !== menuItem.restaurant._id.toString()) {
      // If cart has items from a different restaurant, ask user if they want to clear cart
      return res.json({
        success: false,
        message: 'Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?',
        requiresConfirmation: true,
        restaurantName: menuItem.restaurant.name
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item =>
      item.menuItem.toString() === menuItemId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += parseInt(quantity);
      cart.items[existingItemIndex].specialInstructions = specialInstructions;
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: parseInt(quantity),
        specialInstructions
      });
    }

    // Set restaurant if not already set
    if (!cart.restaurant) {
      cart.restaurant = menuItem.restaurant._id;
    }

    // Save cart
    await cart.save();

    res.json({
      success: true,
      message: `${menuItem.name} added to cart`,
      cartItemCount: cart.items.length,
      cartSubtotal: cart.subtotal
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Error adding item to cart' });
  }
};

// Clear cart and add new item (when switching restaurants)
exports.clearCartAndAddItem = async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Delete existing cart
    await Cart.findOneAndDelete({ user: userId });

    // Create new cart with the new item
    const newCart = new Cart({
      user: userId,
      restaurant: menuItem.restaurant._id,
      items: [{
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: parseInt(quantity),
        specialInstructions
      }]
    });

    await newCart.save();

    res.json({
      success: true,
      message: `Cart cleared and ${menuItem.name} added to cart`,
      cartItemCount: 1,
      cartSubtotal: newCart.subtotal
    });
  } catch (error) {
    console.error('Error clearing cart and adding item:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Update quantity or remove if quantity is 0
    if (parseInt(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    // If cart is empty, remove restaurant reference
    if (cart.items.length === 0) {
      cart.restaurant = undefined;
    }

    await cart.save();

    res.json({
      success: true,
      cartItemCount: cart.items.length,
      cartSubtotal: cart.subtotal,
      isEmpty: cart.items.length === 0
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: 'Error updating cart item' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // If cart is empty, remove restaurant reference
    if (cart.items.length === 0) {
      cart.restaurant = undefined;
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      cartItemCount: cart.items.length,
      cartSubtotal: cart.subtotal,
      isEmpty: cart.items.length === 0
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ success: false, message: 'Error removing item from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    // In a real app, userId would come from authentication
    const userId = req.session.userId || '6824e95a9bb9097944e5b4f6'; // Default user ID for testing

    await Cart.findOneAndDelete({ user: userId });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Error clearing cart' });
  }
};
