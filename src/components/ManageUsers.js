import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { auth, db } from "../firebase";
import { ref, set, get, update, remove } from "firebase/database";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./ManageUsers.css";

const ManageUsers = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [selectedUser, setSelectedUser] = useState("");
  const [updatedRole, setUpdatedRole] = useState("user");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from Firebase Database
  const fetchUsers = async () => {
    if (!auth.currentUser) {
      console.error("User not authenticated!");
      return;
    }
  
    try {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        setUsers(Object.keys(usersData).map(uid => ({ uid, ...usersData[uid] })));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Permission denied. Make sure you have admin access.");
    }
  };
  
  

  // Create a new user

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return alert("Email and Password required");
  
    // Store the currently logged-in admin's email & password
    const adminEmail = auth.currentUser.email;
    const adminPassword = prompt("Re-enter your password to Create User:"); // Ask admin for re-auth
  
    if (!adminPassword) return alert("Admin password is required!");
  
    try {
      // Step 1: Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const newUserUid = userCredential.user.uid;
  
      // Step 2: Store the new user's role in Firebase Realtime Database
      await set(ref(db, `users/${newUserUid}`), {
        email: newEmail,
        role: newRole, // User role selected from dropdown
      });
  
      alert("User created successfully!");
  
      // Step 3: Sign out the newly created user
      await auth.signOut();
  
      // Step 4: Re-authenticate the admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  
      fetchUsers(); // Refresh the user list
      setNewEmail("");
      setNewPassword("");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user.");
    }
  };
  

  // Change user role
  const handleRoleChange = async () => {
    if (!selectedUser) return alert("Select a user to update");
  
    // Prevent admin from changing their own role
    if (selectedUser === user.uid) {
      alert("🚨 You cannot change your own role!");
      return;
    }
  
    try {
      await update(ref(db, `users/${selectedUser}`), { role: updatedRole });
      alert("Role updated successfully!");
      fetchUsers(); // Refresh users
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };
  

  // Remove a user
  const handleRemoveUser = async () => {
    if (!selectedUser) return alert("Select a user to remove");

    // Prevent the admin from deleting themselves
    if (selectedUser === user.uid) {
      alert("🚨 You cannot delete your own account!");
      return;
    }

    try {
      // Remove user from Realtime Database
      await remove(ref(db, `users/${selectedUser}`));

      // Get Firebase Auth instance
      const authInstance = getAuth();

      // Get user from Firebase Authentication
      const userToDelete = users.find((u) => u.uid === selectedUser);

      if (userToDelete) {
        const userAuth = authInstance.currentUser;

        if (userAuth && userAuth.uid === selectedUser) {
          await deleteUser(userAuth);
        }
      }

      alert("User removed successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Failed to remove user.");
    }
  };

  if (!user || user.role !== "admin") {
    return <h2>Access Denied. Only admins can manage users.</h2>;
  }

  return (
    <div className="manage-users-page">
      <div className="manage-users-container">
        <h2>Manage Users</h2>
  
        {/* Create New User */}
        <div className="input-group">
          <h3>Create New User</h3>
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="input-large"
          />
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-large"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="input-large"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="mg-pg-btn">
          <button class="custom-btn" onClick={handleCreateUser}>Create User</button></div>
  
        {/* Manage Roles */}
        <div>
          <h3>Manage Roles</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          className="roles-space">
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.email} ({u.role})
              </option>
            ))}
          </select>
          <select
            value={updatedRole}
            onChange={(e) => setUpdatedRole(e.target.value)}
            className="cr-sp"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button class="custom-btn" onClick={handleRoleChange}>Change Role</button>
        </div>
  
        {/* Remove User */}
        <div>
          <h3>Remove User</h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="roles-space"
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.email} ({u.role})
              </option>
            ))}
          </select>
            </div>
            <div className="mg-pg-btn">
          <button class="custom-btn" onClick={handleRemoveUser}>Remove User</button></div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
