import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-left">
        <span className="hero-tag">
          Prieto & Correa Seguros
        </span>

        <h1>
          Protegemos lo que más valoras.
        </h1>

        <p>
          Más de 30 años entregando asesoría, confianza y soluciones de seguros
          para personas y empresas.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            className="hero-primary"
            onClick={() => navigate("/cotizador")}
          >
            Cotizar ahora
          </button>

          <button
            type="button"
            className="hero-secondary"
            onClick={() => navigate("/seguros")}
          >
            Ver seguros
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card">
          <h2>+30</h2>
          <span>años de experiencia</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;