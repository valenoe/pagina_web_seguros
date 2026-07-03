import { useState } from "react";
import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/MisSeguros.css";

/**
 * Cuotas — "Pagos y cuotas": 3ª pestaña dentro de la carpeta Mis Seguros.
 *
 * Mismo estilo que la pestaña Documentos: tira compacta de totales, fila de
 * filtros con buscador, tabla con scroll horizontal en móvil y estado vacío.
 * Es AUTOCONTENIDA: computa sus derivaciones (pagosNormalizados, pendientes,
 * monto, próximo pago) desde los pagos crudos + las pólizas normalizadas del
 * padre; los helpers de formato/estado y la navegación vienen por props.
 *
 * Datos: hoy `pagos` puede venir vacío (el broker aún no está conectado) → cae
 * al estado vacío. Ver "Fuentes de datos / pendiente reconexión" en el handoff.
 */
function Cuotas({
  pagos,
  polizasNormalizadas,
  normalizarEstado,
  formatearMoneda,
  formatearFecha,
  textoEstado,
  abrirWhatsApp,
  setVista,
}) {
  const [filtros, setFiltros] = useState({
    busqueda: "",
    seguro: "todos",
    estado: "todos",
  });

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

  const segurosPago = ["todos", ...new Set(pagosNormalizados.map((p) => p.seguro))];
  const estadosPago = ["todos", ...new Set(pagosNormalizados.map((p) => p.estado))];

  const pagosFiltrados = pagosNormalizados.filter((pago) => {
    const busqueda = filtros.busqueda.toLowerCase().trim();

    const coincideBusqueda =
      !busqueda ||
      pago.seguro.toLowerCase().includes(busqueda) ||
      pago.compania.toLowerCase().includes(busqueda) ||
      String(pago.numero_poliza).toLowerCase().includes(busqueda) ||
      String(pago.cuota).toLowerCase().includes(busqueda);

    const coincideSeguro =
      filtros.seguro === "todos" || pago.seguro === filtros.seguro;

    const coincideEstado =
      filtros.estado === "todos" || pago.estado === filtros.estado;

    return coincideBusqueda && coincideSeguro && coincideEstado;
  });

  function actualizarFiltro(e) {
    setFiltros((actual) => ({ ...actual, [e.target.name]: e.target.value }));
  }

  function iniciarPago(pago) {
    if (pago.url_pago) {
      window.open(pago.url_pago, "_blank", "noopener,noreferrer");
      return;
    }

    abrirWhatsApp(
      `Hola, necesito ayuda para pagar la cuota ${pago.cuota} de ${pago.seguro}, póliza ${pago.numero_poliza}.`,
    );
  }

  return (
    <div>
      <div className="ms-stats-strip">
        <span>
          <strong>{formatearMoneda(montoPendiente)}</strong>Monto pendiente
        </span>
        <span>
          <strong>{pagosPendientes.length}</strong>Cuotas próximas
        </span>
        <span>
          <strong>
            {proximoPago ? formatearFecha(proximoPago.fecha_vencimiento) : "—"}
          </strong>
          Próximo vencimiento
        </span>
        <span>
          <strong>{pagosRealizados}</strong>Pagos realizados
        </span>
      </div>

      <div className="ms-filters ms-filters-cuotas">
        <input
          type="text"
          name="busqueda"
          className="ms-input ms-input--search"
          value={filtros.busqueda}
          onChange={actualizarFiltro}
          placeholder="Buscar pago..."
        />

        <select
          name="seguro"
          className="ms-select"
          value={filtros.seguro}
          onChange={actualizarFiltro}
        >
          {segurosPago.map((seguro) => (
            <option key={seguro} value={seguro}>
              {seguro === "todos" ? "Todos los seguros" : seguro}
            </option>
          ))}
        </select>

        <select
          name="estado"
          className="ms-select"
          value={filtros.estado}
          onChange={actualizarFiltro}
        >
          {estadosPago.map((estado) => (
            <option key={estado} value={estado}>
              {estado === "todos" ? "Todos los estados" : textoEstado(estado)}
            </option>
          ))}
        </select>
      </div>

      <div className="ms-table">
        <div className="ms-thead ms-cols-cuotas">
          <span>Seguro</span>
          <span>Compañía</span>
          <span>Cuota</span>
          <span>Monto</span>
          <span>Vencimiento</span>
          <span>Estado</span>
          <span>Acción</span>
        </div>

        {pagosFiltrados.length === 0 ? (
          <div className="pc-empty">
            <h3>No se encontraron pagos</h3>
            <p>
              Cuando una póliza tenga cuotas o comprobantes, aparecerán aquí.
              Prueba cambiando los filtros o contacta a tu ejecutivo si necesitas
              apoyo.
            </p>
          </div>
        ) : (
          pagosFiltrados.map((pago) => (
            <div className="ms-row ms-cols-cuotas" key={pago.id}>
              <div className="ms-cell-stack">
                <strong>{pago.seguro}</strong>
                <small>{pago.numero_poliza}</small>
              </div>

              <span className="ms-cell-muted">{pago.compania}</span>
              <strong className="ms-cell-strong">{pago.cuota}</strong>
              <strong className="ms-cell-strong">
                {formatearMoneda(pago.monto, pago.moneda)}
              </strong>
              <span className="ms-cell-muted">
                {formatearFecha(pago.fecha_vencimiento)}
              </span>
              <span className={`pc-status ${pago.estado}`}>
                {textoEstado(pago.estado)}
              </span>

              <div className="ms-row-actions">
                {["pendiente", "por-vencer", "vigente", "activa"].includes(
                  pago.estado,
                ) ? (
                  <button
                    type="button"
                    className="ms-btn-sm ms-btn-sm--primary"
                    onClick={() => iniciarPago(pago)}
                  >
                    Pagar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ms-btn-sm ms-btn-sm--outline"
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
                  >
                    Comprobante
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Cuotas;
