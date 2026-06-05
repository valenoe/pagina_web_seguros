import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";

function RegistroClientes() {
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

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

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function siguientePaso() {
    setError("");

    if (paso === 1 && !formulario.tipo_cliente) {
      setError("Selecciona el tipo de cliente.");
      return;
    }

    if (
      paso === 2 &&
      (!formulario.nombre ||
        !formulario.rut ||
        !formulario.direccion ||
        !formulario.region ||
        !formulario.comuna)
    ) {
      setError("Completa todos los datos del cliente.");
      return;
    }

    if (paso === 3 && (!formulario.correo || !formulario.telefono)) {
      setError("Completa tus datos de contacto.");
      return;
    }

    setPaso(paso + 1);
  }

  function pasoAnterior() {
    setError("");
    setPaso(paso - 1);
  }

  function crearCuenta(e) {
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

    localStorage.setItem("nombre_cliente", formulario.nombre);
    localStorage.setItem("rut_cliente", formulario.rut);
    localStorage.setItem("correo_cliente", formulario.correo);
    localStorage.setItem("telefono_cliente", formulario.telefono);
    localStorage.setItem(
      "tipo_cliente",
      formulario.tipo_cliente === "empresa" ? "Empresa" : "Persona natural"
    );

    setExito(
      "Cuenta creada visualmente. Luego conectaremos este registro con backend."
    );
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

            <form onSubmit={crearCuenta}>
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

                    <input
                      name="telefono"
                      value={formulario.telefono}
                      onChange={cambiarDato}
                      placeholder="Teléfono"
                    />

                    <input
                      name="whatsapp"
                      value={formulario.whatsapp}
                      onChange={cambiarDato}
                      placeholder="WhatsApp"
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
                      type="password"
                      value={formulario.password}
                      onChange={cambiarDato}
                      placeholder="Contraseña"
                    />

                    <input
                      name="confirmar_password"
                      type="password"
                      value={formulario.confirmar_password}
                      onChange={cambiarDato}
                      placeholder="Confirmar contraseña"
                    />
                  </div>

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