const express = require('express');
const router = express.Router();
const { 
  getUserProfile,
  updateUserProfile,
  getAllUsers
} = require('../controllers/userController');

// Get user profile
router.get('/profile/:id', getUserProfile);

// Update user profile
router.put('/profile/:id', updateUserProfile);

// Get all users (admin only)
router.get('/all', getAllUsers);

module.exports = router;