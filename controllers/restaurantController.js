const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../utils/restaurantData.json');

const getRestaurants = () => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const addRestaurant = (newRestaurant) => {
  const restaurants = getRestaurants();
  newRestaurant.id = restaurants.length ? restaurants[restaurants.length - 1].id + 1 : 1; // Generate unique ID
  restaurants.push(newRestaurant);
  fs.writeFileSync(filePath, JSON.stringify(restaurants, null, 2)); // Save to JSON file
};

const getRestaurantById = (id) => {
  const restaurants = getRestaurants();
  return restaurants.find((restaurant) => restaurant.id === parseInt(id));
};

const editRestaurant = (id, updatedRestaurant) => {
  const restaurants = getRestaurants();
  const index = restaurants.findIndex((restaurant) => restaurant.id === parseInt(id));
  if (index !== -1) {
    restaurants[index] = { ...restaurants[index], ...updatedRestaurant };
    fs.writeFileSync(filePath, JSON.stringify(restaurants, null, 2)); // Save updated data
  }
};

const deleteRestaurant = (id) => {
  const restaurants = getRestaurants();
  const updatedRestaurants = restaurants.filter((restaurant) => restaurant.id !== parseInt(id)); // Filter out the restaurant with the given ID
  fs.writeFileSync(filePath, JSON.stringify(updatedRestaurants, null, 2)); // Save updated data
};

module.exports = { getRestaurants, addRestaurant, getRestaurantById, editRestaurant, deleteRestaurant };
