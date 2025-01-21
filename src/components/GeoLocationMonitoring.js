import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase"; // Import your Firebase configuration
import { ref, onValue } from "firebase/database";

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
  return R * c; // Distance in kilometers
};

const GeoLocationMonitoring = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [safeSpots, setSafeSpots] = useState([]);
  const [nearestBase, setNearestBase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [distanceToNearestBase, setDistanceToNearestBase] = useState(null); // Distance state

  // Fetch safe spots from Firebase
  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");

    const unsubscribe = onValue(
      safeSpotsRef,
      (snapshot) => {
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
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching safe spots:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleLocationTracking = () => {
    if (navigator.geolocation) {
      if (!tracking) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
          },
          (error) => {
            console.error(error);
            alert("Error fetching geolocation.");
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        setWatchId(id);
        setTracking(true);
      } else {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
        setTracking(false);
      }
    } else {
      alert("Geolocation not supported by this browser.");
    }
  };

  const findNearestBase = useCallback(() => {
    if (currentLocation && safeSpots.length > 0) {
      let minDistance = Infinity;
      let nearest = null;

      safeSpots.forEach((spot) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          spot.latitude,
          spot.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = spot;
        }
      });

      setNearestBase(nearest);
      setDistanceToNearestBase(minDistance); // Set the distance to nearest base
    }
  }, [currentLocation, safeSpots]);

  useEffect(() => {
    findNearestBase();
  }, [currentLocation, safeSpots, findNearestBase]);

  return (
    <div className="GeoLocationMonitoring">
      <h2>GeoLocation Monitoring</h2>
      <button onClick={toggleLocationTracking}>
        {tracking ? "Stop Tracking" : "Start Tracking"}
      </button>

      {currentLocation ? (
        <p>
          <strong>Current Location:</strong> Latitude: {currentLocation.latitude}, Longitude:{" "}
          {currentLocation.longitude}
        </p>
      ) : (
        <p>Waiting for current location...</p>
      )}

      {nearestBase ? (
        <div>
          <h3>Nearest Base:</h3>
          <p>
            <strong>{nearestBase.name}</strong> (Latitude: {nearestBase.latitude}, Longitude:{" "}
            {nearestBase.longitude})
          </p>
          {distanceToNearestBase !== null && (
            <p>
              <strong>Distance to Nearest Base:</strong> {distanceToNearestBase.toFixed(2)} km
            </p>
          )}
        </div>
      ) : (
        !loading && <p>No nearby base found.</p>
      )}

      {loading && <p>Loading safe spots...</p>}

      <h3>All Safe Spots:</h3>
      <ul>
        {safeSpots.map((spot) => (
          <li key={spot.id}>
            <b>{spot.name}</b> - Latitude: {spot.latitude}, Longitude: {spot.longitude}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GeoLocationMonitoring;
