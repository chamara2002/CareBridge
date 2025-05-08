import { useState, useEffect } from 'react';
import axios from 'axios';
import MotherMenu from './MotherMenu';
import './MotherDetails.css';
import { jwtDecode } from 'jwt-decode';

const MotherDetails = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nic: '',
    villageCode: '',
    address: '',
    pregnancyStatus: 'Unknown',
    dueDate: '',
    bloodGroup: '',
    husbandDetails: {
      name: '',
      phoneNumber: '',
      occupation: '',
      nic: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('User not authenticated. Please sign in again.');
        setLoading(false);
        return;
      }

      // Decode the token to get the userId
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      console.log('Fetching data for user ID:', userId);
      
      const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Received data from server:', response.data);
      
      if (response.data) {
        // Check if we got a user object back or direct data
        const userData = response.data.user || response.data;
        
        // Log husband details for debugging
        console.log('Husband details from server:', userData.husbandDetails);
        
        // Handle received data properly
        setUserData({
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || (userData.name?.split(' ').length > 1 ? userData.name.split(' ').slice(1).join(' ') : '') || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          nic: userData.nic || '',
          villageCode: userData.villageCode || '',
          address: userData.address || '',
          pregnancyStatus: userData.pregnancyStatus || 'Unknown',
          dueDate: userData.dueDate ? new Date(userData.dueDate).toISOString().split('T')[0] : '',
          bloodGroup: userData.bloodGroup || '',
          husbandDetails: {
            name: userData.husbandDetails?.name || '',
            phoneNumber: userData.husbandDetails?.phoneNumber || '',
            occupation: userData.husbandDetails?.occupation || '',
            nic: userData.husbandDetails?.nic || ''
          },
          emergencyContact: {
            name: userData.emergencyContact?.name || '',
            phone: userData.emergencyContact?.phone || '',
            relationship: userData.emergencyContact?.relationship || ''
          }
        });
      } else {
        setError('No user data received from server');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // More informative error logging
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      
      // More informative error message based on the specific error
      const errorMessage = err.response?.status === 404 
        ? 'User profile not found. Please complete your registration.'
        : err.response?.data?.message || 'Failed to load user details. Please try again later.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation errors when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
    
    // Validate phone number input
    if (name === 'phoneNumber' || name === 'emergency.phone' || name === 'husband.phoneNumber') {
      if (value && !/^\d*$/.test(value)) {
        return; // Don't update if not numeric
      }
    }
    
    // Validate NIC format
    if (name === 'nic' || name === 'husband.nic') {
      if (value && !(
        /^[0-9]{0,9}[vVxX]?$/.test(value) || // Allow partial input for old format
        /^[0-9]{0,12}$/.test(value)         // Allow partial input for new format
      )) {
        // Allow typing but don't validate (will be validated on submit)
      }
    }
    
    if (name.startsWith('emergency.')) {
      const field = name.split('.')[1];
      setUserData(prevData => ({
        ...prevData,
        emergencyContact: {
          ...prevData.emergencyContact,
          [field]: value
        }
      }));
    } else if (name.startsWith('husband.')) {
      const field = name.split('.')[1];
      console.log(`Updating husband.${field} to:`, value); // Debug log
      setUserData(prevData => {
        const updatedData = {
          ...prevData,
          husbandDetails: {
            ...prevData.husbandDetails,
            [field]: value
          }
        };
        console.log('Updated userData with husband details:', updatedData.husbandDetails);
        return updatedData;
      });
    } else {
      setUserData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Improved form validation function
  const validateForm = () => {
    const errors = {};
    
    // Phone number validation
    if (userData.phoneNumber) {
      if (!/^07\d{8}$/.test(userData.phoneNumber)) {
        errors.phoneNumber = "Phone number should be in format 07XXXXXXXX";
      }
    }

    // Husband's phone number validation (if provided)
    if (userData.husbandDetails?.phoneNumber) {
      if (!/^07\d{8}$/.test(userData.husbandDetails.phoneNumber)) {
        errors.husbandPhone = "Husband's phone number should be in format 07XXXXXXXX";
      }
    }
    
    // NIC validation
    if (userData.nic) {
      if (!(
        /^[0-9]{9}[vVxX]$/.test(userData.nic) || // Old format: 9 digits + v/V/x/X
        /^[0-9]{12}$/.test(userData.nic)         // New format: 12 digits
      )) {
        errors.nic = "NIC should be in format XXXXXXXXX[v/V] or XXXXXXXXXXXX";
      }
    }

    // Husband's NIC validation (if provided)
    if (userData.husbandDetails?.nic) {
      if (!(
        /^[0-9]{9}[vVxX]$/.test(userData.husbandDetails.nic) || // Old format: 9 digits + v/V/x/X
        /^[0-9]{12}$/.test(userData.husbandDetails.nic)         // New format: 12 digits
      )) {
        errors.husbandNic = "Husband's NIC should be in format XXXXXXXXX[v/V] or XXXXXXXXXXXX";
      }
    }

    setValidationErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      // Display the first error
      setError(Object.values(formErrors)[0]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('User not authenticated. Please sign in again.');
        setLoading(false);
        return;
      }

      // Decode the token to get the userId
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      
      // Create the update payload with all fields that might be in the user model
      const husbandData = {
        name: userData.husbandDetails?.name || '',
        phoneNumber: userData.husbandDetails?.phoneNumber || '',
        occupation: userData.husbandDetails?.occupation || '',
        nic: userData.husbandDetails?.nic || ''
      };
      
      console.log('Husband data before update:', husbandData);
      
      const dataToUpdate = {
        // Core fields from the user model
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        nic: userData.nic,
        villageCode: userData.villageCode,
        address: userData.address,
        
        // Additional fields
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        pregnancyStatus: userData.pregnancyStatus,
        dueDate: userData.dueDate,
        bloodGroup: userData.bloodGroup,
        
        // Explicitly spread the husband details to ensure it's properly formatted
        husbandDetails: { ...husbandData },
        emergencyContact: {
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          relationship: userData.emergencyContact?.relationship || ''
        }
      };
      
      console.log('Full data being sent to server:', dataToUpdate);
      console.log('Husband details being sent:', dataToUpdate.husbandDetails);
      
      // Send the update request
      const response = await axios.put(
        `http://localhost:5000/api/users/profile/${userId}`, 
        dataToUpdate, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      if (response.data) {
        setSuccess('Your details have been updated successfully!');
        
        // Add an immediate re-fetch to confirm the data was saved
        await fetchUserData();
      } else {
        setError('Received invalid response from server');
      }
      
      setLoading(false);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating user data:', err);
      // More detailed error logging
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        
        // Check for specific validation errors for husband details
        if (err.response.data.errors && err.response.data.errors.husbandDetails) {
          console.error('Husband details validation error:', err.response.data.errors.husbandDetails);
          setError(`Husband details error: ${err.response.data.errors.husbandDetails}`);
        } else {
          const errorMessage = err.response?.data?.message || 'Failed to update your details. Please try again later.';
          setError(errorMessage);
        }
      } else {
        setError('Network error: Unable to connect to server');
      }
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  return (
    <MotherMenu>
      <div className="mother-details-container">
        <div className="mother-details-header">
          <h2>Mother Details</h2>
          <button 
            className={`edit-toggle-btn ${isEditing ? 'cancel' : 'edit'}`}
            onClick={handleEditToggle}
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading your details...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="mother-details-form">
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label>First Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <p>{userData.firstName || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <p>{userData.lastName || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                ) : (
                  <p>{userData.email || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Phone:</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{userData.phoneNumber || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>NIC:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nic"
                    value={userData.nic || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{userData.nic || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Village Code:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="villageCode"
                    value={userData.villageCode || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{userData.villageCode || 'Not provided'}</p>
                )}
              </div>

              <div className="form-group">
                <label>Address:</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={userData.address || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{userData.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-section">
                <h3>Health Information</h3>
                <div className="form-group">
                  <label>Pregnancy Status:</label>
                  {isEditing ? (
                    <select
                      name="pregnancyStatus"
                      value={userData.pregnancyStatus || 'Unknown'}
                      onChange={handleInputChange}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Pregnant">Pregnant</option>
                      <option value="Postpartum">Postpartum</option>
                    </select>
                  ) : (
                    <p>{userData.pregnancyStatus || 'Unknown'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Due Date:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dueDate"
                      value={userData.dueDate ? userData.dueDate.split('T')[0] : ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.dueDate ? new Date(userData.dueDate).toLocaleDateString() : 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Blood Group:</label>
                  {isEditing ? (
                    <select
                      name="bloodGroup"
                      value={userData.bloodGroup || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p>{userData.bloodGroup || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Husband/Partner Details</h3>
                <div className="form-group">
                  <label>Name:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="husband.name"
                      value={userData.husbandDetails?.name || ''}
                      onChange={handleInputChange}
                      data-testid="husband-name-input"
                    />
                  ) : (
                    <p>{userData.husbandDetails?.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="husband.phoneNumber"
                      value={userData.husbandDetails?.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.husbandDetails?.phoneNumber || 'Not provided'}</p>
                  )}
                  {validationErrors.husbandPhone && <span className="error-text">{validationErrors.husbandPhone}</span>}
                </div>

                <div className="form-group">
                  <label>Occupation:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="husband.occupation"
                      value={userData.husbandDetails?.occupation || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.husbandDetails?.occupation || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>NIC:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="husband.nic"
                      value={userData.husbandDetails?.nic || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.husbandDetails?.nic || 'Not provided'}</p>
                  )}
                  {validationErrors.husbandNic && <span className="error-text">{validationErrors.husbandNic}</span>}
                </div>
                {process.env.NODE_ENV === 'development' && isEditing && (
                  <div className="debug-info" style={{fontSize: '10px', color: '#999', marginTop: '5px'}}>
                    Current husband data: {JSON.stringify(userData.husbandDetails)}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-section">
                <h3>Emergency Contact</h3>
                <div className="form-group">
                  <label>Name:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergency.name"
                      value={userData.emergencyContact?.name || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.emergencyContact?.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone:</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergency.phone"
                      value={userData.emergencyContact?.phone || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.emergencyContact?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Relationship:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergency.relationship"
                      value={userData.emergencyContact?.relationship || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.emergencyContact?.relationship || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Details</button>
              </div>
            )}
          </form>
        )}
      </div>
    </MotherMenu>
  );
};

export default MotherDetails;
