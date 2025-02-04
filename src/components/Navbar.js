import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Logout from "./Logout";
import "./Navbar.css"; // Import CSS file

const Navbar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">

      {/* Mobile Menu Toggle Button */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <ul className={menuOpen ? "nav-links open" : "nav-links"}>
        {user ? (
          <>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/SafeSpots" onClick={() => setMenuOpen(false)}>Safe Spots</Link></li>
            <li><Link to="/BestRouteFinder" onClick={() => setMenuOpen(false)}>Best Route Finder</Link></li>
            <li><Link to="/GeoLocationMonitoring" onClick={() => setMenuOpen(false)}>Geo Location</Link></li>
            <li><Link to="/TroopsMonitoring" onClick={() => setMenuOpen(false)}>Troop Monitoring</Link></li>
            <li><Link to="/SupplyManagement" onClick={() => setMenuOpen(false)}>Supply Management</Link></li>
            <li><Link to="/add-new-items" onClick={() => setMenuOpen(false)}>Add Items</Link></li>
            <li><Link to="/view-items" onClick={() => setMenuOpen(false)}>View Items</Link></li>
            <li><Link to="/transfer-items" onClick={() => setMenuOpen(false)}>Transfer Items</Link></li>
            <li><Logout /></li>
          </>
        ) : (
          <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
