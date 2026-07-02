import { useState } from "react";
import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/Perfil.css";

/**
 * Perfil — datos personales del cliente, foto de avatar, cambio de contraseña
 * (flujo OTP simulado en frontend) y preferencias de notificación.
 *
 * Extraído del monolito Dashboard.jsx. AUTOCONTENIDO: el estado exclusivo del
 * perfil (edición, modal de clave, código OTP, preferencias, mensajes) vive
 * aquí; solo recibe como props lo COMPARTIDO con el resto del portal:
 * datosPerfil/setDatosPerfil, avatarPerfil/setAvatarPerfil y nombreCliente
 * (que también alimentan el header y el saludo).
 *
 * Estilos en su propio Perfil.css (clases perfil-*); las compartidas (pc-*)
 * siguen en PortalDashboard.css.
 */
function Perfil({
  datosPerfil,
  setDatosPerfil,
  avatarPerfil,
  setAvatarPerfil,
  nombreCliente,
}) {
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [pasoClave, setPasoClave] = useState("inicio");
  const [codigoSeguridad, setCodigoSeguridad] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [preferenciasPerfil, setPreferenciasPerfil] = useState({
    email: true,
    whatsapp: true,
    vencimientos: true,
    documentos: true,
    siniestros: true,
    pagos: false,
  });

  const rutCliente =
    datosPerfil.rut || localStorage.getItem("rut_cliente") || "—";
  const inicialCliente = (datosPerfil.nombre || nombreCliente || "C")
    .trim()
    .charAt(0)
    .toUpperCase();

  const actualizarDatoPerfil = (campo, valor) => {
    setDatosPerfil((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardarPerfil = () => {
    localStorage.setItem("nombre_cliente", datosPerfil.nombre || "Cliente");
    localStorage.setItem("correo_cliente", datosPerfil.correo || "");
    localStorage.setItem("telefono_cliente", datosPerfil.telefono || "");
    localStorage.setItem("direccion_cliente", datosPerfil.direccion || "");
    setEditandoPerfil(false);
    setMensajePerfil(
      "Datos actualizados correctamente. Cuando conectes backend, este cambio quedará guardado en la cuenta.",
    );
    setTimeout(() => setMensajePerfil(""), 4200);
  };

  const manejarAvatar = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      const resultado = String(lector.result || "");
      setAvatarPerfil(resultado);
      localStorage.setItem("avatar_cliente", resultado);
      setMensajePerfil("Foto de perfil actualizada correctamente.");
      setTimeout(() => setMensajePerfil(""), 3600);
    };
    lector.readAsDataURL(archivo);
  };

  const limpiarAvatar = () => {
    setAvatarPerfil("");
    localStorage.removeItem("avatar_cliente");
    setMensajePerfil("Foto de perfil eliminada.");
    setTimeout(() => setMensajePerfil(""), 3200);
  };

  const generarCodigoSeguridad = () => {
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    setCodigoSeguridad(codigo);
    setCodigoIngresado("");
    setNuevaClave("");
    setConfirmarClave("");
    setPasoClave("codigo");
    setMensajePerfil(
      `Código de seguridad generado para prueba frontend: ${codigo}`,
    );
    setTimeout(() => setMensajePerfil(""), 6500);
  };

  const validarCodigo = () => {
    if (codigoIngresado.trim() !== codigoSeguridad) {
      setMensajePerfil("El código ingresado no coincide.");
      setTimeout(() => setMensajePerfil(""), 3500);
      return;
    }

    setPasoClave("clave");
    setMensajePerfil("Código validado. Ingresa tu nueva contraseña.");
    setTimeout(() => setMensajePerfil(""), 3500);
  };

  const actualizarClave = () => {
    if (nuevaClave.length < 8) {
      setMensajePerfil("La contraseña debe tener al menos 8 caracteres.");
      setTimeout(() => setMensajePerfil(""), 3500);
      return;
    }

    if (nuevaClave !== confirmarClave) {
      setMensajePerfil("Las contraseñas no coinciden.");
      setTimeout(() => setMensajePerfil(""), 3500);
      return;
    }

    setModalClaveAbierto(false);
    setPasoClave("inicio");
    setCodigoSeguridad("");
    setCodigoIngresado("");
    setNuevaClave("");
    setConfirmarClave("");
    setMensajePerfil(
      "Contraseña actualizada en modo frontend. Después se conectará al backend con OTP real.",
    );
    setTimeout(() => setMensajePerfil(""), 5000);
  };

  const alternarPreferencia = (clave) => {
    setPreferenciasPerfil((actual) => ({ ...actual, [clave]: !actual[clave] }));
  };

  const inputPerfil = (label, campo, tipo = "text", bloqueado = false) => (
    <label className="perfil-field">
      <span className="perfil-field-label">{label}</span>

      {editandoPerfil && !bloqueado ? (
        <input
          type={tipo}
          className="perfil-field-input"
          value={datosPerfil[campo] || ""}
          onChange={(event) => actualizarDatoPerfil(campo, event.target.value)}
        />
      ) : (
        <strong className="perfil-field-value">
          {datosPerfil[campo] || "Pendiente"}
        </strong>
      )}
    </label>
  );

  const switchPerfil = (clave, titulo, bajada) => (
    <button
      type="button"
      className="perfil-switch"
      onClick={() => alternarPreferencia(clave)}
    >
      <span>
        <strong className="perfil-switch-title">{titulo}</strong>
        <small className="perfil-switch-sub">{bajada}</small>
      </span>

      <span
        className={`perfil-switch-toggle ${
          preferenciasPerfil[clave] ? "is-on" : ""
        }`}
      >
        <span className="perfil-switch-knob" />
      </span>
    </button>
  );

  return (
    <div className="pc-panel pc-full-panel perfil">
      <div className="perfil-wrap">
        {mensajePerfil && <div className="perfil-mensaje">{mensajePerfil}</div>}

        <section className="perfil-hero">
          <div className="perfil-hero-info">
            <div className="perfil-avatar">
              {avatarPerfil ? (
                <img src={avatarPerfil} alt="Foto de perfil" />
              ) : (
                <strong>{inicialCliente}</strong>
              )}
            </div>

            <div>
              <small className="perfil-hero-eyebrow">Mi cuenta</small>
              <h2>{datosPerfil.nombre || nombreCliente}</h2>
              <div className="perfil-chips">
                {[
                  `RUT ${rutCliente}`,
                  "Cliente activo",
                  "Persona natural",
                  "Backend ready",
                ].map((item) => (
                  <span key={item} className="perfil-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="perfil-hero-actions">
            <label className="perfil-btn-foto">
              Subir foto
              <input type="file" accept="image/*" onChange={manejarAvatar} />
            </label>

            {avatarPerfil && (
              <button
                type="button"
                className="perfil-btn-ghost"
                onClick={limpiarAvatar}
              >
                Quitar foto
              </button>
            )}

            <button
              type="button"
              className="perfil-btn-naranja"
              onClick={() =>
                editandoPerfil ? guardarPerfil() : setEditandoPerfil(true)
              }
            >
              {editandoPerfil ? "Guardar cambios" : "Editar perfil"}
            </button>
          </div>
        </section>

        <section className="perfil-stats">
          {[
            ["Último acceso", "Hoy", "Portal clientes"],
            ["Estado", "Activo", "Cliente Prieto & Correa"],
            ["Seguridad", "Protegida", "Código para cambios sensibles"],
            ["Notificaciones", "Activas", "Preferencias configurables"],
          ].map(([titulo, valor, bajada]) => (
            <article key={titulo} className="perfil-stat">
              <small>{titulo}</small>
              <strong className={valor === "Activo" ? "is-activo" : ""}>
                {valor}
              </strong>
              <span>{bajada}</span>
            </article>
          ))}
        </section>

        <section className="perfil-grid">
          <div className="perfil-col">
            <article className="perfil-card">
              <div className="perfil-card-head">
                <div>
                  <h3 className="perfil-card-title">Datos personales</h3>
                  <p className="perfil-card-sub">
                    Edita tus datos y confirma cambios sensibles cuando se
                    conecte el backend.
                  </p>
                </div>

                {editandoPerfil && (
                  <button
                    type="button"
                    className="perfil-btn-cancelar"
                    onClick={() => setEditandoPerfil(false)}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div className="perfil-datos-grid">
                {inputPerfil("Nombre / razón social", "nombre")}
                {inputPerfil("RUT", "rut", "text", true)}
                {inputPerfil("Correo", "correo", "email")}
                {inputPerfil("Teléfono", "telefono")}
                {inputPerfil("Dirección", "direccion")}
                <div className="perfil-field">
                  <span className="perfil-field-label">Tipo cliente</span>
                  <strong className="perfil-field-value">Persona natural</strong>
                </div>
              </div>
            </article>

            <article className="perfil-card">
              <h3 className="perfil-card-title">Preferencias de notificación</h3>
              <div className="perfil-prefs-grid">
                {switchPerfil(
                  "email",
                  "Correo electrónico",
                  "Avisos y comunicaciones generales",
                )}
                {switchPerfil(
                  "whatsapp",
                  "WhatsApp",
                  "Recordatorios y asistencia",
                )}
                {switchPerfil(
                  "vencimientos",
                  "Vencimientos",
                  "Alertas de pólizas y pagos",
                )}
                {switchPerfil(
                  "documentos",
                  "Documentos",
                  "Aviso de documentos disponibles",
                )}
                {switchPerfil(
                  "siniestros",
                  "Siniestros",
                  "Seguimiento de casos",
                )}
                {switchPerfil("pagos", "Pagos", "Recordatorios de cuotas")}
              </div>
            </article>
          </div>

          <aside className="perfil-aside">
            <article className="perfil-card perfil-card--dark">
              <h3 className="perfil-card-title">Seguridad de cuenta</h3>
              <p className="perfil-card-sub">
                Cambia tu contraseña usando un código de seguridad. En backend se
                enviará por correo o SMS.
              </p>
              <button
                type="button"
                className="perfil-btn-naranja perfil-btn-block"
                onClick={() => {
                  setModalClaveAbierto(true);
                  setPasoClave("inicio");
                }}
              >
                Cambiar contraseña
              </button>
            </article>

            <article className="perfil-card">
              <h3 className="perfil-card-title">Sesiones y actividad</h3>

              {[
                ["Inicio de sesión", "Hoy · Portal clientes"],
                ["Actualización de perfil", "Pendiente backend"],
                ["Cambio de contraseña", "Requiere código"],
              ].map(([titulo, texto]) => (
                <div key={titulo} className="perfil-list-item">
                  <strong className="perfil-list-title">{titulo}</strong>
                  <span className="perfil-list-sub">{texto}</span>
                </div>
              ))}
            </article>

            <article className="perfil-card">
              <h3 className="perfil-card-title">Privacidad y documentos</h3>
              {[
                "Política de privacidad",
                "Términos del portal",
                "Consentimiento de datos",
              ].map((item) => (
                <div key={item} className="perfil-list-item">
                  <strong className="perfil-list-title">{item}</strong>
                  <span className="perfil-list-sub">Disponible próximamente</span>
                </div>
              ))}
            </article>
          </aside>
        </section>

        {modalClaveAbierto && (
          <div className="perfil-modal-overlay">
            <div className="perfil-modal">
              <div className="perfil-modal-head">
                <div>
                  <h3 className="perfil-modal-title">Cambiar contraseña</h3>
                  <p className="perfil-modal-sub">
                    Flujo preparado para código de seguridad.
                  </p>
                </div>

                <button
                  type="button"
                  className="perfil-modal-close"
                  onClick={() => setModalClaveAbierto(false)}
                >
                  ×
                </button>
              </div>

              {pasoClave === "inicio" && (
                <div>
                  <p className="perfil-modal-intro">
                    Para proteger tu cuenta, primero se genera un código de
                    seguridad.
                  </p>

                  <button
                    type="button"
                    className="perfil-btn-naranja perfil-btn-block"
                    onClick={generarCodigoSeguridad}
                  >
                    Generar código de seguridad
                  </button>
                </div>
              )}

              {pasoClave === "codigo" && (
                <div className="perfil-modal-step">
                  <label className="perfil-modal-field">
                    <span>Código de seguridad</span>
                    <input
                      className="perfil-modal-input"
                      value={codigoIngresado}
                      onChange={(event) =>
                        setCodigoIngresado(event.target.value)
                      }
                      placeholder="Ingresa el código de 6 dígitos"
                    />
                  </label>

                  <button
                    type="button"
                    className="perfil-btn-azul perfil-btn-block"
                    onClick={validarCodigo}
                  >
                    Validar código
                  </button>
                </div>
              )}

              {pasoClave === "clave" && (
                <div className="perfil-modal-step">
                  <label className="perfil-modal-field">
                    <span>Nueva contraseña</span>
                    <input
                      type="password"
                      className="perfil-modal-input"
                      value={nuevaClave}
                      onChange={(event) => setNuevaClave(event.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </label>

                  <label className="perfil-modal-field">
                    <span>Confirmar contraseña</span>
                    <input
                      type="password"
                      className="perfil-modal-input"
                      value={confirmarClave}
                      onChange={(event) => setConfirmarClave(event.target.value)}
                      placeholder="Repite tu nueva contraseña"
                    />
                  </label>

                  <button
                    type="button"
                    className="perfil-btn-naranja perfil-btn-block"
                    onClick={actualizarClave}
                  >
                    Actualizar contraseña
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;
