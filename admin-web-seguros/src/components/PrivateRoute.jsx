import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, soloAdmin = false }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (soloAdmin && user?.rol !== "admin") return <Navigate to="/leads" replace />;
  return children;
}
