import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";

/* Públicas */
import Home from "../pages/Home";
import Nosotros from "../pages/Nosotros";
import Seguros from "../pages/Seguros";
import Contacto from "../pages/Contacto";
import Privacidad from "../pages/Privacidad";

/* Portal */
// import Clientes from "../pages/Clientes"; // hub /clientes deshabilitado: el botón "Mi Sucursal" del header ya da acceso
import LoginClientes from "../pages/LoginClientes";
import RegistroClientes from "../pages/RegistroClientes";
import Dashboard from "../pages/Dashboard";
import DetalleSeguro from "../pages/DetalleSeguro";

/* Cotizaciones */
import Cotizador from "../pages/Cotizador";
import CotizacionExitosa from "../pages/CotizacionExitosa";

export default function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Sitio público */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/nosotros"
          element={<Nosotros />}
        />

        <Route
          path="/seguros"
          element={<Seguros />}
        />

        <Route
          path="/contacto"
          element={<Contacto />}
        />

        <Route
          path="/privacidad"
          element={<Privacidad />}
        />

        {/* Portal */}

        {/* Hub /clientes deshabilitado: el botón "Mi Sucursal" del header
            ya da acceso a Ejecutivo Comercial y a Clientes.
        <Route
          path="/clientes"
          element={<Clientes />}
        />
        */}

        <Route
          path="/login-clientes"
          element={<LoginClientes />}
        />

        <Route
          path="/registro-clientes"
          element={<RegistroClientes />}
        />

        <Route
          path="/clientes/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/clientes/dashboard/:vista"
          element={<Dashboard />}
        />

        <Route
          path="/clientes/seguro/:id"
          element={<DetalleSeguro />}
        />

        {/* Cotizador */}

        <Route
          path="/cotizador"
          element={<Cotizador />}
        />

        <Route
          path="/cotizacion-exitosa"
          element={<CotizacionExitosa />}
        />

      </Routes>

    </BrowserRouter>
  );
}