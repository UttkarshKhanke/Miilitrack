import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Import db
import { ref, get, set } from "firebase/database"; // Import Firebase functions
import { useAuth } from "./AuthContext";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState(""); // ✅ Fixed: Added forgotMessage state
  const navigate = useNavigate();
  const { fetchUserData } = useAuth(); 

  // Handle User Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setForgotMessage(""); // Clear previous forgot password message

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);

      // Check if user exists in Firebase Realtime Database
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        console.log("User not found in database, creating entry...");
        await set(userRef, {
          email: userCredential.user.email,
          role: "user" // Default role
        });
      }

      // Fetch user data from database
      await fetchUserData(userCredential.user);

      navigate("/"); // Redirect to homepage
    } catch (error) {
      setError("Invalid email or password.");
      console.error("Login Error:", error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Please Contact the Administrator");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        {/* Input Fields */}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Forgot Password Link */}
        <p>
          <button onClick={handleForgotPassword}>Forgot Password?</button>
        </p>

        {/* Submit Button */}
        <button type="submit" className="login-btn">Login</button>

        {/* Forgot Password Message */}
        {forgotMessage && <p className="error-message">{forgotMessage}</p>}

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
