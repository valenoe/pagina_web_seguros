import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDetallePoliza, fotoUrl } from "../../services/api";
import "../../styles/pages/PolizaDetalle.css";

// Fecha "YYYY-MM-DD" → "DD/MM/YYYY" sin corrimiento de zona horaria.
function fecha(f) {
  if (!f) return "—";
  const m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(f);
}

// Número → "X,XX UF" (o "—" si viene vacío).
function uf(v) {
  if (v === null || v === undefined || v === "") return "—";
  return `${Number(v).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF`;
}

function money(v) {
  if (v === null || v === undefined || v === "") return "—";
  return `$${Number(v).toLocaleString("es-CL")}`;
}

function PolizaDetalle() {
  const navigate = useNavigate();
  const { idPoliza } = useParams();

  const [poliza, setPoliza] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login-clientes");
      return;
    }
    getDetallePoliza(token, idPoliza)
      .then((data) => setPoliza(data))
      .catch(() => setError("No se pudo cargar la póliza."))
      .finally(() => setCargando(false));
  }, [idPoliza, navigate]);

  const volver = () => navigate("/clientes/dashboard/mis-seguros");

  if (cargando) {
    return (
      <div className="poldet-page">
        <div className="poldet-wrap">
          <p className="poldet-cargando">Cargando póliza…</p>
        </div>
      </div>
    );
  }

  if (error || !poliza) {
    return (
      <div className="poldet-page">
        <div className="poldet-wrap">
          <button className="poldet-volver" onClick={volver}>
            ← Volver a Mis Seguros
          </button>
          <p className="poldet-error">{error || "Póliza no encontrada."}</p>
        </div>
      </div>
    );
  }

  // Desglose de prima: solo las filas que traen valor.
  const filasPrima = [
    ["Monto asegurado", uf(poliza.monto_asegurado)],
    ["Prima neta", uf(poliza.prima_neta)],
    ["Prima afecta", uf(poliza.prima_afecta)],
    ["Prima exenta", uf(poliza.prima_exenta)],
    ["IVA", uf(poliza.iva)],
    ["Prima total", uf(poliza.prima)],
  ].filter(([, v]) => v !== "—");

  const materia = poliza.materia_asegurada || {};
  const documentos = poliza.documentos || [];
  const pagos = poliza.pagos || [];

  return (
    <div className="poldet-page">
      <div className="poldet-wrap">
        <button className="poldet-volver" onClick={volver}>
          ← Volver a Mis Seguros
        </button>

        <header className="poldet-header">
          <span className="poldet-ramo">{poliza.ramo || poliza.seguro?.nombre || "Póliza"}</span>
          <h1>{poliza.seguro?.nombre || poliza.materia || "Póliza"}</h1>
          <div className="poldet-header-meta">
            <span>N° {poliza.numero_poliza || "—"}</span>
            <span className={`poldet-estado poldet-estado--${(poliza.estado || "").toLowerCase()}`}>
              {poliza.estado || "—"}
            </span>
          </div>
        </header>

        {/* Resumen */}
        <section className="poldet-card">
          <h2 className="poldet-card-title">Resumen</h2>
          <div className="poldet-grid">
            <Dato label="Compañía" valor={poliza.compania} />
            <Dato label="Ramo" valor={poliza.ramo} />
            <Dato label="Producto" valor={poliza.producto} />
            <Dato label="Materia" valor={poliza.materia} />
            <Dato label="Inicio" valor={fecha(poliza.fecha_inicio)} />
            <Dato label="Término" valor={fecha(poliza.fecha_vencimiento)} />
            <Dato label="Forma de pago" valor={poliza.forma_pago} />
            <Dato label="N° de cuotas" valor={poliza.num_cuotas} />
          </div>
        </section>

        {/* Prima */}
        {filasPrima.length > 0 && (
          <section className="poldet-card">
            <h2 className="poldet-card-title">Prima</h2>
            <table className="poldet-prima">
              <tbody>
                {filasPrima.map(([label, valor]) => (
                  <tr key={label} className={label === "Prima total" ? "poldet-prima-total" : ""}>
                    <th>{label}</th>
                    <td>{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="poldet-nota">Valores en UF (referenciales).</p>
          </section>
        )}

        {/* Materia asegurada (detalles variables según ramo) */}
        {Object.keys(materia).length > 0 && (
          <section className="poldet-card">
            <h2 className="poldet-card-title">Materia asegurada</h2>
            <div className="poldet-grid">
              {Object.entries(materia).map(([k, v]) => (
                <Dato key={k} label={k} valor={v} />
              ))}
            </div>
          </section>
        )}

        {/* Cuotas */}
        <section className="poldet-card">
          <h2 className="poldet-card-title">Cuotas</h2>
          {pagos.length > 0 ? (
            <div className="poldet-tabla-scroll">
              <table className="poldet-tabla">
                <thead>
                  <tr>
                    <th>Cuota</th>
                    <th>Monto</th>
                    <th>Vence</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr key={p.id_pago}>
                      <td>{p.numero_cuota}</td>
                      <td>{money(p.monto)}</td>
                      <td>{fecha(p.fecha_vencimiento)}</td>
                      <td>
                        <span className={`poldet-estado poldet-estado--${(p.estado || "").toLowerCase()}`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="poldet-vacio">Sin cuotas registradas.</p>
          )}
        </section>

        {/* Documentos (por póliza) */}
        <section className="poldet-card">
          <h2 className="poldet-card-title">Documentos</h2>
          {documentos.length > 0 ? (
            <ul className="poldet-docs">
              {documentos.map((doc) => (
                <li key={doc.id_documento} className="poldet-doc">
                  <div>
                    <strong>{doc.nombre}</strong>
                    <small>{doc.tipo}</small>
                  </div>
                  {doc.url ? (
                    <a
                      href={fotoUrl(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="poldet-doc-btn"
                    >
                      Ver
                    </a>
                  ) : (
                    <span className="poldet-doc-estado">{doc.estado}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="poldet-vacio">Esta póliza aún no tiene documentos cargados.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Dato({ label, valor }) {
  const vacio = valor === null || valor === undefined || valor === "";
  return (
    <div className="poldet-dato">
      <span className="poldet-dato-label">{label}</span>
      <strong className="poldet-dato-valor">{vacio ? "—" : valor}</strong>
    </div>
  );
}

export default PolizaDetalle;
