import { useState, useEffect } from 'react';
import axios from 'axios';
import MidMenu from './MotherMenu';
import './NewbornVaccines.css';

const MidVac = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [newborns, setNewborns] = useState([]); // New state for storing newborns
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    newbornId: '',
    vaccineName: '',
    scheduledDate: '',
    status: 'Scheduled',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch vaccinations
  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/midvac');
        setVaccinations(response.data);
      } catch (error) {
        console.error('Error fetching vaccinations:', error);
      }
    };
    fetchVaccinations();
  }, []);

  // Fetch newborns to populate the select dropdown
  useEffect(() => {
    const fetchNewborns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/midnewborns');
        setNewborns(response.data); // Assuming this API returns an array of newborns
      } catch (error) {
        console.error('Error fetching newborns:', error);
      }
    };
    fetchNewborns();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const { newbornId, vaccineName, scheduledDate } = formData;
    
    if (!newbornId) newErrors.newbornId = 'Newborn ID is required';
    if (!vaccineName) newErrors.vaccineName = 'Vaccine name is required';
    if (!scheduledDate) newErrors.scheduledDate = 'Vaccination date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/midvac/${formData.id}`, formData);
        setVaccinations(vaccinations.map((vac) => vac.id === formData.id ? formData : vac));
      } else {
        const response = await axios.post('http://localhost:5000/api/midvac', formData);
        setVaccinations([...vaccinations, response.data]);
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving vaccination:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      newbornId: '',
      vaccineName: '',
      scheduledDate: '',
      status: 'Scheduled',
    });
    setIsEditing(false);
    setErrors({});
  };

  const filteredVaccinations = vaccinations.filter(vac => 
    vac.newbornId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MidMenu>
      <div className="vaccination-management">
        <h2>Vaccination Arrangement</h2>
        <div className="top-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by newborn or vaccine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {showForm && (
          <div className="vaccination-form">
            <h3>{isEditing ? 'Edit Vaccination' : 'Add Vaccination'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Newborn ID:</label>
                <select
                  name="newbornId"
                  value={formData.newbornId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Newborn</option>
                  {newborns.map((newborn) => (
                    <option key={newborn._id} value={newborn._id}>
                      {newborn.name}
                    </option>
                  ))}
                </select>
                {errors.newbornId && <div className="error">{errors.newbornId}</div>}
              </div>
              <div className="form-group">
                <label>Vaccine Name:</label>
                <input type="text" name="vaccineName" value={formData.vaccineName} onChange={handleInputChange} required />
                {errors.vaccineName && <div className="error">{errors.vaccineName}</div>}
              </div>
              <div className="form-group">
                <label>Vaccination Date:</label>
                <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleInputChange} required />
                {errors.scheduledDate && <div className="error">{errors.scheduledDate}</div>}
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="vaccination-table">
          <table>
            <thead>
              <tr>
                <th>Newborn ID</th>
                <th>Vaccine Name</th>
                <th>Vaccination Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccinations.map((vac) => (
                <tr key={vac._id} className={`status-${vac.status.toLowerCase()}`}>
                  <td>{vac.newbornId ? vac.newbornId.name : 'No Name'}</td>
                  <td>{vac.vaccineName}</td>
                  <td>{new Date(vac.scheduledDate).toLocaleDateString()}</td>
                  <td>{vac.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MidMenu>
  );
};

export default MidVac;
