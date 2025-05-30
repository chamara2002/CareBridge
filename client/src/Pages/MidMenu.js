// MidMenu.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaBars, FaUsers, FaBabyCarriage, FaSyringe } from 'react-icons/fa';
import './Dashboard.css';

const MidMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <ul className='tags'>
          <li><FaHome /> {isOpen && <Link to="/Dashboard">Dashboard</Link>}</li>
          <li><FaUsers /> <Link to="/MidMothers">Mothers Management</Link></li>
          <li><FaBabyCarriage /> <Link to="/MidNewborns">Newborn Management</Link></li>
          <li><FaSyringe /> <Link to="/MidVac">Newborn Vaccination</Link></li> 
          <li><FaCalendarAlt /> {isOpen && <Link to="/AppointmentManagement">Appointments</Link>}</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MidMenu;