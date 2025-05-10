import { useState, useEffect } from 'react';
import axios from 'axios';
import MidMenu from './MidMenu';
import './MidNewborns.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const NewbornManagement = () => {
  const [newborns, setNewborns] = useState([]);
  const [mothers, setMothers] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    headCircumference: '',
    healthStatus: 'Healthy',
    motherId: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({}); // To store form validation errors
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNewborns, setFilteredNewborns] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    const fetchNewborns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/midnewborns');
        setNewborns(response.data);
      } catch (error) {
        console.error('Error fetching newborns:', error);
      }
    };
    
    // Fetch mothers for the dropdown
    const fetchMothers = async () => {
      try {
        // Adjust this endpoint to match your actual API for fetching mothers
        const response = await axios.get('http://localhost:5000/api/users/mothers');
        setMothers(response.data);
      } catch (error) {
        console.error('Error fetching mothers:', error);
        // For demo purposes, create some sample mothers if the endpoint doesn't exist
        setMothers([
          { _id: '65f298d4f94397b9a839d768', name: 'Mother 1' },
          { _id: '65f298d4f94397b9a839d769', name: 'Mother 2' },
          { _id: '65f298d4f94397b9a839d770', name: 'Mother 3' }
        ]);
      }
    };
    
    fetchNewborns();
    fetchMothers();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    const { name, birthDate, weight, height, headCircumference, motherId } = formData;

    // Name: Cannot be empty and should have at least 2 characters
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name should be at least 2 characters long';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
      newErrors.name = 'Name should contain only letters, spaces, and common punctuation';
    }

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

    // Head Circumference: Should be a positive number if provided
    if (headCircumference && (isNaN(headCircumference) || Number(headCircumference) <= 0)) {
      newErrors.headCircumference = 'Head circumference must be a positive number';
    } else if (headCircumference && Number(headCircumference) > 60) {
      newErrors.headCircumference = 'Head circumference appears to be too large (normal range is 32-38 cm for newborns)';
    }
    
    // Mother ID validation - required when adding new newborn
    if (!isEditing && !motherId) {
      newErrors.motherId = 'Mother ID is required';
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
        const dataToSend = { ...formData };
        delete dataToSend.motherId; // Don't send motherId when updating
        
        await axios.put(`http://localhost:5000/api/midnewborns/${formData._id}`, dataToSend);
        setNewborns(newborns.map((newborn) =>
          newborn._id === formData._id ? { ...newborn, ...dataToSend } : newborn
        ));
      } else {
        const response = await axios.post('http://localhost:5000/api/midnewborns', formData);
        setNewborns([...newborns, response.data]);
      }
      resetForm();
      setShowForm(false); // Hide form after submit
    } catch (error) {
      console.error('Error saving newborn:', error);
      alert('Error saving newborn: ' + (error.response?.data?.msg || error.message));
    }
  };

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0]; // Extract YYYY-MM-DD
  };

  const handleEdit = (newborn) => {
    setFormData({
      ...newborn,
      birthDate: formatDateForInput(newborn.birthDate), // Format date for input
    });
    setIsEditing(true);
    setShowForm(true); // Show the form when editing
  };

  const handleDelete = async (id, name) => {
    // Ask for confirmation before deleting
    if (!window.confirm(`Are you sure you want to delete the record for ${name}?`)) {
      return; // If user clicks Cancel, do nothing
    }
    
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
      id: '',
      name: '',
      birthDate: '',
      weight: '',
      height: '',
      headCircumference: '',
      healthStatus: 'Healthy',
      motherId: '',
    });
    setIsEditing(false);
    setErrors({}); // Clear errors when resetting the form
  };

  // Show the form to add a new newborn
  const handleAddNewborn = () => {
    resetForm(); // Reset the form fields before showing the form
    setShowForm(true); // Show the form for adding a new newborn
    setIsEditing(false); // Ensure we're in the "add" state
  };

  // Hide the form when "Cancel" is clicked
  const handleCancel = () => {
    resetForm(); // Reset form data and close the form
    setShowForm(false); // Hide the form when cancel is clicked
  };

  const generatePDF = (useFiltered = false) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Newborn Records Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add search criteria if filtering was applied
    if (useFiltered && searchTerm) {
      doc.text(`Search criteria: "${searchTerm}"`, 14, 40);
    }

    // Determine which data to use
    const recordsToUse = useFiltered ? filteredNewborns : newborns;

    // Create table data
    const tableData = recordsToUse.map(newborn => [
      newborn.name,
      formatDateForInput(newborn.birthDate),
      `${newborn.weight} kg`,
      `${newborn.height} cm`,
      `${newborn.headCircumference} cm`,
      newborn.healthStatus
    ]);

    // Add table using autoTable
    autoTable(doc, {
      head: [['Name', 'Birth Date', 'Weight', 'Height', 'Head Circ.', 'Status']],
      body: tableData,
      startY: useFiltered && searchTerm ? 50 : 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save PDF with appropriate filename
    const filename = useFiltered && searchTerm
      ? `newborn-records-${searchTerm.replace(/[^a-z0-9]/gi, '-')}.pdf`
      : 'newborn-records.pdf';
    
    doc.save(filename);
  };

  // Add search functionality
  useEffect(() => {
    const results = newborns.filter(newborn =>
      newborn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newborn.healthStatus.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNewborns(results);
  }, [searchTerm, newborns]);

  return (
    <MidMenu>
      <div className="newborn-management">
        <h2>Newborn Management</h2>

        <div className="top-controls">
          <div className="action-buttons">
            <button onClick={handleAddNewborn} className="btn-primary">
              Add Newborn
            </button>
            <button onClick={() => generatePDF(false)} className="btn-secondary">
              Generate PDF
            </button>
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or health status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => generatePDF(true)} 
                className="search-download-btn"
                title="Download filtered results">
                Download Results
              </button>
            )}
          </div>
        </div>

        {/* Newborn Form - Only shows if adding or editing a newborn */}
        {showForm && (
          <div className="newborn-form">
            <h3>{isEditing ? 'Edit Newborn' : 'Add Newborn'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  pattern="[a-zA-Z\s.'-]+"
                  title="Name should contain only letters, spaces, and common punctuation"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              {/* Mother ID selection - only show when adding new newborns */}
              {!isEditing && (
                <div className="form-group">
                  <label>Mother:</label>
                  <select
                    name="motherId"
                    value={formData.motherId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a mother</option>
                    {mothers.map(mother => (
                      <option key={mother._id} value={mother._id}>
                        {mother.name || `Mother ID: ${mother._id}`}
                      </option>
                    ))}
                  </select>
                  {errors.motherId && <div className="error">{errors.motherId}</div>}
                </div>
              )}

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
                  pattern="[0-9]*\.?[0-9]+"
                  title="Please enter a valid positive number"
                />
                {errors.headCircumference && <div className="error">{errors.headCircumference}</div>}
              </div>

              <div className="form-group">
                <label>Health Status:</label>
                <select
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleInputChange}
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Critical">Critical</option>
                </select>
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

        {/* Newborn Records Table */}
        <div className="newborns-table">
          <h3>Newborn Records</h3>
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
              {filteredNewborns.map((newborn) => {
                
                return (
                  <tr key={newborn._id} className={`status-${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                    <td>{newborn.name}</td>
                    <td>{formatDateForInput(newborn.birthDate)}</td>
                    <td>{newborn.weight}</td>
                    <td>{newborn.height}</td>
                    <td>{newborn.headCircumference}</td>
                    <td>
                      <span className={`status-badge ${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                        {newborn.healthStatus}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => handleEdit(newborn)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(newborn._id, newborn.name)} className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MidMenu>
  );
};

export default NewbornManagement;
