import { useEffect, useRef, useState } from "react";

function Purpose() {
  const sectionRef = useRef(null);
  const [animar, setAnimar] = useState(false);

  const datos = [
    {
      valor: 15,
      prefijo: "+",
      sufijo: "",
      titulo: "Compañías",
      descripcion: "Aseguradoras con las que trabajamos",
    },
    {
      valor: 200,
      prefijo: "+",
      sufijo: "",
      titulo: "Clientes",
      descripcion: "En toda la Región del Maule",
    },
    {
      valor: 10,
      prefijo: "+",
      sufijo: "",
      titulo: "Tipos de Seguros",
      descripcion: "Familia · Empresas · Vehículos",
    },
    {
      valor: 69580,
      prefijo: "",
      sufijo: " UF",
      titulo: "Ventas Anuales",
      descripcion: "FECU 2024",
    },
  ];

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimar(true);
          observador.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observador.observe(sectionRef.current);
    }

    return () => observador.disconnect();
  }, []);

  return (
    <section className="purpose-new" ref={sectionRef}>
      <div className={`purpose-new-inner ${animar ? "show" : ""}`}>
        <div className="purpose-new-header">
          <span>Trayectoria</span>

          <h2>Más de 30 años acompañando a personas y empresas</h2>

          <p>
            Construimos relaciones de confianza mediante asesoría cercana,
            soluciones personalizadas y acompañamiento permanente.
          </p>
        </div>

        <div className="purpose-new-stats">
          {datos.map((item) => (
            <div key={item.titulo}>
              <h3>
                {item.prefijo}
                <NumeroAnimado valor={item.valor} activo={animar} />
                {item.sufijo}
              </h3>

              <p>{item.titulo}</p>

              <small>{item.descripcion}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NumeroAnimado({ valor, activo }) {
  const [numero, setNumero] = useState(0);

  useEffect(() => {
    if (!activo) return;

    let inicio = 0;
    const duracion = 1500;
    const pasos = Math.round(duracion / 16);
    const incremento = valor / pasos;

    const intervalo = setInterval(() => {
      inicio += incremento;

      if (inicio >= valor) {
        setNumero(valor);
        clearInterval(intervalo);
      } else {
        setNumero(Math.floor(inicio));
      }
    }, 16);

    return () => clearInterval(intervalo);
  }, [valor, activo]);

  return numero.toLocaleString("es-CL");
}

export default Purpose;