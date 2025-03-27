import React, { useState, useEffect } from "react";
import { ref, push, remove, set, onValue } from "firebase/database"; 
import { db } from "../firebase"; 
import './SafeSpots.css';

function SafeSpots() {
  const [spot, setSpot] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [connectionBase, setConnectionBase] = useState("");
  const [selectedSpot, setSelectedSpot] = useState("");
  const [safeSpots, setSafeSpots] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const safeSpotsRef = ref(db, "safe_spots");

    const unsubscribe = onValue(safeSpotsRef, (snapshot) => {
      const data = snapshot.val();
      const spots = data ? Object.keys(data).map((key) => ({
        id: key,
        name: data[key].name,
        latitude: data[key].latitude,
        longitude: data[key].longitude,
      })) : [];

      setSafeSpots(spots);
      setLoading(false);
    }, (error) => {
      setError(error.message); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch connections from the database
  useEffect(() => {
    const connectionsRef = ref(db, "connections");

    const unsubscribeConnections = onValue(connectionsRef, (snapshot) => {
      const data = snapshot.val();
      setConnections(data || {});
    });

    return () => unsubscribeConnections();
  }, []);

  // Function to add a new safe spot
// Function to add a new safe spot with a detailed inventory (including subcategories with default frequency 0)
const addSafeSpot = async () => {
  try {
    const safeSpotsRef = ref(db, "safe_spots");
    const newSpotRef = push(safeSpotsRef);

    // Add Safe Spot data
    await set(newSpotRef, {
      name: spot,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });

    // Initialize inventory with categories and subcategories, all set to 0 frequency
    const inventoryRef = ref(db, `inventory/${newSpotRef.key}`);
    await set(inventoryRef, {
      Protective_Gear: {
        Vest: 0,
        Helmet: 0
      },
      Infantry_Small_arms: {
        Knife: 0,
        Glock: 0,
        Pistol_9mm: 0,
        Beretta_Storm:0
      },
      Shotguns: {
        Bore_PAG_12: 0,
      },
      Sub_Machine_Guns: {
        Micro_Uzi: 0,
        Koch_MP5: 0,
        MP9: 0,
        SAF_Carbine_2A1: 0,
        ASMI: 0,
        Tauras_T9: 0
      },
      Assualt_Rifles: {
        INSAS_1B1: 0,
        AK_203: 0,
        SIG_716i: 0,
        IWI_Tavor_X95: 0,
        M4_Carbine: 0,
        Ar_M1: 0,
        AKM: 0,
        MPi_KMS_72: 0,
        Vz_58: 0,
        T91: 0,
      },
      Sniper_Rifles:{
        SVD: 0,
        IMI_Galil: 0,
        Koch_PSG1: 0,
        Mauser_Sp66: 0,
        SIG_Sauer_SSG: 0,
        Sako_TRG_42: 0,
      },
      Anti_Material_Rifles:{
        Barret_M82: 0,
        Barret_M95: 0,
        OSV_96: 0,
        Denel_NTW_20: 0,
        Vidhwansak: 0,
      },
      Machine_Guns:{
        FN_Minimi:0,
        INSAS_LMG: 0,
        IMI_Negev_NG5: 0,
        MG_6A: 0,
        MK48: 0,
        PK: 0, 
        NSV: 0,
        M2: 0,
      },
      Explosives: {
        Rifle_grenade: 0,
        Shivalik: 0,
        ARDE40mm: 0,
        MGL40mm: 0,
        AGS_30: 0,
        RCL_M2: 0,
        B_300_Shipon: 0,
        RPO_A: 0,
        C90mm_Mortar: 0,
      },
      Mines:{
        NMM_14: 0, 
        Nipun: 0,
        Ulka: 0, 
        Parth: 0, 
        Prachand: 0,
        Vibhav: 0,
        Vishal: 0,
      },
      Vehicles: {
        Arjun: 0, 
        T90S_Bhishma: 0, 
        T72_Ajeya: 0,
        Zorawar_LT: 0,
        BMP_2_Sarath: 0,
      },
      Miscellaneous_Vehicles: {
        Carrier_Mortar_Tracked: 0,
        DRDO_Armoured_Ambulance: 0,
      },
      Armoured_Personnel_Carriers: {
        Kalyani_M4: 0, 
        Casspir: 0,
        OFB_Aditya: 0,
        Mahindra_Armado: 0,
        Mahindra_Rakshak: 0,
      },
      Utility_and_Staff_Transport:{
        Tata_Safari_Storme: 0,
        Mahindra_Scorpio: 0, 
        Maruti_Suzuki_Gypsy: 0,
        JSW_Defense: 0,
      },
      Goods_and_Field_Transport_vehicles: {
      Ashok_Leyland_4x4_Ambulance: 0,
      Tata_LPTA_713_TC: 0,
      Tata_LPTA_2038_HMV: 0,
      Ashok_Leyland_Stallion: 0,
      BEML_Tatra: 0,
      Scania_SBA111: 0, 
        },
      Engineering_and_support_vehicles: {
        WZT_3M: 0, 
        WZT_2: 0,
        AERV: 0,
        Hydrema: 0, 
        DRDO_Sarvatra: 0
      },
      Unmanned_ground_vehicle:{
        DRDO_Daksh: 0,
        Vision_60_robotic_MULE: 0,
        ATT: 0,
      },
      Artillery: {
        Pinaka_MBRL:0, 
        BM_21: 0,
        Smerch_9K58_MBRL: 0,
      },
      Towed_Artillery:{
        M_46: 0, 
        OFB_Indian_Field_Gun: 0,
        OFB_Dhanush: 0, 
        ATAGS: 0,
        TGS: 0,
      },
      Air_Defence_Systems: { 
        Akashteer: 0, 
        Barak_8_MR_SAM: 0, 
        Akash: 0, 
        SPYDER: 0, 
        QRSAM: 0
      },
      Anti_aircraft_gun_systems: {
        ZSU_23_4M_Shilka: 0, 
        T_2K22_Tunguska: 0, 
        Bofors_L_70: 0, 
        Sudarshan_CIWS: 0
      },
      Ballistic_and_Cruise_Missiles: {BrahMos: 0, 
        Nirbhay: 0, 
        Prahaar: 0, 
        Pralay: 0, 
        Prithvi_II: 0, 
        Shaurya: 0, 
        Agni_V: 0
      },
      Radars: {
        ADTCR: 0, 
        ADFCR: 0, 
        SWLR: 0, 
        Ashwini: 0, 
        Bharani: 0, 
        Rajendra: 0, 
        Rohini: 0
      },
      Vessels: {
        GSL_Patrol_Boat: 0, 
        Flat_Bottomed_Troop_Boat: 0, 
        Tempest_35_Swat: 0
      },
      Aircraft: {
        Boeing_AH_64_Apache: 0, 
        HAL_Prachand: 0, 
        HAL_Rudra: 0, 
        HAL_Dhruv: 0,
        HAL_Chetak: 0, 
        HAL_Cheetah: 0
      },
      UAV: {
        IAI_Heron_TP: 0, 
        Adani_Drishti_10_Starliner: 0, 
        General_Atomics_MQ_9: 0, 
        NewSpace_BELUGA: 0, 
        Raphe_mPhibr_MR_20: 0, 
        Hoverbee: 0
      },
      Loitering_Munitions: {
        Solar_Nagastra: 0, 
        Rafael_Firefly: 0, 
        Elbit_Skystriker: 0, 
        DRAP: 0, 
        ALS_50: 0
      },
      medical_supplies: {
        bandages: 0,
        first_aid_kits: 0,
        painkillers: 0,
        NBC_suits: 0, 
        Respiratory_masks: 0,
        Water_Poison_Detection_Kits: 0,
        Anukool: 0,
        Defibrillators: 0,
        Anesthesia_system: 0,
        Ventilators: 0,
        Suction_apparatus: 0,
        pulse_oximeters: 0
      },
      food_water: {
        food: 0,
        water: 0,
      },
      Fuel: {
        Winter_Diesel: 0,
        DHPP: 0,
        Aviation_Turbine_Fuel: 0,
        Bio_Jet_fuel: 0
      }
    });

    alert("Safe Spot Added with Detailed Inventory");
    setSpot("");
    setLat("");
    setLng("");
  } catch (e) {
    console.error("Error adding Safe Spot with Detailed Inventory: ", e);
    alert("Error adding Safe Spot");
  }
};


  // Function to add a connection between bases
  const addConnection = async () => {
    if (!selectedSpot || !connectionBase) return alert("Please select both bases");

    const connectionsRef = ref(db, `connections/${selectedSpot}`);
    const updatedConnections = {
      ...connections,
      [selectedSpot]: [...(connections[selectedSpot] || []), connectionBase],
    };
    
    await set(connectionsRef, updatedConnections[selectedSpot]);
    alert(`Connection added between ${selectedSpot} and ${connectionBase}`);
    setConnectionBase("");
    setSelectedSpot("");
  };

  // Function to remove a safe spot
  const removeSafeSpot = async (id) => {
    try {
      const safeSpotRef = ref(db, `safe_spots/${id}`);
      await remove(safeSpotRef);
      alert("Safe Spot Removed");
    } catch (e) {
      console.error("Error removing document: ", e);
      alert("Error removing Safe Spot");
    }
  };

  // Function to remove a connection between two bases
  const removeConnection = async (base, connectedBase) => {
    if (!base || !connectedBase) return;

    const connectionsRef = ref(db, `connections/${base}`);
    const updatedConnections = connections[base]?.filter(
      (spot) => spot !== connectedBase
    );

    if (updatedConnections && updatedConnections.length === 0) {
      // If there are no more connections, remove the base from connections
      await remove(connectionsRef);
    } else {
      // Update the connections list for the base
      await set(connectionsRef, updatedConnections);
    }

    alert(`Connection removed between ${base} and ${connectedBase}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="safe-spots">
      <div className="left-section">
      <h2>Safe Spots</h2>

      {/* Display current safe spots */}
      <ul>
  {safeSpots.length > 0 ? (
    safeSpots.map((spot) => (
      <li key={spot.id}>
        <b>{spot.name}</b>{"=>"}<b>&nbsp;Latitude:</b> {spot.latitude}<b>,&nbsp; Longitude:</b> {spot.longitude}&nbsp;
        <button className="remove-button" onClick={() => removeSafeSpot(spot.id)}>Remove</button>
      </li>
    ))
  ) : (
    <p>No safe spots available</p>
  )}
</ul>
</div>
<div className="middle-section">
<h3>Add Safe Spot:</h3>
<input
  type="text"
  placeholder="Safe Spot Name"
  value={spot}
  onChange={(e) => setSpot(e.target.value)}
  className="add-safe-spot-spacing"
/>
  <br></br>
<input
  type="number"
  placeholder="Latitude"
  value={lat}
  onChange={(e) => setLat(e.target.value)}
  className="add-safe-spot-spacing"
/>
<br></br>
<input
  type="number"
  placeholder="Longitude"
  value={lng}
  onChange={(e) => setLng(e.target.value)}
  className="add-safe-spot-spacing"
/>
<br></br>
<button className="add-spot-button" onClick={addSafeSpot}>Add Safe Spot</button>
<br></br><br></br><br></br><br></br>
<h3>Add Connection Between Bases:</h3>
<select 
  value={selectedSpot} 
  onChange={(e) => setSelectedSpot(e.target.value)}
>
  <option value="">Select a Base</option>
  {safeSpots.map((spot) => (
    <option key={spot.id} value={spot.name}>
      {spot.name}
    </option>
  ))}
</select>
<br></br>
<select 
  value={connectionBase} 
  onChange={(e) => setConnectionBase(e.target.value)}
>
  <option value="">Select a Base to Connect</option>
  {safeSpots
    .filter((spot) => spot.name !== selectedSpot)
    .map((spot) => (
      <option key={spot.id} value={spot.name}>
        {spot.name}
      </option>
    ))}
</select><br></br>
<button className="add-connection-button" onClick={addConnection}>Add Connection</button>
</div>

<div className="right-section">
      {/* Display Current Connections */}
      <h3>Current Connections:</h3>
      <ul>
        {Object.keys(connections).length > 0 ? (
          Object.keys(connections).map((base) => (
            <li key={base}>
              <b>{base}</b><br></br>is &nbsp;connected to:
              <ul>
                {connections[base].map((connectedBase, index) => (
                  <li key={index}>
                    {connectedBase}&nbsp; &nbsp;
                    <button className="remove-button" onClick={() => removeConnection(base, connectedBase)}>Remove</button>
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <p>No connections available</p>
        )}
      </ul>
    </div>
    </div>
  );
};

export default SafeSpots;