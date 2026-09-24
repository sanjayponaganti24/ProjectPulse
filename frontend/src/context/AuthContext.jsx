import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const response = await api.post("/api/auth/login", credentials);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(details) {
    const response = await api.post("/api/auth/register", details);
    const registeredUser = response.data.user;
    if (registeredUser?.role === "ORGANISATION_ADMIN") {
      setUser({
        ...registeredUser,
        ...(response.data.organisation
          ? { organisation: response.data.organisation }
          : {}),
      });
    }
    return response.data;
  }

  async function logout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  async function updateProfile(profile) {
    const response = await api.patch("/api/users/me/profile", profile);
    const updatedUser = response.data.user;
    setUser((current) => ({
      ...current,
      ...updatedUser,
    }));
    return updatedUser;
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
