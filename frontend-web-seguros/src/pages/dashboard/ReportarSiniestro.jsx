import { useState } from "react";

/**
 * Reportar Siniestro — vista del portal del cliente.
 *
 * Extraida del monolito Dashboard.jsx (era ~3.840 lineas dentro de un IIFE).
 * Maneja su propio estado (formulario de ~60 campos, paginacion, modo
 * digital/PDF, archivo de respaldo) y la generacion de PDF/HTML.
 *
 * CONTRATO DE DATOS:
 *   - polizas        -> broker (lista de polizas reportables). Hoy puede venir vacia.
 *   - datosPerfil    -> mi-backend (getMiCuenta): autocompleta el formulario.
 *   - nombreCliente  -> localStorage / mi-backend.
 *   - El listado de siniestros existentes viene de GET /portal/mis-siniestros
 *     (NO EXISTE AUN): hoy el arreglo interno arranca vacio a proposito.
 */
function ReportarSiniestro({ polizas = [], datosPerfil = {}, nombreCliente = "" }) {
  const [polizaReporteId, setPolizaReporteId] = useState("");
  const [siniestroSeleccionadoId, setSiniestroSeleccionadoId] = useState("");
  const [reporteSiniestroActivo, setReporteSiniestroActivo] = useState(false);
  const [paginaSiniestros, setPaginaSiniestros] = useState(1);
  const [formularioSiniestroAbierto, setFormularioSiniestroAbierto] =
    useState(false);
  const [modoFormularioSiniestro, setModoFormularioSiniestro] =
    useState("digital");
  const [mensajeFormularioSiniestro, setMensajeFormularioSiniestro] =
    useState("");
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

  return (
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
                    Math.ceil(totalSiniestros / CASOS_POR_PAGINA),
                  );
                  const paginaActualSiniestros = Math.min(
                    paginaSiniestros,
                    totalPaginasSiniestros,
                  );
                  const indiceInicioSiniestros =
                    (paginaActualSiniestros - 1) * CASOS_POR_PAGINA;
                  const indiceFinSiniestros =
                    indiceInicioSiniestros + CASOS_POR_PAGINA;
                  const siniestrosPaginados = siniestrosCliente.slice(
                    indiceInicioSiniestros,
                    indiceFinSiniestros,
                  );
                  const desdeSiniestro =
                    totalSiniestros === 0 ? 0 : indiceInicioSiniestros + 1;
                  const hastaSiniestro = Math.min(
                    indiceFinSiniestros,
                    totalSiniestros,
                  );

                  const polizasReportables = polizas.map((poliza, index) => ({
                    id: String(
                      poliza.id_poliza || poliza.numero_poliza || index,
                    ),
                    idPoliza: poliza.id_poliza || null,
                    nombre:
                      poliza.seguro?.nombre ||
                      poliza.nombre ||
                      "Seguro contratado",
                    categoria:
                      poliza.seguro?.categoria ||
                      poliza.categoria ||
                      "Pólizas vigentes",
                    poliza: poliza.numero_poliza || `Póliza ${index + 1}`,
                    compania: poliza.compania || "Compañía pendiente",
                    estado: poliza.estado || "vigente",
                  }));

                  const polizaSeleccionada =
                    polizasReportables.find(
                      (item) => item.id === polizaReporteId,
                    ) || polizasReportables[0];

                  const siniestroPorPoliza = siniestrosCliente.find(
                    (item) => item.poliza === polizaSeleccionada?.poliza,
                  );

                  const siniestroSeleccionado =
                    siniestrosCliente.find(
                      (item) => item.id === siniestroSeleccionadoId,
                    ) ||
                    siniestroPorPoliza ||
                    null;

                  const etapaActual =
                    siniestroSeleccionado?.etapaActual ||
                    (reporteSiniestroActivo ? 1 : 0);

                  const categoriasReportables = polizasReportables.reduce(
                    (acc, item) => {
                      if (!acc[item.categoria]) acc[item.categoria] = [];
                      acc[item.categoria].push(item);
                      return acc;
                    },
                    {},
                  );

                  const seleccionarPoliza = (idPoliza) => {
                    setPolizaReporteId(idPoliza);
                    setReporteSiniestroActivo(false);
                    setPaginaSiniestros(1);

                    const nuevaPoliza = polizasReportables.find(
                      (item) => item.id === idPoliza,
                    );
                    const caso = siniestrosCliente.find(
                      (item) => item.poliza === nuevaPoliza?.poliza,
                    );
                    setSiniestroSeleccionadoId(caso?.id || "");
                  };

                  const seleccionarCaso = (caso) => {
                    setSiniestroSeleccionadoId(caso.id);
                    const polizaCaso = polizasReportables.find(
                      (item) => item.poliza === caso.poliza,
                    );
                    if (polizaCaso) setPolizaReporteId(polizaCaso.id);
                    setReporteSiniestroActivo(false);
                  };

                  const reportarSiniestro = () => {
                    if (!polizaSeleccionada) return;
                    setReporteSiniestroActivo(true);
                    const caso = siniestrosCliente.find(
                      (item) => item.poliza === polizaSeleccionada.poliza,
                    );
                    setSiniestroSeleccionadoId(caso?.id || "");
                  };

                  const datosClienteFormulario = {
                    nombre: datosPerfil.nombre || nombreCliente || "Cliente",
                    rut:
                      datosPerfil.rut ||
                      localStorage.getItem("rut_cliente") ||
                      "12.456.789-3",
                    correo:
                      datosPerfil.correo ||
                      localStorage.getItem("correo_cliente") ||
                      "",
                    telefono:
                      datosPerfil.telefono ||
                      localStorage.getItem("telefono_cliente") ||
                      "",
                    direccion:
                      datosPerfil.direccion ||
                      localStorage.getItem("direccion_cliente") ||
                      "",
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
                    const formularioPDF = opciones.enBlanco
                      ? {}
                      : formularioSiniestro;
                    const datosClientePDF = opciones.enBlanco
                      ? {}
                      : datosClienteFormulario;
                    const anexosPDF = opciones.enBlanco
                      ? []
                      : Array.isArray(archivoRespaldoSiniestro)
                        ? archivoRespaldoSiniestro
                        : archivoRespaldoSiniestro
                          ? [archivoRespaldoSiniestro]
                          : [];
                    const v = (valor) => escapeHtmlSiniestro(valor || "");
                    const polizaActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.poliza || "";
                    const seguroActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.nombre || "";
                    const companiaActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.compania || "";
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
                                      : fila(
                                          "Archivos adjuntos",
                                          "Sin anexos adjuntos",
                                        )
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

                      const scriptExistente = document.querySelector(
                        'script[data-pc-html2pdf="true"]',
                      );

                      if (scriptExistente) {
                        scriptExistente.addEventListener("load", () =>
                          resolve(window.html2pdf),
                        );
                        scriptExistente.addEventListener("error", reject);
                        return;
                      }

                      const script = document.createElement("script");
                      script.src =
                        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                      script.async = true;
                      script.dataset.pcHtml2pdf = "true";
                      script.onload = () => resolve(window.html2pdf);
                      script.onerror = () =>
                        reject(
                          new Error(
                            "No se pudo cargar el generador PDF visual.",
                          ),
                        );
                      document.body.appendChild(script);
                    });

                  const crearPdfVisualFormularioSiniestro = async (
                    opciones = {},
                  ) => {
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
                    const documento =
                      iframe.contentDocument || iframe.contentWindow.document;
                    documento.open();
                    documento.write(html);
                    documento.close();

                    await new Promise((resolve) => {
                      setTimeout(resolve, 450);
                    });

                    const hoja =
                      documento.querySelector(".sheet") || documento.body;
                    const opcionesPdf = {
                      margin: [0, 0, 0, 0],
                      filename:
                        opciones.nombreArchivo ||
                        "Formulario_Siniestro_Prieto_Correa.pdf",
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
                      return await html2pdf()
                        .set(opcionesPdf)
                        .from(hoja)
                        .outputPdf("blob");
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
                    const palabras = limpiarTextoPdfSiniestro(texto)
                      .split(" ")
                      .filter(Boolean);
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

                          const ctxOrigen = origen.getContext("2d", {
                            willReadFrequently: true,
                          });
                          ctxOrigen.fillStyle = "#ffffff";
                          ctxOrigen.fillRect(0, 0, origen.width, origen.height);
                          ctxOrigen.drawImage(imagen, 0, 0);

                          const pixels = ctxOrigen.getImageData(
                            0,
                            0,
                            origen.width,
                            origen.height,
                          ).data;
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
                          const proporcion = Math.min(
                            maxAncho / cropW,
                            maxAlto / cropH,
                          );
                          const ancho = Math.max(
                            1,
                            Math.round(cropW * proporcion),
                          );
                          const alto = Math.max(
                            1,
                            Math.round(cropH * proporcion),
                          );

                          const canvas = document.createElement("canvas");
                          canvas.width = ancho * 3;
                          canvas.height = alto * 3;

                          const ctx = canvas.getContext("2d");
                          ctx.fillStyle = "#ffffff";
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(
                            origen,
                            minX,
                            minY,
                            cropW,
                            cropH,
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                          );

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
                    const formularioPDF = opciones.enBlanco
                      ? {}
                      : formularioSiniestro;
                    const datosClientePDF = opciones.enBlanco
                      ? {}
                      : datosClienteFormulario;
                    const anexosPDF = opciones.enBlanco
                      ? []
                      : Array.isArray(archivoRespaldoSiniestro)
                        ? archivoRespaldoSiniestro
                        : archivoRespaldoSiniestro
                          ? [archivoRespaldoSiniestro]
                          : [];

                    const polizaActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.poliza || "";
                    const seguroActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.nombre || "";
                    const companiaActual = opciones.enBlanco
                      ? ""
                      : polizaSeleccionada?.compania || "";
                    const fechaEmision = new Date().toLocaleDateString("es-CL");
                    const horaEmision = new Date().toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const valor = (dato) =>
                      limpiarTextoPdfSiniestro(dato || "Pendiente");
                    const logoPdf =
                      await cargarLogoPdfSiniestro("/Logo Prieto.png");

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

                    const color = (rgb) =>
                      rgb.map((n) => (n / 255).toFixed(3)).join(" ");

                    const rect = (x, yBottom, w, h, fill, stroke = null) => {
                      if (fill)
                        comandos.push(
                          `${color(fill)} rg ${x} ${yBottom} ${w} ${h} re f`,
                        );
                      if (stroke)
                        comandos.push(
                          `${color(stroke)} RG 0.8 w ${x} ${yBottom} ${w} ${h} re S`,
                        );
                    };

                    const rectRedondeado = (
                      x,
                      yBottom,
                      w,
                      h,
                      r,
                      fill,
                      stroke = null,
                    ) => {
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
                        comandos.push(
                          `${color(fill)} rg ${color(stroke)} RG 0.8 w ${path} B`,
                        );
                      } else if (fill) {
                        comandos.push(`${color(fill)} rg ${path} f`);
                      } else if (stroke) {
                        comandos.push(`${color(stroke)} RG 0.8 w ${path} S`);
                      }
                    };

                    const imagenPdf = (nombre, x, yBottom, w, h) => {
                      comandos.push(
                        `q ${w} 0 0 ${h} ${x} ${yBottom} cm /${nombre} Do Q`,
                      );
                    };

                    const texto = (x, yText, contenido, opcionesTexto = {}) => {
                      const tamano = opcionesTexto.tamano || 9;
                      const fuente = opcionesTexto.negrita ? "/F2" : "/F1";
                      const rgb = opcionesTexto.color || azul;
                      comandos.push(
                        `${color(rgb)} rg BT ${fuente} ${tamano} Tf ${x} ${yText} Td (${escaparPdfSiniestro(contenido)}) Tj ET`,
                      );
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
                        const escalaLogo = Math.min(
                          logoMaxW / logoPdf.ancho,
                          logoMaxH / logoPdf.alto,
                          1,
                        );
                        const logoW = logoPdf.ancho * escalaLogo;
                        const logoH = logoPdf.alto * escalaLogo;
                        imagenPdf(
                          "ImLogo",
                          margen + 16,
                          logoY + (42 - logoH) / 2 - 3,
                          logoW,
                          logoH,
                        );
                      } else {
                        texto(margen + 18, altoPagina - 56, "PRIETO & CORREA", {
                          tamano: 10,
                          negrita: true,
                          color: [255, 255, 255],
                        });
                      }

                      const tituloX = margen + 140;
                      const inputX = margen + anchoContenido - 110;
                      const camposX = inputX - 60;
                      const inputW = 92;
                      const inputH = 16;

                      texto(
                        tituloX,
                        altoPagina - 52,
                        "FORMULARIO DENUNCIO DE SINIESTRO",
                        {
                          tamano: 10.2,
                          negrita: true,
                          color: [255, 255, 255],
                        },
                      );

                      texto(
                        tituloX,
                        altoPagina - 68,
                        "Portal Clientes Prieto & Correa Seguros",
                        {
                          tamano: 7.2,
                          color: [255, 255, 255],
                        },
                      );

                      texto(
                        tituloX,
                        altoPagina - 84,
                        `Fecha de emision: ${fechaEmision} ${horaEmision}`,
                        {
                          tamano: 6.7,
                          color: [218, 226, 245],
                        },
                      );

                      // Campos manuales para completar después de emitir o imprimir.
                      texto(camposX, altoPagina - 54, "N° de Siniestro:", {
                        tamano: 6.7,
                        negrita: true,
                        color: [255, 255, 255],
                      });

                      rect(
                        inputX,
                        altoPagina - 62,
                        inputW,
                        inputH,
                        [255, 255, 255],
                        [220, 226, 238],
                      );

                      texto(camposX, altoPagina - 78, "Estado:", {
                        tamano: 6.7,
                        negrita: true,
                        color: [255, 255, 255],
                      });

                      rect(
                        inputX,
                        altoPagina - 86,
                        inputW,
                        inputH,
                        [255, 255, 255],
                        [220, 226, 238],
                      );

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
                      rectRedondeado(
                        margen,
                        y - 26,
                        anchoContenido,
                        26,
                        10,
                        [255, 230, 210],
                        null,
                      );
                      texto(margen + 12, y - 17, titulo, {
                        tamano: 10,
                        negrita: true,
                        color: azul,
                      });
                      y -= 38;
                    };

                    const campoPdf = (
                      x,
                      yTop,
                      w,
                      h,
                      label,
                      value,
                      altoLinea = 10,
                    ) => {
                      rectRedondeado(
                        x,
                        yTop - h,
                        w,
                        h,
                        10,
                        grisFondo,
                        grisBorde,
                      );
                      texto(x + 9, yTop - 13, label, {
                        tamano: 6.5,
                        negrita: true,
                        color: textoGris,
                      });
                      const maximo = Math.max(18, Math.floor(w / 5.2));
                      const lineas = dividirLineaPdfSiniestro(
                        valor(value),
                        maximo,
                      ).slice(0, Math.max(1, Math.floor((h - 21) / altoLinea)));
                      lineas.forEach((linea, index) => {
                        texto(x + 9, yTop - 28 - index * altoLinea, linea, {
                          tamano: 8.5,
                          negrita: true,
                          color: azul,
                        });
                      });
                    };

                    const filaCampos = (campos, columnas = 3, alto = 48) => {
                      asegurarEspacio(alto + 10);
                      const gap = 10;
                      const w =
                        (anchoContenido - gap * (columnas - 1)) / columnas;
                      campos.forEach((item, index) => {
                        const x = margen + (w + gap) * index;
                        campoPdf(
                          x,
                          y,
                          w,
                          alto,
                          item[0],
                          item[1],
                          item[2] || 10,
                        );
                      });
                      y -= alto + 10;
                    };

                    const cuadroTexto = (label, value, alto = 76) => {
                      asegurarEspacio(alto + 10);
                      campoPdf(
                        margen,
                        y,
                        anchoContenido,
                        alto,
                        label,
                        value,
                        10,
                      );
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
                      [
                        "Direccion",
                        formularioPDF.aseguradoDireccion ||
                          datosClientePDF.direccion,
                      ],
                      [
                        "Ciudad",
                        formularioPDF.aseguradoCiudad ||
                          formularioPDF.ciudadOcurrencia,
                      ],
                    ]);
                    filaCampos([
                      [
                        "Denunciante",
                        formularioPDF.denunciante || datosClientePDF.nombre,
                      ],
                      [
                        "R.U.T denunciante",
                        formularioPDF.denuncianteRut || datosClientePDF.rut,
                      ],
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
                      [
                        "Relacion con asegurado",
                        formularioPDF.relacionConductor,
                      ],
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
                      [
                        "Direccion ocurrencia",
                        formularioPDF.direccionOcurrencia,
                      ],
                      ["Ciudad", formularioPDF.ciudadOcurrencia],
                      ["Region", formularioPDF.regionOcurrencia],
                    ]);
                    filaCampos([
                      ["Hora ocurrencia", formularioPDF.horaSiniestro],
                      ["Lugar inspeccion", formularioPDF.lugarInspeccion],
                      [
                        "Siniestro dia",
                        formularioPDF.siniestroDia ||
                          fechaFormateada(formularioPDF.fechaSiniestro),
                      ],
                    ]);
                    cuadroTexto(
                      "Relato de los hechos",
                      formularioPDF.relatoHechos,
                      86,
                    );

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
                    cuadroTexto(
                      "Observaciones",
                      formularioPDF.observaciones,
                      64,
                    );

                    seccion("ANEXOS");
                    if (anexosPDF.length) {
                      anexosPDF.forEach((archivo, index) => {
                        filaCampos(
                          [
                            [
                              `Anexo ${index + 1}`,
                              archivo.name || "Archivo adjunto",
                            ],
                          ],
                          1,
                          42,
                        );
                      });
                    } else {
                      filaCampos(
                        [["Archivos adjuntos", "Sin anexos adjuntos"]],
                        1,
                        42,
                      );
                    }

                    asegurarEspacio(82);
                    y -= 8;
                    const firmaW = (anchoContenido - 22) / 2;
                    rectRedondeado(
                      margen,
                      y - 54,
                      firmaW,
                      54,
                      12,
                      [255, 255, 255],
                      grisBorde,
                    );
                    rectRedondeado(
                      margen + firmaW + 22,
                      y - 54,
                      firmaW,
                      54,
                      12,
                      [255, 255, 255],
                      grisBorde,
                    );
                    texto(margen + 20, y - 26, "Firma asegurado", {
                      tamano: 9,
                      negrita: true,
                      color: azul,
                    });
                    texto(
                      margen + firmaW + 42,
                      y - 26,
                      "Recepcion ejecutivo comercial",
                      { tamano: 9, negrita: true, color: azul },
                    );
                    y -= 70;

                    asegurarEspacio(52);
                    rectRedondeado(
                      margen,
                      y - 42,
                      anchoContenido,
                      42,
                      12,
                      [248, 250, 255],
                      grisBorde,
                    );
                    texto(
                      margen + 12,
                      y - 17,
                      "Documento generado digitalmente desde el Portal Clientes de Prieto & Correa Seguros.",
                      { tamano: 8, color: textoGris },
                    );
                    texto(
                      margen + 12,
                      y - 31,
                      "La informacion declarada debe ser respaldada con fotografias, constancias, presupuestos o informes.",
                      { tamano: 8, color: textoGris },
                    );

                    cerrarPagina();

                    let objetos = [];
                    const agregarObjeto = (contenido) => {
                      objetos.push(contenido);
                      return objetos.length;
                    };

                    const catalogoId = agregarObjeto(
                      "<< /Type /Catalog /Pages 2 0 R >>",
                    );
                    const pagesPlaceholderId =
                      agregarObjeto("PAGES_PLACEHOLDER");
                    const fontRegularId = agregarObjeto(
                      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
                    );
                    const fontBoldId = agregarObjeto(
                      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
                    );
                    const logoObjetoId = logoPdf
                      ? agregarObjeto(
                          `<< /Type /XObject /Subtype /Image /Width ${logoPdf.canvasAncho} /Height ${logoPdf.canvasAlto} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoPdf.binario.length} >>\nstream\n${logoPdf.binario}\nendstream`,
                        )
                      : null;

                    const pageIds = [];
                    paginas.forEach((stream) => {
                      const contenidoId = agregarObjeto(
                        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
                      );
                      const recursosImagen = logoObjetoId
                        ? `/XObject << /ImLogo ${logoObjetoId} 0 R >>`
                        : "";
                      const paginaId = agregarObjeto(
                        `<< /Type /Page /Parent ${pagesPlaceholderId} 0 R /MediaBox [0 0 ${anchoPagina} ${altoPagina}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> ${recursosImagen} >> /Contents ${contenidoId} 0 R >>`,
                      );
                      pageIds.push(paginaId);
                    });

                    objetos[pagesPlaceholderId - 1] =
                      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

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

                  const construirLineasFormularioSiniestro = (opciones = {}) =>
                    opciones;

                  const descargarBlobFormularioSiniestro = (
                    blob,
                    nombreArchivo,
                  ) => {
                    const url = URL.createObjectURL(blob);
                    const enlace = document.createElement("a");

                    enlace.href = url;
                    enlace.download = nombreArchivo;
                    document.body.appendChild(enlace);
                    enlace.click();
                    enlace.remove();

                    setTimeout(() => URL.revokeObjectURL(url), 1200);
                  };

                  const descargarPdfFormulario = async (
                    nombreArchivo,
                    opciones = {},
                  ) => {
                    const blobPdf = await crearPdfSiniestro(
                      construirLineasFormularioSiniestro(opciones),
                    );
                    descargarBlobFormularioSiniestro(blobPdf, nombreArchivo);
                    return blobPdf;
                  };

                  const descargarFormularioEnBlanco = async () => {
                    await descargarPdfFormulario(
                      "Formulario_Siniestro_Blanco_Prieto_Correa.pdf",
                      { enBlanco: true },
                    );

                    setMensajeFormularioSiniestro(
                      "PDF en blanco descargado correctamente.",
                    );
                  };

                  const descargarFormularioCompletado = async () => {
                    await descargarPdfFormulario(
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf",
                    );

                    setMensajeFormularioSiniestro(
                      "PDF descargado correctamente. El archivo queda listo para enviar o guardar.",
                    );
                  };

                  const enviarFormularioAEjecutivo = async () => {
                    const pdfBlob = await descargarPdfFormulario(
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf",
                    );
                    const archivoFormulario = new File(
                      [pdfBlob],
                      "Formulario_Siniestro_Completado_Prieto_Correa.pdf",
                      { type: "application/pdf" },
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

                        setMensajeFormularioSiniestro(
                          "Formulario PDF compartido con el ejecutivo correctamente.",
                        );
                        return;
                      }
                    } catch {
                      setMensajeFormularioSiniestro(
                        "No se pudo compartir directamente. Se descargara el PDF para que lo adjuntes.",
                      );
                    }

                    setMensajeFormularioSiniestro(
                      "PDF descargado. Se abrira WhatsApp con el mensaje listo; adjunta el PDF descargado y los respaldos antes de enviarlo.",
                    );
                    abrirWhatsApp(
                      `${resumen}\n\nAdjunto el PDF descargado del formulario y sus respaldos.`,
                    );
                  };

                  const casosActivos = siniestrosCliente.filter(
                    (item) => item.tipoEstado !== "cerrado",
                  ).length;
                  const enGestion = siniestrosCliente.filter(
                    (item) => item.tipoEstado === "gestion",
                  ).length;
                  const pendientes = siniestrosCliente.filter(
                    (item) => item.tipoEstado === "pendiente",
                  ).length;
                  const cerrados = siniestrosCliente.filter(
                    (item) => item.tipoEstado === "cerrado",
                  ).length;

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
                    {
                      numero: 2,
                      titulo: "En revisión",
                      texto: "Evaluación inicial",
                    },
                    {
                      numero: 3,
                      titulo: "Documentación",
                      texto: "Respaldo del cliente",
                    },
                    {
                      numero: 4,
                      titulo: "Resolución",
                      texto: "Cierre del caso",
                    },
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
                    const valor =
                      opciones.valor !== undefined
                        ? opciones.valor
                        : formularioSiniestro[campo] || "";
                    const onChange = (event) =>
                      actualizarFormularioSiniestro(campo, event.target.value);
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
                          <select
                            value={valor}
                            onChange={onChange}
                            style={estiloBase}
                            disabled={disabled}
                          >
                            {(opciones.items || []).map((item) => (
                              <option
                                key={item}
                                value={item === "Seleccionar" ? "" : item}
                              >
                                {item}
                              </option>
                            ))}
                          </select>
                        ) : tipo === "textarea" ? (
                          <textarea
                            value={valor}
                            onChange={onChange}
                            placeholder={opciones.placeholder || ""}
                            style={estiloBase}
                            disabled={disabled}
                          />
                        ) : (
                          <input
                            type={tipo}
                            value={valor}
                            onChange={onChange}
                            placeholder={opciones.placeholder || ""}
                            style={estiloBase}
                            disabled={disabled}
                          />
                        )}
                      </label>
                    );
                  };

                  const uploadRequerido =
                    siniestroSeleccionado?.tipoEstado === "pendiente" ||
                    reporteSiniestroActivo;
                  const estadoActual = siniestroSeleccionado
                    ? estadoMeta(siniestroSeleccionado.tipoEstado)
                    : {
                        texto: reporteSiniestroActivo
                          ? "Reporte iniciado"
                          : "Sin caso activo",
                      };

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
                            Reporta, revisa y da seguimiento a tus casos
                            asociados a tus pólizas.
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
                            <span style={{ fontSize: "17px", lineHeight: 1 }}>
                              ▣
                            </span>
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
                                gridTemplateColumns:
                                  "repeat(4, minmax(0, 1fr))",
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
                                    background:
                                      etapaActual >= 3 ? "#f47c20" : "#07195a",
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
                                        background: esActual
                                          ? "#f47c20"
                                          : completado
                                            ? "#07195a"
                                            : "#ffffff",
                                        color:
                                          esActual || completado
                                            ? "#ffffff"
                                            : "#07195a",
                                        border: esActual
                                          ? "2px solid #f47c20"
                                          : "2px solid #d9e2ef",
                                        fontWeight: 950,
                                        fontSize: "16px",
                                        boxShadow: esActual
                                          ? "0 0 0 7px rgba(244, 124, 32, 0.12)"
                                          : "none",
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
                                        background: esActual
                                          ? "rgba(244, 124, 32, 0.08)"
                                          : "transparent",
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
                                    {[
                                      "N° Caso",
                                      "Seguro / póliza",
                                      "Estado",
                                      "Ejecutivo",
                                      "Fecha",
                                    ].map((titulo) => (
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
                                        Selecciona una póliza vigente y presiona
                                        “Reporta tu siniestro” para iniciar un
                                        caso.
                                      </td>
                                    </tr>
                                  ) : (
                                    siniestrosPaginados.map((siniestro) => {
                                      const activo =
                                        siniestroSeleccionado?.id ===
                                        siniestro.id;
                                      const meta = estadoMeta(
                                        siniestro.tipoEstado,
                                      );

                                      return (
                                        <tr
                                          key={siniestro.id}
                                          onClick={() =>
                                            seleccionarCaso(siniestro)
                                          }
                                          style={{
                                            cursor: "pointer",
                                            background: activo
                                              ? "#fff7ed"
                                              : "#ffffff",
                                            outline: activo
                                              ? "1px solid rgba(244, 124, 32, 0.42)"
                                              : "none",
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
                                            <strong
                                              style={{
                                                display: "block",
                                                fontWeight: 950,
                                              }}
                                            >
                                              {siniestro.seguro}
                                            </strong>
                                            <span
                                              style={{
                                                color: "#667085",
                                                fontSize: "11px",
                                                fontWeight: 850,
                                              }}
                                            >
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
                                                style={{
                                                  width: "13px",
                                                  height: "13px",
                                                  objectFit: "contain",
                                                }}
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
                                  Mostrando {desdeSiniestro}-{hastaSiniestro} de{" "}
                                  {totalSiniestros} casos
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
                                      setPaginaSiniestros((pagina) =>
                                        Math.max(1, pagina - 1),
                                      )
                                    }
                                    disabled={paginaActualSiniestros === 1}
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      background:
                                        paginaActualSiniestros === 1
                                          ? "#f5f7fb"
                                          : "#ffffff",
                                      color:
                                        paginaActualSiniestros === 1
                                          ? "#98a2b3"
                                          : "#07195a",
                                      borderRadius: "10px",
                                      padding: "6px 9px",
                                      fontWeight: 950,
                                      cursor:
                                        paginaActualSiniestros === 1
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    ‹
                                  </button>

                                  {Array.from(
                                    { length: totalPaginasSiniestros },
                                    (_, index) => index + 1,
                                  ).map((pagina) => (
                                    <button
                                      key={pagina}
                                      type="button"
                                      onClick={() =>
                                        setPaginaSiniestros(pagina)
                                      }
                                      style={{
                                        border:
                                          paginaActualSiniestros === pagina
                                            ? "1px solid #07195a"
                                            : "1px solid #d9e2ef",
                                        background:
                                          paginaActualSiniestros === pagina
                                            ? "#07195a"
                                            : "#ffffff",
                                        color:
                                          paginaActualSiniestros === pagina
                                            ? "#ffffff"
                                            : "#07195a",
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
                                        Math.min(
                                          totalPaginasSiniestros,
                                          pagina + 1,
                                        ),
                                      )
                                    }
                                    disabled={
                                      paginaActualSiniestros ===
                                      totalPaginasSiniestros
                                    }
                                    style={{
                                      border: "1px solid #d9e2ef",
                                      background:
                                        paginaActualSiniestros ===
                                        totalPaginasSiniestros
                                          ? "#f5f7fb"
                                          : "#ffffff",
                                      color:
                                        paginaActualSiniestros ===
                                        totalPaginasSiniestros
                                          ? "#98a2b3"
                                          : "#07195a",
                                      borderRadius: "10px",
                                      padding: "6px 9px",
                                      fontWeight: 950,
                                      cursor:
                                        paginaActualSiniestros ===
                                        totalPaginasSiniestros
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
                              {siniestrosCliente.length > 0
                                ? "Última actualización: hoy, 00:18"
                                : "Sin casos registrados"}
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
                              Selecciona tu póliza vigente y luego presiona
                              “Reporta tu siniestro”.
                            </p>

                            <select
                              disabled={polizasReportables.length === 0}
                              value={polizaSeleccionada?.id || ""}
                              onChange={(event) =>
                                seleccionarPoliza(event.target.value)
                              }
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
                                <option value="">
                                  No tienes pólizas vigentes registradas
                                </option>
                              ) : (
                                Object.entries(categoriasReportables).map(
                                  ([categoria, items]) => (
                                    <optgroup
                                      key={categoria}
                                      label={`${categoria} (${items.length})`}
                                    >
                                      {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                          {item.nombre} · {item.poliza}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ),
                                )
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
                                  {polizaSeleccionada.categoria} ·{" "}
                                  {polizaSeleccionada.poliza}
                                </span>

                                <span
                                  style={{
                                    display: "block",
                                    marginTop: "7px",
                                    color: reporteSiniestroActivo
                                      ? "#067647"
                                      : "#475467",
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
                                Cuando el backend entregue tus pólizas vigentes,
                                podrás seleccionar una aquí para iniciar el
                                reporte.
                              </div>
                            )}
                          </section>
                        </aside>
                      </div>

                      <section
                        style={{
                          marginTop: "10px",
                          borderRadius: "18px",
                          background:
                            "linear-gradient(135deg, #07195a 0%, #031344 100%)",
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
                            <span style={{ fontSize: "24px", lineHeight: 1 }}>
                              👤
                            </span>
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
                              {siniestroSeleccionado?.ejecutivo ||
                                "Pendiente asignación"}
                            </strong>

                            <p
                              style={{
                                margin: "3px 0 0",
                                opacity: 0.9,
                                fontSize: "11px",
                                lineHeight: 1.35,
                              }}
                            >
                              Acompañamiento en denuncia, respaldo y seguimiento
                              con la compañía.
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
                            Lunes a viernes
                            <br />
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
                            {siniestroSeleccionado
                              ? estadoActual.texto
                              : "Sin caso seleccionado"}
                            <br />
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
                                background:
                                  "linear-gradient(135deg, #07195a, #031344)",
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
                                  Puedes completarlo en línea con tus datos
                                  precargados o descargar el PDF manual para
                                  imprimirlo, llenarlo y enviarlo a tu ejecutivo
                                  comercial.
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
                                      gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                      gap: "18px",
                                    }}
                                  >
                                    <article
                                      style={{
                                        padding: "24px",
                                        borderRadius: "22px",
                                        border: "1px solid #e6ebf2",
                                        background:
                                          "radial-gradient(circle at top right, rgba(244, 124, 32, 0.12), transparent 35%), #ffffff",
                                        boxShadow:
                                          "0 14px 34px rgba(7, 25, 90, 0.07)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "56px",
                                          height: "56px",
                                          borderRadius: "18px",
                                          display: "grid",
                                          placeItems: "center",
                                          background:
                                            "rgba(244, 124, 32, 0.13)",
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
                                        Ideal para usar desde el teléfono. El
                                        sistema precarga tus datos de cliente y
                                        póliza, y luego puedes guardar el
                                        documento como PDF.
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setModoFormularioSiniestro("digital")
                                        }
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
                                        boxShadow:
                                          "0 14px 34px rgba(7, 25, 90, 0.05)",
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
                                        Pensado para clientes que prefieren
                                        imprimir, llenar a mano o guardar el
                                        documento para enviarlo después a su
                                        ejecutivo.
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
                                    Importante: guarda el PDF en tu teléfono
                                    para enviarlo por WhatsApp o correo a tu
                                    ejecutivo comercial. Para que la descarga
                                    manual funcione, deja el archivo en{" "}
                                    <strong>
                                      public/formulario-siniestro.pdf
                                    </strong>
                                    .
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
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Datos generales
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "numeroSiniestro",
                                          "N° siniestro",
                                          {
                                            placeholder:
                                              "Lo completa la compañía",
                                          },
                                        )}
                                        {campoSiniestro(
                                          "liquidador",
                                          "Liquidador",
                                          { placeholder: "Si ya fue asignado" },
                                        )}
                                        <label
                                          style={{
                                            display: "grid",
                                            gap: "7px",
                                            color: "#07195a",
                                            fontSize: "12px",
                                            fontWeight: 950,
                                          }}
                                        >
                                          Póliza asociada
                                          <select
                                            value={polizaSeleccionada?.id || ""}
                                            onChange={(event) =>
                                              seleccionarPoliza(
                                                event.target.value,
                                              )
                                            }
                                            style={{
                                              height: "44px",
                                              border: "1px solid #d9e2ef",
                                              borderRadius: "12px",
                                              padding: "0 12px",
                                              color: "#07195a",
                                              fontWeight: 850,
                                            }}
                                          >
                                            {polizasReportables.length === 0 ? (
                                              <option value="">
                                                No tienes pólizas vigentes
                                                registradas
                                              </option>
                                            ) : (
                                              polizasReportables.map(
                                                (poliza) => (
                                                  <option
                                                    key={poliza.id}
                                                    value={poliza.id}
                                                  >
                                                    {poliza.nombre} —{" "}
                                                    {poliza.poliza} —{" "}
                                                    {poliza.compania}
                                                  </option>
                                                ),
                                              )
                                            )}
                                          </select>
                                        </label>
                                        {campoSiniestro("polizaItem", "Item")}
                                        {campoSiniestro(
                                          "fechaSiniestro",
                                          "Fecha del siniestro",
                                          { tipo: "date" },
                                        )}
                                        {campoSiniestro(
                                          "horaSiniestro",
                                          "Hora ocurrencia",
                                          { tipo: "time" },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes del asegurado
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "nombreAuto",
                                          "Nombre",
                                          {
                                            valor:
                                              datosClienteFormulario.nombre,
                                            disabled: true,
                                          },
                                        )}
                                        {campoSiniestro("rutAuto", "R.U.T", {
                                          valor: datosClienteFormulario.rut,
                                          disabled: true,
                                        })}
                                        {campoSiniestro(
                                          "telefonoAuto",
                                          "Teléfono",
                                          {
                                            valor:
                                              datosClienteFormulario.telefono,
                                            disabled: true,
                                          },
                                        )}
                                        {campoSiniestro("emailAuto", "E-mail", {
                                          valor: datosClienteFormulario.correo,
                                          disabled: true,
                                        })}
                                        {campoSiniestro(
                                          "aseguradoDireccion",
                                          "Dirección",
                                          {
                                            valor:
                                              formularioSiniestro.aseguradoDireccion ||
                                              datosClienteFormulario.direccion,
                                            placeholder:
                                              "Dirección registrada o actual",
                                          },
                                        )}
                                        {campoSiniestro(
                                          "aseguradoCiudad",
                                          "Ciudad",
                                        )}
                                        {campoSiniestro(
                                          "denunciante",
                                          "Denunciante",
                                          {
                                            valor:
                                              formularioSiniestro.denunciante ||
                                              datosClienteFormulario.nombre,
                                          },
                                        )}
                                        {campoSiniestro(
                                          "denuncianteRut",
                                          "R.U.T denunciante",
                                          {
                                            valor:
                                              formularioSiniestro.denuncianteRut ||
                                              datosClienteFormulario.rut,
                                          },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes del conductor
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "conductorNombre",
                                          "Nombre",
                                        )}
                                        {campoSiniestro(
                                          "conductorRut",
                                          "R.U.T",
                                        )}
                                        {campoSiniestro(
                                          "conductorTelefono",
                                          "Teléfono",
                                        )}
                                        {campoSiniestro(
                                          "conductorDireccion",
                                          "Dirección",
                                        )}
                                        {campoSiniestro(
                                          "conductorCiudad",
                                          "Ciudad",
                                        )}
                                        {campoSiniestro(
                                          "conductorRegion",
                                          "Región",
                                        )}
                                        {campoSiniestro(
                                          "conductorComuna",
                                          "Comuna",
                                        )}
                                        {campoSiniestro(
                                          "licenciaNumero",
                                          "N° licencia conducir",
                                        )}
                                        {campoSiniestro(
                                          "licenciaVigencia",
                                          "Vigencia licencia",
                                        )}
                                        {campoSiniestro(
                                          "licenciaClase",
                                          "Clase",
                                        )}
                                        {campoSiniestro(
                                          "conductorEdad",
                                          "Edad",
                                          { tipo: "number" },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes del vehículo
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "vehiculoMarca",
                                          "Marca",
                                        )}
                                        {campoSiniestro(
                                          "vehiculoModelo",
                                          "Modelo",
                                        )}
                                        {campoSiniestro("vehiculoAnio", "Año")}
                                        {campoSiniestro(
                                          "vehiculoPatente",
                                          "Patente",
                                        )}
                                        {campoSiniestro(
                                          "vehiculoMotor",
                                          "N° de motor",
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes del siniestro
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "direccionOcurrencia",
                                          "Dirección de ocurrencia",
                                          {
                                            placeholder:
                                              "Lugar exacto donde ocurrió",
                                          },
                                        )}
                                        {campoSiniestro(
                                          "ciudadOcurrencia",
                                          "Ciudad",
                                        )}
                                        {campoSiniestro(
                                          "regionOcurrencia",
                                          "Región",
                                        )}
                                        {campoSiniestro(
                                          "lugarInspeccion",
                                          "Lugar de inspección",
                                          {
                                            full: true,
                                            placeholder:
                                              "Dónde se encuentra el vehículo",
                                          },
                                        )}
                                        {campoSiniestro(
                                          "relatoHechos",
                                          "Relato de los hechos",
                                          {
                                            tipo: "textarea",
                                            full: true,
                                            placeholder:
                                              "Describe claramente qué ocurrió, dónde, cómo y quiénes participaron.",
                                          },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Daños al vehículo
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "tipoDano",
                                          "Tipo de daños",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Daños materiales",
                                              "Robo del vehículo",
                                              "Robo de accesorios",
                                              "Robo de partes o piezas",
                                              "Otro",
                                            ],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "partesAfectadas",
                                          "Partes afectadas",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Delantera",
                                              "Trasera",
                                              "Costado izquierdo",
                                              "Costado derecho",
                                              "Más de una parte",
                                            ],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "magnitudDanos",
                                          "Magnitud de daños",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Leves",
                                              "Medianos",
                                              "Graves",
                                            ],
                                          },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes del tercero
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "existeTercero",
                                          "Existe tercero",
                                          {
                                            tipo: "select",
                                            items: ["Seleccionar", "Sí", "No"],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "terceroReclama",
                                          "Reclama",
                                          {
                                            tipo: "select",
                                            items: ["Seleccionar", "Sí", "No"],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "terceroSeguro",
                                          "Con seguro de daños",
                                          {
                                            tipo: "select",
                                            items: ["Seleccionar", "Sí", "No"],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "terceroCompania",
                                          "¿En qué compañía?",
                                        )}
                                        {campoSiniestro(
                                          "terceroCulpable",
                                          "3° culpable",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Sí",
                                              "No",
                                              "Por determinar",
                                            ],
                                          },
                                        )}
                                        {campoSiniestro(
                                          "terceroDano",
                                          "Daño del 3°",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Leves",
                                              "Medianos",
                                              "Graves",
                                            ],
                                          },
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Identificación del tercero
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "terceroNombre",
                                          "Nombre",
                                        )}
                                        {campoSiniestro("terceroRut", "R.U.T")}
                                        {campoSiniestro(
                                          "terceroTelefono",
                                          "Teléfono",
                                        )}
                                        {campoSiniestro(
                                          "terceroEmail",
                                          "E-mail",
                                        )}
                                        {campoSiniestro(
                                          "terceroDireccion",
                                          "Dirección",
                                        )}
                                        {campoSiniestro(
                                          "terceroCiudad",
                                          "Ciudad",
                                        )}
                                        {campoSiniestro(
                                          "terceroVehiculo",
                                          "Marca vehículo",
                                        )}
                                        {campoSiniestro(
                                          "terceroModelo",
                                          "Modelo",
                                        )}
                                        {campoSiniestro(
                                          "terceroPatente",
                                          "Patente",
                                        )}
                                      </div>
                                    </section>

                                    <section style={estiloSeccionFormulario}>
                                      <div
                                        style={estiloTituloSeccionFormulario}
                                      >
                                        Antecedentes legales
                                      </div>
                                      <div style={estiloGridFormulario}>
                                        {campoSiniestro(
                                          "comisaria",
                                          "Comisaría",
                                        )}
                                        {campoSiniestro(
                                          "folio",
                                          "N° Parte Policial",
                                        )}
                                        {campoSiniestro(
                                          "fechaDenuncia",
                                          "Fecha",
                                          { tipo: "date" },
                                        )}
                                        {campoSiniestro("juzgado", "Juzgado")}
                                        {campoSiniestro("citacion", "Citación")}
                                        {campoSiniestro(
                                          "alcoholemia",
                                          "Alcoholemia",
                                          {
                                            tipo: "select",
                                            items: [
                                              "Seleccionar",
                                              "Sí",
                                              "No",
                                              "No aplica",
                                              "Pendiente",
                                            ],
                                          },
                                        )}
                                      </div>
                                    </section>

                                    {mensajeFormularioSiniestro && (
                                      <div
                                        style={{
                                          padding: "13px 15px",
                                          borderRadius: "14px",
                                          background: "#f8faff",
                                          border: "1px solid #d9e2ef",
                                          color: "#07195a",
                                          fontSize: "12px",
                                          fontWeight: 850,
                                          lineHeight: 1.55,
                                        }}
                                      >
                                        {mensajeFormularioSiniestro}
                                      </div>
                                    )}

                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={cerrarFormularioSiniestro}
                                        style={{
                                          minHeight: "46px",
                                          border: "1px solid #d9e2ef",
                                          borderRadius: "14px",
                                          background: "#ffffff",
                                          color: "#07195a",
                                          padding: "0 18px",
                                          fontWeight: 950,
                                          cursor: "pointer",
                                        }}
                                      >
                                        Cerrar
                                      </button>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "10px",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={descargarFormularioEnBlanco}
                                          style={{
                                            minHeight: "46px",
                                            border: "none",
                                            borderRadius: "14px",
                                            background: "#eef4ff",
                                            color: "#07195a",
                                            padding: "0 18px",
                                            fontWeight: 950,
                                            cursor: "pointer",
                                          }}
                                        >
                                          Descargar PDF en blanco
                                        </button>

                                        <button
                                          type="submit"
                                          style={{
                                            minHeight: "46px",
                                            border: "none",
                                            borderRadius: "14px",
                                            background: "#f47c20",
                                            color: "#ffffff",
                                            padding: "0 18px",
                                            fontWeight: 950,
                                            cursor: "pointer",
                                          }}
                                        >
                                          Descargar archivo
                                        </button>

                                        <button
                                          type="button"
                                          onClick={enviarFormularioAEjecutivo}
                                          style={{
                                            minHeight: "46px",
                                            border: "none",
                                            borderRadius: "14px",
                                            background: "#07195a",
                                            color: "#ffffff",
                                            padding: "0 18px",
                                            fontWeight: 950,
                                            cursor: "pointer",
                                          }}
                                        >
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
  );
}

export default ReportarSiniestro;
