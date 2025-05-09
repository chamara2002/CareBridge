import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MotherMenu from './MotherMenu';
import './MotherNewborns.css';

const MotherNewborns = () => {
  const [newborns, setNewborns] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    headCircumference: '',
    healthStatus: 'Healthy',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the mother's ID from localStorage
  const motherId = localStorage.getItem('userId');

  // Add validation state to track if fields have been touched/changed
  const [touched, setTouched] = useState({
    name: false,
    birthDate: false,
    weight: false,
    height: false,
    headCircumference: false
  });

  const fetchNewborns = useCallback(async () => {
    try {
      setLoading(true);
      // Use the new endpoint to fetch only this mother's newborns
      const response = await axios.get(`http://localhost:5000/api/midnewborns/mother/${motherId}`);
      setNewborns(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching newborns:', err);
      setError('Failed to load newborns. Please try again later.');
      setLoading(false);
    }
  }, [motherId]);

  useEffect(() => {
    if (motherId) {
      fetchNewborns();
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [motherId, fetchNewborns]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Mark field as touched when user interacts with it
    if (!touched[name]) {
      setTouched({ ...touched, [name]: true });
    }
    
    // Perform real-time validation as user types
    validateField(name, value);
  };

  // Field blur handler for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  // Validate a single field
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'birthDate':
        if (!value) {
          newErrors.birthDate = 'Birth date is required';
        } else if (new Date(value) > new Date()) {
          newErrors.birthDate = 'Birth date cannot be in the future';
        } else if (new Date(value) < new Date(new Date().setFullYear(new Date().getFullYear() - 1))) {
          newErrors.birthDate = 'Birth date cannot be more than 1 year in the past';
        } else {
          delete newErrors.birthDate;
        }
        break;
        
      case 'weight':
        if (!value) {
          newErrors.weight = 'Weight is required';
        } else if (isNaN(value) || Number(value) <= 0) {
          newErrors.weight = 'Weight must be a positive number';
        } else if (Number(value) < 1 || Number(value) > 10) {
          newErrors.weight = 'Weight should be between 1 and 10 kg';
        } else {
          delete newErrors.weight;
        }
        break;
        
      case 'height':
        if (!value) {
          newErrors.height = 'Height is required';
        } else if (isNaN(value) || Number(value) <= 0) {
          newErrors.height = 'Height must be a positive number';
        } else if (Number(value) < 30 || Number(value) > 100) {
          newErrors.height = 'Height should be between 30 and 100 cm';
        } else {
          delete newErrors.height;
        }
        break;
        
      case 'headCircumference':
        if (value && (isNaN(value) || Number(value) <= 0)) {
          newErrors.headCircumference = 'Head circumference must be a positive number';
        } else if (value && (Number(value) < 25 || Number(value) > 50)) {
          newErrors.headCircumference = 'Head circumference should be between 25 and 50 cm';
        } else {
          delete newErrors.headCircumference;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Form validation function
  const validateForm = () => {
    // Validate all fields
    const { name, birthDate, weight, height, headCircumference } = formData;
    
    // Mark all fields as touched
    setTouched({
      name: true,
      birthDate: true,
      weight: true,
      height: true,
      headCircumference: true
    });
    
    let newErrors = {};

    // Name: Cannot be empty and min length
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // BirthDate: Cannot be empty, cannot be in the future, and not too far in the past
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else if (new Date(birthDate) > new Date()) {
      newErrors.birthDate = 'Birth date cannot be in the future';
    } else if (new Date(birthDate) < new Date(new Date().setFullYear(new Date().getFullYear() - 1))) {
      newErrors.birthDate = 'Birth date cannot be more than 1 year in the past';
    }

    // Weight: Cannot be empty, must be positive, and within reasonable range
    if (!weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(weight) || Number(weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    } else if (Number(weight) < 1 || Number(weight) > 10) {
      newErrors.weight = 'Weight should be between 1 and 10 kg';
    }

    // Height: Cannot be empty, must be positive, and within reasonable range
    if (!height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(height) || Number(height) <= 0) {
      newErrors.height = 'Height must be a positive number';
    } else if (Number(height) < 30 || Number(height) > 100) {
      newErrors.height = 'Height should be between 30 and 100 cm';
    }

    // Head Circumference: Optional, but if provided must be valid
    if (headCircumference) {
      if (isNaN(headCircumference) || Number(headCircumference) <= 0) {
        newErrors.headCircumference = 'Head circumference must be a positive number';
      } else if (Number(headCircumference) < 25 || Number(headCircumference) > 50) {
        newErrors.headCircumference = 'Head circumference should be between 25 and 50 cm';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // If no errors, return true
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // If validation fails, do not submit

    try {
      if (isEditing) {
        if (!formData._id) {
          console.error('Error: Newborn ID is missing.');
          return;
        }
        
        // When editing, preserve the original health status
        // Get the original newborn to keep its health status
        const originalNewborn = newborns.find(n => n._id === formData._id);
        
        // Create updated data with original health status
        const updatedData = {
          ...formData,
          healthStatus: originalNewborn.healthStatus // Keep original health status
        };
        
        await axios.put(`http://localhost:5000/api/midnewborns/${formData._id}`, updatedData);
        setNewborns(newborns.map((newborn) =>
          newborn._id === formData._id ? {...formData, healthStatus: originalNewborn.healthStatus} : newborn
        ));
      } else {
        // For new newborns, default to "Healthy" status
        const newbornData = {
          ...formData,
          motherId: motherId,
          healthStatus: 'Healthy' // Always set to Healthy for new newborns
        };
        const response = await axios.post('http://localhost:5000/api/midnewborns', newbornData);
        setNewborns([...newborns, response.data]);
      }
      resetForm();
      setShowForm(false); // Hide form after submit
    } catch (error) {
      console.error('Error saving newborn:', error);
    }
  };

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0]; // Extract YYYY-MM-DD
  };

  const handleEdit = (newborn) => {
    setFormData({
      ...newborn,
      birthDate: formatDateForInput(newborn.birthDate),
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/midnewborns/${id}`);
      setNewborns(newborns.filter((newborn) => newborn._id !== id));
    } catch (error) {
      console.error('Error deleting newborn:', error);
    }
  };

  // Reset form and state
  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      weight: '',
      height: '',
      headCircumference: '',
      healthStatus: 'Healthy',
    });
    setIsEditing(false);
    setErrors({});
  };

  // Show the form to add a new newborn
  const handleAddNewborn = () => {
    resetForm();
    setShowForm(true);
    setIsEditing(false);
  };

  // Hide the form when "Cancel" is clicked
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <MotherMenu>
      <div className="mother-newborn-management">
        <h2>My Newborn Management</h2>
        <p className="page-description">
          Add and manage details of your newborns. This helps midwives provide better care and track your baby's development.
        </p>

        {/* Button to add a new newborn */}
        <button onClick={handleAddNewborn} className="btn-primary add-newborn-btn">
          Add Newborn
        </button>

        {/* Newborn Form - Only shows if adding or editing a newborn */}
        {showForm && (
          <div className="newborn-form">
            <h3>{isEditing ? 'Edit Newborn Details' : 'Add New Newborn'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={`form-group ${touched.name && errors.name ? 'has-error' : ''}`}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter newborn's name"
                />
                {touched.name && errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className={`form-group ${touched.birthDate && errors.birthDate ? 'has-error' : ''}`}>
                <label>Birth Date:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formatDateForInput(formData.birthDate)}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                {touched.birthDate && errors.birthDate && <div className="error">{errors.birthDate}</div>}
              </div>

              <div className="form-row">
                <div className={`form-group ${touched.weight && errors.weight ? 'has-error' : ''}`}>
                  <label>Weight (kg):</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    placeholder="e.g., 3.5"
                  />
                  {touched.weight && errors.weight && <div className="error">{errors.weight}</div>}
                </div>

                <div className={`form-group ${touched.height && errors.height ? 'has-error' : ''}`}>
                  <label>Height (cm):</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    placeholder="e.g., 50"
                  />
                  {touched.height && errors.height && <div className="error">{errors.height}</div>}
                </div>
              </div>

              <div className={`form-group ${touched.headCircumference && errors.headCircumference ? 'has-error' : ''}`}>
                <label>Head Circumference (cm):</label>
                <input
                  type="text"
                  name="headCircumference"
                  value={formData.headCircumference}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 35"
                />
                {touched.headCircumference && errors.headCircumference && (
                  <div className="error">{errors.headCircumference}</div>
                )}
                <small className="form-hint">Optional. Typical range: 25-50 cm</small>
              </div>

              <div className="form-group health-status-display">
                <label>Health Status:</label>
                <div className="status-display">
                  {isEditing ? (
                    <span className={`status-badge status-${formData.healthStatus.toLowerCase().replace(' ', '-')}`}>
                      {formData.healthStatus}
                    </span>
                  ) : (
                    <span className="status-badge status-healthy">Healthy (Default)</span>
                  )}
                  <p className="status-note">
                    <i>Note: Only midwives can update the health status of newborns.</i>
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update' : 'Add'} Newborn
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-message">Loading newborns data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Newborn Records Table */}
            <div className="newborns-table">
              <h3>My Newborns</h3>
              {newborns.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Birth Date</th>
                      <th>Weight</th>
                      <th>Height</th>
                      <th>Head Circ.</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newborns.map((newborn) => (
                      <tr key={newborn._id} className={`status-${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                        <td>{newborn.name}</td>
                        <td>{new Date(newborn.birthDate).toLocaleDateString()}</td>
                        <td>{newborn.weight} kg</td>
                        <td>{newborn.height} cm</td>
                        <td>{newborn.headCircumference || 'N/A'} cm</td>
                        <td>
                          <span className={`status-badge status-${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                            {newborn.healthStatus}
                          </span>
                        </td>
                        <td className="actions">
                          <button onClick={() => handleEdit(newborn)} className="btn-edit">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(newborn._id)} className="btn-delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data-message">
                  <p>You haven't added any newborns yet. Click the "Add Newborn" button to get started.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MotherMenu>
  );
};

export default MotherNewborns;
