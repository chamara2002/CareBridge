import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './viewMother.css';
import { FaUserCircle } from 'react-icons/fa';

const ViewMother = () => {
  const { motherId } = useParams();
  const [mother, setMother] = useState(null);

  useEffect(() => {
    const fetchMotherDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/Mother/single-mother/${motherId}`);
        setMother(response.data);
      } catch (error) {
        console.error('Error fetching mother details:', error);
      }
    };

    fetchMotherDetails();
  }, [motherId]);

  if (!mother) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* <Navbar /> */}
      {/* <BottomNav /> */}
      <br/><br/>
      <div className="single-mother-container">
      <h2 className="single-mother-title">New Born Details</h2>
      
      <div className="mother-details-card">
        <div className="profile-section">
          <FaUserCircle className="profile-icon" />
          <div>
            <h3>{mother.name}</h3>
            <p className="mother-id"><strong>ID:</strong> {mother.motherId}</p>
          </div>
        </div>

        <div className="mother-info">
          <p><strong>Birth Date:</strong> {mother.birthDate}</p>
          <p><strong>Weight:</strong> {mother.weight} kg</p>
          <p><strong>Height:</strong> {mother.height} cm</p>
          <p><strong>Birth Weight:</strong> {mother.birthWeight} kg</p>
          <p><strong>Birth Length:</strong> {mother.birthLength} cm</p>
          <p><strong>Gender:</strong> {mother.gender}</p>
          <p><strong>Delivery Type:</strong> {mother.deliveryType}</p>
        </div>
      </div>
      
    </div>
      {/* <Footer /> */}
    </div>
  );
};

export default ViewMother;
