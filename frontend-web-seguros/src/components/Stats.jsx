function Stats() {
  return (
    <section className="cta">
      <div className="cta-left">
        <span>¿Necesitas asesoría?</span>
        <h2>Encuentra el seguro ideal para ti o tu empresa</h2>
        <p>
          Nuestro equipo te acompaña para encontrar una solución personalizada.
        </p>
      </div>

      <div className="cta-right">
        <input type="text" placeholder="Nombre" />
        <input type="email" placeholder="Correo" />
        <button>Solicitar contacto</button>
      </div>
    </section>
  );
}

export default Stats;