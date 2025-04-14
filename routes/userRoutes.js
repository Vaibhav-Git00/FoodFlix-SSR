const express = require('express');
const router = express.Router();
const { getUsers, getUserById, editUser, deleteUser, addUser } = require('../controllers/userController');

router.get('/', (req, res) => {
  const users = getUsers();
  res.render('user', { title: '👥 Users', users });
});

router.get('/add', (req, res) => {
  res.render('addUser', { title: 'Add User' });
});

router.post('/add', (req, res) => {
  addUser(req.body); // Add the user data to the JSON file
  res.redirect('/users'); // Redirect back to the main user page
});

router.get('/edit/:id', (req, res) => {
  const user = getUserById(req.params.id);
  if (user) {
    res.render('editUser', { title: 'Edit User', user });
  } else {
    res.status(404).send('User not found');
  }
});

router.post('/edit/:id', (req, res) => {
  editUser(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', (req, res) => {
  deleteUser(req.params.id);
  res.redirect('/users');
});

module.exports = router;
