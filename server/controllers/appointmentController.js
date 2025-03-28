const Appointment = require("../models/Appointment");

const createAppointment = async (req, res) => {
    try {
        const {
            fullName, contactNo, emailId, nic, address,
            preferredMidwife, appointmentType, suitableTime, privacyAgreement
        } = req.body;

        // Validation: Required fields
        if (!fullName || !contactNo || !emailId || !nic || !address || !appointmentType || !suitableTime) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        const newAppointment = new Appointment({
            fullName,
            contactNo,
            emailId,
            nic,
            address,
            preferredMidwife,
            appointmentType,
            suitableTime,
            privacyAgreement
        });

        await newAppointment.save();
        res.status(201).json({ message: "Appointment created successfully!", appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.query; 
        const appointments = await Appointment.find({
            suitableTime: {
                $gte: new Date(`${date}T00:00:00.000Z`),
                $lt: new Date(`${date}T23:59:59.999Z`),
            },
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate if appointment exists
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ message: "Appointment updated successfully!", appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export all functions in a single line
module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentsByDate };
