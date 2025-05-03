// Service.js
import { FaBaby, FaUserNurse, FaClinicMedical, FaAmbulance, FaCalendarAlt, FaHeart } from 'react-icons/fa';
import './Service.css';
import { useNavigate } from 'react-router-dom';          

const Service = () => {
const navigate = useNavigate();
  const services = [
    {
      icon: <FaBaby className="service-icon" />,
      title: "Prenatal Care",
      description: "Complete pregnancy monitoring with regular checkups, scans, and nutrition plans."
    },
    {
      icon: <FaUserNurse className="service-icon" />,
      title: "Midwife Services",
      description: "Certified midwives available 24/7 for delivery and postpartum support."
    },
    {
      icon: <FaClinicMedical className="service-icon" />,
      title: "Newborn Tracking",
      description: "Health assessments and growth monitoring for your newborn."
    },
    {
      icon: <FaAmbulance className="service-icon" />,
      title: "Emergency Care",
      description: "Immediate response for pregnancy and newborn emergencies."
    },
    {
      icon: <FaCalendarAlt className="service-icon" />,
      title: "Appointments",
      description: "Easy scheduling for all maternal health services."
    },
    {
      icon: <FaHeart className="service-icon" />,
      title: "Health Monitoring",
      description: "Digital tracking for mother and baby's health metrics."
    }
  ];

  return (
      <div className="service-container">
        <div className="service-header">
          <h1>Our CareBridge Services</h1>
          <p>Comprehensive healthcare solutions for mothers and newborns</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="card-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

        <div className="service-footer">
          <h2>Need personalized care?</h2>
          <button className="contact-btn"onClick={() => navigate('/Contact')}>Contact Us</button>
        </div>
      </div>
  );
};

export default Service;