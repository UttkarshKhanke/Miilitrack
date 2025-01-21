import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

// Haversine formula to calculate distance between two lat/long points
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
  const [error] = useState(null);

  // Fetch safe spots and connections from Firebase
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

  // Function to find the best route using a basic breadth-first search (BFS) algorithm
  const findRoute = () => {
    if (!startLocation || !endLocation)
      return alert("Please select both start and end locations.");

    const queue = [[startLocation]]; // Queue of paths, each path is an array of nodes
    const visited = new Set();
    let totalDistance = 0;

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endLocation) {
        setRoute(path);
        setTotalDistance(totalDistance); // Set the total distance when the route is found
        return;
      }

      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = connections[node] || [];

        neighbors.forEach((neighbor) => {
          const neighborData = safeSpots.find((spot) => spot.name === neighbor);
          const currentNodeData = safeSpots.find(
            (spot) => spot.name === node
          );

          if (neighborData && currentNodeData) {
            const distance = calculateDistance(
              currentNodeData.latitude,
              currentNodeData.longitude,
              neighborData.latitude,
              neighborData.longitude
            );
            totalDistance += distance;

            const newPath = [...path, neighbor];
            queue.push(newPath);
          }
        });
      }
    }

    setRoute([]); // No route found
    setTotalDistance(0); // Reset distance if no route found
    alert("No route found between the selected locations.");
  };

  // Function to format the route with arrows
  const formatRouteWithArrows = (route) => {
    return route.join(" → ");
  };

  return (
    <div className="BestRouteFinder">
      <h2>Best Route Finder</h2>

      {/* Dropdown to select start and end locations */}
      <div>
        <label>Start Location: </label>
        <select
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

      <div>
        <label>End Location: </label>
        <select
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

      {/* Button to find the best route */}
      <button onClick={findRoute}>Find Best Route</button>

      {/* Display route */}
      <h3>Best Route:</h3>
      {route.length > 0 ? (
        <p>{formatRouteWithArrows(route)}</p>
      ) : (
        <p>No route found</p>
      )}

      {/* Display total distance */}
      {totalDistance > 0 && (
        <div>
          <h3>Total Distance: </h3>
          <p>{totalDistance.toFixed(2)} km</p>
        </div>
      )}

      {/* Display error */}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default BestRouteFinder;
