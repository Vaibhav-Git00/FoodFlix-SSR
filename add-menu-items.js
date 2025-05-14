const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Food')
  .then(() => {
    console.log('MongoDB connected successfully');
    addMenuItems();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function addMenuItems() {
  try {
    // The specific restaurant ID you provided
    const restaurantId = '6824dc47d29f126adab62a0c';
    
    // Clear existing menu items for this restaurant
    await MenuItem.deleteMany({ restaurant: restaurantId });
    console.log('Cleared existing menu items for this restaurant');
    
    // Create test menu items
    const menuItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce on a toasted bun',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        category: 'Main Course',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isRecommended: true
      },
      {
        name: 'Veggie Burger',
        description: 'Plant-based patty with lettuce, tomato, onion, and vegan mayo on a toasted bun',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
        category: 'Main Course',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: false,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 15,
        isAvailable: true
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with our special blend of spices',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        category: 'Side Dish',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: false,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 10,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Chocolate Milkshake',
        description: 'Rich and creamy chocolate milkshake topped with whipped cream',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
        category: 'Beverage',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: true,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 5,
        isAvailable: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
        price: 7.99,
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9',
        category: 'Appetizer',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 10,
        isAvailable: true
      },
      {
        name: 'Spicy Chicken Wings',
        description: 'Crispy chicken wings tossed in our signature spicy sauce',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d',
        category: 'Appetizer',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          containsNuts: false
        },
        spicyLevel: 2,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Chocolate Brownie',
        description: 'Warm chocolate brownie served with vanilla ice cream and chocolate sauce',
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e',
        category: 'Dessert',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          containsNuts: true
        },
        spicyLevel: 0,
        preparationTime: 10,
        isAvailable: true,
        isRecommended: true
      },
      {
        name: 'Iced Tea',
        description: 'Refreshing iced tea with lemon',
        price: 2.99,
        image: 'https://images.unsplash.com/photo-1556679343-c1306ee3f376',
        category: 'Beverage',
        restaurant: restaurantId,
        dietaryInfo: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          containsNuts: false
        },
        spicyLevel: 0,
        preparationTime: 5,
        isAvailable: true
      }
    ];
    
    await MenuItem.insertMany(menuItems);
    console.log(`Created ${menuItems.length} menu items for restaurant ID: ${restaurantId}`);
    
    console.log('Menu items added successfully!');
    console.log('You can now visit:');
    console.log(`http://localhost:3000/restaurants/${restaurantId}/menu`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding menu items:', error);
    mongoose.disconnect();
  }
}
