import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getMiCuenta,
  actualizarMiCuenta,
  subirFotoPerfil,
  eliminarFotoPerfil,
  fotoUrl,
} from "../services/api";

/*
  Fuente única de la identidad del cliente logueado.
  La verdad vive en la API (getMiCuenta); NO se copia el perfil a localStorage.
  Lo único que sigue en localStorage es el "token" (llave de sesión JWT).
*/

const ClienteContext = createContext(null);

// Traduce la respuesta cruda del backend (ClientePerfilOut) a la forma que usa
// la UI. Un solo lugar de mapeo → si cambia el backend, se ajusta aquí.
function normalizar(cuenta) {
  if (!cuenta) return null;
  return {
    id: cuenta.id_cliente ?? null,
    nombre: cuenta.nombre_o_razon_social || "",
    rut: cuenta.rut || "",
    tipo_cliente: cuenta.tipo_cliente || "",
    correo: cuenta.email || "",
    telefono: cuenta.telefono || "",
    whatsapp: cuenta.whatsapp || "",
    direccion: cuenta.direccion || "",
    region: cuenta.region || "",
    comuna: cuenta.comuna || "",
    fecha_nacimiento: cuenta.fecha_nacimiento || "",
    preferencias: cuenta.preferencias_notificacion || null,
    foto: fotoUrl(cuenta.foto_perfil),
  };
}

export function ClienteProvider({ children }) {
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);

  const recargarCliente = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCliente(null);
      setCargando(false);
      return null;
    }
    try {
      const cuenta = await getMiCuenta(token);
      const norm = normalizar(cuenta);
      setCliente(norm);
      return norm;
    } catch {
      // token inválido/expirado o backend caído → sin datos, no rompe
      setCliente(null);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargarCliente();
  }, [recargarCliente]);

  // Guarda cambios en la BD (PUT /portal/perfil) y refresca el dato en vivo.
  const actualizarCliente = useCallback(async (payload) => {
    const token = localStorage.getItem("token");
    const cuenta = await actualizarMiCuenta(token, payload);
    const norm = normalizar(cuenta);
    setCliente(norm);
    return norm;
  }, []);

  // Sube la foto (POST /portal/perfil/foto) y refresca.
  const subirFoto = useCallback(async (archivo) => {
    const token = localStorage.getItem("token");
    const cuenta = await subirFotoPerfil(token, archivo);
    const norm = normalizar(cuenta);
    setCliente(norm);
    return norm;
  }, []);

  // Borra la foto del servidor (DELETE /portal/perfil/foto) y refresca.
  const eliminarFoto = useCallback(async () => {
    const token = localStorage.getItem("token");
    const cuenta = await eliminarFotoPerfil(token);
    const norm = normalizar(cuenta);
    setCliente(norm);
    return norm;
  }, []);

  // Se llama al cerrar sesión.
  const limpiarCliente = useCallback(() => setCliente(null), []);

  const value = {
    cliente,
    cargando,
    recargarCliente,
    actualizarCliente,
    subirFoto,
    eliminarFoto,
    limpiarCliente,
  };

  return (
    <ClienteContext.Provider value={value}>{children}</ClienteContext.Provider>
  );
}

export function useCliente() {
  const ctx = useContext(ClienteContext);
  if (ctx === null) {
    throw new Error("useCliente debe usarse dentro de <ClienteProvider>");
  }
  return ctx;
}
