import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const UpdateMother = () => {
  const { motherId } = useParams();  
  const [mother, setMother] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    birthWeight: '',
    birthLength: '',
    gender: '',
    motherId: '',
    deliveryType: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchMotherDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/Mother/single-mother/${motherId}`);
        setMother(response.data);
        
        const formattedBirthDate = new Date(response.data.birthDate).toISOString().split('T')[0];
       
        setFormData({
          name: response.data.name,
          birthDate: formattedBirthDate, 
          weight: response.data.weight,
          height: response.data.height,
          birthWeight: response.data.birthWeight,
          birthLength: response.data.birthLength,
          gender: response.data.gender,
          motherId: response.data.motherId,
          deliveryType: response.data.deliveryType,
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
    
    // Clear any previous error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Weight validation - must be a number
    if (isNaN(formData.weight) || formData.weight <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }
    
    // Height validation - must be a number
    if (isNaN(formData.height) || formData.height <= 0) {
      newErrors.height = 'Height must be a positive number';
    }
    
    // Birth weight validation - must be a number
    if (isNaN(formData.birthWeight) || formData.birthWeight <= 0) {
      newErrors.birthWeight = 'Birth weight must be a positive number';
    }
    
    // Birth length validation - must be a number
    if (isNaN(formData.birthLength) || formData.birthLength <= 0) {
      newErrors.birthLength = 'Birth length must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
  
    try {
      const response = await axios.put(`http://localhost:5000/api/Mother/update-mother/${motherId}`, formData);
      console.log('Mother updated:', response.data);
      toast.success('Mother details updated successfully!');
      navigate(`/update/${motherId}`); 
    } catch (error) {
      console.error('Error updating mother details:', error);
      toast.error('Failed to update mother details');
      
      // Handle validation errors from server if any
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  if (!mother) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        {/* <Navbar/>
        <BottomNav/> */}
      <div className="mother-form-container">
        <form className="mother-form" onSubmit={handleSubmit}>
          <h2 className="mother-form-title">Update New Born details</h2>

          <div className="mother-form-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          <div className="mother-form-group">
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          {['weight', 'height', 'birthWeight', 'birthLength'].map((field) => (
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
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mother-form-input"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

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

          <div className="mother-form-group">
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
              className="mother-form-input"
              required
            >
              <option value="">Select Delivery Type</option>
              <option value="Normal">Normal</option>
              <option value="C-Section">C-Section</option>
            </select>
          </div>

          <button type="submit" className="mother-form-button">Submit</button>
        </form>
      </div>
      <ToastContainer/>
      {/* <Footer/> */}
    </div>
  );
};

export default UpdateMother;
