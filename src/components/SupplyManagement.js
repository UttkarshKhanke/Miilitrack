import React from "react";
import { useNavigate } from "react-router-dom";
import './SupplyManagement.css'; // Assuming you will create a CSS file for custom styles
import supplyImage from '../assets/supply-image.png'; // Import the image you want to use

function SupplyManagement() {
  const navigate = useNavigate();

  return (
    <div className="supply-management-container">
      {/* Image */}
      <img src={supplyImage} alt="Supply Management" className="supply-image" />

      <h1 className="heading">Supply Management</h1>

      <div className="buttons-container">
        <button
          className="btn add-items-btn"
          onClick={() => navigate("/add-new-items")}
        >
          Add New Items
        </button>
        <button
          className="btn transfer-items-btn"
          onClick={() => navigate("/transfer-items")}
        >
          Transfer Items
        </button>
      </div>
    </div>
  );
}

export default SupplyManagement;
