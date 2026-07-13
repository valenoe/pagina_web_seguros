import { useState } from "react";

/**
 * Club Prieto & Correa — vista de beneficios del portal del cliente.
 *
 * Extraída del monolito Dashboard.jsx como piloto de la división por vistas.
 * Es autocontenida: maneja su propio estado (categoría activa, slide destacado,
 * beneficio solicitado) y sólo recibe del padre los datos crudos y la identidad
 * del cliente para el comprobante.
 *
 * CONTRATO DE DATOS:
 *   - beneficios → broker (`/portal/mis-beneficios`). NO EXISTE AÚN.
 *     Hoy llega vacío y se cae al fallback BENEFICIOS_DEMO de abajo.
 *   - nombreVisible, rut → mi-backend (getMiCuenta). Sólo para el comprobante.
 */

const CATEGORIAS_BENEFICIOS = [
  { id: "todos", nombre: "Todos", icono: "/descuento.png" },
  { id: "bienestar", nombre: "Bienestar", icono: "/bienstar.png" },
  { id: "salud", nombre: "Salud", icono: "/beneficios.png" },
  { id: "descuentos", nombre: "Descuentos", icono: "/descuento.png" },
];

// Fallback mientras el broker no entregue `/portal/mis-beneficios`.
const BENEFICIOS_DEMO = [
  {
    id_beneficio: "kimagen-1",
    empresa: "Kimagen",
    titulo: "Kimagen",
    descuento: "15% dcto.",
    descripcion:
      "15% de descuento en prestaciones asociadas para clientes del Club Prieto & Correa.",
    bajada: "Presentar orden médica junto al beneficio Club Prieto & Correa.",
    condiciones:
      "Válido presentando orden médica. Beneficio no acumulable con otras promociones.",
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
    bajada: "Beneficio aplicable en sus servicios disponibles.",
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

function formatearFecha(fecha) {
  if (!fecha) return "—";
  // Fecha pura "YYYY-MM-DD": se formatea a mano para evitar el corrimiento de
  // zona horaria (new Date la lee en UTC y en Chile, UTC−4, se va un día atrás).
  const m = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return new Date(fecha).toLocaleDateString("es-CL");
}

function obtenerSiglaBeneficio(beneficio) {
  const texto = `${beneficio?.empresa || ""} ${beneficio?.titulo || ""}`.toLowerCase();

  if (texto.includes("kimagen")) return "KIM";
  if (texto.includes("kineintegral")) return "ABK";

  return (
    String(beneficio?.empresa || beneficio?.titulo || "BEN")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase() || "BEN"
  );
}

function ClubBeneficios({ beneficios = [], nombreVisible = "Cliente", rut = "" }) {
  const [categoriaBeneficioActiva, setCategoriaBeneficioActiva] = useState("todos");
  const [beneficioSlide, setBeneficioSlide] = useState(0);
  const [beneficioSolicitado, setBeneficioSolicitado] = useState(null);

  const beneficiosBase = beneficios.length > 0 ? beneficios : BENEFICIOS_DEMO;
  const beneficiosFiltrados = beneficiosBase.filter((beneficio) => {
    if (categoriaBeneficioActiva === "todos") return true;
    return String(beneficio.categoria || "").toLowerCase() === categoriaBeneficioActiva;
  });
  const beneficiosDestacados = beneficiosBase.filter(
    (beneficio) => beneficio.destacado !== false
  );
  const beneficioPrincipal =
    beneficiosDestacados.length > 0
      ? beneficiosDestacados[beneficioSlide % beneficiosDestacados.length]
      : beneficiosBase[0];
  const beneficiosActivos = beneficiosBase.filter(
    (beneficio) => beneficio.estado !== "proximamente"
  ).length;

  function generarCodigoBeneficio(beneficio) {
    const sigla = obtenerSiglaBeneficio(beneficio);
    const anio = beneficio?.vigencia
      ? new Date(beneficio.vigencia).getFullYear()
      : new Date().getFullYear();
    const indice = Math.max(
      1,
      beneficiosBase.findIndex(
        (item) =>
          (item.id_beneficio || item.id) === (beneficio.id_beneficio || beneficio.id)
      ) + 1
    );

    return `CLUB-PC-${sigla}-${anio}-${String(indice).padStart(4, "0")}`;
  }

  function solicitarBeneficio(beneficio) {
    if (!beneficio || beneficio.estado === "proximamente") return;

    setBeneficioSolicitado({
      ...beneficio,
      codigoBeneficio: generarCodigoBeneficio(beneficio),
      cliente: nombreVisible || "Cliente",
      rut: rut || "12.345.678-9",
      fechaSolicitud: new Date().toISOString(),
    });
  }

  function cerrarModalBeneficio() {
    setBeneficioSolicitado(null);
  }

  function copiarCodigoBeneficio() {
    if (!beneficioSolicitado?.codigoBeneficio) return;

    navigator.clipboard?.writeText(beneficioSolicitado.codigoBeneficio);
  }

  return (
    <>
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

          <p
            style={{
              margin: 0,
              maxWidth: "740px",
              color: "#56637a",
              lineHeight: 1.6,
              fontSize: "14px",
            }}
          >
            Accede a descuentos, convenios y promociones asociadas a tu portal de seguros.
            Esta sección queda preparada para conectarse al backend mediante{" "}
            <strong>/portal/mis-beneficios</strong>.
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
              backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.10)), url(${
                beneficioPrincipal?.imagen || "/restaurant.jpg"
              })`,
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
                {beneficioPrincipal?.descuento
                  ? `${beneficioPrincipal.descuento} en ${beneficioPrincipal.titulo}`
                  : beneficioPrincipal?.titulo || "Beneficios disponibles próximamente"}
              </h3>

              <p
                style={{
                  margin: "0 0 16px",
                  maxWidth: "560px",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 800,
                }}
              >
                {beneficioPrincipal?.descripcion ||
                  beneficioPrincipal?.bajada ||
                  "Cuando existan beneficios activos aparecerán aquí."}
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
                      width:
                        beneficioSlide % beneficiosDestacados.length === index
                          ? "28px"
                          : "9px",
                      height: "9px",
                      border: "none",
                      borderRadius: "999px",
                      background:
                        beneficioSlide % beneficiosDestacados.length === index
                          ? "#f47c20"
                          : "rgba(255,255,255,0.55)",
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
              [CATEGORIAS_BENEFICIOS.length, "Categorías"],
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
                <strong
                  style={{
                    display: "block",
                    color: "#07195a",
                    fontSize: "30px",
                    marginBottom: "6px",
                  }}
                >
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
          <strong
            style={{
              color: "#07195a",
              fontSize: "12px",
              textTransform: "uppercase",
              marginRight: "8px",
            }}
          >
            Categorías
          </strong>

          {CATEGORIAS_BENEFICIOS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => setCategoriaBeneficioActiva(categoria.id)}
              style={{
                minWidth: "104px",
                height: "66px",
                border: "1px solid #dfe6f3",
                borderRadius: "14px",
                background:
                  categoriaBeneficioActiva === categoria.id ? "#07195a" : "#ffffff",
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
                  filter:
                    categoriaBeneficioActiva === categoria.id
                      ? "brightness(0) invert(1)"
                      : "none",
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
              <p>
                Prueba seleccionando otra categoría o revisa nuevamente cuando el backend
                esté conectado.
              </p>
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
                      background:
                        beneficio.estado === "proximamente" ? "#fff0e6" : "#ecfdf3",
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
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#667085",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {beneficio.descripcion ||
                      beneficio.bajada ||
                      "Beneficio disponible para clientes."}
                  </p>
                  <small style={{ color: "#56637a", fontWeight: 900 }}>
                    Vigencia: {formatearFecha(beneficio.vigencia)}
                  </small>

                  {beneficio.descuento && (
                    <strong
                      style={{
                        display: "block",
                        marginTop: "10px",
                        color: "#f47c20",
                        fontSize: "22px",
                      }}
                    >
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
                  onClick={() => solicitarBeneficio(beneficio)}
                  style={{
                    alignSelf: "end",
                    minHeight: "40px",
                    border: "none",
                    borderRadius: "12px",
                    background:
                      beneficio.estado === "proximamente" ? "#cbd5e1" : "#07195a",
                    color: "#ffffff",
                    fontWeight: 950,
                    cursor:
                      beneficio.estado === "proximamente" ? "not-allowed" : "pointer",
                  }}
                  disabled={beneficio.estado === "proximamente"}
                >
                  Solicitar beneficio
                </button>
              </article>
            ))
          )}
        </section>
      </div>

      {beneficioSolicitado && (
        <div className="pc-beneficio-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="pc-beneficio-modal-backdrop"
            aria-label="Cerrar beneficio solicitado"
            onClick={cerrarModalBeneficio}
          />

          <article className="pc-beneficio-modal-card">
            <button
              type="button"
              className="pc-beneficio-modal-close"
              onClick={cerrarModalBeneficio}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="pc-beneficio-modal-success">✓</div>

            <span className="pc-beneficio-modal-kicker">Club Prieto & Correa</span>

            <h2>Beneficio solicitado correctamente</h2>

            <p className="pc-beneficio-modal-intro">
              Presenta este comprobante junto a tu cédula de identidad para acceder al
              descuento.
            </p>

            <div className="pc-beneficio-comprobante">
              <div>
                <small>Cliente</small>
                <strong>{beneficioSolicitado.cliente}</strong>
              </div>

              <div>
                <small>RUT</small>
                <strong>{beneficioSolicitado.rut}</strong>
              </div>

              <div>
                <small>Empresa</small>
                <strong>{beneficioSolicitado.empresa || beneficioSolicitado.titulo}</strong>
              </div>

              <div>
                <small>Descuento</small>
                <strong>{beneficioSolicitado.descuento || "Beneficio activo"}</strong>
              </div>

              <div>
                <small>Válido hasta</small>
                <strong>{formatearFecha(beneficioSolicitado.vigencia)}</strong>
              </div>
            </div>

            <div className="pc-beneficio-codigo-box">
              <small>Código de beneficio</small>
              <strong>{beneficioSolicitado.codigoBeneficio}</strong>
            </div>

            <p className="pc-beneficio-modal-note">
              Presente este código junto a su cédula de identidad. Beneficio sujeto a
              validación del prestador y condiciones del convenio.
            </p>

            <div className="pc-beneficio-modal-actions">
              <button type="button" onClick={copiarCodigoBeneficio}>
                Copiar código
              </button>

              <button type="button" onClick={cerrarModalBeneficio}>
                Entendido
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}

export default ClubBeneficios;
