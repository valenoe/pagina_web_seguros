import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getMiCuenta,
  getMisAlertas,
  getMisBeneficiarios,
  getMisBeneficios,
  getMisCoberturas,
  getMisCotizaciones,
  getMisDocumentos,
  getMisPagos,
  getMisPolizas,
} from "../services/api";

const VISTAS_PERMITIDAS = [
  "Resumen",
  "mis-seguros",
  "polizas",
  "siniestro",
  "cuotas",
  "beneficios",
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

  const nombreClienteGuardado = localStorage.getItem("nombre_cliente") || "";
  const nombreCliente = nombreClienteGuardado && !/[0-9]/.test(nombreClienteGuardado)
    ? nombreClienteGuardado
    : "Matías";
  const primerNombreCliente = nombreCliente.split(" ")[0] || "Matías";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [coberturas, setCoberturas] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [beneficios, setBeneficios] = useState([]);
  const [categoriaBeneficioActiva, setCategoriaBeneficioActiva] = useState("todos");
  const [beneficioSlide, setBeneficioSlide] = useState(0);
  const [documentos, setDocumentos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [vista, setVista] = useState(() => obtenerVistaDesdeRuta(location) || "resumen");
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

  const [tabMisSeguros, setTabMisSeguros] = useState("coberturas");

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [polizaReporteId, setPolizaReporteId] = useState("");
  const [siniestroSeleccionadoId, setSiniestroSeleccionadoId] = useState("");
  const [reporteSiniestroActivo, setReporteSiniestroActivo] = useState(false);
  const [paginaSiniestros, setPaginaSiniestros] = useState(1);
  const [formularioSiniestroAbierto, setFormularioSiniestroAbierto] = useState(false);
  const [modoFormularioSiniestro, setModoFormularioSiniestro] = useState("digital");
  const [mensajeFormularioSiniestro, setMensajeFormularioSiniestro] = useState("");
  const [archivoRespaldoSiniestro, setArchivoRespaldoSiniestro] = useState([]);
  const [formularioSiniestro, setFormularioSiniestro] = useState({
    numeroSiniestro: "",
    liquidador: "",
    polizaItem: "",
    siniestroDia: "",

    aseguradoDireccion: "",
    aseguradoCiudad: "",
    denunciante: "",
    denuncianteRut: "",

    conductorNombre: "",
    conductorRut: "",
    conductorDireccion: "",
    conductorTelefono: "",
    conductorCiudad: "",
    conductorRegion: "",
    conductorComuna: "",
    licenciaNumero: "",
    licenciaVigencia: "",
    licenciaClase: "",
    conductorEdad: "",

    vehiculoMarca: "",
    vehiculoModelo: "",
    vehiculoAnio: "",
    vehiculoPatente: "",
    vehiculoMotor: "",

    fechaSiniestro: "",
    horaSiniestro: "",
    direccionOcurrencia: "",
    ciudadOcurrencia: "",
    regionOcurrencia: "",
    relatoHechos: "",
    lugarInspeccion: "",

    tipoDano: "",
    partesAfectadas: "",
    magnitudDanos: "",
    existeTercero: "",
    terceroReclama: "",
    terceroSeguro: "",
    terceroCompania: "",
    terceroCulpable: "",
    terceroDano: "",

    terceroNombre: "",
    terceroRut: "",
    terceroDireccion: "",
    terceroCiudad: "",
    terceroTelefono: "",
    terceroEmail: "",
    terceroVehiculo: "",
    terceroModelo: "",
    terceroPatente: "",

    comisaria: "",
    folio: "",
    fechaDenuncia: "",
    juzgado: "",
    citacion: "",
    alcoholemia: "",
    observaciones: "",
  });

  const [avatarPerfil, setAvatarPerfil] = useState(
    localStorage.getItem("avatar_cliente") || ""
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
    const vistaRuta = obtenerVistaDesdeRuta(location);
    if (vistaRuta) setVista(vistaRuta);
  }, [location]);

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

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setBeneficioSlide((actual) => actual + 1);
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, []);


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
          cobResult,
          benResult,
          docsResult,
          pagosResult,
          beneficiosResult,
        ] = await Promise.allSettled([
          getMiCuenta(token),
          getMisAlertas(token),
          getMisCotizaciones(token),
          getMisPolizas(token),
          getMisCoberturas(token),
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

          if (nombreCuenta) localStorage.setItem("nombre_cliente", nombreCuenta);
          if (rutCuenta) localStorage.setItem("rut_cliente", rutCuenta);
          if (correoCuenta) localStorage.setItem("correo_cliente", correoCuenta);
          if (telefonoCuenta) localStorage.setItem("telefono_cliente", telefonoCuenta);
          if (direccionCuenta) localStorage.setItem("direccion_cliente", direccionCuenta);

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
          setAlertas(Array.isArray(alertasResult.value) ? alertasResult.value : []);
        }

        if (cotsResult.status === "fulfilled") {
          setCotizaciones(Array.isArray(cotsResult.value) ? cotsResult.value : []);
        }

        if (polsResult.status === "fulfilled") {
          setPolizas(Array.isArray(polsResult.value) ? polsResult.value : []);
        }

        if (cobResult.status === "fulfilled") {
          setCoberturas(Array.isArray(cobResult.value) ? cobResult.value : []);
        }

        if (benResult.status === "fulfilled") {
          setBeneficiarios(Array.isArray(benResult.value) ? benResult.value : []);
        }

        if (docsResult.status === "fulfilled") {
          setDocumentos(Array.isArray(docsResult.value) ? docsResult.value : []);
        }

        if (pagosResult.status === "fulfilled") {
          setPagos(Array.isArray(pagosResult.value) ? pagosResult.value : []);
        }

        if (beneficiosResult.status === "fulfilled") {
          setBeneficios(Array.isArray(beneficiosResult.value) ? beneficiosResult.value : []);
        }

        if (cotsResult.status === "rejected" && polsResult.status === "rejected") {
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

  const segurosFiltrados = segurosDisponibles.filter((seguro) => {
    if (filtroSeguros === "todos") return true;
    if (filtroSeguros === "vehiculos") return seguro.categoria === "Vehículos";
    if (filtroSeguros === "personas") return seguro.categoria === "Personas";
    if (filtroSeguros === "hogar") return seguro.id === "hogar";
    if (filtroSeguros === "empresas") return seguro.categoria === "Empresas y otros";
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
    if (ordenSeguros === "categoria") return a.categoria.localeCompare(b.categoria);
    if (ordenSeguros === "precio") return a.precioUf.localeCompare(b.precioUf);
    return segurosDisponibles.findIndex((seguro) => seguro.id === a.id) - segurosDisponibles.findIndex((seguro) => seguro.id === b.id);
  });

  const totalPaginasSeguros = Math.max(Math.ceil(segurosOrdenados.length / segurosPorVista), 1);
  const paginaSeguroActual = Math.min(seguroSlide, totalPaginasSeguros - 1);
  const mostrarFlechasSeguros = totalPaginasSeguros > 1;
  const segurosVisiblesCarrusel = segurosOrdenados.slice(
    paginaSeguroActual * segurosPorVista,
    paginaSeguroActual * segurosPorVista + segurosPorVista
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

  function normalizarEstado(estado = "") {
    const estadoLimpio = String(estado || "").toLowerCase().trim();
    if (["activa", "activo", "vigente"].includes(estadoLimpio)) return "vigente";
    if (["por vencer", "por-vencer", "proxima", "próxima"].includes(estadoLimpio)) return "por-vencer";
    if (["vencida", "caducada", "inactiva", "anulada"].includes(estadoLimpio)) return "vencida";
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
    return poliza.numero_poliza || poliza.numero || `POL-${String(index + 1).padStart(4, "0")}`;
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
    (p) => p.estado === "vigente" || p.estado === "activa"
  ).length;

  const companiasAsociadas = [
    ...new Set(polizasNormalizadas.map((p) => p.compania).filter(Boolean)),
  ].length;

  const proximaPoliza = [...polizasNormalizadas]
    .filter((p) => p.fecha_vencimiento)
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];

  const beneficiariosNormalizados =
    beneficiarios.length > 0
      ? beneficiarios.map((beneficiario, index) => ({
          id: beneficiario.id_beneficiario || beneficiario.id || `beneficiario-${index}`,
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
          porcentaje: beneficiario.porcentaje ? `${beneficiario.porcentaje}%` : "Según póliza",
          estado: beneficiario.estado || "activo",
        }))
      : polizas.flatMap((poliza, index) => {
          const nombreSeguro = obtenerNombreSeguroDesdePoliza(poliza, index);
          const numeroPoliza = obtenerNumeroPoliza(poliza, index);
          const beneficiariosPoliza = poliza.beneficiarios || [];

          return beneficiariosPoliza.map((beneficiario, bIndex) => ({
            id: beneficiario.id_beneficiario || `${poliza.id_poliza || index}-${bIndex}`,
            seguro: nombreSeguro,
            poliza: numeroPoliza,
            nombre: beneficiario.nombre || "Beneficiario",
            rut: beneficiario.rut || "—",
            relacion: beneficiario.relacion || "No informado",
            porcentaje: beneficiario.porcentaje ? `${beneficiario.porcentaje}%` : "Según póliza",
            estado: beneficiario.estado || "activo",
          }));
        });

  const coberturasNormalizadas =
    coberturas.length > 0
      ? coberturas.map((item, index) => ({
          id: item.id_cobertura || item.id_poliza || item.id || `cobertura-${index}`,
          seguro: item.seguro || item.nombre_seguro || item.poliza?.seguro?.nombre || "Seguro asociado",
          poliza: item.numero_poliza || item.poliza?.numero_poliza || item.poliza || "—",
          estado: normalizarEstado(item.estado || item.poliza?.estado),
          monto: item.monto_asegurado || item.capital_asegurado || item.monto || "Según póliza",
          deducible: item.deducible || "Según condiciones",
          coberturas: Array.isArray(item.coberturas)
            ? item.coberturas.map((c) => (typeof c === "string" ? c : c.nombre || c.detalle)).filter(Boolean)
            : item.nombre
              ? [item.nombre]
              : ["Cobertura principal según póliza"],
          exclusiones: Array.isArray(item.exclusiones)
            ? item.exclusiones
            : ["Revisar condiciones generales del contrato"],
        }))
      : polizasNormalizadas.map((poliza) => ({
          id: poliza.id_poliza || poliza.id,
          seguro: poliza.seguro,
          poliza: poliza.numero_poliza,
          estado: poliza.estado,
          monto: poliza.raw.monto_cobertura || poliza.raw.capital_asegurado || "Según póliza",
          deducible: poliza.raw.deducible || "Según condiciones",
          coberturas: Array.isArray(poliza.raw.coberturas)
            ? poliza.raw.coberturas
            : [
                "Cobertura principal según póliza",
                "Asistencia y acompañamiento Prieto & Correa",
                "Revisión de vigencia y condiciones contratadas",
              ],
          exclusiones: poliza.raw.exclusiones || ["Revisar condiciones generales del contrato"],
        }));

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
          fecha: documento.fecha || documento.fecha_emision || documento.created_at || "",
          url_pdf: documento.url_pdf || documento.url || "",
        }))
      : documentosDesdePolizas;

  const documentosDemo = documentosNormalizados;

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
    (documento) => String(documento.estado).toLowerCase() === "disponible"
  ).length;

  const polizasConDocumentos = new Set(documentosDemo.map((documento) => documento.seguro)).size;

  const coberturasMisSeguros = coberturasNormalizadas;
  const beneficiariosMisSeguros = beneficiariosNormalizados;

  const beneficiariosTotales = beneficiariosMisSeguros.length;
  const beneficiariosActivos = beneficiariosMisSeguros.filter((beneficiario) =>
    ["activo", "activa", "vigente"].includes(
      String(beneficiario.estado || "").toLowerCase().trim()
    )
  ).length;
  const polizasConBeneficiarios = new Set(
    beneficiariosMisSeguros
      .map((beneficiario) => beneficiario.poliza || beneficiario.seguro)
      .filter(Boolean)
  ).size;


  const coberturasFilas = coberturasMisSeguros.flatMap((item) => {
    const incluidas = (item.coberturas || []).map((cobertura, index) => ({
      id: `${item.id}-incluida-${index}`,
      nombre: cobertura,
      seguro: item.seguro || "Seguro asociado",
      poliza: item.poliza || "—",
      condicion: "Incluida",
      monto: item.monto || "Según póliza",
      deducible: item.deducible || "Según condiciones",
      estado: "incluida",
    }));

    const excluidas = (item.exclusiones || []).map((exclusion, index) => ({
      id: `${item.id}-excluida-${index}`,
      nombre: exclusion,
      seguro: item.seguro || "Seguro asociado",
      poliza: item.poliza || "—",
      condicion: "Exclusión",
      monto: "No aplica",
      deducible: "No aplica",
      estado: "excluida",
    }));

    return [...incluidas, ...excluidas];
  });

  const coberturasRegistradas = coberturasFilas.length;
  const coberturasIncluidas = coberturasFilas.filter((cobertura) => cobertura.estado === "incluida").length;
  const coberturasExcluidas = coberturasFilas.filter((cobertura) => cobertura.estado === "excluida").length;
  const polizasConCoberturas = new Set(
    coberturasMisSeguros
      .map((cobertura) => cobertura.poliza || cobertura.seguro)
      .filter(Boolean)
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
          poliza.numero_poliza === pago.numero_poliza
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
        pago.fecha_vencimiento ||
        pago.vencimiento ||
        pago.fecha_pago ||
        "",
      fecha_pago: pago.fecha_pago || "",
      estado: normalizarEstado(pago.estado || "pendiente"),
      url_pago: pago.url_pago || pago.link_pago || "",
      url_comprobante: pago.url_comprobante || pago.comprobante || "",
      raw: pago,
    };
  }

  const pagosNormalizados = pagos.map(normalizarPago);

  const pagosPendientes = pagosNormalizados.filter((pago) =>
    ["pendiente", "por-vencer", "vigente", "activa"].includes(pago.estado)
  );

  const pagosRealizados = pagosNormalizados.filter((pago) =>
    ["pagado", "pagada", "completado", "completada"].includes(
      String(pago.estado || "").toLowerCase().trim()
    )
  ).length;

  const montoPendiente = pagosPendientes.reduce((total, pago) => {
    const monto = Number(pago.monto);
    return total + (Number.isNaN(monto) ? 0 : monto);
  }, 0);

  const proximoPago = [...pagosPendientes]
    .filter((pago) => pago.fecha_vencimiento)
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];

  function iniciarPago(pago) {
    if (pago.url_pago) {
      window.open(pago.url_pago, "_blank", "noopener,noreferrer");
      return;
    }

    abrirWhatsApp(
      `Hola, necesito ayuda para pagar la cuota ${pago.cuota} de ${pago.seguro}, póliza ${pago.numero_poliza}.`
    );
  }




  const categoriasBeneficios = [
    { id: "todos", nombre: "Todos", icono: "/descuento.png" },
    { id: "bienestar", nombre: "Bienestar", icono: "/bienstar.png" },
    { id: "salud", nombre: "Salud", icono: "/beneficios.png" },
    { id: "descuentos", nombre: "Descuentos", icono: "/descuento.png" },
  ];

  const beneficiosDemo = [
    {
      id_beneficio: "kimagen-1",
      empresa: "Kimagen",
      titulo: "Kimagen",
      descuento: "15% dcto.",
      descripcion: "15% de descuento en prestaciones asociadas para clientes del Club Prieto & Correa.",
      bajada: "Presentar orden médica junto al beneficio Club Prieto & Correa.",
      condiciones: "Válido presentando orden médica. Beneficio no acumulable con otras promociones.",
      categoria: "salud",
      estado: "activo",
      vigencia: "2026-12-31",
      imagen: "/kimagen.png",
      icono: "/kimagen.png",
      destacado: true,
    },
    {
      id_beneficio: "kineintegral-1",
      empresa: "AB Kineintegral",
      titulo: "AB Kineintegral",
      descuento: "20% dcto.",
      descripcion:
      "20% de descuento en servicios kinesiológicos para clientes del Club Prieto & Correa.",
      bajada:
      "Beneficio aplicable en sus servicios disponibles.",
      condiciones:
      "Válido para clientes del Club Prieto & Correa. Sujeto a disponibilidad y condiciones del prestador.",
      categoria: "bienestar",
      estado: "activo",
      vigencia: "2026-12-31",

      imagen: "/kineintegral.png",
      icono: "/kineintegral.png",

      destacado: true,
      },
  ];

  const beneficiosBase = beneficios.length > 0 ? beneficios : beneficiosDemo;
  const beneficiosFiltrados = beneficiosBase.filter((beneficio) => {
    if (categoriaBeneficioActiva === "todos") return true;
    return String(beneficio.categoria || "").toLowerCase() === categoriaBeneficioActiva;
  });
  const beneficiosDestacados = beneficiosBase.filter((beneficio) => beneficio.destacado !== false);
  const beneficioPrincipal = beneficiosDestacados.length > 0
    ? beneficiosDestacados[beneficioSlide % beneficiosDestacados.length]
    : beneficiosBase[0];
  const beneficiosActivos = beneficiosBase.filter((beneficio) => beneficio.estado !== "proximamente").length;

  function abrirMisSeguros(tab = "coberturas") {
    setTabMisSeguros(tab);
    setVista("mis-seguros");
  }

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
                          {alerta.titulo ||
                            alerta.tipo ||
                            "Nueva notificación"}
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

                      <button onClick={() => abrirMisSeguros("coberturas")}>
                        Revisar cobertura
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
                      <strong>{proximaPoliza?.fecha_vencimiento ? formatearFecha(proximaPoliza.fecha_vencimiento) : "—"}</strong>
                      <span>Próximo vencimiento</span>
                    </article>

                    <article>
                      <strong>0</strong>
                      <span>Casos abiertos</span>
                    </article>

                    <article>
                      <strong>{companiasAsociadas > 0 ? companiasAsociadas : "—"}</strong>
                      <span>Compañías asociadas</span>
                    </article>
                  </div>

                  <div className="pc-panel">
                    <div className="pc-panel-title">
                      <h3>
                        <img src="/mis-polizas-activas.png" alt="" />
                        Mis pólizas activas
                      </h3>

                      <button onClick={() => abrirMisSeguros("coberturas")}>
                        Ver todas
                      </button>
                    </div>

                    {polizasNormalizadas.length === 0 ? (
                      <div className="pc-empty pc-empty-protection">
                        <h3>Aún no tienes pólizas visibles</h3>
                        <p>
                          Tu ejecutivo puede ayudarte a revisar tu protección actual
                          y activar tus pólizas en el portal.
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
                      <span className="pc-advisor-status">Disponible ahora</span>

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

                      <button onClick={() => setVista("beneficios")}>
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
                      {proximaPoliza?.prima ? `${proximaPoliza.prima} UF` : "Sin pago informado"}
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
                      <p>Consultas rápidas y acompañamiento directo con tu ejecutivo.</p>
                      <small className="pc-response-time">Tiempo promedio de respuesta: &lt; 15 min</small>

                      <button
                        className="pc-whatsapp-button"
                        onClick={() =>
                          abrirWhatsApp("Hola, necesito hablar con mi ejecutivo de Prieto & Correa Seguros.")
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
              <div className="pc-panel pc-full-panel">
                <div className="pc-panel-title" style={{ marginBottom: "16px", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ marginBottom: "6px" }}>Mis Seguros</h2>
                    <p style={{ margin: 0, color: "#667085", fontSize: "14px", lineHeight: 1.55 }}>
                      Visualiza tus pólizas, coberturas, beneficiarios y documentos en un solo lugar.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    gap: "8px",
                    padding: "6px",
                    background: "#f3f6fb",
                    borderRadius: "14px",
                    marginBottom: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    ["coberturas", "Coberturas"],
                    ["beneficiarios", "Beneficiarios"],
                    ["documentos", "Documentos"],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTabMisSeguros(tab)}
                      style={{
                        height: "40px",
                        padding: "0 18px",
                        border: "none",
                        borderRadius: "11px",
                        background: tabMisSeguros === tab ? "#07195a" : "transparent",
                        color: tabMisSeguros === tab ? "#ffffff" : "#07195a",
                        fontWeight: 900,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tabMisSeguros === "coberturas" && (
                  <div>
                    <div className="pc-stats" style={{ marginBottom: "14px" }}>
                      <article>
                        <strong>{coberturasRegistradas}</strong>
                        <span>Coberturas registradas</span>
                      </article>

                      <article>
                        <strong>{polizasConCoberturas}</strong>
                        <span>Pólizas asociadas</span>
                      </article>

                      <article>
                        <strong>{coberturasIncluidas}</strong>
                        <span>Incluidas</span>
                      </article>

                      <article>
                        <strong>{coberturasExcluidas}</strong>
                        <span>Excluidas</span>
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
                          gridTemplateColumns: "1.35fr 1.25fr 0.8fr 0.8fr 0.8fr 0.75fr",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#f5f7fb",
                          color: "#07195a",
                          fontSize: "12px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        <span>Cobertura</span>
                        <span>Seguro / Póliza</span>
                        <span>Condición</span>
                        <span>Monto</span>
                        <span>Deducible</span>
                        <span>Estado</span>
                      </div>

                      {coberturasFilas.length === 0 ? (
                        <div
                          style={{
                            padding: "26px",
                            borderTop: "1px solid #eef2f7",
                            background: "#f8faff",
                          }}
                        >
                          <h3 style={{ color: "#07195a", marginBottom: "8px" }}>
                            No tienes coberturas registradas
                          </h3>

                          <p style={{ color: "#56637a", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                            Cuando tus pólizas estén activas, verás aquí qué cubre cada seguro,
                            sus montos, deducibles y exclusiones principales.
                          </p>

                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => setVista("cotizaciones")}
                              style={{
                                minHeight: "42px",
                                border: "none",
                                borderRadius: "12px",
                                background: "#07195a",
                                color: "#ffffff",
                                padding: "0 18px",
                                fontSize: "12px",
                                fontWeight: 900,
                              }}
                            >
                              Explorar seguros
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirWhatsApp("Hola, necesito orientación sobre las coberturas de mis seguros.")}
                              style={{
                                minHeight: "42px",
                                border: "1px solid #dfe6f3",
                                borderRadius: "12px",
                                background: "#ffffff",
                                color: "#07195a",
                                padding: "0 18px",
                                fontSize: "12px",
                                fontWeight: 900,
                              }}
                            >
                              Contactar ejecutivo
                            </button>
                          </div>
                        </div>
                      ) : (
                        coberturasFilas.map((cobertura) => (
                          <div
                            key={cobertura.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1.35fr 1.25fr 0.8fr 0.8fr 0.8fr 0.75fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "13px 16px",
                              borderTop: "1px solid #eef2f7",
                              fontSize: "13px",
                            }}
                          >
                            <strong style={{ color: "#07195a" }}>{cobertura.nombre}</strong>
                            <span style={{ color: "#475467" }}>{cobertura.seguro} / {cobertura.poliza}</span>
                            <span style={{ color: "#475467" }}>{cobertura.condicion}</span>
                            <strong style={{ color: "#07195a" }}>{cobertura.monto}</strong>
                            <span style={{ color: "#475467" }}>{cobertura.deducible}</span>
                            <span
                              style={{
                                width: "fit-content",
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background:
                                  cobertura.estado === "incluida"
                                    ? "rgba(22, 163, 74, 0.12)"
                                    : "rgba(244, 124, 32, 0.14)",
                                color:
                                  cobertura.estado === "incluida"
                                    ? "#16a34a"
                                    : "#f47c20",
                                fontSize: "12px",
                                fontWeight: 900,
                              }}
                            >
                              {cobertura.estado === "incluida" ? "Incluida" : "Excluida"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tabMisSeguros === "beneficiarios" && (
                  <div>
                    <div className="pc-stats" style={{ marginBottom: "14px" }}>
                      <article>
                        <strong>{beneficiariosTotales}</strong>
                        <span>Beneficiarios</span>
                      </article>

                      <article>
                        <strong>{polizasConBeneficiarios}</strong>
                        <span>Seguros asociados</span>
                      </article>

                      <article>
                        <strong>{beneficiariosActivos}</strong>
                        <span>Activos</span>
                      </article>

                      <article>
                        <strong>{beneficiariosTotales === 0 ? "—" : "Al día"}</strong>
                        <span>Estado general</span>
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
                          gridTemplateColumns: "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#f5f7fb",
                          color: "#07195a",
                          fontSize: "12px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        <span>Beneficiario</span>
                        <span>RUT</span>
                        <span>Relación</span>
                        <span>Póliza</span>
                        <span>%</span>
                        <span>Estado</span>
                      </div>

                      {beneficiariosMisSeguros.length === 0 ? (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "15px 16px",
                              borderTop: "1px solid #eef2f7",
                              color: "#667085",
                              fontSize: "13px",
                              fontWeight: 800,
                            }}
                          >
                            <span>No hay beneficiarios registrados</span>
                            <span>—</span>
                            <span>—</span>
                            <span>—</span>
                            <span>—</span>
                            <span>—</span>
                          </div>

                          <div className="pc-empty" style={{ margin: "14px", padding: "24px" }}>
                            <h3>Aún no tienes beneficiarios asociados</h3>
                            <p>
                              Cuando una póliza incluya beneficiarios, aparecerán aquí automáticamente con su relación, porcentaje y póliza asociada.
                            </p>

                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button onClick={() => setVista("cotizaciones")}>Explorar seguros</button>
                              <button
                                type="button"
                                onClick={() =>
                                  abrirWhatsApp("Hola, necesito ayuda para revisar o registrar beneficiarios en mis seguros.")
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
                        beneficiariosMisSeguros.map((beneficiario) => (
                          <div
                            key={beneficiario.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "13px 16px",
                              borderTop: "1px solid #eef2f7",
                              fontSize: "13px",
                            }}
                          >
                            <strong style={{ color: "#07195a" }}>{beneficiario.nombre}</strong>
                            <span style={{ color: "#475467" }}>{beneficiario.rut}</span>
                            <span style={{ color: "#475467" }}>{beneficiario.relacion}</span>
                            <span style={{ color: "#475467" }}>{beneficiario.seguro} / {beneficiario.poliza}</span>
                            <strong style={{ color: "#07195a" }}>{beneficiario.porcentaje}</strong>
                            <span className={`pc-status ${normalizarEstado(beneficiario.estado)}`}>
                              {textoEstado(normalizarEstado(beneficiario.estado))}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tabMisSeguros === "documentos" && (
                  <div>
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
                          padding: "0 10px",
                          outline: "none",
                        }}
                      />

                      <select name="seguro" value={filtrosDocumentos.seguro} onChange={actualizarFiltroDocumento} style={{ width: "100%", height: "42px", border: "1px solid #d9e1ec", borderRadius: "12px", padding: "0 12px", outline: "none", background: "#ffffff" }}>
                        {segurosDocumentos.map((seguro) => (
                          <option key={seguro} value={seguro}>
                            {seguro === "todos" ? "Todos los seguros" : seguro}
                          </option>
                        ))}
                      </select>

                      <select name="tipo" value={filtrosDocumentos.tipo} onChange={actualizarFiltroDocumento} style={{ width: "100%", height: "42px", border: "1px solid #d9e1ec", borderRadius: "12px", padding: "0 12px", outline: "none", background: "#ffffff" }}>
                        {tiposDocumentos.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo === "todos" ? "Todos los tipos" : tipo}
                          </option>
                        ))}
                      </select>

                      <select name="estado" value={filtrosDocumentos.estado} onChange={actualizarFiltroDocumento} style={{ width: "100%", height: "42px", border: "1px solid #d9e1ec", borderRadius: "12px", padding: "0 12px", outline: "none", background: "#ffffff" }}>
                        {estadosDocumentos.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado === "todos" ? "Todos los estados" : estado}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ border: "1px solid #e6ebf2", borderRadius: "18px", overflow: "hidden", background: "#ffffff" }}>
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
                                color: documento.estado === "Disponible" ? "#067647" : documento.estado === "En preparación" ? "#b54708" : "#07195a",
                                background: documento.estado === "Disponible" ? "#ecfdf3" : documento.estado === "En preparación" ? "#fffaeb" : "#eef4ff",
                              }}
                            >
                              {documento.estado}
                            </span>
                            <span>{formatearFecha(documento.fecha)}</span>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button type="button" onClick={() => abrirPreviewDocumento(documento)} style={{ minHeight: "34px", padding: "8px 12px", borderRadius: "10px", border: "none", background: "#07195a", color: "#ffffff", fontWeight: 800, cursor: "pointer" }}>
                                Ver PDF
                              </button>
                              <button type="button" onClick={() => descargarDocumento(documento)} style={{ minHeight: "34px", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f47c20", background: "#ffffff", color: "#f47c20", fontWeight: 800, cursor: "pointer" }}>
                                {documento.estado === "Disponible" ? "Descargar" : "Ejecutivo"}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
                    <section className="pc-seguros-disponibles-v2">
                      <div className="pc-seguros-v2-head">
                        <div>
                          <h2>Seguros Disponibles</h2>
                          <p>
                            Explora soluciones de protección disponibles para personas,
                            familias y empresas con acompañamiento Prieto & Correa.
                          </p>
                        </div>

                        <div className="pc-seguros-v2-advice">
                          <div className="pc-seguros-v2-advice-icon">
                            <img src="/solicitar-asistencia.png" alt="" />
                          </div>

                          <div>
                            <strong>¿No sabes cuál elegir?</strong>
                            <span>
                              Tu ejecutivo puede ayudarte a encontrar la alternativa adecuada para ti.
                            </span>
                          </div>

                          <button
                            type="button"
                            className="pc-seguros-v2-orange"
                            onClick={() =>
                              abrirWhatsApp("Hola, necesito contactar a mi ejecutivo para revisar una solución de seguro disponible.")
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
                              <small>Fecha: {formatearFecha(c.fecha_solicitud)}</small>
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
                              className={filtroSeguros === "todos" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("todos")}
                            >
                              <img src="/proteger.png" alt="" />
                              Ver todo
                            </button>
                            <button
                              type="button"
                              className={filtroSeguros === "vehiculos" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("vehiculos")}
                            >
                              <img src="/icon-seguro-auto.png" alt="" />
                              Vehículos
                            </button>
                            <button
                              type="button"
                              className={filtroSeguros === "personas" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("personas")}
                            >
                              <img src="/icon-cliente.png" alt="" />
                              Personas
                            </button>
                            <button
                              type="button"
                              className={filtroSeguros === "hogar" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("hogar")}
                            >
                              <img src="/icon-hogar.png" alt="" />
                              Hogar y patrimonio
                            </button>
                            <button
                              type="button"
                              className={filtroSeguros === "empresas" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("empresas")}
                            >
                              <img src="/icon-edificio.png" alt="" />
                              Empresas
                            </button>
                            <button
                              type="button"
                              className={filtroSeguros === "internacional" ? "active" : ""}
                              onClick={() => cambiarFiltroSeguros("internacional")}
                            >
                              <img src="/mapa-del-mundo.png" alt="" />
                              Internacional
                            </button>
                          </div>
                        </div>

                        <label className="pc-seguros-v2-order">
                          Ordenar por
                          <select value={ordenSeguros} onChange={(e) => setOrdenSeguros(e.target.value)}>
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
                              const indiceRealSeguro = paginaSeguroActual * segurosPorVista + index;

                              return (
                                <article className="seguro-bloque pc-seguro-producto-v2" key={seguro.id}>
                                <div className="seguro-bloque-imagen">
                                  <img src={seguro.foto} alt={seguro.nombre} />
                                  <span className={`pc-product-badge badge-${indiceRealSeguro % 3}`}>
                                    {indiceRealSeguro === 0 ? "Recomendado" : seguro.categoria}
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
                                      <strong>{seguro.precioUf.replace("Desde ", "")}</strong>
                                    </div>

                                    <div className="pc-product-advised">
                                      <img src="/premium.png" alt="" />
                                      <span>Asesorado por<br />Prieto & Correa</span>
                                    </div>
                                  </div>

                                  <div className="seguro-bloque-actions pc-product-actions">
                                    <button onClick={() => abrirDetalleCotizacion(seguro.id)}>
                                      Ver cobertura
                                    </button>
                                    <button
                                      type="button"
                                      className="pc-product-secondary"
                                      onClick={() => abrirDetalleCotizacion(seguro.id)}
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
                            disabled={paginaSeguroActual === totalPaginasSeguros - 1}
                            aria-label="Ver seguros siguientes"
                          >
                            ›
                          </button>
                        )}
                      </div>

                      {mostrarFlechasSeguros && (
                        <div className="pc-seguros-carousel-dots" aria-label="Indicador de seguros disponibles">
                          {Array.from({ length: totalPaginasSeguros }).map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              className={paginaSeguroActual === index ? "active" : ""}
                              onClick={() => irASlideSeguro(index)}
                              aria-label={`Ir al grupo de seguros ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="pc-seguros-v2-trustbar">
                        <article>
                          <img src="/proteger.png" alt="" />
                          <div>
                            <strong>Acompañamiento experto</strong>
                            <span>Te asesoramos antes, durante y después de contratar.</span>
                          </div>
                        </article>
                        <article>
                          <img src="/beneficios.png" alt="" />
                          <div>
                            <strong>Soluciones a tu medida</strong>
                            <span>Productos diseñados para adaptarse a tus necesidades.</span>
                          </div>
                        </article>
                        <article>
                          <img src="/candado.png" alt="" />
                          <div>
                            <strong>Confianza y respaldo</strong>
                            <span>Trabajamos con las mejores aseguradoras del mercado.</span>
                          </div>
                        </article>
                        <article>
                          <img src="/calendario.png" alt="" />
                          <div>
                            <strong>Respuesta ágil</strong>
                            <span>Cotiza y recibe una propuesta en minutos.</span>
                          </div>
                        </article>
                      </div>
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
                      padding: "0 10px",
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
                  const rutCliente = datosPerfil.rut || localStorage.getItem("rut_cliente") || "—";
                  const correoCliente =
                    datosPerfil.correo || localStorage.getItem("correo_cliente") || "Sin correo registrado";
                  const telefonoCliente =
                    datosPerfil.telefono || localStorage.getItem("telefono_cliente") || "Sin teléfono registrado";
                  const inicialCliente = (datosPerfil.nombre || nombreCliente || "C")
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
                    localStorage.setItem("nombre_cliente", datosPerfil.nombre || "Cliente");
                    localStorage.setItem("correo_cliente", datosPerfil.correo || "");
                    localStorage.setItem("telefono_cliente", datosPerfil.telefono || "");
                    localStorage.setItem("direccion_cliente", datosPerfil.direccion || "");
                    setEditandoPerfil(false);
                    setMensajePerfil(
                      "Datos actualizados correctamente. Cuando conectes backend, este cambio quedará guardado en la cuenta."
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
                      setMensajePerfil("Foto de perfil actualizada correctamente.");
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
                    const codigo = String(Math.floor(100000 + Math.random() * 900000));
                    setCodigoSeguridad(codigo);
                    setCodigoIngresado("");
                    setNuevaClave("");
                    setConfirmarClave("");
                    setPasoClave("codigo");
                    setMensajePerfil(`Código de seguridad generado para prueba frontend: ${codigo}`);
                    setTimeout(() => setMensajePerfil(""), 6500);
                  };

                  const validarCodigo = () => {
                    if (codigoIngresado.trim() !== codigoSeguridad) {
                      setMensajePerfil("El código ingresado no coincide.");
                      setTimeout(() => setMensajePerfil(""), 3500);
                      return;
                    }

                    setPasoClave("clave");
                    setMensajePerfil("Código validado. Ingresa tu nueva contraseña.");
                    setTimeout(() => setMensajePerfil(""), 3500);
                  };

                  const actualizarClave = () => {
                    if (nuevaClave.length < 8) {
                      setMensajePerfil("La contraseña debe tener al menos 8 caracteres.");
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
                      "Contraseña actualizada en modo frontend. Después se conectará al backend con OTP real."
                    );
                    setTimeout(() => setMensajePerfil(""), 5000);
                  };

                  const alternarPreferencia = (clave) => {
                    setPreferenciasPerfil((actual) => ({
                      ...actual,
                      [clave]: !actual[clave],
                    }));
                  };

                  const inputPerfil = (label, campo, tipo = "text", bloqueado = false) => (
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
                          onChange={(event) => actualizarDatoPerfil(campo, event.target.value)}
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
                          background: preferenciasPerfil[clave] ? "#07195a" : "#d9e2ef",
                          display: "flex",
                          justifyContent: preferenciasPerfil[clave] ? "flex-end" : "flex-start",
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
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <strong style={{ fontSize: "34px", fontWeight: 950 }}>{inicialCliente}</strong>
                            )}
                          </div>

                          <div>
                            <small style={{ fontSize: "12px", fontWeight: 850, opacity: 0.8 }}>
                              Mi cuenta
                            </small>
                            <h2 style={{ margin: "4px 0 8px", fontSize: "28px", fontWeight: 950 }}>
                              {datosPerfil.nombre || nombreCliente}
                            </h2>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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
                            onClick={() => (editandoPerfil ? guardarPerfil() : setEditandoPerfil(true))}
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
                            {editandoPerfil ? "Guardar cambios" : "Editar perfil"}
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
                          ["Seguridad", "Protegida", "Código para cambios sensibles"],
                          ["Notificaciones", "Activas", "Preferencias configurables"],
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
                                color: valor === "Activo" ? "#15803d" : "#07195a",
                                fontSize: "20px",
                                fontWeight: 950,
                              }}
                            >
                              {valor}
                            </strong>
                            <span style={{ color: "#667085", fontSize: "11px", fontWeight: 750 }}>
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
                                <h3 style={{ margin: 0, color: "#07195a", fontSize: "19px", fontWeight: 950 }}>
                                  Datos personales
                                </h3>
                                <p style={{ margin: "4px 0 0", color: "#667085", fontSize: "12px", fontWeight: 750 }}>
                                  Edita tus datos y confirma cambios sensibles cuando se conecte el backend.
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
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
                            <h3 style={{ margin: "0 0 12px", color: "#07195a", fontSize: "19px", fontWeight: 950 }}>
                              Preferencias de notificación
                            </h3>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "9px",
                              }}
                            >
                              {switchPerfil("email", "Correo electrónico", "Avisos y comunicaciones generales")}
                              {switchPerfil("whatsapp", "WhatsApp", "Recordatorios y asistencia")}
                              {switchPerfil("vencimientos", "Vencimientos", "Alertas de pólizas y pagos")}
                              {switchPerfil("documentos", "Documentos", "Aviso de documentos disponibles")}
                              {switchPerfil("siniestros", "Siniestros", "Seguimiento de casos")}
                              {switchPerfil("pagos", "Pagos", "Recordatorios de cuotas")}
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
                            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 950 }}>
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
                              Cambia tu contraseña usando un código de seguridad. En backend se enviará por correo o SMS.
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
                            <h3 style={{ margin: "0 0 12px", color: "#07195a", fontSize: "18px", fontWeight: 950 }}>
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
                                <span style={{ color: "#667085", fontSize: "11px", fontWeight: 750 }}>
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
                            <h3 style={{ margin: "0 0 12px", color: "#07195a", fontSize: "18px", fontWeight: 950 }}>
                              Privacidad y documentos
                            </h3>
                            {["Política de privacidad", "Términos del portal", "Consentimiento de datos"].map(
                              (item) => (
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
                                  <span style={{ color: "#667085", fontSize: "11px", fontWeight: 750 }}>
                                    Disponible próximamente
                                  </span>
                                </div>
                              )
                            )}
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
                                <h3 style={{ margin: 0, color: "#07195a", fontSize: "22px", fontWeight: 950 }}>
                                  Cambiar contraseña
                                </h3>
                                <p style={{ margin: "6px 0 0", color: "#667085", fontSize: "13px", fontWeight: 750 }}>
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
                                  Para proteger tu cuenta, primero se genera un código de seguridad.
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
                                  <span style={{ color: "#07195a", fontSize: "12px", fontWeight: 950 }}>
                                    Código de seguridad
                                  </span>
                                  <input
                                    value={codigoIngresado}
                                    onChange={(event) => setCodigoIngresado(event.target.value)}
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
                                  <span style={{ color: "#07195a", fontSize: "12px", fontWeight: 950 }}>
                                    Nueva contraseña
                                  </span>
                                  <input
                                    type="password"
                                    value={nuevaClave}
                                    onChange={(event) => setNuevaClave(event.target.value)}
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
                                  <span style={{ color: "#07195a", fontSize: "12px", fontWeight: 950 }}>
                                    Confirmar contraseña
                                  </span>
                                  <input
                                    type="password"
                                    value={confirmarClave}
                                    onChange={(event) => setConfirmarClave(event.target.value)}
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
              <div
                className="pc-panel pc-full-panel"
                style={{
                  width: "min(calc(100vw - 300px), 1600px)",
                  maxWidth: "1600px",
                  margin: "0 auto",
                  padding: "18px 20px",
                }}
              >
                {(() => {
                  const ICONOS = {
                    upload: "/subir-documento.png",
                    tick: "/tick.png",
                    reloj: "/reloj-de-arena.png",
                    carpeta: "/carpeta.png",
                    reporte: "/reportar-siniestro.png",
                  };

                  // Cuando se conecte el backend, este arreglo debe venir desde
                  // GET /portal/mis-siniestros. Por ahora se mantiene vacío
                  // para no mostrar casos inventados al cliente.
                  const siniestrosBackend = [];

                  const siniestrosCliente = siniestrosBackend;

                  const CASOS_POR_PAGINA = 5;
                  const totalSiniestros = siniestrosCliente.length;
                  const totalPaginasSiniestros = Math.max(
                    1,
                    Math.ceil(totalSiniestros / CASOS_POR_PAGINA)
                  );
                  const paginaActualSiniestros = Math.min(
                    paginaSiniestros,
                    totalPaginasSiniestros
                  );
                  const indiceInicioSiniestros =
                    (paginaActualSiniestros - 1) * CASOS_POR_PAGINA;
                  const indiceFinSiniestros = indiceInicioSiniestros + CASOS_POR_PAGINA;
                  const siniestrosPaginados = siniestrosCliente.slice(
                    indiceInicioSiniestros,
                    indiceFinSiniestros
                  );
                  const desdeSiniestro =
                    totalSiniestros === 0 ? 0 : indiceInicioSiniestros + 1;
                  const hastaSiniestro = Math.min(indiceFinSiniestros, totalSiniestros);

                  const polizasReportables = polizas.map((poliza, index) => ({
                    id: String(poliza.id_poliza || poliza.numero_poliza || index),
                    idPoliza: poliza.id_poliza || null,
                    nombre: poliza.seguro?.nombre || poliza.nombre || "Seguro contratado",
                    categoria: poliza.seguro?.categoria || poliza.categoria || "Pólizas vigentes",
                    poliza: poliza.numero_poliza || `Póliza ${index + 1}`,
                    compania: poliza.compania || "Compañía pendiente",
                    estado: poliza.estado || "vigente",
                  }));

                  const polizaSeleccionada =
                    polizasReportables.find((item) => item.id === polizaReporteId) ||
                    polizasReportables[0];

                  const siniestroPorPoliza = siniestrosCliente.find(
                    (item) => item.poliza === polizaSeleccionada?.poliza
                  );

                  const siniestroSeleccionado =
                    siniestrosCliente.find((item) => item.id === siniestroSeleccionadoId) ||
                    siniestroPorPoliza ||
                    null;

                  const etapaActual = siniestroSeleccionado?.etapaActual || (reporteSiniestroActivo ? 1 : 0);

                  const categoriasReportables = polizasReportables.reduce((acc, item) => {
                    if (!acc[item.categoria]) acc[item.categoria] = [];
                    acc[item.categoria].push(item);
                    return acc;
                  }, {});

                  const seleccionarPoliza = (idPoliza) => {
                    setPolizaReporteId(idPoliza);
                    setReporteSiniestroActivo(false);
                    setPaginaSiniestros(1);

                    const nuevaPoliza = polizasReportables.find((item) => item.id === idPoliza);
                    const caso = siniestrosCliente.find((item) => item.poliza === nuevaPoliza?.poliza);
                    setSiniestroSeleccionadoId(caso?.id || "");
                  };

                  const seleccionarCaso = (caso) => {
                    setSiniestroSeleccionadoId(caso.id);
                    const polizaCaso = polizasReportables.find((item) => item.poliza === caso.poliza);
                    if (polizaCaso) setPolizaReporteId(polizaCaso.id);
                    setReporteSiniestroActivo(false);
                  };

                  const reportarSiniestro = () => {
                    if (!polizaSeleccionada) return;
                    setReporteSiniestroActivo(true);
                    const caso = siniestrosCliente.find((item) => item.poliza === polizaSeleccionada.poliza);
                    setSiniestroSeleccionadoId(caso?.id || "");
                  };

                  const datosClienteFormulario = {
                    nombre: datosPerfil.nombre || nombreCliente || "Cliente",
                    rut: datosPerfil.rut || localStorage.getItem("rut_cliente") || "12.456.789-3",
                    correo: datosPerfil.correo || localStorage.getItem("correo_cliente") || "",
                    telefono: datosPerfil.telefono || localStorage.getItem("telefono_cliente") || "",
                    direccion: datosPerfil.direccion || localStorage.getItem("direccion_cliente") || "",
                  };

                  const abrirFormularioSiniestro = (modo = "digital") => {
                    setModoFormularioSiniestro(modo);
                    setMensajeFormularioSiniestro("");
                    setFormularioSiniestroAbierto(true);
                  };

                  const cerrarFormularioSiniestro = () => {
                    setFormularioSiniestroAbierto(false);
                    setModoFormularioSiniestro("digital");
                    setMensajeFormularioSiniestro("");
                  };

                  const actualizarFormularioSiniestro = (campo, valor) => {
                    setFormularioSiniestro((actual) => ({
                      ...actual,
                      [campo]: valor,
                    }));
                  };

                  const escapeHtmlSiniestro = (valor) =>
                    String(valor || "")
                      .replaceAll("&", "&amp;")
                      .replaceAll("<", "&lt;")
                      .replaceAll(">", "&gt;")
                      .replaceAll('"', "&quot;")
                      .replaceAll("'", "&#039;");

                  const generarHtmlFormularioSiniestro = (opciones = {}) => {
                    const formularioPDF = opciones.enBlanco ? {} : formularioSiniestro;
                    const datosClientePDF = opciones.enBlanco ? {} : datosClienteFormulario;
                    const anexosPDF = opciones.enBlanco
                      ? []
                      : Array.isArray(archivoRespaldoSiniestro)
                        ? archivoRespaldoSiniestro
                        : archivoRespaldoSiniestro
                          ? [archivoRespaldoSiniestro]
                          : [];
                    const v = (valor) => escapeHtmlSiniestro(valor || "");
                    const polizaActual = opciones.enBlanco ? "" : (polizaSeleccionada?.poliza || "");
                    const seguroActual = opciones.enBlanco ? "" : (polizaSeleccionada?.nombre || "");
                    const companiaActual = opciones.enBlanco ? "" : (polizaSeleccionada?.compania || "");
                    const fechaEmision = new Date().toLocaleDateString("es-CL");
                    const horaEmision = new Date().toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const campo = (label, value) => `
                      <div class="field">
                        <span>${label}</span>
                        <strong>${v(value) || "—"}</strong>
                      </div>
                    `;

                    const fila = (label, value) => `
                      <div class="row-field">
                        <span>${label}</span>
                        <strong>${v(value) || "—"}</strong>
                      </div>
                    `;

                    return `
                      <!doctype html>
                      <html lang="es">
                        <head>
                          <meta charset="utf-8" />
                          <title>Formulario Denuncio de Siniestro</title>
                          <style>
                            * { box-sizing: border-box; }

                            @page {
                              size: A4;
                              margin: 12mm;
                            }

                            body {
                              margin: 0;
                              background: #eef2f8;
                              color: #07195a;
                              font-family: Arial, Helvetica, sans-serif;
                              -webkit-print-color-adjust: exact;
                              print-color-adjust: exact;
                            }

                            .sheet {
                              width: 210mm;
                              min-height: 297mm;
                              margin: 0 auto;
                              background: #ffffff;
                              overflow: hidden;
                              box-shadow: 0 22px 70px rgba(7, 25, 90, 0.16);
                            }

                            .hero {
                              position: relative;
                              padding: 28px 34px 24px;
                              display: grid;
                              grid-template-columns: 150px 1fr 190px;
                              gap: 22px;
                              align-items: center;
                              background: linear-gradient(135deg, #07195a 0%, #031344 72%);
                              color: #ffffff;
                            }

                            .hero::after {
                              content: "";
                              position: absolute;
                              right: -90px;
                              top: -120px;
                              width: 260px;
                              height: 260px;
                              border-radius: 999px;
                              background: rgba(244, 124, 32, 0.28);
                            }

                            .logo-box {
                              position: relative;
                              z-index: 2;
                              width: 120px;
                              min-height: 82px;
                              padding: 13px;
                              display: grid;
                              place-items: center;
                              background: #ffffff;
                              border-radius: 18px;
                              box-shadow: 0 14px 35px rgba(0, 0, 0, 0.16);
                            }

                            .logo-box img {
                              width: 95px;
                              height: auto;
                              object-fit: contain;
                            }

                            .hero-title {
                              position: relative;
                              z-index: 2;
                            }

                            .hero-title small {
                              display: inline-flex;
                              padding: 7px 12px;
                              margin-bottom: 10px;
                              border-radius: 999px;
                              background: #f47c20;
                              color: #ffffff;
                              font-size: 9px;
                              font-weight: 900;
                              letter-spacing: .08em;
                              text-transform: uppercase;
                            }

                            .hero-title h1 {
                              margin: 0;
                              font-size: 24px;
                              line-height: 1.08;
                              letter-spacing: .02em;
                              text-transform: uppercase;
                            }

                            .hero-title p {
                              margin: 8px 0 0;
                              color: rgba(255, 255, 255, 0.78);
                              font-size: 10px;
                              line-height: 1.45;
                            }

                            .case-box {
                              position: relative;
                              z-index: 2;
                              display: grid;
                              gap: 8px;
                            }

                            .case-box div {
                              padding: 10px 12px;
                              border-radius: 12px;
                              background: rgba(255, 255, 255, 0.11);
                              border: 1px solid rgba(255, 255, 255, 0.22);
                            }

                            .case-box span {
                              display: block;
                              color: rgba(255, 255, 255, 0.72);
                              font-size: 8px;
                              font-weight: 900;
                              text-transform: uppercase;
                              letter-spacing: .08em;
                            }

                            .case-box strong {
                              display: block;
                              min-height: 13px;
                              margin-top: 3px;
                              color: #ffffff;
                              font-size: 11px;
                              font-weight: 900;
                            }

                            .content {
                              padding: 24px 28px 30px;
                            }

                            .summary-grid {
                              display: grid;
                              grid-template-columns: repeat(4, 1fr);
                              gap: 10px;
                              margin-bottom: 18px;
                            }

                            .field,
                            .row-field,
                            .mini-field {
                              border: 1px solid #dfe6f3;
                              background: #f8faff;
                              border-radius: 14px;
                              padding: 10px 12px;
                              min-height: 54px;
                            }

                            .field span,
                            .row-field span,
                            .mini-field span {
                              display: block;
                              margin-bottom: 5px;
                              color: #64708a;
                              font-size: 8px;
                              font-weight: 900;
                              letter-spacing: .05em;
                              text-transform: uppercase;
                            }

                            .field strong,
                            .row-field strong,
                            .mini-field strong {
                              display: block;
                              color: #07195a;
                              font-size: 10.5px;
                              line-height: 1.25;
                              font-weight: 900;
                              word-break: break-word;
                            }

                            .section {
                              margin-top: 15px;
                              border: 1px solid #e3e9f4;
                              border-radius: 18px;
                              overflow: hidden;
                              break-inside: avoid;
                            }

                            .section-title {
                              padding: 11px 15px;
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              background: linear-gradient(90deg, #07195a, #10307e);
                              color: #ffffff;
                            }

                            .section-title h2 {
                              margin: 0;
                              font-size: 12px;
                              line-height: 1;
                              text-transform: uppercase;
                              letter-spacing: .04em;
                            }

                            .section-title span {
                              color: #ffd7bd;
                              font-size: 8px;
                              font-weight: 900;
                            }

                            .section-body {
                              padding: 13px;
                              display: grid;
                              gap: 9px;
                              background: #ffffff;
                            }

                            .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
                            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
                            .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }

                            .relato-box {
                              min-height: 110px;
                              padding: 13px;
                              border: 1px solid #dfe6f3;
                              border-radius: 14px;
                              background: #fbfcff;
                              color: #07195a;
                              font-size: 10.5px;
                              line-height: 1.55;
                              white-space: pre-wrap;
                            }

                            .option-grid {
                              display: grid;
                              grid-template-columns: repeat(4, 1fr);
                              gap: 8px;
                            }

                            .option {
                              padding: 9px;
                              border: 1px solid #dfe6f3;
                              border-radius: 12px;
                              background: #ffffff;
                              color: #07195a;
                              font-size: 8.5px;
                              font-weight: 900;
                              min-height: 42px;
                            }

                            .option.active {
                              border-color: #f47c20;
                              background: #fff3ea;
                              color: #f47c20;
                            }

                            .signature {
                              margin-top: 25px;
                              display: grid;
                              grid-template-columns: 1fr 1fr;
                              gap: 18px;
                              align-items: end;
                            }

                            .signature-card {
                              min-height: 72px;
                              padding: 15px;
                              border: 1px dashed #aab5c9;
                              border-radius: 16px;
                              background: #fbfcff;
                              display: flex;
                              flex-direction: column;
                              justify-content: flex-end;
                            }

                            .signature-line {
                              height: 1px;
                              background: #07195a;
                              margin-bottom: 8px;
                            }

                            .signature-card strong {
                              color: #07195a;
                              font-size: 9px;
                              text-align: center;
                              text-transform: uppercase;
                            }

                            .footer-note {
                              margin-top: 18px;
                              padding-top: 12px;
                              border-top: 1px solid #e6eaf4;
                              display: flex;
                              justify-content: space-between;
                              gap: 12px;
                              color: #64708a;
                              font-size: 8.5px;
                              line-height: 1.45;
                            }

                            @media print {
                              body { background: #ffffff; }
                              .sheet {
                                width: 100%;
                                min-height: auto;
                                box-shadow: none;
                              }
                              .content { padding: 18px 22px 22px; }
                              .section { break-inside: avoid; }
                            }
                          </style>
                        </head>
                        <body>
                          <main class="sheet">
                            <header class="hero">
                              <div class="logo-box">
                                <img src="/Logo Prieto.png" alt="Prieto & Correa" />
                              </div>

                              <div class="hero-title">
                                <small>Denuncia de siniestro</small>
                                <h1>Formulario Denuncio de Siniestro</h1>
                                <p>Documento generado desde el Portal Clientes de Prieto & Correa Seguros.</p>
                              </div>

                              <div class="case-box">
                                <div><span>N° Siniestro</span><strong>${v(formularioPDF.numeroSiniestro)}</strong></div>
                                <div><span>Liquidador</span><strong>${v(formularioPDF.liquidador)}</strong></div>
                              </div>
                            </header>

                            <section class="content">
                              <section class="section">
                                <div class="section-title"><h2>Datos generales</h2><span>Emisión ${v(fechaEmision)} · ${v(horaEmision)}</span></div>
                                <div class="section-body grid-4">
                                  ${campo("Póliza", polizaActual)}
                                  ${campo("Seguro", seguroActual)}
                                  ${campo("Compañía", companiaActual)}
                                  ${campo("Siniestro día", formularioPDF.siniestroDia || fechaFormateada(formularioPDF.fechaSiniestro))}
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes del asegurado</h2><span>Datos precargados del portal</span></div>
                                <div class="section-body">
                                  <div class="grid-2">
                                    ${campo("Nombre", datosClientePDF.nombre)}
                                    ${campo("R.U.T", datosClientePDF.rut)}
                                  </div>
                                  <div class="grid-3">
                                    ${campo("Dirección", formularioPDF.aseguradoDireccion || datosClientePDF.direccion)}
                                    ${campo("Ciudad", formularioPDF.aseguradoCiudad || formularioPDF.ciudadOcurrencia)}
                                    ${campo("Denunciante", formularioPDF.denunciante || datosClientePDF.nombre)}
                                  </div>
                                  <div class="grid-3">
                                    ${campo("R.U.T denunciante", formularioPDF.denuncianteRut || datosClientePDF.rut)}
                                    ${campo("Teléfono", datosClientePDF.telefono)}
                                    ${campo("E-mail", datosClientePDF.correo)}
                                  </div>
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes del conductor</h2><span>Información declarada</span></div>
                                <div class="section-body">
                                  <div class="grid-3">
                                    ${campo("Nombre", formularioPDF.conductorNombre)}
                                    ${campo("R.U.T", formularioPDF.conductorRut)}
                                    ${campo("Teléfono", formularioPDF.conductorTelefono)}
                                  </div>
                                  <div class="grid-3">
                                    ${campo("Dirección", formularioPDF.conductorDireccion)}
                                    ${campo("Ciudad", formularioPDF.conductorCiudad)}
                                    ${campo("Región", formularioPDF.conductorRegion)}
                                  </div>
                                  <div class="grid-4">
                                    ${campo("Comuna", formularioPDF.conductorComuna)}
                                    ${campo("N° licencia", formularioPDF.licenciaNumero)}
                                    ${campo("Vigencia licencia", formularioPDF.licenciaVigencia)}
                                    ${campo("Clase / Edad", `${formularioPDF.licenciaClase || ""} ${formularioPDF.conductorEdad ? "/ " + formularioPDF.conductorEdad : ""}`)}
                                  </div>
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes del vehículo</h2><span>Vehículo asociado al siniestro</span></div>
                                <div class="section-body grid-4">
                                  ${campo("Marca", formularioPDF.vehiculoMarca)}
                                  ${campo("Modelo", formularioPDF.vehiculoModelo)}
                                  ${campo("Año", formularioPDF.vehiculoAnio)}
                                  ${campo("Patente", formularioPDF.vehiculoPatente)}
                                  ${campo("N° de motor", formularioPDF.vehiculoMotor)}
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes del siniestro</h2><span>Ocurrencia y relato</span></div>
                                <div class="section-body">
                                  <div class="grid-4">
                                    ${campo("Dirección de ocurrencia", formularioPDF.direccionOcurrencia)}
                                    ${campo("Ciudad", formularioPDF.ciudadOcurrencia)}
                                    ${campo("Región", formularioPDF.regionOcurrencia)}
                                    ${campo("Hora ocurrencia", formularioPDF.horaSiniestro)}
                                  </div>
                                  <div>
                                    <div class="mini-field"><span>Relato de los hechos</span></div>
                                    <div class="relato-box">${v(formularioPDF.relatoHechos) || "—"}</div>
                                  </div>
                                  ${fila("Lugar de inspección: dónde se encuentra el vehículo", formularioPDF.lugarInspeccion)}
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Daños al vehículo</h2><span>Selección declarada por el asegurado</span></div>
                                <div class="section-body">
                                  <div class="option-grid">
                                    <div class="option ${formularioPDF.tipoDano === "Daños materiales" ? "active" : ""}">1. Daños materiales</div>
                                    <div class="option ${formularioPDF.tipoDano === "Robo del vehículo" ? "active" : ""}">2. Robo del vehículo</div>
                                    <div class="option ${formularioPDF.tipoDano === "Robo de accesorios" ? "active" : ""}">3. Robo de accesorios</div>
                                    <div class="option ${formularioPDF.tipoDano === "Robo de partes o piezas" ? "active" : ""}">4. Robo de partes o piezas</div>
                                  </div>
                                  <div class="grid-3">
                                    ${campo("Partes afectadas", formularioPDF.partesAfectadas)}
                                    ${campo("Magnitud de daños", formularioPDF.magnitudDanos)}
                                  </div>
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes del tercero</h2><span>En caso de existir</span></div>
                                <div class="section-body">
                                  <div class="grid-4">
                                    ${campo("Existe tercero", formularioPDF.existeTercero)}
                                    ${campo("Reclama", formularioPDF.terceroReclama)}
                                    ${campo("Con seguro de daños", formularioPDF.terceroSeguro)}
                                    ${campo("Compañía", formularioPDF.terceroCompania)}
                                  </div>
                                  <div class="grid-3">
                                    ${campo("3° culpable", formularioPDF.terceroCulpable)}
                                    ${campo("Daño del 3°", formularioPDF.terceroDano)}
                                    ${campo("Nombre tercero", formularioPDF.terceroNombre)}
                                  </div>
                                  <div class="grid-3">
                                    ${campo("R.U.T tercero", formularioPDF.terceroRut)}
                                    ${campo("Dirección", formularioPDF.terceroDireccion)}
                                    ${campo("Ciudad", formularioPDF.terceroCiudad)}
                                  </div>
                                  <div class="grid-4">
                                    ${campo("Teléfono", formularioPDF.terceroTelefono)}
                                    ${campo("E-mail", formularioPDF.terceroEmail)}
                                    ${campo("Patente", formularioPDF.terceroPatente)}
                                  </div>
                                  <div class="grid-2">
                                    ${campo("Marca vehículo tercero", formularioPDF.terceroVehiculo)}
                                    ${campo("Modelo", formularioPDF.terceroModelo)}
                                  </div>
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Antecedentes legales</h2><span>Constancia o denuncia policial obligatoria</span></div>
                                <div class="section-body grid-3">
                                  ${campo("Comisaría", formularioPDF.comisaria)}
                                  ${campo("N° Parte Policial", formularioPDF.folio)}
                                  ${campo("Fecha", formularioPDF.fechaDenuncia)}
                                  ${campo("Juzgado", formularioPDF.juzgado)}
                                  ${campo("Citación", formularioPDF.citacion)}
                                  ${campo("Alcoholemia", formularioPDF.alcoholemia)}
                                </div>
                              </section>

                              <section class="section">
                                <div class="section-title"><h2>Anexos</h2><span>Respaldos adjuntados por el cliente</span></div>
                                <div class="section-body">
                                  ${
                                    anexosPDF.length
                                      ? `<div class="grid-2">${anexosPDF.map((archivo, index) => campo(`Anexo ${index + 1}`, archivo.name || "Archivo adjunto")).join("")}</div>`
                                      : fila("Archivos adjuntos", "Sin anexos adjuntos")
                                  }
                                </div>
                              </section>

                              <div class="signature">
                                <div class="signature-card">
                                  <div class="signature-line"></div>
                                  <strong>Firma asegurado</strong>
                                </div>
                                <div class="signature-card">
                                  <div class="signature-line"></div>
                                  <strong>Recepción ejecutivo comercial</strong>
                                </div>
                              </div>

                              <div class="footer-note">
                                <p>Este documento fue generado digitalmente desde el Portal Clientes de Prieto & Correa Seguros. La información declarada debe ser respaldada con fotografías, constancia policial, documentos y otros antecedentes cuando corresponda.</p>
                                <p><strong>Prieto & Correa Seguros</strong><br/>Formulario de denuncia de siniestro.</p>
                              </div>
                            </section>
                          </main>
                        </body>
                      </html>
                    `;
                  };

                  const cargarHtml2PdfSiniestro = () =>
                    new Promise((resolve, reject) => {
                      if (window.html2pdf) {
                        resolve(window.html2pdf);
                        return;
                      }

                      const scriptExistente = document.querySelector('script[data-pc-html2pdf="true"]');

                      if (scriptExistente) {
                        scriptExistente.addEventListener("load", () => resolve(window.html2pdf));
                        scriptExistente.addEventListener("error", reject);
                        return;
                      }

                      const script = document.createElement("script");
                      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                      script.async = true;
                      script.dataset.pcHtml2pdf = "true";
                      script.onload = () => resolve(window.html2pdf);
                      script.onerror = () => reject(new Error("No se pudo cargar el generador PDF visual."));
                      document.body.appendChild(script);
                    });

                  const crearPdfVisualFormularioSiniestro = async (opciones = {}) => {
                    const html2pdf = await cargarHtml2PdfSiniestro();
                    const iframe = document.createElement("iframe");

                    iframe.style.position = "fixed";
                    iframe.style.left = "-99999px";
                    iframe.style.top = "0";
                    iframe.style.width = "794px";
                    iframe.style.height = "1123px";
                    iframe.style.border = "0";
                    iframe.setAttribute("aria-hidden", "true");
                    document.body.appendChild(iframe);

                    const html = generarHtmlFormularioSiniestro(opciones);
                    const documento = iframe.contentDocument || iframe.contentWindow.document;
                    documento.open();
                    documento.write(html);
                    documento.close();

                    await new Promise((resolve) => {
                      setTimeout(resolve, 450);
                    });

                    const hoja = documento.querySelector(".sheet") || documento.body;
                    const opcionesPdf = {
                      margin: [0, 0, 0, 0],
                      filename: opciones.nombreArchivo || "Formulario_Siniestro_Prieto_Correa.pdf",
                      image: { type: "jpeg", quality: 0.98 },
                      html2canvas: {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: "#ffffff",
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 794,
                      },
                      jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait",
                      },
                      pagebreak: {
                        mode: ["css", "legacy"],
                        avoid: [".section", ".field", ".signature-card"],
                      },
                    };

                    try {
                      return await html2pdf().set(opcionesPdf).from(hoja).outputPdf("blob");
                    } finally {
                      iframe.remove();
                    }
                  };

                  const limpiarTextoPdfSiniestro = (valor) =>
                    String(valor || "")
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^\x20-\x7E]/g, "")
                      .replace(/\s+/g, " ")
                      .trim();

                  const escaparPdfSiniestro = (texto) =>
                    limpiarTextoPdfSiniestro(texto)
                      .replace(/\\/g, "\\\\")
                      .replace(/\(/g, "\\(")
                      .replace(/\)/g, "\\)");

                  const dividirLineaPdfSiniestro = (texto, maximo = 42) => {
                    const palabras = limpiarTextoPdfSiniestro(texto).split(" ").filter(Boolean);
                    const lineas = [];
                    let linea = "";

                    palabras.forEach((palabra) => {
                      const candidata = linea ? `${linea} ${palabra}` : palabra;
                      if (candidata.length > maximo) {
                        if (linea) lineas.push(linea);
                        linea = palabra;
                      } else {
                        linea = candidata;
                      }
                    });

                    if (linea) lineas.push(linea);
                    return lineas.length ? lineas : [""];
                  };
                  const cargarLogoPdfSiniestro = (url = "/Logo Prieto.png") =>
                    new Promise((resolve) => {
                      const imagen = new Image();
                      imagen.crossOrigin = "anonymous";

                      imagen.onload = () => {
                        try {
                          const origen = document.createElement("canvas");
                          origen.width = imagen.naturalWidth;
                          origen.height = imagen.naturalHeight;

                          const ctxOrigen = origen.getContext("2d", { willReadFrequently: true });
                          ctxOrigen.fillStyle = "#ffffff";
                          ctxOrigen.fillRect(0, 0, origen.width, origen.height);
                          ctxOrigen.drawImage(imagen, 0, 0);

                          const pixels = ctxOrigen.getImageData(0, 0, origen.width, origen.height).data;
                          let minX = origen.width;
                          let minY = origen.height;
                          let maxX = 0;
                          let maxY = 0;

                          for (let yPix = 0; yPix < origen.height; yPix += 1) {
                            for (let xPix = 0; xPix < origen.width; xPix += 1) {
                              const i = (yPix * origen.width + xPix) * 4;
                              const r = pixels[i];
                              const g = pixels[i + 1];
                              const b = pixels[i + 2];
                              const a = pixels[i + 3];

                              const esBlanco = r > 245 && g > 245 && b > 245;
                              const esTransparente = a < 20;

                              if (!esBlanco && !esTransparente) {
                                minX = Math.min(minX, xPix);
                                minY = Math.min(minY, yPix);
                                maxX = Math.max(maxX, xPix);
                                maxY = Math.max(maxY, yPix);
                              }
                            }
                          }

                          if (minX > maxX || minY > maxY) {
                            resolve(null);
                            return;
                          }

                          const padding = 8;
                          minX = Math.max(0, minX - padding);
                          minY = Math.max(0, minY - padding);
                          maxX = Math.min(origen.width - 1, maxX + padding);
                          maxY = Math.min(origen.height - 1, maxY + padding);

                          const cropW = maxX - minX + 1;
                          const cropH = maxY - minY + 1;
                          const maxAncho = 86;
                          const maxAlto = 38;
                          const proporcion = Math.min(maxAncho / cropW, maxAlto / cropH);
                          const ancho = Math.max(1, Math.round(cropW * proporcion));
                          const alto = Math.max(1, Math.round(cropH * proporcion));

                          const canvas = document.createElement("canvas");
                          canvas.width = ancho * 3;
                          canvas.height = alto * 3;

                          const ctx = canvas.getContext("2d");
                          ctx.fillStyle = "#ffffff";
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(origen, minX, minY, cropW, cropH, 0, 0, canvas.width, canvas.height);

                          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
                          const base64 = dataUrl.split(",")[1];
                          resolve({
                            ancho,
                            alto,
                            canvasAncho: canvas.width,
                            canvasAlto: canvas.height,
                            binario: atob(base64),
                          });
                        } catch {
                          resolve(null);
                        }
                      };

                      imagen.onerror = () => resolve(null);
                      imagen.src = url;
                    });

                  const crearPdfSiniestro = async (opciones = {}) => {
                    const formularioPDF = opciones.enBlanco ? {} : formularioSiniestro;
                    const datosClientePDF = opciones.enBlanco ? {} : datosClienteFormulario;
                    const anexosPDF = opciones.enBlanco
                      ? []
                      : Array.isArray(archivoRespaldoSiniestro)
                        ? archivoRespaldoSiniestro
                        : archivoRespaldoSiniestro
                          ? [archivoRespaldoSiniestro]
                          : [];

                    const polizaActual = opciones.enBlanco ? "" : (polizaSeleccionada?.poliza || "");
                    const seguroActual = opciones.enBlanco ? "" : (polizaSeleccionada?.nombre || "");
                    const companiaActual = opciones.enBlanco ? "" : (polizaSeleccionada?.compania || "");
                    const fechaEmision = new Date().toLocaleDateString("es-CL");
                    const horaEmision = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
                    const valor = (dato) => limpiarTextoPdfSiniestro(dato || "Pendiente");
                    const logoPdf = await cargarLogoPdfSiniestro("/Logo Prieto.png");

                    const anchoPagina = 595;
                    const altoPagina = 842;
                    const margen = 34;
                    const anchoContenido = anchoPagina - margen * 2;
                    const margenInferior = 44;
                    const azul = [7, 25, 90];
                    const azulOscuro = [3, 19, 68];
                    const naranjo = [244, 124, 32];
                    const grisFondo = [248, 250, 255];
                    const grisBorde = [218, 226, 241];
                    const textoGris = [88, 101, 127];

                    let paginas = [];
                    let comandos = [];
                    let y = 0;

                    const color = (rgb) => rgb.map((n) => (n / 255).toFixed(3)).join(" ");

                    const rect = (x, yBottom, w, h, fill, stroke = null) => {
                      if (fill) comandos.push(`${color(fill)} rg ${x} ${yBottom} ${w} ${h} re f`);
                      if (stroke) comandos.push(`${color(stroke)} RG 0.8 w ${x} ${yBottom} ${w} ${h} re S`);
                    };

                    const rectRedondeado = (x, yBottom, w, h, r, fill, stroke = null) => {
                      const c = 0.5522847498;
                      const k = r * c;
                      const x2 = x + w;
                      const y2 = yBottom + h;
                      const path = [
                        `${x + r} ${yBottom} m`,
                        `${x2 - r} ${yBottom} l`,
                        `${x2 - r + k} ${yBottom} ${x2} ${yBottom + r - k} ${x2} ${yBottom + r} c`,
                        `${x2} ${y2 - r} l`,
                        `${x2} ${y2 - r + k} ${x2 - r + k} ${y2} ${x2 - r} ${y2} c`,
                        `${x + r} ${y2} l`,
                        `${x + r - k} ${y2} ${x} ${y2 - r + k} ${x} ${y2 - r} c`,
                        `${x} ${yBottom + r} l`,
                        `${x} ${yBottom + r - k} ${x + r - k} ${yBottom} ${x + r} ${yBottom} c`,
                        "h",
                      ].join(" ");

                      if (fill && stroke) {
                        comandos.push(`${color(fill)} rg ${color(stroke)} RG 0.8 w ${path} B`);
                      } else if (fill) {
                        comandos.push(`${color(fill)} rg ${path} f`);
                      } else if (stroke) {
                        comandos.push(`${color(stroke)} RG 0.8 w ${path} S`);
                      }
                    };

                    const imagenPdf = (nombre, x, yBottom, w, h) => {
                      comandos.push(`q ${w} 0 0 ${h} ${x} ${yBottom} cm /${nombre} Do Q`);
                    };

                    const texto = (x, yText, contenido, opcionesTexto = {}) => {
                      const tamano = opcionesTexto.tamano || 9;
                      const fuente = opcionesTexto.negrita ? "/F2" : "/F1";
                      const rgb = opcionesTexto.color || azul;
                      comandos.push(`${color(rgb)} rg BT ${fuente} ${tamano} Tf ${x} ${yText} Td (${escaparPdfSiniestro(contenido)}) Tj ET`);
                    };

                    const cerrarPagina = () => {
                      if (comandos.length) paginas.push(comandos.join("\n"));
                    };
                    const iniciarPagina = () => {
                      comandos = [];

                      rect(0, 0, anchoPagina, altoPagina, [255, 255, 255]);

                      // Encabezado corporativo para PDF carta.
                      // Mantiene el diseño limpio y evita que el título choque con los campos derechos.
                      rect(margen, altoPagina - 96, anchoContenido, 70, azul);

                      const logoY = altoPagina - 79;
                      if (logoPdf) {
                        const logoMaxW = 96;
                        const logoMaxH = 42;
                        const escalaLogo = Math.min(logoMaxW / logoPdf.ancho, logoMaxH / logoPdf.alto, 1);
                        const logoW = logoPdf.ancho * escalaLogo;
                        const logoH = logoPdf.alto * escalaLogo;
                        imagenPdf("ImLogo", margen + 16, logoY + (42 - logoH) / 2 - 3, logoW, logoH);
                      } else {
                        texto(margen + 18, altoPagina - 56, "PRIETO & CORREA", { tamano: 10, negrita: true, color: [255, 255, 255] });
                      }

                      const tituloX = margen + 140;
                      const inputX = margen + anchoContenido - 110;
                      const camposX = inputX - 60;
                      const inputW = 92;
                      const inputH = 16;

                      texto(tituloX, altoPagina - 52, "FORMULARIO DENUNCIO DE SINIESTRO", {
                        tamano: 10.2,
                        negrita: true,
                        color: [255, 255, 255],
                      });

                      texto(tituloX, altoPagina - 68, "Portal Clientes Prieto & Correa Seguros", {
                        tamano: 7.2,
                        color: [255, 255, 255],
                      });

                      texto(tituloX, altoPagina - 84, `Fecha de emision: ${fechaEmision} ${horaEmision}`, {
                        tamano: 6.7,
                        color: [218, 226, 245],
                      });

                      // Campos manuales para completar después de emitir o imprimir.
                      texto(camposX, altoPagina - 54, "N° de Siniestro:", {
                        tamano: 6.7,
                        negrita: true,
                        color: [255, 255, 255],
                      });

                      rect(inputX, altoPagina - 62, inputW, inputH, [255, 255, 255], [220, 226, 238]);

                      texto(camposX, altoPagina - 78, "Estado:", {
                        tamano: 6.7,
                        negrita: true,
                        color: [255, 255, 255],
                      });

                      rect(inputX, altoPagina - 86, inputW, inputH, [255, 255, 255], [220, 226, 238]);

                      y = altoPagina - 116;
                    };

                    const nuevaPagina = () => {
                      cerrarPagina();
                      iniciarPagina();
                    };

                    const asegurarEspacio = (altoNecesario) => {
                      if (y - altoNecesario < margenInferior) nuevaPagina();
                    };

                    iniciarPagina();

                    const seccion = (titulo) => {
                      asegurarEspacio(48);
                      rectRedondeado(margen, y - 26, anchoContenido, 26, 10, [255, 230, 210], null);
                      texto(margen + 12, y - 17, titulo, { tamano: 10, negrita: true, color: azul });
                      y -= 38;
                    };

                    const campoPdf = (x, yTop, w, h, label, value, altoLinea = 10) => {
                      rectRedondeado(x, yTop - h, w, h, 10, grisFondo, grisBorde);
                      texto(x + 9, yTop - 13, label, { tamano: 6.5, negrita: true, color: textoGris });
                      const maximo = Math.max(18, Math.floor(w / 5.2));
                      const lineas = dividirLineaPdfSiniestro(valor(value), maximo).slice(0, Math.max(1, Math.floor((h - 21) / altoLinea)));
                      lineas.forEach((linea, index) => {
                        texto(x + 9, yTop - 28 - (index * altoLinea), linea, { tamano: 8.5, negrita: true, color: azul });
                      });
                    };

                    const filaCampos = (campos, columnas = 3, alto = 48) => {
                      asegurarEspacio(alto + 10);
                      const gap = 10;
                      const w = (anchoContenido - gap * (columnas - 1)) / columnas;
                      campos.forEach((item, index) => {
                        const x = margen + (w + gap) * index;
                        campoPdf(x, y, w, alto, item[0], item[1], item[2] || 10);
                      });
                      y -= alto + 10;
                    };

                    const cuadroTexto = (label, value, alto = 76) => {
                      asegurarEspacio(alto + 10);
                      campoPdf(margen, y, anchoContenido, alto, label, value, 10);
                      y -= alto + 10;
                    };

                    seccion("DATOS GENERALES");
                    filaCampos([
                      ["N Siniestro", formularioPDF.numeroSiniestro],
                      ["Liquidador", formularioPDF.liquidador],
                      ["Poliza asociada", polizaActual],
                    ]);
                    filaCampos([
                      ["Seguro", seguroActual],
                      ["Compania", companiaActual],
                      ["Item", formularioPDF.polizaItem],
                    ]);
                    filaCampos([
                      ["Fecha del siniestro", formularioPDF.fechaSiniestro],
                      ["Hora ocurrencia", formularioPDF.horaSiniestro],
                      ["Fecha emision", `${fechaEmision} ${horaEmision}`],
                    ]);

                    seccion("ANTECEDENTES DEL ASEGURADO");
                    filaCampos([
                      ["Nombre", datosClientePDF.nombre],
                      ["R.U.T", datosClientePDF.rut],
                      ["Telefono", datosClientePDF.telefono],
                    ]);
                    filaCampos([
                      ["E-mail", datosClientePDF.correo],
                      ["Direccion", formularioPDF.aseguradoDireccion || datosClientePDF.direccion],
                      ["Ciudad", formularioPDF.aseguradoCiudad || formularioPDF.ciudadOcurrencia],
                    ]);
                    filaCampos([
                      ["Denunciante", formularioPDF.denunciante || datosClientePDF.nombre],
                      ["R.U.T denunciante", formularioPDF.denuncianteRut || datosClientePDF.rut],
                      ["Telefono contacto", datosClientePDF.telefono],
                    ]);

                    seccion("ANTECEDENTES DEL CONDUCTOR");
                    filaCampos([
                      ["Nombre", formularioPDF.conductorNombre],
                      ["R.U.T", formularioPDF.conductorRut],
                      ["Telefono", formularioPDF.conductorTelefono],
                    ]);
                    filaCampos([
                      ["Direccion", formularioPDF.conductorDireccion],
                      ["Ciudad", formularioPDF.conductorCiudad],
                      ["Region", formularioPDF.conductorRegion],
                    ]);
                    filaCampos([
                      ["Comuna", formularioPDF.conductorComuna],
                      ["N licencia", formularioPDF.licenciaNumero],
                      ["Vigencia licencia", formularioPDF.licenciaVigencia],
                    ]);
                    filaCampos([
                      ["Clase licencia", formularioPDF.licenciaClase],
                      ["Edad", formularioPDF.conductorEdad],
                      ["Relacion con asegurado", formularioPDF.relacionConductor],
                    ]);

                    seccion("ANTECEDENTES DEL VEHICULO");
                    filaCampos([
                      ["Marca", formularioPDF.vehiculoMarca],
                      ["Modelo", formularioPDF.vehiculoModelo],
                      ["Ano", formularioPDF.vehiculoAnio],
                    ]);
                    filaCampos([
                      ["Patente", formularioPDF.vehiculoPatente],
                      ["N motor", formularioPDF.vehiculoMotor],
                      ["Color", formularioPDF.vehiculoColor],
                    ]);

                    seccion("ANTECEDENTES DEL SINIESTRO");
                    filaCampos([
                      ["Direccion ocurrencia", formularioPDF.direccionOcurrencia],
                      ["Ciudad", formularioPDF.ciudadOcurrencia],
                      ["Region", formularioPDF.regionOcurrencia],
                    ]);
                    filaCampos([
                      ["Hora ocurrencia", formularioPDF.horaSiniestro],
                      ["Lugar inspeccion", formularioPDF.lugarInspeccion],
                      ["Siniestro dia", formularioPDF.siniestroDia || fechaFormateada(formularioPDF.fechaSiniestro)],
                    ]);
                    cuadroTexto("Relato de los hechos", formularioPDF.relatoHechos, 86);

                    seccion("DANOS AL VEHICULO");
                    filaCampos([
                      ["Tipo de danos", formularioPDF.tipoDano],
                      ["Partes afectadas", formularioPDF.partesAfectadas],
                      ["Magnitud de danos", formularioPDF.magnitudDanos],
                    ]);

                    seccion("IDENTIFICACION DEL TERCERO");
                    filaCampos([
                      ["Existe tercero", formularioPDF.existeTercero],
                      ["Reclama", formularioPDF.terceroReclama],
                      ["Con seguro de danos", formularioPDF.terceroSeguro],
                    ]);
                    filaCampos([
                      ["Nombre", formularioPDF.terceroNombre],
                      ["R.U.T", formularioPDF.terceroRut],
                      ["Telefono", formularioPDF.terceroTelefono],
                    ]);
                    filaCampos([
                      ["E-mail", formularioPDF.terceroEmail],
                      ["Direccion", formularioPDF.terceroDireccion],
                      ["Ciudad", formularioPDF.terceroCiudad],
                    ]);
                    filaCampos([
                      ["Marca vehiculo", formularioPDF.terceroVehiculo],
                      ["Modelo", formularioPDF.terceroModelo],
                      ["Patente", formularioPDF.terceroPatente],
                    ]);

                    seccion("ANTECEDENTES LEGALES");
                    filaCampos([
                      ["Comisaria", formularioPDF.comisaria],
                      ["N Parte Policial", formularioPDF.folio],
                      ["Fecha", formularioPDF.fechaDenuncia],
                    ]);
                    filaCampos([
                      ["Juzgado", formularioPDF.juzgado],
                      ["Citacion", formularioPDF.citacion],
                      ["Alcoholemia", formularioPDF.alcoholemia],
                    ]);
                    cuadroTexto("Observaciones", formularioPDF.observaciones, 64);

                    seccion("ANEXOS");
                    if (anexosPDF.length) {
                      anexosPDF.forEach((archivo, index) => {
                        filaCampos([[`Anexo ${index + 1}`, archivo.name || "Archivo adjunto"]], 1, 42);
                      });
                    } else {
                      filaCampos([["Archivos adjuntos", "Sin anexos adjuntos"]], 1, 42);
                    }

                    asegurarEspacio(82);
                    y -= 8;
                    const firmaW = (anchoContenido - 22) / 2;
                    rectRedondeado(margen, y - 54, firmaW, 54, 12, [255, 255, 255], grisBorde);
                    rectRedondeado(margen + firmaW + 22, y - 54, firmaW, 54, 12, [255, 255, 255], grisBorde);
                    texto(margen + 20, y - 26, "Firma asegurado", { tamano: 9, negrita: true, color: azul });
                    texto(margen + firmaW + 42, y - 26, "Recepcion ejecutivo comercial", { tamano: 9, negrita: true, color: azul });
                    y -= 70;

                    asegurarEspacio(52);
                    rectRedondeado(margen, y - 42, anchoContenido, 42, 12, [248, 250, 255], grisBorde);
                    texto(margen + 12, y - 17, "Documento generado digitalmente desde el Portal Clientes de Prieto & Correa Seguros.", { tamano: 8, color: textoGris });
                    texto(margen + 12, y - 31, "La informacion declarada debe ser respaldada con fotografias, constancias, presupuestos o informes.", { tamano: 8, color: textoGris });

                    cerrarPagina();

                    let objetos = [];
                    const agregarObjeto = (contenido) => {
                      objetos.push(contenido);
                      return objetos.length;
                    };

                    const catalogoId = agregarObjeto("<< /Type /Catalog /Pages 2 0 R >>");
                    const pagesPlaceholderId = agregarObjeto("PAGES_PLACEHOLDER");
                    const fontRegularId = agregarObjeto("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
                    const fontBoldId = agregarObjeto("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
                    const logoObjetoId = logoPdf
                      ? agregarObjeto(`<< /Type /XObject /Subtype /Image /Width ${logoPdf.canvasAncho} /Height ${logoPdf.canvasAlto} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoPdf.binario.length} >>\nstream\n${logoPdf.binario}\nendstream`)
                      : null;

                    const pageIds = [];
                    paginas.forEach((stream) => {
                      const contenidoId = agregarObjeto(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
                      const recursosImagen = logoObjetoId ? `/XObject << /ImLogo ${logoObjetoId} 0 R >>` : "";
                      const paginaId = agregarObjeto(`<< /Type /Page /Parent ${pagesPlaceholderId} 0 R /MediaBox [0 0 ${anchoPagina} ${altoPagina}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> ${recursosImagen} >> /Contents ${contenidoId} 0 R >>`);
                      pageIds.push(paginaId);
                    });

                    objetos[pagesPlaceholderId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

                    let pdf = "%PDF-1.4\n";
                    const offsets = [0];
                    objetos.forEach((objeto, index) => {
                      offsets.push(pdf.length);
                      pdf += `${index + 1} 0 obj\n${objeto}\nendobj\n`;
                    });

                    const inicioXref = pdf.length;
                    pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
                    offsets.slice(1).forEach((offset) => {
                      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
                    });
                    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogoId} 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

                    const bytes = new Uint8Array(pdf.length);
                    for (let i = 0; i < pdf.length; i += 1) {
                      bytes[i] = pdf.charCodeAt(i) & 0xff;
                    }

                    return new Blob([bytes], { type: "application/pdf" });
                  };

                  const construirLineasFormularioSiniestro = (opciones = {}) => opciones;

                  const descargarBlobFormularioSiniestro = (blob, nombreArchivo) => {
                    const url = URL.createObjectURL(blob);
                    const enlace = document.createElement("a");

                    enlace.href = url;
                    enlace.download = nombreArchivo;
                    document.body.appendChild(enlace);
                    enlace.click();
                    enlace.remove();

                    setTimeout(() => URL.revokeObjectURL(url), 1200);
                  };

                  const descargarPdfFormulario = async (nombreArchivo, opciones = {}) => {
                    const blobPdf = await crearPdfSiniestro(construirLineasFormularioSiniestro(opciones));
                    descargarBlobFormularioSiniestro(blobPdf, nombreArchivo);
                    return blobPdf;
                  };

                  const descargarFormularioEnBlanco = async () => {
                    await descargarPdfFormulario(
                      "Formulario_Siniestro_Blanco_Prieto_Correa.pdf",
                      { enBlanco: true }
                    );

                    setMensajeFormularioSiniestro("PDF en blanco descargado correctamente.");
                  };

                  const descargarFormularioCompletado = async () => {
                    await descargarPdfFormulario(
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf"
                    );

                    setMensajeFormularioSiniestro("PDF descargado correctamente. El archivo queda listo para enviar o guardar.");
                  };

                  const enviarFormularioAEjecutivo = async () => {
                    const pdfBlob = await descargarPdfFormulario(
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf"
                    );
                    const archivoFormulario = new File(
                      [pdfBlob],
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf",
                      { type: "application/pdf" }
                    );

                    const anexos = Array.isArray(archivoRespaldoSiniestro)
                      ? archivoRespaldoSiniestro
                      : archivoRespaldoSiniestro
                        ? [archivoRespaldoSiniestro]
                        : [];

                    const resumen = [
                      "Hola, envio formulario de denuncio de siniestro.",
                      `Cliente: ${datosClienteFormulario.nombre || "Pendiente"}`,
                      `RUT: ${datosClienteFormulario.rut || "Pendiente"}`,
                      `Poliza: ${polizaSeleccionada?.poliza || "Sin poliza seleccionada"}`,
                      `Seguro: ${polizaSeleccionada?.nombre || "Seguro"}`,
                      `Compania: ${polizaSeleccionada?.compania || "Pendiente"}`,
                      `Fecha siniestro: ${formularioSiniestro.fechaSiniestro || "Pendiente"}`,
                      `Ciudad: ${formularioSiniestro.ciudadOcurrencia || "Pendiente"}`,
                      `Relato: ${formularioSiniestro.relatoHechos || "Pendiente"}`,
                      anexos.length
                        ? `Anexos: ${anexos.map((archivo) => archivo.name).join(", ")}`
                        : "Anexos: sin archivos adjuntos",
                    ].join("\n");

                    try {
                      if (
                        navigator.canShare &&
                        navigator.canShare({ files: [archivoFormulario] }) &&
                        navigator.share
                      ) {
                        await navigator.share({
                          title: "Formulario de siniestro Prieto & Correa",
                          text: resumen,
                          files: [archivoFormulario],
                        });

                        setMensajeFormularioSiniestro("Formulario PDF compartido con el ejecutivo correctamente.");
                        return;
                      }
                    } catch {
                      setMensajeFormularioSiniestro("No se pudo compartir directamente. Se descargara el PDF para que lo adjuntes.");
                    }

                    setMensajeFormularioSiniestro("PDF descargado. Se abrira WhatsApp con el mensaje listo; adjunta el PDF descargado y los respaldos antes de enviarlo.");
                    abrirWhatsApp(`${resumen}\n\nAdjunto el PDF descargado del formulario y sus respaldos.`);
                  };

                  const casosActivos = siniestrosCliente.filter((item) => item.tipoEstado !== "cerrado").length;
                  const enGestion = siniestrosCliente.filter((item) => item.tipoEstado === "gestion").length;
                  const pendientes = siniestrosCliente.filter((item) => item.tipoEstado === "pendiente").length;
                  const cerrados = siniestrosCliente.filter((item) => item.tipoEstado === "cerrado").length;

                  const estadoMeta = (tipoEstado) => {
                    if (tipoEstado === "gestion") {
                      return {
                        icono: ICONOS.reloj,
                        texto: "En gestión",
                        color: "#c2410c",
                        background: "rgba(244, 124, 32, 0.12)",
                        border: "rgba(244, 124, 32, 0.32)",
                      };
                    }

                    if (tipoEstado === "pendiente") {
                      return {
                        icono: ICONOS.carpeta,
                        texto: "Pendiente respaldo",
                        color: "#07195a",
                        background: "#eef4ff",
                        border: "#cfddf8",
                      };
                    }

                    return {
                      icono: ICONOS.tick,
                      texto: "Cerrado",
                      color: "#067647",
                      background: "#ecfdf3",
                      border: "#bfead1",
                    };
                  };

                  const kpisSiniestro = [
                    {
                      titulo: "Casos activos",
                      valor: casosActivos,
                      bajada: "Sin casos registrados",
                      icono: ICONOS.reporte,
                      fondo: "#eef4ff",
                      color: "#07195a",
                    },
                    {
                      titulo: "En gestión",
                      valor: enGestion,
                      bajada: "En revisión por la compañía",
                      icono: ICONOS.reloj,
                      fondo: "rgba(244, 124, 32, 0.14)",
                      color: "#f47c20",
                    },
                    {
                      titulo: "Pendiente documentos",
                      valor: pendientes,
                      bajada: "Requiere tu respaldo",
                      icono: ICONOS.carpeta,
                      fondo: "rgba(244, 174, 32, 0.16)",
                      color: "#f47c20",
                    },
                    {
                      titulo: "Cerrados",
                      valor: cerrados,
                      bajada: "Casos finalizados",
                      icono: ICONOS.tick,
                      fondo: "rgba(22, 163, 74, 0.14)",
                      color: "#067647",
                    },
                  ];

                  const pasosSiniestro = [
                    { numero: 1, titulo: "Reportado", texto: "Caso ingresado" },
                    { numero: 2, titulo: "En revisión", texto: "Evaluación inicial" },
                    { numero: 3, titulo: "Documentación", texto: "Respaldo del cliente" },
                    { numero: 4, titulo: "Resolución", texto: "Cierre del caso" },
                  ].map((paso) => ({
                    ...paso,
                    estado:
                      paso.numero < etapaActual
                        ? "completado"
                        : paso.numero === etapaActual
                          ? "actual"
                          : "pendiente",
                  }));

                  const fechaFormateada = (fecha) => {
                    if (!fecha) return "—";
                    const partes = String(fecha).split("-");
                    if (partes.length !== 3) return fecha;
                    return `${partes[2]}-${partes[1]}-${partes[0]}`;
                  };

                  const estiloSeccionFormulario = {
                    border: "1px solid #e6ebf2",
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: "#ffffff",
                    boxShadow: "0 10px 26px rgba(7, 25, 90, 0.04)",
                  };

                  const estiloTituloSeccionFormulario = {
                    padding: "12px 14px",
                    background: "#fde4cf",
                    color: "#07195a",
                    fontSize: "13px",
                    fontWeight: 950,
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e6ebf2",
                  };

                  const estiloGridFormulario = {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                    padding: "14px",
                  };

                  const campoSiniestro = (campo, etiqueta, opciones = {}) => {
                    const tipo = opciones.tipo || "text";
                    const full = opciones.full || false;
                    const disabled = Boolean(opciones.disabled);
                    const valor = opciones.valor !== undefined ? opciones.valor : formularioSiniestro[campo] || "";
                    const onChange = (event) => actualizarFormularioSiniestro(campo, event.target.value);
                    const estiloBase = {
                      height: tipo === "textarea" ? "auto" : "44px",
                      minHeight: tipo === "textarea" ? "96px" : "44px",
                      border: "1px solid #d9e2ef",
                      borderRadius: "12px",
                      padding: tipo === "textarea" ? "12px" : "0 12px",
                      color: "#07195a",
                      background: disabled ? "#f3f6fb" : "#ffffff",
                      fontWeight: 850,
                      outline: "none",
                      resize: tipo === "textarea" ? "vertical" : undefined,
                    };

                    return (
                      <label
                        key={campo || etiqueta}
                        style={{
                          display: "grid",
                          gap: "7px",
                          color: "#07195a",
                          fontSize: "12px",
                          fontWeight: 950,
                          gridColumn: full ? "1 / -1" : "auto",
                        }}
                      >
                        {etiqueta}
                        {tipo === "select" ? (
                          <select value={valor} onChange={onChange} style={estiloBase} disabled={disabled}>
                            {(opciones.items || []).map((item) => (
                              <option key={item} value={item === "Seleccionar" ? "" : item}>{item}</option>
                            ))}
                          </select>
                        ) : tipo === "textarea" ? (
                          <textarea value={valor} onChange={onChange} placeholder={opciones.placeholder || ""} style={estiloBase} disabled={disabled} />
                        ) : (
                          <input type={tipo} value={valor} onChange={onChange} placeholder={opciones.placeholder || ""} style={estiloBase} disabled={disabled} />
                        )}
                      </label>
                    );
                  };

                  const uploadRequerido = siniestroSeleccionado?.tipoEstado === "pendiente" || reporteSiniestroActivo;
                  const estadoActual = siniestroSeleccionado
                    ? estadoMeta(siniestroSeleccionado.tipoEstado)
                    : { texto: reporteSiniestroActivo ? "Reporte iniciado" : "Sin caso activo" };

                  return (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              margin: 0,
                              color: "#07195a",
                              fontSize: "23px",
                              fontWeight: 950,
                              letterSpacing: "-0.04em",
                              lineHeight: 1,
                            }}
                          >
                            Siniestros
                          </h2>

                          <p
                            style={{
                              margin: "6px 0 0",
                              color: "#667085",
                              fontSize: "13px",
                              lineHeight: 1.45,
                            }}
                          >
                            Reporta, revisa y da seguimiento a tus casos asociados a tus pólizas.
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => abrirFormularioSiniestro("digital")}
                            title="Reporta tu siniestro completando el formulario en línea"
                            style={{
                              border: "1px solid #d9e2ef",
                              borderRadius: "15px",
                              background: "#ffffff",
                              color: "#07195a",
                              padding: "11px 18px",
                              fontWeight: 950,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "9px",
                              boxShadow: "0 12px 28px rgba(7, 25, 90, 0.08)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ fontSize: "17px", lineHeight: 1 }}>▣</span>
                            <span>Reporta tu siniestro</span>
                          </button>

                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        {kpisSiniestro.map((kpi) => (
                          <article
                            key={kpi.titulo}
                            style={{
                              minHeight: "70px",
                              border: "1px solid #e6ebf2",
                              borderRadius: "16px",
                              background: "#ffffff",
                              padding: "12px 15px",
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              boxShadow: "0 12px 26px rgba(7, 25, 90, 0.05)",
                            }}
                          >
                            <span
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "999px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: kpi.fondo,
                                flex: "0 0 auto",
                              }}
                            >
                              <img
                                src={kpi.icono}
                                alt=""
                                style={{
                                  width: "25px",
                                  height: "25px",
                                  objectFit: "contain",
                                }}
                              />
                            </span>

                            <span>
                              <strong
                                style={{
                                  display: "block",
                                  color: "#07195a",
                                  fontSize: "19px",
                                  lineHeight: 1,
                                  fontWeight: 950,
                                }}
                              >
                                {kpi.valor}
                              </strong>

                              <small
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                  color: "#07195a",
                                  fontSize: "12px",
                                  fontWeight: 950,
                                }}
                              >
                                {kpi.titulo}
                              </small>

                              <small
                                style={{
                                  display: "block",
                                  marginTop: "1px",
                                  color: kpi.color,
                                  fontSize: "11px",
                                  fontWeight: 780,
                                }}
                              >
                                {kpi.bajada}
                              </small>
                            </span>
                          </article>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2.18fr 0.82fr",
                          gap: "12px",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ display: "grid", gap: "10px" }}>
                          <section
                            style={{
                              border: "1px solid #e6ebf2",
                              borderRadius: "18px",
                              background: "#ffffff",
                              padding: "14px 16px 12px",
                              boxShadow: "0 12px 26px rgba(7, 25, 90, 0.04)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 12px",
                                color: "#07195a",
                                fontSize: "17px",
                                fontWeight: 950,
                              }}
                            >
                              Seguimiento del proceso
                            </h3>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                position: "relative",
                                alignItems: "start",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "23px",
                                  left: "10%",
                                  right: "10%",
                                  height: "3px",
                                  background: "#d9e2ef",
                                  borderRadius: "99px",
                                  overflow: "hidden",
                                }}
                              >
                                <span
                                  style={{
                                    display: "block",
                                    width: `${Math.max(0, Math.min(100, ((etapaActual - 1) / 3) * 100))}%`,
                                    height: "100%",
                                    background: etapaActual >= 3 ? "#f47c20" : "#07195a",
                                  }}
                                />
                              </div>

                              {pasosSiniestro.map((paso) => {
                                const esActual = paso.estado === "actual";
                                const completado = paso.estado === "completado";

                                return (
                                  <div
                                    key={paso.numero}
                                    style={{
                                      position: "relative",
                                      zIndex: 1,
                                      textAlign: "center",
                                      display: "grid",
                                      justifyItems: "center",
                                      gap: "7px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: esActual ? "48px" : "43px",
                                        height: esActual ? "48px" : "43px",
                                        borderRadius: "999px",
                                        display: "grid",
                                        placeItems: "center",
                                        background: esActual ? "#f47c20" : completado ? "#07195a" : "#ffffff",
                                        color: esActual || completado ? "#ffffff" : "#07195a",
                                        border: esActual ? "2px solid #f47c20" : "2px solid #d9e2ef",
                                        fontWeight: 950,
                                        fontSize: "16px",
                                        boxShadow: esActual ? "0 0 0 7px rgba(244, 124, 32, 0.12)" : "none",
                                        position: "relative",
                                      }}
                                    >
                                      {paso.numero}
                                      {completado && (
                                        <span
                                          style={{
                                            position: "absolute",
                                            right: "-3px",
                                            top: "-4px",
                                            width: "14px",
                                            height: "14px",
                                            borderRadius: "999px",
                                            background: "#22c55e",
                                            border: "2px solid #ffffff",
                                          }}
                                        />
                                      )}
                                    </span>

                                    <div
                                      style={{
                                        minWidth: "120px",
                                        borderRadius: "12px",
                                        padding: esActual ? "6px 8px" : "0",
                                        background: esActual ? "rgba(244, 124, 32, 0.08)" : "transparent",
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
                                        {paso.titulo}
                                      </strong>

                                      <span
                                        style={{
                                          display: "block",
                                          marginTop: "2px",
                                          color: "#667085",
                                          fontSize: "11px",
                                          fontWeight: 750,
                                        }}
                                      >
                                        {paso.texto}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          <section
                            style={{
                              border: "1px solid #e6ebf2",
                              borderRadius: "18px",
                              background: "#ffffff",
                              padding: "13px 14px 11px",
                              boxShadow: "0 12px 26px rgba(7, 25, 90, 0.04)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 8px",
                                color: "#07195a",
                                fontSize: "18px",
                                fontWeight: 950,
                              }}
                            >
                              Mis casos
                            </h3>

                            <div style={{ overflowX: "auto" }}>
                              <table
                                style={{
                                  width: "100%",
                                  minWidth: "820px",
                                  borderCollapse: "separate",
                                  borderSpacing: 0,
                                  overflow: "hidden",
                                  borderRadius: "14px",
                                  border: "1px solid #e6ebf2",
                                }}
                              >
                                <thead>
                                  <tr style={{ background: "#f5f7fb" }}>
                                    {["N° Caso", "Seguro / póliza", "Estado", "Ejecutivo", "Fecha"].map((titulo) => (
                                      <th
                                        key={titulo}
                                        style={{
                                          textAlign: "left",
                                          padding: "9px 10px",
                                          color: "#07195a",
                                          fontSize: "11px",
                                          fontWeight: 950,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.02em",
                                          borderBottom: "1px solid #e6ebf2",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {titulo}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {siniestrosCliente.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan="5"
                                        style={{
                                          padding: "24px 16px",
                                          textAlign: "center",
                                          color: "#667085",
                                          fontSize: "12px",
                                          fontWeight: 850,
                                          borderBottom: "1px solid #e6ebf2",
                                        }}
                                      >
                                        <strong
                                          style={{
                                            display: "block",
                                            color: "#07195a",
                                            fontSize: "14px",
                                            fontWeight: 950,
                                            marginBottom: "5px",
                                          }}
                                        >
                                          No tienes siniestros registrados.
                                        </strong>
                                        Selecciona una póliza vigente y presiona “Reporta tu siniestro” para iniciar un caso.
                                      </td>
                                    </tr>
                                  ) : (
                                    siniestrosPaginados.map((siniestro) => {
                                      const activo = siniestroSeleccionado?.id === siniestro.id;
                                      const meta = estadoMeta(siniestro.tipoEstado);

                                      return (
                                        <tr
                                          key={siniestro.id}
                                          onClick={() => seleccionarCaso(siniestro)}
                                          style={{
                                            cursor: "pointer",
                                            background: activo ? "#fff7ed" : "#ffffff",
                                            outline: activo ? "1px solid rgba(244, 124, 32, 0.42)" : "none",
                                          }}
                                        >
                                          <td
                                            style={{
                                              padding: "9px 10px",
                                              borderBottom: "1px solid #e6ebf2",
                                              color: "#07195a",
                                              fontSize: "12px",
                                              fontWeight: 950,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {siniestro.id}
                                          </td>

                                          <td
                                            style={{
                                              padding: "9px 10px",
                                              borderBottom: "1px solid #e6ebf2",
                                              color: "#07195a",
                                              fontSize: "12px",
                                              fontWeight: 900,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            <strong style={{ display: "block", fontWeight: 950 }}>{siniestro.seguro}</strong>
                                            <span style={{ color: "#667085", fontSize: "11px", fontWeight: 850 }}>
                                              {siniestro.poliza}
                                            </span>
                                          </td>

                                          <td
                                            style={{
                                              padding: "9px 10px",
                                              borderBottom: "1px solid #e6ebf2",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            <span
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "7px",
                                                minWidth: "150px",
                                                minHeight: "28px",
                                                padding: "5px 12px",
                                                borderRadius: "999px",
                                                background: meta.background,
                                                border: `1px solid ${meta.border}`,
                                                color: meta.color,
                                                fontSize: "11px",
                                                fontWeight: 950,
                                              }}
                                            >
                                              <img
                                                src={meta.icono}
                                                alt=""
                                                style={{ width: "13px", height: "13px", objectFit: "contain" }}
                                              />
                                              {meta.texto}
                                            </span>
                                          </td>

                                          <td
                                            style={{
                                              padding: "9px 10px",
                                              borderBottom: "1px solid #e6ebf2",
                                              color: "#07195a",
                                              fontSize: "12px",
                                              fontWeight: 950,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {siniestro.ejecutivo}
                                          </td>

                                          <td
                                            style={{
                                              padding: "9px 10px",
                                              borderBottom: "1px solid #e6ebf2",
                                              color: "#07195a",
                                              fontSize: "12px",
                                              fontWeight: 950,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {fechaFormateada(siniestro.fecha)}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {siniestrosCliente.length > CASOS_POR_PAGINA && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "10px",
                                  marginTop: "9px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#667085",
                                    fontSize: "11px",
                                    fontWeight: 850,
                                  }}
                                >
                                  Mostrando {desdeSiniestro}-{hastaSiniestro} de {totalSiniestros} casos
                                </span>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPaginaSiniestros((pagina) => Math.max(1, pagina - 1))
                                    }
                                    disabled={paginaActualSiniestros === 1}
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      background: paginaActualSiniestros === 1 ? "#f5f7fb" : "#ffffff",
                                      color: paginaActualSiniestros === 1 ? "#98a2b3" : "#07195a",
                                      borderRadius: "10px",
                                      padding: "6px 9px",
                                      fontWeight: 950,
                                      cursor: paginaActualSiniestros === 1 ? "not-allowed" : "pointer",
                                    }}
                                  >
                                    ‹
                                  </button>

                                  {Array.from(
                                    { length: totalPaginasSiniestros },
                                    (_, index) => index + 1
                                  ).map((pagina) => (
                                    <button
                                      key={pagina}
                                      type="button"
                                      onClick={() => setPaginaSiniestros(pagina)}
                                      style={{
                                        border:
                                          paginaActualSiniestros === pagina
                                            ? "1px solid #07195a"
                                            : "1px solid #d9e2ef",
                                        background:
                                          paginaActualSiniestros === pagina ? "#07195a" : "#ffffff",
                                        color:
                                          paginaActualSiniestros === pagina ? "#ffffff" : "#07195a",
                                        borderRadius: "10px",
                                        padding: "6px 10px",
                                        fontWeight: 950,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {pagina}
                                    </button>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPaginaSiniestros((pagina) =>
                                        Math.min(totalPaginasSiniestros, pagina + 1)
                                      )
                                    }
                                    disabled={paginaActualSiniestros === totalPaginasSiniestros}
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      background:
                                        paginaActualSiniestros === totalPaginasSiniestros
                                          ? "#f5f7fb"
                                          : "#ffffff",
                                      color:
                                        paginaActualSiniestros === totalPaginasSiniestros
                                          ? "#98a2b3"
                                          : "#07195a",
                                      borderRadius: "10px",
                                      padding: "6px 9px",
                                      fontWeight: 950,
                                      cursor:
                                        paginaActualSiniestros === totalPaginasSiniestros
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    ›
                                  </button>
                                </div>
                              </div>
                            )}

                            <p
                              style={{
                                margin: "8px 0 0",
                                color: "#98a2b3",
                                textAlign: "center",
                                fontSize: "11px",
                                fontWeight: 850,
                              }}
                            >
                              {siniestrosCliente.length > 0 ? "Última actualización: hoy, 00:18" : "Sin casos registrados"}
                            </p>
                          </section>
                        </div>

                        <aside style={{ display: "grid", gap: "10px" }}>
                          <section
                            style={{
                              border: "1px solid #e6ebf2",
                              borderRadius: "18px",
                              background: "#ffffff",
                              padding: "13px 14px",
                              boxShadow: "0 12px 26px rgba(7, 25, 90, 0.04)",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 5px",
                                color: "#07195a",
                                fontSize: "16px",
                                fontWeight: 950,
                              }}
                            >
                              ¿Qué póliza deseas reportar?
                            </h3>

                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#667085",
                                fontSize: "12px",
                                lineHeight: 1.35,
                              }}
                            >
                              Selecciona tu póliza vigente y luego presiona “Reporta tu siniestro”.
                            </p>

                            <select
                              disabled={polizasReportables.length === 0}
                              value={polizaSeleccionada?.id || ""}
                              onChange={(event) => seleccionarPoliza(event.target.value)}
                              style={{
                                width: "100%",
                                minHeight: "36px",
                                border: "1px solid #d9e2ef",
                                borderRadius: "12px",
                                background: "#f8fafc",
                                color: "#07195a",
                                fontWeight: 900,
                                fontSize: "12px",
                                padding: "0 11px",
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              {polizasReportables.length === 0 ? (
                                <option value="">No tienes pólizas vigentes registradas</option>
                              ) : (
                                Object.entries(categoriasReportables).map(([categoria, items]) => (
                                  <optgroup key={categoria} label={`${categoria} (${items.length})`}>
                                    {items.map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.nombre} · {item.poliza}
                                      </option>
                                    ))}
                                  </optgroup>
                                ))
                              )}
                            </select>

                            {polizaSeleccionada ? (
                              <div
                                style={{
                                  marginTop: "10px",
                                  border: "1px solid rgba(7, 25, 90, 0.08)",
                                  borderRadius: "14px",
                                  background: "#f5f7fb",
                                  padding: "10px 11px",
                                }}
                              >
                                <small
                                  style={{
                                    display: "block",
                                    color: "#f47c20",
                                    fontSize: "10px",
                                    fontWeight: 950,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  Póliza seleccionada
                                </small>

                                <strong
                                  style={{
                                    display: "block",
                                    marginTop: "3px",
                                    color: "#07195a",
                                    fontSize: "13px",
                                    fontWeight: 950,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {polizaSeleccionada.nombre}
                                </strong>

                                <span
                                  style={{
                                    display: "block",
                                    marginTop: "2px",
                                    color: "#667085",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                  }}
                                >
                                  {polizaSeleccionada.categoria} · {polizaSeleccionada.poliza}
                                </span>

                                <span
                                  style={{
                                    display: "block",
                                    marginTop: "7px",
                                    color: reporteSiniestroActivo ? "#067647" : "#475467",
                                    fontSize: "11px",
                                    fontWeight: 900,
                                  }}
                                >
                                  {reporteSiniestroActivo
                                    ? "Reporte preparado para la póliza seleccionada."
                                    : siniestroPorPoliza
                                      ? "Esta póliza ya tiene un caso asociado."
                                      : "Lista para iniciar un nuevo reporte."}
                                </span>
                              </div>
                            ) : (
                              <div
                                style={{
                                  marginTop: "10px",
                                  border: "1px dashed #d9e2ef",
                                  borderRadius: "14px",
                                  background: "#f8fafc",
                                  padding: "12px",
                                  color: "#667085",
                                  fontSize: "12px",
                                  fontWeight: 850,
                                  lineHeight: 1.35,
                                }}
                              >
                                Cuando el backend entregue tus pólizas vigentes, podrás seleccionar una aquí para iniciar el reporte.
                              </div>
                            )}
                          </section>
                        </aside>
                      </div>

                      <section
                        style={{
                          marginTop: "10px",
                          borderRadius: "18px",
                          background: "linear-gradient(135deg, #07195a 0%, #031344 100%)",
                          color: "#ffffff",
                          padding: "12px 18px",
                          display: "grid",
                          gridTemplateColumns: "1.35fr 0.8fr 0.95fr",
                          gap: "18px",
                          alignItems: "center",
                          boxShadow: "0 18px 38px rgba(7, 25, 90, 0.22)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "48px 1fr",
                            gap: "13px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "999px",
                              border: "2px solid rgba(255, 255, 255, 0.7)",
                              display: "grid",
                              placeItems: "center",
                              background: "rgba(255, 255, 255, 0.08)",
                              position: "relative",
                            }}
                          >
                            <span style={{ fontSize: "24px", lineHeight: 1 }}>👤</span>
                            <span
                              style={{
                                position: "absolute",
                                right: "4px",
                                bottom: "4px",
                                width: "13px",
                                height: "13px",
                                borderRadius: "999px",
                                background: "#22c55e",
                                border: "2px solid #ffffff",
                              }}
                            />
                          </div>

                          <div>
                            <small
                              style={{
                                display: "block",
                                opacity: 0.85,
                                fontSize: "11px",
                                fontWeight: 850,
                              }}
                            >
                              Ejecutivo asignado
                            </small>

                            <strong
                              style={{
                                display: "block",
                                marginTop: "3px",
                                fontSize: "15px",
                                fontWeight: 950,
                              }}
                            >
                              {siniestroSeleccionado?.ejecutivo || "Pendiente asignación"}
                            </strong>

                            <p
                              style={{
                                margin: "3px 0 0",
                                opacity: 0.9,
                                fontSize: "11px",
                                lineHeight: 1.35,
                              }}
                            >
                              Acompañamiento en denuncia, respaldo y seguimiento con la compañía.
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            borderLeft: "1px solid rgba(255, 255, 255, 0.28)",
                            paddingLeft: "18px",
                          }}
                        >
                          <strong
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "14px",
                              fontWeight: 950,
                            }}
                          >
                            <span style={{ fontSize: "17px" }}>◷</span>
                            Horario de atención
                          </strong>

                          <p
                            style={{
                              margin: "5px 0 0",
                              opacity: 0.9,
                              fontSize: "12px",
                              lineHeight: 1.35,
                            }}
                          >
                            Lunes a viernes<br />
                            09:00 a 18:00 hrs.
                          </p>
                        </div>

                        <div
                          style={{
                            borderLeft: "1px solid rgba(255, 255, 255, 0.28)",
                            paddingLeft: "18px",
                          }}
                        >
                          <strong
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "14px",
                              fontWeight: 950,
                            }}
                          >
                            <span style={{ fontSize: "17px" }}>📄</span>
                            Estado actual
                          </strong>

                          <p
                            style={{
                              margin: "5px 0 0",
                              opacity: 0.9,
                              fontSize: "12px",
                              lineHeight: 1.35,
                            }}
                          >
                            {siniestroSeleccionado ? estadoActual.texto : "Sin caso seleccionado"}<br />
                            {siniestroSeleccionado
                              ? `Última actualización: ${siniestroSeleccionado.actualizado || "pendiente"}`
                              : "Esperando conexión con backend"}
                          </p>
                        </div>
                      </section>

                      {formularioSiniestroAbierto && (
                        <div
                          style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            background: "rgba(3, 19, 68, 0.62)",
                            backdropFilter: "blur(6px)",
                            padding: "24px",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "min(1120px, 100%)",
                              maxHeight: "92vh",
                              overflowY: "auto",
                              background: "#ffffff",
                              borderRadius: "28px",
                              boxShadow: "0 35px 90px rgba(0, 0, 0, 0.28)",
                              border: "1px solid rgba(255, 255, 255, 0.65)",
                            }}
                          >
                            <div
                              style={{
                                padding: "24px 28px",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "16px",
                                alignItems: "flex-start",
                                background: "linear-gradient(135deg, #07195a, #031344)",
                                color: "#ffffff",
                                borderRadius: "28px 28px 0 0",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    width: "fit-content",
                                    padding: "7px 12px",
                                    borderRadius: "999px",
                                    background: "#f47c20",
                                    color: "#ffffff",
                                    fontSize: "10px",
                                    fontWeight: 950,
                                    textTransform: "uppercase",
                                    marginBottom: "10px",
                                  }}
                                >
                                  Denuncio de siniestro
                                </span>

                                <h2
                                  style={{
                                    margin: 0,
                                    color: "#ffffff",
                                    fontSize: "26px",
                                    fontWeight: 950,
                                    letterSpacing: "-0.04em",
                                  }}
                                >
                                  Formulario Siniestro
                                </h2>

                                <p
                                  style={{
                                    margin: "8px 0 0",
                                    maxWidth: "720px",
                                    color: "rgba(255, 255, 255, 0.82)",
                                    fontSize: "13px",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  Puedes completarlo en línea con tus datos precargados o descargar el PDF manual para imprimirlo, llenarlo y enviarlo a tu ejecutivo comercial.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={cerrarFormularioSiniestro}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  border: "none",
                                  borderRadius: "999px",
                                  background: "rgba(255, 255, 255, 0.14)",
                                  color: "#ffffff",
                                  fontSize: "22px",
                                  fontWeight: 900,
                                  cursor: "pointer",
                                  flex: "0 0 auto",
                                }}
                                aria-label="Cerrar formulario"
                              >
                                ×
                              </button>
                            </div>

                            <div style={{ padding: "26px 28px 30px" }}>
                              {false ? (
                                <>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                      gap: "18px",
                                    }}
                                  >
                                    <article
                                      style={{
                                        padding: "24px",
                                        borderRadius: "22px",
                                        border: "1px solid #e6ebf2",
                                        background: "radial-gradient(circle at top right, rgba(244, 124, 32, 0.12), transparent 35%), #ffffff",
                                        boxShadow: "0 14px 34px rgba(7, 25, 90, 0.07)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "56px",
                                          height: "56px",
                                          borderRadius: "18px",
                                          display: "grid",
                                          placeItems: "center",
                                          background: "rgba(244, 124, 32, 0.13)",
                                          color: "#f47c20",
                                          fontSize: "28px",
                                          fontWeight: 950,
                                          marginBottom: "16px",
                                        }}
                                      >
                                        ✎
                                      </div>

                                      <h3
                                        style={{
                                          margin: "0 0 8px",
                                          color: "#07195a",
                                          fontSize: "21px",
                                          fontWeight: 950,
                                        }}
                                      >
                                        Completar formulario en línea
                                      </h3>

                                      <p
                                        style={{
                                          margin: "0 0 18px",
                                          color: "#667085",
                                          fontSize: "13px",
                                          lineHeight: 1.65,
                                        }}
                                      >
                                        Ideal para usar desde el teléfono. El sistema precarga tus datos de cliente y póliza, y luego puedes guardar el documento como PDF.
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() => setModoFormularioSiniestro("digital")}
                                        style={{
                                          width: "100%",
                                          minHeight: "46px",
                                          border: "none",
                                          borderRadius: "14px",
                                          background: "#07195a",
                                          color: "#ffffff",
                                          fontWeight: 950,
                                          cursor: "pointer",
                                        }}
                                      >
                                        Completar en línea
                                      </button>
                                    </article>

                                    <article
                                      style={{
                                        padding: "24px",
                                        borderRadius: "22px",
                                        border: "1px solid #e6ebf2",
                                        background: "#f8faff",
                                        boxShadow: "0 14px 34px rgba(7, 25, 90, 0.05)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "56px",
                                          height: "56px",
                                          borderRadius: "18px",
                                          display: "grid",
                                          placeItems: "center",
                                          background: "#eef4ff",
                                          color: "#07195a",
                                          fontSize: "26px",
                                          fontWeight: 950,
                                          marginBottom: "16px",
                                        }}
                                      >
                                        PDF
                                      </div>

                                      <h3
                                        style={{
                                          margin: "0 0 8px",
                                          color: "#07195a",
                                          fontSize: "21px",
                                          fontWeight: 950,
                                        }}
                                      >
                                        Descargar formulario manual
                                      </h3>

                                      <p
                                        style={{
                                          margin: "0 0 18px",
                                          color: "#667085",
                                          fontSize: "13px",
                                          lineHeight: 1.65,
                                        }}
                                      >
                                        Pensado para clientes que prefieren imprimir, llenar a mano o guardar el documento para enviarlo después a su ejecutivo.
                                      </p>

                                      <a
                                        href="/formulario-siniestro.pdf"
                                        download="formulario-siniestro-prieto-correa.pdf"
                                        style={{
                                          width: "100%",
                                          minHeight: "46px",
                                          borderRadius: "14px",
                                          background: "#f47c20",
                                          color: "#ffffff",
                                          fontWeight: 950,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        Descargar PDF manual
                                      </a>
                                    </article>
                                  </div>

                                  <div
                                    style={{
                                      marginTop: "18px",
                                      padding: "16px",
                                      borderRadius: "18px",
                                      background: "#f8faff",
                                      border: "1px dashed #cbd5e1",
                                      color: "#56637a",
                                      fontSize: "12px",
                                      lineHeight: 1.6,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Importante: guarda el PDF en tu teléfono para enviarlo por WhatsApp o correo a tu ejecutivo comercial. Para que la descarga manual funcione, deja el archivo en <strong>public/formulario-siniestro.pdf</strong>.
                                  </div>
                                </>
                              ) : (
                                <>
                                  <form
                                    onSubmit={(event) => {
                                      event.preventDefault();
                                      descargarFormularioCompletado();
                                    }}
                                    style={{ display: "grid", gap: "16px" }}
                                  >

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Datos generales</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("numeroSiniestro", "N° siniestro", { placeholder: "Lo completa la compañía" })}
                                        {campoSiniestro("liquidador", "Liquidador", { placeholder: "Si ya fue asignado" })}
                                        <label style={{ display: "grid", gap: "7px", color: "#07195a", fontSize: "12px", fontWeight: 950 }}>
                                          Póliza asociada
                                          <select
                                            value={polizaSeleccionada?.id || ""}
                                            onChange={(event) => seleccionarPoliza(event.target.value)}
                                            style={{ height: "44px", border: "1px solid #d9e2ef", borderRadius: "12px", padding: "0 12px", color: "#07195a", fontWeight: 850 }}
                                          >
                                            {polizasReportables.length === 0 ? (
                                              <option value="">No tienes pólizas vigentes registradas</option>
                                            ) : (
                                              polizasReportables.map((poliza) => (
                                                <option key={poliza.id} value={poliza.id}>
                                                  {poliza.nombre} — {poliza.poliza} — {poliza.compania}
                                                </option>
                                              ))
                                            )}
                                          </select>
                                        </label>
                                        {campoSiniestro("polizaItem", "Item")}
                                        {campoSiniestro("fechaSiniestro", "Fecha del siniestro", { tipo: "date" })}
                                        {campoSiniestro("horaSiniestro", "Hora ocurrencia", { tipo: "time" })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes del asegurado</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("nombreAuto", "Nombre", { valor: datosClienteFormulario.nombre, disabled: true })}
                                        {campoSiniestro("rutAuto", "R.U.T", { valor: datosClienteFormulario.rut, disabled: true })}
                                        {campoSiniestro("telefonoAuto", "Teléfono", { valor: datosClienteFormulario.telefono, disabled: true })}
                                        {campoSiniestro("emailAuto", "E-mail", { valor: datosClienteFormulario.correo, disabled: true })}
                                        {campoSiniestro("aseguradoDireccion", "Dirección", { valor: formularioSiniestro.aseguradoDireccion || datosClienteFormulario.direccion, placeholder: "Dirección registrada o actual" })}
                                        {campoSiniestro("aseguradoCiudad", "Ciudad")}
                                        {campoSiniestro("denunciante", "Denunciante", { valor: formularioSiniestro.denunciante || datosClienteFormulario.nombre })}
                                        {campoSiniestro("denuncianteRut", "R.U.T denunciante", { valor: formularioSiniestro.denuncianteRut || datosClienteFormulario.rut })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes del conductor</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("conductorNombre", "Nombre")}
                                        {campoSiniestro("conductorRut", "R.U.T")}
                                        {campoSiniestro("conductorTelefono", "Teléfono")}
                                        {campoSiniestro("conductorDireccion", "Dirección")}
                                        {campoSiniestro("conductorCiudad", "Ciudad")}
                                        {campoSiniestro("conductorRegion", "Región")}
                                        {campoSiniestro("conductorComuna", "Comuna")}
                                        {campoSiniestro("licenciaNumero", "N° licencia conducir")}
                                        {campoSiniestro("licenciaVigencia", "Vigencia licencia")}
                                        {campoSiniestro("licenciaClase", "Clase")}
                                        {campoSiniestro("conductorEdad", "Edad", { tipo: "number" })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes del vehículo</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("vehiculoMarca", "Marca")}
                                        {campoSiniestro("vehiculoModelo", "Modelo")}
                                        {campoSiniestro("vehiculoAnio", "Año")}
                                        {campoSiniestro("vehiculoPatente", "Patente")}
                                        {campoSiniestro("vehiculoMotor", "N° de motor")}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes del siniestro</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("direccionOcurrencia", "Dirección de ocurrencia", { placeholder: "Lugar exacto donde ocurrió" })}
                                        {campoSiniestro("ciudadOcurrencia", "Ciudad")}
                                        {campoSiniestro("regionOcurrencia", "Región")}
                                        {campoSiniestro("lugarInspeccion", "Lugar de inspección", { full: true, placeholder: "Dónde se encuentra el vehículo" })}
                                        {campoSiniestro("relatoHechos", "Relato de los hechos", { tipo: "textarea", full: true, placeholder: "Describe claramente qué ocurrió, dónde, cómo y quiénes participaron." })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Daños al vehículo</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("tipoDano", "Tipo de daños", { tipo: "select", items: ["Seleccionar", "Daños materiales", "Robo del vehículo", "Robo de accesorios", "Robo de partes o piezas", "Otro"] })}
                                        {campoSiniestro("partesAfectadas", "Partes afectadas", { tipo: "select", items: ["Seleccionar", "Delantera", "Trasera", "Costado izquierdo", "Costado derecho", "Más de una parte"] })}
                                        {campoSiniestro("magnitudDanos", "Magnitud de daños", { tipo: "select", items: ["Seleccionar", "Leves", "Medianos", "Graves"] })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes del tercero</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("existeTercero", "Existe tercero", { tipo: "select", items: ["Seleccionar", "Sí", "No"] })}
                                        {campoSiniestro("terceroReclama", "Reclama", { tipo: "select", items: ["Seleccionar", "Sí", "No"] })}
                                        {campoSiniestro("terceroSeguro", "Con seguro de daños", { tipo: "select", items: ["Seleccionar", "Sí", "No"] })}
                                        {campoSiniestro("terceroCompania", "¿En qué compañía?")}
                                        {campoSiniestro("terceroCulpable", "3° culpable", { tipo: "select", items: ["Seleccionar", "Sí", "No", "Por determinar"] })}
                                        {campoSiniestro("terceroDano", "Daño del 3°", { tipo: "select", items: ["Seleccionar", "Leves", "Medianos", "Graves"] })}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Identificación del tercero</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("terceroNombre", "Nombre")}
                                        {campoSiniestro("terceroRut", "R.U.T")}
                                        {campoSiniestro("terceroTelefono", "Teléfono")}
                                        {campoSiniestro("terceroEmail", "E-mail")}
                                        {campoSiniestro("terceroDireccion", "Dirección")}
                                        {campoSiniestro("terceroCiudad", "Ciudad")}
                                        {campoSiniestro("terceroVehiculo", "Marca vehículo")}
                                        {campoSiniestro("terceroModelo", "Modelo")}
                                        {campoSiniestro("terceroPatente", "Patente")}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div style={estiloTituloSeccionFormulario}>Antecedentes legales</div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro("comisaria", "Comisaría")}
                                        {campoSiniestro("folio", "N° Parte Policial")}
                                        {campoSiniestro("fechaDenuncia", "Fecha", { tipo: "date" })}
                                        {campoSiniestro("juzgado", "Juzgado")}
                                        {campoSiniestro("citacion", "Citación")}
                                        {campoSiniestro("alcoholemia", "Alcoholemia", { tipo: "select", items: ["Seleccionar", "Sí", "No", "No aplica", "Pendiente"] })}
                                      </div>
                                    </section>

                                    {mensajeFormularioSiniestro && (
                                      <div style={{ padding: "13px 15px", borderRadius: "14px", background: "#f8faff", border: "1px solid #d9e2ef", color: "#07195a", fontSize: "12px", fontWeight: 850, lineHeight: 1.55 }}>
                                        {mensajeFormularioSiniestro}
                                      </div>
                                    )}

                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                                      <button type="button" onClick={cerrarFormularioSiniestro} style={{ minHeight: "46px", border: "1px solid #d9e2ef", borderRadius: "14px", background: "#ffffff", color: "#07195a", padding: "0 18px", fontWeight: 950, cursor: "pointer" }}>
                                        Cerrar
                                      </button>

                                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                        <button type="button" onClick={descargarFormularioEnBlanco} style={{ minHeight: "46px", border: "none", borderRadius: "14px", background: "#eef4ff", color: "#07195a", padding: "0 18px", fontWeight: 950, cursor: "pointer" }}>
                                          Descargar PDF en blanco
                                        </button>

                                        <button type="submit" style={{ minHeight: "46px", border: "none", borderRadius: "14px", background: "#f47c20", color: "#ffffff", padding: "0 18px", fontWeight: 950, cursor: "pointer" }}>
                                          Descargar archivo
                                        </button>

                                        <button type="button" onClick={enviarFormularioAEjecutivo} style={{ minHeight: "46px", border: "none", borderRadius: "14px", background: "#07195a", color: "#ffffff", padding: "0 18px", fontWeight: 950, cursor: "pointer" }}>
                                          Enviar a ejecutivo
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </>
                  );
                })()}
              </div>
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
                  Revisa tus cuotas pendientes, próximos vencimientos y comprobantes asociados a tus pólizas.
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
                    <strong>{proximoPago ? formatearFecha(proximoPago.fecha_vencimiento) : "—"}</strong>
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
                      gridTemplateColumns: "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
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
                          gridTemplateColumns: "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
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

                      <div className="pc-empty" style={{ margin: "14px", padding: "24px" }}>
                        <h3>No tienes pagos pendientes</h3>
                        <p>
                          Cuando una póliza tenga pagos, cuotas próximas o comprobantes, podrás gestionarlos aquí automáticamente.
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button onClick={() => setVista("cotizaciones")}>Explorar seguros</button>

                          <button
                            type="button"
                            onClick={() =>
                              abrirWhatsApp("Hola, necesito orientación sobre pagos y cuotas de mis seguros.")
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
                          gridTemplateColumns: "1.2fr 0.95fr 0.65fr 0.75fr 0.85fr 0.75fr 0.85fr",
                          gap: "10px",
                          alignItems: "center",
                          padding: "13px 16px",
                          borderTop: "1px solid #eef2f7",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#07195a", display: "block" }}>
                            {pago.seguro}
                          </strong>
                          <small style={{ color: "#667085", fontWeight: 800 }}>
                            {pago.numero_poliza}
                          </small>
                        </div>

                        <span style={{ color: "#475467" }}>{pago.compania}</span>
                        <strong style={{ color: "#07195a" }}>{pago.cuota}</strong>
                        <strong style={{ color: "#07195a" }}>
                          {formatearMoneda(pago.monto, pago.moneda)}
                        </strong>
                        <span style={{ color: "#475467" }}>
                          {formatearFecha(pago.fecha_vencimiento)}
                        </span>
                        <span className={`pc-status ${pago.estado}`}>
                          {textoEstado(pago.estado)}
                        </span>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {["pendiente", "por-vencer", "vigente", "activa"].includes(pago.estado) ? (
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
                                  ? window.open(pago.url_comprobante, "_blank", "noopener,noreferrer")
                                  : abrirWhatsApp(`Hola, necesito el comprobante del pago asociado a ${pago.seguro}.`)
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
                  <strong style={{ color: "#07195a", display: "block", marginBottom: "5px" }}>
                    Integración preparada
                  </strong>
                  El portal queda listo para consumir <strong>/portal/mis-pagos</strong>. Para pagos reales,
                  el frontend debe solicitar al backend iniciar la transacción y el backend debe conectar con el proveedor de pago.
                </div>
              </div>
            )}

            {vista === "beneficios" && (
              <div
                className="pc-panel pc-full-panel"
                style={{
                  width: "min(100%, 1480px)",
                  maxWidth: "1480px",
                  margin: "0 auto 70px",
                  padding: "18px",
                  overflow: "visible",
                }}
              >
                <section
                  style={{
                    borderRadius: "22px",
                    padding: "30px 34px",
                    marginBottom: "18px",
                    border: "1px solid #e4e9f3",
                    background: "linear-gradient(135deg, #ffffff 0%, #fff4ee 100%)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      background: "rgba(244, 124, 32, 0.13)",
                      color: "#f47c20",
                      fontSize: "11px",
                      fontWeight: 950,
                      textTransform: "uppercase",
                      marginBottom: "14px",
                    }}
                  >
                    Club Prieto & Correa
                  </span>

                  <h2 style={{ margin: "0 0 10px", color: "#07195a", fontSize: "31px" }}>
                    Descubre beneficios para clientes
                  </h2>

                  <p style={{ margin: 0, maxWidth: "740px", color: "#56637a", lineHeight: 1.6, fontSize: "14px" }}>
                    Accede a descuentos, convenios y promociones asociadas a tu portal de seguros.
                    Esta sección queda preparada para conectarse al backend mediante <strong>/portal/mis-beneficios</strong>.
                  </p>
                </section>

                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 260px",
                    gap: "16px",
                    marginBottom: "18px",
                    alignItems: "stretch",
                  }}
                >
                  <article
                    style={{
                      minHeight: "280px",
                      borderRadius: "22px",
                      overflow: "hidden",
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: "1fr 120px",
                      alignItems: "center",
                      padding: "34px",
                      color: "#ffffff",
                      backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.10)), url(${beneficioPrincipal?.imagen || "/restaurant.jpg"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "8px 14px",
                          borderRadius: "999px",
                          background: "#f47c20",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 950,
                          textTransform: "uppercase",
                          marginBottom: "18px",
                        }}
                      >
                        Beneficio destacado
                      </span>

                      <h3
                        style={{
                          margin: "0 0 12px",
                          fontSize: "33px",
                          lineHeight: 1.08,
                          maxWidth: "680px",
                          color: "#ffffff",
                          textShadow: "0 4px 22px rgba(0,0,0,0.55)",
                        }}
                      >
                        {beneficioPrincipal?.descuento ? `${beneficioPrincipal.descuento} en ${beneficioPrincipal.titulo}` : beneficioPrincipal?.titulo || "Beneficios disponibles próximamente"}
                      </h3>

                      <p style={{ margin: "0 0 16px", maxWidth: "560px", color: "rgba(255,255,255,0.9)", fontWeight: 800 }}>
                        {beneficioPrincipal?.descripcion || beneficioPrincipal?.bajada || "Cuando existan beneficios activos aparecerán aquí."}
                      </p>

                      <small
                        style={{
                          display: "inline-flex",
                          padding: "8px 13px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.14)",
                          color: "#ffffff",
                          fontWeight: 950,
                        }}
                      >
                        Vigencia: {formatearFecha(beneficioPrincipal?.vigencia)}
                      </small>

                      <div style={{ display: "flex", gap: "7px", marginTop: "18px" }}>
                        {beneficiosDestacados.map((beneficio, index) => (
                          <button
                            key={beneficio.id_beneficio || beneficio.id || index}
                            type="button"
                            onClick={() => setBeneficioSlide(index)}
                            aria-label={`Ver beneficio destacado ${index + 1}`}
                            style={{
                              width: beneficioSlide % beneficiosDestacados.length === index ? "28px" : "9px",
                              height: "9px",
                              border: "none",
                              borderRadius: "999px",
                              background: beneficioSlide % beneficiosDestacados.length === index ? "#f47c20" : "rgba(255,255,255,0.55)",
                              transition: "0.25s ease",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                  </article>

                  <aside style={{ display: "grid", gap: "12px" }}>
                    {[
                      [beneficiosBase.length, "Beneficios cargados"],
                      [beneficiosActivos, "Activos"],
                      [categoriasBeneficios.length, "Categorías"],
                    ].map(([valor, label]) => (
                      <article
                        key={label}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e6ebf2",
                          borderTop: "4px solid #07195a",
                          borderRadius: "18px",
                          padding: "20px",
                          minHeight: "86px",
                        }}
                      >
                        <strong style={{ display: "block", color: "#07195a", fontSize: "30px", marginBottom: "6px" }}>
                          {valor}
                        </strong>
                        <span style={{ color: "#56637a", fontSize: "11px", fontWeight: 950 }}>
                          {label}
                        </span>
                      </article>
                    ))}
                  </aside>
                </section>

                <section
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    border: "1px solid #e6ebf2",
                    borderRadius: "18px",
                    padding: "12px",
                    marginBottom: "18px",
                    background: "#ffffff",
                    overflowX: "auto",
                  }}
                >
                  <strong style={{ color: "#07195a", fontSize: "12px", textTransform: "uppercase", marginRight: "8px" }}>
                    Categorías
                  </strong>

                  {categoriasBeneficios.map((categoria) => (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={() => setCategoriaBeneficioActiva(categoria.id)}
                      style={{
                        minWidth: "104px",
                        height: "66px",
                        border: "1px solid #dfe6f3",
                        borderRadius: "14px",
                        background: categoriaBeneficioActiva === categoria.id ? "#07195a" : "#ffffff",
                        color: categoriaBeneficioActiva === categoria.id ? "#ffffff" : "#07195a",
                        display: "grid",
                        placeItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: 950,
                      }}
                    >
                      <img
                        src={categoria.icono}
                        alt=""
                        style={{
                          width: "24px",
                          height: "24px",
                          objectFit: "contain",
                          filter: categoriaBeneficioActiva === categoria.id ? "brightness(0) invert(1)" : "none",
                        }}
                      />
                      {categoria.nombre}
                    </button>
                  ))}
                </section>

                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "16px",
                    paddingBottom: "80px",
                  }}
                >
                  {beneficiosFiltrados.length === 0 ? (
                    <div className="pc-empty" style={{ gridColumn: "1 / -1" }}>
                      <h3>No hay beneficios en esta categoría</h3>
                      <p>Prueba seleccionando otra categoría o revisa nuevamente cuando el backend esté conectado.</p>
                    </div>
                  ) : (
                    beneficiosFiltrados.map((beneficio) => (
                      <article
                        key={beneficio.id_beneficio || beneficio.id}
                        style={{
                          minHeight: "260px",
                          border: "1px solid #e6ebf2",
                          borderRadius: "20px",
                          padding: "18px",
                          background: "#ffffff",
                          display: "grid",
                          gap: "12px",
                          boxShadow: "0 10px 28px rgba(7,25,90,0.05)",
                        }}
                      >
                        <div
                          style={{
                            width: "54px",
                            height: "54px",
                            borderRadius: "14px",
                            background: "#f3f6fb",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <img
                            src={beneficio.icono || beneficio.imagen || "/descuento.png"}
                            alt=""
                            style={{ width: "28px", height: "28px", objectFit: "contain" }}
                          />
                        </div>

                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "5px 10px",
                              borderRadius: "999px",
                              background: beneficio.estado === "proximamente" ? "#fff0e6" : "#ecfdf3",
                              color: beneficio.estado === "proximamente" ? "#f47c20" : "#067647",
                              fontSize: "11px",
                              fontWeight: 950,
                              marginBottom: "10px",
                            }}
                          >
                            {beneficio.estado === "proximamente" ? "Próximamente" : "Activo"}
                          </span>
                          <h3 style={{ margin: "0 0 8px", color: "#07195a", fontSize: "18px" }}>
                            {beneficio.titulo}
                          </h3>
                          <p style={{ margin: "0 0 8px", color: "#667085", fontSize: "13px", lineHeight: 1.5 }}>
                            {beneficio.descripcion || beneficio.bajada || "Beneficio disponible para clientes."}
                          </p>
                          <small style={{ color: "#56637a", fontWeight: 900 }}>
                            Vigencia: {formatearFecha(beneficio.vigencia)}
                          </small>

                          {beneficio.descuento && (
                            <strong style={{ display: "block", marginTop: "10px", color: "#f47c20", fontSize: "22px" }}>
                              {beneficio.descuento}
                            </strong>
                          )}

                          {(beneficio.bajada || beneficio.condiciones) && (
                            <small style={{ color: "#07195a", lineHeight: 1.45, fontWeight: 850 }}>
                              {beneficio.bajada || beneficio.condiciones}
                            </small>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => abrirWhatsApp(`Hola, quiero más información sobre el beneficio ${beneficio.descuento ? beneficio.descuento + " " : ""}de ${beneficio.titulo}`)}
                          style={{
                            alignSelf: "end",
                            minHeight: "40px",
                            border: "none",
                            borderRadius: "12px",
                            background: "#07195a",
                            color: "#ffffff",
                            fontWeight: 950,
                          }}
                        >
                          Solicitar información
                        </button>
                      </article>
                    ))
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Dashboard;
