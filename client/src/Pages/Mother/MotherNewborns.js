import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (motherId) {
      fetchNewborns();
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [motherId]);

  const fetchNewborns = async () => {
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
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    const { name, birthDate, weight, height } = formData;

    // Name: Cannot be empty
    if (!name) newErrors.name = 'Name is required';

    // BirthDate: Cannot be empty and cannot be in the future
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else if (new Date(birthDate) > new Date()) {
      newErrors.birthDate = 'Birth date cannot be in the future';
    }

    // Weight: Cannot be empty and should be a positive number
    if (!weight) newErrors.weight = 'Weight is required';
    else if (isNaN(weight) || Number(weight) <= 0) newErrors.weight = 'Weight must be a positive number';

    // Height: Cannot be empty and should be a positive number
    if (!height) newErrors.height = 'Height is required';
    else if (isNaN(height) || Number(height) <= 0) newErrors.height = 'Height must be a positive number';

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
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter newborn's name"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label>Birth Date:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formatDateForInput(formData.birthDate)}
                  onChange={handleInputChange}
                  required
                />
                {errors.birthDate && <div className="error">{errors.birthDate}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg):</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 3.5"
                  />
                  {errors.weight && <div className="error">{errors.weight}</div>}
                </div>

                <div className="form-group">
                  <label>Height (cm):</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 50"
                  />
                  {errors.height && <div className="error">{errors.height}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Head Circumference (cm):</label>
                <input
                  type="text"
                  name="headCircumference"
                  value={formData.headCircumference}
                  onChange={handleInputChange}
                  placeholder="e.g., 35"
                />
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
