import { useNavigate, useParams } from "react-router-dom";

const WHATSAPP_EJECUTIVO = "56966541939";

const segurosDetalle = {
  autos: {
    nombre: "Seguro de Autos",
    categoria: "Vehículos",
    icono: "🚗",
    descripcion:
      "Protección para vehículos particulares ante accidentes, daños materiales, robo y responsabilidad civil.",
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

  soap: {
    nombre: "SOAP",
    categoria: "Vehículos",
    icono: "🛡",
    descripcion:
      "Seguro Obligatorio de Accidentes Personales para vehículos motorizados.",
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
    requisitos: [
      "Patente del vehículo",
      "Tipo de vehículo",
      "Datos del propietario",
    ],
  },

  "rci-argentina": {
    nombre: "RCI Argentina",
    categoria: "Vehículos",
    icono: "🇦🇷",
    descripcion:
      "Seguro de Responsabilidad Civil Internacional para vehículos que viajan a Argentina.",
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

  hogar: {
    nombre: "Seguro de Hogar",
    categoria: "Personas",
    icono: "🏠",
    descripcion:
      "Protección para vivienda ante riesgos como incendio, sismo, daños estructurales y asistencias del hogar.",
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

  mascotas: {
    nombre: "Seguro de Mascotas",
    categoria: "Personas",
    icono: "🐾",
    descripcion:
      "Cobertura veterinaria para perros y gatos ante accidentes, enfermedades y atenciones asociadas.",
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

  viaje: {
    nombre: "Asistencia en Viaje",
    categoria: "Personas",
    icono: "✈️",
    descripcion:
      "Asistencia médica y apoyo en viajes internacionales ante imprevistos.",
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

  mujer: {
    nombre: "Mujer Segura",
    categoria: "Personas",
    icono: "👩",
    descripcion:
      "Seguro de accidentes personales orientado a mujeres, con protección ante eventos accidentales.",
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

  garantias: {
    nombre: "Seguro de Garantías",
    categoria: "Empresas y otros",
    icono: "📄",
    descripcion:
      "Seguro orientado a respaldar el cumplimiento de obligaciones contractuales.",
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

  const seguro = segurosDetalle[id] || segurosDetalle.autos;

  function cotizarWhatsapp() {
    const mensaje = `Hola, soy cliente de Prieto & Correa Seguros. Quiero solicitar una cotización para ${seguro.nombre}.`;
    const url = `https://wa.me/${WHATSAPP_EJECUTIVO}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

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
          <div className="detalle-seguro-icono">{seguro.icono}</div>

          <div>
            <span>{seguro.categoria}</span>
            <h1>{seguro.nombre}</h1>
            <p>{seguro.descripcion}</p>
          </div>
        </div>

        <div className="detalle-seguro-grid">
          <div className="detalle-seguro-card">
            <h2>Qué cubre</h2>

            <ul>
              {seguro.coberturas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detalle-seguro-card">
            <h2>Beneficios</h2>

            <ul>
              {seguro.beneficios.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detalle-seguro-card">
            <h2>Requisitos</h2>

            <ul>
              {seguro.requisitos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
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