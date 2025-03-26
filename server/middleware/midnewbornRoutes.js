module.exports = mongoose.model('Newborn', NewbornSchema);                         
const express = require('express');
const router = express.Router();
const {
  getNewborns,
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

module.exports = router;