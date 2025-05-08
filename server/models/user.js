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
    
    // Additional fields for mother profile
    firstName: String,
    lastName: String,
    phoneNumber: String,
    pregnancyStatus: {
      type: String,
      enum: ['Unknown', 'Pregnant', 'Postpartum'],
      default: 'Unknown'
    },
    dueDate: Date,
    bloodGroup: String,
    
    // Husband/Partner details
    husbandDetails: {
      name: String,
      phoneNumber: String,
      occupation: String,
      nic: String
    },
    
    // Emergency contact
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
