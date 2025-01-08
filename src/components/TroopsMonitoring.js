// components/Troops.js
import React, { useState } from "react";

function TroopsMonitoring() {
  const [troopName, setTroopName] = useState("");
  const [soldierCount, setSoldierCount] = useState("");

  const addTroop = () => {
    console.log(`Troop: ${troopName}, Soldiers: ${soldierCount}`);
    setTroopName("");
    setSoldierCount("");
  };

  return (
    <div className="Troops">
      <h2>Manage Troops</h2>
      <input
        type="text"
        placeholder="Troop Name"
        value={troopName}
        onChange={(e) => setTroopName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Soldier Count"
        value={soldierCount}
        onChange={(e) => setSoldierCount(e.target.value)}
      />
      <button onClick={addTroop}>Add Troop</button>
    </div>
  );
}

export default TroopsMonitoring;
