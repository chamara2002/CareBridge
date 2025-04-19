import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";

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
    }, []);

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

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto p-6 rounded-lg">
                <h1 className="text-4xl font-semibold mb-4 text-center">Manage Appointments</h1>
                <div className="w-full text-right">
                    <a href="/createappointment"><button className="bg-[#F88379] text-white text-right px-3 py-3 font-semibold rounded">Create Appointment</button></a>
                </div>
                <table className="w-full border-collapse bg-white shadow-md rounded-lg mt-10">
                    <thead>
                        <tr className="text-left">
                            <th className="p-2">ID</th>
                            <th className="p-2">Preferred Midwife</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Actions</th>
                            <th className="p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[#fff4f2] shadow-lg">
                        {appointments.map((appointment) => (
                            <tr key={appointment._id} className="text-left border-b">
                                <td className="p-2">{appointment.appointmentId}</td>
                                <td className="p-2">{appointment.preferredMidwife || "N/A"}</td>
                                <td className="p-2">{new Date(appointment.suitableTime).toLocaleString()}</td>
                                <td className="p-2 flex gap-2">
                                    <button onClick={() => handleView(appointment)} className="bg-[#F88379] text-white px-3 py-1 rounded">View</button>
                                    <button onClick={() => handleDelete(appointment._id, appointment.suitableTime)} className="text-red-500 hover:underline">🗑️</button>
                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                                className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-95"
                                            >
                                            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                                                <p className="text-red-600 font-semibold">{errorMessage}</p>
                                                <button onClick={() => setErrorMessage("")} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                                                    OK
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </td>
                                <td className="p-2 text-white text-center font-bold">
                                    <span className={`px-3 py-1 rounded ${
                                        appointment.status === "Approved" ? "bg-green-500" :
                                        appointment.status === "Completed" ? "bg-blue-500" : "bg-yellow-500"
                                    }`}>
                                        {appointment.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {isModalOpen && selectedAppointment && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-w-4xl">
                            <h2 className="text-2xl font-semibold mb-6 text-center">Appointment Details</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="flex flex-col">
                                    <label htmlFor="fullName" className="font-medium mb-2">Full Name:</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={selectedAppointment.fullName}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md"
                                            id="fullName"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.fullName}</p>
                                    )}
                                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                                </div>

                                {/* Contact No */}
                                <div className="flex flex-col">
                                    <label htmlFor="contactNo" className="font-medium mb-2">Contact No:</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="contactNo"
                                            value={selectedAppointment.contactNo}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md"
                                            id="contactNo"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.contactNo}</p>
                                    )}
                                    {errors.contactNo && <p className="text-red-500 text-sm">{errors.contactNo}</p>}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col">
                                    <label htmlFor="emailId" className="font-medium mb-2">Email:</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="emailId"
                                            value={selectedAppointment.emailId}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md"
                                            id="emailId"
                                        />
                                    ) : (
                                        <p>{selectedAppointment.emailId}</p>
                                    )}
                                    {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId}</p>}
                                </div>

                                {/* Preferred Midwife */}
                                <div className="flex flex-col">
                                    <label htmlFor="preferredMidwife" className="font-medium mb-2">Preferred Midwife:</label>
                                    {isEditing ? (
                                        <select
                                        {...register("preferredMidwife", { required: "Midwife selection is required" })}
                                        defaultValue={selectedAppointment.preferredMidwife || ""}
                                        onChange={handleChange}
                                        name="preferredMidwife"
                                        id="preferredMidwife"
                                        className="border p-2 rounded"
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
                                <div className="flex flex-col">
                                    <label htmlFor="appointmentType" className="font-medium mb-2">Appointment Type:</label>
                                    {isEditing ? (
                                        <select
                                            name="appointmentType"
                                            value={selectedAppointment.appointmentType}
                                            onChange={handleChange}
                                            className="border p-2 rounded-md"
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
                                <div className="flex flex-col">
                                    <label htmlFor="suitableTime" className="font-medium mb-2">Date & Time:</label>
                                    <p>{new Date(selectedAppointment.suitableTime).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditing(false);
                                }}
                                className="bg-[#F88379] text-white px-4 py-2 rounded-md"
                                >
                                Close
                                </button>

                                {isEditing ? (
                                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
                                ) : (
                                    <button onClick={handleEdit} className="bg-yellow-500 text-white px-4 py-2 rounded-md">Edit</button>
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
