import React, { useState, useEffect } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebase";
import itemImages from '../itemImages.json'; // Assuming you store image URLs here
import './TransferItems.css'; // Assuming you have a CSS file for consistent styling

function TransferItems() {
  const [bases, setBases] = useState([]);
  const [sourceBase, setSourceBase] = useState("");
  const [targetBase, setTargetBase] = useState("");
  const [inventory, setInventory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [itemImage, setItemImage] = useState(""); // New state for item image
  const [isLoading, setIsLoading] = useState(false); // Loading state for UI

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
      setIsLoading(true); // Show loading indicator
      const inventoryRef = ref(db, `inventory/${sourceBase}`);

      const unsubscribe = onValue(inventoryRef, (snapshot) => {
        const data = snapshot.val();
        setInventory(data || {});
        setIsLoading(false); // Hide loading indicator
      });

      return () => unsubscribe();
    }
  }, [sourceBase]);

  // Update item image when item is selected
  useEffect(() => {
    if (selectedItem) {
      const [category, item] = selectedItem.split("/");
      const imageURL = itemImages[category]?.[item]; // Find the image URL for the selected item
      setItemImage(imageURL || "/path/to/placeholder.jpg"); // Fallback to placeholder if no image found
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
      setIsLoading(true); // Show loading indicator
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
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="transfer-items-container">
      <div className="transfer-items-card">
        <h2 className="card-title">Transfer Items</h2>

        {isLoading && <div className="loading-spinner">Loading...</div>}

        {/* Select Source Base */}
        <div className="form-group">
          <label htmlFor="sourceBase">Source Base</label>
          <select
            id="sourceBase"
            value={sourceBase}
            onChange={(e) => setSourceBase(e.target.value)}
            className="form-control"
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
        {sourceBase && !isLoading && (
          <div className="form-group">
            <label htmlFor="itemCategory">Item Category</label>
            <select
              id="itemCategory"
              value={selectedCategory}
              onChange={(e) => {
                const category = e.target.value;
                setSelectedCategory(category);
                setSelectedItem(""); // Reset selected item
              }}
              className="form-control"
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
          <div className="form-group">
            <label htmlFor="selectedItem">Select Item</label>
            <select
              id="selectedItem"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="form-control"
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
          <div className="form-group">
            <label>Quantity Available</label>
            <p>{inventory[selectedCategory][selectedItem.split("/")[1]]}</p>
          </div>
        )}

        {/* Display Selected Item Image */}
        {itemImage && (
          <div className="form-group">
            <label>Selected Item Image</label>
            <img src={itemImage} alt="Selected Item" className="item-image" />
          </div>
        )}

        {/* Select Target Base */}
        <div className="form-group">
          <label htmlFor="targetBase">Target Base</label>
          <select
            id="targetBase"
            value={targetBase}
            onChange={(e) => setTargetBase(e.target.value)}
            className="form-control"
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
        <div className="form-group">
          <label htmlFor="quantity">Transfer Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
            className="form-control"
          />
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={!sourceBase || !targetBase || !selectedItem || quantity <= 0}
          className="btn-submit"
        >
          Transfer Items
        </button>
      </div>
    </div>
  );
}

export default TransferItems;
