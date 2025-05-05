import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/SignIn';
          return;
        }
        
        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        
        const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage({ text: 'Failed to load profile', type: 'error' });
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation - should not contain numbers
    if (formData.name && /\d/.test(formData.name)) {
      newErrors.name = "Name should not contain numbers";
    }
    
    // NIC validation - should be a valid Sri Lankan NIC
    if (formData.nic && !/^(?:\d{9}[vVxX]|\d{12})$/.test(formData.nic)) {
      newErrors.nic = "Invalid Sri Lankan NIC";
    }
    
    // Email validation
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear the error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      
      const response = await axios.put(
        `http://localhost:5000/api/users/profile/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data.user);
      setIsEditing(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-error">Unable to load profile. Please sign in again.</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="profile-field">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="profile-field">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="profile-field">
                <label>Role:</label>
                <p className="role-badge">{user.role}</p>
              </div>
              
              <div className="profile-field">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="profile-field">
                <label>Birth Date:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate ? new Date(formData.birthdate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Conditional fields based on role */}
            {user.role === 'mother' && (
              <div className="form-section">
                <h2>Mother Information</h2>
                
                <div className="profile-field">
                  <label>Village Code:</label>
                  <input
                    type="text"
                    name="villageCode"
                    value={formData.villageCode || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="profile-field">
                  <label>NIC:</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic || ''}
                    onChange={handleChange}
                  />
                  {errors.nic && <span className="error-message">{errors.nic}</span>}
                </div>
              </div>
            )}
            
            {user.role === 'midwife' && (
              <div className="form-section">
                <h2>Midwife Information</h2>
                
                <div className="profile-field">
                  <label>Service Number:</label>
                  <input
                    type="text"
                    name="serviceNo"
                    value={formData.serviceNo || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="profile-field">
                  <label>MOH Branch:</label>
                  <input
                    type="text"
                    name="mohBranch"
                    value={formData.mohBranch || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="profile-field">
                  <label>NIC:</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic || ''}
                    onChange={handleChange}
                  />
                  {errors.nic && <span className="error-message">{errors.nic}</span>}
                </div>
              </div>
            )}
            
            <div className="form-section">
              <h2>Change Password</h2>
              <div className="profile-field">
                <label>New Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
            
            <div className="profile-actions">
              <button type="submit" className="btn-save">Save Changes</button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData(user);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="profile-field">
                <label>Full Name:</label>
                <p>{user.name}</p>
              </div>
              
              <div className="profile-field">
                <label>Email:</label>
                <p>{user.email}</p>
              </div>
              
              <div className="profile-field">
                <label>Role:</label>
                <p className="role-badge">{user.role}</p>
              </div>
              
              <div className="profile-field">
                <label>Address:</label>
                <p>{user.address || 'Not provided'}</p>
              </div>
              
              <div className="profile-field">
                <label>Birth Date:</label>
                <p>{user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}</p>
              </div>
            </div>
            
            {/* Conditional fields based on role */}
            {user.role === 'mother' && (
              <div className="form-section">
                <h2>Mother Information</h2>
                
                <div className="profile-field">
                  <label>Village Code:</label>
                  <p>{user.villageCode || 'Not provided'}</p>
                </div>
                
                <div className="profile-field">
                  <label>NIC:</label>
                  <p>{user.nic || 'Not provided'}</p>
                </div>
              </div>
            )}
            
            {user.role === 'midwife' && (
              <div className="form-section">
                <h2>Midwife Information</h2>
                
                <div className="profile-field">
                  <label>Service Number:</label>
                  <p>{user.serviceNo || 'Not provided'}</p>
                </div>
                
                <div className="profile-field">
                  <label>MOH Branch:</label>
                  <p>{user.mohBranch || 'Not provided'}</p>
                </div>
                
                <div className="profile-field">
                  <label>NIC:</label>
                  <p>{user.nic || 'Not provided'}</p>
                </div>
              </div>
            )}
            
            <div className="profile-actions">
              <button 
                type="button" 
                className="btn-edit" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;