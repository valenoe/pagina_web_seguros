const razones = [
  {
    icono: "🛡️",
    titulo: "Asesoría personalizada",
    descripcion:
      "Analizamos tus necesidades y te ayudamos a elegir una alternativa adecuada.",
  },
  {
    icono: "⚡",
    titulo: "Respuesta rápida",
    descripcion:
      "Gestionamos solicitudes y entregamos acompañamiento oportuno.",
  },
  {
    icono: "🤝",
    titulo: "Experiencia y confianza",
    descripcion:
      "Más de 30 años acompañando personas, familias y empresas.",
  },
  {
    icono: "🏆",
    titulo: "Comparación de alternativas",
    descripcion:
      "Trabajamos con distintas compañías para encontrar mejores opciones.",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-header">
        <span>Por qué elegirnos</span>

        <h2>
          Más que vender seguros, te ayudamos a decidir mejor
        </h2>

        <p>
          Nuestro trabajo es acompañarte, comparar alternativas y ayudarte a
          tomar decisiones con respaldo profesional.
        </p>
      </div>

      <div className="why-grid">
        {razones.map((item) => (
          <article className="why-card" key={item.titulo}>
            <div className="why-icon">{item.icono}</div>

            <h3>{item.titulo}</h3>

            <p>{item.descripcion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WhyChooseUs;