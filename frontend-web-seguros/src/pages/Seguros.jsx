import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

const ICONOS = {
  "Seguro de Autos": "🚗",
  SOAP: "🧾",
  "Seguro de Hogar": "🏠",
  "Seguro de Accidentes Personales": "🛡️",
  "Asistencia en Viaje": "✈️",
  "Seguro de Garantías": "📄",
  "Mujer Segura": "✨",
  "Seguro de Mascotas": "🐾",
  "RCI Argentina": "🌎",
};

function getIcono(nombre) {
  return ICONOS[nombre] ?? "📋";
}

function Seguros() {
  const navigate = useNavigate();
  const { data: seguros, loading } = useFetch(obtenerSeguros);
  const [filtro, setFiltro] = useState("Todos");

  const categorias = ["Todos", "Vehículos", "Personas", "Empresas y otros"];

  const segurosFiltrados =
    filtro === "Todos"
      ? seguros
      : seguros.filter((s) => s.categoria === filtro);

  return (
    <>
      <Header />

      <main className="seguros-page">
        <section className="seguros-hero">
          <span>Seguros</span>
          <h1>Soluciones de protección para cada necesidad</h1>
          <p>
            Encuentra seguros para personas, familias, vehículos y empresas con
            asesoría cercana y acompañamiento personalizado.
          </p>
        </section>

        <section className="seguros-categorias">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={filtro === cat ? "activo" : ""}
              onClick={() => setFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        {loading ? (
          <p className="cargando">Cargando seguros...</p>
        ) : (
          <section className="seguros-premium-grid">
            {segurosFiltrados.map((seguro) => (
              <article className="seguro-premium-card" key={seguro.id_seguro}>
                <div className="seguro-premium-top">
                  <div className="seguro-premium-icon">{getIcono(seguro.nombre)}</div>
                  <span>{seguro.categoria}</span>
                </div>

                <h2>{seguro.nombre}</h2>
                <p>{seguro.descripcion}</p>

                {seguro.permite_digital && seguro.url_externa ? (
                  <a href={seguro.url_externa} target="_blank" rel="noreferrer">
                    Cotizar online
                  </a>
                ) : null}

                {seguro.permite_tradicional ? (
                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: { id_seguro: seguro.id_seguro, nombre: seguro.nombre },
                      })
                    }
                  >
                    Cotizar seguro
                  </button>
                ) : null}
              </article>
            ))}
          </section>
        )}

        <section className="seguros-cta">
          <div>
            <span>Asesoría personalizada</span>
            <h2>¿No sabes qué seguro necesitas?</h2>
            <p>
              Nuestro equipo puede ayudarte a comparar alternativas y encontrar
              una solución adecuada para ti o tu empresa.
            </p>
          </div>
          <button onClick={() => navigate("/cotizador")}>
            Solicitar asesoría
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Seguros;
