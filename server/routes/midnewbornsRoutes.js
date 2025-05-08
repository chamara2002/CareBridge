const express = require('express');
const router = express.Router();
const {
  getNewborns,
  getNewbornsByMotherId,
  addNewborn,
  updateNewborn,
  deleteNewborn
} = require('../controllers/midnewbornsController');

router.route('/')
  .get(getNewborns)
  .post(addNewborn);

router.route('/:id')
  .put(updateNewborn)
  .delete(deleteNewborn);

// Add the new route for getting newborns by mother ID
router.get('/mother/:motherId', getNewbornsByMotherId);

module.exports = router;