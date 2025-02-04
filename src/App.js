import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./components/login";
import Home from "./components/Home";
import SafeSpots from "./components/SafeSpots";
import BestRouteFinder from "./components/BestRouteFinder";
import GeoLocationMonitoring from "./components/GeoLocationMonitoring";
import TroopsMonitoring from "./components/TroopsMonitoring";
import SupplyManagement from "./components/SupplyManagement";
import AddNewItems from "./components/AddNewItems";
import ViewItems from "./components/ViewItems";
import TransferItems from "./components/TransferItems"

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Route (Login Page) */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Requires Authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/SafeSpots" element={<SafeSpots />} />
            <Route path="/BestRouteFinder" element={<BestRouteFinder />} />
            <Route path="/GeoLocationMonitoring" element={<GeoLocationMonitoring />} />
            <Route path="/TroopsMonitoring" element={<TroopsMonitoring />} />
            <Route path="/SupplyManagement" element={<SupplyManagement />} />
            <Route path="/add-new-items" element={<AddNewItems />} />
            <Route path="/view-items" element={<ViewItems />} />
            <Route path="/transfer-items" element={<TransferItems />} />
          </Route>

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
