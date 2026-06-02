import { segurosDestacados } from "../data/siteData";

function Services() {
  return (
    <section className="services-section">
      <div className="services-header">
        <span>Seguros destacados</span>
        <h2>Soluciones para cada necesidad</h2>
        <p>
          Encuentra seguros para personas, familias, vehículos y empresas con
          asesoría personalizada.
        </p>
      </div>

      <div className="services-grid">
        {segurosDestacados.map((seguro) => (
          <article className="service-card" key={seguro.titulo}>
            <h3>{seguro.titulo}</h3>
            <p>{seguro.descripcion}</p>
            <a href="#">Ver más →</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;