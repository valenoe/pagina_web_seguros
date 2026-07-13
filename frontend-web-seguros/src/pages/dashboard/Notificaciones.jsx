import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/Notificaciones.css";

/**
 * Notificaciones — página dedicada (vista "notificaciones" del portal).
 * Reemplaza el dropdown viejo de la campana. Recibe `alertas` (getMisAlertas);
 * hoy suele venir vacío/demo → muestra estado vacío decente.
 */

// Acento de color según el tipo de alerta (para el puntito de la izquierda).
function acentoPorTipo(tipo = "") {
  const t = tipo.toLowerCase();
  if (t.includes("venc") || t.includes("pago")) return "warn";
  if (t.includes("sinie")) return "danger";
  if (t.includes("doc")) return "info";
  return "default";
}

function Notificaciones({ alertas = [] }) {
  const hay = alertas.length > 0;

  return (
    <div className="pc-panel pc-full-panel notif">
      <div className="notif-head">
        <h2 className="notif-title">Notificaciones</h2>
        <p className="notif-sub">
          {hay
            ? `Tienes ${alertas.length} ${alertas.length === 1 ? "aviso" : "avisos"} en tu portal.`
            : "Aquí verás los avisos de tu portal."}
        </p>
      </div>

      {hay ? (
        <ul className="notif-list">
          {alertas.map((alerta, index) => (
            <li
              key={alerta.id_alerta || alerta.id || index}
              className={`notif-card notif-card--${acentoPorTipo(alerta.tipo)}`}
            >
              <span className="notif-dot" />
              <div className="notif-card-body">
                <strong className="notif-card-title">
                  {alerta.titulo || alerta.tipo || "Nueva notificación"}
                </strong>
                <p className="notif-card-text">
                  {alerta.mensaje ||
                    alerta.descripcion ||
                    "Tienes una actualización pendiente en tu portal."}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="notif-empty">
          <div className="notif-empty-icon">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <strong className="notif-empty-title">Sin notificaciones</strong>
          <p className="notif-empty-text">
            Cuando tengas avisos de pagos, vencimientos o documentos, aparecerán
            aquí.
          </p>
        </div>
      )}
    </div>
  );
}

export default Notificaciones;
