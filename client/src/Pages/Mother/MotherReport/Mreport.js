import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import BottomNav from '../../../Components/MotherNavBottom/BottomNav';
import { jsPDF } from 'jspdf';
import SliderMother from '../../../Components/slide-mother/SliderMother';

const Mreport = () => {
  const [mothers, setMothers] = useState([]);

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


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };


  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Mother Report', 20, 20);
  
    let yOffset = 30;
  
    doc.setFontSize(12);
    doc.text('Mother ID', 20, yOffset);
    doc.text('Name', 60, yOffset);
    doc.text('Birth Date', 100, yOffset);
    doc.text('Weight', 140, yOffset);
    doc.text('Height', 180, yOffset);
    yOffset += 10;
  
    mothers.forEach((mother) => {
      const motherId = mother.motherId?.toString() || 'N/A';
      const name = mother.fullName || 'N/A';
      const birthDate = mother.dateOfBirth ? formatDate(mother.dateOfBirth) : 'N/A';
      const weight = mother.weight ? mother.weight.toString() : 'N/A';
      const height = mother.height ? mother.height.toString() : 'N/A';
  
      doc.text(motherId, 20, yOffset);
      doc.text(name, 60, yOffset);
      doc.text(birthDate, 100, yOffset);
      doc.text(weight, 140, yOffset);
      doc.text(height, 180, yOffset);
      yOffset += 10;
    });
  
    doc.save('mother_report.pdf');
  };
  
  return (
    <div>
      <Navbar />
      <SliderMother/>
      <br />
      <div className="view-all-mother" style={{ marginLeft: '150px', marginRight: '150px' }}>
        <h2 className="title-mother-reg">View All New Born</h2>

      
        <button className="btn-pdf" onClick={generatePDF}>Download PDF Report</button>


        <table className="mother-table">
          <thead>
            <tr>
            <th>Mother ID</th>
            <th>Full Name</th>
            <th>Birth Date</th>
            <th>Phone</th>
            <th>Blood Type</th>
            <th>Height</th>
            <th>Weight</th>
            <th>Pre-Pregnancy Weight</th>
            </tr>
          </thead>
          <tbody>
            {mothers.map((mother) => (
              <tr key={mother._id}>
              <td>{mother.motherId}</td>
              <td>{mother.fullName}</td>
              <td>{new Date(mother.dateOfBirth).toLocaleDateString()}</td>
              <td>{mother.phoneNumber}</td>
              <td>{mother.bloodType}</td>
              <td>{mother.height} cm</td>
              <td>{mother.weight} kg</td>
              <td>{mother.prePregnancyWeight} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default Mreport;
