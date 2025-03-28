const express = require('express');
const router = express.Router();
const {
  getVaccinations,
  addVaccination,
  updateVaccination,
  deleteVaccination
} = require('../controllers/midvacController');

router.route('/')
  .get(getVaccinations)
  .post(addVaccination);

router.route('/:id')
  .put(updateVaccination)
  .delete(deleteVaccination);

module.exports = router;
