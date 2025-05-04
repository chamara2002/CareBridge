import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import BottomNav from '../../../Components/MotherNavBottom/BottomNav';
import SliderMother from '../../../Components/slide-mother/SliderMother';
import feather from "feather-icons";
import './regm.css'


const RegMother = () => {
  const [formData, setFormData] = useState({
    motherId: '',
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    bloodType: '',
    height: '',
    weight: '',
    prePregnancyWeight: ''
  });

  useEffect(() => {
    const fetchNextMotherId = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get-registerednext-id');
        setFormData((prevState) => ({
          ...prevState,
          motherId: response.data.nextId  
        }));
      } catch (error) {
        console.error('Error fetching next Mother ID:', error);
        toast.error('Failed to fetch Mother ID');
      }
    };

    fetchNextMotherId();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for numeric fields
    if ((name === 'weight' || name === 'height' || name === 'prePregnancyWeight') && isNaN(value)) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} must be a number`);
      return;
    }

    // Validation for name field (only alphabets and spaces)
    if (name === 'fullName' && /[^a-zA-Z\s]/.test(value)) {
      toast.error('Full Name must contain only alphabetic characters');
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/registerMother', formData);
      console.log(response.data);
      toast.success('Mother added successfully');

      setFormData({
        motherId: '',
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        bloodType: '',
        height: '',
        weight: '',
        prePregnancyWeight: ''
      });
    } catch (error) {
      console.error('Error adding Mother:', error);
      toast.error('Failed to add Mother');
    }
  };

  return (
    <div
  >
      <Navbar />
      <SliderMother/>
      <div className="mother-form-container">
        <form className="mother-form" onSubmit={handleSubmit}>
          <h2 className="mother-form-title">Mother Registration</h2>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="fullName" 
              placeholder='Full Name'
              value={formData.fullName} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="date" 
              name="dateOfBirth" 
              placeholder='Date of Birth'
              value={formData.dateOfBirth} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="phoneNumber" 
              placeholder='Phone Number'
              value={formData.phoneNumber} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="bloodType" 
              placeholder='Blood Type'
              value={formData.bloodType} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="height" 
              placeholder='Height (cm)'
              value={formData.height} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="weight" 
              placeholder='Weight (kg)'
              value={formData.weight} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="prePregnancyWeight" 
              placeholder='Pre-Pregnancy Weight (kg)'
              value={formData.prePregnancyWeight} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
            />
          </div>

          <div className="mother-form-group">
            <input 
              type="text" 
              name="motherId" 
              placeholder='Mother ID'
              value={formData.motherId} 
              onChange={handleChange} 
              className="mother-form-input" 
              required 
              readOnly
            />
          </div>

          <button type="submit" className="mother-form-button">Submit</button>
        </form>
      </div>

      <ToastContainer />
      <Footer />
    </div>
  );
};

export default RegMother;
