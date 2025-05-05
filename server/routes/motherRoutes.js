const express = require('express');
const router = express.Router();
const {
  getAllMothers,
  getSingleMother,
  createMother,
  updateMother,
  deleteMother,
  getUserById
} = require('../controllers/motherController');

// Get all mothers
router.get('/get-all-mother', getAllMothers);

// Get a single mother by ID
router.get('/single-mother/:motherId', getSingleMother);

// Create a new mother
router.post('/Create-Mother', createMother);

// Update mother
router.put('/update-mother/:motherId', updateMother);

// Delete mother
router.delete('/delete-mother/:motherId', deleteMother);

// In your user routes
router.get('/:id', getUserById);

module.exports = router;