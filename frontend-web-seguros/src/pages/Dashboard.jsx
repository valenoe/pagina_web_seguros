import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/pages/PortalDashboard.css";
import ClubBeneficios from "./dashboard/ClubBeneficios";
import MisSeguros from "./dashboard/MisSeguros";
import ReportarSiniestro from "./dashboard/ReportarSiniestro";
import {
  getMiCuenta,
  getMisAlertas,
  getMisBeneficiarios,
  getMisBeneficios,
  getMisCotizaciones,
  getMisDocumentos,
  getMisPagos,
  getMisPolizas,
} from "../services/api";

const VISTAS_PERMITIDAS = [
  "resumen",
  "mis-seguros",
  "polizas",
  "siniestro",
  "cuotas",
  "Club-PC",
  "cotizaciones",
  "beneficiarios",
  "perfil",
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

  const nombreClienteGuardado = localStorage.getItem("nombre_cliente") || "";
  const nombreCliente =
    nombreClienteGuardado && !/[0-9]/.test(nombreClienteGuardado)
      ? nombreClienteGuardado
      : "Nombre";
  const primerNombreCliente = nombreCliente.split(" ")[0] || "Nombre";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [beneficios, setBeneficios] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // La URL es la fuente de verdad de la vista activa:
  //   /clientes/dashboard            → resumen
  //   /clientes/dashboard/:vista     → esa vista
  // `setVista` se conserva como API interna, pero ahora navega en vez de
  // mutar estado, así cada cambio de componente cambia también la ruta.
  const { vista: vistaParam } = useParams();
  const vistaSolicitada =
    vistaParam || obtenerVistaDesdeRuta(location) || "resumen";
  const vista = VISTAS_PERMITIDAS.includes(vistaSolicitada)
    ? vistaSolicitada
    : "resumen";

  function setVista(nuevaVista) {
    navigate(
      nuevaVista === "resumen"
        ? "/clientes/dashboard"
        : `/clientes/dashboard/${nuevaVista}`,
    );
  }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seguroDetalleId, setSeguroDetalleId] = useState(null);
  const [seguroSlide, setSeguroSlide] = useState(0);
  const [filtroSeguros, setFiltroSeguros] = useState("todos");
  const [ordenSeguros, setOrdenSeguros] = useState("recomendados");
  const [segurosPorVista, setSegurosPorVista] = useState(3);
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

  const [tabMisSeguros, setTabMisSeguros] = useState("documentos");

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const [avatarPerfil, setAvatarPerfil] = useState(
    localStorage.getItem("avatar_cliente") || "",
  );
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [pasoClave, setPasoClave] = useState("inicio");
  const [codigoSeguridad, setCodigoSeguridad] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [datosPerfil, setDatosPerfil] = useState(() => ({
    nombre: localStorage.getItem("nombre_cliente") || "Cliente",
    rut: localStorage.getItem("rut_cliente") || "",
    correo: localStorage.getItem("correo_cliente") || "",
    telefono: localStorage.getItem("telefono_cliente") || "",
    direccion: localStorage.getItem("direccion_cliente") || "",
  }));
  const [preferenciasPerfil, setPreferenciasPerfil] = useState({
    email: true,
    whatsapp: true,
    vencimientos: true,
    documentos: true,
    siniestros: true,
    pagos: false,
  });

  const nombreVisible = datosPerfil.nombre || nombreCliente || "Cliente";
  const primerNombreVisible = nombreVisible.split(" ")[0] || "Cliente";
  const inicialVisible = primerNombreVisible.charAt(0).toUpperCase();

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login-clientes");
      return;
    }

    async function cargarDatos() {
      try {
        const [
          cuentaResult,
          alertasResult,
          cotsResult,
          polsResult,
          benResult,
          docsResult,
          pagosResult,
          beneficiosResult,
        ] = await Promise.allSettled([
          getMiCuenta(token),
          getMisAlertas(token),
          getMisCotizaciones(token),
          getMisPolizas(token),
          getMisBeneficiarios(token),
          getMisDocumentos(token),
          getMisPagos(token),
          getMisBeneficios(token),
        ]);

        if (cuentaResult.status === "fulfilled" && cuentaResult.value) {
          const cuenta = cuentaResult.value;

          const nombreCuenta =
            cuenta.nombre ||
            cuenta.nombre_o_razon_social ||
            cuenta.razon_social ||
            cuenta.cliente?.nombre_o_razon_social ||
            datosPerfil.nombre;

          const rutCuenta =
            cuenta.rut ||
            cuenta.rut_cliente ||
            cuenta.cliente?.rut ||
            datosPerfil.rut;

          const correoCuenta =
            cuenta.correo ||
            cuenta.email ||
            cuenta.cliente?.email ||
            datosPerfil.correo;

          const telefonoCuenta =
            cuenta.telefono ||
            cuenta.celular ||
            cuenta.cliente?.telefono ||
            datosPerfil.telefono;

          const direccionCuenta =
            cuenta.direccion ||
            cuenta.domicilio ||
            cuenta.cliente?.direccion ||
            datosPerfil.direccion;

          setDatosPerfil((actual) => ({
            ...actual,
            nombre: nombreCuenta || actual.nombre,
            rut: rutCuenta || actual.rut,
            correo: correoCuenta || actual.correo,
            telefono: telefonoCuenta || actual.telefono,
            direccion: direccionCuenta || actual.direccion,
          }));

          if (nombreCuenta)
            localStorage.setItem("nombre_cliente", nombreCuenta);
          if (rutCuenta) localStorage.setItem("rut_cliente", rutCuenta);
          if (correoCuenta)
            localStorage.setItem("correo_cliente", correoCuenta);
          if (telefonoCuenta)
            localStorage.setItem("telefono_cliente", telefonoCuenta);
          if (direccionCuenta)
            localStorage.setItem("direccion_cliente", direccionCuenta);

          const fotoCuenta =
            cuenta.avatar_url ||
            cuenta.foto_perfil ||
            cuenta.foto ||
            cuenta.cliente?.foto_perfil;

          if (fotoCuenta) {
            setAvatarPerfil(fotoCuenta);
            localStorage.setItem("avatar_cliente", fotoCuenta);
          }
        }

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
      asunto,
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

  function normalizarPago(pago, index = 0) {
    const polizaAsociada =
      polizasNormalizadas.find(
        (poliza) =>
          poliza.id_poliza === pago.id_poliza ||
          poliza.id_poliza === pago.poliza_id ||
          poliza.numero_poliza === pago.numero_poliza,
      ) || {};

    return {
      id: pago.id_pago || pago.id || `pago-${index}`,
      id_pago: pago.id_pago || pago.id,
      id_poliza: pago.id_poliza || pago.poliza_id || polizaAsociada.id_poliza,
      seguro:
        pago.seguro ||
        pago.nombre_seguro ||
        pago.poliza?.seguro?.nombre ||
        polizaAsociada.seguro ||
        "Seguro asociado",
      compania:
        pago.compania ||
        pago.poliza?.compania ||
        polizaAsociada.compania ||
        "Compañía no informada",
      numero_poliza:
        pago.numero_poliza ||
        pago.poliza?.numero_poliza ||
        polizaAsociada.numero_poliza ||
        "—",
      cuota:
        pago.numero_cuota && pago.total_cuotas
          ? `${pago.numero_cuota}/${pago.total_cuotas}`
          : pago.cuota || "—",
      monto: pago.monto ?? pago.total ?? pago.valor ?? 0,
      moneda: pago.moneda || "CLP",
      fecha_vencimiento:
        pago.fecha_vencimiento || pago.vencimiento || pago.fecha_pago || "",
      fecha_pago: pago.fecha_pago || "",
      estado: normalizarEstado(pago.estado || "pendiente"),
      url_pago: pago.url_pago || pago.link_pago || "",
      url_comprobante: pago.url_comprobante || pago.comprobante || "",
      raw: pago,
    };
  }

  const pagosNormalizados = pagos.map(normalizarPago);

  const pagosPendientes = pagosNormalizados.filter((pago) =>
    ["pendiente", "por-vencer", "vigente", "activa"].includes(pago.estado),
  );

  const pagosRealizados = pagosNormalizados.filter((pago) =>
    ["pagado", "pagada", "completado", "completada"].includes(
      String(pago.estado || "")
        .toLowerCase()
        .trim(),
    ),
  ).length;

  const montoPendiente = pagosPendientes.reduce((total, pago) => {
    const monto = Number(pago.monto);
    return total + (Number.isNaN(monto) ? 0 : monto);
  }, 0);

  const proximoPago = [...pagosPendientes]
    .filter((pago) => pago.fecha_vencimiento)
    .sort(
      (a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento),
    )[0];

  function iniciarPago(pago) {
    if (pago.url_pago) {
      window.open(pago.url_pago, "_blank", "noopener,noreferrer");
      return;
    }

    abrirWhatsApp(
      `Hola, necesito ayuda para pagar la cuota ${pago.cuota} de ${pago.seguro}, póliza ${pago.numero_poliza}.`,
    );
  }

  function abrirMisSeguros(tab = "documentos") {
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
          <button
            className={vista === "cotizaciones" ? "active" : ""}
            onClick={() => {
              setVista("cotizaciones");
              setMenuAbierto(false);
            }}
          >
            <img src="/proteger.png" alt="" />
            <span>Explorar Seguros</span>
          </button>
        </nav>

        <div className="pc-sidebar-promo">
          <p>PROTEGEMOS LO QUE MÁS TE IMPORTA</p>
          <button
            onClick={() => {
              setVista("cotizaciones");
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

          <div
            className="pc-header-greeting"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <button
              type="button"
              onClick={() => setVista("perfil")}
              title="Ir a Mi Cuenta"
              style={{
                width: "54px",
                height: "54px",
                border: "3px solid #ffffff",
                borderRadius: "999px",
                background: "#eef3ff",
                boxShadow: "0 12px 28px rgba(7, 25, 90, 0.12)",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                color: "#07195a",
                fontWeight: 900,
                fontSize: "18px",
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
                  }}
                />
              ) : (
                <span>{inicialVisible}</span>
              )}
            </button>

            <div>
              <h1>¡Hola, {nombreVisible}!</h1>
              <p>Nos alegra tenerte de vuelta.</p>
            </div>
          </div>

          <div className="pc-header-user" style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setNotificacionesAbiertas((abierta) => !abierta)}
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

            {notificacionesAbiertas && (
              <div
                style={{
                  position: "absolute",
                  top: "54px",
                  right: "54px",
                  width: "340px",
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e6eaf4",
                  borderRadius: "18px",
                  boxShadow: "0 18px 45px rgba(7, 25, 90, 0.16)",
                  zIndex: 50,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#07195a",
                    fontSize: "15px",
                    marginBottom: "12px",
                  }}
                >
                  Notificaciones
                </strong>

                {alertas.length > 0 ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {alertas.slice(0, 5).map((alerta, index) => (
                      <article
                        key={alerta.id_alerta || alerta.id || index}
                        style={{
                          padding: "12px",
                          borderRadius: "14px",
                          background: "#f8faff",
                          border: "1px solid #e7ecf7",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#07195a",
                            fontSize: "12px",
                            marginBottom: "5px",
                          }}
                        >
                          {alerta.titulo || alerta.tipo || "Nueva notificación"}
                        </strong>

                        <p
                          style={{
                            color: "#56637a",
                            fontSize: "11px",
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          {alerta.mensaje ||
                            alerta.descripcion ||
                            "Tienes una actualización pendiente en tu portal."}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#56637a",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    No tienes notificaciones pendientes.
                  </p>
                )}
              </div>
            )}

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
                        Centro de protección
                      </span>

                      <h2>Tu protección está al día</h2>

                      <p>
                        Todo bajo control. Prieto & Correa monitorea tu respaldo
                        para que sepas qué tienes protegido y qué revisar.
                      </p>

                      <button onClick={() => abrirMisSeguros("documentos")}>
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

                      <button onClick={() => abrirMisSeguros("documentos")}>
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
                        <button onClick={() => setVista("cotizaciones")}>
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

                      <button onClick={() => abrirMisSeguros("documentos")}>
                        <img src="/documentos.png" alt="" />
                        <span>Ver documentos →</span>
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

                    <button onClick={() => setVista("cuotas")}>
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
                                    value={
                                      localStorage.getItem("rut_cliente") || ""
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
                                    value={
                                      localStorage.getItem("correo_cliente") ||
                                      ""
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
            )}

            {vista === "perfil" && (
              <div
                className="pc-panel pc-full-panel"
                style={{
                  width: "min(calc(100vw - 280px), 1660px)",
                  maxWidth: "1660px",
                  margin: "0 auto",
                  padding: "16px 18px",
                }}
              >
                {(() => {
                  const rutCliente =
                    datosPerfil.rut ||
                    localStorage.getItem("rut_cliente") ||
                    "—";
                  const correoCliente =
                    datosPerfil.correo ||
                    localStorage.getItem("correo_cliente") ||
                    "Sin correo registrado";
                  const telefonoCliente =
                    datosPerfil.telefono ||
                    localStorage.getItem("telefono_cliente") ||
                    "Sin teléfono registrado";
                  const inicialCliente = (
                    datosPerfil.nombre ||
                    nombreCliente ||
                    "C"
                  )
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                  const actualizarDatoPerfil = (campo, valor) => {
                    setDatosPerfil((actual) => ({
                      ...actual,
                      [campo]: valor,
                    }));
                  };

                  const guardarPerfil = () => {
                    localStorage.setItem(
                      "nombre_cliente",
                      datosPerfil.nombre || "Cliente",
                    );
                    localStorage.setItem(
                      "correo_cliente",
                      datosPerfil.correo || "",
                    );
                    localStorage.setItem(
                      "telefono_cliente",
                      datosPerfil.telefono || "",
                    );
                    localStorage.setItem(
                      "direccion_cliente",
                      datosPerfil.direccion || "",
                    );
                    setEditandoPerfil(false);
                    setMensajePerfil(
                      "Datos actualizados correctamente. Cuando conectes backend, este cambio quedará guardado en la cuenta.",
                    );
                    setTimeout(() => setMensajePerfil(""), 4200);
                  };

                  const manejarAvatar = (event) => {
                    const archivo = event.target.files?.[0];
                    if (!archivo) return;

                    const lector = new FileReader();
                    lector.onload = () => {
                      const resultado = String(lector.result || "");
                      setAvatarPerfil(resultado);
                      localStorage.setItem("avatar_cliente", resultado);
                      setMensajePerfil(
                        "Foto de perfil actualizada correctamente.",
                      );
                      setTimeout(() => setMensajePerfil(""), 3600);
                    };
                    lector.readAsDataURL(archivo);
                  };

                  const limpiarAvatar = () => {
                    setAvatarPerfil("");
                    localStorage.removeItem("avatar_cliente");
                    setMensajePerfil("Foto de perfil eliminada.");
                    setTimeout(() => setMensajePerfil(""), 3200);
                  };

                  const generarCodigoSeguridad = () => {
                    const codigo = String(
                      Math.floor(100000 + Math.random() * 900000),
                    );
                    setCodigoSeguridad(codigo);
                    setCodigoIngresado("");
                    setNuevaClave("");
                    setConfirmarClave("");
                    setPasoClave("codigo");
                    setMensajePerfil(
                      `Código de seguridad generado para prueba frontend: ${codigo}`,
                    );
                    setTimeout(() => setMensajePerfil(""), 6500);
                  };

                  const validarCodigo = () => {
                    if (codigoIngresado.trim() !== codigoSeguridad) {
                      setMensajePerfil("El código ingresado no coincide.");
                      setTimeout(() => setMensajePerfil(""), 3500);
                      return;
                    }

                    setPasoClave("clave");
                    setMensajePerfil(
                      "Código validado. Ingresa tu nueva contraseña.",
                    );
                    setTimeout(() => setMensajePerfil(""), 3500);
                  };

                  const actualizarClave = () => {
                    if (nuevaClave.length < 8) {
                      setMensajePerfil(
                        "La contraseña debe tener al menos 8 caracteres.",
                      );
                      setTimeout(() => setMensajePerfil(""), 3500);
                      return;
                    }

                    if (nuevaClave !== confirmarClave) {
                      setMensajePerfil("Las contraseñas no coinciden.");
                      setTimeout(() => setMensajePerfil(""), 3500);
                      return;
                    }

                    setModalClaveAbierto(false);
                    setPasoClave("inicio");
                    setCodigoSeguridad("");
                    setCodigoIngresado("");
                    setNuevaClave("");
                    setConfirmarClave("");
                    setMensajePerfil(
                      "Contraseña actualizada en modo frontend. Después se conectará al backend con OTP real.",
                    );
                    setTimeout(() => setMensajePerfil(""), 5000);
                  };

                  const alternarPreferencia = (clave) => {
                    setPreferenciasPerfil((actual) => ({
                      ...actual,
                      [clave]: !actual[clave],
                    }));
                  };

                  const inputPerfil = (
                    label,
                    campo,
                    tipo = "text",
                    bloqueado = false,
                  ) => (
                    <label
                      style={{
                        display: "grid",
                        gap: "7px",
                        background: "#f5f7fb",
                        border: "1px solid rgba(7, 25, 90, 0.08)",
                        borderRadius: "14px",
                        padding: "11px 12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#667085",
                          fontSize: "10px",
                          fontWeight: 950,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </span>

                      {editandoPerfil && !bloqueado ? (
                        <input
                          type={tipo}
                          value={datosPerfil[campo] || ""}
                          onChange={(event) =>
                            actualizarDatoPerfil(campo, event.target.value)
                          }
                          style={{
                            width: "100%",
                            border: "1px solid #d9e2ef",
                            background: "#ffffff",
                            color: "#07195a",
                            borderRadius: "10px",
                            padding: "9px 10px",
                            fontWeight: 900,
                            outline: "none",
                          }}
                        />
                      ) : (
                        <strong
                          style={{
                            color: "#07195a",
                            fontSize: "14px",
                            fontWeight: 950,
                            wordBreak: "break-word",
                          }}
                        >
                          {datosPerfil[campo] || "Pendiente"}
                        </strong>
                      )}
                    </label>
                  );

                  const switchPerfil = (clave, titulo, bajada) => (
                    <button
                      type="button"
                      onClick={() => alternarPreferencia(clave)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        border: "none",
                        background: "#f5f7fb",
                        borderRadius: "13px",
                        padding: "11px 12px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span>
                        <strong
                          style={{
                            display: "block",
                            color: "#07195a",
                            fontSize: "12px",
                            fontWeight: 950,
                          }}
                        >
                          {titulo}
                        </strong>
                        <small
                          style={{
                            color: "#667085",
                            fontSize: "11px",
                            fontWeight: 750,
                          }}
                        >
                          {bajada}
                        </small>
                      </span>

                      <span
                        style={{
                          width: "42px",
                          height: "24px",
                          borderRadius: "999px",
                          padding: "3px",
                          background: preferenciasPerfil[clave]
                            ? "#07195a"
                            : "#d9e2ef",
                          display: "flex",
                          justifyContent: preferenciasPerfil[clave]
                            ? "flex-end"
                            : "flex-start",
                          transition: "0.2s ease",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "999px",
                            background: "#ffffff",
                            display: "block",
                          }}
                        />
                      </span>
                    </button>
                  );

                  return (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {mensajePerfil && (
                        <div
                          style={{
                            background: "rgba(244, 124, 32, 0.12)",
                            color: "#07195a",
                            border: "1px solid rgba(244, 124, 32, 0.24)",
                            borderRadius: "14px",
                            padding: "10px 12px",
                            fontSize: "12px",
                            fontWeight: 850,
                          }}
                        >
                          {mensajePerfil}
                        </div>
                      )}

                      <section
                        style={{
                          background: "#07195a",
                          borderRadius: "22px",
                          padding: "18px",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "18px",
                          boxShadow: "0 18px 40px rgba(7, 25, 90, 0.18)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "82px",
                              height: "82px",
                              borderRadius: "22px",
                              overflow: "hidden",
                              background: "rgba(255,255,255,0.12)",
                              border: "1px solid rgba(255,255,255,0.24)",
                              display: "grid",
                              placeItems: "center",
                              flex: "0 0 auto",
                            }}
                          >
                            {avatarPerfil ? (
                              <img
                                src={avatarPerfil}
                                alt="Foto de perfil"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <strong
                                style={{ fontSize: "34px", fontWeight: 950 }}
                              >
                                {inicialCliente}
                              </strong>
                            )}
                          </div>

                          <div>
                            <small
                              style={{
                                fontSize: "12px",
                                fontWeight: 850,
                                opacity: 0.8,
                              }}
                            >
                              Mi cuenta
                            </small>
                            <h2
                              style={{
                                margin: "4px 0 8px",
                                fontSize: "28px",
                                fontWeight: 950,
                              }}
                            >
                              {datosPerfil.nombre || nombreCliente}
                            </h2>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {[
                                `RUT ${rutCliente}`,
                                "Cliente activo",
                                "Persona natural",
                                "Backend ready",
                              ].map((item) => (
                                <span
                                  key={item}
                                  style={{
                                    background: "rgba(255,255,255,0.14)",
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    borderRadius: "999px",
                                    padding: "6px 10px",
                                    fontSize: "11px",
                                    fontWeight: 900,
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <label
                            style={{
                              background: "#ffffff",
                              color: "#07195a",
                              borderRadius: "14px",
                              padding: "11px 14px",
                              fontSize: "12px",
                              fontWeight: 950,
                              cursor: "pointer",
                            }}
                          >
                            Subir foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={manejarAvatar}
                              style={{ display: "none" }}
                            />
                          </label>

                          {avatarPerfil && (
                            <button
                              type="button"
                              onClick={limpiarAvatar}
                              style={{
                                border: "1px solid rgba(255,255,255,0.24)",
                                background: "transparent",
                                color: "#ffffff",
                                borderRadius: "14px",
                                padding: "11px 14px",
                                fontSize: "12px",
                                fontWeight: 950,
                                cursor: "pointer",
                              }}
                            >
                              Quitar foto
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              editandoPerfil
                                ? guardarPerfil()
                                : setEditandoPerfil(true)
                            }
                            style={{
                              border: "none",
                              background: "#f47c20",
                              color: "#ffffff",
                              borderRadius: "14px",
                              padding: "12px 16px",
                              fontSize: "12px",
                              fontWeight: 950,
                              cursor: "pointer",
                            }}
                          >
                            {editandoPerfil
                              ? "Guardar cambios"
                              : "Editar perfil"}
                          </button>
                        </div>
                      </section>

                      <section
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {[
                          ["Último acceso", "Hoy", "Portal clientes"],
                          ["Estado", "Activo", "Cliente Prieto & Correa"],
                          [
                            "Seguridad",
                            "Protegida",
                            "Código para cambios sensibles",
                          ],
                          [
                            "Notificaciones",
                            "Activas",
                            "Preferencias configurables",
                          ],
                        ].map(([titulo, valor, bajada]) => (
                          <article
                            key={titulo}
                            style={{
                              background: "#ffffff",
                              borderRadius: "17px",
                              padding: "14px",
                              border: "1px solid rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <small
                              style={{
                                display: "block",
                                color: "#667085",
                                fontSize: "10px",
                                fontWeight: 950,
                                textTransform: "uppercase",
                              }}
                            >
                              {titulo}
                            </small>
                            <strong
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color:
                                  valor === "Activo" ? "#15803d" : "#07195a",
                                fontSize: "20px",
                                fontWeight: 950,
                              }}
                            >
                              {valor}
                            </strong>
                            <span
                              style={{
                                color: "#667085",
                                fontSize: "11px",
                                fontWeight: 750,
                              }}
                            >
                              {bajada}
                            </span>
                          </article>
                        ))}
                      </section>

                      <section
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.55fr 0.95fr",
                          gap: "12px",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ display: "grid", gap: "12px" }}>
                          <article
                            style={{
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px",
                              border: "1px solid rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "12px",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    color: "#07195a",
                                    fontSize: "19px",
                                    fontWeight: 950,
                                  }}
                                >
                                  Datos personales
                                </h3>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    color: "#667085",
                                    fontSize: "12px",
                                    fontWeight: 750,
                                  }}
                                >
                                  Edita tus datos y confirma cambios sensibles
                                  cuando se conecte el backend.
                                </p>
                              </div>

                              {editandoPerfil && (
                                <button
                                  type="button"
                                  onClick={() => setEditandoPerfil(false)}
                                  style={{
                                    border: "1px solid #d9e2ef",
                                    background: "#ffffff",
                                    color: "#07195a",
                                    borderRadius: "12px",
                                    padding: "9px 12px",
                                    fontSize: "12px",
                                    fontWeight: 950,
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                              }}
                            >
                              {inputPerfil("Nombre / razón social", "nombre")}
                              {inputPerfil("RUT", "rut", "text", true)}
                              {inputPerfil("Correo", "correo", "email")}
                              {inputPerfil("Teléfono", "telefono")}
                              {inputPerfil("Dirección", "direccion")}
                              <div
                                style={{
                                  background: "#f5f7fb",
                                  border: "1px solid rgba(7, 25, 90, 0.08)",
                                  borderRadius: "14px",
                                  padding: "11px 12px",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#667085",
                                    fontSize: "10px",
                                    fontWeight: 950,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Tipo cliente
                                </span>
                                <strong
                                  style={{
                                    display: "block",
                                    marginTop: "7px",
                                    color: "#07195a",
                                    fontSize: "14px",
                                    fontWeight: 950,
                                  }}
                                >
                                  Persona natural
                                </strong>
                              </div>
                            </div>
                          </article>

                          <article
                            style={{
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px",
                              border: "1px solid rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 12px",
                                color: "#07195a",
                                fontSize: "19px",
                                fontWeight: 950,
                              }}
                            >
                              Preferencias de notificación
                            </h3>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "9px",
                              }}
                            >
                              {switchPerfil(
                                "email",
                                "Correo electrónico",
                                "Avisos y comunicaciones generales",
                              )}
                              {switchPerfil(
                                "whatsapp",
                                "WhatsApp",
                                "Recordatorios y asistencia",
                              )}
                              {switchPerfil(
                                "vencimientos",
                                "Vencimientos",
                                "Alertas de pólizas y pagos",
                              )}
                              {switchPerfil(
                                "documentos",
                                "Documentos",
                                "Aviso de documentos disponibles",
                              )}
                              {switchPerfil(
                                "siniestros",
                                "Siniestros",
                                "Seguimiento de casos",
                              )}
                              {switchPerfil(
                                "pagos",
                                "Pagos",
                                "Recordatorios de cuotas",
                              )}
                            </div>
                          </article>
                        </div>

                        <aside style={{ display: "grid", gap: "12px" }}>
                          <article
                            style={{
                              background: "#07195a",
                              color: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 8px",
                                fontSize: "18px",
                                fontWeight: 950,
                              }}
                            >
                              Seguridad de cuenta
                            </h3>
                            <p
                              style={{
                                margin: "0 0 12px",
                                color: "rgba(255,255,255,0.78)",
                                fontSize: "12px",
                                lineHeight: 1.45,
                                fontWeight: 750,
                              }}
                            >
                              Cambia tu contraseña usando un código de
                              seguridad. En backend se enviará por correo o SMS.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setModalClaveAbierto(true);
                                setPasoClave("inicio");
                              }}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "#f47c20",
                                color: "#ffffff",
                                borderRadius: "13px",
                                padding: "12px 14px",
                                fontSize: "12px",
                                fontWeight: 950,
                                cursor: "pointer",
                              }}
                            >
                              Cambiar contraseña
                            </button>
                          </article>

                          <article
                            style={{
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px",
                              border: "1px solid rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 12px",
                                color: "#07195a",
                                fontSize: "18px",
                                fontWeight: 950,
                              }}
                            >
                              Sesiones y actividad
                            </h3>

                            {[
                              ["Inicio de sesión", "Hoy · Portal clientes"],
                              ["Actualización de perfil", "Pendiente backend"],
                              ["Cambio de contraseña", "Requiere código"],
                            ].map(([titulo, texto]) => (
                              <div
                                key={titulo}
                                style={{
                                  background: "#f5f7fb",
                                  borderRadius: "13px",
                                  padding: "10px 11px",
                                  marginBottom: "8px",
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#07195a",
                                    fontSize: "12px",
                                    fontWeight: 950,
                                  }}
                                >
                                  {titulo}
                                </strong>
                                <span
                                  style={{
                                    color: "#667085",
                                    fontSize: "11px",
                                    fontWeight: 750,
                                  }}
                                >
                                  {texto}
                                </span>
                              </div>
                            ))}
                          </article>

                          <article
                            style={{
                              background: "#ffffff",
                              borderRadius: "18px",
                              padding: "16px",
                              border: "1px solid rgba(7, 25, 90, 0.08)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 12px",
                                color: "#07195a",
                                fontSize: "18px",
                                fontWeight: 950,
                              }}
                            >
                              Privacidad y documentos
                            </h3>
                            {[
                              "Política de privacidad",
                              "Términos del portal",
                              "Consentimiento de datos",
                            ].map((item) => (
                              <div
                                key={item}
                                style={{
                                  background: "#f5f7fb",
                                  borderRadius: "13px",
                                  padding: "10px 11px",
                                  marginBottom: "8px",
                                }}
                              >
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#07195a",
                                    fontSize: "12px",
                                    fontWeight: 950,
                                  }}
                                >
                                  {item}
                                </strong>
                                <span
                                  style={{
                                    color: "#667085",
                                    fontSize: "11px",
                                    fontWeight: 750,
                                  }}
                                >
                                  Disponible próximamente
                                </span>
                              </div>
                            ))}
                          </article>
                        </aside>
                      </section>

                      {modalClaveAbierto && (
                        <div
                          style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(3, 19, 68, 0.55)",
                            zIndex: 80,
                            display: "grid",
                            placeItems: "center",
                            padding: "20px",
                          }}
                        >
                          <div
                            style={{
                              width: "min(520px, 100%)",
                              background: "#ffffff",
                              borderRadius: "22px",
                              padding: "22px",
                              boxShadow: "0 24px 70px rgba(3, 19, 68, 0.25)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "16px",
                                alignItems: "flex-start",
                                marginBottom: "16px",
                              }}
                            >
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    color: "#07195a",
                                    fontSize: "22px",
                                    fontWeight: 950,
                                  }}
                                >
                                  Cambiar contraseña
                                </h3>
                                <p
                                  style={{
                                    margin: "6px 0 0",
                                    color: "#667085",
                                    fontSize: "13px",
                                    fontWeight: 750,
                                  }}
                                >
                                  Flujo preparado para código de seguridad.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setModalClaveAbierto(false)}
                                style={{
                                  border: "none",
                                  background: "#f5f7fb",
                                  color: "#07195a",
                                  borderRadius: "12px",
                                  width: "36px",
                                  height: "36px",
                                  fontWeight: 950,
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </button>
                            </div>

                            {pasoClave === "inicio" && (
                              <div>
                                <p
                                  style={{
                                    margin: "0 0 14px",
                                    color: "#667085",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                    fontWeight: 750,
                                  }}
                                >
                                  Para proteger tu cuenta, primero se genera un
                                  código de seguridad.
                                </p>

                                <button
                                  type="button"
                                  onClick={generarCodigoSeguridad}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    background: "#f47c20",
                                    color: "#ffffff",
                                    borderRadius: "14px",
                                    padding: "13px 16px",
                                    fontWeight: 950,
                                    cursor: "pointer",
                                  }}
                                >
                                  Generar código de seguridad
                                </button>
                              </div>
                            )}

                            {pasoClave === "codigo" && (
                              <div style={{ display: "grid", gap: "12px" }}>
                                <label style={{ display: "grid", gap: "7px" }}>
                                  <span
                                    style={{
                                      color: "#07195a",
                                      fontSize: "12px",
                                      fontWeight: 950,
                                    }}
                                  >
                                    Código de seguridad
                                  </span>
                                  <input
                                    value={codigoIngresado}
                                    onChange={(event) =>
                                      setCodigoIngresado(event.target.value)
                                    }
                                    placeholder="Ingresa el código de 6 dígitos"
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      borderRadius: "13px",
                                      padding: "12px",
                                      fontWeight: 900,
                                      outline: "none",
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={validarCodigo}
                                  style={{
                                    border: "none",
                                    background: "#07195a",
                                    color: "#ffffff",
                                    borderRadius: "14px",
                                    padding: "13px 16px",
                                    fontWeight: 950,
                                    cursor: "pointer",
                                  }}
                                >
                                  Validar código
                                </button>
                              </div>
                            )}

                            {pasoClave === "clave" && (
                              <div style={{ display: "grid", gap: "12px" }}>
                                <label style={{ display: "grid", gap: "7px" }}>
                                  <span
                                    style={{
                                      color: "#07195a",
                                      fontSize: "12px",
                                      fontWeight: 950,
                                    }}
                                  >
                                    Nueva contraseña
                                  </span>
                                  <input
                                    type="password"
                                    value={nuevaClave}
                                    onChange={(event) =>
                                      setNuevaClave(event.target.value)
                                    }
                                    placeholder="Mínimo 8 caracteres"
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      borderRadius: "13px",
                                      padding: "12px",
                                      fontWeight: 900,
                                      outline: "none",
                                    }}
                                  />
                                </label>

                                <label style={{ display: "grid", gap: "7px" }}>
                                  <span
                                    style={{
                                      color: "#07195a",
                                      fontSize: "12px",
                                      fontWeight: 950,
                                    }}
                                  >
                                    Confirmar contraseña
                                  </span>
                                  <input
                                    type="password"
                                    value={confirmarClave}
                                    onChange={(event) =>
                                      setConfirmarClave(event.target.value)
                                    }
                                    placeholder="Repite tu nueva contraseña"
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      borderRadius: "13px",
                                      padding: "12px",
                                      fontWeight: 900,
                                      outline: "none",
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={actualizarClave}
                                  style={{
                                    border: "none",
                                    background: "#f47c20",
                                    color: "#ffffff",
                                    borderRadius: "14px",
                                    padding: "13px 16px",
                                    fontWeight: 950,
                                    cursor: "pointer",
                                  }}
                                >
                                  Actualizar contraseña
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {vista === "siniestro" && (
              <ReportarSiniestro
                polizas={polizas}
                datosPerfil={datosPerfil}
                nombreCliente={nombreCliente}
              />
            )}

            {vista === "cuotas" && (
              <div className="pc-panel pc-full-panel">
                <h2>Pagos y cuotas</h2>

                <p
                  style={{
                    color: "#56637a",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    marginTop: "-12px",
                    marginBottom: "18px",
                  }}
                >
                  Revisa tus cuotas pendientes, próximos vencimientos y
                  comprobantes asociados a tus pólizas.
                </p>

                <div className="pc-stats" style={{ marginBottom: "14px" }}>
                  <article>
                    <strong>{formatearMoneda(montoPendiente)}</strong>
                    <span>Monto pendiente</span>
                  </article>

                  <article>
                    <strong>{pagosPendientes.length}</strong>
                    <span>Cuotas próximas</span>
                  </article>

                  <article>
                    <strong>
                      {proximoPago
                        ? formatearFecha(proximoPago.fecha_vencimiento)
                        : "—"}
                    </strong>
                    <span>Próximo vencimiento</span>
                  </article>

                  <article>
                    <strong>{pagosRealizados}</strong>
                    <span>Pagos realizados</span>
                  </article>
                </div>

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
                      gridTemplateColumns:
                        "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
                      gap: "10px",
                      padding: "12px 16px",
                      background: "#f5f7fb",
                      color: "#07195a",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    <span>Seguro</span>
                    <span>Compañía</span>
                    <span>Cuota</span>
                    <span>Monto</span>
                    <span>Vencimiento</span>
                    <span>Estado</span>
                    <span>Acción</span>
                  </div>

                  {pagosNormalizados.length === 0 ? (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
                          gap: "10px",
                          alignItems: "center",
                          padding: "15px 16px",
                          borderTop: "1px solid #eef2f7",
                          color: "#667085",
                          fontSize: "13px",
                          fontWeight: 800,
                        }}
                      >
                        <span>No tienes pagos pendientes</span>
                        <span>—</span>
                        <span>—</span>
                        <span>—</span>
                        <span>—</span>
                        <span>—</span>
                        <span>—</span>
                      </div>

                      <div
                        className="pc-empty"
                        style={{ margin: "14px", padding: "24px" }}
                      >
                        <h3>No tienes pagos pendientes</h3>
                        <p>
                          Cuando una póliza tenga pagos, cuotas próximas o
                          comprobantes, podrás gestionarlos aquí
                          automáticamente.
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button onClick={() => setVista("cotizaciones")}>
                            Explorar seguros
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              abrirWhatsApp(
                                "Hola, necesito orientación sobre pagos y cuotas de mis seguros.",
                              )
                            }
                            style={{
                              background: "#ffffff",
                              color: "#07195a",
                              border: "1px solid #dfe6f3",
                            }}
                          >
                            Contactar ejecutivo
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    pagosNormalizados.map((pago) => (
                      <div
                        key={pago.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
                          gap: "10px",
                          alignItems: "center",
                          padding: "13px 16px",
                          borderTop: "1px solid #eef2f7",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <strong
                            style={{ color: "#07195a", display: "block" }}
                          >
                            {pago.seguro}
                          </strong>
                          <small style={{ color: "#667085", fontWeight: 800 }}>
                            {pago.numero_poliza}
                          </small>
                        </div>

                        <span style={{ color: "#475467" }}>
                          {pago.compania}
                        </span>
                        <strong style={{ color: "#07195a" }}>
                          {pago.cuota}
                        </strong>
                        <strong style={{ color: "#07195a" }}>
                          {formatearMoneda(pago.monto, pago.moneda)}
                        </strong>
                        <span style={{ color: "#475467" }}>
                          {formatearFecha(pago.fecha_vencimiento)}
                        </span>
                        <span className={`pc-status ${pago.estado}`}>
                          {textoEstado(pago.estado)}
                        </span>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {[
                            "pendiente",
                            "por-vencer",
                            "vigente",
                            "activa",
                          ].includes(pago.estado) ? (
                            <button
                              type="button"
                              onClick={() => iniciarPago(pago)}
                              style={{
                                border: "none",
                                background: "#07195a",
                                color: "#ffffff",
                                borderRadius: "10px",
                                padding: "9px 12px",
                                fontSize: "11px",
                                fontWeight: 900,
                              }}
                            >
                              Pagar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                pago.url_comprobante
                                  ? window.open(
                                      pago.url_comprobante,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  : abrirWhatsApp(
                                      `Hola, necesito el comprobante del pago asociado a ${pago.seguro}.`,
                                    )
                              }
                              style={{
                                border: "1px solid #f47c20",
                                background: "#ffffff",
                                color: "#f47c20",
                                borderRadius: "10px",
                                padding: "9px 12px",
                                fontSize: "11px",
                                fontWeight: 900,
                              }}
                            >
                              Comprobante
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    padding: "16px",
                    borderRadius: "16px",
                    background: "#f8faff",
                    border: "1px solid #e6ebf2",
                    color: "#56637a",
                    fontSize: "13px",
                    lineHeight: 1.55,
                  }}
                >
                  <strong
                    style={{
                      color: "#07195a",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Integración preparada
                  </strong>
                  El portal queda listo para consumir{" "}
                  <strong>/portal/mis-pagos</strong>. Para pagos reales, el
                  frontend debe solicitar al backend iniciar la transacción y el
                  backend debe conectar con el proveedor de pago.
                </div>
              </div>
            )}

            {vista === "Club-PC" && (
              <ClubBeneficios
                beneficios={beneficios}
                nombreVisible={nombreVisible}
                rut={datosPerfil.rut}
              />
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Dashboard;
