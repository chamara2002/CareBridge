const Appointment = require("../models/Appointment");
const User = require("../models/user")

const createAppointment = async (req, res) => {
    try {
        const { fullName, contactNo, emailId, nic, address, preferredMidwife, appointmentType, suitableTime } = req.body;

        // Convert suitableTime to Date object
        const appointmentTime = new Date(suitableTime);

        // Define time range (±30 minutes)
        const startRange = new Date(appointmentTime.getTime() - 30 * 60 * 1000); // 30 minutes before
        const endRange = new Date(appointmentTime.getTime() + 30 * 60 * 1000);   // 30 minutes after

        // Check if any appointment exists in the ±30 min range
        const existingAppointment = await Appointment.findOne({
            suitableTime: { $gte: startRange, $lte: endRange } // Check within the time range
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "This time slot is already booked within 30 minutes. Please select another time." });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            fullName,
            contactNo,
            emailId,
            nic,
            address,
            preferredMidwife,
            appointmentType,
            suitableTime
        });

        await newAppointment.save();
        res.status(201).json({ message: "Appointment created successfully!", appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getMotherDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const mother = await User.findById(id);
        if (!mother) {
            return res.status(404).json({ message: "Mother not found" });
        }
        res.status(200).json(mother);
    } catch (error) {
        console.error("Error fetching mother details:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getMidwives = async (req, res) => {
    try {
        const midwives = await User.find({ role: "midwife" }).select("name _id");
        res.json(midwives);
    } catch (error) {
        console.error("Error fetching midwives:", error);
        res.status(500).json({ message: "Server error" });
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
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        const appointmentTime = new Date(appointment.suitableTime);
        const now = new Date();
        const timeDiff = appointmentTime - now;

        // Check if the appointment is less than 24 hours away
        if (timeDiff < 24 * 60 * 60 * 1000) {
            return res.status(403).json({ message: "Cancellation time has expired. You should have canceled at least 24 hours before." });
        }

        // Proceed with deletion
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export all functions in a single line
module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentsByDate, getMidwives, getMotherDetails };
