import { segurosDestacados } from "../data/siteData";

function Services() {
  return (
    <section className="services-section">

      <div className="services-header">
        <span>Seguros</span>

        <h2>
          Soluciones para cada necesidad
        </h2>

        <p>
          Explora nuestras opciones de protección para personas,
          familias y empresas.
        </p>
      </div>

      <div className="services-grid">
        {segurosDestacados.map((seguro) => (
          <article className="service-card" key={seguro.titulo}>
            <h3>{seguro.titulo}</h3>

            <p>{seguro.descripcion}</p>

            <a href="#">
              Ver detalles →
            </a>

          </article>
        ))}
      </div>

    </section>
  );
}

export default Services;