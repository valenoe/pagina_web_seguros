import { useState, useEffect } from "react";
import { useCliente } from "../../context/ClienteContext";
import { regionesComunas } from "../../data/regionesComunas";
import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/Perfil.css";

const REGIONES = Object.keys(regionesComunas);

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
  const { cliente, actualizarCliente, subirFoto } = useCliente();

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

  const limpiarAvatar = () => {
    // Solo limpia la vista previa local. No hay endpoint de borrado todavía, así
    // que al recargar la foto del servidor vuelve (gap conocido en el handoff).
    setAvatarPerfil("");
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
