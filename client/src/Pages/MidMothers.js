import { useEffect, useState } from 'react';
import axios from 'axios';
import MidMenu from './MidMenu';
import './MidMothers.css';

const MothersManagement = () => {
  const [mothers, setMothers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMother, setSelectedMother] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motherNewbornCounts, setMotherNewbornCounts] = useState({});

  useEffect(() => {
    fetchMothers();
  }, []);

  useEffect(() => {
    // Fetch newborn counts for each mother
    const fetchNewbornCounts = async () => {
      try {
        // Only fetch if we have mothers loaded
        if (mothers.length > 0) {
          const counts = {};
          
          // For performance, we could create a separate API endpoint to get all counts at once
          // But for now, we'll make individual requests
          for (const mother of mothers) {
            const response = await axios.get(`http://localhost:5000/api/midnewborns/mother/${mother._id}`);
            counts[mother._id] = response.data.length;
          }
          
          setMotherNewbornCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching newborn counts:', error);
      }
    };
    
    fetchNewbornCounts();
  }, [mothers]);

  const fetchMothers = async () => {
    try {
      setLoading(true);
      console.log('Fetching mothers data...');
      const response = await axios.get('http://localhost:5000/api/users/mothers');
      console.log('Mothers data received:', response.data);
      setMothers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching mothers:', err);
      // More detailed error message
      const errorMessage = err.response ? 
        `Error: ${err.response.status} - ${err.response.data.message || 'Server error'}` : 
        'Failed to connect to server. Please check your connection and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleMotherClick = (mother) => {
    setSelectedMother(mother);
    setIsModalOpen(true);
  };

  // Filter mothers based on search query
  const filteredMothers = mothers.filter(mother => 
    mother.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.nic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.villageCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MidMenu>
      <div className="mothers-management">
        <h2>Mothers Management</h2>
        
        <div className="mothers-controls">
          <div className="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, NIC or village code"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading mothers data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="mothers-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>NIC</th>
                  <th>Village Code</th>
                  <th>Status</th>
                  <th>Newborns</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMothers.length > 0 ? (
                  filteredMothers.map((mother) => (
                    <tr key={mother._id}>
                      <td>{`${mother.firstName || ''} ${mother.lastName || ''}`}</td>
                      <td>{mother.email || 'N/A'}</td>
                      <td>{mother.phoneNumber || 'N/A'}</td>
                      <td>{mother.nic || 'N/A'}</td>
                      <td>{mother.villageCode || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${mother.pregnancyStatus ? `status-${mother.pregnancyStatus.toLowerCase()}` : 'status-unknown'}`}>
                          {mother.pregnancyStatus || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="newborn-badge">
                          {motherNewbornCounts[mother._id] || 0} newborn(s)
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleMotherClick(mother)} className="btn-view">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">No mothers found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mother Details Modal */}
        {isModalOpen && selectedMother && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="close-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="modal-title">Mother Details</h2>
              
              <div className="mother-details">
                <div className="detail-group">
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {`${selectedMother.firstName || ''} ${selectedMother.lastName || ''}`}</p>
                  <p><strong>Email:</strong> {selectedMother.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedMother.phoneNumber || 'Not provided'}</p>
                  <p><strong>NIC:</strong> {selectedMother.nic || 'Not provided'}</p>
                  <p><strong>Village Code:</strong> {selectedMother.villageCode || 'Not provided'}</p>
                  <p><strong>Address:</strong> {selectedMother.address || 'Not provided'}</p>
                </div>
                
                <div className="detail-group">
                  <h3>Health Information</h3>
                  <p><strong>Pregnancy Status:</strong> {selectedMother.pregnancyStatus || 'Unknown'}</p>
                  <p><strong>Due Date:</strong> {selectedMother.dueDate ? new Date(selectedMother.dueDate).toLocaleDateString() : 'Not provided'}</p>
                  <p><strong>Blood Group:</strong> {selectedMother.bloodGroup || 'Not provided'}</p>
                </div>

                <div className="detail-group">
                  <h3>Emergency Contact</h3>
                  <p><strong>Name:</strong> {selectedMother.emergencyContact?.name || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedMother.emergencyContact?.phone || 'Not provided'}</p>
                  <p><strong>Relationship:</strong> {selectedMother.emergencyContact?.relationship || 'Not provided'}</p>
                </div>

                <div className="detail-group">
                  <h3>Husband/Partner Details</h3>
                  <p><strong>Name:</strong> {selectedMother.husbandDetails?.name || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedMother.husbandDetails?.phone || 'Not provided'}</p>
                  <p><strong>Occupation:</strong> {selectedMother.husbandDetails?.occupation || 'Not provided'}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
                <a href={`/appointments/mother/${selectedMother._id}`} className="btn-primary">
                  View Appointments
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </MidMenu>
  );
};

export default MothersManagement;