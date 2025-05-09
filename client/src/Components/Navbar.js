import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from 'react-icons/fa';
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use logout from context
  const handleLogout = () => {
    logout();
    window.location.href = "/"; // Redirect to home
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          CareBridge
        </Link>

        {/* Mobile menu toggle */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Navigation links */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Service">Services</Link>
          </li>
          <li>
            <Link to="/Contact">Contact</Link>
          </li>

          {/* Conditionally show Dashboard and Logout if logged in */}
          {user ? (
            <>
              {/* Role-based dashboard link */}
              {user.role === "mother" && (
                <li>
                  <Link to="/Mother/MotherDashboard">Mother Dashboard</Link>
                </li>
              )}
              {user.role === "mother" && (
                <li>
                  <Link to="/AIMoodTracker">Mood Tracker</Link>
                </li>
              )}
              {user.role === "midwife" && (
                <li>
                  <Link to="/dashboard">Midwife Dashboard</Link>
                </li>
              )}
              {user.role === "admin" && (
                <li>
                  <Link to="/admin-dashboard">Admin Dashboard</Link>
                </li>
              )}

              <li className="profile-menu-container" ref={dropdownRef}>
                <button 
                  className="profile-menu-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <FaUserCircle />
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)}>My Profile</Link>
                    <button onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}>Logout</button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
