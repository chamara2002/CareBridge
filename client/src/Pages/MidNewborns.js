// MidNewborns.js
import { useState, useEffect } from 'react';
import MidMenu from './MidMenu';
import './MidNewborns.css';

const NewbornManagement = () => {
  const [newborns, setNewborns] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    headCircumference: '',
    healthStatus: 'Healthy'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load sample data (replace with API call in real app)
    const sampleData = [
      { id: 1, name: 'Charlie', birthDate: '2025-03-01', weight: '3.2 kg', height: '48 cm', headCircumference: '34 cm', healthStatus: 'Healthy' },
      { id: 2, name: 'Liam', birthDate: '2025-03-05', weight: '3.5 kg', height: '50 cm', headCircumference: '35 cm', healthStatus: 'Healthy' }
    ];
    setNewborns(sampleData);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      // Update existing newborn
      setNewborns(newborns.map(newborn => 
        newborn.id === formData.id ? formData : newborn
      ));
    } else {
      // Add new newborn
      const newNewborn = {
        ...formData,
        id: Date.now() // Simple ID generation
      };
      setNewborns([...newborns, newNewborn]);
    }
    resetForm();
  };

  const handleEdit = (newborn) => {
    setFormData(newborn);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    setNewborns(newborns.filter(newborn => newborn.id !== id));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      birthDate: '',
      weight: '',
      height: '',
      headCircumference: '',
      healthStatus: 'Healthy'
    });
    setIsEditing(false);
  };

  return (
    <MidMenu>
      <div className="newborn-management">
        <h2>Newborn Management</h2>
        
        {/* Newborn Form */}
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
              />
            </div>
            
            <div className="form-group">
              <label>Birth Date:</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
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
              </div>
            </div>
            
            <div className="form-group">
              <label>Head Circumference (cm):</label>
              <input
                type="text"
                name="headCircumference"
                value={formData.headCircumference}
                onChange={handleInputChange}
              />
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
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Newborns Table */}
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
              {newborns.map((newborn) => (
                <tr key={newborn.id} className={`status-${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                  <td>{newborn.name}</td>
                  <td>{newborn.birthDate}</td>
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
                    <button onClick={() => handleDelete(newborn.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MidMenu>
  );
};

export default NewbornManagement;