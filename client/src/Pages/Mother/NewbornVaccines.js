import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MotherMenu from './MotherMenu';
import './MotherNewborns.css'; // Reusing the same CSS

const NewbornVaccines = () => {
  const { newbornId } = useParams();
  const [vaccinations, setVaccinations] = useState([]);
  const [newborn, setNewborn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the newborn details
        const newbornResponse = await axios.get(`http://localhost:5000/api/midnewborns/${newbornId}`);
        setNewborn(newbornResponse.data);
        
        // Fetch vaccinations for this newborn
        const vaccinationsResponse = await axios.get(`http://localhost:5000/api/midvac/newborn/${newbornId}`);
        setVaccinations(vaccinationsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load vaccination records. Please try again later.');
        setLoading(false);
      }
    };

    if (newbornId) {
      fetchData();
    }
  }, [newbornId]);

  return (
    <MotherMenu>
      <div className="mother-newborn-management">
        <h2>Vaccination Records</h2>
        
        {loading ? (
          <div className="loading-message">Loading vaccination data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {newborn && (
              <div className="newborn-details-header">
                <h3>{newborn.name}'s Vaccination Records</h3>
                <div className="newborn-summary">
                  <p><strong>Birth Date:</strong> {new Date(newborn.birthDate).toLocaleDateString()}</p>
                  <p><strong>Health Status:</strong> 
                    <span className={`status-badge status-${newborn.healthStatus.toLowerCase().replace(' ', '-')}`}>
                      {newborn.healthStatus}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="vaccination-records">
              {vaccinations.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Vaccine Name</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccinations.map((vaccine) => (
                      <tr key={vaccine._id} className={`status-${vaccine.status.toLowerCase()}`}>
                        <td>{vaccine.vaccineName}</td>
                        <td>{new Date(vaccine.scheduledDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${vaccine.status.toLowerCase()}`}>
                            {vaccine.status}
                          </span>
                        </td>
                        <td>{vaccine.notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data-message">
                  <p>No vaccination records found for this newborn.</p>
                  <p>Your midwife will add vaccinations during checkups.</p>
                </div>
              )}
            </div>

            <div className="back-button-container">
              <a href="/mother/newborndetails" className="btn-secondary">
                Back to Newborns
              </a>
            </div>
          </>
        )}
      </div>
    </MotherMenu>
  );
};

export default NewbornVaccines;
