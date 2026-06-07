import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMisCotizaciones, getMisPolizas } from "../services/api";

const VISTAS_PERMITIDAS = [
  "resumen",
  "polizas",
  "siniestro",
  "cuotas",
  "documentos",
  "cotizaciones",
  "beneficiarios",
  "perfil",
];

function obtenerVistaDesdeRuta(location) {
  const params = new URLSearchParams(location.search);
  const vistaUrl = params.get("vista");
  const vistaState = location.state?.vista;

  if (VISTAS_PERMITIDAS.includes(vistaState)) return vistaState;
  if (VISTAS_PERMITIDAS.includes(vistaUrl)) return vistaUrl;

  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const nombreCliente = localStorage.getItem("nombre_cliente") || "Cliente";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [vista, setVista] = useState(() => obtenerVistaDesdeRuta(location) || "resumen");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seguroDetalleId, setSeguroDetalleId] = useState(null);
  const [cotizacionCompacta, setCotizacionCompacta] = useState({
    detalle: "",
    comentario: "",
  });

  const [filtrosDocumentos, setFiltrosDocumentos] = useState({
    busqueda: "",
    seguro: "todos",
    tipo: "todos",
    estado: "todos",
  });

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  useEffect(() => {
    const vistaRuta = obtenerVistaDesdeRuta(location);
    if (vistaRuta) setVista(vistaRuta);
  }, [location]);

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
      cubre: ["Robo", "Accidentes", "Daños materiales", "Responsabilidad civil"],
    },
    {
      id: "rci-argentina",
      nombre: "Responsabilidad Civil Internacional",
      categoria: "Vehículos",
      descripcion: "Seguro obligatorio para vehículos que cruzan hacia Argentina.",
      foto: "/foto-RCI.png",
      precioUf: "Desde 0,17 UF / día",
      precioClp: "Valor referencial según UF diaria",
      cubre: ["Daños a terceros", "Ingreso a Argentina", "Cobertura internacional"],
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
      precioUf: "Cotización personalizada",
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login-clientes");
      return;
    }

    async function cargarDatos() {
      try {
        const [cots, pols] = await Promise.all([
          getMisCotizaciones(token),
          getMisPolizas(token),
        ]);

        setCotizaciones(Array.isArray(cots) ? cots : []);
        setPolizas(Array.isArray(pols) ? pols : []);
      } catch {
        setError("Sesión expirada. Vuelve a ingresar.");
        localStorage.removeItem("token");
        navigate("/login-clientes");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [navigate]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    navigate("/login-clientes");
  }

  function abrirWhatsApp(mensaje = "Hola, necesito ayuda con mi portal de seguros.") {
    const telefono = "56966541939";
    const texto = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${telefono}?text=${texto}`, "_blank", "noopener,noreferrer");
  }

  function formatearFecha(fecha) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CL");
  }

  function calcularEstado(poliza) {
    if (!poliza.fecha_vencimiento) return poliza.estado || "vigente";

    const hoy = new Date();
    const vencimiento = new Date(poliza.fecha_vencimiento);
    const dias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (dias < 0) return "caducada";
    if (dias <= 30) return "por-vencer";

    return poliza.estado === "activa" ? "vigente" : poliza.estado;
  }

  function textoEstado(estado) {
    if (estado === "por-vencer") return "Por vencer";
    return estado || "Vigente";
  }

  function abrirDetalleCotizacion(idSeguro) {
    setSeguroDetalleId(idSeguro);
    setVista("cotizaciones");
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
RUT: ${localStorage.getItem("rut_cliente") || "No informado"}
Correo: ${localStorage.getItem("correo_cliente") || "No informado"}
Teléfono: ${localStorage.getItem("telefono_cliente") || "No informado"}

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
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
  }

  function actualizarFiltroDocumento(e) {
    const { name, value } = e.target;

    setFiltrosDocumentos((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function solicitarDocumentoPorCorreo(documento) {
    const destinatario = "cotizaciones@prietocorrea.cl";
    const asunto = `Solicitud de documento - ${documento.nombre}`;
    const cuerpo = `Hola, soy cliente de Prieto & Correa Seguros.

Necesito solicitar el siguiente documento desde mi portal.

Documento:
${documento.nombre}

Seguro / Póliza:
${documento.seguro}

Tipo:
${documento.tipo}

Estado:
${documento.estado}

Datos del cliente:
Nombre: ${nombreCliente}
RUT: ${localStorage.getItem("rut_cliente") || "No informado"}
Correo: ${localStorage.getItem("correo_cliente") || "No informado"}
Teléfono: ${localStorage.getItem("telefono_cliente") || "No informado"}

Quedo atento/a a su gestión.`;

    window.location.href = `mailto:${destinatario}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
  }

  function descargarDocumento(documento) {
    if (documento.estado !== "Disponible") {
      alert("Este documento todavía no está disponible para descarga.");
      return;
    }

    alert(`Descarga simulada: ${documento.nombre}`);
  }

  function contactarEjecutivoDocumento(documento) {
    abrirWhatsApp(`Hola, necesito ayuda con un documento de mi portal.

Documento: ${documento.nombre}
Seguro / Póliza: ${documento.seguro}
Estado: ${documento.estado}`);
  }

  function abrirPreviewDocumento(documento) {
    setDocumentoSeleccionado(documento);
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

  const polizasActivas = polizas.filter(
    (p) => p.estado === "activa" || p.estado === "vigente"
  ).length;

  const companiasAsociadas = [
    ...new Set(polizas.map((p) => p.compania).filter(Boolean)),
  ].length;

  const proximaPoliza = polizas[0];

  const documentosDesdePolizas = polizas.flatMap((poliza, index) => {
    const nombreSeguro = poliza.seguro?.nombre || poliza.nombre_seguro || "Seguro asociado";
    const numeroPoliza = poliza.numero_poliza || `POL-${String(index + 1).padStart(4, "0")}`;

    return [
      {
        id: `poliza-${poliza.id_poliza || index}`,
        nombre: "Póliza vigente",
        seguro: `${nombreSeguro} / ${numeroPoliza}`,
        tipo: "Póliza",
        estado: "Disponible",
        fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      },
      {
        id: `certificado-${poliza.id_poliza || index}`,
        nombre: "Certificado de cobertura",
        seguro: `${nombreSeguro} / ${numeroPoliza}`,
        tipo: "Certificado",
        estado: "Disponible",
        fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      },
      {
        id: `condiciones-${poliza.id_poliza || index}`,
        nombre: "Condiciones generales",
        seguro: `${nombreSeguro} / ${numeroPoliza}`,
        tipo: "Condiciones",
        estado: "Disponible",
        fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      },
    ];
  });

  const documentosDemo =
    documentosDesdePolizas.length > 0
      ? documentosDesdePolizas
      : [
          {
            id: "doc-demo-1",
            nombre: "Póliza vigente",
            seguro: "Seguro de Autos / POL-2026-0001",
            tipo: "Póliza",
            estado: "Disponible",
            fecha: "2026-06-06",
          },
          {
            id: "doc-demo-2",
            nombre: "Certificado de cobertura",
            seguro: "Seguro de Hogar / POL-2026-0002",
            tipo: "Certificado",
            estado: "Disponible",
            fecha: "2026-06-05",
          },
          {
            id: "doc-demo-3",
            nombre: "Comprobante de pago",
            seguro: "Seguro de Autos / POL-2026-0001",
            tipo: "Comprobante",
            estado: "Disponible",
            fecha: "2026-06-01",
          },
          {
            id: "doc-demo-4",
            nombre: "Inspección fotográfica",
            seguro: "Seguro Empresa / POL-2026-0003",
            tipo: "Inspección",
            estado: "En preparación",
            fecha: "",
          },
          {
            id: "doc-demo-5",
            nombre: "Endoso de modificación",
            seguro: "Seguro Flota / POL-2026-0004",
            tipo: "Endoso",
            estado: "Bajo solicitud",
            fecha: "",
          },
        ];

  const segurosDocumentos = ["todos", ...new Set(documentosDemo.map((d) => d.seguro))];
  const tiposDocumentos = ["todos", ...new Set(documentosDemo.map((d) => d.tipo))];
  const estadosDocumentos = ["todos", ...new Set(documentosDemo.map((d) => d.estado))];

  const documentosFiltrados = documentosDemo.filter((documento) => {
    const busqueda = filtrosDocumentos.busqueda.toLowerCase().trim();

    const coincideBusqueda =
      !busqueda ||
      documento.nombre.toLowerCase().includes(busqueda) ||
      documento.seguro.toLowerCase().includes(busqueda) ||
      documento.tipo.toLowerCase().includes(busqueda) ||
      documento.estado.toLowerCase().includes(busqueda);

    const coincideSeguro =
      filtrosDocumentos.seguro === "todos" || documento.seguro === filtrosDocumentos.seguro;

    const coincideTipo =
      filtrosDocumentos.tipo === "todos" || documento.tipo === filtrosDocumentos.tipo;

    const coincideEstado =
      filtrosDocumentos.estado === "todos" || documento.estado === filtrosDocumentos.estado;

    return coincideBusqueda && coincideSeguro && coincideTipo && coincideEstado;
  });

  const documentosDisponibles = documentosDemo.filter(
    (documento) => documento.estado === "Disponible"
  ).length;

  const polizasConDocumentos = new Set(documentosDemo.map((documento) => documento.seguro)).size;

  return (
    <section className="pc-dashboard">
      <aside className="pc-sidebar">
        <div className="pc-sidebar-logo">
          <img src="/Logo Prieto.png" alt="Prieto & Correa" />
        </div>

        <nav className="pc-sidebar-nav">
          <button
            className={vista === "resumen" ? "active" : ""}
            onClick={() => setVista("resumen")}
          >
            <img src="/inicio.png" alt="" />
            <span>Inicio</span>
          </button>

          <button
            className={vista === "polizas" ? "active" : ""}
            onClick={() => setVista("polizas")}
          >
            <img src="/mis-polizas-activas.png" alt="" />
            <span>Mis Pólizas</span>
          </button>

          <button
            className={vista === "siniestro" ? "active" : ""}
            onClick={() => setVista("siniestro")}
          >
            <img src="/reportar-siniestro.png" alt="" />
            <span>Siniestros</span>
          </button>

          <button
            className={vista === "cuotas" ? "active" : ""}
            onClick={() => setVista("cuotas")}
          >
            <img src="/pagos.png" alt="" />
            <span>Pagos</span>
          </button>

          <button
            className={vista === "documentos" ? "active" : ""}
            onClick={() => setVista("documentos")}
          >
            <img src="/documentos.png" alt="" />
            <span>Documentos</span>
          </button>

          <button
            className={vista === "cotizaciones" ? "active" : ""}
            onClick={() => setVista("cotizaciones")}
          >
            <img src="/campana.png" alt="" />
            <span>Cotizaciones</span>
          </button>

          <button
            className={vista === "beneficiarios" ? "active" : ""}
            onClick={() => setVista("beneficiarios")}
          >
            <img src="/beneficios.png" alt="" />
            <span>Beneficios</span>
          </button>

          <button
            className={vista === "perfil" ? "active" : ""}
            onClick={() => setVista("perfil")}
          >
            <img src="/icon-cliente.png" alt="" />
            <span>Perfil</span>
          </button>
        </nav>

        <div className="pc-sidebar-promo">
          <p>PROTEGEMOS LO QUE MÁS TE IMPORTA</p>
          <button onClick={() => setVista("cotizaciones")}>Conoce más</button>
        </div>

        <button className="pc-logout" onClick={cerrarSesion}>
          <img src="/cerrar-sesion.png" alt="" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="pc-main">
        <header className="pc-header">
          <div>
            <h1>¡Hola, {nombreCliente}!</h1>
            <p>Nos alegra tenerte de vuelta.</p>
          </div>

          <div className="pc-header-user">
            <span>
              <img src="/campana.png" alt="Notificaciones" />
            </span>

            <span>
              <img src="/correo-electronico.png" alt="Correo" />
            </span>

            <div>
              <strong>{nombreCliente}</strong>
              <small>
                <img src="/premium.png" alt="" />
                Cliente Prieto & Correa
              </small>
            </div>
          </div>
        </header>

        {cargando ? (
          <p className="cargando">Cargando...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : (
          <>
            {vista === "resumen" && (
              <div className="pc-dashboard-grid">
                <section className="pc-left-column">
                  <div className="pc-hero-card">
                    <div>
                      <span className="pc-title-icon">
                        <img src="/proteger.png" alt="" />
                        Resumen de tu protección
                      </span>

                      <h2>Estás protegido en lo que más te importa</h2>

                      <p>
                        Tus pólizas activas brindan tranquilidad a ti y a tu
                        familia.
                      </p>

                      <button onClick={() => setVista("polizas")}>
                        Ver mis pólizas
                      </button>
                    </div>

                    <div className="pc-hero-empty"></div>
                  </div>

                  <div className="pc-stats">
                    <article>
                      <strong>{polizasActivas}</strong>
                      <span>Pólizas activas</span>
                    </article>

                    <article>
                      <strong>{polizas.length}</strong>
                      <span>Total pólizas</span>
                    </article>

                    <article>
                      <strong>{cotizaciones.length}</strong>
                      <span>Cotizaciones</span>
                    </article>

                    <article>
                      <strong>{companiasAsociadas}</strong>
                      <span>Compañías</span>
                    </article>
                  </div>

                  <div className="pc-panel">
                    <div className="pc-panel-title">
                      <h3>
                        <img src="/mis-polizas-activas.png" alt="" />
                        Mis pólizas activas
                      </h3>

                      <button onClick={() => setVista("polizas")}>
                        Ver todas
                      </button>
                    </div>

                    {polizas.length === 0 ? (
                      <div className="pc-empty">
                        <h3>No tienes pólizas registradas</h3>
                        <p>
                          Cuando tengas pólizas activas, aparecerán en este
                          apartado.
                        </p>
                      </div>
                    ) : (
                      polizas.slice(0, 3).map((p) => (
                        <div className="pc-policy-row" key={p.id_poliza}>
                          <div className="pc-policy-icon">
                            <img src="/proteger.png" alt="" />
                          </div>

                          <div>
                            <strong>{p.seguro?.nombre || "Seguro"}</strong>
                            <small>
                              Póliza: {p.numero_poliza || "Sin número"}
                            </small>
                          </div>

                          <span className={`pc-status ${calcularEstado(p)}`}>
                            {textoEstado(calcularEstado(p))}
                          </span>

                          <small>
                            Vence el {formatearFecha(p.fecha_vencimiento)}
                          </small>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pc-advisor-card">
                    <div className="pc-advisor-avatar">
                      <img src="/icon-cliente.png" alt="" />
                    </div>

                    <div>
                      <small>Tu corredor asignado</small>
                      <strong>Ejecutivo Prieto & Correa</strong>

                      <p className="contacto-corredor">
                        <img src="/telefono.png" alt="" />
                        +56 9 6654 1939
                        <img src="/correo-electronico.png" alt="" />
                        cotizaciones@prietocorrea.cl
                      </p>
                    </div>

                    <button
                      className="pc-whatsapp-button pc-whatsapp-button-small"
                      onClick={() =>
                        abrirWhatsApp("Hola, necesito contactar a mi ejecutivo de seguros.")
                      }
                    >
                      <img src="/whatsapp.png" alt="" />
                      <span>Contactar</span>
                    </button>
                  </div>
                </section>

                <aside className="pc-right-column">
                  <div className="pc-panel">
                    <h3 className="titulo-icono">
                      <img src="/accion-rapida.png" alt="" />
                      Acciones rápidas
                    </h3>

                    <div className="pc-actions-grid">
                      <button onClick={() => setVista("siniestro")}>
                        <img src="/reportar-siniestro.png" alt="" />
                        <span>Reportar siniestro →</span>
                      </button>

                      <button onClick={() => setVista("cuotas")}>
                        <img src="/tarjeta-de-debito.png" alt="" />
                        <span>Realizar un pago →</span>
                      </button>

                      <button
                        className="pc-action-whatsapp"
                        onClick={() =>
                          abrirWhatsApp("Hola, necesito solicitar asistencia desde mi portal de cliente.")
                        }
                      >
                        <img src="/whatsapp.png" alt="" />
                        <span>Solicitar asistencia →</span>
                      </button>

                      <button onClick={() => setVista("documentos")}>
                        <img src="/documentos.png" alt="" />
                        <span>Descargar documentos →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pc-panel pc-next-payment">
                    <h3 className="titulo-icono">
                      <img src="/calendario.png" alt="" />
                      Próximo pago
                    </h3>

                    <strong>
                      {proximaPoliza?.seguro?.nombre || "Seguro pendiente"}
                    </strong>

                    <h2>
                      {proximaPoliza?.prima ? `$ ${proximaPoliza.prima}` : "$ 0"}
                    </h2>

                    <p>
                      Vencimiento{" "}
                      {formatearFecha(proximaPoliza?.fecha_vencimiento)}
                    </p>

                    <button onClick={() => setVista("cuotas")}>
                      Realizar pago
                    </button>
                  </div>

                  <div className="pc-help-card">
                    <div>
                      <h3>¿Necesitas ayuda?</h3>
                      <p>Estamos aquí para ayudarte en lo que necesites.</p>

                      <button
                        className="pc-whatsapp-button"
                        onClick={() =>
                          abrirWhatsApp("Hola, necesito hablar con un asesor de Prieto & Correa Seguros.")
                        }
                      >
                        <img src="/whatsapp.png" alt="" />
                        <span>Hablar con un asesor</span>
                      </button>
                    </div>

                    <img
                      src="/solicitar-asistencia.png"
                      alt=""
                      className="premium-icon"
                    />
                  </div>
                </aside>
              </div>
            )}

            {vista === "polizas" && (
              <div className="pc-panel pc-full-panel">
                <h2>Mis pólizas</h2>

                {polizas.length === 0 ? (
                  <div className="pc-empty">
                    <h3>No tienes pólizas registradas</h3>
                    <p>Todavía no existen seguros asociados a esta cuenta.</p>
                    <button onClick={() => setVista("cotizaciones")}>
                      Ver seguros disponibles
                    </button>
                  </div>
                ) : (
                  polizas.map((p) => (
                    <div className="pc-policy-row" key={p.id_poliza}>
                      <div className="pc-policy-icon">
                        <img src="/proteger.png" alt="" />
                      </div>

                      <div>
                        <strong>{p.seguro?.nombre || "Seguro"}</strong>
                        <small>Póliza: {p.numero_poliza || "Sin número"}</small>
                      </div>

                      <span>{p.compania || "Sin compañía"}</span>

                      <span className={`pc-status ${calcularEstado(p)}`}>
                        {textoEstado(calcularEstado(p))}
                      </span>

                      <small>
                        Vence el {formatearFecha(p.fecha_vencimiento)}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}

            {vista === "cotizaciones" && (
              <div className="pc-panel pc-full-panel">
                {!seguroDetalleId ? (
                  <>
                    <h2>Cotizaciones</h2>

                    {cotizaciones.length > 0 && (
                      <div className="pc-cotizaciones">
                        {cotizaciones.map((c) => (
                          <article key={c.id_cotizacion}>
                            <strong>{c.seguro?.nombre || "Seguro"}</strong>
                            <span>Solicitud #{c.id_cotizacion}</span>
                            <small>Estado: {c.estado || "Pendiente"}</small>
                            <small>Fecha: {formatearFecha(c.fecha_solicitud)}</small>
                          </article>
                        ))}
                      </div>
                    )}

                    <div className="cotizar-whatsapp-header pc-cotizar-header">
                      <span>Nueva cotización</span>
                      <h2>Seguros disponibles para cotizar</h2>
                      <p>
                        Revisa los seguros disponibles y solicita atención directa
                        con un ejecutivo.
                      </p>
                    </div>

                    <section className="seguros-bloques portal-seguros-bloques">
                      {segurosDisponibles.map((seguro, index) => (
                        <article
                          className={`seguro-bloque ${
                            index % 2 !== 0 ? "reverse" : ""
                          }`}
                          key={seguro.id}
                        >
                          <div className="seguro-bloque-imagen">
                            <img src={seguro.foto} alt={seguro.nombre} />
                          </div>

                          <div className="seguro-bloque-info">
                            <span>{seguro.categoria}</span>
                            <h2>{seguro.nombre}</h2>
                            <p>{seguro.descripcion}</p>

                            <div className="seguro-precios">
                              <div>
                                <small>Valor UF</small>
                                <strong>{seguro.precioUf}</strong>
                              </div>

                              <div>
                                <small>Valor CLP</small>
                                <strong>{seguro.precioClp}</strong>
                              </div>
                            </div>

                            <div className="seguro-mini-coberturas">
                              {seguro.cubre.slice(0, 4).map((item) => (
                                <span key={item}>{item}</span>
                              ))}
                            </div>

                            <div className="seguro-bloque-actions">
                              <button onClick={() => abrirDetalleCotizacion(seguro.id)}>
                                Ver coberturas
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </section>
                  </>
                ) : (
                  (() => {
                    const seguro = segurosDisponibles.find((item) => item.id === seguroDetalleId);
                    const detalle = obtenerDetalleSeguro(seguro || segurosDisponibles[0]);

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
                          ← Volver a cotizaciones
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
                                <small style={{ color: "#6c7488", fontWeight: 800 }}>
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
                                <small style={{ color: "#6c7488", fontWeight: 800 }}>
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
                                      margin: "0 0 7px",
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
                                      <span style={{ color: "#f47c20" }}>✓</span> {item}
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
                                  fontSize: "24px",
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
                                Completa la información y envía tu solicitud por WhatsApp o correo.
                              </p>
                            </div>

                            <form
                              onSubmit={(e) => enviarCotizacionCompacta(e, seguro)}
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
                                  <small style={{ fontWeight: 900 }}>Nombre</small>
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
                                    value={localStorage.getItem("rut_cliente") || ""}
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
                                  <small style={{ fontWeight: 900 }}>Correo</small>
                                  <input
                                    value={localStorage.getItem("correo_cliente") || ""}
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
                                  <small style={{ fontWeight: 900 }}>Teléfono</small>
                                  <input
                                    value={localStorage.getItem("telefono_cliente") || ""}
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
                                <small style={{ fontWeight: 900 }}>Datos principales para cotizar</small>
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
                                <small style={{ fontWeight: 900 }}>Comentario adicional</small>
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
                                  onClick={() => enviarCotizacionPorCorreo(seguro)}
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
                                    style={{ width: "17px", height: "17px", filter: "brightness(0) invert(1)" }}
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
            )}


            {vista === "documentos" && (
              <div className="pc-panel pc-full-panel">
                <div className="pc-panel-title" style={{ marginBottom: "14px" }}>
                  <div>
                    <h3>
                      <img src="/documentos.png" alt="" />
                      Mis documentos
                    </h3>
                    <p style={{ margin: "6px 0 0", color: "#667085", fontSize: "14px" }}>
                      Revisa, abre y descarga los documentos asociados a tus seguros.
                    </p>
                  </div>
                </div>

                <div className="pc-stats" style={{ marginBottom: "14px" }}>
                  <article>
                    <strong>{documentosDemo.length}</strong>
                    <span>Documentos totales</span>
                  </article>

                  <article>
                    <strong>{polizasConDocumentos}</strong>
                    <span>Pólizas asociadas</span>
                  </article>

                  <article>
                    <strong>{documentosDisponibles}</strong>
                    <span>Disponibles</span>
                  </article>

                  <article>
                    <strong>{documentosDemo.length - documentosDisponibles}</strong>
                    <span>Bajo solicitud</span>
                  </article>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 0.9fr 0.9fr",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <input
                    type="text"
                    name="busqueda"
                    value={filtrosDocumentos.busqueda}
                    onChange={actualizarFiltroDocumento}
                    placeholder="Buscar documento..."
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "1px solid #d9e1ec",
                      borderRadius: "12px",
                      padding: "0 14px",
                      outline: "none",
                    }}
                  />

                  <select
                    name="seguro"
                    value={filtrosDocumentos.seguro}
                    onChange={actualizarFiltroDocumento}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "1px solid #d9e1ec",
                      borderRadius: "12px",
                      padding: "0 12px",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  >
                    {segurosDocumentos.map((seguro) => (
                      <option key={seguro} value={seguro}>
                        {seguro === "todos" ? "Todos los seguros" : seguro}
                      </option>
                    ))}
                  </select>

                  <select
                    name="tipo"
                    value={filtrosDocumentos.tipo}
                    onChange={actualizarFiltroDocumento}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "1px solid #d9e1ec",
                      borderRadius: "12px",
                      padding: "0 12px",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  >
                    {tiposDocumentos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo === "todos" ? "Todos los tipos" : tipo}
                      </option>
                    ))}
                  </select>

                  <select
                    name="estado"
                    value={filtrosDocumentos.estado}
                    onChange={actualizarFiltroDocumento}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "1px solid #d9e1ec",
                      borderRadius: "12px",
                      padding: "0 12px",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  >
                    {estadosDocumentos.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado === "todos" ? "Todos los estados" : estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: documentoSeleccionado ? "1fr 320px" : "1fr",
                    gap: "14px",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #e6ebf2",
                      borderRadius: "18px",
                      overflow: "hidden",
                      background: "#ffffff",
                    }}
                  >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.35fr 0.75fr 0.8fr 0.75fr 1fr",
                      gap: "10px",
                      padding: "12px 16px",
                      background: "#f5f7fb",
                      color: "#07195a",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    <span>Documento</span>
                    <span>Seguro / Póliza</span>
                    <span>Tipo</span>
                    <span>Estado</span>
                    <span>Fecha</span>
                    <span>Acciones</span>
                  </div>

                  {documentosFiltrados.length === 0 ? (
                    <div className="pc-empty" style={{ padding: "26px" }}>
                      <h3>No se encontraron documentos</h3>
                      <p>Prueba cambiando los filtros o contacta a tu ejecutivo si necesitas apoyo.</p>
                    </div>
                  ) : (
                    documentosFiltrados.map((documento) => (
                      <div
                        key={documento.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 1.35fr 0.75fr 0.8fr 0.75fr 1fr",
                          gap: "10px",
                          alignItems: "center",
                          padding: "13px 16px",
                          borderTop: "1px solid #eef2f7",
                          fontSize: "13px",
                        }}
                      >
                        <strong style={{ color: "#07195a" }}>{documento.nombre}</strong>
                        <span style={{ color: "#475467" }}>{documento.seguro}</span>
                        <span>{documento.tipo}</span>
                        <span
                          style={{
                            display: "inline-flex",
                            justifyContent: "center",
                            borderRadius: "999px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 800,
                            color:
                              documento.estado === "Disponible"
                                ? "#067647"
                                : documento.estado === "En preparación"
                                ? "#b54708"
                                : "#07195a",
                            background:
                              documento.estado === "Disponible"
                                ? "#ecfdf3"
                                : documento.estado === "En preparación"
                                ? "#fffaeb"
                                : "#eef4ff",
                          }}
                        >
                          {documento.estado}
                        </span>
                        <span>{formatearFecha(documento.fecha)}</span>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => abrirPreviewDocumento(documento)}
                            style={{
                              minHeight: "34px",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "none",
                              background: "#07195a",
                              color: "#ffffff",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Ver PDF
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              documento.estado === "Disponible"
                                ? descargarDocumento(documento)
                                : contactarEjecutivoDocumento(documento)
                            }
                            style={{
                              minHeight: "34px",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid #f47c20",
                              background: "#ffffff",
                              color: "#f47c20",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {documento.estado === "Disponible" ? "Descargar" : "Ejecutivo"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>

                  {documentoSeleccionado && (
                    <aside
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #dfe7f3",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        padding: "16px",
                        minHeight: "100%",
                        boxShadow: "0 12px 28px rgba(7, 25, 90, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <strong style={{ color: "#07195a", fontSize: "15px" }}>
                          Vista previa
                        </strong>

                        <button
                          type="button"
                          onClick={() => setDocumentoSeleccionado(null)}
                          style={{
                            border: "none",
                            background: "#eef2f7",
                            color: "#07195a",
                            borderRadius: "999px",
                            width: "28px",
                            height: "28px",
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <div
                        style={{
                          borderRadius: "16px",
                          background: "#07195a",
                          color: "#ffffff",
                          padding: "18px",
                          marginBottom: "14px",
                          minHeight: "170px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              borderRadius: "999px",
                              background: "rgba(244, 124, 32, 0.16)",
                              color: "#f47c20",
                              padding: "5px 9px",
                              fontSize: "11px",
                              fontWeight: 900,
                              marginBottom: "12px",
                            }}
                          >
                            PDF
                          </span>

                          <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>
                            {documentoSeleccionado.nombre}
                          </h3>

                          <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontSize: "12px" }}>
                            Documento asociado a tu portal de cliente.
                          </p>
                        </div>

                        <small style={{ color: "rgba(255,255,255,0.65)" }}>
                          Prieto & Correa Seguros
                        </small>
                      </div>

                      <div style={{ display: "grid", gap: "9px", fontSize: "12px" }}>
                        <div>
                          <span style={{ color: "#667085", display: "block" }}>Seguro / Póliza</span>
                          <strong style={{ color: "#07195a" }}>{documentoSeleccionado.seguro}</strong>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <span style={{ color: "#667085", display: "block" }}>Tipo</span>
                            <strong style={{ color: "#07195a" }}>{documentoSeleccionado.tipo}</strong>
                          </div>

                          <div>
                            <span style={{ color: "#667085", display: "block" }}>Fecha</span>
                            <strong style={{ color: "#07195a" }}>
                              {formatearFecha(documentoSeleccionado.fecha)}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <span style={{ color: "#667085", display: "block" }}>Estado</span>
                          <strong style={{ color: "#07195a" }}>{documentoSeleccionado.estado}</strong>
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
                        <button
                          type="button"
                          onClick={() => descargarDocumento(documentoSeleccionado)}
                          style={{
                            minHeight: "38px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#07195a",
                            color: "#ffffff",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Descargar PDF
                        </button>

                        {documentoSeleccionado.estado !== "Disponible" && (
                          <button
                            type="button"
                            onClick={() => contactarEjecutivoDocumento(documentoSeleccionado)}
                            style={{
                              minHeight: "38px",
                              borderRadius: "12px",
                              border: "1px solid #f47c20",
                              background: "#ffffff",
                              color: "#f47c20",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Contactar ejecutivo
                          </button>
                        )}
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            )}

            {vista === "perfil" && (
              <div className="pc-panel pc-full-panel">
                <h2>Perfil Cliente</h2>

                <div className="pc-profile-grid">
                  <article>
                    <small>Nombre</small>
                    <strong>{nombreCliente}</strong>
                  </article>

                  <article>
                    <small>RUT</small>
                    <strong>{localStorage.getItem("rut_cliente") || "—"}</strong>
                  </article>

                  <article>
                    <small>Correo</small>
                    <strong>
                      {localStorage.getItem("correo_cliente") || "—"}
                    </strong>
                  </article>

                  <article>
                    <small>Teléfono</small>
                    <strong>
                      {localStorage.getItem("telefono_cliente") || "—"}
                    </strong>
                  </article>
                </div>
              </div>
            )}

            {["beneficiarios", "cuotas", "siniestro"].includes(
              vista
            ) && (
              <div className="pc-panel pc-full-panel">
                <h2>
                  {vista === "beneficiarios" && "Beneficios"}
                  {vista === "cuotas" && "Pagos y cuotas"}
                  {vista === "documentos" && "Documentos"}
                  {vista === "siniestro" && "Reportar siniestro"}
                </h2>

                <div className="pc-empty">
                  <h3>Sección en preparación</h3>
                  <p>
                    Este apartado quedará conectado al backend en la siguiente
                    etapa.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Dashboard;