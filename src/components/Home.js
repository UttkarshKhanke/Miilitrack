import React from "react";
import { Link } from "react-router-dom";
import './Home.css'; // Assuming you are using a separate CSS file for styling
import homeimage from '../assets/homeimage.png';

function Home() {
  return (
    <div className="home-container">
      <div className="home-image-container">
        <img src={homeimage} alt="Militrack" className="homeimage" />
      </div>
      <h1 className="home-title">Welcome to Militrack</h1>

      {/* Home Navigation Buttons (all in the same line on large screens, stacked on smaller screens) */}
      <div className="home-buttons">
        <Link to="/SafeSpots" className="home-link">
          <button className="home-btn">Safe Spots</button>
        </Link>
        <Link to="/BestRouteFinder" className="home-link">
          <button className="home-btn">Best Route Finder</button>
        </Link>
        <Link to="/SupplyManagement" className="home-link">
          <button className="home-btn">Supply Management</button>
        </Link>
        <Link to="/GeoLocationMonitoring" className="home-link">
          <button className="home-btn">Geo Location Monitoring</button>
        </Link>
        <Link to="/TroopsMonitoring" className="home-link">
          <button className="home-btn">Troops Monitoring</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
