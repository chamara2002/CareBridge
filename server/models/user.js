const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['mother', 'midwife', 'admin'] },
    nic: String,          
    villageCode: String,  
    address: String,
    birthdate: Date,
    serviceNo: String,    
    mohBranch: String,    
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
