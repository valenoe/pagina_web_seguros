import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function CotizacionExitosa() {
  return (
    <>
      <Header />

      <section className="cotizacion-exitosa">
        <div className="cotizacion-card">
          <img
            src="/Logo Prieto.png"
            alt="Prieto & Correa Seguros"
            className="cotizacion-logo"
          />

          <div className="success-icon">✓</div>

          <span>Solicitud recibida</span>

          <h1>Recibimos tu solicitud exitosamente</h1>

          <p>
            Gracias por confiar en Prieto & Correa Seguros. Nuestro equipo
            revisará tu información y se pondrá en contacto contigo para
            entregarte una propuesta personalizada.
          </p>

          <div className="cotizacion-buttons">
            <Link to="/">Volver al inicio</Link>
            <Link to="/seguros">Ver otros seguros</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default CotizacionExitosa;