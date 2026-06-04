import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Leads from "./pages/Leads";
import Cotizaciones from "./pages/Cotizaciones";
import Seguros from "./pages/Seguros";
import Clientes from "./pages/Clientes";
import Polizas from "./pages/Polizas";
import Imagenes from "./pages/Imagenes";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/leads" replace />} />
            <Route path="leads" element={<Leads />} />
            <Route path="cotizaciones" element={<Cotizaciones />} />
            <Route path="seguros" element={<Seguros />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="polizas" element={<Polizas />} />
            <Route path="imagenes" element={<Imagenes />} />
            <Route path="usuarios" element={<PrivateRoute soloAdmin><Usuarios /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
