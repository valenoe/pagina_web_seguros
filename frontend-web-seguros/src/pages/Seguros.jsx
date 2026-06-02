import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { segurosDestacados } from "../data/siteData";

function Seguros() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="seguros-page">
        <section className="seguros-hero">
          <span>Seguros</span>

          <h1>Soluciones de protección para cada etapa</h1>

          <p>
            Encuentra seguros para personas, familias, vehículos y empresas con
            el respaldo y asesoría de Prieto & Correa.
          </p>
        </section>

        <section className="seguros-categorias">
          <button>Todos</button>
          <button>Vehículos</button>
          <button>Personas</button>
          <button>Empresas</button>
        </section>

        <section className="seguros-list">
          {segurosDestacados.map((seguro) => (
            <article className="seguro-card" key={seguro.id}>
              <div className="seguro-icon">
                {seguro.categoria === "Vehículos" ? "🚗" : ""}
                {seguro.categoria === "Personas" ? "🛡️" : ""}
                {seguro.categoria === "Empresas" ? "🏢" : ""}
              </div>

              <span>{seguro.categoria}</span>

              <h2>{seguro.titulo}</h2>

              <p>{seguro.descripcion}</p>

              <button onClick={() => navigate("/cotizador")}>
                Cotizar este seguro
              </button>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Seguros;