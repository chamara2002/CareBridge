import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import HomePage from './Pages/HomePage';
import Dashboard from './Pages/Dashboard';
import MothersManagement from './Pages/MidMothers';
import NewbornManagement from './Pages/MidNewborns';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import MidVac from './Pages/MidVac';
import CreateAppointment from './Pages/AppointmentManagement/CreateAppointment'
import ManageAppointment from './Pages/AppointmentManagement/ManageAppointment'

const App = () => {
  const [user, setUser] = useState(null); // Track user login state

  const login = () => setUser(true); // Simulate login
  const logout = () => setUser(null); // Simulate logout

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
        <Route path="/createappointment" element={<CreateAppointment />} />
        <Route path="/manageappointment" element={<ManageAppointment />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
