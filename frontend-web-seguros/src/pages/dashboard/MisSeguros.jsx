import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/MisSeguros.css";
import Cuotas from "./Cuotas";

/**
 * Mis Seguros — vista del portal del cliente con 4 pestanas:
 * Pólizas, Documentos, Beneficiarios y Pagos y cuotas.
 *
 * (La pestana Coberturas se elimino: para una corredora las coberturas exactas
 * las define la aseguradora y viven en el PDF de la poliza -> pestana Documentos.
 * Mantener una tabla de coberturas a mano era duplicar un dato mutable.)
 *
 * Extraida del monolito Dashboard.jsx. Es PRESENTACIONAL: el padre sigue
 * calculando las derivaciones (beneficiarios/documentos, exclusivas de esta
 * vista) y se las pasa ya listas. La lista de props larga es a proposito:
 * marca ese bloque de derivaciones como candidato a un hook compartido
 * (usePortalData) en una pasada futura.
 *
 * Estilos: las clases compartidas (pc-*) viven en PortalDashboard.css; las
 * propias de esta vista (ms-*) en MisSeguros.css. La tabla usa scroll
 * horizontal en pantallas chicas para no deformarse.
 *
 * NOTA: el modal de preview de PDF se elimino junto con la vista documentos
 * muerta; abrirPreviewDocumento queda como no-op hasta reconectar el visor real.
 */
