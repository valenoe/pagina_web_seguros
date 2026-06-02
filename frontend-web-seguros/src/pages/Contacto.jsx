import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Contacto() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="contact-page">

        <section className="contact-hero">

          <span>Contacto</span>

          <h1>Estamos para ayudarte</h1>

          <p>
            Escríbenos para resolver dudas, recibir orientación o solicitar
            asesoría personalizada.
          </p>

        </section>

        <section className="contact-content">

          <div className="contact-card">

            <span>Prieto & Correa Seguros</span>

            <h2>Conversemos</h2>

            <p>
              Nuestro equipo está disponible para acompañarte y encontrar la
              alternativa más adecuada.
            </p>

            <div className="contact-list">

              <div>
                <strong>Dirección</strong>
                <p>Pje. Uno y Medio Nte. 4035, Talca</p>
              </div>

              <div>
                <strong>Correo</strong>
                <p>amorales@prietocorrea.cl</p>
              </div>

              <div>
                <strong>WhatsApp</strong>
                <p>+56 9 6654 1939</p>
              </div>

            </div>

            <button
              className="contact-cotizar"
              onClick={() => navigate("/cotizador")}
            >
              Quiero cotizar un seguro
            </button>

          </div>

          <form className="contact-form">

            <div>

              <label>Nombre</label>

              <input
                type="text"
                placeholder="Ingresa tu nombre"
              />

            </div>

            <div>

              <label>Correo</label>

              <input
                type="email"
                placeholder="correo@ejemplo.cl"
              />

            </div>

            <div>

              <label>Teléfono</label>

              <input
                type="tel"
                placeholder="+56 9 XXXX XXXX"
              />

            </div>

            <div className="contact-full">

              <label>Mensaje</label>

              <textarea
                placeholder="Cuéntanos en qué podemos ayudarte"
              />

            </div>

            <button>
              Enviar mensaje
            </button>

          </form>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Contacto;