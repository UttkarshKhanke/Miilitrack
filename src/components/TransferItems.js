import React, { useState, useEffect } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";

function TransferItems() {
  const [bases, setBases] = useState([]);
  const [sourceBase, setSourceBase] = useState("");
  const [targetBase, setTargetBase] = useState("");
  const [inventory, setInventory] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(0);

  // Fetch all bases
  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");

    const unsubscribe = onValue(safeSpotsRef, (snapshot) => {
      const data = snapshot.val();
      const spots = data
        ? Object.keys(data).map((key) => ({ id: key, name: data[key].name }))
        : [];
      setBases(spots);
    });

    return () => unsubscribe();
  }, []);

  // Fetch inventory of the selected source base
  useEffect(() => {
    if (sourceBase) {
      const inventoryRef = ref(db, `inventory/${sourceBase}`);

      const unsubscribe = onValue(inventoryRef, (snapshot) => {
        const data = snapshot.val();
        setInventory(data || {});
      });

      return () => unsubscribe();
    }
  }, [sourceBase]);

  const handleTransfer = async () => {
    if (!sourceBase || !targetBase || !selectedItem || quantity <= 0) {
      alert("Please fill all fields correctly.");
      return;
    }

    const itemPath = selectedItem.split("/");
    const itemCategory = itemPath[0];
    const itemName = itemPath[1];
    const currentQuantity = inventory[itemCategory]?.[itemName] || 0;

    if (quantity > currentQuantity) {
      alert("Not enough quantity to transfer.");
      return;
    }

    try {
      const sourceRef = ref(db, `inventory/${sourceBase}/${itemCategory}/${itemName}`);
      const targetRef = ref(db, `inventory/${targetBase}/${itemCategory}/${itemName}`);

      // Calculate new quantities
      const newSourceQuantity = currentQuantity - quantity;

      const targetSnapshot = await get(targetRef);
      const targetQuantity = targetSnapshot.exists() ? targetSnapshot.val() : 0;

      const updates = {
        [`inventory/${sourceBase}/${itemCategory}/${itemName}`]: newSourceQuantity,
        [`inventory/${targetBase}/${itemCategory}/${itemName}`]: targetQuantity + quantity,
      };

      await update(ref(db), updates);
      alert("Items transferred successfully!");
    } catch (error) {
      console.error("Error transferring items:", error);
      alert("Failed to transfer items.");
    }
  };

  return (
    <div className="TransferItems">
      <h2>Transfer Items</h2>

      {/* Select Source Base */}
      <div>
        <h3>Select Source Base</h3>
        <select
          value={sourceBase}
          onChange={(e) => setSourceBase(e.target.value)}
        >
          <option value="">Select Base</option>
          {bases.map((base) => (
            <option key={base.id} value={base.id}>
              {base.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display Inventory of Source Base */}
      {sourceBase && (
        <div>
          <h3>Source Base Inventory</h3>
          {Object.keys(inventory).length > 0 ? (
            <ul>
              {Object.keys(inventory).map((category) => (
                <li key={category}>
                  <b>{category}</b>
                  <ul>
                    {Object.keys(inventory[category]).map((item) => (
                      <li key={item}>
                        {item}: {inventory[category][item]}
                        <button
                          onClick={() => setSelectedItem(`${category}/${item}`)}
                        >
                          Select
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No inventory available.</p>
          )}
        </div>
      )}

      {/* Select Target Base */}
      <div>
        <h3>Select Target Base</h3>
        <select
          value={targetBase}
          onChange={(e) => setTargetBase(e.target.value)}
        >
          <option value="">Select Base</option>
          {bases
            .filter((base) => base.id !== sourceBase)
            .map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
        </select>
      </div>

      {/* Transfer Quantity */}
      <div>
        <h3>Transfer Quantity</h3>
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
        />
      </div>

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        disabled={!sourceBase || !targetBase || !selectedItem || quantity <= 0}
      >
        Transfer Items
      </button>
    </div>
  );
}

export default TransferItems;
