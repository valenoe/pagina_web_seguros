function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/Logo Prieto.png" alt="Prieto & Correa Seguros" />

          <p>
            Más de 30 años entregando asesoría, confianza y soluciones de
            seguros para personas, familias y empresas.
          </p>
        </div>

        <div>
          <h3>Seguros</h3>
          <a href="#">Seguro de Auto</a>
          <a href="#">SOAP</a>
          <a href="#">Hogar</a>
          <a href="#">Mascotas</a>
          <a href="#">Asistencia en Viaje</a>
        </div>

        <div>
          <h3>Empresa</h3>
          <a href="#">Nosotros</a>
          <a href="#">Clientes</a>
          <a href="#">Siniestros</a>
          <a href="#">Contacto</a>
        </div>

        <div>
          <h3>Contacto</h3>
          <span>Talca · Región del Maule</span>
          <span>contacto@prietocorreaseguros.cl</span>
          <span>+56 9 XXXX XXXX</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Prieto & Correa Seguros. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}

export default Footer;