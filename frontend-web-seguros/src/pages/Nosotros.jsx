import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Nosotros() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="nosotros">
        <section className="nosotros-hero">
          <span>Prieto & Correa</span>

          <h1>
            Más de 30 años entregando tranquilidad y protección
          </h1>

          <p>
            Somos una corredora de seguros enfocada en acompañar personas y
            empresas con asesoría cercana y soluciones adaptadas a cada
            necesidad.
          </p>
        </section>

        <section className="corporativo-section">
          <div className="corporativo-text">
            <span>Misión</span>

            <h2>Proteger con asesoría cercana y soluciones confiables</h2>

            <p>
              Nuestra misión es acompañar a personas, familias y empresas en la
              elección de seguros adecuados, entregando orientación clara,
              respaldo permanente y una atención comprometida.
            </p>
          </div>

          <div className="corporativo-image">
            <div className="image-placeholder">Imagen misión</div>
          </div>
        </section>

        <section className="corporativo-section reverse">
          <div className="corporativo-text">
            <span>Propósito</span>

            <h2>Entregar tranquilidad en cada decisión importante</h2>

            <p>
              Nuestro propósito es simplificar el mundo de los seguros para que
              cada cliente pueda tomar decisiones informadas, seguras y
              acompañadas por un equipo experto.
            </p>
          </div>

          <div className="corporativo-image">
            <div className="image-placeholder">Imagen propósito</div>
          </div>
        </section>

        <section className="valores-corporativos">
          <div className="valores-corporativos-header">
            <h2>Nuestros valores</h2>

            <p>
              Estos principios orientan nuestra forma de trabajar y la relación
              que construimos con cada cliente.
            </p>
          </div>

          <div className="valores-corporativos-grid">
            <article className="valor-corporativo-card">
              <div className="valor-icono">🤝</div>

              <h3>Confianza</h3>

              <p>
                Construimos relaciones duraderas mediante transparencia,
                responsabilidad y cumplimiento en cada proceso.
              </p>
            </article>

            <article className="valor-corporativo-card">
              <div className="valor-icono">👥</div>

              <h3>Cercanía</h3>

              <p>
                Escuchamos a nuestros clientes y entregamos una atención humana,
                clara y personalizada.
              </p>
            </article>

            <article className="valor-corporativo-card">
              <div className="valor-icono">🛡️</div>

              <h3>Compromiso</h3>

              <p>
                Nos involucramos activamente en cada necesidad, solicitud y
                acompañamiento de nuestros clientes.
              </p>
            </article>

            <article className="valor-corporativo-card">
              <div className="valor-icono">⭐</div>

              <h3>Excelencia</h3>

              <p>
                Buscamos mejorar continuamente nuestros procesos, servicios y
                experiencia digital.
              </p>
            </article>
          </div>
        </section>

        <section className="compromiso-section">
          <div>
            <span>Compromiso con nuestros clientes</span>

            <h2>Asesoría, respaldo y acompañamiento permanente</h2>

            <p>
              Nuestro compromiso es estar presentes antes, durante y después de
              la contratación de un seguro, apoyando a cada cliente con
              información clara y soluciones oportunas.
            </p>
          </div>
        </section>

        <section className="cta-nosotros">
          <h2>¿Buscas una propuesta personalizada?</h2>

          <button onClick={() => navigate("/cotizador")}>
            Solicitar cotización
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Nosotros;