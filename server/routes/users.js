const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all mothers
router.get('/mothers', userController.getAllMothers);

// Add other user routes
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', userController.updateUserProfile);
router.get('/', userController.getAllUsers);

module.exports = router;