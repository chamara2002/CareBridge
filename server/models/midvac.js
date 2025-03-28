const mongoose = require('mongoose');

const MidVacSchema = new mongoose.Schema({
  newbornId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newborn',
    required: true
  },
  vaccineName: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Missed'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('midvac', MidVacSchema);
