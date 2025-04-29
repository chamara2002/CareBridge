import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import SliderMother from '../../../Components/slide-mother/SliderMother';
import MotherHealthInfo from '../../../Components/MotherProfileInfo/MotherHealthInfo';
import { FaUserCircle } from 'react-icons/fa';
import './singleM.css'

const SingleM = () => {
  const { motherId } = useParams();
  const [mother, setMother] = useState(null);
  const navigate= useNavigate();

  useEffect(() => {
    const fetchMotherDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/single-registredmother/${motherId}`);
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


  const passMotherid =() => {
    navigate('/AddMother', { state: { motherId:mother.motherId } });
   
  }

  return (
    <div>
      <Navbar />
      <SliderMother/><br/><br/>
      <div className="mother-profile-container">
      <h2 className="profile-title">Mother Profile</h2>

      <div className="mother-profile-card">
        {/* Left Section: Profile Icon */}
        <div className="profile-icon-section">
          <FaUserCircle className="profile-icon" />
        </div>

        {/* Right Section: Mother Details */}
        <div className="mother-details">
          <p><strong>Mother ID:</strong> {mother.motherId}</p>
          <p><strong>Full Name:</strong> {mother.fullName}</p>
          <p><strong>Date of Birth:</strong> {mother.dateOfBirth}</p>
          <p><strong>Phone Number:</strong> {mother.phoneNumber}</p>
          <p><strong>Blood Type:</strong> {mother.bloodType}</p>
          <p><strong>Height:</strong> {mother.height} cm</p>
          <p><strong>Weight:</strong> {mother.weight} kg</p>
          <p><strong>Pre-Pregnancy Weight:</strong> {mother.prePregnancyWeight} kg</p>
        </div>
      </div>

      {/* Register Button */}
      
      <MotherHealthInfo/>
      <button className="register-btn" onClick={passMotherid}>Register New Born</button>
    </div>
      <Footer />
    </div>
  );
};

export default SingleM;
