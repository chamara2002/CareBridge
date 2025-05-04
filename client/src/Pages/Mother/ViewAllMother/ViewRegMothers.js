import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import BottomNav from '../../../Components/MotherNavBottom/BottomNav';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import SliderMother from '../../../Components/slide-mother/SliderMother';

const ViewRegMothers = () => {
  const [mothers, setMothers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMothers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get-all-registeredmother');
        setMothers(response.data);
      } catch (error) {
        console.error('Error fetching mothers:', error);
      }
    };

    fetchMothers();
  }, []);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMothers = mothers.filter((mother) => 
    (mother.fullName && mother.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (mother.motherId && mother.motherId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  const handleDelete = async (motherId) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this mother?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await axios.delete(`http://localhost:5000/api/delete-registeredmother/${motherId}`);
              
              
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
      <Navbar />
      <SliderMother/>
      <br />
      <div className="view-all-mothers">
      <h2 className="title-mother-reg">View All Mothers</h2>

      <input
        type="text"
        placeholder="Search by name or Mother ID"
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-bar"
      />

      <table className="mother-table">
        <thead>
          <tr>
            <th>Mother ID</th>
            <th>Full Name</th>
            <th>Birth Date</th>
            <th>Phone</th>
            <th>BloodType</th>
            <th>Height</th>
            <th>Weight</th>
            <th>Pre-Pregnancy Weight</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredMothers.map((mother) => (
            <tr key={mother._id}>
              <td>{mother.motherId}</td>
              <td>{mother.fullName}</td>
              <td>{new Date(mother.dateOfBirth).toLocaleDateString()}</td>
              <td>{mother.phoneNumber}</td>
              <td>{mother.bloodType}</td>
              <td>{mother.height} cm</td>
              <td>{mother.weight} kg</td>
              <td>{mother.prePregnancyWeight} kg</td>
              <td>
                <div className="action-icons">
                  <Link to={`/SingleMother/${mother.motherId}`}>
                    <FaEye className="action-icon" title="View" />
                  </Link>
                  <Link to={`/updatereg/${mother.motherId}`}>
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

      <Footer />
    </div>
  );
};

export default ViewRegMothers;
