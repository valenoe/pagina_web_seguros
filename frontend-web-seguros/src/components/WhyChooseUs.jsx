import { useEffect, useRef } from "react";

const razones = [
  {
    numero: "01",
    titulo: "Asesoría personalizada",
    descripcion:
      "Analizamos cada necesidad para recomendar alternativas alineadas al perfil de cada cliente.",
  },
  {
    numero: "02",
    titulo: "Respuesta ágil",
    descripcion:
      "Gestionamos cada una de las solicitudes entregando respuestas oportunas y acompañamiento permanente.",
  },
  {
    numero: "03",
    titulo: "Experiencia y respaldo",
    descripcion:
      "Acompañamos a las personas y empresas entregando confianza y asesoría profesional.",
  },
  {
    numero: "04",
    titulo: "Comparación de alternativas",
    descripcion:
      "Evaluamos distintas opciones para encontrar coberturas acordes a cada necesidad.",
  },
];

function WhyChooseUs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      {
        threshold: 0.25,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="why-section">
      <div className="why-header">
        <span>Por qué elegirnos</span>

        <h2>
          Más que vender seguros,
          <br />
          entregamos respaldo
        </h2>

        <p>
          Nuestro trabajo es acompañarte y ayudarte a tomar decisiones con
          información clara y respaldo profesional.
        </p>
      </div>

      <div className="why-grid">
        {razones.map((item, index) => (
          <article
            className="why-card"
            key={item.titulo}
            style={{
              transitionDelay: `${index * 0.15}s`,
            }}
          >
            <div className="why-number">{item.numero}</div>

            <h3>{item.titulo}</h3>

            <p>{item.descripcion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WhyChooseUs;
