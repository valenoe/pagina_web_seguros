import { noticias } from "../data/siteData";

function News() {
  return (
    <section className="news-section">
      <div className="news-header">
        <span>Actualidad</span>
        <h2>Información útil para protegerte mejor</h2>
      </div>

      <div className="news-grid">
        {noticias.map((noticia) => (
          <article className="news-card" key={noticia.titulo}>
            <span>{noticia.categoria}</span>
            <h3>{noticia.titulo}</h3>
            <p>{noticia.descripcion}</p>
            <a href="#">Leer más →</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default News;