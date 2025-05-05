import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import './addmother.css';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Make sure to install this package: npm install jwt-decode

const AddMother = () => {
  const location = useLocation();
  const [motherId, setMotherId] = useState('');
  const { state } = location;

  useEffect(() => {
    // First check if motherId was passed via state/navigation
    if (state && state.motherId) {
      setMotherId(state.motherId);
    } else {
      // If not passed via navigation, try to get it from the JWT token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          
          // Get the user ID from the token
          const userId = decodedToken.userId;
          
          // Fetch the user details to get their motherId
          const fetchUserDetails = async () => {
            try {
              const response = await axios.get(`http://localhost:5000/api/Mother/${userId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // If the user has a motherId field, use it
              if (response.data && response.data.motherId) {
                setMotherId(response.data.motherId);
              } else if (response.data && response.data._id && decodedToken.role === 'mother') {
                // If the user doesn't have a motherId but is a mother,
                // we can use their userId as the motherId
                setMotherId(response.data._id);
              }
            } catch (error) {
              console.error('Error fetching user details:', error);
              toast.error('Failed to fetch user details');
            }
          };
          
          fetchUserDetails();
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }, [state]);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    bloodGroup: '',
    gender: '',
    birthWeight: '',
    birthLength: '',
    deliveryType: ''
  });

  //validation

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'weight' || name === 'height' || name === 'birthWeight' || name === 'birthLength') && isNaN(value)) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} must be a number`);
      return;
    }

    if (name === 'name' && /[^a-zA-Z\s]/.test(value)) {
      toast.error('Name must contain only alphabetic characters');
      return;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Include the motherId in the form data before submitting it
    const dataToSubmit = { ...formData, motherId: motherId };
  
    try {
      const response = await axios.post(`http://localhost:5000/api/Mother/Create-Mother`, dataToSubmit);
      console.log(response.data);
      toast.success('Mother added successfully');
      setFormData({
        name: '',
        birthDate: '',
        weight: '',
        height: '',
        bloodGroup: '',
        gender: '',
        birthWeight: '',
        birthLength: '',
        deliveryType: ''
      });
    } catch (error) {
      console.error('Error adding Mother:', error);
      toast.error('Mother Not Registered');
      if (error.response && error.response.status === 400) {
        toast.error('Mother Not Registered');
      } else {
        toast.error('Mother Not Registered');
      }
    }
  };
  

  return (
    <div className='Motther-main'>
      {/* <Navbar />
      <BottomNav /> */}
      <div className="mother-form-container">
        <form className="mother-form" onSubmit={handleSubmit}>
          <h2 className="mother-form-title">New Born Registration</h2>

          <div className="mother-form-group">
            <input
              type="text"
              name="name"
              placeholder='Name'
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
              placeholder='Birth Date'
              value={formData.birthDate}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          <div className="mother-form-group">
            <input
              type="text"
              name="weight"
              placeholder='Weight'
              value={formData.weight}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          <div className="mother-form-group">
            <input
              type="text"
              name="height"
              placeholder='Height'
              value={formData.height}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          <div className="mother-form-group">
            <input
              type="text"
              name="bloodGroup"
              placeholder='Blood Group'
              value={formData.bloodGroup}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

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
              name="birthWeight"
              placeholder='Birth Weight'
              value={formData.birthWeight}
              onChange={handleChange}
              className="mother-form-input"
              required
            />
          </div>

          <div className="mother-form-group">
            <input
              type="text"
              name="birthLength"
              placeholder='Birth Length'
              value={formData.birthLength}
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
              value={motherId}
              readOnly
              className="mother-form-input"
              required
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
      </div><br/><br/><br/>

      <ToastContainer />
      {/* <Footer /> */}
    </div>
  );
};

export default AddMother;
