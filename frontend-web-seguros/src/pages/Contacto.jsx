import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { enviarContacto } from "../services/api";

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  function cambiarDato(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await enviarContacto({
        nombre: formulario.nombre,
        email: formulario.email,
        telefono: formulario.telefono || null,
        mensaje: formulario.mensaje || null,
      });
      setEnviado(true);
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />

      <section className="contacto">
        <div className="contacto-box">
          <h1>Contáctanos</h1>
          <p>Déjanos tus datos y te responderemos a la brevedad.</p>

          {enviado ? (
            <div className="contacto-exito">
              <p>Mensaje enviado. Nos pondremos en contacto contigo pronto.</p>
            </div>
          ) : (
            <form onSubmit={enviar}>
              <div>
                <label>Nombre *</label>
                <input
                  name="nombre"
                  required
                  value={formulario.nombre}
                  onChange={cambiarDato}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label>Correo electrónico *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formulario.email}
                  onChange={cambiarDato}
                  placeholder="correo@ejemplo.cl"
                />
              </div>

              <div>
                <label>Teléfono</label>
                <input
                  name="telefono"
                  value={formulario.telefono}
                  onChange={cambiarDato}
                  placeholder="+56 9 XXXX XXXX"
                />
              </div>

              <div>
                <label>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={formulario.mensaje}
                  onChange={cambiarDato}
                  placeholder="¿En qué te podemos ayudar?"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contacto;
