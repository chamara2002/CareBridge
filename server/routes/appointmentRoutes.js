const express = require("express");
const router = express.Router();
// const appointmentController = require("../controllers/appointmentController");
const { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentsByDate } = require("../controllers/appointmentController");

router.post("/create/", createAppointment);
router.get("/get/", getAppointments);
router.get("/getbyid/:id", getAppointmentById);
router.get("/by-date/", getAppointmentsByDate);
router.put("/update/:id", updateAppointment);
router.delete("/delete/:id", deleteAppointment);

module.exports = router;
