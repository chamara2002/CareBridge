// Contact.js
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaHospital } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const contactInfo = [
    {
      icon: <FaHospital className="contact-icon" />,
      title: "Main Clinic",
      details: [
        "123 CareBridge Avenue",
        "Health District, City 10001",
        "Ground Floor, Wing A"
      ]
    },
    {
      icon: <FaPhone className="contact-icon" />,
      title: "Phone Numbers",
      details: [
        "Appointments: (555) 123-4567",
        "Emergencies: (555) 987-6543",
        "Admin Office: (555) 456-7890"
      ]
    },
    {
      icon: <FaEnvelope className="contact-icon" />,
      title: "Email Contacts",
      details: [
        "Appointments: book@carebridge.example",
        "Support: help@carebridge.example",
        "General: contact@carebridge.example"
      ]
    },
    {
      icon: <FaClock className="contact-icon" />,
      title: "Operating Hours",
      details: [
        "Monday-Friday: 7:30 AM - 6:00 PM",
        "Saturday: 9:00 AM - 2:00 PM",
        "Emergency: 24/7"
      ]
    }
  ];

  return (
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact CareBridge</h1>
          <p>Reach us through these channels for appointments and inquiries</p>
        </div>

        <div className="contact-grid">
          {contactInfo.map((item, index) => (
            <div key={index} className="contact-card">
              <div className="icon-wrapper">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <ul className="details-list">
                {item.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="map-container">
          <h2><FaMapMarkerAlt /> Our Location</h2>
          <div className="map-placeholder">
            {/* Replace with actual map embed if needed */}
            <p>Map would display here</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-link"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      </div>
  );
};

export default Contact;