function MisSeguros({
  tabMisSeguros,
  setTabMisSeguros,
  pagos,
  polizasNormalizadas,
  formatearMoneda,
  beneficiariosMisSeguros,
  beneficiariosTotales,
  beneficiariosActivos,
  polizasConBeneficiarios,
  documentosDemo,
  documentosFiltrados,
  documentosDisponibles,
  polizasConDocumentos,
  segurosDocumentos,
  tiposDocumentos,
  estadosDocumentos,
  filtrosDocumentos,
  actualizarFiltroDocumento,
  abrirPreviewDocumento,
  descargarDocumento,
  formatearFecha,
  normalizarEstado,
  textoEstado,
  setVista,
  abrirWhatsApp,
}) {
  const navigate = useNavigate();
  const [busquedaPolizas, setBusquedaPolizas] = useState("");

  const polizasActivas = polizasNormalizadas.filter((p) =>
    ["vigente", "activa"].includes(p.estado),
  ).length;
  const companiasPolizas = new Set(
    polizasNormalizadas.map((p) => p.compania).filter(Boolean),
  ).size;
  const proximaPolizaVenc = [...polizasNormalizadas]
    .filter((p) => p.fecha_vencimiento)
    .sort(
      (a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento),
    )[0];

  const qPolizas = busquedaPolizas.toLowerCase().trim();
  const polizasFiltradas = polizasNormalizadas.filter(
    (p) =>
      !qPolizas ||
      p.seguro.toLowerCase().includes(qPolizas) ||
      String(p.numero_poliza).toLowerCase().includes(qPolizas) ||
      p.compania.toLowerCase().includes(qPolizas),
  );

  return (
    <div className="pc-panel pc-full-panel">
      <div className="pc-panel-title ms-head">
        <div>
          <h2>Mis Seguros</h2>
          <p>Visualiza tus pólizas, beneficiarios y documentos en un solo lugar.</p>
        </div>

        <div className="ms-actions">
          <button
            type="button"
            className="ms-btn ms-btn--primary"
            onClick={() => setVista("explora")}
          >
            Explorar seguros
          </button>

          <button
            type="button"
            className="ms-btn ms-btn--outline"
            onClick={() =>
              abrirWhatsApp("Hola, necesito orientación sobre mis seguros.")
            }
          >
            Contactar ejecutivo
          </button>
        </div>
      </div>

      <div className="ms-tabs">
        {[
          ["polizas", "Pólizas", "Pól"],
          ["beneficiarios", "Beneficiarios", "Ben"],
          ["cuotas", "Pagos y cuotas", "Pagos"],
        ].map(([tab, label, corto]) => (
          <button
            key={tab}
            type="button"
            className={`ms-tab ${tabMisSeguros === tab ? "is-active" : ""}`}
            onClick={() => setTabMisSeguros(tab)}
          >
            <span className="ms-tab-full">{label}</span>
            <span className="ms-tab-short">{corto}</span>
          </button>
        ))}
      </div>

      <div className="ms-folder-body">
      {tabMisSeguros === "polizas" && (
        <div>
          <div className="ms-stats-strip">
            <span>
              <strong>{polizasNormalizadas.length}</strong>Pólizas
            </span>
            <span>
              <strong>{polizasActivas}</strong>Activas
            </span>
            <span>
              <strong>{companiasPolizas}</strong>Compañías
            </span>
            <span>
              <strong>
                {proximaPolizaVenc
                  ? formatearFecha(proximaPolizaVenc.fecha_vencimiento)
                  : "—"}
              </strong>
              Próximo vencimiento
            </span>
          </div>

          <div className="ms-filters ms-filters-pol">
            <input
              type="text"
              className="ms-input ms-input--search"
              value={busquedaPolizas}
              onChange={(e) => setBusquedaPolizas(e.target.value)}
              placeholder="Buscar póliza..."
            />
          </div>

          <div className="ms-table">
            <div className="ms-thead ms-cols-pol">
              <span>Seguro</span>
              <span>Número</span>
              <span>Compañía</span>
              <span>Estado</span>
              <span>Vencimiento</span>
              <span></span>
            </div>

            {polizasFiltradas.length === 0 ? (
              <div className="pc-empty">
                <h3>No tienes pólizas registradas</h3>
                <p>
                  Cuando tengas seguros contratados, aparecerán aquí con su
                  número, compañía, estado y vencimiento.
                </p>
              </div>
            ) : (
              polizasFiltradas.map((p) => (
                <div className="ms-row ms-cols-pol" key={p.id}>
                  <div className="ms-cell-stack">
                    <strong>{p.seguro}</strong>
                    <small>{p.categoria}</small>
                  </div>
                  <span className="ms-cell-muted">{p.numero_poliza}</span>
                  <span className="ms-cell-muted">{p.compania}</span>
                  <span className={`pc-status ${p.estado}`}>
                    {textoEstado(p.estado)}
                  </span>
                  <span className="ms-cell-muted">
                    {formatearFecha(p.fecha_vencimiento)}
                  </span>
                  <button
                    type="button"
                    className="ms-btn-sm ms-btn-sm--primary"
                    onClick={() =>
                      navigate(`/clientes/dashboard/poliza/${p.id_poliza}`)
                    }
                  >
                    Ver
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tabMisSeguros === "beneficiarios" && (
        <div>
          <div className="ms-stats-strip">
            <span>
              <strong>{beneficiariosTotales}</strong>Beneficiarios
            </span>
            <span>
              <strong>{polizasConBeneficiarios}</strong>Seguros asociados
            </span>
            <span>
              <strong>{beneficiariosActivos}</strong>Activos
            </span>
            <span>
              <strong>{beneficiariosTotales === 0 ? "—" : "Al día"}</strong>
              Estado general
            </span>
          </div>

          <div className="ms-table">
            <div className="ms-thead ms-cols-ben">
              <span>Beneficiario</span>
              <span>RUT</span>
              <span>Relación</span>
              <span>Póliza</span>
              <span>%</span>
              <span>Estado</span>
            </div>

            {beneficiariosMisSeguros.length === 0 ? (
              <div className="pc-empty">
                <h3>Aún no tienes beneficiarios asociados</h3>
                <p>
                  Cuando una póliza incluya beneficiarios, aparecerán aquí
                  automáticamente con su relación, porcentaje y póliza asociada.
                </p>
              </div>
            ) : (
              beneficiariosMisSeguros.map((beneficiario) => (
                <div className="ms-row ms-cols-ben" key={beneficiario.id}>
                  <strong className="ms-cell-strong">
                    {beneficiario.nombre}
                  </strong>
                  <span className="ms-cell-muted">{beneficiario.rut}</span>
                  <span className="ms-cell-muted">{beneficiario.relacion}</span>
                  <span className="ms-cell-muted">
                    {beneficiario.seguro} / {beneficiario.poliza}
                  </span>
                  <strong className="ms-cell-strong">
                    {beneficiario.porcentaje}
                  </strong>
                  <span
                    className={`pc-status ${normalizarEstado(beneficiario.estado)}`}
                  >
                    {textoEstado(normalizarEstado(beneficiario.estado))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tabMisSeguros === "cuotas" && (
        <Cuotas
          pagos={pagos}
          polizasNormalizadas={polizasNormalizadas}
          normalizarEstado={normalizarEstado}
          formatearMoneda={formatearMoneda}
          formatearFecha={formatearFecha}
          textoEstado={textoEstado}
          abrirWhatsApp={abrirWhatsApp}
          setVista={setVista}
        />
      )}
      </div>
    </div>
  );
}

export default MisSeguros;
