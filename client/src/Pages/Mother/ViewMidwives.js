import { useState, useEffect } from 'react';
import axios from 'axios';
import MotherMenu from './MotherMenu';
import './ViewMidwives.css';

const ViewMidwives = () => {
  const [midwives, setMidwives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMidwife, setSelectedMidwife] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMidwives();
  }, []);

  const fetchMidwives = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/midwives');
      console.log('Midwives data received:', response.data);
      setMidwives(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching midwives:', err);
      const errorMessage = err.response ? 
        `Error: ${err.response.status} - ${err.response.data.message || 'Server error'}` : 
        'Failed to connect to server. Please check your connection and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleMidwifeClick = (midwife) => {
    setSelectedMidwife(midwife);
    setIsModalOpen(true);
  };

  // Filter midwives based on search query
  const filteredMidwives = midwives.filter(midwife => 
    midwife.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    midwife.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    midwife.mohBranch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    midwife.serviceNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MotherMenu>
      <div className="midwives-container">
        <h2>Available Midwives</h2>
        
        <div className="midwives-controls">
          <div className="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, branch or service number"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading midwives data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="midwives-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>MOH Branch</th>
                  <th>Service No.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMidwives.length > 0 ? (
                  filteredMidwives.map((midwife) => (
                    <tr key={midwife._id}>
                      <td>{midwife.name || 'N/A'}</td>
                      <td>{midwife.email || 'N/A'}</td>
                      <td>{midwife.mohBranch || 'N/A'}</td>
                      <td>{midwife.serviceNo || 'N/A'}</td>
                      <td>
                        <button onClick={() => handleMidwifeClick(midwife)} className="btn-view">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-results">No midwives found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Midwife Details Modal */}
        {isModalOpen && selectedMidwife && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="close-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="modal-title">Midwife Details</h2>
              
              <div className="midwife-details">
                <div className="detail-group">
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {selectedMidwife.name || 'Not provided'}</p>
                  <p><strong>Email:</strong> {selectedMidwife.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedMidwife.phoneNumber || 'Not provided'}</p>
                  <p><strong>NIC:</strong> {selectedMidwife.nic || 'Not provided'}</p>
                </div>
                
                <div className="detail-group">
                  <h3>Professional Information</h3>
                  <p><strong>Service Number:</strong> {selectedMidwife.serviceNo || 'Not provided'}</p>
                  <p><strong>MOH Branch:</strong> {selectedMidwife.mohBranch || 'Not provided'}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
                <a href={`/createappointment?midwife=${selectedMidwife._id}`} className="btn-primary">
                  Schedule Appointment
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotherMenu>
  );
};

export default ViewMidwives;
