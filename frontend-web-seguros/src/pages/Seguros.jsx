import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const seguros = [
  {
    id: 1,
    categoria: "Vehículos",
    titulo: "Seguro de Auto",
    descripcion:
      "Protección para tu vehículo ante accidentes, robos, daños a terceros y otros imprevistos.",
    icono: "🚗",
  },
  {
    id: 2,
    categoria: "Obligatorio",
    titulo: "SOAP",
    descripcion:
      "Seguro obligatorio para vehículos motorizados con gestión simple, rápida y confiable.",
    icono: "🧾",
  },
  {
    id: 3,
    categoria: "Hogar",
    titulo: "Seguro de Hogar",
    descripcion:
      "Protege tu vivienda, patrimonio y tranquilidad familiar frente a distintos riesgos.",
    icono: "🏠",
  },
  {
    id: 4,
    categoria: "Personas",
    titulo: "Accidentes Personales",
    descripcion:
      "Cobertura y respaldo económico frente a accidentes que puedan afectar tu bienestar.",
    icono: "🛡️",
  },
  {
    id: 5,
    categoria: "Viajes",
    titulo: "Asistencia en Viaje",
    descripcion:
      "Viaja con tranquilidad contando con asistencia y protección ante imprevistos.",
    icono: "✈️",
  },
  {
    id: 6,
    categoria: "Empresas",
    titulo: "Responsabilidad Civil",
    descripcion:
      "Coberturas para empresas, obras y actividades frente a daños ocasionados a terceros.",
    icono: "🏢",
  },
  {
    id: 7,
    categoria: "Empresas",
    titulo: "Seguros de Garantía",
    descripcion:
      "Garantías de seriedad de oferta, fiel cumplimiento, correcta ejecución e inversión de anticipo.",
    icono: "📄",
  },
  {
    id: 8,
    categoria: "Personas",
    titulo: "Mujer Segura",
    descripcion:
      "Seguro de accidentes personales pensado para mujeres, con protección accesible y cercana.",
    icono: "✨",
  },
  {
    id: 9,
    categoria: "Mascotas",
    titulo: "Seguro de Mascotas",
    descripcion:
      "Protección para cubrir gastos veterinarios por accidentes o enfermedades.",
    icono: "🐾",
  },
];

function Seguros() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="seguros-page">
        <section className="seguros-hero">
          <span>Seguros</span>

          <h1>Soluciones de protección para cada necesidad</h1>

          <p>
            Encuentra seguros para personas, familias, vehículos y empresas con
            asesoría cercana y acompañamiento personalizado.
          </p>
        </section>

        <section className="seguros-premium-grid">
          {seguros.map((seguro) => (
            <article className="seguro-premium-card" key={seguro.id}>
              <div className="seguro-premium-top">
                <div className="seguro-premium-icon">{seguro.icono}</div>

                <span>{seguro.categoria}</span>
              </div>

              <h2>{seguro.titulo}</h2>

              <p>{seguro.descripcion}</p>

              <button onClick={() => navigate("/cotizador")}>
                Cotizar seguro
              </button>
            </article>
          ))}
        </section>

        <section className="seguros-cta">
          <div>
            <span>Asesoría personalizada</span>

            <h2>¿No sabes qué seguro necesitas?</h2>

            <p>
              Nuestro equipo puede ayudarte a comparar alternativas y encontrar
              una solución adecuada para ti o tu empresa.
            </p>
          </div>

          <button onClick={() => navigate("/cotizador")}>
            Solicitar asesoría
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Seguros;