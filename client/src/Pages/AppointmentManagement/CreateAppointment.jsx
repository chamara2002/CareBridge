import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import "./CreateAppointment.css";
import MotherMenu from '../Mother/MotherMenu';

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
        <MotherMenu>
        <div className="appointment-container">
            <div className="appointment-form-container">
                <h1 className="form-title">Book an Appointment</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                    {step === 1 && (
                        <>
                            <h2 className="section-title">Personal Details</h2>
                            <div className="form-group">
                                <label className="form-label">Full Name:</label>
                                <input 
                                    {...register("fullName", { 
                                        required: "Full Name is required",
                                        maxLength: { value: 50, message: "Name should not exceed 50 characters" },
                                        validate: value => {
                                            // Manually validate instead of using potentially dangerous regex
                                            return (/^[A-Za-z\s]{2,50}$/).test(value) || "Full Name must contain only letters and spaces";
                                        }
                                    })} 
                                    placeholder="Full Name" 
                                    className="form-input" 
                                />
                                {errors.fullName && <span className="error-message">Full Name is required</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contact No:</label>
                                <input 
                                    {...register("contactNo", { 
                                        required: "Contact Number is required",
                                        validate: value => {
                                            // Sri Lankan phone number validation
                                            if (value.length !== 10 || value[0] !== '0') {
                                                return "Phone number must be 10 digits starting with 0";
                                            }
                                            // Check if it matches a valid SL format using a safe approach
                                            const validPrefixes = ['07', '011', '021', '023', '024', '025', '026', '027', '031', '032', 
                                                                '033', '034', '035', '036', '037', '038', '041', '045', '047', '051', 
                                                                '052', '054', '055', '056', '057', '058', '063', '065', '066', '067'];
                                            
                                            const prefix = value.substring(0, 2);
                                            const prefix3 = value.substring(0, 3);
                                            
                                            if (prefix === '07') {
                                                const thirdDigit = parseInt(value[2], 10);
                                                if (![0,1,2,4,5,6,7,8].includes(thirdDigit)) {
                                                    return "Invalid mobile number format";
                                                }
                                            } else if (!validPrefixes.includes(prefix) && !validPrefixes.includes(prefix3)) {
                                                return "Invalid phone number prefix";
                                            }
                                            
                                            // Check that all characters are digits
                                            return /^\d+$/.test(value) || "Phone number must contain only digits";
                                        }
                                    })} 
                                    placeholder="07X XXXXXXX" 
                                    className="form-input" 
                                />
                                {errors.contactNo && <span className="error-message">{errors.contactNo.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">NIC:</label>
                                <input 
                                    {...register("nic", {
                                        required: "NIC is required",
                                        validate: value => {
                                            // Sri Lankan NIC validation - safer approach
                                            if (value.length === 10) {
                                                // Old format: 9 digits + v/V/x/X
                                                const digits = value.substring(0, 9);
                                                const lastChar = value[9].toLowerCase();
                                                return ((/^\d{9}$/).test(digits) && (lastChar === 'v' || lastChar === 'x')) || 
                                                    "Invalid old format NIC (should be 9 digits followed by v/V/x/X)";
                                            } else if (value.length === 12) {
                                                // New format: 12 digits
                                                return (/^\d{12}$/).test(value) || "Invalid new format NIC (should be 12 digits)";
                                            }
                                            return "NIC must be either 9 digits + v/x or 12 digits";
                                        }
                                    })} 
                                    placeholder="NIC" 
                                    className="form-input" 
                                />
                                {errors.nic && <span className="error-message">{errors.nic.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email ID:</label>
                                <input 
                                    {...register("emailId", { 
                                        required: "Email is required",
                                        maxLength: { value: 100, message: "Email is too long" },
                                        validate: value => {
                                            // Basic email validation without problematic patterns
                                            if (!value.includes('@') || !value.includes('.')) {
                                                return "Email must contain @ and .";
                                            }
                                            if (value.indexOf('@') === 0) {
                                                return "Email can't start with @";
                                            }
                                            if (value.lastIndexOf('.') < value.indexOf('@') + 2) {
                                                return "Invalid domain format";
                                            }
                                            if (value.lastIndexOf('.') === value.length - 1) {
                                                return "Email can't end with a dot";
                                            }
                                            return true;
                                        }
                                    })} 
                                    type="email" 
                                    placeholder="Email ID" 
                                    className="form-input" 
                                />
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
        </MotherMenu>
    );
};

export default AppointmentForm;
