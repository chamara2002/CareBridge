import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import './AppointmentHub.css';
import { useEffect, useState } from 'react';

const AppointmentHub = () => {
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    // Get the user role from localStorage
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);

  return (
    <div className="appointment-hub-container">
      <h1 className="hub-title">Create or Modify your Appointment</h1>
      <div className="hub-description">
        <p>Manage your appointments with midwives easily and efficiently. Schedule new appointments or manage your existing ones.</p>
      </div>
      
      <div className="appointment-options">
        {/* Show these options for mothers */}
        {userRole === 'mother' && (
          <>
            <div className="option-card">
              <div className="option-icon">
                <FaCalendarPlus />
              </div>
              <h2>Create Appointment</h2>
              <p>Schedule a new appointment with your preferred midwife for prenatal checkups, postpartum visits, or general consultations.</p>
              <Link to="/createappointment" className="option-button">Create New</Link>
            </div>
            
            <div className="option-card">
              <div className="option-icon">
                <FaCalendarAlt />
              </div>
              <h2>Manage Appointments</h2>
              <p>View, edit or cancel your existing appointments. Track appointment status and history.</p>
              <Link to="/manageappointment" className="option-button">View All</Link>
            </div>
          </>
        )}
        
        {/* Show this option for midwives */}
        {userRole === 'midwife' && (
          <div className="option-card">
            <div className="option-icon">
              <FaUserMd />
            </div>
            <h2>Midwife Appointments</h2>
            <p>Dedicated portal for midwives to manage their appointment schedule, review upcoming consultations, and track patient history.</p>
            <Link to="/midwifeappointments" className="option-button">Access Portal</Link>
          </div>
        )}
        
        {/* If no role is found, show all options */}
        {!userRole && (
          <>
            <div className="option-card">
              <div className="option-icon">
                <FaCalendarPlus />
              </div>
              <h2>Create Appointment</h2>
              <p>Schedule a new appointment with your preferred midwife for prenatal checkups, postpartum visits, or general consultations.</p>
              <Link to="/createappointment" className="option-button">Create New</Link>
            </div>
            
            <div className="option-card">
              <div className="option-icon">
                <FaCalendarAlt />
              </div>
              <h2>Manage Appointments</h2>
              <p>View, edit or cancel your existing appointments. Track appointment status and history.</p>
              <Link to="/manageappointment" className="option-button">View All</Link>
            </div>
            
            <div className="option-card">
              <div className="option-icon">
                <FaUserMd />
              </div>
              <h2>Midwife Appointments</h2>
              <p>Dedicated portal for midwives to manage their appointment schedule, review upcoming consultations, and track patient history.</p>
              <Link to="/midwifeappointments" className="option-button">Access Portal</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentHub;