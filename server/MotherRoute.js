const express = require('express');
const router = express.Router();
const Motherc = require('../Controllers/MotherController');


router.post('/registerMother', Motherc.createMother);
router.put('/update-registeredmother/:motherId', Motherc.updateMother);
router.delete('/delete-registeredmother/:motherId', Motherc.deleteMother);
router.get('/get-all-registeredmother', Motherc.getAllMothers);
router.get('/get-registerednext-id', Motherc.getNextMotherIdHandler);

router.get('/single-registredmother/:motherId', Motherc.getMotherById);

module.exports = router;