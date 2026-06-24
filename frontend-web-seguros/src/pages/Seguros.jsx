import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/pages/Seguros.css";
import Footer from "../components/Footer";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

const WHATSAPP_EJECUTIVO = "56912345678";

const DETALLES = {
  "Seguro de Autos": {
    nombreVista: "Seguro de Autos",
    icono: "/icon-seguro-auto.png",
    foto: "/foto-seguro-auto.png",
    precioUf: "Desde 2,45 UF / mes",
    precioClp: "Aprox. $95.130 CLP / mes",
    cubre: ["Robo", "Accidentes", "Daños materiales", "Responsabilidad civil"],
    beneficios: ["Asistencia en ruta", "Vehículo de reemplazo", "Robo de accesorios"],
  },
  "RCI Argentina": {
    nombreVista: "Responsabilidad Civil Internacional",
    icono: "/mapa-del-mundo.png",
    foto: "/foto-RCI.png",
    precioUf: "Desde 0,17 UF / día",
    precioClp: "Valor referencial según UF diaria",
    cubre: ["Daños a terceros", "Ingreso vehicular a Argentina", "Cobertura internacional"],
    beneficios: ["Obligatorio para cruzar frontera", "Contratación rápida", "Respaldo asegurador"],
  },
  SOAP: {
    nombreVista: "SOAP",
    icono: "/icon-soap.png",
    foto: "/foto-soap.png",
    precioUf: "Valor anual",
    precioClp: "Según tipo de vehículo",
    cubre: ["Muerte accidental", "Gastos médicos", "Incapacidad", "Lesiones corporales"],
    beneficios: ["Seguro obligatorio", "Protege conductor, pasajeros y peatones"],
  },
  "Seguro de Hogar": {
    nombreVista: "Seguro de Hogar",
    icono: "/icon-hogar.png",
    foto: "/foto-hogar.png",
    precioUf: "Cotización personalizada",
    precioClp: "Según características del hogar",
    cubre: ["Incendio", "Sismo", "Robo", "Daños en estructura y contenido"],
    beneficios: ["Cerrajería", "Cristalería", "Gasfitería", "Electricidad"],
  },
  "Mujer Segura": {
    nombreVista: "Mujer Segura",
    icono: "/icon-mujer-segura.png",
    foto: "/foto-mujer-segura.png",
    precioUf: "0,33 UF / año",
    precioClp: "Valor referencial anual",
    cubre: ["Muerte accidental", "Incapacidad total", "Desmembramiento", "Gastos de sepelio"],
    beneficios: ["Para mujeres de 18 a 80 años", "Protección económica familiar"],
  },
  "Seguro de Accidentes Personales": {
    nombreVista: "Accidentes Personales",
    icono: "/icon-accidente-personal.png",
    foto: "/foto-accidente-personales.jpg",
    precioUf: "Cotización personalizada",
    precioClp: "Según plan contratado",
    cubre: ["Lesiones", "Invalidez", "Fallecimiento accidental"],
    beneficios: ["Planes flexibles", "Protección personal", "Apoyo ante imprevistos"],
  },
  "Asistencia en Viaje": {
    nombreVista: "Asistencia en Viaje",
    icono: "/icon-asistencia-viajes.png",
    foto: "/foto-asistencia-viaje-foto.png",
    precioUf: "Desde 0,32 UF / año",
    precioClp: "Valor referencial anual",
    cubre: ["Asistencia médica", "Hospitalización", "Repatriación", "Pérdida de equipaje"],
    beneficios: ["Ideal para viajes internacionales", "Atención ante emergencias"],
  },
  "Seguro de Mascotas": {
    nombreVista: "Seguro de Mascotas",
    icono: "/icon-seguro-para-mascotas.png",
    foto: "/foto-mascota.png",
    precioUf: "Desde 0,15 UF / mes",
    precioClp: "Según plan contratado",
    cubre: ["Accidentes", "Enfermedades", "Atención veterinaria"],
    beneficios: ["Planes Básico, Medio y Full", "Para perros y gatos"],
  },
  "Seguro de Garantías": {
    nombreVista: "Seguro de Garantías",
    icono: "/icon-garantia.png",
    foto: "/foto-garantia.png",
    precioUf: "Según evaluación",
    precioClp: "Cotización personalizada",
    cubre: ["Seriedad de oferta", "Fiel cumplimiento", "Ejecución de obras"],
    beneficios: ["Ideal para licitaciones", "Respaldo contractual", "Solución para empresas"],
  },
};

function getDetalle(seguro) {
  return (
    DETALLES[seguro.nombre] ?? {
      nombreVista: seguro.nombre,
      icono: "/icon-edificio.png",
      foto: "/banner-seguros.png",
      precioUf: "Según evaluación",
      precioClp: "Cotización personalizada",
      cubre: ["Cobertura personalizada", "Evaluación según necesidad"],
      beneficios: ["Asesoría comercial", "Comparación de alternativas"],
    }
  );
}

