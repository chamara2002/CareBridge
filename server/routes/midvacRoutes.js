const express = require('express');
const router = express.Router();
const {
  getVaccinations,
  addVaccination,
  updateVaccination,
  deleteVaccination,
  getVaccinationsByNewbornId
} = require('../controllers/midvacController');

router.route('/')
  .get(getVaccinations)
  .post(addVaccination);

router.route('/:id')
  .put(updateVaccination)
  .delete(deleteVaccination);

// Add new route for getting vaccinations by newborn ID
router.route('/newborn/:newbornId')
  .get(getVaccinationsByNewbornId);

module.exports = router;
