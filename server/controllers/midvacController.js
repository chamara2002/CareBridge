const midvac = require('../models/midvac');

exports.getVaccinations = async (req, res) => {
  try {
    const vaccinations = await midvac.find().populate('newbornId', 'name').sort({ createdAt: -1 });
    res.json(vaccinations);
  } catch (err) {
    console.error('Error fetching vaccinations:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.addVaccination = async (req, res) => {
  try {
    const { newbornId, vaccineName, scheduledDate, status, notes } = req.body;

    const newVaccination = new midvac({
      newbornId,
      vaccineName,
      scheduledDate,
      status,
      notes,
    });

    const vaccination = await newVaccination.save();
    res.json(vaccination);
  } catch (err) {
    console.error('Error adding vaccination:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateVaccination = async (req, res) => {
  try {
    const { vaccineName, scheduledDate, status, notes } = req.body;

    const updatedVaccination = {
      vaccineName,
      scheduledDate,
      status,
      notes,
    };

    const vaccination = await midvac.findByIdAndUpdate(
      req.params.id,
      { $set: updatedVaccination },
      { new: true }
    );

    if (!vaccination) {
      return res.status(404).json({ msg: 'Vaccination not found' });
    }

    res.json(vaccination);
  } catch (err) {
    console.error('Error updating vaccination:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteVaccination = async (req, res) => {
  try {
    const vaccination = await midvac.findByIdAndDelete(req.params.id);

    if (!vaccination) {
      return res.status(404).json({ msg: 'Vaccination not found' });
    }

    res.json({ msg: 'Vaccination removed' });
  } catch (err) {
    console.error('Error deleting vaccination:', err.message);
    res.status(500).send('Server Error');
  }
};
