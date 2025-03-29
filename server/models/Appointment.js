const mongoose = require("mongoose");
const mongooseSequence = require("mongoose-sequence")(mongoose);

const AppointmentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    contactNo: { type: String, required: true },
    emailId: { type: String, required: true },
    nic: { type: String, required: true },
    address: { type: String, required: true },
    preferredMidwife: { type: String },
    appointmentType: { type: String, required: true },
    status: { type: String, default: "pending" },
    suitableTime: { type: Date, required: true }
}, { timestamps: true });

// Apply auto-increment plugin
AppointmentSchema.plugin(mongooseSequence, {
    inc_field: 'appointmentId',
    start_seq: 1
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
