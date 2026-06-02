import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

const CATEGORIAS = {
  "Seguro de Auto": "Vehículos",
  SOAP: "Vehículos",
  Mascotas: "Personas",
  Hogar: "Personas",
  "Mujer Segura": "Personas",
  "Accidentes Personales": "Personas",
  "Asistencia en Viaje": "Personas",
  Garantías: "Empresas",
  "Responsabilidad Civil Argentina": "Empresas",
};

const ICONOS = {
  Vehículos: "🚗",
  Personas: "🛡️",
  Empresas: "🏢",
};

function getCategoria(nombre) {
  for (const [key, cat] of Object.entries(CATEGORIAS)) {
    if (nombre.toLowerCase().includes(key.toLowerCase())) return cat;
  }
  return "Otros";
}

function Seguros() {
  const navigate = useNavigate();
  const { data: seguros, loading } = useFetch(obtenerSeguros);
  const [filtro, setFiltro] = useState("Todos");

  const categorias = ["Todos", "Vehículos", "Personas", "Empresas"];

  const segurosFiltrados =
    filtro === "Todos"
      ? seguros
      : seguros.filter((s) => getCategoria(s.nombre) === filtro);

  return (
    <>
      <Header />

      <main className="seguros-page">
        <section className="seguros-hero">
          <span>Seguros</span>
          <h1>Soluciones de protección para cada etapa</h1>
          <p>
            Encuentra seguros para personas, familias, vehículos y empresas con
            el respaldo y asesoría de Prieto & Correa.
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
          <section className="seguros-list">
            {segurosFiltrados.map((seguro) => {
              const categoria = getCategoria(seguro.nombre);
              return (
                <article className="seguro-card" key={seguro.id_seguro}>
                  <div className="seguro-icon">{ICONOS[categoria] ?? "📋"}</div>
                  <span>{categoria}</span>
                  <h2>{seguro.nombre}</h2>
                  <p>{seguro.descripcion}</p>

                  {seguro.permite_digital && seguro.url_externa ? (
                    <a
                      href={seguro.url_externa}
                      target="_blank"
                      rel="noreferrer"
                    >
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
                      Cotizar con asesor
                    </button>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Seguros;
