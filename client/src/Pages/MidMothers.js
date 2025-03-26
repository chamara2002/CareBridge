// MidMothers.js
import { useEffect, useState } from 'react';
import MidMenu from './MidMenu';
import './MidMothers.css';

const MothersManagement = () => {
  const [mothers, setMothers] = useState([]);

  useEffect(() => {
    setMothers([
      { name: 'Alice', age: 30, status: 'Pregnant' },
      { name: 'Eve', age: 28, status: 'Postpartum' },
    ]);
  }, []);

  return (
    <MidMenu>
      <div className="mothers-management">
        <h2>Mothers Management</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mothers.map((mother, index) => (
              <tr key={index}>
                <td>{mother.name}</td>
                <td>{mother.age}</td>
                <td>{mother.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MidMenu>
  );
};

export default MothersManagement;