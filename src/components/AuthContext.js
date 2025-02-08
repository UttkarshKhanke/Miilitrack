import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { ref, get } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data & force token refresh
  const fetchUserData = async (authUser) => {
    if (!authUser) {
      console.log("⚠️ User is not logged in.");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 🔄 Refresh token to apply latest admin claims
      await authUser.getIdToken(true);

      const userRef = ref(db, `users/${authUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const updatedUser = { 
          uid: authUser.uid, 
          email: authUser.email, 
          role: userData.role || "user" // Default to 'user' if no role found
        };

        console.log("✅ User data successfully loaded:", updatedUser);
        setUser(updatedUser);
      } else {
        console.warn("⚠️ User data not found in database.");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setUser(null);
    }

    setLoading(false);
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("🔄 Auth state changed:", authUser);
      await fetchUserData(authUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
