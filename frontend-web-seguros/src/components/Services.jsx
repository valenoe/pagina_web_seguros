import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

function Services() {
  const { data: seguros, loading } = useFetch(obtenerSeguros);

  return (
    <section className="services-section">
      <div className="services-header">
        <span>Seguros</span>
        <h2>Soluciones para cada necesidad</h2>
        <p>
          Explora nuestras opciones de protección para personas,
          familias y empresas.
        </p>
      </div>

      {loading ? (
        <p className="cargando">Cargando seguros...</p>
      ) : (
        <div className="services-grid">
          {seguros.map((seguro) => (
            <article className="service-card" key={seguro.id_seguro}>
              <h3>{seguro.nombre}</h3>
              <p>{seguro.descripcion}</p>
              <Link to="/seguros">Ver detalles →</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Services;
