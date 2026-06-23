import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/pages/Contacto.css";
import Footer from "../components/Footer";
import PhoneInput from "../components/PhoneInput";
import { enviarContacto } from "../services/api";

const NOMBRE_REGEX = /^[\p{L}\s'’.-]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(formulario) {
  const errores = {};

  const nombre = formulario.nombre.trim();
  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (!NOMBRE_REGEX.test(nombre)) {
    errores.nombre = "El nombre solo puede contener letras.";
  }

  const email = formulario.email.trim();
  if (!email) {
    errores.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  // Teléfono opcional: solo se valida si el usuario escribió algo.
  // Largo flexible (los números varían según país): basta un mínimo bajo.
  if (formulario.telefono) {
    const digitos = formulario.telefono.replace(/\D/g, "");
    if (digitos.length < 5) {
      errores.telefono = "El número de teléfono es demasiado corto.";
    }
  }

  const mensaje = formulario.mensaje.trim();
  if (!mensaje) {
    errores.mensaje = "Escribe tu mensaje.";
  }

  return errores;
}

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  // Tras mostrar el mensaje de éxito, volver solo al formulario vacío.
  useEffect(() => {
    if (!enviado) return;
    const t = setTimeout(() => {
      setEnviado(false);
      setFormulario({ nombre: "", email: "", telefono: "", mensaje: "" });
    }, 5000);
    return () => clearTimeout(t);
  }, [enviado]);

  function cambiarDato(e) {
    const { name, value } = e.target;
    // El nombre filtra en tiempo real: solo letras (con tildes/ñ), espacios y
    // ' . - — así no se pueden ni escribir caracteres como [] <> {}.
    // (Es UX; la seguridad real está en el backend.)
    const limpio =
      name === "nombre" ? value.replace(/[^\p{L}\s'’.-]/gu, "") : value;
    setFormulario((prev) => ({ ...prev, [name]: limpio }));
    // Limpiar el error del campo apenas el usuario lo corrige.
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  function cambiarTelefono(valor) {
    setFormulario((prev) => ({ ...prev, telefono: valor }));
    setErrores((prev) => ({ ...prev, telefono: undefined }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");

    const nuevosErrores = validar(formulario);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    setEnviando(true);
    try {
      await enviarContacto({
        nombre: formulario.nombre.trim(),
        email: formulario.email.trim(),
        telefono: formulario.telefono || null,
        mensaje: formulario.mensaje.trim(),
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
            <form onSubmit={enviar} noValidate>
              <div>
                <label>Nombre *</label>
                <input
                  name="nombre"
                  maxLength={80}
                  value={formulario.nombre}
                  onChange={cambiarDato}
                  placeholder="Tu nombre completo"
                  aria-invalid={errores.nombre ? "true" : undefined}
                  className={errores.nombre ? "input-invalido" : undefined}
                />
                {errores.nombre && (
                  <small className="campo-error">{errores.nombre}</small>
                )}
              </div>

              <div>
                <label>Correo electrónico *</label>
                <input
                  type="email"
                  name="email"
                  maxLength={120}
                  value={formulario.email}
                  onChange={cambiarDato}
                  placeholder="correo@ejemplo.cl"
                  aria-invalid={errores.email ? "true" : undefined}
                  className={errores.email ? "input-invalido" : undefined}
                />
                {errores.email && (
                  <small className="campo-error">{errores.email}</small>
                )}
              </div>

              <div>
                <label>Teléfono</label>
                <PhoneInput
                  name="telefono"
                  value={formulario.telefono}
                  onChange={cambiarTelefono}
                  placeholder="9 1234 5678"
                />
                {errores.telefono && (
                  <small className="campo-error">{errores.telefono}</small>
                )}
              </div>

              <div>
                <label>Mensaje *</label>
                <textarea
                  name="mensaje"
                  maxLength={1000}
                  value={formulario.mensaje}
                  onChange={cambiarDato}
                  placeholder="¿En qué te podemos ayudar?"
                  aria-invalid={errores.mensaje ? "true" : undefined}
                  className={errores.mensaje ? "input-invalido" : undefined}
                />
                {errores.mensaje && (
                  <small className="campo-error">{errores.mensaje}</small>
                )}
              </div>

              <p className="contacto-obligatorios">* Campos obligatorios</p>

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
