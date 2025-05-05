import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import "./CreateAppointment.css";

const AppointmentForm = () => {
    const { register, handleSubmit, setValue, reset, formState: { errors, isValid } } = useForm({ mode: "onChange" });
    const [step, setStep] = useState(1);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [midwives, setMidwives] = useState([]);
    // const [userId, setUserId] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            // setUserId(decoded.userId);

            // Fetch user details
            axios.get(`http://localhost:5000/api/appointments/mothers/${decoded.userId}`)
                .then(response => {
                    const userData = response.data;
                    setValue("fullName", userData.name);
                    setValue("nic", userData.nic);
                    setValue("emailId", userData.email);
                    setValue("address", userData.address);
                })
                .catch(error => console.error("Error fetching user data:", error));
        }
    }, [setValue]);

    useEffect(() => {
        const fetchMidwives = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/appointments/midwives");
                setMidwives(response.data); // Assuming response.data is an array of midwives
            } catch (error) {
                console.error("Error fetching midwives:", error);
            }
        };

        fetchMidwives();
    }, []);

    useEffect(() => {
        const fetchBookedAppointments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/appointments/get");
                const bookedSlots = response.data.map(app => new Date(app.suitableTime));
                setBookedTimes(bookedSlots);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };

        fetchBookedAppointments();
    }, []);

        
    const handleTimeChange = (e) => {
        const selectedTime = new Date(e.target.value);
        const isConflict = bookedTimes.some(bookedTime => {
            const diff = Math.abs(selectedTime - bookedTime) / (1000 * 60);
            return diff < 30;
        });

        if (isConflict) {
            setErrorMessage("This time slot is too close to an existing appointment.");
            e.target.value = "";
        } else {
            setErrorMessage("");
        }
    };

    const onSubmit = async (data) => {
        try {
            const response = await axios.post("http://localhost:5000/api/appointments/create", data);
            console.log(response);
            alert("Appointment Created Successfully!");
            reset();
            setStep(1);
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Failed to create appointment");
        }
    };

    return (
        <div className="appointment-container">
            <div className="appointment-form-container">
                <h1 className="form-title">Book an Appointment</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                    {step === 1 && (
                        <>
                            <h2 className="section-title">Personal Details</h2>
                            <div className="form-group">
                                <label className="form-label">Full Name:</label>
                                <input {...register("fullName", { required: true })} placeholder="Full Name" className="form-input" />
                                {errors.fullName && <span className="error-message">Full Name is required</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contact No:</label>
                                <input {...register("contactNo", { 
                                    required: "Contact Number is required", 
                                    pattern: { 
                                        value: /^0(?:7[01245678]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|56|57|58|63|65|66|67)[0-9]{7}$/,
                                        message: "Invalid phone number" 
                                    }
                                })} placeholder="07X XXXXXXX" className="form-input" />
                                {errors.contactNo && <span className="error-message">{errors.contactNo.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">NIC:</label>
                                <input {...register("nic", {
                                    required: "NIC is required",
                                    pattern: {
                                        value: /^(?:\d{9}[vVxX]|\d{12})$/,
                                        message: "Invalid Sri Lankan NIC"
                                    }
                                })} placeholder="NIC" className="form-input" />
                                {errors.nic && <span className="error-message">{errors.nic.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email ID:</label>
                                <input {...register("emailId", { 
                                    required: "Email is required", 
                                    pattern: { 
                                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, 
                                        message: "Invalid email address" 
                                    } 
                                })} type="email" placeholder="Email ID" className="form-input" />
                                {errors.emailId && <span className="error-message">{errors.emailId.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address:</label>
                                <input {...register("address", { required: "Address is required" })} placeholder="Address" className="form-input" />
                                {errors.address && <span className="error-message">{errors.address.message}</span>}
                            </div>

                            <div className="form-actions">
                                <a href="/appointmenthub"><button type="button" className="btn-cancel">Cancel</button></a>
                                <button 
                                    type="button" 
                                    onClick={() => setStep(2)} 
                                    disabled={!isValid} 
                                    className={`btn-next ${isValid ? "btn-next-active" : "btn-next-disabled"}`}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="section-title">Appointment Details</h2>
                            <div className="form-grid">
                                <div className="appointment-form-group">
                                    <label>Preferred Midwife:</label>
                                    <select {...register("preferredMidwife", { required: "Midwife selection is required" })} className="appointment-select">
                                        <option value="">Select a Midwife</option>
                                        {midwives.map((midwife) => (
                                            <option key={midwife._id} value={midwife.name}>
                                                {midwife.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.preferredMidwife && <span className="error-message">{errors.preferredMidwife.message}</span>}
                                </div>

                                <div className="appointment-form-group">
                                    <label>Appointment Type:</label>
                                    <select {...register("appointmentType", { required: "Appointment Type is required" })} className="appointment-select">
                                        <option value="">Select Appointment Type</option>
                                        <option value="Prenatal Checkup">Prenatal Checkup</option>
                                        <option value="Postpartum Visit">Postpartum Visit</option>
                                        <option value="General Consultation">General Consultation</option>
                                    </select>
                                    {errors.appointmentType && <span className="error-message">{errors.appointmentType.message}</span>}
                                </div>

                                <div className="appointment-form-group">
                                    <label>Suitable Time:</label>
                                    <input
                                        {...register("suitableTime", { required: "Suitable Time is required" })}
                                        type="datetime-local"
                                        className="appointment-select"
                                        min={new Date().toISOString().slice(0, 16)}
                                        onChange={handleTimeChange}
                                    />
                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="modal-overlay"
                                        >
                                            <div className="modal-container">
                                                <p className="modal-message">{errorMessage}</p>
                                                <button onClick={() => setErrorMessage("")} className="modal-button">
                                                    OK
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                    {errors.suitableTime && <span className="error-message">{errors.suitableTime.message}</span>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setStep(1)} className="btn-previous">Previous</button>
                                <button type="submit" className="btn-submit">Submit</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
