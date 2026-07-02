import "../../styles/pages/PortalDashboard.css";
import "../../styles/pages/MisSeguros.css";

/**
 * Mis Seguros — vista del portal del cliente con 2 pestanas:
 * Beneficiarios y Documentos.
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
            onClick={() => setVista("cotizaciones")}
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
          ["documentos", "Documentos", "Doc"],
          ["beneficiarios", "Beneficiarios", "Ben"],
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

      {tabMisSeguros === "documentos" && (
        <div>
          <div className="ms-stats-strip">
            <span>
              <strong>{documentosDemo.length}</strong>Documentos totales
            </span>
            <span>
              <strong>{polizasConDocumentos}</strong>Pólizas asociadas
            </span>
            <span>
              <strong>{documentosDisponibles}</strong>Disponibles
            </span>
            <span>
              <strong>{documentosDemo.length - documentosDisponibles}</strong>
              Bajo solicitud
            </span>
          </div>

          <div className="ms-filters">
            <input
              type="text"
              name="busqueda"
              className="ms-input"
              value={filtrosDocumentos.busqueda}
              onChange={actualizarFiltroDocumento}
              placeholder="Buscar documento..."
            />

            <select
              name="seguro"
              className="ms-select"
              value={filtrosDocumentos.seguro}
              onChange={actualizarFiltroDocumento}
            >
              {segurosDocumentos.map((seguro) => (
                <option key={seguro} value={seguro}>
                  {seguro === "todos" ? "Todos los seguros" : seguro}
                </option>
              ))}
            </select>

            <select
              name="tipo"
              className="ms-select"
              value={filtrosDocumentos.tipo}
              onChange={actualizarFiltroDocumento}
            >
              {tiposDocumentos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "todos" ? "Todos los tipos" : tipo}
                </option>
              ))}
            </select>

            <select
              name="estado"
              className="ms-select"
              value={filtrosDocumentos.estado}
              onChange={actualizarFiltroDocumento}
            >
              {estadosDocumentos.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === "todos" ? "Todos los estados" : estado}
                </option>
              ))}
            </select>
          </div>

          <div className="ms-table">
            <div className="ms-thead ms-cols-doc">
              <span>Documento</span>
              <span>Seguro / Póliza</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span>Acciones</span>
            </div>

            {documentosFiltrados.length === 0 ? (
              <div className="pc-empty">
                <h3>No se encontraron documentos</h3>
                <p>
                  Prueba cambiando los filtros o contacta a tu ejecutivo si
                  necesitas apoyo.
                </p>
              </div>
            ) : (
              documentosFiltrados.map((documento) => (
                <div className="ms-row ms-cols-doc" key={documento.id}>
                  <strong className="ms-cell-strong">{documento.nombre}</strong>
                  <span className="ms-cell-muted">{documento.seguro}</span>
                  <span>{documento.tipo}</span>
                  <span
                    className={`ms-doc-badge ${
                      documento.estado === "Disponible"
                        ? "is-disponible"
                        : documento.estado === "En preparación"
                          ? "is-preparacion"
                          : "is-otro"
                    }`}
                  >
                    {documento.estado}
                  </span>
                  <span>{formatearFecha(documento.fecha)}</span>
                  <div className="ms-row-actions">
                    <button
                      type="button"
                      className="ms-btn-sm ms-btn-sm--primary"
                      onClick={() => abrirPreviewDocumento(documento)}
                    >
                      Ver PDF
                    </button>
                    <button
                      type="button"
                      className="ms-btn-sm ms-btn-sm--outline"
                      onClick={() => descargarDocumento(documento)}
                    >
                      {documento.estado === "Disponible"
                        ? "Descargar"
                        : "Ejecutivo"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default MisSeguros;
