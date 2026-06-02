import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Nosotros from "../pages/Nosotros";
import Seguros from "../pages/Seguros";
import Contacto from "../pages/Contacto";
import Clientes from "../pages/Clientes";
import Dashboard from "../pages/Dashboard";
import Cotizador from "../pages/Cotizador";
import CotizacionExitosa from "../pages/CotizacionExitosa";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/nosotros" element={<Nosotros />} />

        <Route path="/seguros" element={<Seguros />} />

        <Route path="/contacto" element={<Contacto />} />

        <Route path="/clientes" element={<Clientes />} />

        <Route path="/clientes/dashboard" element={<Dashboard />} />

        <Route path="/cotizador" element={<Cotizador />} />

        <Route
          path="/cotizacion-exitosa"
          element={<CotizacionExitosa />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;