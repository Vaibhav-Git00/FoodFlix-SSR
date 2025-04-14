const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../utils/userData.json');

const getUsers = () => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const getUserById = (id) => {
  const users = getUsers();
  return users.find((user) => user.id === parseInt(id));
};

const addUser = (newUser) => {
  const users = getUsers();
  newUser.id = users.length ? users[users.length - 1].id + 1 : 1; // Generate unique ID
  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2)); // Save to JSON file
};

const editUser = (id, updatedUser) => {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === parseInt(id));
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2)); // Save updated data
  }
};

const deleteUser = (id) => {
  const users = getUsers();
  const updatedUsers = users.filter((user) => user.id !== parseInt(id)); // Filter out the user with the given ID
  fs.writeFileSync(filePath, JSON.stringify(updatedUsers, null, 2)); // Save updated data
};

module.exports = { getUsers, addUser, getUserById, editUser, deleteUser };
