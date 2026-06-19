import "../styles/pages/PerfilCliente.css";

function PerfilCliente() {
  const nombreCliente = localStorage.getItem("nombre_cliente") || "Cliente";

  const perfil = {
    nombre: nombreCliente,
    rut: localStorage.getItem("rut_cliente") || "12.456.789-3",
    correo: localStorage.getItem("correo_cliente") || "correo@cliente.cl",
    telefono: localStorage.getItem("telefono_cliente") || "+56 9 0000 0000",
    tipoCliente: localStorage.getItem("tipo_cliente") || "Persona natural",
  };

  function cambiarPassword() {
    alert("Función pendiente de conectar con backend.");
  }

  return (
    <div className="perfil-cliente">
      <div className="perfil-cliente-header">
        <span>Perfil cliente</span>
        <h2>Hola, {perfil.nombre} 👋</h2>
        <p>
          Revisa tus datos de contacto y la información asociada a tu cuenta.
        </p>
      </div>

      <div className="perfil-cliente-grid">
        <div className="perfil-cliente-card">
          <small>RUT</small>
          <strong>{perfil.rut}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Correo</small>
          <strong>{perfil.correo}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Teléfono</small>
          <strong>{perfil.telefono}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Tipo cliente</small>
          <strong>{perfil.tipoCliente}</strong>
        </div>
      </div>

      <div className="perfil-cliente-security">
        <div>
          <span>Seguridad</span>
          <h3>Cambiar contraseña</h3>
          <p>
            Próximamente podrás actualizar tu contraseña directamente desde el
            portal.
          </p>
        </div>

        <button onClick={cambiarPassword}>Cambiar contraseña</button>
      </div>
    </div>
  );
}

export default PerfilCliente;