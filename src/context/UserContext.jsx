import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Prefer session storage (session-only login) if present, otherwise fall back to localStorage
    try {
      const session = sessionStorage.getItem("user");
      if (session) return JSON.parse(session);
    } catch (e) {}
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
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
    // Decide persistence based on a small persistence flag stored in localStorage
    // 'user:persistence' === 'session' or 'local'. Default to 'local' for backward
    // compatibility when not set.
    try {
      const persistence = localStorage.getItem("user:persistence") || "local";
      if (!user) {
        // Clear from both stores
        try { localStorage.removeItem("user"); } catch (e) {}
        try { sessionStorage.removeItem("user"); } catch (e) {}
        return;
      }
      if (persistence === "session") {
        try { sessionStorage.setItem("user", JSON.stringify(user)); } catch (e) {}
        try { localStorage.removeItem("user"); } catch (e) {}
      } else {
        try { localStorage.setItem("user", JSON.stringify(user)); } catch (e) {}
        try { sessionStorage.removeItem("user"); } catch (e) {}
      }
    } catch (e) {
      // Best-effort: fallback to localStorage
      try { localStorage.setItem("user", JSON.stringify(user || null)); } catch (ee) {}
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
