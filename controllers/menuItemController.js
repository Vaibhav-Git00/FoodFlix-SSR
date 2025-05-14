const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate('restaurant', 'name cuisine');
    res.render('menuItems', { 
      title: '🍽️ Menu Items',
      menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Get menu items by restaurant
exports.getMenuItemsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }
    
    const menuItems = await MenuItem.find({ restaurant: restaurantId });
    
    // Group menu items by category
    const groupedMenuItems = {};
    menuItems.forEach(item => {
      if (!groupedMenuItems[item.category]) {
        groupedMenuItems[item.category] = [];
      }
      groupedMenuItems[item.category].push(item);
    });
    
    res.render('restaurantMenu', { 
      title: `${restaurant.name} - Menu`,
      restaurant,
      groupedMenuItems,
      categories: Object.keys(groupedMenuItems)
    });
  } catch (error) {
    console.error('Error fetching restaurant menu items:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Get menu item details
exports.getMenuItemDetails = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).render('error', { message: 'Menu item not found' });
    }
    
    // Get related items from the same restaurant and category
    const relatedItems = await MenuItem.find({
      _id: { $ne: menuItem._id },
      restaurant: menuItem.restaurant._id,
      category: menuItem.category
    }).limit(4);
    
    res.render('menuItemDetail', { 
      title: menuItem.name,
      menuItem,
      relatedItems
    });
  } catch (error) {
    console.error('Error fetching menu item details:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Show add menu item form
exports.showAddMenuItemForm = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort('name');
    res.render('addMenuItem', { 
      title: 'Add Menu Item',
      restaurants
    });
  } catch (error) {
    console.error('Error showing add menu item form:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Add a new menu item
exports.addMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      restaurant,
      isVegetarian,
      isVegan,
      isGlutenFree,
      containsNuts,
      spicyLevel,
      preparationTime,
      isAvailable
    } = req.body;
    
    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      image,
      category,
      restaurant,
      dietaryInfo: {
        isVegetarian: isVegetarian === 'on',
        isVegan: isVegan === 'on',
        isGlutenFree: isGlutenFree === 'on',
        containsNuts: containsNuts === 'on'
      },
      spicyLevel: parseInt(spicyLevel || 0),
      preparationTime: parseInt(preparationTime || 15),
      isAvailable: isAvailable === 'on'
    });
    
    await newMenuItem.save();
    res.redirect(`/restaurants/${restaurant}/menu`);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).render('error', { message: 'Error adding menu item' });
  }
};

// Show edit menu item form
exports.showEditMenuItemForm = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).render('error', { message: 'Menu item not found' });
    }
    
    const restaurants = await Restaurant.find().sort('name');
    
    res.render('editMenuItem', { 
      title: `Edit ${menuItem.name}`,
      menuItem,
      restaurants
    });
  } catch (error) {
    console.error('Error showing edit menu item form:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      restaurant,
      isVegetarian,
      isVegan,
      isGlutenFree,
      containsNuts,
      spicyLevel,
      preparationTime,
      isAvailable
    } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).render('error', { message: 'Menu item not found' });
    }
    
    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.image = image;
    menuItem.category = category;
    menuItem.restaurant = restaurant;
    menuItem.dietaryInfo = {
      isVegetarian: isVegetarian === 'on',
      isVegan: isVegan === 'on',
      isGlutenFree: isGlutenFree === 'on',
      containsNuts: containsNuts === 'on'
    };
    menuItem.spicyLevel = parseInt(spicyLevel || 0);
    menuItem.preparationTime = parseInt(preparationTime || 15);
    menuItem.isAvailable = isAvailable === 'on';
    
    await menuItem.save();
    res.redirect(`/restaurants/${restaurant}/menu`);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).render('error', { message: 'Error updating menu item' });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).render('error', { message: 'Menu item not found' });
    }
    
    const restaurantId = menuItem.restaurant;
    
    await MenuItem.findByIdAndDelete(req.params.id);
    res.redirect(`/restaurants/${restaurantId}/menu`);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).render('error', { message: 'Error deleting menu item' });
  }
};

// Rate a menu item
exports.rateMenuItem = async (req, res) => {
  try {
    const { rating, review, userId } = req.body;
    const menuItemId = req.params.id;
    
    const menuItem = await MenuItem.findById(menuItemId);
    
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    // Check if user has already rated this item
    const existingRatingIndex = menuItem.ratings.findIndex(r => r.user.toString() === userId);
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      menuItem.ratings[existingRatingIndex].rating = rating;
      menuItem.ratings[existingRatingIndex].review = review;
      menuItem.ratings[existingRatingIndex].date = Date.now();
    } else {
      // Add new rating
      menuItem.ratings.push({
        user: userId,
        rating,
        review,
        date: Date.now()
      });
    }
    
    await menuItem.save();
    
    res.json({
      success: true,
      averageRating: menuItem.averageRating,
      ratingsCount: menuItem.ratings.length
    });
  } catch (error) {
    console.error('Error rating menu item:', error);
    res.status(500).json({ success: false, message: 'Error rating menu item' });
  }
};
