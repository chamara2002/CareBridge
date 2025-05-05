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
import Service from './Pages/Service';
import Contact from './Pages/Contact';
import AIMoodTracker from './Pages/AIMoodTracker';
import MotherDashboard from './Pages/Mother/MotherDashboard'; 

import AddMother from './Pages/NewBorn/NewBoarnForm/AddMother';
import MotherHome from './Pages/NewBorn/NewbornHome/MotherHome';
import Motherreport from './Pages/NewBorn/NewBornReport/Motherreport';
import UpdateMother from './Pages/NewBorn/Updatenewborn/UpdateMother';
import ViewMother from './Pages/NewBorn/viewSingleBron/ViewMother';
import ViewAllMother from './Pages/NewBorn/viewAllNewborn/ViewAllMother';

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
        <Route path="/Service" element={<Service />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/AIMoodTracker" element={<AIMoodTracker />} /> 

        
      <Route path="/rr" element={<HomePage />} />
      <Route path="/mother-home" element={<MotherHome />} />
      <Route path="/AddMother" element={<AddMother />} />
      <Route path="/ViewAllMother" element={<ViewAllMother />} />
      <Route path="/update/:motherId" element={<UpdateMother />} />
      <Route path="/view-single/:motherId" element={<ViewMother/>} />
      <Route path="/report-generation" element={<Motherreport/>} />
        <Route path="/Mother/MotherDashboard" element={<MotherDashboard />} />   
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
