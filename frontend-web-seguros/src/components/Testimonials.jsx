import { useEffect, useRef } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../styles/components/Testimonials.css";

const testimonios = [
  {
    imagen: "/testimonios/testimonio1.jpg",
    texto:
      "Prieto & Correa nos entregó acompañamiento constante y una atención cercana durante todo el proceso de contratación.",
    nombre: "Cliente pyme",
    ciudad: "Maule",
  },
  {
    imagen: "/testimonios/testimonio2.jpg",
    texto:
      "Valoramos la claridad de las coberturas y la rapidez para responder cada una de nuestras solicitudes.",
    nombre: "Cliente familiar",
    ciudad: "Curicó",
  },
  {
    imagen: "/testimonios/testimonio3.jpg",
    texto:
      "Recibimos asesoría profesional y alternativas ajustadas a nuestras necesidades empresariales.",
    nombre: "Empresa cliente",
    ciudad: "Talca",
  },
  {
    imagen: "/testimonios/testimonio4.jpg",
    texto:
      "La gestión fue ordenada, transparente y nos dio tranquilidad en cada etapa del proceso.",
    nombre: "Cliente corporativo",
    ciudad: "Linares",
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="testimonios"
    >
      <h2>
        ¿Por qué nuestros clientes nos prefieren?
      </h2>

      <p className="testimonios-subtitulo">
        Más de 30 años construyendo relaciones basadas en confianza,
        cercanía y acompañamiento permanente.
      </p>

      <div className="testimonios-carousel">
        <Swiper
          modules={[
            Navigation,
            Pagination,
            Autoplay,
          ]}
          slidesPerView={3}
          spaceBetween={30}
          loop
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          navigation
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            900: {
              slidesPerView: 2,
            },
            1200: {
              slidesPerView: 3,
            },
          }}
        >
          {testimonios.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="testimonial-card">
                <img
                  src={item.imagen}
                  alt={item.nombre}
                />

                <div className="quote">
                  ❝
                </div>

                <p>
                  {item.texto}
                </p>

                <div className="cliente">
                  <h4>
                    {item.nombre}
                  </h4>

                  <span>
                    {item.ciudad}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}