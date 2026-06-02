function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/Logo Prieto.png" alt="Prieto & Correa Seguros" />

          <p>
            Más que seguros, construimos relaciones de confianza mediante
            asesoría cercana y soluciones adaptadas para personas, familias y
            empresas.
          </p>
        </div>

        <div>
          <h3>Seguros</h3>
          <a href="#">Seguro de Auto</a>
          <a href="#">SOAP</a>
          <a href="#">Seguro de Hogar</a>
          <a href="#">Mascotas</a>
          <a href="#">Asistencia en Viaje</a>
        </div>

        <div>
          <h3>Empresa</h3>
          <a href="#">Nosotros</a>
          <a href="#">Seguros</a>
          <a href="#">Clientes</a>
          <a href="#">Contacto</a>
        </div>

        <div>
          <h3>Contacto</h3>
          <span>Pje. Uno y Medio Nte. 4035</span>
          <span>Talca · Región del Maule</span>

          <a href="mailto:amorales@prietocorrea.cl">
            amorales@prietocorrea.cl
          </a>

          <a href="tel:+56966541939">
            +56 9 6654 1939
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 Prieto & Correa Seguros · Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
}

export default Footer;