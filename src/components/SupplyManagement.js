import React from "react";
import { useNavigate } from "react-router-dom";

function SupplyManagement() {
  const navigate = useNavigate(); // useNavigate instead of useHistory

  return (
    <div>
      <h1>Supply Management</h1>
      <div>
        <button onClick={() => navigate("/add-new-items")}>Add New Items</button>
        <button onClick={() => navigate("/transfer-items")}>Transfer Items</button>
      </div>
    </div>
  );
}

export default SupplyManagement;
