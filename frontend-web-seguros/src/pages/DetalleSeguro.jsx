import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerSeguros } from "../services/api";

const WHATSAPP_EJECUTIVO = "56966541939";

function iconoPorNombre(nombre) {
  if (!nombre) return "🛡";
  const n = nombre.toLowerCase();
  if (n.includes("auto")) return "🚗";
  if (n.includes("rci") || n.includes("argentin")) return "🇦🇷";
  if (n.includes("soap")) return "🛡";
  if (n.includes("hogar")) return "🏠";
  if (n.includes("mujer")) return "👩";
  if (n.includes("accidente")) return "🧑";
  if (n.includes("viaje")) return "✈️";
  if (n.includes("mascota")) return "🐾";
  if (n.includes("garantí") || n.includes("garanti")) return "📄";
  return "🛡";
}

// Coberturas, beneficios y requisitos no existen en la BD — se mantienen localmente por nombre del seguro
const CONTENIDO_EXTRA = {
  "seguro de autos": {
    coberturas: [
      "Daños materiales al vehículo",
      "Robo, hurto o uso no autorizado",
      "Responsabilidad civil frente a terceros",
      "Daños por incendio",
      "Asistencia en ruta según plan contratado",
      "Vehículo de reemplazo según condiciones de la póliza",
    ],
    beneficios: [
      "Asesoría directa con ejecutivo",
      "Gestión de cotización con distintas compañías",
      "Apoyo en renovación de póliza",
      "Orientación ante siniestros",
    ],
    requisitos: [
      "Permiso de circulación vigente",
      "Padrón del vehículo",
      "Datos del conductor principal",
      "Inspección si la compañía lo solicita",
    ],
  },
  "rci argentina": {
    coberturas: [
      "Responsabilidad civil internacional",
      "Daños a terceros en territorio argentino",
      "Cobertura exigida para cruce fronterizo",
    ],
    beneficios: [
      "Apoyo para viajes internacionales",
      "Cotización rápida",
      "Seguro obligatorio para ingresar a Argentina",
    ],
    requisitos: ["Patente del vehículo", "Fechas del viaje", "Datos del conductor"],
  },
  "soap": {
    coberturas: [
      "Muerte accidental",
      "Incapacidad permanente",
      "Gastos médicos",
      "Atención para conductor, pasajeros y peatones afectados",
    ],
    beneficios: [
      "Obligatorio para obtener permiso de circulación",
      "Contratación rápida",
      "Cobertura legal exigida en Chile",
    ],
    requisitos: ["Patente del vehículo", "Tipo de vehículo", "Datos del propietario"],
  },
  "seguro de hogar": {
    coberturas: [
      "Incendio",
      "Sismo según plan contratado",
      "Daños en estructura",
      "Daños en contenido",
      "Asistencia de gasfitería",
      "Asistencia de cerrajería",
      "Asistencia eléctrica",
    ],
    beneficios: [
      "Protección para vivienda principal o secundaria",
      "Asistencias técnicas para el hogar",
      "Opciones según valor asegurado",
    ],
    requisitos: [
      "Dirección de la vivienda",
      "Tipo de propiedad",
      "Valor aproximado de construcción y contenido",
    ],
  },
  "mujer segura": {
    coberturas: [
      "Muerte accidental",
      "Incapacidad total y permanente",
      "Desmembramiento",
      "Gastos de sepelio según plan",
    ],
    beneficios: [
      "Protección personal",
      "Contratación simple",
      "Prima accesible según producto disponible",
    ],
    requisitos: ["Datos personales", "RUT", "Edad dentro del rango permitido"],
  },
  "seguro de accidentes personales": {
    coberturas: [
      "Muerte accidental",
      "Invalidez total y permanente",
      "Gastos médicos por accidente",
    ],
    beneficios: [
      "Protección para personas naturales",
      "Con o sin actividad laboral",
      "Contratación flexible",
    ],
    requisitos: ["Datos personales", "RUT", "Información laboral si aplica"],
  },
  "asistencia en viaje": {
    coberturas: [
      "Atención médica en viaje",
      "Hospitalización",
      "Repatriación",
      "Pérdida de equipaje",
      "Cancelación de viaje según plan contratado",
    ],
    beneficios: [
      "Protección durante viajes internacionales",
      "Asistencia ante emergencias",
      "Planes según destino y duración",
    ],
    requisitos: ["Destino del viaje", "Fechas de salida y regreso", "Edad de los viajeros"],
  },
  "seguro de mascotas": {
    coberturas: [
      "Consultas veterinarias",
      "Accidentes",
      "Enfermedades",
      "Exámenes según plan contratado",
      "Urgencias veterinarias",
    ],
    beneficios: [
      "Planes según necesidad de la mascota",
      "Apoyo ante gastos veterinarios",
      "Contratación simple",
    ],
    requisitos: ["Nombre de la mascota", "Edad", "Raza", "Datos del dueño"],
  },
  "seguro de garantías": {
    coberturas: [
      "Seriedad de oferta",
      "Fiel cumplimiento de contrato",
      "Correcta ejecución de obras",
      "Garantías exigidas en licitaciones",
    ],
    beneficios: [
      "Apoyo para empresas y contratistas",
      "Respaldo ante obligaciones contractuales",
      "Gestión con compañías aseguradoras",
    ],
    requisitos: [
      "Datos de la empresa",
      "Contrato o bases de licitación",
      "Monto requerido",
      "Plazo de vigencia",
    ],
  },
};

