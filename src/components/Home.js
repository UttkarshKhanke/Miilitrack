import React from "react";
import './Home.css'; // Assuming you are using a separate CSS file for styling
import homeimage from '../assets/homeimage.png';

function Home() {
  return (
    <div className="home-container">
      <div className="home-image-container">
        <img src={homeimage} alt="Militrack" className="homeimage" />
      </div>
      <h1 className="home-title">Welcome to Miilitrack</h1>
    </div>
  );
}

export default Home;
