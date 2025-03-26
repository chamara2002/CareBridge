const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// Connect to the MongoDB database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Routes
// Add other routes as necessary
app.use('/api/auth', require('./routes/authRoutes'));  // Auth routes for Sign Up and Sign In
app.use('/api/midnewborns', require('./routes/midnewbornsRoutes'));  // Newborn management routes (example)

// Define a default route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to CareBridge API');
});

// Set the port from environment variables or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
