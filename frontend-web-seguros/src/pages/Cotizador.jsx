import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import "../styles/pages/Cotizador.css";
import Footer from "../components/Footer";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros, enviarCotizacion } from "../services/api";

const regionesComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  Maule: ["Talca", "Constitución", "Curicó", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Metropolitana de Santiago": ["Santiago", "San Miguel", "Ñuñoa", "Providencia", "Las Condes", "Maipú", "La Florida", "Puente Alto"],
};

function Cotizador() {
  const navigate = useNavigate();
  const location = useLocation();

  const preseleccionado = location.state?.id_seguro ?? "";

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

  const regiones = Object.keys(regionesComunas);

  const regionesFiltradas = regiones.filter((r) =>
    r.toLowerCase().includes(busquedaRegion.toLowerCase())
  );

  const todasLasComunas = regiones.flatMap((r) =>
    regionesComunas[r].map((c) => ({
      comuna: c,
      region: r,
    }))
  );

  const comunasFiltradas = todasLasComunas.filter((item) =>
    `${item.comuna} ${item.region}`
      .toLowerCase()
      .includes(busquedaComuna.toLowerCase())
  );

  function cambiarDato(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  function seleccionarRegion(region) {
    setFormulario({
      ...formulario,
      region,
      comuna: "",
    });

    setBusquedaRegion(region);
    setBusquedaComuna("");
  }

  function seleccionarComuna(item) {
    setFormulario({
      ...formulario,
      region: item.region,
      comuna: item.comuna,
    });

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

  setEnviando(true);

  try {
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
      },
    };

    console.log("DATA ENVIADA:", data);

    await enviarCotizacion(data);

    navigate("/cotizacion-exitosa");

  } catch (error) {
    console.error("ERROR COMPLETO:", error);

    setError(
      error.message ||
      "No se pudo enviar la solicitud."
    );

  } finally {
    setEnviando(false);
  }
}

  return (
    <>
      <Header />

      <section className="cotizador">
        <div className="cotizador-header">
          <span>Cotizador</span>
          <h1>Cotiza tu seguro</h1>
          <p>Completa tus datos y un asesor te contactará.</p>
        </div>

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
              />
            </div>

            <div>
              <label>Tipo de cliente *</label>
              <select
                name="tipo_cliente"
                required
                value={formulario.tipo_cliente}
                onChange={cambiarDato}
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
                  setFormulario({
                    ...formulario,
                    region: "",
                    comuna: "",
                  });
                }}
                placeholder="Ej: Maule"
              />

              {busquedaRegion && !formulario.region && (
                <div className="suggestions">
                  {regionesFiltradas.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => seleccionarRegion(r)}
                    >
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
                  setFormulario({
                    ...formulario,
                    comuna: "",
                  });
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

      <Footer />
    </>
  );
}

export default Cotizador;