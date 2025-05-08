import React from 'react';
import MidMenu from './MidMenu';
import './Dashboard.css';

const Dashboard = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const username = localStorage.getItem('name') || 'Midwife';

  return (
    <MidMenu>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-card">
          <h1 className="dashboard-title">Welcome, {username}</h1>
          <p className="dashboard-subtitle">Today is {today}</p>
        </div>
      </div>
    </MidMenu>
  );
};

export default Dashboard;
