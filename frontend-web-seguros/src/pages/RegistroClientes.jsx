import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PhoneInput from "../components/PhoneInput";
import { registroCliente, verificarRutDisponible } from "../services/api";
import "../styles/pages/RegistroOnboarding.css";

function validarRut(rut) {
  const limpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);
  return dv === dvCalculado;
}

function formatearRut(valor) {
  const limpio = valor.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let formateado = "";
  for (let i = cuerpo.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) formateado = "." + formateado;
    formateado = cuerpo[i] + formateado;
  }
  return `${formateado}-${dv}`;
}

function RegistroClientes() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarPasswords, setMostrarPasswords] = useState(false);
  const submitHabilitado = useRef(false);

  useEffect(() => {
    submitHabilitado.current = false;
    if (paso === 4) {
      requestAnimationFrame(() => {
        submitHabilitado.current = true;
      });
    }
  }, [paso]);

  const [formulario, setFormulario] = useState({
    tipo_cliente: "persona",
    nombre: "",
    rut: "",
    fecha_nacimiento: "",
    direccion: "",
    region: "",
    comuna: "",
    correo: "",
    telefono: "",
    whatsapp: "",
    password: "",
    confirmar_password: "",
    acepta_terminos: false,
  });

  function cambiarDato(e) {
    const { name, value, type, checked } = e.target;
    const nuevo = type === "checkbox" ? checked : value;
    setFormulario({
      ...formulario,
      [name]: name === "rut" ? formatearRut(nuevo) : nuevo,
    });
  }

  function cambiarTelefono(campo, valor) {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function siguientePaso() {
    setError("");

    if (paso === 1 && !formulario.tipo_cliente) {
      setError("Selecciona el tipo de cliente.");
      return;
    }

    if (paso === 2) {
      if (
        !formulario.nombre ||
        !formulario.rut ||
        !formulario.direccion ||
        !formulario.region ||
        !formulario.comuna
      ) {
        setError("Completa todos los datos.");
        return;
      }
      if (!validarRut(formulario.rut)) {
        setError(
          "El RUT ingresado no es válido. Verifica si estás en Persona o Empresa.",
        );
        return;
      }
      setEnviando(true);
      const disponible = await verificarRutDisponible(
        formulario.rut,
        formulario.tipo_cliente,
      );
      setEnviando(false);
      if (!disponible) {
        setError(
          "No es posible registrarse con este RUT. Verifica que estés en la pestaña correcta (Persona / Empresa).",
        );
        return;
      }
    }

    if (paso === 3) {
      if (!formulario.correo || !formulario.telefono) {
        setError("Completa tus datos de contacto.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formulario.correo)) {
        setError("El correo electrónico no es válido.");
        return;
      }
      if (formulario.telefono.replace(/\D/g, "").length < 7) {
        setError("El número de teléfono es demasiado corto.");
        return;
      }
    }

    setPaso(paso + 1);
  }

  function pasoAnterior() {
    setError("");
    if (paso === 4) {
      setFormulario((prev) => ({ ...prev, acepta_terminos: false }));
    }
    setPaso(paso - 1);
  }

  async function crearCuenta(e) {
    e.preventDefault();

    if (!submitHabilitado.current) return;

    setError("");
    setExito("");

    if (formulario.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (formulario.password !== formulario.confirmar_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!formulario.acepta_terminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setEnviando(true);

    try {
      await registroCliente({
        tipo_cliente: formulario.tipo_cliente,
        nombre: formulario.nombre,
        rut: formulario.rut,
        email: formulario.correo,
        telefono: formulario.telefono || null,
        whatsapp: formulario.whatsapp || null,
        password: formulario.password,
      });

      setExito("¡Cuenta creada! Redirigiendo al login...");
      setTimeout(() => navigate("/login-clientes"), 2000);
    } catch (err) {
      if (err.message?.includes("409")) {
        setError(
          "No es posible registrarse con este RUT. Verifica que hayas seleccionado el tipo correcto (Persona / Empresa).",
        );
      } else {
        setError(
          err.message || "Error al crear la cuenta. Intenta nuevamente.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />

      <section className="registro-onboarding-page">
        <div className="registro-onboarding-card">
          <div className="registro-onboarding-left">
            <img src="/LOGO_TRANSPARENTE.svg" alt="Prieto & Correa" />

            <span>Portal Clientes</span>

            <h1>Crea tu cuenta</h1>

            <p>
              Completa tu información para acceder a tus pólizas, documentos,
              cotizaciones y solicitudes.
            </p>

            <Link to="/login-clientes">← Volver al login</Link>
          </div>

          <div className="registro-onboarding-right">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="registro-steps">
                <div className={paso >= 1 ? "step active" : "step"}>1</div>
                <div className={paso >= 2 ? "step active" : "step"}>2</div>
                <div className={paso >= 3 ? "step active" : "step"}>3</div>
                <div className={paso >= 4 ? "step active" : "step"}>4</div>
              </div>
              {paso >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setPaso(1);
                  }}
                  style={{
                    fontSize: "0.78rem",
                    color: "#555",
                    background: "#f3f4f6",
                    padding: "0.2rem 0.7rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    cursor: "pointer",
                  }}
                >
                  {formulario.tipo_cliente === "persona"
                    ? "👤 Persona"
                    : "🏢 Empresa"}
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                if (paso !== 4) {
                  e.preventDefault();
                  return;
                }
                crearCuenta(e);
              }}
            >
              {paso === 1 && (
                <div className="registro-step-content">
                  <span>Paso 1</span>
                  <h2>Tipo de cuenta</h2>
                  <p>Selecciona si crearás una cuenta personal o empresa.</p>

                  <div className="registro-tipo-grid">
                    <button
                      type="button"
                      className={
                        formulario.tipo_cliente === "persona" ? "active" : ""
                      }
                      onClick={() =>
                        setFormulario({
                          ...formulario,
                          tipo_cliente: "persona",
                        })
                      }
                    >
                      <strong>Persona</strong>
                      <small>Cuenta para cliente particular</small>
                    </button>

                    <button
                      type="button"
                      className={
                        formulario.tipo_cliente === "empresa" ? "active" : ""
                      }
                      onClick={() =>
                        setFormulario({
                          ...formulario,
                          tipo_cliente: "empresa",
                        })
                      }
                    >
                      <strong>Empresa</strong>
                      <small>Cuenta para razón social</small>
                    </button>
                  </div>
                </div>
              )}

              {paso === 2 && (
                <div className="registro-step-content">
                  <span>Paso 2</span>

                  <h2>
                    {formulario.tipo_cliente === "empresa"
                      ? "Datos de la empresa"
                      : "Datos personales"}
                  </h2>

                  <div className="registro-form-grid">
                    <input
                      name="nombre"
                      value={formulario.nombre}
                      onChange={cambiarDato}
                      placeholder={
                        formulario.tipo_cliente === "empresa"
                          ? "Razón social"
                          : "Nombre completo"
                      }
                    />

                    <input
                      name="rut"
                      value={formulario.rut}
                      onChange={cambiarDato}
                      placeholder={
                        formulario.tipo_cliente === "empresa"
                          ? "RUT empresa"
                          : "RUT persona"
                      }
                    />

                    {formulario.tipo_cliente === "persona" && (
                      <input
                        name="fecha_nacimiento"
                        type="date"
                        value={formulario.fecha_nacimiento}
                        onChange={cambiarDato}
                      />
                    )}

                    <input
                      name="direccion"
                      value={formulario.direccion}
                      onChange={cambiarDato}
                      placeholder="Dirección"
                    />

                    <input
                      name="region"
                      value={formulario.region}
                      onChange={cambiarDato}
                      placeholder="Región"
                    />

                    <input
                      name="comuna"
                      value={formulario.comuna}
                      onChange={cambiarDato}
                      placeholder="Comuna"
                    />
                  </div>
                </div>
              )}

              {paso === 3 && (
                <div className="registro-step-content">
                  <span>Paso 3</span>
                  <h2>Datos de contacto</h2>

                  <div className="registro-form-grid">
                    <input
                      name="correo"
                      type="email"
                      value={formulario.correo}
                      onChange={cambiarDato}
                      placeholder="Correo electrónico"
                    />

                    <PhoneInput
                      name="telefono"
                      value={formulario.telefono}
                      onChange={(val) => cambiarTelefono("telefono", val)}
                      placeholder="Teléfono"
                      required
                    />

                    <PhoneInput
                      name="whatsapp"
                      value={formulario.whatsapp}
                      onChange={(val) => cambiarTelefono("whatsapp", val)}
                      placeholder="WhatsApp (opcional)"
                    />
                  </div>
                </div>
              )}

              {paso === 4 && (
                <div className="registro-step-content">
                  <span>Paso 4</span>
                  <h2>Seguridad</h2>

                  <div className="registro-form-grid">
                    <input
                      name="password"
                      type={mostrarPasswords ? "text" : "password"}
                      autoComplete="new-password"
                      value={formulario.password}
                      onChange={cambiarDato}
                      placeholder="Contraseña"
                    />

                    <input
                      name="confirmar_password"
                      type={mostrarPasswords ? "text" : "password"}
                      autoComplete="new-password"
                      value={formulario.confirmar_password}
                      onChange={cambiarDato}
                      placeholder="Confirmar contraseña"
                    />
                  </div>

                  <label
                    className="registro-check"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <input
                      type="checkbox"
                      checked={mostrarPasswords}
                      onChange={() => setMostrarPasswords(!mostrarPasswords)}
                    />
                    Mostrar contraseña
                  </label>

                  <label className="registro-check">
                    <input
                      type="checkbox"
                      name="acepta_terminos"
                      checked={formulario.acepta_terminos}
                      onChange={cambiarDato}
                    />
                    Acepto términos, condiciones y tratamiento de datos.
                  </label>
                </div>
              )}

              {error && <p className="form-error">{error}</p>}

              {exito && <p className="form-success">{exito}</p>}

              <div className="registro-actions">
                {paso > 1 && (
                  <button type="button" onClick={pasoAnterior}>
                    Atrás
                  </button>
                )}

                {paso < 4 ? (
                  <button type="button" onClick={siguientePaso}>
                    Continuar
                  </button>
                ) : (
                  <button type="submit" disabled={enviando}>
                    {enviando ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default RegistroClientes;
