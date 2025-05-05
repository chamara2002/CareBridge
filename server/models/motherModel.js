const mongoose = require('mongoose');

const motherSchema = new mongoose.Schema({
  motherId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  birthWeight: {
    type: Number,
    required: true
  },
  birthLength: {
    type: Number,
    required: true
  },
  deliveryType: {
    type: String,
    required: true,
    enum: ['Normal', 'C-Section']
  }
}, {
  timestamps: true
});

const Mother = mongoose.model('newborns', motherSchema);

module.exports = Mother;