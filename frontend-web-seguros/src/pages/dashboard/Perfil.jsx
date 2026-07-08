import { useState, useEffect } from "react";
import { useCliente } from "../../context/ClienteContext";
import { cambiarPassword } from "../../services/api";
import { regionesComunas } from "../../data/regionesComunas";
import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/Perfil.css";

const REGIONES = Object.keys(regionesComunas);

// Valores por defecto de las preferencias de notificación (cuando el cliente
// aún no las ha guardado nunca).
const PREFERENCIAS_DEFAULT = {
  email: true,
  whatsapp: true,
  vencimientos: true,
  documentos: true,
  siniestros: true,
  pagos: true,
};

// Íconos SVG del ojo (abierto / tachado), estilo línea.
function IconoOjo({ abierto }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {abierto ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

/**
 * Campo de contraseña con botón "ojito" para mostrar/ocultar.
 * `autoComplete="new-password"` evita que el navegador autocomplete la
 * contraseña guardada (si lo hiciera, con el ojito quedaría a la vista).
 */
function CampoClave({ label, value, onChange, placeholder }) {
  const [ver, setVer] = useState(false);
  return (
    <label className="perfil-modal-field">
      <span>{label}</span>
      <div className="perfil-clave-wrap">
        <input
          type={ver ? "text" : "password"}
          className="perfil-modal-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="perfil-clave-ojo"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <IconoOjo abierto={!ver} />
        </button>
      </div>
    </label>
  );
}

/**
 * Perfil — datos personales del cliente, foto de avatar, cambio de contraseña
 * (flujo OTP simulado en frontend) y preferencias de notificación.
 *
 * La identidad del cliente sale del ClienteContext (única fuente = API). El
 * formulario mantiene un BORRADOR local editable (`datosPerfil`) que se
 * sincroniza cuando llega/cambia `cliente`, y al guardar se envía a la BD con
 * `actualizarCliente`. No se toca localStorage (salvo el token, que es de sesión).
 *
 * Estilos en su propio Perfil.css (clases perfil-*); las compartidas (pc-*)
 * siguen en PortalDashboard.css.
 */
function Perfil() {
  const { cliente, actualizarCliente, subirFoto, eliminarFoto } = useCliente();

  const nombreCliente = cliente?.nombre || "Cliente";

  // Borrador editable del formulario, sembrado desde el contexto.
  const [datosPerfil, setDatosPerfil] = useState(() => cliente || {});
  const [avatarPerfil, setAvatarPerfil] = useState(cliente?.foto || "");

  // Cuando el contexto trae/actualiza el cliente, se refresca el borrador
  // (salvo mientras se está editando, para no pisar lo que el usuario escribe).
  useEffect(() => {
    if (cliente) setAvatarPerfil(cliente.foto || "");
  }, [cliente]);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [claveActual, setClaveActual] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
  const [preferenciasPerfil, setPreferenciasPerfil] = useState({
    ...PREFERENCIAS_DEFAULT,
    ...(cliente?.preferencias || {}),
  });

  // Sincroniza las preferencias con lo guardado en la BD cuando llega el cliente.
  useEffect(() => {
    if (cliente?.preferencias) {
      setPreferenciasPerfil({ ...PREFERENCIAS_DEFAULT, ...cliente.preferencias });
    }
  }, [cliente]);

  // Refresca el borrador con lo de la BD cuando NO se está editando (así no se
  // pisa lo que el usuario escribe; al guardar/cancelar vuelve a tomar la verdad).
  useEffect(() => {
    if (cliente && !editandoPerfil) setDatosPerfil(cliente);
  }, [cliente, editandoPerfil]);

  const rutCliente = datosPerfil.rut || "—";
  const esEmpresa = datosPerfil.tipo_cliente === "empresa";
  const tipoClienteLabel = esEmpresa ? "Empresa" : "Persona natural";
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

  const guardarPerfil = async () => {
    // null = "no cambiar" (el backend ignora los campos None); "" quedaría guardado.
    const payload = {
      nombre: datosPerfil.nombre || null,
      email: datosPerfil.correo || null,
      telefono: datosPerfil.telefono || null,
      whatsapp: datosPerfil.whatsapp || null,
      direccion: datosPerfil.direccion || null,
    };
    if (datosPerfil.region !== undefined) payload.region = datosPerfil.region || null;
    if (datosPerfil.comuna !== undefined) payload.comuna = datosPerfil.comuna || null;
    if (datosPerfil.fecha_nacimiento !== undefined)
      payload.fecha_nacimiento = datosPerfil.fecha_nacimiento || null;

    try {
      // Guarda en la BD y refresca el contexto → header/saludo/otras vistas se
      // actualizan solos (sin copias en localStorage).
      await actualizarCliente(payload);
      setEditandoPerfil(false);
      mostrarMensaje("Datos actualizados correctamente.", "success", 4200);
    } catch (error) {
      mostrarMensaje(
        `No se pudo guardar. ${error.message || "Revisa tu conexión con el servidor."}`,
        "error",
        5000,
      );
    }
  };

  const manejarAvatar = async (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const anterior = avatarPerfil;
    // vista previa inmediata mientras se sube al servidor
    setAvatarPerfil(URL.createObjectURL(archivo));
    mostrarMensaje("Subiendo foto...", "info", 10000);

    try {
      // subirFoto (contexto) hace el POST y refresca `cliente` → el useEffect
      // de arriba pone la URL final del servidor en el avatar.
      await subirFoto(archivo);
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

  const limpiarAvatar = async () => {
    const anterior = avatarPerfil;
    setAvatarPerfil(""); // optimista
    try {
      await eliminarFoto(); // borra en el servidor y refresca el contexto
      mostrarMensaje("Foto de perfil eliminada.", "info", 3200);
    } catch (error) {
      setAvatarPerfil(anterior);
      mostrarMensaje(
        `No se pudo eliminar la foto. ${error.message || "Revisa tu conexión."}`,
        "error",
        4500,
      );
    }
  };

  const cerrarModalClave = () => {
    setModalClaveAbierto(false);
    setClaveActual("");
    setNuevaClave("");
    setConfirmarClave("");
  };

  const actualizarClave = async () => {
    if (nuevaClave.length < 6) {
      mostrarMensaje(
        "La contraseña nueva debe tener al menos 6 caracteres.",
        "error",
        3500,
      );
      return;
    }

    if (nuevaClave !== confirmarClave) {
      mostrarMensaje("Las contraseñas no coinciden.", "error", 3500);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await cambiarPassword(token, {
        password_actual: claveActual,
        password_nueva: nuevaClave,
      });
      cerrarModalClave();
      mostrarMensaje("Contraseña actualizada correctamente.", "success", 5000);
    } catch (error) {
      // el backend responde "La contraseña actual no es correcta", etc.
      mostrarMensaje(
        error.message || "No se pudo cambiar la contraseña.",
        "error",
        5000,
      );
    }
  };

  const alternarPreferencia = async (clave) => {
    const previas = preferenciasPerfil;
    const nuevas = { ...previas, [clave]: !previas[clave] };
    setPreferenciasPerfil(nuevas); // optimista: se ve el cambio al instante

    try {
      await actualizarCliente({ preferencias_notificacion: nuevas });
    } catch (error) {
      setPreferenciasPerfil(previas); // revierte si el guardado falla
      mostrarMensaje(
        `No se pudo guardar la preferencia. ${error.message || "Revisa tu conexión."}`,
        "error",
        4000,
      );
    }
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

  // Región y comuna: selects dependientes (la comuna depende de la región).
  const selectRegion = () => (
    <label className="perfil-field">
      <span className="perfil-field-label">Región</span>
      {editandoPerfil ? (
        <select
          className="perfil-field-input"
          value={datosPerfil.region || ""}
          onChange={(event) =>
            // cambiar región resetea la comuna
            setDatosPerfil((actual) => ({
              ...actual,
              region: event.target.value,
              comuna: "",
            }))
          }
        >
          <option value="">Selecciona región</option>
          {REGIONES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ) : (
        <strong className="perfil-field-value">
          {datosPerfil.region || "Pendiente"}
        </strong>
      )}
    </label>
  );

  const selectComuna = () => (
    <label className="perfil-field">
      <span className="perfil-field-label">Comuna</span>
      {editandoPerfil ? (
        <select
          className="perfil-field-input"
          value={datosPerfil.comuna || ""}
          disabled={!datosPerfil.region}
          onChange={(event) => actualizarDatoPerfil("comuna", event.target.value)}
        >
          <option value="">
            {datosPerfil.region ? "Selecciona comuna" : "Elige región primero"}
          </option>
          {(regionesComunas[datosPerfil.region] || []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <strong className="perfil-field-value">
          {datosPerfil.comuna || "Pendiente"}
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
                {!esEmpresa &&
                  inputPerfil("Fecha de nacimiento", "fecha_nacimiento", "date")}
                {inputPerfil("Correo", "correo", "email")}
                {inputPerfil("Teléfono", "telefono")}
                {inputPerfil("WhatsApp", "whatsapp")}
                {inputPerfil("Dirección", "direccion")}
                {selectRegion()}
                {selectComuna()}
                <div className="perfil-field">
                  <span className="perfil-field-label">Tipo cliente</span>
                  <strong className="perfil-field-value">
                    {tipoClienteLabel}
                  </strong>
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
                Cambia tu contraseña ingresando la actual. Si la olvidaste,
                podrás recuperarla desde el inicio de sesión (próximamente).
              </p>
              <button
                type="button"
                className="perfil-btn-naranja perfil-btn-block"
                onClick={() => setModalClaveAbierto(true)}
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
                    Ingresa tu contraseña actual y la nueva.
                  </p>
                </div>

                <button
                  type="button"
                  className="perfil-modal-close"
                  onClick={cerrarModalClave}
                >
                  ×
                </button>
              </div>

              <div className="perfil-modal-step">
                <CampoClave
                  label="Contraseña actual"
                  value={claveActual}
                  onChange={(event) => setClaveActual(event.target.value)}
                  placeholder="Tu contraseña actual"
                />

                <CampoClave
                  label="Nueva contraseña"
                  value={nuevaClave}
                  onChange={(event) => setNuevaClave(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />

                <CampoClave
                  label="Confirmar contraseña"
                  value={confirmarClave}
                  onChange={(event) => setConfirmarClave(event.target.value)}
                  placeholder="Repite tu nueva contraseña"
                />

                <button
                  type="button"
                  className="perfil-btn-naranja perfil-btn-block"
                  onClick={actualizarClave}
                >
                  Actualizar contraseña
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;
