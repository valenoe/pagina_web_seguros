import { useState } from "react";
import { subirFotoPerfil, fotoUrl } from "../../services/api";
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
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
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

  const mostrarMensaje = (texto, tipo = "info", ms = 4000) => {
    setMensaje({ texto, tipo });
    setTimeout(
      () => setMensaje((m) => (m.texto === texto ? { texto: "", tipo } : m)),
      ms,
    );
  };

  const guardarPerfil = () => {
    localStorage.setItem("nombre_cliente", datosPerfil.nombre || "Cliente");
    localStorage.setItem("correo_cliente", datosPerfil.correo || "");
    localStorage.setItem("telefono_cliente", datosPerfil.telefono || "");
    localStorage.setItem("direccion_cliente", datosPerfil.direccion || "");
    setEditandoPerfil(false);
    mostrarMensaje("Datos actualizados correctamente.", "success", 4200);
  };

  const manejarAvatar = async (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const anterior = avatarPerfil;
    // vista previa inmediata mientras se sube al servidor
    setAvatarPerfil(URL.createObjectURL(archivo));
    mostrarMensaje("Subiendo foto...", "info", 10000);

    try {
      const token = localStorage.getItem("token");
      const cuenta = await subirFotoPerfil(token, archivo);
      const url = fotoUrl(cuenta.foto_perfil);
      setAvatarPerfil(url);
      localStorage.setItem("avatar_cliente", url);
      mostrarMensaje(
        "Foto de perfil actualizada correctamente.",
        "success",
        3600,
      );
    } catch (error) {
      setAvatarPerfil(anterior);
      mostrarMensaje(
        `No se pudo subir la foto. ${error.message || "Revisa tu conexión con el servidor."}`,
        "error",
        5000,
      );
    }
  };

  const limpiarAvatar = () => {
    setAvatarPerfil("");
    localStorage.removeItem("avatar_cliente");
    mostrarMensaje("Foto de perfil eliminada.", "info", 3200);
  };

  const generarCodigoSeguridad = () => {
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    setCodigoSeguridad(codigo);
    setCodigoIngresado("");
    setNuevaClave("");
    setConfirmarClave("");
    setPasoClave("codigo");
    mostrarMensaje(
      `Código de seguridad generado para prueba frontend: ${codigo}`,
      "info",
      6500,
    );
  };

  const validarCodigo = () => {
    if (codigoIngresado.trim() !== codigoSeguridad) {
      mostrarMensaje("El código ingresado no coincide.", "error", 3500);
      return;
    }

    setPasoClave("clave");
    mostrarMensaje(
      "Código validado. Ingresa tu nueva contraseña.",
      "success",
      3500,
    );
  };

  const actualizarClave = () => {
    if (nuevaClave.length < 8) {
      mostrarMensaje(
        "La contraseña debe tener al menos 8 caracteres.",
        "error",
        3500,
      );
      return;
    }

    if (nuevaClave !== confirmarClave) {
      mostrarMensaje("Las contraseñas no coinciden.", "error", 3500);
      return;
    }

    setModalClaveAbierto(false);
    setPasoClave("inicio");
    setCodigoSeguridad("");
    setCodigoIngresado("");
    setNuevaClave("");
    setConfirmarClave("");
    mostrarMensaje("Contraseña actualizada correctamente.", "success", 5000);
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
        {mensaje.texto && (
          <div className={`perfil-mensaje perfil-mensaje--${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

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
                <span className="perfil-chip">RUT {rutCliente}</span>
              </div>
            </div>
          </div>

          <div className="perfil-hero-actions">
            <label className="perfil-btn-foto">
              {avatarPerfil ? "Cambiar foto" : "Subir foto"}
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
