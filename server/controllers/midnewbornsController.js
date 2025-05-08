const Newborn = require('../models/midnewborns');

// @desc    Get all newborns
// @route   GET /api/newborns
// @access  Public
exports.getNewborns = async (req, res) => {
  try {
    const newborns = await Newborn.find().sort({ createdAt: -1 });
    res.json(newborns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add new newborn
// @route   POST /api/newborns
// @access  Public
exports.addNewborn = async (req, res) => {
  try {
    const { name, birthDate, weight, height, headCircumference, healthStatus, motherId } = req.body;

    // Validate that motherId exists
    if (!motherId) {
      return res.status(400).json({ msg: 'Mother ID is required' });
    }

    const newNewborn = new Newborn({
      name,
      birthDate,
      weight,
      height,
      headCircumference,
      healthStatus,
      motherId
    });

    const newborn = await newNewborn.save();
    res.json(newborn);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update newborn
// @route   PUT /api/newborns/:id
// @access  Public
exports.updateNewborn = async (req, res) => {
  try {
    const { name, birthDate, weight, height, headCircumference, healthStatus } = req.body;

    // We don't include motherId in the updates to prevent changing ownership
    const updatedNewborn = {
      name,
      birthDate,
      weight,
      height,
      headCircumference,
      healthStatus
    };

    // Also check if the newborn belongs to the mother making the request
    const newborn = await Newborn.findById(req.params.id);
    
    if (!newborn) {
      return res.status(404).json({ msg: 'Newborn not found' });
    }

    // Update the newborn
    const updated = await Newborn.findByIdAndUpdate(
      req.params.id,
      { $set: updatedNewborn },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete newborn
// @route   DELETE /api/newborns/:id
// @access  Public
exports.deleteNewborn = async (req, res) => {
  try {
    // First find the newborn to check ownership
    const newborn = await Newborn.findById(req.params.id);

    if (!newborn) {
      return res.status(404).json({ msg: 'Newborn not found' });
    }

    // Delete the newborn
    await Newborn.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Newborn removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get newborns by mother ID
// @route   GET /api/midnewborns/mother/:motherId
// @access  Public
exports.getNewbornsByMotherId = async (req, res) => {
  try {
    const motherId = req.params.motherId;
    
    if (!motherId) {
      return res.status(400).json({ msg: 'Mother ID is required' });
    }
    
    const newborns = await Newborn.find({ motherId }).sort({ createdAt: -1 });
    res.json(newborns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};