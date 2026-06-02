import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getMisCotizaciones, getMisPolizas } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [vista, setVista] = useState("resumen");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/clientes");
      return;
    }

    async function cargarDatos() {
      try {
        const [cots, pols] = await Promise.all([
          getMisCotizaciones(token),
          getMisPolizas(token),
        ]);
        setCotizaciones(cots);
        setPolizas(pols);
      } catch {
        setError("Sesión expirada. Vuelve a ingresar.");
        localStorage.removeItem("token");
        navigate("/clientes");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [navigate]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    navigate("/clientes");
  }

  const polizasActivas = polizas.filter((p) => p.estado === "vigente").length;

  return (
    <>
      <Header />

      <section className="dashboard">
        <div className="dashboard-sidebar">
          <h2>Portal Clientes</h2>
          <button className={vista === "resumen" ? "activo" : ""} onClick={() => setVista("resumen")}>Resumen</button>
          <button className={vista === "polizas" ? "activo" : ""} onClick={() => setVista("polizas")}>Mis pólizas</button>
          <button className={vista === "cotizaciones" ? "activo" : ""} onClick={() => setVista("cotizaciones")}>Cotizaciones</button>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>

        <div className="dashboard-main">
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
                    <h1>Panel Cliente</h1>
                    <p>Consulta tus seguros y solicitudes.</p>
                  </div>

                  <div className="dashboard-grid">
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
                  </div>
                </>
              )}

              {vista === "polizas" && (
                <div className="dashboard-lista">
                  <h2>Mis pólizas</h2>
                  {polizas.length === 0 ? (
                    <p>No tienes pólizas registradas.</p>
                  ) : (
                    polizas.map((p) => (
                      <div className="dashboard-item" key={p.id_poliza}>
                        <strong>{p.seguro.nombre}</strong>
                        <span>{p.compania ?? "—"}</span>
                        <span>N° {p.numero_poliza ?? "—"}</span>
                        <span className={`estado-${p.estado}`}>{p.estado}</span>
                        <span>Vence: {p.fecha_vencimiento ?? "—"}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {vista === "cotizaciones" && (
                <div className="dashboard-lista">
                  <h2>Mis cotizaciones</h2>
                  {cotizaciones.length === 0 ? (
                    <p>No tienes cotizaciones registradas.</p>
                  ) : (
                    cotizaciones.map((c) => (
                      <div className="dashboard-item" key={c.id_cotizacion}>
                        <strong>{c.seguro.nombre}</strong>
                        <span className={`estado-${c.estado}`}>{c.estado}</span>
                        <span>{new Date(c.fecha_solicitud).toLocaleDateString("es-CL")}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Dashboard;
