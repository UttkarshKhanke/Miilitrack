import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import "./BestRouteFinder.css";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

function BestRouteFinder() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [safeSpots, setSafeSpots] = useState([]);
  const [connections, setConnections] = useState({});
  const [route, setRoute] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");
    const unsubscribeSpots = onValue(safeSpotsRef, (snapshot) => {
      const data = snapshot.val();
      const spots = data
        ? Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            latitude: data[key].latitude,
            longitude: data[key].longitude,
          }))
        : [];
      setSafeSpots(spots);
    });

    const connectionsRef = ref(db, "connections");
    const unsubscribeConnections = onValue(connectionsRef, (snapshot) => {
      const data = snapshot.val();
      setConnections(data || {});
    });

    return () => {
      unsubscribeSpots();
      unsubscribeConnections();
    };
  }, []);

  const findRoute = () => {
    if (!startLocation || !endLocation)
      return alert("Please select both start and end locations.");

    const queue = [[startLocation]];
    const visited = new Set();
    let totalDist = 0;

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endLocation) {
        setRoute(path);

        totalDist = path.reduce((accum, curr, index) => {
          if (index === path.length - 1) return accum;
          const nextNode = path[index + 1];
          const currentNodeData = safeSpots.find(
            (spot) => spot.name === curr
          );
          const nextNodeData = safeSpots.find((spot) => spot.name === nextNode);
          if (currentNodeData && nextNodeData) {
            const distance = calculateDistance(
              currentNodeData.latitude,
              currentNodeData.longitude,
              nextNodeData.latitude,
              nextNodeData.longitude
            );
            return accum + distance;
          }
          return accum;
        }, 0);

        setTotalDistance(totalDist);
        return;
      }

      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = connections[node] || [];
        neighbors.forEach((neighbor) => {
          const newPath = [...path, neighbor];
          queue.push(newPath);
        });
      }
    }

    setRoute([]);
    setTotalDistance(0);
    alert("No route found between the selected locations.");
  };

  const formatRouteWithArrows = (route) => {
    return route.join(" → ");
  };

  return (
    <div className="map-container">
      <h2 className="title">Best Route Finder</h2>
  
      {/* Route Animation: Start -> Road -> End */}
      <div className="route-animation">
        {/* Start Location */}
        <div className="start-location">
          <span role="img" aria-label="map">🗺️</span>
          <select
            id="start-location"
            className="dropdown"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          >
            <option value="">Select Start Location</option>
            {safeSpots.map((spot) => (
              <option key={spot.id} value={spot.name}>
                {spot.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Animated Road Line */}
        <div className="road-animation">
          <span className="moving-dots">➡️</span>
        </div>
  
        {/* End Location */}
        <div className="end-location">
          <span role="img" aria-label="map">🗺️</span>
          <select
            id="end-location"
            className="dropdown"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
          >
            <option value="">Select End Location</option>
            {safeSpots.map((spot) => (
              <option key={spot.id} value={spot.name}>
                {spot.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {/* Find Route Button */}
      <button className="find-route-btn" onClick={findRoute}>
        Find Best Route
      </button>
  
      {/* Display Best Route */}
      <h3 className="route-title">Best Route:</h3>
      {route.length > 0 ? (
        <p className="route">{formatRouteWithArrows(route)}</p>
      ) : (
        <p className="no-route">No route found</p>
      )}
  
      {/* Distance Section */}
      {totalDistance > 0 && (
        <div className="distance-section">
          <span className="distance-icon">🛣️</span>
          <p className="distance">{totalDistance.toFixed(2)} km</p>
        </div>
      )}
    </div>
  );  
  
}

export default BestRouteFinder;
