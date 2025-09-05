import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Create a single axios instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api", // change if your backend runs elsewhere
  });

  // Whenever token changes, update axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem("token", tok);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    window.location.href = "/login"; // or useNavigate if you prefer
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};
