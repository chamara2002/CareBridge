import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './Pages/HomePage';
import Dashboard from './Pages/Dashboard';
import MothersManagement from './Pages/MidMothers';
import NewbornManagement from './Pages/MidNewborns';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import MidVac from './Pages/MidVac';
import CreateAppointment from './Pages/AppointmentManagement/CreateAppointment';
import ManageAppointment from './Pages/AppointmentManagement/ManageAppointment';
import AppointmentHub from './Pages/AppointmentManagement/AppointmentHub';
import Service from './Pages/Service';
import Contact from './Pages/Contact';
import AIMoodTracker from './Pages/AIMoodTracker';
import MotherDashboard from './Pages/Mother/MotherDashboard'; 
import UserProfile from './Pages/UserProfile/UserProfile';
import ManageAppointments from './Pages/AppointmentManagement/ManageAppointmentMidwife';
import MotherDetails from './Pages/Mother/MotherDetails';
import MotherNewborns from './Pages/Mother/MotherNewborns';
import NewbornVaccines from './Pages/Mother/NewbornVaccines';
import AdminDashboard from './Pages/AdminDashboard'; // Import the new component
import { AuthProvider } from './context/AuthContext';

// Protected route component for role-based access
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/SignIn" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'mother') {
      return <Navigate to="/Mother/MotherDashboard" replace />;
    } else if (userRole === 'midwife') {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setUser(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => setUser(true);
  const logout = () => setUser(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} logout={logout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn login={login} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/MidMothers" element={<MothersManagement />} />
        <Route path="/MidNewborns" element={<NewbornManagement />} />
        <Route path="/MidVac" element={<MidVac />} />
        <Route path="/appointmenthub" element={<AppointmentHub />} />
        <Route path="/createappointment" element={<CreateAppointment />} />
        <Route path="/manageappointment" element={<ManageAppointment />} />
        <Route path="/Service" element={<Service />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/AIMoodTracker" element={<AIMoodTracker />} /> 
        <Route path="/Mother/MotherDashboard" element={<MotherDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/AppointmentManagement" element={<ManageAppointments />} />
        <Route path="/Mother/MotherDetails" element={<MotherDetails />} /> {/* Add the new route */}
        <Route path="/Mother/NewbornDetails" element={<MotherNewborns />} /> {/* New route for mother's newborns */}
        <Route path="/Mother/VaccineDetails" element={<NewbornVaccines />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
