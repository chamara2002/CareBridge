import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";

const AppointmentForm = () => {
    const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({ mode: "onChange" });
    const [step, setStep] = useState(1);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

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
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-3xl w-full p-8 bg-[#f0e8e8] shadow-lg rounded-lg min-h-[500px]">
                <h1 className="text-4xl font-semibold mb-6 text-center">Book an Appointment</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-lg">Full Name:</label>
                                <input {...register("fullName", { required: true })} placeholder="Full Name" className="border p-2 rounded col-span-2" />
                                {errors.fullName && <span className="text-red-500 col-span-3">Full Name is required</span>}
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-lg">Contact No:</label>
                                <input {...register("contactNo", { 
                                    required: "Contact Number is required", 
                                    pattern: { 
                                        
                                        value: /^0(?:7[01245678]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|56|57|58|63|65|66|67)[0-9]{7}$/,
                                        message: "Invalid phone number" 
                                    }
                                })} placeholder="07X XXXXXXX" className="border p-2 rounded col-span-2" />
                                {errors.contactNo && <span className="text-red-500 col-span-3">{errors.contactNo.message}</span>}
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-lg">NIC:</label>
                                <input {...register("nic", {
                                    required: "NIC is required",
                                    pattern: {
                                        value: /^(?:\d{9}[vVxX]|\d{12})$/,
                                        message: "Invalid Sri Lankan NIC"
                                    }
                                })} placeholder="NIC" className="border p-2 rounded col-span-2" />
                                {errors.nic && <span className="text-red-500 col-span-3">{errors.nic.message}</span>}
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-lg">Email ID:</label>
                                <input {...register("emailId", { required: "Email is required", pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email address" } })} type="email" placeholder="Email ID" className="border p-2 rounded col-span-2" />
                                {errors.emailId && <span className="text-red-500 col-span-3">{errors.emailId.message}</span>}
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-lg">Address:</label>
                                <input {...register("address", { required: "Address is required" })} placeholder="Address" className="border p-2 rounded col-span-2" />
                                {errors.address && <span className="text-red-500 col-span-3">{errors.address.message}</span>}
                            </div>

                            <div className="flex justify-between mt-4">
                                <a href="/manageappointment"><button type="button" className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-600">Cancel</button></a>
                                <button type="button" onClick={() => setStep(2)} disabled={!isValid} className={`py-2 px-4 rounded ${isValid ? "bg-[#F88379] hover:bg-[#ea9890] text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}>Next</button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-semibold">Appointment Details</h2>
                            <div className="grid gap-3">
                                <div className="flex flex-col">
                                    <label>Preferred Midwife:</label>
                                    <input {...register("preferredMidwife")} placeholder="Preferred Midwife" className="border p-2 rounded" />
                                </div>

                                <div className="flex flex-col">
                                    <label>Appointment Type:</label>
                                    <select {...register("appointmentType", { required: "Appointment Type is required" })} className="border p-2 rounded">
                                        <option value="">Select Appointment Type</option>
                                        <option value="Prenatal Checkup">Prenatal Checkup</option>
                                        <option value="Postpartum Visit">Postpartum Visit</option>
                                        <option value="General Consultation">General Consultation</option>
                                    </select>
                                    {errors.appointmentType && <span className="text-red-500">{errors.appointmentType.message}</span>}
                                </div>

                                <div className="flex flex-col">
                                    <label>Suitable Time:</label>
                                    <input
                                    {...register("suitableTime", { required: "Suitable Time is required" })}
                                    type="datetime-local"
                                    className="border p-2 rounded"
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={handleTimeChange}
                                />
                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
                                        >
                                            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                                                <p className="text-red-600 font-semibold">{errorMessage}</p>
                                                <button onClick={() => setErrorMessage("")} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                                                    OK
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                    {errors.suitableTime && <span className="text-red-500">{errors.suitableTime.message}</span>}
                                </div>
                            </div>
                            <div className="flex justify-between mt-4">
                                <button type="button" onClick={() => setStep(1)} className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-600">Previous</button>
                                <button type="submit" className="bg-[#F88379] text-white py-2 px-4 rounded hover:bg-[#ea9890]">Submit</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
