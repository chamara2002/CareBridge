import React from 'react';
import MotherMenu from './MotherMenu';
import './MotherDashboard.css';

const MotherDash = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const username = localStorage.getItem('name') || 'Mother';

  return (
    <MotherMenu>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-card">
          <h1 className="dashboard-title">Welcome, {username}</h1>
          <p className="dashboard-subtitle">Today is {today}</p>
        </div>
      </div>
    </MotherMenu>
  );
};

export default MotherDash;
