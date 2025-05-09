import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './report.css';

const Motherreport = () => {
  const [mothers, setMothers] = useState([]);

  useEffect(() => {
    
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
      doc.text(mother.motherId, 20, yOffset);
      doc.text(mother.name, 60, yOffset);
      doc.text(formatDate(mother.birthDate), 100, yOffset); 
      doc.text(mother.weight.toString(), 140, yOffset);
      doc.text(mother.height.toString(), 180, yOffset);
      yOffset += 10;
    });

   
    doc.save('mother_report.pdf');
  };

  return (
    <div className='newbron-report'>
      {/* <Navbar />
      <BottomNav /> */}
      <br />
      <div className="view-all-mother" style={{ marginLeft: '150px', marginRight: '150px' }}>
        <h2 className="title-mother-reg">View All New Born</h2>

      
        <button className="btn-pdf" onClick={generatePDF}>Download PDF Report</button>


        <table className="mother-table">
          <thead>
            <tr>
              <th>Mother ID</th>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Weight</th>
              <th>Height</th>
            </tr>
          </thead>
          <tbody>
            {mothers.map((mother) => (
              <tr key={mother._id}>
                <td>{mother.motherId}</td>
                <td>{mother.name}</td>
                <td>{formatDate(mother.birthDate)}</td> 
                <td>{mother.weight}</td>
                <td>{mother.height}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <Footer /> */}
    </div>
  );
};