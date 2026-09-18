import { createContext, useContext, useEffect, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("bp_token");
    if (!token) {
      setBrand(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await client.get("/auth/me");
      setBrand(data.brand);
    } catch {
      localStorage.removeItem("bp_token");
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("bp_token", data.token);
    setBrand(data.brand);
    return data.brand;
  }

  async function register(name, email, password) {
    const { data } = await client.post("/auth/register", { name, email, password });
    localStorage.setItem("bp_token", data.token);
    setBrand(data.brand);
    return data.brand;
  }

  function logout() {
    localStorage.removeItem("bp_token");
    setBrand(null);
  }

  async function deleteAccount() {
    await client.delete("/auth/me");
    localStorage.removeItem("bp_token");
    setBrand(null);
  }

  return (
    <AuthContext.Provider value={{ brand, setBrand, loading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
