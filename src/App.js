import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./components/Home";
import SafeSpots from "./components/SafeSpots";
import BestRouteFinder from "./components/BestRouteFinder"; // Placeholder component
import SupplyManagement from "./components/SupplyManagement"; // Placeholder component
import GeoLocationMonitoring from "./components/GeoLocationMonitoring"; // Placeholder component
import TroopsMonitoring from "./components/TroopsMonitoring"; // Placeholder component
import AddNewItems from "./components/AddNewItems"; // AddNewItems component
import TransferItems from "./components/TransferItems"; // TransferItems component
import ViewItems from "./components/ViewItems"; //ViewItems component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SafeSpots" element={<SafeSpots />} />
          <Route path="/BestRouteFinder" element={<BestRouteFinder />} />
          <Route path="/SupplyManagement" element={<SupplyManagement />} />
          <Route path="/GeoLocationMonitoring" element={<GeoLocationMonitoring />} />
          <Route path="/TroopsMonitoring" element={<TroopsMonitoring />} />
          
          {/* Add the new routes for AddNewItems and TransferItems */}
          <Route path="/view-items" element={<ViewItems />} />
          <Route path="/add-new-items" element={<AddNewItems />} />
          <Route path="/transfer-items" element={<TransferItems />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
