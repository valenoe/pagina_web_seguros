import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PhoneInput from "../components/PhoneInput";
import { registroCliente } from "../services/api";
import "../App.css";

function esRutValido(rut) {
  const limpio = rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = suma % 11;
  const dvEsperado = resto === 1 ? "K" : String(resto === 0 ? 0 : 11 - resto);
  return dv === dvEsperado;
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RegistroClientes() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

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
    const val = type === "checkbox" ? checked : value;
    setFormulario({ ...formulario, [name]: val });
  }

  function setTelefono(value) {
    setFormulario((f) => ({ ...f, telefono: value }));
  }

  function setWhatsapp(value) {
    setFormulario((f) => ({ ...f, whatsapp: value }));
  }

  function siguientePaso() {
    setError("");

    if (paso === 1 && !formulario.tipo_cliente) {
      setError("Selecciona el tipo de cliente.");
      return;
    }

    if (paso === 2) {
      if (!formulario.nombre || !formulario.rut || !formulario.direccion || !formulario.region || !formulario.comuna) {
        setError("Completa todos los datos del cliente.");
        return;
      }
      if (!esRutValido(formulario.rut)) {
        setError("El RUT ingresado no es válido. Ej: 12.345.678-9");
        return;
      }
    }

    if (paso === 3) {
      if (!formulario.correo || !formulario.telefono) {
        setError("Completa tus datos de contacto.");
        return;
      }
      if (!esEmailValido(formulario.correo)) {
        setError("El correo electrónico no tiene un formato válido.");
        return;
      }
    }

    setPaso(paso + 1);
  }

  function pasoAnterior() {
    setError("");
    setPaso(paso - 1);
  }

  async function crearCuenta(e) {
    e.preventDefault();
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

    try {
      await registroCliente({
        tipo_cliente: formulario.tipo_cliente,
        nombre: formulario.nombre,
        rut: formulario.rut,
        email: formulario.correo,
        telefono: formulario.telefono || null,
        password: formulario.password,
      });

      setExito("Cuenta creada exitosamente. Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate("/login-clientes"), 2000);
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta. Intenta nuevamente.");
    }
  }

  return (
    <>
      <Header />

      <section className="registro-onboarding-page">
        <div className="registro-onboarding-card">
          <div className="registro-onboarding-left">
            <img src="/Logo Prieto.png" alt="Prieto & Correa" />

            <span>Portal Clientes</span>

            <h1>Crea tu cuenta</h1>

            <p>
              Completa tu información para acceder a tus pólizas, documentos,
              cotizaciones y solicitudes.
            </p>

            <Link to="/login-clientes">← Volver al login</Link>
          </div>

          <div className="registro-onboarding-right">
            <div className="registro-steps">
              <div className={paso >= 1 ? "step active" : "step"}>1</div>
              <div className={paso >= 2 ? "step active" : "step"}>2</div>
              <div className={paso >= 3 ? "step active" : "step"}>3</div>
              <div className={paso >= 4 ? "step active" : "step"}>4</div>
            </div>

            <form onSubmit={crearCuenta} autoComplete="off">
              {paso === 1 && (
                <div className="registro-step-content">
                  <span>Paso 1</span>
                  <h2>Tipo de cuenta</h2>
                  <p>Selecciona si crearás una cuenta personal o empresa.</p>

                  <div className="registro-tipo-grid">
                    <button
                      type="button"
                      className={formulario.tipo_cliente === "persona" ? "active" : ""}
                      onClick={() => setFormulario({ ...formulario, tipo_cliente: "persona" })}
                    >
                      <strong>Persona</strong>
                      <small>Cuenta para cliente particular</small>
                    </button>

                    <button
                      type="button"
                      className={formulario.tipo_cliente === "empresa" ? "active" : ""}
                      onClick={() => setFormulario({ ...formulario, tipo_cliente: "empresa" })}
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
                    {formulario.tipo_cliente === "empresa" ? "Datos de la empresa" : "Datos personales"}
                  </h2>

                  <div className="registro-form-grid">
                    <input
                      name="nombre"
                      autoComplete="off"
                      value={formulario.nombre}
                      onChange={cambiarDato}
                      placeholder={formulario.tipo_cliente === "empresa" ? "Razón social" : "Nombre completo"}
                    />

                    <input
                      name="rut"
                      autoComplete="off"
                      value={formulario.rut}
                      onChange={cambiarDato}
                      placeholder={formulario.tipo_cliente === "empresa" ? "RUT empresa (ej: 76.123.456-7)" : "RUT persona (ej: 12.345.678-9)"}
                    />

                    {formulario.tipo_cliente === "persona" && (
                      <input
                        name="fecha_nacimiento"
                        type="date"
                        autoComplete="off"
                        value={formulario.fecha_nacimiento}
                        onChange={cambiarDato}
                      />
                    )}

                    <input
                      name="direccion"
                      autoComplete="off"
                      value={formulario.direccion}
                      onChange={cambiarDato}
                      placeholder="Dirección"
                    />

                    <input
                      name="region"
                      autoComplete="off"
                      value={formulario.region}
                      onChange={cambiarDato}
                      placeholder="Región"
                    />

                    <input
                      name="comuna"
                      autoComplete="off"
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
                      autoComplete="off"
                      value={formulario.correo}
                      onChange={cambiarDato}
                      placeholder="Correo electrónico"
                    />

                    <PhoneInput
                      value={formulario.telefono}
                      onChange={setTelefono}
                      placeholder="912345678"
                    />

                    <PhoneInput
                      value={formulario.whatsapp}
                      onChange={setWhatsapp}
                      placeholder="912345678 (WhatsApp)"
                    />
                  </div>
                </div>
              )}

              {paso === 4 && (
                <div className="registro-step-content">
                  <span>Paso 4</span>
                  <h2>Seguridad</h2>

                  <div className="registro-form-col">
                    <input
                      name="password"
                      type={mostrarPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formulario.password}
                      onChange={cambiarDato}
                      placeholder="Contraseña"
                    />
                    <input
                      name="confirmar_password"
                      type={mostrarConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={formulario.confirmar_password}
                      onChange={cambiarDato}
                      placeholder="Confirmar contraseña"
                    />
                  </div>

                  <div className="login-options" style={{ marginTop: "0.75rem" }}>
                    <label className="mostrar-password">
                      <input
                        type="checkbox"
                        checked={mostrarPassword}
                        onChange={() => setMostrarPassword(!mostrarPassword)}
                      />
                      Mostrar contraseña
                    </label>

                    <label className="mostrar-password">
                      <input
                        type="checkbox"
                        checked={mostrarConfirm}
                        onChange={() => setMostrarConfirm(!mostrarConfirm)}
                      />
                      Mostrar confirmación
                    </label>
                  </div>

                  <label className="registro-check" style={{ marginTop: "1rem" }}>
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
                  <button type="submit">Crear cuenta</button>
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
