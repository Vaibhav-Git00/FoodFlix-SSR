const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Food')
  .then(() => {
    console.log('MongoDB connected successfully');
    createTestData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createTestData() {
  try {
    // Clear existing test data
    await Restaurant.deleteMany({ name: { $regex: /Test Restaurant/i } });
    console.log('Cleared existing test restaurants');
    
    // Create a test restaurant
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      description: 'A test restaurant with delicious food',
      cuisine: 'Mixed',
      cuisineType: ['Italian', 'Mexican', 'American'],
      rating: 4.5,
      totalReviews: 120,
      priceRange: '$$',
      location: '123 Test Street',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      contactInfo: {
        phone: '123-456-7890',
        email: 'test@restaurant.com',
        website: 'www.testrestaurant.com'
      },
      status: 'Open',
      operatingHours: [
        {
          day: 'Monday',
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false
        },
        {
          day: 'Tuesday',
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false
        },
        {
          day: 'Wednesday',
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false
        },
        {
          day: 'Thursday',
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false
        },
        {
          day: 'Friday',
          openTime: '09:00',
          closeTime: '23:00',
          isClosed: false
        },
        {
          day: 'Saturday',
          openTime: '10:00',
          closeTime: '23:00',
          isClosed: false
        },
        {
          day: 'Sunday',
          openTime: '10:00',
          closeTime: '22:00',
          isClosed: false
        }
      ],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      gallery: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9'
      ],
      features: {
        hasDelivery: true,
        hasTakeout: true,
        hasDineIn: true,
        hasOutdoorSeating: true,
        acceptsReservations: true,
        acceptsOnlineOrders: true
      },
      deliveryInfo: {
        deliveryFee: 2.99,
        minimumOrderAmount: 15,
        estimatedDeliveryTime: 30,
        deliveryRadius: 5
      },
      isPromoted: true,
      promotionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      averagePreparationTime: 20,
      tags: ['Family Friendly', 'Casual Dining', 'Outdoor Seating']
    });
    
    await restaurant.save();
    console.log('Created test restaurant:', restaurant.name);
    
    // Clear existing menu items for this restaurant
    await MenuItem.deleteMany({ restaurant: restaurant._id });
    console.log('Cleared existing menu items for this restaurant');
    
    // Create test menu items
    const menuItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce on a toasted bun',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        category: 'Main Course',
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
        restaurant: restaurant._id,
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
    console.log(`Created ${menuItems.length} menu items for ${restaurant.name}`);
    
    console.log('Test data creation completed successfully!');
    console.log(`Restaurant ID: ${restaurant._id}`);
    console.log('You can now visit:');
    console.log(`http://localhost:3000/restaurants/${restaurant._id}/menu`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test data:', error);
    mongoose.disconnect();
  }
}
