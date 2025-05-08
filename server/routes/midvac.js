const express = require('express');
const router = express.Router();
const midvacController = require('../controllers/midvacController');

// Base route: /api/midvac

// Get all vaccinations
router.get('/', midvacController.getVaccinations);

// Add a new vaccination
router.post('/', midvacController.addVaccination);

// Update vaccination
router.put('/:id', midvacController.updateVaccination);

// Delete vaccination
router.delete('/:id', midvacController.deleteVaccination);

// Get vaccinations by newborn ID
router.get('/newborn/:newbornId', midvacController.getVaccinationsByNewbornId);

module.exports = router;
