import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ManageAppointmentMidwife.css";

function ManageAppointmentMidwife() {
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, [date]);

    const fetchAppointments = async () => {
        try {
            const formattedDate = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
            const response = await fetch(`http://localhost:5000/api/appointments/by-date?date=${formattedDate}`);
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const handleAppointmentClick = (appt) => {
        setSelectedAppointment(appt);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/update/${selectedAppointment._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                fetchAppointments(); // Refresh the list
                setIsModalOpen(false);
            } else {
                console.error("Failed to update appointment status");
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "status-pending";
        
        switch(status.toLowerCase()) {
            case "approved":
                return "status-approved";
            case "completed":
                return "status-completed";
            case "rejected":
                return "status-rejected";
            default:
                return "status-pending";
        }
    };

    return (
        <div className="midwife-appointment-container">
            <div className="newborn-management">
                <h2 className="section-title">Manage Appointments</h2>

                <div className="search-container">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by patient name"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="appointment-content">
                    <div className="calendar-container">
                        <Calendar onChange={setDate} value={date} />
                    </div>

                    <div className="appointments-list">
                        <h3 className="section-title">Appointments for {date.toLocaleDateString()}</h3>
                        {appointments.length > 0 ? (
                            appointments
                                .filter(appt => appt.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((appt) => (
                                    <div
                                        key={appt._id}
                                        className={`appointment-card ${getStatusClass(appt.status)}`}
                                        onClick={() => handleAppointmentClick(appt)}
                                    >
                                        <h3 className="appointment-date">{new Date(appt.suitableTime).toLocaleDateString()}</h3>
                                        <p className="appointment-time">{new Date(appt.suitableTime).toLocaleTimeString()}</p>
                                        <p className="appointment-name">{appt.fullName}</p>
                                        <p className="appointment-type">{appt.appointmentType}</p>
                                        <span className={`status-badge ${getStatusClass(appt.status)}`}>
                                            {appt.status || "Pending"}
                                        </span>
                                    </div>
                                ))
                        ) : (
                            <p className="no-appointments">No appointments found for this date.</p>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="close-button"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="close-icon">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <h2 className="modal-title">Appointment Details</h2>
                        <p className="modal-detail"><strong>Name:</strong> {selectedAppointment.fullName}</p>
                        <p className="modal-detail"><strong>Date:</strong> {new Date(selectedAppointment.suitableTime).toLocaleDateString()}</p>
                        <p className="modal-detail"><strong>Time:</strong> {new Date(selectedAppointment.suitableTime).toLocaleTimeString()}</p>
                        <p className="modal-detail"><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                        <p className="modal-detail">
                            <strong>Status:</strong> 
                            <span className={`status-badge ${getStatusClass(selectedAppointment.status)}`} style={{marginLeft: '8px'}}>
                                {selectedAppointment.status || "Pending"}
                            </span>
                        </p>
                        <p className="modal-detail"><strong>Contact:</strong> {selectedAppointment.contactNo || "Not provided"}</p>
                        <p className="modal-detail"><strong>Email:</strong> {selectedAppointment.emailId || "Not provided"}</p>

                        <div className="modal-actions form-actions">
                            <button
                                className="approve-button btn-primary"
                                onClick={() => handleStatusChange("Approved")}
                                disabled={selectedAppointment.status === "Approved"}
                            >
                                Approve
                            </button>
                            <button
                                className="complete-button btn-primary"
                                onClick={() => handleStatusChange("Completed")}
                                disabled={selectedAppointment.status === "Completed"}
                            >
                                Completed
                            </button>
                            <button
                                className="reject-button btn-delete"
                                onClick={() => handleStatusChange("Rejected")}
                                disabled={selectedAppointment.status === "Rejected"}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAppointmentMidwife;