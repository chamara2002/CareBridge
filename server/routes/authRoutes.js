const express = require('express');
const { signUp, signIn } = require('../controllers/authController');
const router = express.Router();

// Sign-Up route
router.post('/signup', signUp);

// Sign-In route
router.post('/signin', signIn);

module.exports = router;
