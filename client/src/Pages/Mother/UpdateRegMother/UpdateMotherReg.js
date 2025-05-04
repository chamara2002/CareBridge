import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import SliderMother from '../../../Components/slide-mother/SliderMother';

const UpdateMotherReg = () => {
  const { motherId } = useParams();  
  const [mother, setMother] = useState(null);
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

  const [errors, setErrors] = useState({});  // ✅ Define errors state

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchMotherDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/single-registredmother/${motherId}`);
        setMother(response.data);
  
        const formattedBirthDate = new Date(response.data.dateOfBirth).toISOString().split('T')[0];
  
        setFormData({
          motherId: response.data.motherId,
          fullName: response.data.fullName,
          dateOfBirth: formattedBirthDate, 
          phoneNumber: response.data.phoneNumber,
          bloodType: response.data.bloodType,
          height: response.data.height,
          weight: response.data.weight,
          prePregnancyWeight: response.data.prePregnancyWeight
        });
      } catch (error) {
        console.error('Error fetching mother details:', error);
      }
    };
  
    fetchMotherDetails();
  }, [motherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() === '' ? `${name} is required` : '',  
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key]?.toString().trim();  // Convert to string before trimming
      if (value === '') {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;  

    try {
      const response = await axios.put(`http://localhost:5000/api/update-registeredmother/${motherId}`, formData);
      console.log('Mother updated:', response.data);

      toast.success('Mother details updated successfully!');

      navigate(`/updatereg/${motherId}`); 
    } catch (error) {
      console.error('Error updating mother details:', error);
    }
  };

  if (!mother) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar/>
      <SliderMother/>
      <div className="mother-form-container">
        <form className="mother-form" onSubmit={handleSubmit}>
          <h2 className="mother-form-title">Update Mother Details</h2>

          <div className="mother-form-group">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>

          <div className="mother-form-group">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
            {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}
          </div>

          {['phoneNumber', 'bloodType', 'height', 'weight', 'prePregnancyWeight'].map((field) => (
            <div className="mother-form-group" key={field}>
              <input
                type="text"
                name={field}
                placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                value={formData[field]}
                onChange={handleChange}
                className="mother-form-input"
                required
              />
              {errors[field] && <p className="error-text">{errors[field]}</p>}
            </div>
          ))}

          <div className="mother-form-group">
            <input
              type="text"
              name="motherId"
              placeholder="Mother ID"
              value={formData.motherId}
              className="mother-form-input"
              required
              readOnly
            />
          </div>

          <button type="submit" className="mother-form-button">Submit</button>
        </form>
      </div>

      <ToastContainer/>
      <Footer/>
    </div>
  );
};

export default UpdateMotherReg;
