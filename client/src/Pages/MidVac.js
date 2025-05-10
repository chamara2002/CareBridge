import { useState, useEffect } from 'react';
import axios from 'axios';
import MidMenu from './MidMenu';
import './MidVac.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch vaccinations
  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/midvac');
      setVaccinations(response.data);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    }
  };

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
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  // Utility function to check if date is valid
  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Utility function to check if date is in the past
  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };

  // Utility function to check if string contains only letters and spaces
  const isAlphaSpace = (str) => {
    return /^[A-Za-z\s]+$/.test(str);
  };

  const validateForm = () => {
    const newErrors = {};
    const { newbornId, vaccineName, scheduledDate } = formData;
    
    // Validate newbornId
    if (!newbornId) {
      newErrors.newbornId = 'Newborn ID is required';
    }
    
    // Validate vaccineName
    if (!vaccineName) {
      newErrors.vaccineName = 'Vaccine name is required';
    } else if (!isAlphaSpace(vaccineName)) {
      newErrors.vaccineName = 'Vaccine name should contain only letters and spaces';
    } else if (vaccineName.length < 2) {
      newErrors.vaccineName = 'Vaccine name should be at least 2 characters';
    } else if (vaccineName.length > 50) {
      newErrors.vaccineName = 'Vaccine name should not exceed 50 characters';
    }
    
    // Validate scheduledDate
    if (!scheduledDate) {
      newErrors.scheduledDate = 'Vaccination date is required';
    } else if (!isValidDate(scheduledDate)) {
      newErrors.scheduledDate = 'Please enter a valid date';
    } else if (isPastDate(scheduledDate) && !isEditing) {
      newErrors.scheduledDate = 'Vaccination date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/midvac/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/midvac', formData);
      }
      resetForm();
      setShowForm(false);
      // Fetch fresh data after submission
      await fetchVaccinations();
    } catch (error) {
      console.error('Error saving vaccination:', error);
    }
  };

  const handleEdit = (vaccination) => {
    setFormData({
      id: vaccination._id, // Ensure we're using _id from API
      newbornId: vaccination.newbornId._id, // Using newborn's _id
      vaccineName: vaccination.vaccineName,
      scheduledDate: vaccination.scheduledDate.split('T')[0],
      status: vaccination.status,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vaccination record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/midvac/${id}`);
        // Fetch fresh data after deletion
        await fetchVaccinations();
      } catch (error) {
        console.error('Error deleting vaccination:', error);
      }
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      id: '',
      newbornId: '',
      vaccineName: '',
      scheduledDate: today,
      status: 'Scheduled',
    });
    setIsEditing(false);
    setErrors({});
  };

  const filteredVaccinations = vaccinations.filter(vac => {
    const matchesSearch = (
      vac.newbornId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vac.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || vac.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVaccinations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVaccinations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('CareBridge', 14, 20);
      doc.setFontSize(14);
      doc.text('Vaccination Records Report', 14, 32);
  
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add report info
      doc.setFontSize(11);
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 50);
      doc.text(`Total Records: ${filteredVaccinations.length}`, 14, 58);
      doc.text(`Filtered Status: ${statusFilter === 'all' ? 'All' : statusFilter}`, 14, 66);
      if (searchTerm) {
        doc.text(`Search Term: "${searchTerm}"`, 14, 74);
      }
  
      const tableColumns = [
        "Newborn Name", 
        "Vaccine Name", 
        "Vaccination Date", 
        "Status",
        "Notes"
      ];
      
      const tableRows = filteredVaccinations.map(vac => [
        vac.newbornId?.name || 'N/A',
        vac.vaccineName,
        new Date(vac.scheduledDate).toLocaleDateString(),
        vac.status,
        getStatusNote(vac.status)
      ]);
  
      // Add table
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: searchTerm ? 82 : 75,
        styles: { 
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 40 }
        },
        didDrawPage: function(data) {
          // Add footer on each page
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            pageHeight - 10
          );
          doc.text(
            `CareBridge Healthcare - Confidential Document`,
            pageSize.width / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });
  
      // Save with a formatted filename
      const filename = `CareBridge_Vaccination_Records_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  const getStatusNote = (status) => {
    switch(status) {
      case 'Completed':
        return 'Vaccination successfully administered';
      case 'Scheduled':
        return 'Pending administration';
      case 'Missed':
        return 'Requires rescheduling';
      default:
        return '';
    }
  };

  return (
    <MidMenu>
      <div className="vaccination-management">
        <h2>Newborn Vaccination Management</h2>
        <div className="top-controls">
          <div className="filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by newborn or vaccine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
            </select>
            <button 
              onClick={generatePDF} 
              className="btn-export"
              title="Export filtered records to PDF"
            >
              Export Filtered Records
            </button>
          </div>
          <div className="button-container">
            <button onClick={() => setShowForm(true)} className="btn-primary">Add Vaccination</button>
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
                  className={errors.newbornId ? "input-error" : ""}
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
                <input 
                  type="text" 
                  name="vaccineName" 
                  value={formData.vaccineName} 
                  onChange={handleInputChange} 
                  className={errors.vaccineName ? "input-error" : ""}
                />
                {errors.vaccineName && <div className="error">{errors.vaccineName}</div>}
              </div>
              <div className="form-group">
                <label>Vaccination Date:</label>
                <input 
                  type="date" 
                  name="scheduledDate" 
                  value={formData.scheduledDate} 
                  onChange={handleInputChange} 
                  className={errors.scheduledDate ? "input-error" : ""}
                />
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
          <h3>Vaccination Records</h3>
          <table>
            <thead>
              <tr>
                <th>Newborn Name</th>
                <th>Vaccine Name</th>
                <th>Vaccination Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((vac) => (
                <tr key={vac._id} className={`status-${vac.status.toLowerCase()}`}>
                  <td>{vac.newbornId ? vac.newbornId.name : 'No Name'}</td>
                  <td>{vac.vaccineName}</td>
                  <td>{new Date(vac.scheduledDate).toLocaleDateString()}</td>
                  <td>{vac.status}</td>
                  <td>
                    <button onClick={() => handleEdit(vac)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(vac._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Add pagination controls */}
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="btn-page"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MidMenu>
  );
};

export default MidVac;
