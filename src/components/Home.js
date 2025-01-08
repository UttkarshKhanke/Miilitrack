import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase"; // Firebase initialization
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; // Firestore methods

function Home() {
  const [spot, setSpot] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [safeSpots, setSafeSpots] = useState([]);
  const [showAddSpotForm, setShowAddSpotForm] = useState(false);

  // Add a new safe spot to Firestore
  const addSafeSpot = async () => {
    try {
      const docRef = await addDoc(collection(db, "safe_spots"), {
        name: spot,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
      alert("Safe Spot Added");
      setSpot("");
      setLat("");
      setLng("");
      fetchSafeSpots(); // Refresh the list
      setShowAddSpotForm(false); // Hide the form after adding
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Remove a safe spot from Firestore
  const removeSafeSpot = async (id) => {
    try {
      await deleteDoc(doc(db, "safe_spots", id));
      alert("Safe Spot Removed");
      fetchSafeSpots(); // Refresh the list
    } catch (e) {
      console.error("Error removing document: ", e);
    }
  };

  // Fetch all safe spots from Firestore
  const fetchSafeSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "safe_spots"));
      const spots = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSafeSpots(spots);
    } catch (e) {
      console.error("Error fetching safe spots: ", e);
    }
  };

  // Fetch safe spots when the component mounts
  useEffect(() => {
    fetchSafeSpots();
  }, []);

  return (
    <div className="Home">
      <h1>Welcome to Militrack</h1>
      
      <div className="home-buttons">
      <Link to="/SafeSpots">
            <button>Safe Spots</button>
          </Link>
          <Link to="/BestRouteFinder">
            <button>Best Route Finder</button>
          </Link>
          <Link to="/SupplyManagement">
            <button>Supply Management</button>
          </Link>
          <Link to="/GeoLocationMonitoring">
            <button>Geo Location Monitoring</button>
          </Link>
          <Link to="/TroopsMonitoring">
            <button>Troops Monitoring</button>
          </Link>
        </div>
      </div>
  );
}

export default Home;
