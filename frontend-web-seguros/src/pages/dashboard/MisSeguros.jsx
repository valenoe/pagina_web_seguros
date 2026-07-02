import "../../styles/pages/PortalDashboard.css";

/**
 * Mis Seguros — vista del portal del cliente con 3 pestanas:
 * Coberturas, Beneficiarios y Documentos.
 *
 * Extraida del monolito Dashboard.jsx. Es PRESENTACIONAL: el padre sigue
 * calculando las derivaciones (coberturas/beneficiarios/documentos, exclusivas
 * de esta vista) y se las pasa ya listas. La lista de props larga es a proposito:
 * marca ese bloque de derivaciones como candidato a un hook compartido
 * (usePortalData) en una pasada futura.
 *
 * NOTA: el modal de preview de PDF se elimino junto con la vista documentos
 * muerta; abrirPreviewDocumento queda como no-op hasta reconectar el visor real.
 */
function MisSeguros({
  tabMisSeguros,
  setTabMisSeguros,
  coberturasFilas,
  coberturasRegistradas,
  coberturasIncluidas,
  coberturasExcluidas,
  polizasConCoberturas,
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
                <div
                  className="pc-panel-title"
                  style={{ marginBottom: "16px", alignItems: "flex-start" }}
                >
                  <div>
                    <h2 style={{ marginBottom: "6px" }}>Mis Seguros</h2>
                    <p
                      style={{
                        margin: 0,
                        color: "#667085",
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      Visualiza tus pólizas, coberturas, beneficiarios y
                      documentos en un solo lugar.
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
                        background:
                          tabMisSeguros === tab ? "#07195a" : "transparent",
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
                          gridTemplateColumns:
                            "1.35fr 1.25fr 0.8fr 0.8fr 0.8fr 0.75fr",
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

                          <p
                            style={{
                              color: "#56637a",
                              fontSize: "13px",
                              lineHeight: 1.6,
                              marginBottom: "16px",
                            }}
                          >
                            Cuando tus pólizas estén activas, verás aquí qué
                            cubre cada seguro, sus montos, deducibles y
                            exclusiones principales.
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
                          >
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
                              onClick={() =>
                                abrirWhatsApp(
                                  "Hola, necesito orientación sobre las coberturas de mis seguros.",
                                )
                              }
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
                              gridTemplateColumns:
                                "1.35fr 1.25fr 0.8fr 0.8fr 0.8fr 0.75fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "13px 16px",
                              borderTop: "1px solid #eef2f7",
                              fontSize: "13px",
                            }}
                          >
                            <strong style={{ color: "#07195a" }}>
                              {cobertura.nombre}
                            </strong>
                            <span style={{ color: "#475467" }}>
                              {cobertura.seguro} / {cobertura.poliza}
                            </span>
                            <span style={{ color: "#475467" }}>
                              {cobertura.condicion}
                            </span>
                            <strong style={{ color: "#07195a" }}>
                              {cobertura.monto}
                            </strong>
                            <span style={{ color: "#475467" }}>
                              {cobertura.deducible}
                            </span>
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
                              {cobertura.estado === "incluida"
                                ? "Incluida"
                                : "Excluida"}
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
                        <strong>
                          {beneficiariosTotales === 0 ? "—" : "Al día"}
                        </strong>
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
                          gridTemplateColumns:
                            "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
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
                              gridTemplateColumns:
                                "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
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

                          <div
                            className="pc-empty"
                            style={{ margin: "14px", padding: "24px" }}
                          >
                            <h3>Aún no tienes beneficiarios asociados</h3>
                            <p>
                              Cuando una póliza incluya beneficiarios,
                              aparecerán aquí automáticamente con su relación,
                              porcentaje y póliza asociada.
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
                                    "Hola, necesito ayuda para revisar o registrar beneficiarios en mis seguros.",
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
                        beneficiariosMisSeguros.map((beneficiario) => (
                          <div
                            key={beneficiario.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "1.2fr 0.85fr 0.9fr 1.25fr 0.55fr 0.75fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "13px 16px",
                              borderTop: "1px solid #eef2f7",
                              fontSize: "13px",
                            }}
                          >
                            <strong style={{ color: "#07195a" }}>
                              {beneficiario.nombre}
                            </strong>
                            <span style={{ color: "#475467" }}>
                              {beneficiario.rut}
                            </span>
                            <span style={{ color: "#475467" }}>
                              {beneficiario.relacion}
                            </span>
                            <span style={{ color: "#475467" }}>
                              {beneficiario.seguro} / {beneficiario.poliza}
                            </span>
                            <strong style={{ color: "#07195a" }}>
                              {beneficiario.porcentaje}
                            </strong>
                            <span
                              className={`pc-status ${normalizarEstado(beneficiario.estado)}`}
                            >
                              {textoEstado(
                                normalizarEstado(beneficiario.estado),
                              )}
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
                        <strong>
                          {documentosDemo.length - documentosDisponibles}
                        </strong>
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
                            "1.2fr 1.35fr 0.75fr 0.8fr 0.75fr 1fr",
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
                          <p>
                            Prueba cambiando los filtros o contacta a tu
                            ejecutivo si necesitas apoyo.
                          </p>
                        </div>
                      ) : (
                        documentosFiltrados.map((documento) => (
                          <div
                            key={documento.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "1.2fr 1.35fr 0.75fr 0.8fr 0.75fr 1fr",
                              gap: "10px",
                              alignItems: "center",
                              padding: "13px 16px",
                              borderTop: "1px solid #eef2f7",
                              fontSize: "13px",
                            }}
                          >
                            <strong style={{ color: "#07195a" }}>
                              {documento.nombre}
                            </strong>
                            <span style={{ color: "#475467" }}>
                              {documento.seguro}
                            </span>
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
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                              }}
                            >
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
                                onClick={() => descargarDocumento(documento)}
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
  );
}

export default MisSeguros;
