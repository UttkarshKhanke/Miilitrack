import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Firebase config import
import { ref, push, set, onValue, update, remove } from "firebase/database"; // Firebase Realtime Database imports

const TroopsMonitoring = () => {
  const [troops, setTroops] = useState([]); // State to store list of troops
  const [newTroop, setNewTroop] = useState({
    name: "",
    active_soldiers: 0,
    reserve_soldiers: 0,
  });

  const [sameBaseTransfer, setSameBaseTransfer] = useState({
    troopId: "",
    soldiersToTransfer: 0,
    fromType: "", // 'active' or 'reserve'
    toType: "", // 'active' or 'reserve'
  });

  const [crossBaseTransfer, setCrossBaseTransfer] = useState({
    sourceTroopId: "", // Source Troop (Troop 1)
    destTroopId: "", // Destination Troop (Troop 2)
    soldiersToTransfer: 0,
    fromType: "", // 'active' or 'reserve'
    toType: "", // 'active' or 'reserve'
  });

  // Fetch troops from Firebase Realtime Database
  useEffect(() => {
    const troopsRef = ref(db, "troops"); // Reference to 'troops' node in Firebase

    // Listen to changes in the 'troops' node for real-time updates
    onValue(troopsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const troopList = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setTroops(troopList); // Update state with the troop data from Firebase
      }
    });
  }, []);

  // Handle changes in input fields for troop data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTroop({
      ...newTroop,
      [name]: value, // Update corresponding field in newTroop state
    });
  };

  // Handle changes in transfer input fields for same base transfer
  const handleSameBaseTransferChange = (e) => {
    const { name, value } = e.target;
    setSameBaseTransfer({
      ...sameBaseTransfer,
      [name]: value, // Update corresponding field in sameBaseTransfer state
    });
  };

  // Handle changes in transfer input fields for cross base transfer
  const handleCrossBaseTransferChange = (e) => {
    const { name, value } = e.target;
    setCrossBaseTransfer({
      ...crossBaseTransfer,
      [name]: value, // Update corresponding field in crossBaseTransfer state
    });
  };

  // Add a new troop to Firebase Realtime Database
  const addTroop = async () => {
    if (!newTroop.name) {
      alert("Please fill in all fields!");
      return;
    }

    // Get a reference to the 'troops' node in Firebase
    const newTroopRef = push(ref(db, "troops"));

    // Set new troop data under the 'troops' node with a unique ID generated by Firebase
    await set(newTroopRef, {
      name: newTroop.name,
      active_soldiers: parseInt(newTroop.active_soldiers),
      reserve_soldiers: parseInt(newTroop.reserve_soldiers),
    });

    alert("Troop added successfully!");

    // Clear the input fields after adding the troop
    setNewTroop({
      name: "",
      active_soldiers: 0,
      reserve_soldiers: 0,
    });
  };

  // Function to transfer soldiers within the same troop (active to reserve or reserve to active)
  const transferSoldiersWithinSameBase = async () => {
    const { troopId, soldiersToTransfer, fromType, toType } = sameBaseTransfer;
    const troop = troops.find((t) => t.id === troopId);

    if (!troop || soldiersToTransfer <= 0) {
      alert("Please select a troop and enter a valid number of soldiers.");
      return;
    }

    const troopRef = ref(db, `troops/${troopId}`);
    let updatedData = {};

    // Convert the current soldiers to integers for calculation
    const currentActiveSoldiers = parseInt(troop.active_soldiers);
    const currentReserveSoldiers = parseInt(troop.reserve_soldiers);
    const soldiers = parseInt(soldiersToTransfer);

    // Validate transfer from active to reserve or reserve to active
    if (fromType === "active" && currentActiveSoldiers >= soldiers && toType === "reserve") {
      updatedData = {
        active_soldiers: currentActiveSoldiers - soldiers, // Subtract from active
        reserve_soldiers: currentReserveSoldiers + soldiers, // Add to reserve
      };
    } else if (fromType === "reserve" && currentReserveSoldiers >= soldiers && toType === "active") {
      updatedData = {
        active_soldiers: currentActiveSoldiers + soldiers, // Add to active
        reserve_soldiers: currentReserveSoldiers - soldiers, // Subtract from reserve
      };
    } else {
      alert("Invalid transfer, check the number of soldiers or types.");
      return;
    }

    // Update Firebase with the new soldier counts
    await update(troopRef, updatedData);
    alert("Soldiers transferred successfully within the same troop!");
  };

  // Function to transfer soldiers between two different troops (active or reserve)
  const transferSoldiersBetweenTroops = async () => {
    const { sourceTroopId, destTroopId, soldiersToTransfer, fromType, toType } = crossBaseTransfer;

    // Find the source and destination troops
    const sourceTroop = troops.find((t) => t.id === sourceTroopId);
    const destTroop = troops.find((t) => t.id === destTroopId);

    if (!sourceTroop || !destTroop || soldiersToTransfer <= 0) {
      alert("Please select valid troops and enter a valid number of soldiers.");
      return;
    }

    const sourceTroopRef = ref(db, `troops/${sourceTroopId}`);
    const destTroopRef = ref(db, `troops/${destTroopId}`);
    let updatedSourceData = {};
    let updatedDestData = {};

    // Convert current soldiers to integers for calculation
    const sourceActiveSoldiers = parseInt(sourceTroop.active_soldiers);
    const sourceReserveSoldiers = parseInt(sourceTroop.reserve_soldiers);
    const destActiveSoldiers = parseInt(destTroop.active_soldiers);
    const destReserveSoldiers = parseInt(destTroop.reserve_soldiers);
    const soldiers = parseInt(soldiersToTransfer);

    // Transfer logic for active ↔ active or reserve ↔ reserve
    if (fromType === "active" && sourceActiveSoldiers >= soldiers && toType === "active") {
      updatedSourceData = {
        active_soldiers: sourceActiveSoldiers - soldiers, // Subtract from source active
      };
      updatedDestData = {
        active_soldiers: destActiveSoldiers + soldiers, // Add to destination active
      };
    } else if (fromType === "reserve" && sourceReserveSoldiers >= soldiers && toType === "reserve") {
      updatedSourceData = {
        reserve_soldiers: sourceReserveSoldiers - soldiers, // Subtract from source reserve
      };
      updatedDestData = {
        reserve_soldiers: destReserveSoldiers + soldiers, // Add to destination reserve
      };
    } else {
      alert("Invalid transfer, check the number of soldiers or types.");
      return;
    }

    // Update Firebase with the new soldier counts for both troops
    await update(sourceTroopRef, updatedSourceData);
    await update(destTroopRef, updatedDestData);

    alert("Soldiers transferred successfully between troops!");
  };

  // Function to delete a troop from Firebase
  const deleteTroop = (troopId) => {
    const troopRef = ref(db, `troops/${troopId}`); // Reference to the troop node
    remove(troopRef) // Remove the troop from the database
      .then(() => {
        alert("Troop removed successfully!");
      })
      .catch((error) => {
        console.error("Error removing troop:", error);
      });
  };

  return (
    <div>
      <h2>Troops Monitoring</h2>

      {/* Add Troop Form */}
      <h3>Add New Troop</h3>
      <input
        type="text"
        name="name"
        placeholder="Troop Name"
        value={newTroop.name}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="active_soldiers"
        placeholder="Active Soldiers"
        value={newTroop.active_soldiers}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="reserve_soldiers"
        placeholder="Reserve Soldiers"
        value={newTroop.reserve_soldiers}
        onChange={handleInputChange}
      />
      <button onClick={addTroop}>Add Troop</button>

      {/* Transfer Soldiers Within Same Troop (Active <-> Reserve) */}
      <h3>Transfer Soldiers Within Same Troop</h3>
      <select name="troopId" value={sameBaseTransfer.troopId} onChange={handleSameBaseTransferChange}>
        <option value="">Select Troop</option>
        {troops.map((troop) => (
          <option key={troop.id} value={troop.id}>
            {troop.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="soldiersToTransfer"
        placeholder="Number of Soldiers"
        value={sameBaseTransfer.soldiersToTransfer}
        onChange={handleSameBaseTransferChange}
      />
      <select name="fromType" value={sameBaseTransfer.fromType} onChange={handleSameBaseTransferChange}>
        <option value="">Transfer From</option>
        <option value="active">Active Soldiers</option>
        <option value="reserve">Reserve Soldiers</option>
      </select>
      <select name="toType" value={sameBaseTransfer.toType} onChange={handleSameBaseTransferChange}>
        <option value="">Transfer To</option>
        <option value="active">Active Soldiers</option>
        <option value="reserve">Reserve Soldiers</option>
      </select>
      <button onClick={transferSoldiersWithinSameBase}>Transfer Soldiers</button>

      {/* Transfer Soldiers Between Two Troops */}
      <h3>Transfer Soldiers Between Two Troops</h3>
      <select name="sourceTroopId" value={crossBaseTransfer.sourceTroopId} onChange={handleCrossBaseTransferChange}>
        <option value="">Select Source Troop</option>
        {troops.map((troop) => (
          <option key={troop.id} value={troop.id}>
            {troop.name}
          </option>
        ))}
      </select>
      <select name="destTroopId" value={crossBaseTransfer.destTroopId} onChange={handleCrossBaseTransferChange}>
        <option value="">Select Destination Troop</option>
        {troops.map((troop) => (
          <option key={troop.id} value={troop.id}>
            {troop.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="soldiersToTransfer"
        placeholder="Number of Soldiers"
        value={crossBaseTransfer.soldiersToTransfer}
        onChange={handleCrossBaseTransferChange}
      />
      <select name="fromType" value={crossBaseTransfer.fromType} onChange={handleCrossBaseTransferChange}>
        <option value="">Transfer From</option>
        <option value="active">Active Soldiers</option>
        <option value="reserve">Reserve Soldiers</option>
      </select>
      <select name="toType" value={crossBaseTransfer.toType} onChange={handleCrossBaseTransferChange}>
        <option value="">Transfer To</option>
        <option value="active">Active Soldiers</option>
        <option value="reserve">Reserve Soldiers</option>
      </select>
      <button onClick={transferSoldiersBetweenTroops}>Transfer Soldiers</button>

      {/* Display List of Troops */}
      <h3>List of Troops</h3>
      <ul>
        {troops.map((troop) => (
          <li key={troop.id}>
            <strong>{troop.name}</strong> - Active Soldiers: {troop.active_soldiers} | Reserve Soldiers: {troop.reserve_soldiers}
            {/* Delete Button */}
            <button onClick={() => deleteTroop(troop.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TroopsMonitoring;
