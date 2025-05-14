const Restaurant = require('../models/Restaurant');
const fs = require('fs');
const path = require('path');

// Fallback to JSON file if MongoDB is not available
const filePath = path.join(__dirname, '../utils/restaurantData.json');

// Get all restaurants
const getRestaurants = async () => {
  try {
    // Try to get from MongoDB
    const restaurants = await Restaurant.find().sort({ name: 1 });
    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants from MongoDB:', error);

    // Fallback to JSON file
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (fileError) {
      console.error('Error reading restaurant data from file:', fileError);
      return [];
    }
  }
};

// Add a new restaurant
const addRestaurant = async (restaurantData) => {
  try {
    // Try to add to MongoDB
    const newRestaurant = new Restaurant(restaurantData);
    await newRestaurant.save();
    return newRestaurant;
  } catch (error) {
    console.error('Error adding restaurant to MongoDB:', error);

    // Fallback to JSON file
    try {
      const restaurants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      restaurantData.id = restaurants.length ? restaurants[restaurants.length - 1].id + 1 : 1;
      restaurants.push(restaurantData);
      fs.writeFileSync(filePath, JSON.stringify(restaurants, null, 2));
      return restaurantData;
    } catch (fileError) {
      console.error('Error adding restaurant to file:', fileError);
      throw fileError;
    }
  }
};

// Get restaurant by ID
const getRestaurantById = async (id) => {
  try {
    // Try to get from MongoDB
    return await Restaurant.findById(id);
  } catch (error) {
    console.error('Error fetching restaurant by ID from MongoDB:', error);

    // Fallback to JSON file
    try {
      const restaurants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return restaurants.find(restaurant => restaurant.id === parseInt(id));
    } catch (fileError) {
      console.error('Error reading restaurant data from file:', fileError);
      return null;
    }
  }
};

// Edit a restaurant
const editRestaurant = async (id, updatedData) => {
  try {
    // Try to update in MongoDB
    return await Restaurant.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (error) {
    console.error('Error updating restaurant in MongoDB:', error);

    // Fallback to JSON file
    try {
      const restaurants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const index = restaurants.findIndex(restaurant => restaurant.id === parseInt(id));
      if (index !== -1) {
        restaurants[index] = { ...restaurants[index], ...updatedData };
        fs.writeFileSync(filePath, JSON.stringify(restaurants, null, 2));
        return restaurants[index];
      }
      return null;
    } catch (fileError) {
      console.error('Error updating restaurant in file:', fileError);
      throw fileError;
    }
  }
};

// Delete a restaurant
const deleteRestaurant = async (id) => {
  try {
    // Try to delete from MongoDB
    await Restaurant.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting restaurant from MongoDB:', error);

    // Fallback to JSON file
    try {
      const restaurants = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const updatedRestaurants = restaurants.filter(restaurant => restaurant.id !== parseInt(id));
      fs.writeFileSync(filePath, JSON.stringify(updatedRestaurants, null, 2));
      return true;
    } catch (fileError) {
      console.error('Error deleting restaurant from file:', fileError);
      throw fileError;
    }
  }
};

module.exports = { getRestaurants, addRestaurant, getRestaurantById, editRestaurant, deleteRestaurant };
