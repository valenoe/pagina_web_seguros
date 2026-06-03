const noticias = [
  {
    categoria: "Seguro Automotriz",
    titulo: "Cómo elegir una cobertura adecuada para tu vehículo",
    descripcion:
      "Conoce qué aspectos revisar antes de contratar un seguro automotriz.",
  },
  {
    categoria: "Consejos",
    titulo: "¿Qué hacer frente a un siniestro?",
    descripcion:
      "Pasos simples para actuar con tranquilidad y proteger tus derechos.",
  },
  {
    categoria: "Protección",
    titulo: "La importancia de revisar tus coberturas periódicamente",
    descripcion:
      "Actualizar tus seguros puede ayudarte a mantener una mejor protección.",
  },
];

function News() {
  return (
    <section className="news-section">
      <div className="news-header">
        <span>Información útil</span>
        <h2>Consejos y novedades</h2>
        <p>
          Información pensada para ayudarte a tomar mejores decisiones sobre
          protección y seguros.
        </p>
      </div>

      <div className="news-grid">
        {noticias.map((item) => (
          <article className="news-card" key={item.titulo}>
            <span className="news-tag">{item.categoria}</span>
            <h3>{item.titulo}</h3>
            <p>{item.descripcion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default News;
