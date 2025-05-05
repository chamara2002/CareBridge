import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";
import "./ManageAppointment.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';


const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [midwives, setMidwives] = useState([]);
    const token = localStorage.getItem("token");
    const { register } = useForm({ mode: "onChange" });

    useEffect(() => {
        fetchAppointments();
    }, );

    useEffect(() => {
        const fetchMidwives = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/appointments/midwives");
                setMidwives(response.data);
            } catch (error) {
                console.error("Error fetching midwives:", error);
            }
        };
    
        fetchMidwives();
    }, []);
    
    const fetchAppointments = async () => {
        const decoded = jwtDecode(token);
        const id = decoded.userId;
        try {
            const response = await axios.get(`http://localhost:5000/api/appointments/getbyid/${id}`);
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, suitableTime) => {
        const appointmentTime = new Date(suitableTime);
        const now = new Date();
        const timeDiff = appointmentTime - now;

        if (timeDiff < 24 * 60 * 60 * 1000) {
            setErrorMessage("Cancellation time has expired. You should have canceled at least 24 hours before.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                await axios.delete(`http://localhost:5000/api/appointments/delete/${id}`);
                fetchAppointments();
            } catch (error) {
                console.error("Error deleting appointment:", error);
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/appointments/update/${selectedAppointment._id}`, selectedAppointment);
            fetchAppointments(); 
            setIsEditing(false); 
        } catch (error) {
            console.error("Error saving appointment:", error);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!selectedAppointment.fullName.trim()) {
            errors.fullName = "Full Name is required";
        } else if (!/^[A-Za-z\s]{2,}$/.test(selectedAppointment.fullName)) {
            errors.fullName = "Full Name must contain only letters and at least 2 characters";
        }

        if (!selectedAppointment.contactNo.trim()) {
            errors.contactNo = "Contact No is required";
        } else if (!/^0\d{9}$/.test(selectedAppointment.contactNo)) {
            errors.contactNo = "Contact No must be a valid 10-digit number";
        }

        if (!selectedAppointment.emailId.trim()) {
            errors.emailId = "A valid Email is required";
        } else if (!/\S+@\S+\.\S+/.test(selectedAppointment.emailId)) {
            errors.emailId = "Enter a valid email address";
        }

        return errors;
    };

    const handleChange = (e) => {
        setSelectedAppointment({
            ...selectedAppointment,
            [e.target.name]: e.target.value
        });
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('CareBridge Appointment Report', 14, 22);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const headers = [['Appointment ID', 'Patient Name', 'Preferred Midwife', 'Date & Time', 'Appointment Type']];
        const data = appointments.map((a) => [
            a.appointmentId,
            a.fullName,
            a.preferredMidwife || "N/A",
            new Date(a.suitableTime).toLocaleString(),
            a.appointmentType || "N/A",
        ]);

        autoTable(doc, {
            startY: 35,
            head: headers,
            body: data,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [248, 131, 121] }, // Changed to match your app's pink color
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        doc.save('Appointment_Report.pdf');
    };


    return (
        <div className="appointments-container">
            <div className="appointments-wrapper">
                <h1 className="appointments-title">Manage Appointments</h1>
                <div className="create-btn-container">
                    <button
                        onClick={generatePDF}
                        className="generate-report-btn"
                    >
                        Generate Report
                    </button>
                    <a href="/createappointment">
                        <button className="create-appointment-btn">Create Appointment</button>
                    </a>
                </div>
                <table className="appointments-table">
                    <thead>
                        <tr className="table-header">
                            <th className="table-cell">ID</th>
                            <th className="table-cell">Preferred Midwife</th>
                            <th className="table-cell">Date</th>
                            <th className="table-cell">Actions</th>
                            <th className="table-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {appointments.map((appointment) => (
                            <tr key={appointment._id} className="table-row">
                                <td className="table-cell">{appointment.appointmentId}</td>
                                <td className="table-cell">{appointment.preferredMidwife || "N/A"}</td>
                                <td className="table-cell">{new Date(appointment.suitableTime).toLocaleString()}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleView(appointment)} className="view-btn">View</button>
                                    <button onClick={() => handleDelete(appointment._id, appointment.suitableTime)} className="delete-btn">🗑️</button>
                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="error-modal"
                                        >
                                            <div className="error-modal-content">
                                                <p className="error-message">{errorMessage}</p>
                                                <button onClick={() => setErrorMessage("")} className="error-btn">
                                                    OK
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </td>
                                <td className="status-cell">
                                    <span className={`status-badge ${
                                        appointment.status === "Approved" ? "status-approved" :
                                        appointment.status === "Completed" ? "status-completed" : "status-pending"
                                    }`}>
                                        {appointment.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {isModalOpen && selectedAppointment && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2 className="modal-title">Appointment Details</h2>

                            <div className="form-grid">
                                {/* Full Name */}
                                <div className="form-group">
                                    <label htmlFor="fullName" className="form-label">Full Name:</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={selectedAppointment.fullName}
                                            onChange={handleChange}
                                            className="form-input"
                                            id="fullName"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.fullName}</p>
                                    )}
                                    {errors.fullName && <p className="validation-error">{errors.fullName}</p>}
                                </div>

                                {/* Contact No */}
                                <div className="form-group">
                                    <label htmlFor="contactNo" className="form-label">Contact No:</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="contactNo"
                                            value={selectedAppointment.contactNo}
                                            onChange={handleChange}
                                            className="form-input"
                                            id="contactNo"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.contactNo}</p>
                                    )}
                                    {errors.contactNo && <p className="validation-error">{errors.contactNo}</p>}
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label htmlFor="emailId" className="form-label">Email:</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="emailId"
                                            value={selectedAppointment.emailId}
                                            onChange={handleChange}
                                            className="form-input"
                                            id="emailId"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.emailId}</p>
                                    )}
                                    {errors.emailId && <p className="validation-error">{errors.emailId}</p>}
                                </div>

                                {/* Preferred Midwife */}
                                <div className="form-group">
                                    <label htmlFor="preferredMidwife" className="form-label">Preferred Midwife:</label>
                                    {isEditing ? (
                                        <select
                                        {...register("preferredMidwife", { required: "Midwife selection is required" })}
                                        defaultValue={selectedAppointment.preferredMidwife || ""}
                                        onChange={handleChange}
                                        name="preferredMidwife"
                                        id="preferredMidwife"
                                        className="form-select"
                                        >
                                        <option value="">Select Preferred Midwife</option>
                                        {midwives.map((midwife) => (
                                            <option key={midwife._id} value={midwife.name}>
                                            {midwife.name}
                                            </option>
                                        ))}
                                        </select>
                                    ) : (
                                        <p>{selectedAppointment.preferredMidwife || "N/A"}</p>
                                    )}
                                </div>

                                {/* Appointment Type */}
                                <div className="form-group">
                                    <label htmlFor="appointmentType" className="form-label">Appointment Type:</label>
                                    {isEditing ? (
                                        <select
                                            name="appointmentType"
                                            value={selectedAppointment.appointmentType}
                                            onChange={handleChange}
                                            className="form-select"
                                            id="appointmentType"
                                        >
                                            <option value="">Select Appointment Type</option>
                                            <option value="Prenatal Checkup">Prenatal Checkup</option>
                                            <option value="Postpartum Visit">Postpartum Visit</option>
                                            <option value="General Consultation">General Consultation</option>
                                        </select>
                                    ) : (
                                        <p>{selectedAppointment.appointmentType}</p>
                                    )}
                                </div>

                                {/* Suitable Time */}
                                <div className="form-group">
                                    <label htmlFor="suitableTime" className="form-label">Date & Time:</label>
                                    <p>{new Date(selectedAppointment.suitableTime).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditing(false);
                                }}
                                className="close-btn"
                                >
                                Close
                                </button>

                                {isEditing ? (
                                    <button onClick={handleSave} className="save-btn">Save</button>
                                ) : (
                                    <button onClick={handleEdit} className="edit-btn">Edit</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAppointments;
