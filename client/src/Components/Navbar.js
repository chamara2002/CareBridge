import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check for token on page load to persist login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole"); // Store role in localStorage during login
    if (token) {
      setUser({ loggedIn: true, role: userRole });
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    localStorage.removeItem("userRole"); // Remove role from storage
    setUser(null); // Clear user state
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

              <li>
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
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
