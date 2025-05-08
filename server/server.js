const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

connectDB();

const app = express();

app.use(cors()); 
app.use(express.json()); 

// Import routes
const userRoutes = require('./routes/users');
const testRoutes = require('./routes/test');

app.use('/api/auth', require('./routes/authRoutes'));  
app.use('/api/midnewborns', require('./routes/midnewbornsRoutes'));  
app.use('/api/midvac', require('./routes/midvacRoutes')); 
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to CareBridge API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
