import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <a href="/" className="logo">CareBridge</a>
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
