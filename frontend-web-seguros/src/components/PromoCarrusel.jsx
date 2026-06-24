import { useEffect, useState } from "react";

const banners = [
  {
    imagen: "/banner-mascotas.png",
    alt: "Seguro Mascotas",
  },
  {
    imagen: "/banner-auto.png",
    alt: "Seguro Auto",
  },
  {
    imagen: "/banner-viaje.png",
    alt: "Asistencia en Viaje",
  },
  {
    imagen: "/banner-hogar.png",
    alt: "Seguro Hogar",
  },
];

function PromoCarrusel() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => clearInterval(intervalo);
  }, []);

  function siguiente() {
    setActual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }

  function anterior() {
    setActual((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }

  return (
    <section className="promo-banner-slider">
      {banners.map((banner, index) => (
        <div
          key={banner.imagen}
          className={`promo-banner-slide ${index === actual ? "active" : ""}`}
        >
          <img src={banner.imagen} alt={banner.alt} />
        </div>
      ))}

      <button className="promo-arrow promo-arrow-left" onClick={anterior}>
        ‹
      </button>

      <button className="promo-arrow promo-arrow-right" onClick={siguiente}>
        ›
      </button>

      <div className="promo-banner-dots">
        {banners.map((banner, index) => (
          <button
            key={banner.imagen}
            className={index === actual ? "active" : ""}
            onClick={() => setActual(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default PromoCarrusel;