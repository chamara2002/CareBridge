const mongoose = require('mongoose');

const MotherSchema = new mongoose.Schema({
    motherId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    bloodType: {
        type: String,
        required: true
    },
    height: {
        type: Number, 
        required: true
    },
    weight: {
        type: Number, 
        required: true
    },
    prePregnancyWeight: {
        type: Number, 
        required: true
    },
});

module.exports = mongoose.model('Mother', MotherSchema);