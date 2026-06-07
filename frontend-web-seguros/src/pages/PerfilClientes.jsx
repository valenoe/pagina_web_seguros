import { useEffect, useState } from "react";
import { getMiPerfil } from "../services/api";

const TIPO_LABEL = { persona: "Persona natural", empresa: "Empresa" };

function PerfilCliente({ perfil: perfilProp }) {
  const [perfil, setPerfil] = useState(perfilProp || null);
  const [cargando, setCargando] = useState(!perfilProp);
  const [error, setError] = useState("");

  useEffect(() => {
    if (perfilProp) {
      setPerfil(perfilProp);
      setCargando(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Sin sesión activa.");
      setCargando(false);
      return;
    }
    getMiPerfil(token)
      .then(setPerfil)
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setCargando(false));
  }, [perfilProp]);

  if (cargando) return <p className="cargando">Cargando perfil...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!perfil) return null;

  return (
    <div className="perfil-cliente">
      <div className="perfil-cliente-header">
        <span>Perfil cliente</span>
        <h2>Hola, {perfil.nombre_o_razon_social}</h2>
        <p>Revisa tus datos de contacto y la información asociada a tu cuenta.</p>
      </div>

      <div className="perfil-cliente-grid">
        <div className="perfil-cliente-card">
          <small>RUT</small>
          <strong>{perfil.rut}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Correo</small>
          <strong>{perfil.email || "—"}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Teléfono</small>
          <strong>{perfil.telefono || "—"}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Tipo cliente</small>
          <strong>{TIPO_LABEL[perfil.tipo_cliente] || perfil.tipo_cliente}</strong>
        </div>
      </div>

      <div className="perfil-cliente-security">
        <div>
          <span>Seguridad</span>
          <h3>Cambiar contraseña</h3>
          <p>Próximamente podrás actualizar tu contraseña directamente desde el portal.</p>
        </div>
        <button>Cambiar contraseña</button>
      </div>
    </div>
  );
}

export default PerfilCliente;
