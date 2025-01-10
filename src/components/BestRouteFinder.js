import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database"; 
import { db } from "../firebase"; 

function BestRouteFinder() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [safeSpots, setSafeSpots] = useState([]);
  const [connections, setConnections] = useState({});
  const [route, setRoute] = useState([]);
  const [error] = useState(null);

  // Fetch safe spots and connections from Firebase
  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");
    const unsubscribeSpots = onValue(safeSpotsRef, (snapshot) => {
      const data = snapshot.val();
      const spots = data ? Object.keys(data).map((key) => ({
        id: key,
        name: data[key].name,
      })) : [];
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
    if (!startLocation || !endLocation) return alert("Please select both start and end locations.");

    const queue = [[startLocation]]; // Queue of paths, each path is an array of nodes
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endLocation) {
        setRoute(path);
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

    setRoute([]); // No route found
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

      {/* Display error */}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default BestRouteFinder;
