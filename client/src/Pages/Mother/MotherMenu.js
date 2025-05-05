import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUserAlt,
  FaBaby,
  FaBookMedical,
  FaWeight,
  FaCog,
  FaBars 
} from 'react-icons/fa';
import '../Dashboard.css';

const MotherMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="dashboard">
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <ul className='tags'>
          <li><FaHome /> {isOpen && <Link to="/Mother/MotherDashboard">Dashboard</Link>}</li>
          <li><FaUserAlt /> {isOpen && <Link to="/Mother/Profile">My Profile</Link>}</li>
          <li><FaBaby /> {isOpen && <Link to="/Mother/FamilyDetails">Family Details</Link>}</li>
          <li><FaBookMedical /> {isOpen && <Link to="/Mother/HealthRecords">Health Records</Link>}</li>
          <li><FaWeight /> {isOpen && <Link to="/Mother/NewbornProgress">Newborn Progress</Link>}</li>
          <li><FaCalendarAlt /> {isOpen && <Link to="/Mother/Appointments">Appointments</Link>}</li>
          <li><FaCog /> {isOpen && <Link to="/Mother/Settings">Settings</Link>}</li>
        </ul>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MotherMenu;