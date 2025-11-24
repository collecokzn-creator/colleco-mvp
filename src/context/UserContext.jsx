import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export { UserContext };

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // E2E override: when running under Cypress, tests may set a synchronous
    // `window.__E2E_USER__` so the app can mount already-logged-in state
    // without waiting for React effects or storage reads. Prefer that when
    // available to make E2E flows deterministic.
    try {
      if (typeof window !== 'undefined' && window.__E2E__ && window.__E2E_USER__) {
        try { window.__E2E_PROFILE_LOADED__ = true; } catch (err) {}
        try { window.__E2E_LOGS__ = window.__E2E_LOGS__ || []; window.__E2E_LOGS__.push({ ts: Date.now(), msg: 'UserContext:init used __E2E_USER__' }); } catch (e) {}
        return window.__E2E_USER__;
      }
    } catch (e) {}
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

  // E2E readiness helper: when running in E2E mode (tests set window.__E2E__)
  // expose a deterministic readiness flag as soon as the UserContext has a
  // logged-in user. Tests can wait for `window.__E2E_PROFILE_LOADED__` instead
  // of relying on a particular route/component mount.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        // Set true when user exists, false otherwise. Best-effort only.
        window.__E2E_PROFILE_LOADED__ = !!user;
        // Lightweight E2E trace: record into window.__E2E_LOGS__ so tests
        // can inspect it without introducing console.* lint failures.
        try {
          window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
          window.__E2E_LOGS__.push({
            ts: Date.now(),
            msg: '__E2E_PROFILE_LOADED__',
            value: !!user,
          });
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  // Role helpers
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const isClient = user?.role === "client";

  // Logout function
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("user:persistence");
      sessionStorage.removeItem("user");
    } catch (e) {}
  };

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, isPartner, isClient, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
