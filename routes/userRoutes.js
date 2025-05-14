const express = require('express');
const router = express.Router();
const { getUsers, getUserById, editUser, deleteUser, addUser } = require('../controllers/userController');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    res.render('user', { title: '👥 Users', users });
  } catch (error) {
    console.error('Error in user route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Show add user form
router.get('/add', (req, res) => {
  res.render('addUser', { title: 'Add User' });
});

// Add a new user
router.post('/add', async (req, res) => {
  try {
    await addUser(req.body);
    res.redirect('/users');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).render('error', { message: 'Error adding user' });
  }
});

// Show edit user form
router.get('/edit/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (user) {
      res.render('editUser', { title: 'Edit User', user });
    } else {
      res.status(404).render('error', { message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in edit user route:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Update a user
router.post('/edit/:id', async (req, res) => {
  try {
    await editUser(req.params.id, req.body);
    res.redirect('/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('error', { message: 'Error updating user' });
  }
});

// Delete a user
router.get('/delete/:id', async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).render('error', { message: 'Error deleting user' });
  }
});

module.exports = router;
