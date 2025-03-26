const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Sign Up Controller
const signUp = async (req, res) => {
  try {
    const { name, email, password, role, nic, villageCode, address, birthdate, serviceNo, mohBranch } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      nic: role === 'midwife' ? nic : undefined,
      villageCode: role === 'mother' ? villageCode : undefined,
      address,
      birthdate,
      serviceNo: role === 'midwife' ? serviceNo : undefined,
      mohBranch: role === 'midwife' ? mohBranch : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Sign In Controller
const signIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find the user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    res.status(500).json({ message: 'Error during sign-in', error: error.message });
  }
};

module.exports = { signUp, signIn };
