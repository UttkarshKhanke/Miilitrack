import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD3En6AlABOAYB5O4Xdlc6ualexyxqipqs",
  authDomain: "military-management-website.firebaseapp.com",
  databaseURL: "https://military-management-website-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "military-management-website",
  storageBucket: "military-management-website.firebasestorage.app",
  messagingSenderId: "494853047545",
  appId: "1:494853047545:web:0019a0303ba04eda330e28",
  measurementId: "G-2JJWW55JZW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Initialize Realtime Database

console.log("Firebase Initialized: ", auth , db);

export { auth, db };
