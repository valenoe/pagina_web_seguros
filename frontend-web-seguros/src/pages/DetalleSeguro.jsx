import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WHATSAPP_EJECUTIVO = "56966541939";

const segurosDetalle = {
  autos: {
    nombre: "Seguro de Autos",
    categoria: "Vehículos",
    icono: "/proteger.png",
    descripcion:
      "Protección para vehículos particulares ante accidentes, daños materiales, robo y responsabilidad civil.",
    coberturas: [
      "Daños materiales al vehículo",
      "Robo, hurto o uso no autorizado",
      "Responsabilidad civil frente a terceros",
      "Daños por incendio",
      "Asistencia en ruta según plan contratado",
      "Vehículo de reemplazo según condiciones de la póliza",
    ],
    beneficios: [
      "Asesoría directa con ejecutivo",
      "Gestión de cotización con distintas compañías",
      "Apoyo en renovación de póliza",
      "Orientación ante siniestros",
    ],
    requisitos: [
      "Permiso de circulación vigente",
      "Padrón del vehículo",
      "Datos del conductor principal",
      "Inspección si la compañía lo solicita",
    ],
  },
};

function DetalleSeguro() {
  const navigate = useNavigate();
  const { id } = useParams();

  const seguro = segurosDetalle[id] || segurosDetalle.autos;

  const [mostrarCotizador, setMostrarCotizador] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: localStorage.getItem("nombre_cliente") || "",
    rut: localStorage.getItem("rut_cliente") || "",
    correo: localStorage.getItem("correo_cliente") || "",
    telefono: localStorage.getItem("telefono_cliente") || "",
    detalle: "",
    comentario: "",
  });

  function actualizarFormulario(e) {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function volverAlPortal() {
    navigate("/clientes/dashboard?vista=cotizaciones", {
      state: { vista: "cotizaciones" },
    });
  }

  function enviarSolicitud(e) {
    e.preventDefault();

    const mensaje = `Hola, soy cliente de Prieto & Correa Seguros.

Quiero solicitar una cotización desde el portal cliente.

Seguro solicitado:
${seguro.nombre}

Categoría:
${seguro.categoria}

Datos del cliente:
Nombre: ${formulario.nombre || "No informado"}
RUT: ${formulario.rut || "No informado"}
Correo: ${formulario.correo || "No informado"}
Teléfono: ${formulario.telefono || "No informado"}

Datos principales:
${formulario.detalle || "No informado"}

Comentario:
${formulario.comentario || "Sin comentario adicional"}`;

    window.open(
      `https://wa.me/${WHATSAPP_EJECUTIVO}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section className="detalle-seguro-page">
      <div className="detalle-seguro-container">
        <button className="detalle-seguro-volver" onClick={volverAlPortal}>
          ← Volver al portal
        </button>

        <div className="detalle-seguro-hero">
          <div className="detalle-seguro-icono">
            <img src={seguro.icono} alt="" />
          </div>

          <div>
            <span>{seguro.categoria}</span>
            <h1>{seguro.nombre}</h1>
            <p>{seguro.descripcion}</p>
          </div>
        </div>

        <div className="detalle-seguro-grid">
          <article className="detalle-seguro-card">
            <h2>Qué cubre</h2>
            <ul>
              {seguro.coberturas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detalle-seguro-card">
            <h2>Beneficios</h2>
            <ul>
              {seguro.beneficios.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detalle-seguro-card">
            <h2>Requisitos</h2>
            <ul>
              {seguro.requisitos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="detalle-seguro-cta">
          <div>
            <span>Cotización personalizada</span>
            <h2>Solicita esta cotización desde tu portal</h2>
            <p>
              Completa los datos necesarios y un ejecutivo recibirá tu solicitud por
              WhatsApp para gestionar la cotización.
            </p>
          </div>

          {!mostrarCotizador && (
            <button onClick={() => setMostrarCotizador(true)}>
              Solicitar propuesta
            </button>
          )}

          {mostrarCotizador && (
            <form className="cotizador-interno-form" onSubmit={enviarSolicitud}>
              <div className="cotizador-form-grid">
                <label>
                  Nombre
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={actualizarFormulario}
                    required
                  />
                </label>

                <label>
                  RUT
                  <input
                    type="text"
                    name="rut"
                    value={formulario.rut}
                    onChange={actualizarFormulario}
                    required
                  />
                </label>

                <label>
                  Correo
                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={actualizarFormulario}
                    required
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    type="text"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={actualizarFormulario}
                    required
                  />
                </label>
              </div>

              <label>
                Datos para cotizar
                <textarea
                  rows="2"
                  name="detalle"
                  value={formulario.detalle}
                  onChange={actualizarFormulario}
                  placeholder="Ejemplo: patente, dirección, destino, monto requerido, etc."
                  required
                />
              </label>

              <label>
                Comentario adicional
                <textarea
                  rows="2"
                  name="comentario"
                  value={formulario.comentario}
                  onChange={actualizarFormulario}
                  placeholder="Información adicional para el ejecutivo."
                />
              </label>

              <div className="cotizador-interno-actions">
                <button
                  type="button"
                  className="cotizador-cancelar"
                  onClick={() => setMostrarCotizador(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="cotizador-enviar cotizador-enviar-whatsapp">
                  <img src="/whatsapp.png" alt="" />
                  Enviar por WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default DetalleSeguro;