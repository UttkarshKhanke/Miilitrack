import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database"; 
import { db } from "../firebase"; 
import itemImages from '../itemImages.json';
import './AddNewItems.css'; // Path to item images JSON

function AddNewItems() {
  const [bases, setBases] = useState([]); // List of bases
  const [selectedBase, setSelectedBase] = useState(""); // Selected base ID
  const [itemType, setItemType] = useState(""); // Selected item type
  const [subCategory, setSubCategory] = useState(""); // Selected sub-category
  const [quantity, setQuantity] = useState(""); // Quantity to add
  const [inventory, setInventory] = useState({}); // Inventory of the selected base
  const [imageUrl, setImageUrl] = useState(""); // URL of the image

  // Fetch the list of bases from Firebase
  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");

    const unsubscribe = onValue(safeSpotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const baseList = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
        }));
        setBases(baseList);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch the inventory of the selected base
  useEffect(() => {
    if (!selectedBase) return;

    const inventoryRef = ref(db, `inventory/${selectedBase}`);
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      setInventory(data || {}); 
    });

    return () => unsubscribe();
  }, [selectedBase]);

  // Update the image URL based on the selected itemType and subCategory
  useEffect(() => {
    if (!itemType) {
      setImageUrl(""); 
      return;
    }
    if (subCategory && itemImages[itemType]?.[subCategory]) {
      setImageUrl(itemImages[itemType][subCategory]);
    } else if (itemImages[itemType]) {
      setImageUrl(itemImages[itemType]);
    } else {
      setImageUrl("");
    }
  }, [itemType, subCategory]);

  // Function to add new items to the selected base's inventory
  const addItem = async () => {
    if (!selectedBase || !itemType || !quantity) {
      return alert("Please fill all required fields.");
    }

    const quantityToAdd = parseInt(quantity, 10);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return alert("Quantity must be a positive number.");
    }

    const itemPath = `inventory/${selectedBase}/${itemType}/${subCategory}`;
    const itemRef = ref(db, itemPath);

    const currentQuantity = inventory[itemType]?.[subCategory] || 0;
    const newQuantity = currentQuantity + quantityToAdd;

    try {
      await set(itemRef, newQuantity); 
      alert(`Added ${quantityToAdd} to ${subCategory || "new sub-category"} in ${itemType}.`);
      setQuantity(""); 
    } catch (error) {
      console.error("Error updating inventory: ", error);
      alert("Failed to add items. Please try again.");
    }
  };

  return (
    <div className="add-new-items-container">
      <h2 className="card-title">Add New Items to Base Inventory</h2>
  
      {/* Select Base */}
      <div className="input-group">
      <h3>Select a Base</h3>
        <select
          id="baseSelect"
          value={selectedBase}
          onChange={(e) => setSelectedBase(e.target.value)}
        >
          <option value="">-- Select a Base --</option>
          {bases.map((base) => (
            <option key={base.id} value={base.id}>
              {base.name}
            </option>
          ))}
        </select>
      </div>
  
      {/* Select Item Type */}
      <div className="input-group">
        <h3>Select Item Type</h3>
        <select
          id="itemTypeSelect"
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
        >
          <option value="">-- Select Item Type --</option>
          <option value="Air_Defence_Systems">Air Defence Systems</option>
          <option value="Aircraft">Aircraft</option>
          <option value="Anti_Material_Rifles">Anti Material Rifles</option>
          <option value="Anti_aircraft_gun_systems">Anti-Aircraft Gun Systems</option>
          <option value="Armoured_Personnel_Carriers">Armoured Personnel Carriers</option>
          <option value="Artillery">Artillery</option>
          <option value="Assualt_Rifles">Assault Rifles</option>
          <option value="Ballistic_and_Cruise_Missiles">Ballistic & Cruise Missiles</option>
          <option value="Engineering_and_support_vehicles">Engineering & Support Vehicles</option>
          <option value="Explosives">Explosives</option>
          <option value="Fuel">Fuel</option>
          <option value="Goods_and_Field_Transport_vehicles">Goods & Field Transport Vehicles</option>
          <option value="Infantry_Small_arms">Infantry Small Arms</option>
          <option value="Loitering_Munitions">Loitering Munitions</option>
          <option value="Machine_Guns">Machine Guns</option>
          <option value="Mines">Mines</option>
          <option value="Miscellaneous_Vehicles">Miscellaneous Vehicles</option>
          <option value="Protective_Gear">Protective Gear</option>
          <option value="Radars">Radars</option>
          <option value="Shotguns">Shotguns</option>
          <option value="Sniper_Rifles">Sniper Rifles</option>
          <option value="Sub_Machine_Guns">Sub Machine Guns</option>
          <option value="Towed_Artillery">Towed Artillery</option>
          <option value="UAV">UAV</option>
          <option value="Unmanned_ground_vehicle">Unmanned Ground Vehicle</option>
          <option value="Utility_and_Staff_Transport">Utility & Staff Transport</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Vessels">Vessels</option>
          <option value="food_water">Food and Water</option>
          <option value="medical_supplies">Medical Supplies</option>
        </select>
      </div>
  
      {/* Select Sub-Category */}
      {itemType && (
        <div className="input-group">
          <h3>Select Sub Category</h3>
          <select
            id="subCategorySelect"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="">-- Select Sub-Category --</option>
            {Object.keys(inventory[itemType] || {}).map((subCat) => (
              <option key={subCat} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        </div>
      )}
  
      {/* Input Quantity */}
      <div className="input-group">
      <h3>Enter Quantity</h3>
        <input
          id="quantityInput"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity to add"
        />
      </div>
  
      {/* Add Button */}
      <button className="add-item-button" onClick={addItem}>
        Add Items
      </button>
  
      {/* Display Image of Selected Item */}
      {imageUrl && (
        <div className="item-image">
          <h3>Selected Item Image:</h3>
          <img src={imageUrl} alt="Selected Item" />
        </div>
      )}
    </div>
  );  
}

export default AddNewItems;
