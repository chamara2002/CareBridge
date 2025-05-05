const Mother = require('../models/motherModel');
const User = require('../models/user');

// Get all mothers
const getAllMothers = async (req, res) => {
  try {
    const mothers = await Mother.find({});
    res.status(200).json(mothers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single mother by ID
const getSingleMother = async (req, res) => {
  try {
    const { motherId } = req.params;
    const mother = await Mother.findOne({ motherId });

    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json(mother);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new mother
const createMother = async (req, res) => {
  try {
    const motherData = req.body;
    
    // Check if a mother with the same ID already exists
    const existingMother = await Mother.findOne({ motherId: motherData.motherId });
    if (existingMother) {
      return res.status(400).json({ message: 'A newborn with this Mother ID already exists' });
    }
    
    // Create new mother
    const newMother = await Mother.create(motherData);
    res.status(201).json(newMother);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update mother
const updateMother = async (req, res) => {
  try {
    const { motherId } = req.params;
    const updateData = req.body;
    
    const updatedMother = await Mother.findOneAndUpdate(
      { motherId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json(updatedMother);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete mother
const deleteMother = async (req, res) => {
  try {
    const { motherId } = req.params;
    
    const deletedMother = await Mother.findOneAndDelete({ motherId });

    if (!deletedMother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json({ message: 'Mother deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

module.exports = {
  getAllMothers,
  getSingleMother,
  createMother,
  updateMother,
  deleteMother,
  getUserById
};