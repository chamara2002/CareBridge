const express = require("express");
const router = express.Router();
// const appointmentController = require("../controllers/appointmentController");
const { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentsByDate, getMotherDetails, getMidwives } = require("../controllers/appointmentController");

router.post("/create/", createAppointment);
router.get("/get/", getAppointments);
router.get("/getbyid/:id", getAppointmentById);
router.get("/by-date/", getAppointmentsByDate);
router.put("/update/:id", updateAppointment);
router.delete("/delete/:id", deleteAppointment);
router.get("/midwives", getMidwives);
router.get("/mothers/:id", getMotherDetails);

module.exports = router;
