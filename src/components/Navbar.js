import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // State to handle mobile menu

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">

      {/* Mobile Menu Toggle Button */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/SafeSpots">Safe Spots</Link></li>
            <li><Link to="/BestRouteFinder">Best Route Finder</Link></li>
            <li><Link to="/GeoLocationMonitoring">GeoLocation</Link></li>
            <li><Link to="/TroopsMonitoring">Troops Monitoring</Link></li>
            <li><Link to="/SupplyManagement">Supply Management</Link></li>

            {/* Show Manage Users only for Admin */}
            {user.role === "admin" && (
              <li><Link to="/ManageUsers">Manage Users</Link></li>
            )}

            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
