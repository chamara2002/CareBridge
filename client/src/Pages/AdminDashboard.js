import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data (you can use localStorage or context to manage auth state)
    localStorage.removeItem('user');
    navigate('/signin');  // Redirect to Sign In page
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to your dashboard, Admin!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
