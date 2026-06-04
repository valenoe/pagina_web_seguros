import { createContext, useContext, useState } from "react";

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch { return null; }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const user = token ? decodeJWT(token) : null;

  function guardarToken(t) {
    localStorage.setItem("admin_token", t);
    setToken(t);
  }

  function cerrarSesion() {
    localStorage.removeItem("admin_token");
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, guardarToken, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
