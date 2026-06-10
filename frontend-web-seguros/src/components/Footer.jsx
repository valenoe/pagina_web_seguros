import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/LOGO_TRANSPARENTE.svg" alt="Prieto & Correa Seguros" />

          <p>
            Más que seguros, construimos relaciones de confianza mediante
            asesoría cercana y soluciones adaptadas para personas, familias y
            empresas.
          </p>
        </div>

        <div className="footer-column">
          <h3>Seguros</h3>
          <Link to="/seguros">Seguro de Auto</Link>
          <Link to="/seguros">SOAP</Link>
          <Link to="/seguros">Seguro de Hogar</Link>
          <Link to="/seguros">Mascotas</Link>
          <Link to="/seguros">Asistencia en Viaje</Link>
        </div>

        <div className="footer-column">
          <h3>Empresa</h3>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/seguros">Seguros</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/privacidad">Política de Privacidad</Link>
          <Link to="/terminos">Términos y Condiciones</Link>
        </div>

        <div className="footer-column">
          <h3>Contacto</h3>

          <a
            href="https://maps.google.com/?q=Pje.+Uno+y+Medio+Nte.+4035+Talca+Chile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/direccion.png" alt="" />
            Mi sucursal: Pje. Uno y Medio Nte. 4035
          </a>

          <a href="mailto:amorales@prietocorrea.cl">
            <img src="/correo-electronico.png" alt="" />
            amorales@prietocorrea.cl
          </a>

          <a href="tel:+56966541939">
            <img src="/telefono.png" alt="" />
            +56 9 6654 1939
          </a>

          <a
            href="https://wa.me/56966541939"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/whatsapp.png" alt="" />
            Hablar por WhatsApp
          </a>

          <div className="footer-social">
            <a
              href="https://web.facebook.com/prietocorreaseguros?locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img src="/facebook.png" alt="Facebook" />
            </a>

            <a
              href="https://www.instagram.com/prietocorreaseguros/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src="/instagram.png" alt="Instagram" />
            </a>

            <a
              href="https://www.linkedin.com/company/prieto-correa-corredora-de-seguro/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <img src="/linkedin.png" alt="LinkedIn" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Prieto & Correa Seguros</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>
  );
}

export default Footer;
