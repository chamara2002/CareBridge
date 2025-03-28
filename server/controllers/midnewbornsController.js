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
    const { name, birthDate, weight, height, headCircumference, healthStatus } = req.body;

    const newNewborn = new Newborn({
      name,
      birthDate,
      weight,
      height,
      headCircumference,
      healthStatus
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

    const updatedNewborn = {
      name,
      birthDate,
      weight,
      height,
      headCircumference,
      healthStatus
    };

    const newborn = await Newborn.findByIdAndUpdate(
      req.params.id,
      { $set: updatedNewborn },
      { new: true }
    );

    if (!newborn) {
      return res.status(404).json({ msg: 'Newborn not found' });
    }

    res.json(newborn);
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
    const newborn = await Newborn.findByIdAndDelete(req.params.id);

    if (!newborn) {
      return res.status(404).json({ msg: 'Newborn not found' });
    }

    res.json({ msg: 'Newborn removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};