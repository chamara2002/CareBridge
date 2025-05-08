const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/ping', (req, res) => {
  return res.status(200).json({ message: 'API is working!' });
});

module.exports = router;
