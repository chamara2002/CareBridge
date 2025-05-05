import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import './viewallmother.css';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const ViewAllMother = () => {
  const [mothers, setMothers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch all mothers from the backend API
    const fetchMothers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Mother/get-all-mother');
        setMothers(response.data);
      } catch (error) {
        console.error('Error fetching mothers:', error);
      }
    };

    fetchMothers();
  }, []);

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter mothers based on the search query
  const filteredMothers = mothers.filter((mother) =>
    mother.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.motherId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle delete action with confirmation dialog
  const handleDelete = async (motherId) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this mother?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await axios.delete(`http://localhost:5000/api/Mother/delete-mother/${motherId}`);
              
              // If deletion is successful, update the state by removing the mother from the list
              if (response.status === 200) {
                setMothers(mothers.filter((mother) => mother.motherId !== motherId));
                toast.success('Mother deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting mother:', error);
              alert('Error deleting mother');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  return (
    <div className='view-all-newbron'>
      {/* <Navbar />
      <BottomNav /> */}
      <br />
      <div className="view-all-mother" style={{ marginLeft: '150px', marginRight: '150px' }}>
        <h2 className="title-mother-reg">View All new Bron</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name or Mother ID"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-bar"
        />

        {/* Table displaying mothers data */}
        <table className="mother-table">
          <thead>
            <tr>
              <th>Mother ID</th>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMothers.map((mother) => (
              <tr key={mother._id}>
                <td>{mother.motherId}</td>
                <td>{mother.name}</td>
                <td>{mother.birthDate}</td>
                <td>{mother.weight}</td>
                <td>{mother.height}</td>
                <td>
                  <div className="action-icons">
                    <Link to={`/view-single/${mother.motherId}`}>
                      <FaEye className="action-icon" title="View" />
                    </Link>
                    <Link to={`/update/${mother.motherId}`}>
                      <FaEdit className="action-icon" title="Edit" />
                    </Link>
                    <FaTrashAlt
                      className="action-icon"
                      title="Delete"
                      onClick={() => handleDelete(mother.motherId)} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />

      {/* <Footer /> */}
    </div>
  );
};

export default ViewAllMother;