function Seguros() {
  const navigate = useNavigate();
  const { data: seguros = [], loading } = useFetch(obtenerSeguros);
  const [filtro, setFiltro] = useState("Todos");
  const [seguroActivo, setSeguroActivo] = useState(null);

  const categorias = ["Todos", "Vehículos", "Personas", "Empresas y otros"];

  const segurosFiltrados = useMemo(() => {
    const lista =
      filtro === "Todos"
        ? seguros
        : seguros.filter((s) => s.categoria === filtro);

    return [...lista].sort(
      (a, b) => (a.orden_display ?? 0) - (b.orden_display ?? 0)
    );
  }, [seguros, filtro]);

  const abrirWhatsApp = (seguro) => {
    const detalle = getDetalle(seguro);
    const mensaje = `Hola, quiero hablar con un ejecutivo comercial sobre el seguro: ${detalle.nombreVista}.`;
    window.open(
      `https://wa.me/${WHATSAPP_EJECUTIVO}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <>
      <Header />

      <main className="seguros-page">
        <section className="seguros-hero">
          <div className="seguros-hero-overlay">
            <span className="seguros-badge">Seguros</span>

            <h1>
              Protección y respaldo
              <br />
              para cada etapa
            </h1>

            <p>
              Encuentra seguros para personas, vehículos y empresas con asesoría
              cercana y acompañamiento personalizado.
            </p>
          </div>
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
          <section className="seguros-bloques">
            {segurosFiltrados.map((seguro, index) => {
              const detalle = getDetalle(seguro);

              return (
                <article
                  className={`seguro-bloque ${index % 2 !== 0 ? "reverse" : ""}`}
                  key={seguro.id_seguro}
                >
                  <div className="seguro-bloque-imagen">
                <img
                  src={detalle.foto}
                  alt={detalle.nombreVista}
                />
              </div>

                  <div className="seguro-bloque-info">
                    <span>{seguro.categoria}</span>

                    <h2>{detalle.nombreVista}</h2>

                    <p>{seguro.descripcion}</p>

                    <div className="seguro-precios">
                      <div>
                        <small>Valor UF</small>
                        <strong>{detalle.precioUf}</strong>
                      </div>

                      <div>
                        <small>Valor CLP</small>
                        <strong>{detalle.precioClp}</strong>
                      </div>
                    </div>

                    <div className="seguro-mini-coberturas">
                      {detalle.cubre.slice(0, 4).map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>

                    <div className="seguro-bloque-actions">

                  <button
                    onClick={() => setSeguroActivo(seguro)}
                  >
                    Ver coberturas
                  </button>

                  {seguro.permite_digital && seguro.url_externa ? (
                    <a
                      href={seguro.url_externa}
                      target="_blank"
                      rel="noreferrer"
                      className="seguro-online-link"
                    >
                      Cotizar online
                    </a>
                  ) : null}

                </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

  
      </main>

      {seguroActivo ? (
        <div className="seguro-modal">
          <div
            className="seguro-modal-backdrop"
            onClick={() => setSeguroActivo(null)}
          />

          <div className="seguro-modal-card">
            {(() => {
              const detalle = getDetalle(seguroActivo);

              return (
                <>
                  <button
                    className="seguro-modal-close"
                    onClick={() => setSeguroActivo(null)}
                  >
                    ×
                  </button>

                  <div className="seguro-modal-head">
                    <img src={detalle.icono} alt="" />

                    <div>
                      <span>{seguroActivo.categoria}</span>
                      <h2>{detalle.nombreVista}</h2>
                      <p>{seguroActivo.descripcion}</p>
                    </div>
                  </div>

                  <div className="seguro-modal-price">
                    <div>
                      <small>Valor referencial UF</small>
                      <strong>{detalle.precioUf}</strong>
                    </div>

                    <div>
                      <small>Valor referencial CLP</small>
                      <strong>{detalle.precioClp}</strong>
                    </div>
                  </div>

                  <div className="seguro-modal-grid">
                    <div>
                      <h3>¿Qué cubre?</h3>
                      {detalle.cubre.map((item) => (
                        <p key={item}>✓ {item}</p>
                      ))}
                    </div>

                    <div>
                      <h3>Beneficios principales</h3>
                      {detalle.beneficios.map((item) => (
                        <p key={item}>✓ {item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="seguro-modal-actions">
                    <button onClick={() => abrirWhatsApp(seguroActivo)}>
                      Hablar con ejecutivo
                    </button>

                    <button
                      onClick={() =>
                        navigate("/cotizador", {
                          state: {
                            id_seguro: seguroActivo.id_seguro,
                            nombre: detalle.nombreVista,
                          },
                        })
                      }
                    >
                      Solicitar cotización
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}

      <Footer />
    </>
  );
}

export default Seguros;
