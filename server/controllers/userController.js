const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, address, birthdate, nic, villageCode, serviceNo, mohBranch, password } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update object
    const updateData = {};
    
    // Only update fields that are provided
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (birthdate) updateData.birthdate = birthdate;
    
    // Role-specific fields
    if (user.role === 'mother' && villageCode) {
      updateData.villageCode = villageCode;
    }
    if (user.role === 'midwife') {
      if (serviceNo) updateData.serviceNo = serviceNo;
      if (mohBranch) updateData.mohBranch = mohBranch;
      if (nic) updateData.nic = nic;
    }
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers
};