function DetalleSeguro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seguro, setSeguro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const nombreDecodificado = decodeURIComponent(id);
    obtenerSeguros()
      .then((lista) => {
        const encontrado = lista.find(
          (s) => s.nombre.toLowerCase() === nombreDecodificado.toLowerCase()
        );
        if (encontrado) {
          setSeguro(encontrado);
        } else {
          setErrorMsg("Seguro no encontrado.");
        }
      })
      .catch(() => setErrorMsg("No se pudo cargar el seguro."))
      .finally(() => setCargando(false));
  }, [id]);

  function cotizarWhatsapp() {
    const mensaje = `Hola, soy cliente de Prieto & Correa Seguros. Quiero solicitar una cotización para ${seguro.nombre}.`;
    window.open(
      `https://wa.me/${WHATSAPP_EJECUTIVO}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (cargando) {
    return (
      <section className="detalle-seguro-page">
        <p className="cargando">Cargando...</p>
      </section>
    );
  }

  if (errorMsg || !seguro) {
    return (
      <section className="detalle-seguro-page">
        <p className="form-error">{errorMsg || "Seguro no encontrado."}</p>
      </section>
    );
  }

  const extra = CONTENIDO_EXTRA[seguro.nombre.toLowerCase()] || {
    coberturas: [],
    beneficios: [],
    requisitos: [],
  };

  return (
    <section className="detalle-seguro-page">
      <div className="detalle-seguro-container">
        <button
          className="detalle-seguro-volver"
          onClick={() => navigate("/clientes/dashboard?vista=cotizaciones")}
        >
          ← Volver al portal
        </button>

        <div className="detalle-seguro-hero">
          <div className="detalle-seguro-icono">{iconoPorNombre(seguro.nombre)}</div>

          <div>
            <span>{seguro.categoria}</span>
            <h1>{seguro.nombre}</h1>
            <p>{seguro.descripcion}</p>
          </div>
        </div>

        <div className="detalle-seguro-grid">
          {extra.coberturas.length > 0 && (
            <div className="detalle-seguro-card">
              <h2>Qué cubre</h2>
              <ul>
                {extra.coberturas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {extra.beneficios.length > 0 && (
            <div className="detalle-seguro-card">
              <h2>Beneficios</h2>
              <ul>
                {extra.beneficios.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {extra.requisitos.length > 0 && (
            <div className="detalle-seguro-card">
              <h2>Requisitos</h2>
              <ul>
                {extra.requisitos.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="detalle-seguro-cta">
          <div>
            <span>Asesoría personalizada</span>
            <h2>Solicita esta cotización con un ejecutivo</h2>
            <p>
              Un ejecutivo de Prieto & Correa Seguros podrá orientarte y revisar
              las alternativas disponibles según tu necesidad.
            </p>
          </div>

          <button onClick={cotizarWhatsapp}>Cotizar por WhatsApp</button>
        </div>
      </div>
    </section>
  );
}

export default DetalleSeguro;
