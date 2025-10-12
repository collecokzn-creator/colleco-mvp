import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Role helpers
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const isClient = user?.role === "client";

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, isPartner, isClient }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
