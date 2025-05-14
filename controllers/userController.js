const UserProfile = require('../models/UserProfile');
const fs = require('fs');
const path = require('path');

// Fallback to JSON file if MongoDB is not available
const filePath = path.join(__dirname, '../utils/userData.json');

// Get all users
const getUsers = async () => {
  try {
    // Try to get from MongoDB
    const users = await UserProfile.find().sort({ name: 1 });
    return users;
  } catch (error) {
    console.error('Error fetching users from MongoDB:', error);

    // Fallback to JSON file
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (fileError) {
      console.error('Error reading user data from file:', fileError);
      return [];
    }
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    // Try to get from MongoDB
    return await UserProfile.findById(id);
  } catch (error) {
    console.error('Error fetching user by ID from MongoDB:', error);

    // Fallback to JSON file
    try {
      const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return users.find(user => user.id === parseInt(id));
    } catch (fileError) {
      console.error('Error reading user data from file:', fileError);
      return null;
    }
  }
};

// Add a new user
const addUser = async (userData) => {
  try {
    // Try to add to MongoDB
    const newUser = new UserProfile(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error adding user to MongoDB:', error);

    // Fallback to JSON file
    try {
      const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      userData.id = users.length ? users[users.length - 1].id + 1 : 1;
      users.push(userData);
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
      return userData;
    } catch (fileError) {
      console.error('Error adding user to file:', fileError);
      throw fileError;
    }
  }
};

// Edit a user
const editUser = async (id, updatedData) => {
  try {
    // Try to update in MongoDB
    return await UserProfile.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (error) {
    console.error('Error updating user in MongoDB:', error);

    // Fallback to JSON file
    try {
      const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const index = users.findIndex(user => user.id === parseInt(id));
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedData };
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        return users[index];
      }
      return null;
    } catch (fileError) {
      console.error('Error updating user in file:', fileError);
      throw fileError;
    }
  }
};

// Delete a user
const deleteUser = async (id) => {
  try {
    // Try to delete from MongoDB
    await UserProfile.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting user from MongoDB:', error);

    // Fallback to JSON file
    try {
      const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const updatedUsers = users.filter(user => user.id !== parseInt(id));
      fs.writeFileSync(filePath, JSON.stringify(updatedUsers, null, 2));
      return true;
    } catch (fileError) {
      console.error('Error deleting user from file:', fileError);
      throw fileError;
    }
  }
};

module.exports = { getUsers, addUser, getUserById, editUser, deleteUser };
