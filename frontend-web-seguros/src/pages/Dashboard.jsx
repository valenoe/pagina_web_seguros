import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisCotizaciones, getMisPolizas } from "../services/api";

function PerfilCliente() {
  const nombreCliente = localStorage.getItem("nombre_cliente") || "Cliente";

  const perfil = {
    nombre: nombreCliente,
    rut: localStorage.getItem("rut_cliente") || "12.456.789-3",
    correo: localStorage.getItem("correo_cliente") || "correo@cliente.cl",
    telefono: localStorage.getItem("telefono_cliente") || "+56 9 0000 0000",
    tipoCliente: localStorage.getItem("tipo_cliente") || "Persona natural",
  };

  function cambiarPassword() {
    alert("Función pendiente de conectar con backend.");
  }

  return (
    <div className="perfil-cliente">
      <div className="perfil-cliente-header">
        <span>Perfil cliente</span>
        <h2>Hola, {perfil.nombre} 👋</h2>
        <p>
          Revisa tus datos de contacto y la información asociada a tu cuenta.
        </p>
      </div>

      <div className="perfil-cliente-grid">
        <div className="perfil-cliente-card">
          <small>RUT</small>
          <strong>{perfil.rut}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Correo</small>
          <strong>{perfil.correo}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Teléfono</small>
          <strong>{perfil.telefono}</strong>
        </div>

        <div className="perfil-cliente-card">
          <small>Tipo cliente</small>
          <strong>{perfil.tipoCliente}</strong>
        </div>
      </div>

      <div className="perfil-cliente-security">
        <div>
          <span>Seguridad</span>
          <h3>Cambiar contraseña</h3>
          <p>
            Próximamente podrás actualizar tu contraseña directamente desde el
            portal.
          </p>
        </div>

        <button onClick={cambiarPassword}>Cambiar contraseña</button>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const nombreCliente = localStorage.getItem("nombre_cliente") || "Cliente";

  const segurosDisponibles = [
    {
      id: "autos",
      nombre: "Seguro de Autos",
      categoria: "Vehículos",
      descripcion:
        "Cobertura para accidentes, daños materiales, robo y responsabilidad civil.",
      icono: "🚗",
    },
    {
      id: "soap",
      nombre: "SOAP",
      categoria: "Vehículos",
      descripcion:
        "Seguro obligatorio para accidentes personales causados por vehículos motorizados.",
      icono: "🛡",
    },
    {
      id: "rci-argentina",
      nombre: "RCI Argentina",
      categoria: "Vehículos",
      descripcion:
        "Seguro obligatorio para vehículos que cruzan hacia Argentina.",
      icono: "🌎",
    },
    {
      id: "hogar",
      nombre: "Seguro de Hogar",
      categoria: "Personas",
      descripcion:
        "Protección para vivienda, incendio, sismo, daños y asistencias del hogar.",
      icono: "🏠",
    },
    {
      id: "mascotas",
      nombre: "Seguro de Mascotas",
      categoria: "Personas",
      descripcion:
        "Cobertura veterinaria para perros y gatos ante accidentes y enfermedades.",
      icono: "🐾",
    },
    {
      id: "viaje",
      nombre: "Asistencia en Viaje",
      categoria: "Personas",
      descripcion:
        "Asistencia médica, hospitalización, repatriación y apoyo en viajes internacionales.",
      icono: "✈️",
    },
    {
      id: "mujer",
      nombre: "Mujer Segura",
      categoria: "Personas",
      descripcion: "Seguro de accidentes personales orientado a mujeres.",
      icono: "👩",
    },
    {
      id: "garantias",
      nombre: "Seguro de Garantías",
      categoria: "Empresas y otros",
      descripcion:
        "Cubre compromisos contractuales, licitaciones, obras y obligaciones con terceros.",
      icono: "📄",
    },
  ];

  const params = new URLSearchParams(window.location.search);
  const vistaInicial = params.get("vista") || "resumen";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [vista, setVista] = useState(vistaInicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  function irASeguros() {
    navigate("/seguros");
  }

  function verDetalleSeguro(idSeguro) {
    navigate(`/clientes/seguro/${idSeguro}`);
  }

  function formatearFecha(fecha) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CL");
  }

  function calcularEstado(poliza) {
    if (!poliza.fecha_vencimiento) {
      return poliza.estado || "vigente";
    }

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

  function textoEstadoCotizacion(estado) {
    if (!estado) return "Pendiente";

    const estadoNormalizado = estado.toLowerCase();

    if (estadoNormalizado === "pendiente") return "Pendiente";
    if (estadoNormalizado === "aprobada") return "Aprobada";
    if (estadoNormalizado === "rechazada") return "Rechazada";
    if (estadoNormalizado === "en revision") return "En revisión";
    if (estadoNormalizado === "en_revision") return "En revisión";
    if (estadoNormalizado === "emitida") return "Emitida";

    return estado;
  }

  function claseEstadoCotizacion(estado) {
    if (!estado) return "pendiente";

    return estado.toLowerCase().replaceAll(" ", "-").replaceAll("_", "-");
  }

  function logoCompania(compania) {
    if (!compania) return "/Logo Prieto.png";

    const nombre = compania.toLowerCase();

    if (nombre.includes("hdi")) return "/HDI.png";
    if (nombre.includes("bci")) return "/BCI.png";
    if (nombre.includes("sura")) return "/SURA.png";
    if (nombre.includes("mapfre")) return "/MAPFRE.png";
    if (nombre.includes("zurich")) return "/Zurich.png";
    if (nombre.includes("chubb")) return "/Chubb.png";
    if (nombre.includes("consorcio")) return "/Consorcio.png";
    if (nombre.includes("contempora")) return "/Contempora.png";
    if (nombre.includes("continental")) return "/Continental.png";
    if (nombre.includes("fid")) return "/FID Seguros.png";
    if (nombre.includes("orsan")) return "/Orsan.png";
    if (nombre.includes("reale")) return "/Reale.png";
    if (nombre.includes("renta")) return "/Renta Nacional.png";
    if (nombre.includes("southbridge")) return "/Southbridge.png";
    if (nombre.includes("avla")) return "/AVLA.png";
    if (nombre.includes("aspor")) return "/ASPOR.png";

    return "/Logo Prieto.png";
  }

  const polizasActivas = polizas.filter(
    (p) => p.estado === "activa" || p.estado === "vigente"
  ).length;

  const companiasAsociadas = [
    ...new Set(polizas.map((p) => p.compania).filter(Boolean)),
  ].length;

  return (
    <section className="dashboard privado">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <img src="/Logo Prieto.png" alt="Prieto & Correa" />
        </div>

        <div className="sidebar-cliente">
          <h2>Portal Clientes</h2>
          <small>{nombreCliente}</small>
        </div>

        <button
          className={vista === "resumen" ? "activo" : ""}
          onClick={() => setVista("resumen")}
        >
          Resumen
        </button>

        <button
          className={vista === "perfil" ? "activo" : ""}
          onClick={() => setVista("perfil")}
        >
          Perfil Cliente
        </button>

        <button
          className={vista === "polizas" ? "activo" : ""}
          onClick={() => setVista("polizas")}
        >
          Mis pólizas
        </button>

        <button
          className={vista === "cotizaciones" ? "activo" : ""}
          onClick={() => setVista("cotizaciones")}
        >
          Cotizaciones
        </button>

        <button
          className={vista === "beneficiarios" ? "activo" : ""}
          onClick={() => setVista("beneficiarios")}
        >
          Beneficiarios
        </button>

        <button
          className={vista === "coberturas" ? "activo" : ""}
          onClick={() => setVista("coberturas")}
        >
          Coberturas
        </button>

        <button
          className={vista === "vencimientos" ? "activo" : ""}
          onClick={() => setVista("vencimientos")}
        >
          Vencimientos
        </button>

        <button
          className={vista === "cuotas" ? "activo" : ""}
          onClick={() => setVista("cuotas")}
        >
          Pagos y cuotas
        </button>

        <button
          className={vista === "documentos" ? "activo" : ""}
          onClick={() => setVista("documentos")}
        >
          Documentos
        </button>

        <button
          className={vista === "siniestro" ? "activo" : ""}
          onClick={() => setVista("siniestro")}
        >
          Reportar siniestro
        </button>

        <button className="dashboard-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <span>Área privada</span>
            <h1>Mi Portal de Seguros</h1>
          </div>

          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>

        {cargando ? (
          <p className="cargando">Cargando...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : (
          <>
            {vista === "resumen" && (
              <>
                <div className="dashboard-banner">
                  <span>Bienvenido</span>
                  <h1>Hola, {nombreCliente}</h1>
                  <p>
                    Consulta tus seguros, solicitudes y próximos movimientos.
                  </p>
                </div>

                <div className="dashboard-grid dashboard-grid-resumen">
                  <div className="dashboard-card">
                    <h2>{polizasActivas}</h2>
                    <p>Pólizas activas</p>
                  </div>

                  <div className="dashboard-card">
                    <h2>{polizas.length}</h2>
                    <p>Total pólizas</p>
                  </div>

                  <div className="dashboard-card">
                    <h2>{cotizaciones.length}</h2>
                    <p>Cotizaciones</p>
                  </div>

                  <div className="dashboard-card">
                    <h2>{companiasAsociadas}</h2>
                    <p>Compañías</p>
                  </div>
                </div>

                <div className="dashboard-visual">
                  <div className="dashboard-visual-card">
                    <h2>Resumen visual</h2>
                    <p>Estado general de tu portal de seguros.</p>

                    <div className="barra-item">
                      <div>
                        <strong>Pólizas</strong>
                        <span>{polizas.length}</span>
                      </div>
                      <div className="barra">
                        <div
                          style={{
                            width: `${Math.min(polizas.length * 20, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="barra-item">
                      <div>
                        <strong>Cotizaciones</strong>
                        <span>{cotizaciones.length}</span>
                      </div>
                      <div className="barra">
                        <div
                          style={{
                            width: `${Math.min(cotizaciones.length * 20, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="barra-item">
                      <div>
                        <strong>Compañías</strong>
                        <span>{companiasAsociadas}</span>
                      </div>
                      <div className="barra">
                        <div
                          style={{
                            width: `${Math.min(companiasAsociadas * 25, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-visual-card estado-portal">
                    <span className="estado-portal-tag">
                      {polizas.length === 0
                        ? "Sin seguros activos"
                        : "Portal activo"}
                    </span>

                    <h2>Estado del portal</h2>

                    <p>
                      {polizas.length === 0
                        ? "Aún no existen pólizas registradas para esta cuenta. Puedes explorar nuestros seguros y solicitar una cotización."
                        : "Tu portal ya cuenta con pólizas registradas y disponibles para consulta."}
                    </p>

                    {polizas.length === 0 ? (
                      <button className="estado-portal-btn" onClick={irASeguros}>
                        Ver seguros
                      </button>
                    ) : (
                      <button
                        className="estado-portal-btn"
                        onClick={() => setVista("polizas")}
                      >
                        Revisar pólizas
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {vista === "perfil" && (
              <div className="dashboard-lista">
                <PerfilCliente />
              </div>
            )}

            {vista === "polizas" && (
              <div className="dashboard-lista">
                <h2>Mis pólizas</h2>

                {polizas.length === 0 ? (
                  <div className="empty-polizas">
                    <h3>🛡 No tienes pólizas registradas</h3>
                    <p>Todavía no existen seguros asociados a esta cuenta.</p>

                    <ul className="empty-polizas-list">
                      <li>Compañía aseguradora</li>
                      <li>Estado de vigencia</li>
                      <li>Fecha de vencimiento</li>
                      <li>Cobertura UF y CLP</li>
                      <li>Beneficiarios</li>
                      <li>Pagos y renovaciones</li>
                    </ul>

                    <button className="empty-action" onClick={irASeguros}>
                      Ver seguros →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="polizas-header polizas-header-logo">
                      <span>Seguro</span>
                      <span>Compañía</span>
                      <span>N° Póliza</span>
                      <span>Estado</span>
                      <span>Vencimiento</span>
                    </div>

                    {polizas.map((p) => {
                      const estado = calcularEstado(p);

                      return (
                        <div
                          className="poliza-card-row poliza-card-row-logo"
                          key={p.id_poliza}
                        >
                          <div className="poliza-seguro-info">
                            <img
                              src={logoCompania(p.compania)}
                              alt={p.compania || "Compañía"}
                              className="poliza-compania-logo"
                            />

                            <div>
                              <strong>{p.seguro?.nombre || "Seguro"}</strong>
                              <small>Tipo de póliza</small>
                            </div>
                          </div>

                          <span>{p.compania || "—"}</span>
                          <span>{p.numero_poliza || "—"}</span>

                          <span className={`estado-badge ${estado}`}>
                            {textoEstado(estado)}
                          </span>

                          <span>{formatearFecha(p.fecha_vencimiento)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {vista === "cotizaciones" && (
              <div className="dashboard-lista">
                <h2>Mis cotizaciones</h2>

                {cotizaciones.length > 0 && (
                  <div className="cotizaciones-grid">
                    {cotizaciones.map((c) => {
                      const estadoCotizacion = claseEstadoCotizacion(c.estado);

                      return (
                        <article
                          className="cotizacion-card-portal"
                          key={c.id_cotizacion}
                        >
                          <div className="cotizacion-card-top">
                            <div className="cotizacion-icono">🧾</div>

                            <div>
                              <strong>{c.seguro?.nombre || "Seguro"}</strong>
                              <span>Solicitud #{c.id_cotizacion}</span>
                            </div>
                          </div>

                          <div className="cotizacion-card-info">
                            <div>
                              <small>Estado</small>
                              <span
                                className={`cotizacion-estado ${estadoCotizacion}`}
                              >
                                {textoEstadoCotizacion(c.estado)}
                              </span>
                            </div>

                            <div>
                              <small>Fecha solicitud</small>
                              <strong>{formatearFecha(c.fecha_solicitud)}</strong>
                            </div>

                            <div>
                              <small>Canal</small>
                              <strong>{c.canal || "Portal web"}</strong>
                            </div>
                          </div>

                          <button className="cotizacion-card-button">
                            Ver seguimiento
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}

                <div className="cotizar-whatsapp-section">
                  <div className="cotizar-whatsapp-header">
                    <span>Nueva cotización</span>
                    <h2>Seguros disponibles para cotizar</h2>
                    <p>
                      Revisa los seguros disponibles, entra al detalle de cada
                      producto y solicita atención directa con un ejecutivo.
                    </p>
                  </div>

                  <div className="seguros-whatsapp-grid">
                    {segurosDisponibles.map((seguro) => (
                      <article className="seguro-whatsapp-card" key={seguro.id}>
                        <div className="seguro-whatsapp-icono">
                          {seguro.icono}
                        </div>

                        <div>
                          <span>{seguro.categoria}</span>
                          <h3>{seguro.nombre}</h3>
                          <p>{seguro.descripcion}</p>
                        </div>

                        <div className="seguro-whatsapp-actions">
                          <button
                            className="detalle-seguro-btn full"
                            onClick={() => verDetalleSeguro(seguro.id)}
                          >
                            Ver detalle →
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {vista === "beneficiarios" && (
              <div className="dashboard-lista">
                <h2>Beneficiarios</h2>
                <div className="empty-polizas">
                  <h3>Sin beneficiarios visibles por ahora</h3>
                  <p>
                    Cuando se conecte el detalle de cada póliza, aquí se
                    mostrarán los beneficiarios asociados a tus seguros.
                  </p>
                </div>
              </div>
            )}

            {vista === "coberturas" && (
              <div className="dashboard-lista">
                <h2>Coberturas</h2>
                <div className="empty-polizas">
                  <h3>Coberturas en preparación</h3>
                  <p>
                    Aquí podrás revisar qué cubre cada seguro, montos asegurados,
                    exclusiones y condiciones principales.
                  </p>
                </div>
              </div>
            )}

            {vista === "vencimientos" && (
              <div className="dashboard-lista">
                <h2>Vencimientos</h2>
                <div className="empty-polizas">
                  <h3>No tienes vencimientos próximos</h3>
                  <p>
                    Cuando una póliza esté próxima a caducar, aparecerá aquí una
                    alerta con la fecha de renovación recomendada.
                  </p>
                </div>
              </div>
            )}

            {vista === "cuotas" && (
              <div className="dashboard-lista">
                <h2>Pagos y cuotas</h2>
                <div className="empty-polizas">
                  <h3>Información de pagos no disponible todavía</h3>
                  <p>
                    En esta sección se mostrarán cuotas pendientes, fechas de
                    pago y estado de cada compromiso asociado a tus seguros.
                  </p>
                </div>
              </div>
            )}

            {vista === "documentos" && (
              <div className="dashboard-lista">
                <h2>Centro de documentos</h2>

                <div className="documentos-grid">
                  <div className="documento-card">
                    <div className="documento-icono">📄</div>
                    <h3>Pólizas</h3>
                    <p>Visualiza y descarga tus pólizas.</p>
                    <button>Ver documentos</button>
                  </div>

                  <div className="documento-card">
                    <div className="documento-icono">🧾</div>
                    <h3>Certificados</h3>
                    <p>Accede a certificados disponibles.</p>
                    <button>Descargar</button>
                  </div>

                  <div className="documento-card">
                    <div className="documento-icono">🚗</div>
                    <h3>SOAP</h3>
                    <p>Consulta y descarga tu SOAP.</p>
                    <button>Ver SOAP</button>
                  </div>

                  <div className="documento-card">
                    <div className="documento-icono">🕓</div>
                    <h3>Historial</h3>
                    <p>Revisa documentos anteriores.</p>
                    <button>Abrir historial</button>
                  </div>
                </div>
              </div>
            )}

            {vista === "siniestro" && (
              <div className="dashboard-lista">
                <h2>Reportar siniestro</h2>

                <p className="subtitulo-panel">
                  Selecciona una póliza para iniciar el reporte.
                </p>

                {polizas.length === 0 ? (
                  <div className="empty-polizas">
                    <h3>No existen seguros disponibles para reportar</h3>
                    <p>
                      Cuando contrates una póliza con Prieto & Correa podrás
                      gestionar siniestros y recibir apoyo directo desde este
                      portal.
                    </p>
                  </div>
                ) : (
                  <div className="siniestro-polizas">
                    {polizas.map((p) => (
                      <div className="siniestro-poliza-card" key={p.id_poliza}>
                        <div className="siniestro-poliza-top">
                          <div>
                            <h3>{p.seguro?.nombre || "Seguro"}</h3>
                            <span>{p.compania || "Prieto & Correa"}</span>
                          </div>

                          <div className={`estado-badge ${calcularEstado(p)}`}>
                            {textoEstado(calcularEstado(p))}
                          </div>
                        </div>

                        <div className="siniestro-info">
                          <div>
                            <label>N° póliza</label>
                            <strong>{p.numero_poliza || "Sin número"}</strong>
                          </div>

                          <div>
                            <label>Vencimiento</label>
                            <strong>
                              {formatearFecha(p.fecha_vencimiento)}
                            </strong>
                          </div>
                        </div>

                        <button
                          className="reportar-btn"
                          onClick={() => {
                            const mensaje = `Hola.
Soy cliente del portal.

Quiero reportar un siniestro.

Seguro:
${p.seguro?.nombre || "Seguro"}

Compañía:
${p.compania || "Sin compañía"}

Póliza:
${p.numero_poliza || "Sin número"}`;

                            window.open(
                              `https://wa.me/56966541939?text=${encodeURIComponent(
                                mensaje
                              )}`
                            );
                          }}
                        >
                          Reportar siniestro
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Dashboard;