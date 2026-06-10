import Header from "../components/Header";
import Footer from "../components/Footer";

function Nosotros() {
  return (
    <>
      <Header />

      <main className="nosotros">

        {/* HERO */}

        <section className="nosotros-hero">

          <span>
            Prieto & Correa
          </span>

          <h1>
            Más de 30 años entregando tranquilidad y protección
          </h1>

          <p>
            Acompañamos personas, familias y empresas mediante asesoría cercana,
            confianza y soluciones de protección adaptadas a cada necesidad.
          </p>

        </section>

        {/* QUIENES SOMOS */}

        <section className="historia-section">

          <div className="historia-left">

            <span>
              Quiénes Somos
            </span>

            <h2>
              Construimos relaciones basadas en confianza y cercanía
            </h2>

            <p>
              Prieto & Correa Seguros nace en Talca en 1993, con el propósito de
              entregar una asesoría cercana y acompañamiento permanente,
              entendiendo que cada cliente necesita protección adaptada a su
              realidad.
            </p>

            <p>
              Desde nuestros inicios, hemos trabajado construyendo relaciones de
              confianza basadas en el compromiso, la transparencia y una atención
              verdaderamente personalizada.
            </p>

            <p>
              A lo largo de más de 30 años de trayectoria en la Región del
              Maule, hemos acompañado a nuestros clientes en distintas etapas de
              sus vidas, entregando orientación para que puedan tomar decisiones
              informadas y acceder a soluciones de protección acordes a sus
              necesidades.
            </p>

            <p>
              Hoy continuamos evolucionando y fortaleciendo nuestros canales de
              atención, manteniendo intacta nuestra esencia: estar presentes
              cuando más nos necesitan.
            </p>

          </div>

          <div className="historia-right">

            <div className="historia-card">

              <h3>
                +30
              </h3>

              <span>
                años construyendo confianza
              </span>

            </div>

          </div>

        </section>

        {/* MISION */}

        <section className="corporativo-section">

          <div className="corporativo-text">

            <span>
              Misión
            </span>

            <h2>
              Acompañar y asesorar con cercanía y compromiso
            </h2>

            <p>
              Acompañar y asesorar a nuestros clientes con cercanía,
              transparencia y compromiso, construyendo relaciones de confianza
              duraderas y entregando soluciones adaptadas a las necesidades de
              cada persona y empresa.
            </p>

          </div>

          <div className="corporativo-image">

            <div className="image-placeholder">

              confianza que permanece

            </div>

          </div>

        </section>

        {/* CULTURA */}

        <section className="corporativo-section reverse">

          <div className="corporativo-text">

            <span>
              Nuestra Cultura
            </span>

            <h2>
              Principios que guían cada relación
            </h2>

            <p>
              Nuestra cultura se basa en pilares que representan nuestro
              compromiso y la forma en que nos relacionamos con cada cliente.
            </p>

          </div>

          <div className="corporativo-image">

            <div className="image-placeholder">

              cercanía y protección

            </div>

          </div>

        </section>

        {/* VALORES */}

        <section className="valores-corporativos">

          <div className="valores-corporativos-header">

            <h2>
              Nuestros valores
            </h2>

            <p>
              Más que palabras, representan la forma en que acompañamos y
              protegemos a nuestros clientes.
            </p>

          </div>

          <div className="valores-corporativos-grid">

            <article className="valor-corporativo-card">

              <div className="valor-icono">
                👥
              </div>

              <h3>
                Cercanía
              </h3>

              <p>
                Trato personalizado y acompañamiento constante.
              </p>

            </article>

            <article className="valor-corporativo-card">

              <div className="valor-icono">
                🤝
              </div>

              <h3>
                Confianza
              </h3>

              <p>
                Relaciones basadas en honestidad y cumplimiento.
              </p>

            </article>

            <article className="valor-corporativo-card">

              <div className="valor-icono">
                🛡️
              </div>

              <h3>
                Compromiso
              </h3>

              <p>
                Nos involucramos verdaderamente en cada necesidad.
              </p>

            </article>

            <article className="valor-corporativo-card">

              <div className="valor-icono">
                ✨
              </div>

              <h3>
                Transparencia
              </h3>

              <p>
                Orientamos de forma clara para decisiones seguras.
              </p>

            </article>

          </div>

        </section>

      </main>

      <Footer />

    </>
  );
}

export default Nosotros;