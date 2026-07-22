import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/pages/Cotizador.css";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros, enviarCotizacion } from "../services/api";
import { regionesComunas } from "../data/regionesComunas";
import { camposDeRamo } from "../data/materiaPorRamo";
import { useCliente } from "../context/ClienteContext";

/*
  Formulario de cotización REUTILIZABLE (un solo formato para todo el sitio).
  Lo usan:
    - la web pública  → pages/Cotizador.jsx  (con Header/Footer)
    - el portal cliente → pages/dashboard/ExplorarSeguros.jsx (dentro del marco
      del dashboard, con menú + botón de cuenta/cerrar sesión)

  No incluye Header/Footer: eso lo pone cada contenedor. El cotizador simple
  anterior del portal se conservó en pages/dashboard/ExplorarSeguros_viejo.jsx.
*/
function CotizadorForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const preseleccionado = location.state?.id_seguro ?? "";

  const { cliente } = useCliente();

  const { data: seguros, loading: loadingSeguros } = useFetch(obtenerSeguros);

  const [formulario, setFormulario] = useState({
    nombre: "",
    rut: "",
    tipo_cliente: "persona",
    email: "",
    telefono: "",
    region: "",
    comuna: "",
    id_seguro: preseleccionado,
    mensaje: "",
  });

  const [busquedaRegion, setBusquedaRegion] = useState("");
  const [busquedaComuna, setBusquedaComuna] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Valores de los campos específicos del ramo del seguro elegido (por clave).
  const [datosRamo, setDatosRamo] = useState({});

  // Si hay sesión iniciada, precarga los datos del cliente (sin pisar lo que el
  // usuario ya haya empezado a escribir). Un invitado NO se autocompleta.
  useEffect(() => {
    if (!cliente) return;
    setFormulario((f) => ({
      ...f,
      nombre: f.nombre || cliente.nombre || "",
      rut: f.rut || cliente.rut || "",
      tipo_cliente: cliente.tipo_cliente || f.tipo_cliente,
      email: f.email || cliente.correo || "",
      telefono: f.telefono || cliente.telefono || "",
      region: f.region || cliente.region || "",
      comuna: f.comuna || cliente.comuna || "",
    }));
    if (cliente.region) setBusquedaRegion((b) => b || cliente.region);
    if (cliente.comuna) setBusquedaComuna((b) => b || cliente.comuna);
  }, [cliente]);

  // Seguro elegido → su ramo → plantilla de campos. Los campos con `condicion`
  // solo se muestran si el campo del que dependen tiene el valor indicado.
  const seguroSel = (seguros || []).find(
    (s) => String(s.id_seguro) === String(formulario.id_seguro),
  );
  const camposRamo = camposDeRamo(seguroSel?.ramo);
  const camposVisibles = camposRamo.filter(
    (c) => !c.condicion || datosRamo[c.condicion.campo] === c.condicion.igual,
  );

  const regiones = Object.keys(regionesComunas);

  const regionesFiltradas = regiones.filter((r) =>
    r.toLowerCase().includes(busquedaRegion.toLowerCase()),
  );

  const todasLasComunas = regiones.flatMap((r) =>
    regionesComunas[r].map((c) => ({ comuna: c, region: r })),
  );

  const comunasFiltradas = todasLasComunas.filter((item) =>
    `${item.comuna} ${item.region}`
      .toLowerCase()
      .includes(busquedaComuna.toLowerCase()),
  );

  function cambiarDato(e) {
    const { name, value } = e.target;
    // Al cambiar el seguro cambia el ramo → se limpian los campos específicos.
    if (name === "id_seguro") setDatosRamo({});
    setFormulario({ ...formulario, [name]: value });
  }

  function cambiarDatoRamo(clave, valor) {
    setDatosRamo((prev) => ({ ...prev, [clave]: valor }));
  }

  // Marca/desmarca una opción en un campo de selección múltiple.
  function alternarMulti(clave, opcion) {
    setDatosRamo((prev) => {
      const actual = prev[clave] || [];
      const nuevo = actual.includes(opcion)
        ? actual.filter((o) => o !== opcion)
        : [...actual, opcion];
      return { ...prev, [clave]: nuevo };
    });
  }

  // Dibuja el control de un campo del ramo según su tipo.
  function renderCampo(c) {
    const val = datosRamo[c.clave];

    if (c.tipo === "select") {
      return (
        <select
          value={val || ""}
          onChange={(e) => cambiarDatoRamo(c.clave, e.target.value)}
        >
          <option value="">Selecciona</option>
          {c.opciones.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    }

    if (c.tipo === "radio") {
      return (
        <div className="cotizador-opciones">
          {c.opciones.map((op) => (
            <label key={op} className="cotizador-opcion">
              <input
                type="radio"
                name={c.clave}
                checked={val === op}
                onChange={() => cambiarDatoRamo(c.clave, op)}
              />
              {op}
            </label>
          ))}
        </div>
      );
    }

    if (c.tipo === "multiselect") {
      const arr = val || [];
      return (
        <div className="cotizador-opciones">
          {c.opciones.map((op) => (
            <label key={op} className="cotizador-opcion">
              <input
                type="checkbox"
                checked={arr.includes(op)}
                onChange={() => alternarMulti(c.clave, op)}
              />
              {op}
            </label>
          ))}
        </div>
      );
    }

    if (c.tipo === "file") {
      return (
        <input type="file" disabled title="El adjunto se gestiona con el asesor" />
      );
    }

    return (
      <input
        type={c.tipo === "number" ? "number" : c.tipo === "date" ? "date" : "text"}
        value={val || ""}
        onChange={(e) => cambiarDatoRamo(c.clave, e.target.value)}
      />
    );
  }

  function seleccionarRegion(region) {
    setFormulario({ ...formulario, region, comuna: "" });
    setBusquedaRegion(region);
    setBusquedaComuna("");
  }

  function seleccionarComuna(item) {
    setFormulario({ ...formulario, region: item.region, comuna: item.comuna });
    setBusquedaRegion(item.region);
    setBusquedaComuna(item.comuna);
  }

  async function enviarCotizacionHandler(e) {
    e.preventDefault();
    setError("");

    if (!formulario.id_seguro) {
      setError("Selecciona un tipo de seguro.");
      return;
    }

    // Campos del ramo marcados como obligatorios (solo los visibles; los de
    // archivo se gestionan con el asesor, no bloquean).
    const faltante = camposVisibles.find((c) => {
      if (!c.requerido || c.tipo === "file") return false;
      const v = datosRamo[c.clave];
      return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    });
    if (faltante) {
      setError(`Completa el campo "${faltante.etiqueta}".`);
      return;
    }

    setEnviando(true);

    try {
      // Campos del ramo (solo los visibles y con valor; los de archivo no se
      // envían por ahora — el adjunto se gestiona con el asesor).
      const extraRamo = {};
      camposVisibles.forEach((c) => {
        if (c.tipo === "file") return;
        const v = datosRamo[c.clave];
        const vacio =
          v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
        if (!vacio) extraRamo[c.clave] = v;
      });

      const data = {
        id_seguro: Number(formulario.id_seguro),
        nombre: formulario.nombre,
        rut: formulario.rut,
        tipo_cliente: formulario.tipo_cliente,
        email: formulario.email,
        telefono: formulario.telefono,
        canal: "tradicional",
        mensaje: formulario.mensaje || "",
        datos_adicionales: {
          region: formulario.region || "",
          comuna: formulario.comuna || "",
          ...extraRamo,
        },
      };

      await enviarCotizacion(data);
      // Con sesión → éxito DENTRO del portal (menú + logout a mano); invitado →
      // la página pública de éxito.
      navigate(
        cliente ? "/clientes/dashboard/cotizacion-exitosa" : "/cotizacion-exitosa",
      );
    } catch (error) {
      console.error("ERROR COTIZACIÓN:", error);
      setError(error.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cotizador">
      <div className="cotizador-header">
        <h1>Cotiza tu seguro</h1>
        <p>Completa tus datos y un asesor te contactará.</p>
      </div>

      {!cliente && (
        <div className="cotizador-aviso">
          <span>¿Ya tienes cuenta? Inicia sesión y usamos tus datos guardados.</span>
          <div className="cotizador-aviso-acciones">
            <Link
              className="cotizador-aviso-btn"
              to="/login-clientes?redirect=/clientes/dashboard/explora"
            >
              Iniciar sesión
            </Link>
            <Link className="cotizador-aviso-link" to="/registro-clientes">
              Crear cuenta
            </Link>
          </div>
        </div>
      )}

      <div className="cotizador-box">
        <form className="cotizador-form" onSubmit={enviarCotizacionHandler}>
          <div>
            <label>Nombre completo *</label>
            <input
              name="nombre"
              required
              value={formulario.nombre}
              onChange={cambiarDato}
              placeholder="Ej: Matías González"
              disabled={!!cliente}
            />
          </div>

          <div>
            <label>RUT *</label>
            <input
              name="rut"
              required
              value={formulario.rut}
              onChange={cambiarDato}
              placeholder="12.345.678-9"
              disabled={!!cliente}
            />
          </div>

          <div>
            <label>Tipo de cliente *</label>
            <select
              name="tipo_cliente"
              required
              value={formulario.tipo_cliente}
              onChange={cambiarDato}
              disabled={!!cliente}
            >
              <option value="persona">Persona natural</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>

          <div>
            <label>Correo electrónico *</label>
            <input
              type="email"
              name="email"
              required
              value={formulario.email}
              onChange={cambiarDato}
              placeholder="correo@ejemplo.cl"
            />
          </div>

          <div>
            <label>Teléfono *</label>
            <input
              name="telefono"
              required
              value={formulario.telefono}
              onChange={cambiarDato}
              placeholder="+56 9 XXXX XXXX"
            />
          </div>

          <div className="search-field">
            <label>Buscar región</label>
            <input
              value={busquedaRegion}
              onChange={(e) => {
                setBusquedaRegion(e.target.value);
                setFormulario({ ...formulario, region: "", comuna: "" });
              }}
              placeholder="Ej: Maule"
            />

            {busquedaRegion && !formulario.region && (
              <div className="suggestions">
                {regionesFiltradas.map((r) => (
                  <button type="button" key={r} onClick={() => seleccionarRegion(r)}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="search-field">
            <label>Buscar comuna</label>
            <input
              value={busquedaComuna}
              onChange={(e) => {
                setBusquedaComuna(e.target.value);
                setFormulario({ ...formulario, comuna: "" });
              }}
              placeholder="Ej: Talca"
            />

            {busquedaComuna && !formulario.comuna && (
              <div className="suggestions">
                {comunasFiltradas.slice(0, 12).map((item) => (
                  <button
                    type="button"
                    key={`${item.region}-${item.comuna}`}
                    onClick={() => seleccionarComuna(item)}
                  >
                    {item.comuna} — {item.region}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label>Tipo de seguro *</label>
            <select
              name="id_seguro"
              required
              value={formulario.id_seguro}
              onChange={cambiarDato}
              disabled={loadingSeguros}
            >
              <option value="">
                {loadingSeguros ? "Cargando seguros..." : "Selecciona seguro"}
              </option>

              {(seguros || [])
                .filter((s) => s.permite_tradicional)
                .map((s) => (
                  <option key={s.id_seguro} value={s.id_seguro}>
                    {s.nombre}
                  </option>
                ))}
            </select>
          </div>

          {camposVisibles.length > 0 && (
            <h3 className="cotizador-subtitulo cotizador-full">Datos del seguro</h3>
          )}

          {camposVisibles.map((c) => (
            <div
              key={c.clave}
              className={
                c.tipo === "radio" || c.tipo === "multiselect"
                  ? "cotizador-full"
                  : undefined
              }
            >
              <label>
                {c.etiqueta}
                {c.requerido && " *"}
              </label>
              {renderCampo(c)}
            </div>
          ))}

          <div className="cotizador-full">
            <label>Mensaje</label>
            <textarea
              name="mensaje"
              value={formulario.mensaje}
              onChange={cambiarDato}
              placeholder="Cuéntanos brevemente qué necesitas"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>

        <div className="cotizador-info">
          <h2>¿Qué pasa después?</h2>

          <ul>
            <li>Recibimos tu solicitud de cotización.</li>
            <li>Analizamos las mejores opciones según tus necesidades.</li>
            <li>Un asesor de Prieto & Correa se pondrá en contacto contigo.</li>
            <li>Te acompañamos para resolver dudas y comparar alternativas.</li>
            <li>Recibes una propuesta personalizada para tomar tu decisión.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default CotizadorForm;
