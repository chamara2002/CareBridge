import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUserAlt,
  FaWeight,
  FaSyringe,
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
          <li><FaUserAlt /> {isOpen && <Link to="/Mother/MotherDetails">Mother Details</Link>}</li>
          <li><FaWeight /> {isOpen && <Link to="/Mother/NewbornDetails">Newborn Details</Link>}</li>
          <li><FaSyringe /> {isOpen && <Link to="/Mother/VaccineDetails">Vaccination Records</Link>}</li>
          <li><FaCalendarAlt /> {isOpen && <Link to="/appointmenthub">Appointments</Link>}</li>
        </ul>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MotherMenu;