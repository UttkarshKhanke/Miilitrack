import React, { useState, useEffect } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";
import itemImages from '../itemImages.json'; // Assuming you store image URLs here

function TransferItems() {
  const [bases, setBases] = useState([]);
  const [sourceBase, setSourceBase] = useState("");
  const [targetBase, setTargetBase] = useState("");
  const [inventory, setInventory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [itemImage, setItemImage] = useState(""); // New state for item image

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

  // Update item image when item is selected
  useEffect(() => {
    if (selectedItem) {
      const [category, item] = selectedItem.split("/");
      const imageURL = itemImages[category]?.[item]; // Find the image URL for the selected item
      setItemImage(imageURL || ""); // Set the image or default to an empty string
    }
  }, [selectedItem]);

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

      {/* Display Inventory Categories of Source Base */}
      {sourceBase && (
        <div>
          <h3>Select Item Category</h3>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const category = e.target.value;
              setSelectedCategory(category);
              setSelectedItem(""); // Reset selected item
            }}
          >
            <option value="">Select Category</option>
            {Object.keys(inventory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display Dropdown for Specific Item Selection */}
      {selectedCategory && (
        <div>
          <h3>Select Specific Item</h3>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">Select Item</option>
            {Object.keys(inventory[selectedCategory] || {}).map((item) => (
              <option key={item} value={`${selectedCategory}/${item}`}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display Selected Item Quantity */}
      {selectedItem && inventory[selectedCategory] && (
        <div>
          <h3>Quantity Available: {inventory[selectedCategory][selectedItem.split("/")[1]]}</h3>
        </div>
      )}

      {/* Display Selected Item Image */}
      {itemImage && (
        <div>
          <h3>Selected Item Image</h3>
          <img src={itemImage} alt="Selected Item" style={{ width: "200px" }} />
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
