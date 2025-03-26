const mongoose = require('mongoose');

const NewbornSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  height: {
    type: String,
    required: true
  },
  headCircumference: {
    type: String
  },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Needs Attention', 'Critical'],
    default: 'Healthy'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Newborn', NewbornSchema);