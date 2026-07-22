import { useState, useEffect } from "react";
import { useCliente } from "../../context/ClienteContext";
import "../../styles/pages/PortalDashboard.css";

/**
 * Explorar Seguros (vista "cotizaciones") — catálogo de seguros disponibles
 * con carrusel filtrable + detalle con formulario de cotización compacta.
 *
 * Extraído del monolito Dashboard.jsx. AUTOCONTENIDO: todo el estado del
 * carrusel/detalle, el catálogo (segurosDisponibles), las derivaciones y las
 * funciones eran exclusivos de esta vista y se movieron aquí. Solo recibe 4
 * props compartidas. Extraído con los estilos inline tal cual (CSS a futuro).
 */
function ExplorarSeguros({ cotizaciones, abrirWhatsApp, formatearFecha }) {
  const { cliente } = useCliente();
  const nombreCliente = cliente?.nombre || "Cliente";
  const [seguroDetalleId, setSeguroDetalleId] = useState(null);
  const [seguroSlide, setSeguroSlide] = useState(0);
  const [filtroSeguros, setFiltroSeguros] = useState("todos");
  const [ordenSeguros, setOrdenSeguros] = useState("recomendados");
  const [segurosPorVista, setSegurosPorVista] = useState(3);
  const [cotizacionCompacta, setCotizacionCompacta] = useState({
    detalle: "",
    comentario: "",
  });

  useEffect(() => {
    function ajustarSegurosPorVista() {
      if (window.innerWidth <= 700) {
        setSegurosPorVista(1);
        return;
      }

      if (window.innerWidth <= 1250) {
        setSegurosPorVista(2);
        return;
      }

      setSegurosPorVista(3);
    }

    ajustarSegurosPorVista();
    window.addEventListener("resize", ajustarSegurosPorVista);

    return () => window.removeEventListener("resize", ajustarSegurosPorVista);
  }, []);

  useEffect(() => {
    setSeguroSlide(0);
  }, [filtroSeguros, ordenSeguros, segurosPorVista]);

  const segurosDisponibles = [
    {
      id: "autos",
      nombre: "Seguro de Autos",
      categoria: "Vehículos",
      descripcion:
        "Cobertura para accidentes, daños materiales, robo y responsabilidad civil.",
      foto: "/foto-seguro-auto.png",
      precioUf: "Desde 2,45 UF / mes",
      precioClp: "Aprox. $95.130 CLP / mes",
      cubre: [
        "Robo",
        "Accidentes",
        "Daños materiales",
        "Responsabilidad civil",
      ],
    },
    {
      id: "rci-argentina",
      nombre: "Responsabilidad Civil Internacional",
      categoria: "Vehículos",
      descripcion:
        "Seguro obligatorio para vehículos que cruzan hacia Argentina.",
      foto: "/foto-RCI.png",
      precioUf: "Desde 0,17 UF / día",
      precioClp: "Valor referencial según UF diaria",
      cubre: [
        "Daños a terceros",
        "Ingreso a Argentina",
        "Cobertura internacional",
      ],
    },
    {
      id: "soap",
      nombre: "SOAP",
      categoria: "Vehículos",
      descripcion:
        "Seguro obligatorio para accidentes personales causados por vehículos motorizados.",
      foto: "/foto-soap.png",
      precioUf: "Valor anual",
      precioClp: "Según tipo de vehículo",
      cubre: ["Muerte accidental", "Gastos médicos", "Incapacidad"],
    },
    {
      id: "hogar",
      nombre: "Seguro de Hogar",
      categoria: "Personas",
      descripcion:
        "Protección para vivienda, incendio, sismo, daños y asistencias del hogar.",
      foto: "/foto-hogar.png",
      precioUf: "Según Evaluación",
      precioClp: "Según características del hogar",
      cubre: ["Incendio", "Sismo", "Robo", "Daños en estructura"],
    },
    {
      id: "mascotas",
      nombre: "Seguro de Mascotas",
      categoria: "Personas",
      descripcion:
        "Cobertura veterinaria para perros y gatos ante accidentes y enfermedades.",
      foto: "/foto-mascota.png",
      precioUf: "Desde 0,15 UF / mes",
      precioClp: "Según plan contratado",
      cubre: ["Accidentes", "Enfermedades", "Atención veterinaria"],
    },
    {
      id: "viaje",
      nombre: "Asistencia en Viaje",
      categoria: "Personas",
      descripcion:
        "Asistencia médica, hospitalización, repatriación y apoyo en viajes internacionales.",
      foto: "/foto-asistencia-viaje-foto.png",
      precioUf: "Desde 0,32 UF / año",
      precioClp: "Valor referencial anual",
      cubre: ["Asistencia médica", "Repatriación", "Pérdida de equipaje"],
    },
    {
      id: "mujer",
      nombre: "Mujer Segura",
      categoria: "Personas",
      descripcion: "Seguro de accidentes personales orientado a mujeres.",
      foto: "/foto-mujer-segura.png",
      precioUf: "0,33 UF / año",
      precioClp: "Valor referencial anual",
      cubre: ["Muerte accidental", "Incapacidad", "Desmembramiento"],
    },
    {
      id: "garantias",
      nombre: "Seguro de Garantías",
      categoria: "Empresas y otros",
      descripcion:
        "Cubre compromisos contractuales, licitaciones, obras y obligaciones con terceros.",
      foto: "/foto-garantia.png",
      precioUf: "Según evaluación",
      precioClp: "Cotización personalizada",
      cubre: ["Fiel cumplimiento", "Licitaciones", "Seriedad de oferta"],
    },
  ];

  const segurosFiltrados = segurosDisponibles.filter((seguro) => {
    if (filtroSeguros === "todos") return true;
    if (filtroSeguros === "vehiculos") return seguro.categoria === "Vehículos";
    if (filtroSeguros === "personas") return seguro.categoria === "Personas";
    if (filtroSeguros === "hogar") return seguro.id === "hogar";
    if (filtroSeguros === "empresas")
      return seguro.categoria === "Empresas y otros";
    if (filtroSeguros === "internacional") {
      return (
        seguro.id === "rci-argentina" ||
        seguro.id === "viaje" ||
        seguro.nombre.toLowerCase().includes("internacional")
      );
    }

    return true;
  });

  const segurosOrdenados = [...segurosFiltrados].sort((a, b) => {
    if (ordenSeguros === "categoria")
      return a.categoria.localeCompare(b.categoria);
    if (ordenSeguros === "precio") return a.precioUf.localeCompare(b.precioUf);
    return (
      segurosDisponibles.findIndex((seguro) => seguro.id === a.id) -
      segurosDisponibles.findIndex((seguro) => seguro.id === b.id)
    );
  });

  const totalPaginasSeguros = Math.max(
    Math.ceil(segurosOrdenados.length / segurosPorVista),
    1,
  );
  const paginaSeguroActual = Math.min(seguroSlide, totalPaginasSeguros - 1);
  const mostrarFlechasSeguros = totalPaginasSeguros > 1;
  const segurosVisiblesCarrusel = segurosOrdenados.slice(
    paginaSeguroActual * segurosPorVista,
    paginaSeguroActual * segurosPorVista + segurosPorVista,
  );

  function avanzarSeguros() {
    setSeguroSlide((prev) => Math.min(prev + 1, totalPaginasSeguros - 1));
  }

  function retrocederSeguros() {
    setSeguroSlide((prev) => Math.max(prev - 1, 0));
  }

  function irASlideSeguro(index) {
    setSeguroSlide(Math.min(Math.max(index, 0), totalPaginasSeguros - 1));
  }

  function cambiarFiltroSeguros(nuevoFiltro) {
    setFiltroSeguros(nuevoFiltro);
  }

  function abrirDetalleCotizacion(idSeguro) {
    setSeguroDetalleId(idSeguro);
  }

  function volverACotizaciones() {
    setSeguroDetalleId(null);
    setCotizacionCompacta({
      detalle: "",
      comentario: "",
    });
  }

  function actualizarCotizacionCompacta(e) {
    const { name, value } = e.target;

    setCotizacionCompacta((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function crearMensajeCotizacion(seguro) {
    return `Hola, soy cliente de Prieto & Correa Seguros.

Quiero solicitar una cotización desde mi portal.

Seguro solicitado:
${seguro.nombre}

Categoría:
${seguro.categoria}

Datos del cliente:
Nombre: ${nombreCliente}
RUT: ${cliente?.rut || "No informado"}
Correo: ${cliente?.correo || "No informado"}
Teléfono: ${cliente?.telefono || "No informado"}

Datos principales:
${cotizacionCompacta.detalle || "No informado"}

Comentario adicional:
${cotizacionCompacta.comentario || "Sin comentario adicional"}`;
  }

  function enviarCotizacionCompacta(e, seguro) {
    e.preventDefault();
    abrirWhatsApp(crearMensajeCotizacion(seguro));
  }

  function enviarCotizacionPorCorreo(seguro) {
    const destinatario = "cotizaciones@prietocorrea.cl";
    const asunto = `Solicitud de cotización - ${seguro.nombre}`;
    const cuerpo = crearMensajeCotizacion(seguro);

    window.location.href = `mailto:${destinatario}?subject=${encodeURIComponent(
      asunto,
    )}&body=${encodeURIComponent(cuerpo)}`;
  }

  function obtenerDetalleSeguro(seguro) {
    return {
      coberturas: seguro.cubre || [],
      beneficios: [
        "Asesoría directa con ejecutivo",
        "Cotización con distintas compañías",
        "Apoyo en renovación de póliza",
        "Orientación personalizada",
      ],
      requisitos: [
        "Datos del cliente actualizados",
        "Antecedentes necesarios según el seguro",
        "Evaluación de la compañía",
      ],
    };
  }

  return (
              <div className="pc-panel pc-full-panel">
                {!seguroDetalleId ? (
                  <>
                    <section className="pc-seguros-disponibles-v2">
                      <div className="pc-seguros-v2-head">
                        <div>
                          <h2>Seguros Disponibles</h2>
                          <p>
                            Explora soluciones de protección disponibles para
                            personas, familias y empresas con acompañamiento
                            Prieto & Correa.
                          </p>
                        </div>

                        <div className="pc-seguros-v2-advice">
                          <div className="pc-seguros-v2-advice-icon">
                            <img src="/solicitar-asistencia.png" alt="" />
                          </div>

                          <div>
                            <strong>¿No sabes cuál elegir?</strong>
                            <span>
                              Tu ejecutivo puede ayudarte a encontrar la
                              alternativa adecuada para ti.
                            </span>
                          </div>

                          <button
                            type="button"
                            className="pc-seguros-v2-orange"
                            onClick={() =>
                              abrirWhatsApp(
                                "Hola, necesito contactar a mi ejecutivo para revisar una solución de seguro disponible.",
                              )
                            }
                          >
                            <img src="/whatsapp.png" alt="" />
                            Contactar ejecutivo
                          </button>
                        </div>
                      </div>

                      {cotizaciones.length > 0 && (
                        <div className="pc-cotizaciones pc-cotizaciones-v2">
                          {cotizaciones.map((c) => (
                            <article key={c.id_cotizacion}>
                              <strong>{c.seguro?.nombre || "Seguro"}</strong>
                              <span>Solicitud #{c.id_cotizacion}</span>
                              <small>Estado: {c.estado || "Pendiente"}</small>
                              <small>
                                Fecha: {formatearFecha(c.fecha_solicitud)}
                              </small>
                            </article>
                          ))}
                        </div>
                      )}

                      <div className="pc-seguros-v2-toolbar">
                        <div>
                          <h3>¿Qué deseas proteger?</h3>

                          <div className="pc-seguros-v2-filters">
                            <button
                              type="button"
                              className={
                                filtroSeguros === "todos" ? "active" : ""
                              }
                              onClick={() => cambiarFiltroSeguros("todos")}
                            >
                              <img src="/proteger.png" alt="" />
                              Ver todo
                            </button>
                            <button
                              type="button"
                              className={
                                filtroSeguros === "vehiculos" ? "active" : ""
                              }
                              onClick={() => cambiarFiltroSeguros("vehiculos")}
                            >
                              <img src="/icon-seguro-auto.png" alt="" />
                              Vehículos
                            </button>
                            <button
                              type="button"
                              className={
                                filtroSeguros === "personas" ? "active" : ""
                              }
                              onClick={() => cambiarFiltroSeguros("personas")}
                            >
                              <img src="/icon-cliente.png" alt="" />
                              Personas
                            </button>
                            <button
                              type="button"
                              className={
                                filtroSeguros === "hogar" ? "active" : ""
                              }
                              onClick={() => cambiarFiltroSeguros("hogar")}
                            >
                              <img src="/icon-hogar.png" alt="" />
                              Hogar y patrimonio
                            </button>
                            <button
                              type="button"
                              className={
                                filtroSeguros === "empresas" ? "active" : ""
                              }
                              onClick={() => cambiarFiltroSeguros("empresas")}
                            >
                              <img src="/icon-edificio.png" alt="" />
                              Empresas
                            </button>
                            <button
                              type="button"
                              className={
                                filtroSeguros === "internacional"
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                cambiarFiltroSeguros("internacional")
                              }
                            >
                              <img src="/mapa-del-mundo.png" alt="" />
                              Internacional
                            </button>
                          </div>
                        </div>

                        <label className="pc-seguros-v2-order">
                          Ordenar por
                          <select
                            value={ordenSeguros}
                            onChange={(e) => setOrdenSeguros(e.target.value)}
                          >
                            <option value="recomendados">Recomendados</option>
                            <option value="precio">Precio</option>
                            <option value="categoria">Categoría</option>
                          </select>
                        </label>
                      </div>

                      <div className="pc-seguros-carousel-shell">
                        {mostrarFlechasSeguros && (
                          <button
                            type="button"
                            className="pc-seguros-carousel-arrow pc-seguros-carousel-arrow-left"
                            onClick={retrocederSeguros}
                            disabled={paginaSeguroActual === 0}
                            aria-label="Ver seguros anteriores"
                          >
                            ‹
                          </button>
                        )}

                        <div className="pc-seguros-carousel-viewport">
                          <section className="seguros-bloques portal-seguros-bloques pc-seguros-grid-v2 pc-seguros-carousel-track">
                            {segurosVisiblesCarrusel.map((seguro, index) => {
                              const indiceRealSeguro =
                                paginaSeguroActual * segurosPorVista + index;

                              return (
                                <article
                                  className="seguro-bloque pc-seguro-producto-v2"
                                  key={seguro.id}
                                >
                                  <div className="seguro-bloque-imagen">
                                    <img
                                      src={seguro.foto}
                                      alt={seguro.nombre}
                                    />
                                    <span
                                      className={`pc-product-badge badge-${indiceRealSeguro % 3}`}
                                    >
                                      {indiceRealSeguro === 0
                                        ? "Recomendado"
                                        : seguro.categoria}
                                    </span>
                                  </div>

                                  <div className="seguro-bloque-info">
                                    <h2>{seguro.nombre}</h2>
                                    <p>{seguro.descripcion}</p>

                                    <div className="seguro-mini-coberturas pc-product-checks">
                                      {seguro.cubre.slice(0, 3).map((item) => (
                                        <span key={item}>✓ {item}</span>
                                      ))}
                                    </div>

                                    <div className="pc-product-bottom">
                                      <div>
                                        <small>Desde</small>
                                        <strong>
                                          {seguro.precioUf.replace(
                                            "Desde ",
                                            "",
                                          )}
                                        </strong>
                                      </div>

                                      <div className="pc-product-advised">
                                        <img src="/premium.png" alt="" />
                                        <span>
                                          Asesorado por
                                          <br />
                                          Prieto & Correa
                                        </span>
                                      </div>
                                    </div>

                                    <div className="seguro-bloque-actions pc-product-actions">
                                      <button
                                        onClick={() =>
                                          abrirDetalleCotizacion(seguro.id)
                                        }
                                      >
                                        Ver cobertura
                                      </button>
                                      <button
                                        type="button"
                                        className="pc-product-secondary"
                                        onClick={() =>
                                          abrirDetalleCotizacion(seguro.id)
                                        }
                                      >
                                        Solicitar propuesta
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </section>
                        </div>

                        {mostrarFlechasSeguros && (
                          <button
                            type="button"
                            className="pc-seguros-carousel-arrow pc-seguros-carousel-arrow-right"
                            onClick={avanzarSeguros}
                            disabled={
                              paginaSeguroActual === totalPaginasSeguros - 1
                            }
                            aria-label="Ver seguros siguientes"
                          >
                            ›
                          </button>
                        )}
                      </div>

                      {mostrarFlechasSeguros && (
                        <div
                          className="pc-seguros-carousel-dots"
                          aria-label="Indicador de seguros disponibles"
                        >
                          {Array.from({ length: totalPaginasSeguros }).map(
                            (_, index) => (
                              <button
                                key={index}
                                type="button"
                                className={
                                  paginaSeguroActual === index ? "active" : ""
                                }
                                onClick={() => irASlideSeguro(index)}
                                aria-label={`Ir al grupo de seguros ${index + 1}`}
                              />
                            ),
                          )}
                        </div>
                      )}

                      <div className="pc-seguros-v2-trustbar">
                        <article>
                          <img src="/proteger.png" alt="" />
                          <div>
                            <strong>Acompañamiento experto</strong>
                            <span>
                              Te asesoramos antes, durante y después de
                              contratar.
                            </span>
                          </div>
                        </article>
                        <article>
                          <img src="/beneficios.png" alt="" />
                          <div>
                            <strong>Soluciones a tu medida</strong>
                            <span>
                              Productos diseñados para adaptarse a tus
                              necesidades.
                            </span>
                          </div>
                        </article>
                        <article>
                          <img src="/candado.png" alt="" />
                          <div>
                            <strong>Confianza y respaldo</strong>
                            <span>
                              Trabajamos con las mejores aseguradoras del
                              mercado.
                            </span>
                          </div>
                        </article>
                        <article>
                          <img src="/calendario.png" alt="" />
                          <div>
                            <strong>Respuesta ágil</strong>
                            <span>
                              Cotiza y recibe una propuesta en minutos.
                            </span>
                          </div>
                        </article>
                      </div>
                    </section>
                  </>
                ) : (
                  (() => {
                    const seguro = segurosDisponibles.find(
                      (item) => item.id === seguroDetalleId,
                    );
                    const detalle = obtenerDetalleSeguro(
                      seguro || segurosDisponibles[0],
                    );

                    if (!seguro) return null;

                    return (
                      <div
                        style={{
                          display: "grid",
                          gap: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={volverACotizaciones}
                          style={{
                            width: "fit-content",
                            border: "0",
                            borderRadius: "999px",
                            padding: "8px 16px",
                            background: "#ffffff",
                            color: "#07195a",
                            fontWeight: 900,
                            boxShadow: "0 12px 30px rgba(7, 25, 90, 0.1)",
                            cursor: "pointer",
                          }}
                        >
                          ← Volver a Seguros Disponibles
                        </button>

                        <section
                          style={{
                            display: "grid",
                            gridTemplateColumns: "0.9fr 1.1fr",
                            gap: "8px",
                            alignItems: "stretch",
                          }}
                        >
                          <article
                            style={{
                              background:
                                "linear-gradient(135deg, #ffffff 0%, #ffffff 58%, #fff0e6 100%)",
                              borderRadius: "24px",
                              padding: "22px",
                              boxShadow: "0 20px 45px rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <span
                              style={{
                                color: "#f47c20",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                fontSize: "11.5px",
                              }}
                            >
                              {seguro.categoria}
                            </span>

                            <h2
                              style={{
                                margin: "8px 0 10px",
                                color: "#07195a",
                                fontSize: "30px",
                                lineHeight: 1,
                              }}
                            >
                              {seguro.nombre}
                            </h2>

                            <p
                              style={{
                                margin: 0,
                                color: "#4c5876",
                                lineHeight: 1.35,
                              }}
                            >
                              {seguro.descripcion}
                            </p>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                                marginTop: "14px",
                              }}
                            >
                              <div
                                style={{
                                  background: "#f5f7fb",
                                  borderRadius: "16px",
                                  padding: "11px",
                                }}
                              >
                                <small
                                  style={{ color: "#6c7488", fontWeight: 800 }}
                                >
                                  Valor UF
                                </small>
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#07195a",
                                    marginTop: "4px",
                                  }}
                                >
                                  {seguro.precioUf}
                                </strong>
                              </div>

                              <div
                                style={{
                                  background: "#f5f7fb",
                                  borderRadius: "16px",
                                  padding: "11px",
                                }}
                              >
                                <small
                                  style={{ color: "#6c7488", fontWeight: 800 }}
                                >
                                  Valor CLP
                                </small>
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#07195a",
                                    marginTop: "4px",
                                  }}
                                >
                                  {seguro.precioClp}
                                </strong>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "8px",
                                marginTop: "12px",
                              }}
                            >
                              {[
                                ["Qué cubre", detalle.coberturas],
                                ["Beneficios", detalle.beneficios],
                                ["Requisitos", detalle.requisitos],
                              ].map(([titulo, items]) => (
                                <div
                                  key={titulo}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #e8edf6",
                                    borderRadius: "16px",
                                    padding: "11px",
                                  }}
                                >
                                  <h3
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#07195a",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {titulo}
                                  </h3>

                                  {items.slice(0, 3).map((item) => (
                                    <p
                                      key={item}
                                      style={{
                                        margin: "5px 0",
                                        color: "#4c5876",
                                        fontWeight: 700,
                                        fontSize: "11.5px",
                                      }}
                                    >
                                      <span style={{ color: "#f47c20" }}>
                                        ✓
                                      </span>{" "}
                                      {item}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </article>

                          <article
                            style={{
                              background: "#07195a",
                              borderRadius: "24px",
                              padding: "20px",
                              color: "#ffffff",
                              display: "grid",
                              alignContent: "start",
                              gap: "8px",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  color: "#f47c20",
                                  fontWeight: 900,
                                  textTransform: "uppercase",
                                  fontSize: "11.5px",
                                }}
                              >
                                Cotización personalizada
                              </span>

                              <h2
                                style={{
                                  margin: "6px 0 6px",
                                  fontSize: "19px",
                                  lineHeight: 1.1,
                                }}
                              >
                                Solicita esta cotización
                              </h2>

                              <p
                                style={{
                                  margin: 0,
                                  color: "rgba(255,255,255,0.78)",
                                  lineHeight: 1.45,
                                }}
                              >
                                Completa la información y envía tu solicitud por
                                WhatsApp o correo.
                              </p>
                            </div>

                            <form
                              onSubmit={(e) =>
                                enviarCotizacionCompacta(e, seguro)
                              }
                              style={{
                                display: "grid",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "8px",
                                }}
                              >
                                <div>
                                  <small style={{ fontWeight: 900 }}>
                                    Nombre
                                  </small>
                                  <input
                                    value={nombreCliente}
                                    readOnly
                                    style={{
                                      width: "100%",
                                      height: "36px",
                                      border: "0",
                                      borderRadius: "10px",
                                      padding: "0 12px",
                                      marginTop: "4px",
                                      fontWeight: 800,
                                    }}
                                  />
                                </div>

                                <div>
                                  <small style={{ fontWeight: 900 }}>RUT</small>
                                  <input
                                    value={cliente?.rut || ""}
                                    readOnly
                                    style={{
                                      width: "100%",
                                      height: "36px",
                                      border: "0",
                                      borderRadius: "10px",
                                      padding: "0 12px",
                                      marginTop: "4px",
                                      fontWeight: 800,
                                    }}
                                  />
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "8px",
                                }}
                              >
                                <div>
                                  <small style={{ fontWeight: 900 }}>
                                    Correo
                                  </small>
                                  <input
                                    value={cliente?.correo || ""}
                                    readOnly
                                    style={{
                                      width: "100%",
                                      height: "36px",
                                      border: "0",
                                      borderRadius: "10px",
                                      padding: "0 12px",
                                      marginTop: "4px",
                                      fontWeight: 800,
                                    }}
                                  />
                                </div>

                                <div>
                                  <small style={{ fontWeight: 900 }}>
                                    Teléfono
                                  </small>
                                  <input
                                    value={
                                      localStorage.getItem(
                                        "telefono_cliente",
                                      ) || ""
                                    }
                                    readOnly
                                    style={{
                                      width: "100%",
                                      height: "36px",
                                      border: "0",
                                      borderRadius: "10px",
                                      padding: "0 12px",
                                      marginTop: "4px",
                                      fontWeight: 800,
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <small style={{ fontWeight: 900 }}>
                                  Datos principales para cotizar
                                </small>
                                <textarea
                                  name="detalle"
                                  value={cotizacionCompacta.detalle}
                                  onChange={actualizarCotizacionCompacta}
                                  placeholder="Ej: patente, dirección, destino, monto requerido, etc."
                                  required
                                  rows="1"
                                  style={{
                                    width: "100%",
                                    border: "0",
                                    borderRadius: "12px",
                                    padding: "9px 11px",
                                    marginTop: "4px",
                                    resize: "none",
                                    fontWeight: 700,
                                  }}
                                />
                              </div>

                              <div>
                                <small style={{ fontWeight: 900 }}>
                                  Comentario adicional
                                </small>
                                <textarea
                                  name="comentario"
                                  value={cotizacionCompacta.comentario}
                                  onChange={actualizarCotizacionCompacta}
                                  placeholder="Información adicional para el ejecutivo."
                                  rows="1"
                                  style={{
                                    width: "100%",
                                    border: "0",
                                    borderRadius: "12px",
                                    padding: "9px 11px",
                                    marginTop: "4px",
                                    resize: "none",
                                    fontWeight: 700,
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "8px",
                                  marginTop: "2px",
                                }}
                              >
                                <button
                                  type="submit"
                                  style={{
                                    height: "40px",
                                    border: "0",
                                    borderRadius: "999px",
                                    background: "#f47c20",
                                    color: "#ffffff",
                                    fontWeight: 900,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <img
                                    src="/whatsapp.png"
                                    alt=""
                                    style={{ width: "17px", height: "17px" }}
                                  />
                                  WhatsApp
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    enviarCotizacionPorCorreo(seguro)
                                  }
                                  style={{
                                    height: "40px",
                                    border: "1px solid rgba(255,255,255,0.35)",
                                    borderRadius: "999px",
                                    background: "rgba(255,255,255,0.12)",
                                    color: "#ffffff",
                                    fontWeight: 900,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <img
                                    src="/correo-electronico.png"
                                    alt=""
                                    style={{
                                      width: "17px",
                                      height: "17px",
                                      filter: "brightness(0) invert(1)",
                                    }}
                                  />
                                  Correo
                                </button>
                              </div>
                            </form>
                          </article>
                        </section>
                      </div>
                    );
                  })()
                )}
              </div>
  );
}

export default ExplorarSeguros;
