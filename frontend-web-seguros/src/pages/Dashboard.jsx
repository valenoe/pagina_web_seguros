import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/pages/PortalDashboard.css";
import ClubBeneficios from "./dashboard/ClubBeneficios";
import MisSeguros from "./dashboard/MisSeguros";
import ReportarSiniestro from "./dashboard/ReportarSiniestro";
import ExplorarSeguros from "./dashboard/ExplorarSeguros";
import Perfil from "./dashboard/Perfil";
import Notificaciones from "./dashboard/Notificaciones";
import PolizaDetalle from "./dashboard/PolizaDetalle";
import CotizacionExitosaContent from "../components/CotizacionExitosaContent";
import {
  getMisAlertas,
  getMisBeneficiarios,
  getMisBeneficios,
  getMisCotizaciones,
  getMisDocumentos,
  getMisPagos,
  getMisPolizas,
} from "../services/api";
import { useCliente } from "../context/ClienteContext";

const VISTAS_PERMITIDAS = [
  "resumen",
  "mis-seguros",
  "siniestro",
  "Club-PC",
  "explora",
  "beneficiarios",
  "perfil",
  "notificaciones",
  "cotizacion-exitosa",
];

/**
 * Lee la vista activa desde las DOS formas viejas de pasarla, previas a las
 * rutas reales con parámetro (`/clientes/dashboard/:vista`):
 *
 *   1. Query string:  /clientes/dashboard?vista=Club-PC   → location.search
 *   2. State de navegación:  navigate("/clientes/dashboard", { state: { vista } })
 *      (un dato "invisible" que React Router lleva sin mostrarlo en la URL)
 *
 * Devuelve esa vista solo si está en la lista blanca; si no, null.
 *
 * Hoy es solo un RESPALDO para no romper enlaces antiguos. La fuente principal
 * de la vista pasó a ser el parámetro de la URL (`useParams()`), que se lee
 * primero; esta función solo se consulta si ese parámetro no viene.
 */
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

  // Identidad del cliente: única fuente = API vía contexto (sin espejo localStorage).
  const { cliente, limpiarCliente } = useCliente();

  const nombreCliente =
    cliente?.nombre && !/[0-9]/.test(cliente.nombre) ? cliente.nombre : "Nombre";
  const primerNombreCliente = nombreCliente.split(" ")[0] || "Nombre";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [beneficios, setBeneficios] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // La URL es la fuente de verdad de la vista activa:
  //   /clientes/dashboard            → resumen
  //   /clientes/dashboard/:vista     → esa vista
  // `setVista` se conserva como API interna, pero ahora navega en vez de
  // mutar estado, así cada cambio de componente cambia también la ruta.
  const { vista: vistaParam, idPoliza } = useParams();
  const vistaSolicitada =
    vistaParam || obtenerVistaDesdeRuta(location) || "resumen";
  // Al ver el detalle de una póliza, el marco se comporta como "Mis Seguros"
  // (menú resaltado + saludo), y el contenido central es <PolizaDetalle/>.
  const vista = idPoliza
    ? "mis-seguros"
    : VISTAS_PERMITIDAS.includes(vistaSolicitada)
      ? vistaSolicitada
      : "resumen";

  function setVista(nuevaVista) {
    navigate(
      nuevaVista === "resumen"
        ? "/clientes/dashboard"
        : `/clientes/dashboard/${nuevaVista}`,
    );
  }

  // Secciones "especiales" (sub-páginas) que muestran un botón Volver en el
  // header en vez del saludo: detalle de póliza y notificaciones.
  const enPoliza = Boolean(idPoliza);
  const enNotificaciones = vista === "notificaciones";
  const seccionEspecial = enPoliza || enNotificaciones;
  // "Volver atrás": regresa a donde estabas (estas sub-páginas se abren desde
  // cualquier vista). Si no hay historial (entraste por URL directa), cae a Inicio.
  const volverContexto = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/clientes/dashboard");
  };
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [filtrosDocumentos, setFiltrosDocumentos] = useState({
    busqueda: "",
    seguro: "todos",
    tipo: "todos",
    estado: "todos",
  });

  const [tabMisSeguros, setTabMisSeguros] = useState("polizas");

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  // Derivados del contexto (se refrescan solos cuando cambia `cliente`).
  const avatarPerfil = cliente?.foto || "";
  const datosPerfil = cliente || {
    nombre: "Cliente",
    rut: "",
    correo: "",
    telefono: "",
    direccion: "",
  };

  const nombreVisible = datosPerfil.nombre || nombreCliente || "Cliente";
  const primerNombreVisible = nombreVisible.split(" ")[0] || "Cliente";
  const inicialVisible = primerNombreVisible.charAt(0).toUpperCase();



  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login-clientes");
      return;
    }

    async function cargarDatos() {
      try {
        // El perfil (getMiCuenta) lo maneja el ClienteContext; aquí solo se
        // cargan los datos de las secciones del portal.
        const [
          alertasResult,
          cotsResult,
          polsResult,
          benResult,
          docsResult,
          pagosResult,
          beneficiosResult,
        ] = await Promise.allSettled([
          getMisAlertas(token),
          getMisCotizaciones(token),
          getMisPolizas(token),
          getMisBeneficiarios(token),
          getMisDocumentos(token),
          getMisPagos(token),
          getMisBeneficios(token),
        ]);

        if (alertasResult.status === "fulfilled") {
          setAlertas(
            Array.isArray(alertasResult.value) ? alertasResult.value : [],
          );
        }

        if (cotsResult.status === "fulfilled") {
          setCotizaciones(
            Array.isArray(cotsResult.value) ? cotsResult.value : [],
          );
        }

        if (polsResult.status === "fulfilled") {
          setPolizas(Array.isArray(polsResult.value) ? polsResult.value : []);
        }

        if (benResult.status === "fulfilled") {
          setBeneficiarios(
            Array.isArray(benResult.value) ? benResult.value : [],
          );
        }

        if (docsResult.status === "fulfilled") {
          setDocumentos(
            Array.isArray(docsResult.value) ? docsResult.value : [],
          );
        }

        if (pagosResult.status === "fulfilled") {
          setPagos(Array.isArray(pagosResult.value) ? pagosResult.value : []);
        }

        if (beneficiosResult.status === "fulfilled") {
          setBeneficios(
            Array.isArray(beneficiosResult.value) ? beneficiosResult.value : [],
          );
        }

        if (
          cotsResult.status === "rejected" &&
          polsResult.status === "rejected"
        ) {
          throw new Error("Sesión expirada");
        }
      } catch {
        setError("Sesión expirada. Vuelve a ingresar.");
        localStorage.removeItem("token");
        limpiarCliente();
        navigate("/login-clientes");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [navigate, limpiarCliente]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    limpiarCliente();
    navigate("/login-clientes");
  }

  function abrirWhatsApp(
    mensaje = "Hola, necesito ayuda con mi portal de seguros.",
  ) {
    const telefono = "56966541939";
    const texto = encodeURIComponent(mensaje);
    window.open(
      `https://wa.me/${telefono}?text=${texto}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function formatearFecha(fecha) {
    if (!fecha) return "—";
    // Fecha pura "YYYY-MM-DD": se formatea a mano para evitar el corrimiento de
    // zona horaria (new Date la lee en UTC y en Chile, UTC−4, se va un día atrás).
    const m = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
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
RUT: ${datosPerfil.rut || "No informado"}
Correo: ${datosPerfil.correo || "No informado"}
Teléfono: ${datosPerfil.telefono || "No informado"}

Quedo atento/a a su gestión.`;

    window.location.href = `mailto:${destinatario}?subject=${encodeURIComponent(
      asunto,
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


  function normalizarEstado(estado = "") {
    const estadoLimpio = String(estado || "")
      .toLowerCase()
      .trim();
    if (["activa", "activo", "vigente"].includes(estadoLimpio))
      return "vigente";
    if (
      ["por vencer", "por-vencer", "proxima", "próxima"].includes(estadoLimpio)
    )
      return "por-vencer";
    if (["vencida", "caducada", "inactiva", "anulada"].includes(estadoLimpio))
      return "vencida";
    return estadoLimpio || "vigente";
  }

  function obtenerNombreSeguroDesdePoliza(poliza, index = 0) {
    return (
      poliza.seguro?.nombre ||
      poliza.nombre_seguro ||
      poliza.seguro_nombre ||
      `Seguro asociado ${index + 1}`
    );
  }

  function obtenerNumeroPoliza(poliza, index = 0) {
    return (
      poliza.numero_poliza ||
      poliza.numero ||
      `POL-${String(index + 1).padStart(4, "0")}`
    );
  }

  function normalizarPoliza(poliza, index = 0) {
    const nombreSeguro = obtenerNombreSeguroDesdePoliza(poliza, index);
    const numeroPoliza = obtenerNumeroPoliza(poliza, index);

    return {
      id: poliza.id_poliza || poliza.id || `poliza-${index}`,
      id_poliza: poliza.id_poliza || poliza.id,
      seguro: nombreSeguro,
      categoria: poliza.seguro?.categoria || poliza.categoria || "Seguro",
      numero_poliza: numeroPoliza,
      compania: poliza.compania || "Compañía no informada",
      estado: normalizarEstado(calcularEstado(poliza) || poliza.estado),
      fecha_inicio: poliza.fecha_inicio || "",
      fecha_vencimiento: poliza.fecha_vencimiento || "",
      prima: poliza.prima || poliza.valor_prima || null,
      origen: poliza.origen || "portal",
      raw: poliza,
    };
  }

  const polizasNormalizadas = polizas.map(normalizarPoliza);

  const polizasActivas = polizasNormalizadas.filter(
    (p) => p.estado === "vigente" || p.estado === "activa",
  ).length;

  const companiasAsociadas = [
    ...new Set(polizasNormalizadas.map((p) => p.compania).filter(Boolean)),
  ].length;

  const proximaPoliza = [...polizasNormalizadas]
    .filter((p) => p.fecha_vencimiento)
    .sort(
      (a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento),
    )[0];

  const beneficiariosNormalizados =
    beneficiarios.length > 0
      ? beneficiarios.map((beneficiario, index) => ({
          id:
            beneficiario.id_beneficiario ||
            beneficiario.id ||
            `beneficiario-${index}`,
          seguro:
            beneficiario.seguro ||
            beneficiario.nombre_seguro ||
            beneficiario.poliza?.seguro?.nombre ||
            "Seguro asociado",
          poliza:
            beneficiario.numero_poliza ||
            beneficiario.poliza?.numero_poliza ||
            beneficiario.poliza ||
            "—",
          nombre: beneficiario.nombre || "Beneficiario",
          rut: beneficiario.rut || "—",
          relacion: beneficiario.relacion || "No informado",
          porcentaje: beneficiario.porcentaje
            ? `${beneficiario.porcentaje}%`
            : "Según póliza",
          estado: beneficiario.estado || "activo",
        }))
      : polizas.flatMap((poliza, index) => {
          const nombreSeguro = obtenerNombreSeguroDesdePoliza(poliza, index);
          const numeroPoliza = obtenerNumeroPoliza(poliza, index);
          const beneficiariosPoliza = poliza.beneficiarios || [];

          return beneficiariosPoliza.map((beneficiario, bIndex) => ({
            id:
              beneficiario.id_beneficiario ||
              `${poliza.id_poliza || index}-${bIndex}`,
            seguro: nombreSeguro,
            poliza: numeroPoliza,
            nombre: beneficiario.nombre || "Beneficiario",
            rut: beneficiario.rut || "—",
            relacion: beneficiario.relacion || "No informado",
            porcentaje: beneficiario.porcentaje
              ? `${beneficiario.porcentaje}%`
              : "Según póliza",
            estado: beneficiario.estado || "activo",
          }));
        });

  const documentosDesdePolizas = polizasNormalizadas.flatMap((poliza) => [
    {
      id: `poliza-${poliza.id}`,
      nombre: "Póliza vigente",
      seguro: `${poliza.seguro} / ${poliza.numero_poliza}`,
      tipo: "Póliza",
      estado: "Disponible",
      fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      url_pdf: poliza.raw.url_pdf || "",
    },
    {
      id: `certificado-${poliza.id}`,
      nombre: "Certificado de cobertura",
      seguro: `${poliza.seguro} / ${poliza.numero_poliza}`,
      tipo: "Certificado",
      estado: "Disponible",
      fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      url_pdf: poliza.raw.url_certificado || "",
    },
    {
      id: `condiciones-${poliza.id}`,
      nombre: "Condiciones generales",
      seguro: `${poliza.seguro} / ${poliza.numero_poliza}`,
      tipo: "Condiciones",
      estado: "Disponible",
      fecha: poliza.fecha_inicio || poliza.fecha_vencimiento,
      url_pdf: poliza.raw.url_condiciones || "",
    },
  ]);

  const documentosNormalizados =
    documentos.length > 0
      ? documentos.map((documento, index) => ({
          id: documento.id_documento || documento.id || `documento-${index}`,
          nombre: documento.nombre || documento.titulo || "Documento",
          seguro:
            documento.seguro ||
            documento.nombre_seguro ||
            `${documento.poliza?.seguro?.nombre || "Seguro asociado"} / ${documento.numero_poliza || documento.poliza?.numero_poliza || "—"}`,
          tipo: documento.tipo || "Documento",
          estado: documento.estado || "Disponible",
          fecha:
            documento.fecha ||
            documento.fecha_emision ||
            documento.created_at ||
            "",
          url_pdf: documento.url_pdf || documento.url || "",
        }))
      : documentosDesdePolizas;

  const documentosDemo = documentosNormalizados;

  const segurosDocumentos = [
    "todos",
    ...new Set(documentosDemo.map((d) => d.seguro)),
  ];
  const tiposDocumentos = [
    "todos",
    ...new Set(documentosDemo.map((d) => d.tipo)),
  ];
  const estadosDocumentos = [
    "todos",
    ...new Set(documentosDemo.map((d) => d.estado)),
  ];

  const documentosFiltrados = documentosDemo.filter((documento) => {
    const busqueda = filtrosDocumentos.busqueda.toLowerCase().trim();

    const coincideBusqueda =
      !busqueda ||
      documento.nombre.toLowerCase().includes(busqueda) ||
      documento.seguro.toLowerCase().includes(busqueda) ||
      documento.tipo.toLowerCase().includes(busqueda) ||
      documento.estado.toLowerCase().includes(busqueda);

    const coincideSeguro =
      filtrosDocumentos.seguro === "todos" ||
      documento.seguro === filtrosDocumentos.seguro;

    const coincideTipo =
      filtrosDocumentos.tipo === "todos" ||
      documento.tipo === filtrosDocumentos.tipo;

    const coincideEstado =
      filtrosDocumentos.estado === "todos" ||
      documento.estado === filtrosDocumentos.estado;

    return coincideBusqueda && coincideSeguro && coincideTipo && coincideEstado;
  });

  const documentosDisponibles = documentosDemo.filter(
    (documento) => String(documento.estado).toLowerCase() === "disponible",
  ).length;

  const polizasConDocumentos = new Set(
    documentosDemo.map((documento) => documento.seguro),
  ).size;

  const beneficiariosMisSeguros = beneficiariosNormalizados;

  const beneficiariosTotales = beneficiariosMisSeguros.length;
  const beneficiariosActivos = beneficiariosMisSeguros.filter((beneficiario) =>
    ["activo", "activa", "vigente"].includes(
      String(beneficiario.estado || "")
        .toLowerCase()
        .trim(),
    ),
  ).length;
  const polizasConBeneficiarios = new Set(
    beneficiariosMisSeguros
      .map((beneficiario) => beneficiario.poliza || beneficiario.seguro)
      .filter(Boolean),
  ).size;

  function formatearMoneda(valor, moneda = "CLP") {
    if (valor === null || valor === undefined || valor === "") return "—";

    const numero = Number(valor);

    if (Number.isNaN(numero)) return String(valor);

    if (moneda === "UF") return `${numero.toLocaleString("es-CL")} UF`;

    return numero.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  }

  function abrirMisSeguros(tab = "polizas") {
    setTabMisSeguros(tab);
    setVista("mis-seguros");
  }

  return (
    <section className="pc-dashboard">
      {menuAbierto && (
        <button
          type="button"
          className="pc-sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside className={`pc-sidebar ${menuAbierto ? "pc-sidebar-open" : ""}`}>
        <div className="pc-sidebar-logo">
          <img src="/Logo Prieto.png" alt="Prieto & Correa" />
        </div>

        <nav className="pc-sidebar-nav">
          <button
            className={vista === "resumen" ? "active" : ""}
            onClick={() => {
              setVista("resumen");
              setMenuAbierto(false);
            }}
          >
            <img src="/inicio.png" alt="" />
            <span>Inicio</span>
          </button>
          <button
            className={vista === "mis-seguros" ? "active" : ""}
            onClick={() => {
              setVista("mis-seguros");
              setMenuAbierto(false);
            }}
          >
            <img src="/mis-polizas-activas.png" alt="" />
            <span>Mis Seguros</span>
          </button>
          <button
            className={vista === "siniestro" ? "active" : ""}
            onClick={() => {
              setVista("siniestro");
              setMenuAbierto(false);
            }}
          >
            <img src="/reportar-siniestro.png" alt="" />
            <span>Reportar Siniestro</span>
          </button>
          <button
            className={vista === "Club-PC" ? "active" : ""}
            onClick={() => {
              setVista("Club-PC");
              setMenuAbierto(false);
            }}
          >
            <img src="/premium.png" alt="" />
            <span>Club PrietoCorrea</span>
          </button>
        </nav>

        <div className="pc-sidebar-promo">
          <p>PROTEGEMOS LO QUE MÁS TE IMPORTA</p>
          <button
            onClick={() => {
              setVista("explora");
              setMenuAbierto(false);
            }}
          >
            Conoce más
          </button>
        </div>

        <button className="pc-logout" onClick={cerrarSesion}>
          <img src="/cerrar-sesion.png" alt="" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="pc-main">
        <header className="pc-header">
          <button
            type="button"
            className="pc-menu-toggle"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span />
            <span />
            <span />
          </button>

          {seccionEspecial ? (
            <button
              type="button"
              className="pc-header-volver"
              onClick={volverContexto}
            >
              <span aria-hidden="true">←</span>
              Volver
            </button>
          ) : (
            vista !== "perfil" && (
              <div className="pc-header-greeting">
                <div>
                  <h1>¡Hola, {nombreVisible}!</h1>
                  <p>Nos alegra tenerte de vuelta.</p>
                </div>
              </div>
            )
          )}

          <div className="pc-header-user" style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setVista("notificaciones")}
              title="Notificaciones"
              style={{
                position: "relative",
                width: "42px",
                height: "42px",
                border: "none",
                borderRadius: "999px",
                background: "#ffffff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 24px rgba(7, 25, 90, 0.08)",
              }}
            >
              <img
                src="/campana.png"
                alt="Notificaciones"
                style={{
                  width: "20px",
                  height: "20px",
                  objectFit: "contain",
                }}
              />

              {alertas.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 5px",
                    borderRadius: "999px",
                    background: "#f47c20",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 900,
                    display: "grid",
                    placeItems: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  {alertas.length}
                </span>
              )}
            </button>

            {vista !== "perfil" && (
            <div
              style={{
                display: "grid",
                justifyItems: "center",
                gap: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setVista("perfil")}
                title="Editar perfil"
                aria-label="Editar perfil"
                style={{
                  width: "42px",
                  height: "42px",
                  border: "2px solid #ffffff",
                  borderRadius: "999px",
                  background: "#eef3ff",
                  boxShadow: "0 8px 24px rgba(7, 25, 90, 0.08)",
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  color: "#07195a",
                  fontWeight: 900,
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {avatarPerfil ? (
                  <img
                    src={avatarPerfil}
                    alt={`Foto de ${nombreVisible}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "none",
                    }}
                  />
                ) : (
                  <span>{inicialVisible}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setVista("perfil")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#07195a",
                  fontSize: "10px",
                  fontWeight: 900,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                Editar perfil
              </button>
            </div>
            )}
          </div>
        </header>

        {cargando ? (
          <p className="cargando">Cargando...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : idPoliza ? (
          <PolizaDetalle />
        ) : (
          <>
            {vista === "resumen" && (
              <div className="pc-dashboard-grid">
                <section className="pc-left-column">
                  <div className="pc-hero-card">
                    <div>
                      <span className="pc-title-icon">
                        <img src="/proteger.png" alt="" />
                        Centro de protección
                      </span>

                      <h2>Tu protección está al día</h2>

                      <p>
                        Todo bajo control. Prieto & Correa monitorea tu respaldo
                        para que sepas qué tienes protegido y qué revisar.
                      </p>

                      <button onClick={() => abrirMisSeguros("polizas")}>
                        Revisar mis seguros
                      </button>
                    </div>

                    <div className="pc-hero-empty"></div>
                  </div>

                  <div className="pc-stats">
                    <article>
                      <strong>{polizasActivas}</strong>
                      <span>Protecciones activas</span>
                    </article>

                    <article>
                      <strong>
                        {proximaPoliza?.fecha_vencimiento
                          ? formatearFecha(proximaPoliza.fecha_vencimiento)
                          : "—"}
                      </strong>
                      <span>Próximo vencimiento</span>
                    </article>

                    <article>
                      <strong>0</strong>
                      <span>Casos abiertos</span>
                    </article>

                    <article>
                      <strong>
                        {companiasAsociadas > 0 ? companiasAsociadas : "—"}
                      </strong>
                      <span>Compañías asociadas</span>
                    </article>
                  </div>

                  <div className="pc-panel">
                    <div className="pc-panel-title">
                      <h3>
                        <img src="/mis-polizas-activas.png" alt="" />
                        Mis pólizas activas
                      </h3>

                      <button onClick={() => abrirMisSeguros("polizas")}>
                        Ver todas
                      </button>
                    </div>

                    {polizasNormalizadas.length === 0 ? (
                      <div className="pc-empty pc-empty-protection">
                        <h3>Aún no tienes pólizas visibles</h3>
                        <p>
                          Tu ejecutivo puede ayudarte a revisar tu protección
                          actual y activar tus pólizas en el portal.
                        </p>
                        <button onClick={() => setVista("explora")}>
                          Explorar seguros disponibles
                        </button>
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
                      <span className="pc-advisor-status">
                        Disponible ahora
                      </span>

                      <p className="contacto-corredor">
                        <img src="/telefono.png" alt="" />
                        +56 9 6654 1939
                        <img src="/correo-electronico.png" alt="" />
                        cotizaciones@prietocorrea.cl
                      </p>
                    </div>
                  </div>
                </section>

                <aside className="pc-right-column">
                  <div className="pc-panel">
                    <h3 className="titulo-icono">
                      <img src="/accion-rapida.png" alt="" />
                      Acciones rápidas
                    </h3>

                    <div className="pc-actions-grid pc-actions-grid-priority">
                      <button onClick={() => setVista("siniestro")}>
                        <img src="/reportar-siniestro.png" alt="" />
                        <span>Reportar siniestro →</span>
                      </button>

                      <button onClick={() => abrirMisSeguros("polizas")}>
                        <img src="/documentos.png" alt="" />
                        <span>Mis pólizas →</span>
                      </button>

                      <button onClick={() => setVista("Club-PC")}>
                        <img src="/beneficios.png" alt="" />
                        <span>CLUB PRIETO & CORREA →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pc-panel pc-next-payment">
                    <h3 className="titulo-icono">
                      <img src="/calendario.png" alt="" />
                      Próximo pago
                    </h3>

                    <strong>
                      {proximaPoliza?.seguro || "Seguro pendiente"}
                    </strong>

                    <h2>
                      {proximaPoliza?.prima
                        ? `${proximaPoliza.prima} UF`
                        : "Sin pago informado"}
                    </h2>

                    <p>
                      Vencimiento{" "}
                      {formatearFecha(proximaPoliza?.fecha_vencimiento)}
                    </p>

                    <button onClick={() => abrirMisSeguros("cuotas")}>
                      Realizar pago
                    </button>
                  </div>

                  <div className="pc-help-card">
                    <div>
                      <h3>¿Necesitas orientación?</h3>
                      <p>
                        Consultas rápidas y acompañamiento directo con tu
                        ejecutivo.
                      </p>
                      <small className="pc-response-time">
                        Tiempo promedio de respuesta: &lt; 15 min
                      </small>

                      <button
                        className="pc-whatsapp-button"
                        onClick={() =>
                          abrirWhatsApp(
                            "Hola, necesito hablar con mi ejecutivo de Prieto & Correa Seguros.",
                          )
                        }
                      >
                        <img src="/whatsapp.png" alt="" />
                        <span>Hablar con mi ejecutivo</span>
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

            {vista === "mis-seguros" && (
              <MisSeguros
                tabMisSeguros={tabMisSeguros}
                setTabMisSeguros={setTabMisSeguros}
                pagos={pagos}
                polizasNormalizadas={polizasNormalizadas}
                formatearMoneda={formatearMoneda}
                beneficiariosMisSeguros={beneficiariosMisSeguros}
                beneficiariosTotales={beneficiariosTotales}
                beneficiariosActivos={beneficiariosActivos}
                polizasConBeneficiarios={polizasConBeneficiarios}
                documentosDemo={documentosDemo}
                documentosFiltrados={documentosFiltrados}
                documentosDisponibles={documentosDisponibles}
                polizasConDocumentos={polizasConDocumentos}
                segurosDocumentos={segurosDocumentos}
                tiposDocumentos={tiposDocumentos}
                estadosDocumentos={estadosDocumentos}
                filtrosDocumentos={filtrosDocumentos}
                actualizarFiltroDocumento={actualizarFiltroDocumento}
                abrirPreviewDocumento={abrirPreviewDocumento}
                descargarDocumento={descargarDocumento}
                formatearFecha={formatearFecha}
                normalizarEstado={normalizarEstado}
                textoEstado={textoEstado}
                setVista={setVista}
                abrirWhatsApp={abrirWhatsApp}
              />
            )}


            {vista === "explora" && (
              <ExplorarSeguros
                cotizaciones={cotizaciones}
                abrirWhatsApp={abrirWhatsApp}
                formatearFecha={formatearFecha}
              />
            )}

            {vista === "perfil" && <Perfil />}

            {vista === "siniestro" && (
              <ReportarSiniestro polizas={polizas} />
            )}

            {vista === "Club-PC" && (
              <ClubBeneficios
                beneficios={beneficios}
                nombreVisible={nombreVisible}
                rut={datosPerfil.rut}
              />
            )}

            {vista === "notificaciones" && (
              <Notificaciones alertas={alertas} />
            )}

            {vista === "cotizacion-exitosa" && (
              <div className="cotizacion-exitosa-portal">
                <CotizacionExitosaContent />
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Dashboard;
