import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../services/api";
import "../App.css";

function LoginClientes() {
  const navigate = useNavigate();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarCuenta, setRecordarCuenta] = useState(false);

  const [formulario, setFormulario] = useState({
    rut: "",
    tipo_cliente: "persona",
    password: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cuentaGuardada = localStorage.getItem("cuenta_recordada");

    if (cuentaGuardada) {
      const cuenta = JSON.parse(cuentaGuardada);

      setFormulario({
        rut: cuenta.rut || "",
        tipo_cliente: cuenta.tipo_cliente || "persona",
        password: "",
      });

      setRecordarCuenta(true);
    } else {
      setFormulario({
        rut: "",
        tipo_cliente: "persona",
        password: "",
      });

      setRecordarCuenta(false);
    }

    setMostrarPassword(false);
    setError("");
  }, []);

  function cambiarDato(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  function cambiarTipoCliente(tipo) {
    setFormulario({
      ...formulario,
      tipo_cliente: tipo,
    });
  }

  function cambiarRecordarCuenta() {
    const nuevoValor = !recordarCuenta;
    setRecordarCuenta(nuevoValor);

    if (!nuevoValor) {
      localStorage.removeItem("cuenta_recordada");
    }
  }

  async function ingresar(e) {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const data = await login(formulario);

      localStorage.setItem("token", data.access_token);

      if (recordarCuenta) {
        localStorage.setItem(
          "cuenta_recordada",
          JSON.stringify({
            rut: formulario.rut,
            tipo_cliente: formulario.tipo_cliente,
          })
        );
      } else {
        localStorage.removeItem("cuenta_recordada");
      }

      navigate("/clientes/dashboard");
    } catch (error) {
      console.error(error);
      setError("RUT o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Header />

      <section className="login-clientes-page">
        <div className="login-clientes-left">
          <div className="login-clientes-badge">
            <span>✓</span>
            Portal Seguro
          </div>

          <h1>
            Tu protección,
            <br />
            siempre contigo
          </h1>

          <p>
            Accede a tus pólizas, documentos y estado
            de solicitudes.
          </p>
        </div>

        <div className="login-clientes-card">
          <Link to="/clientes" className="login-volver">
            ← Volver
          </Link>

          <img
            src="/Logo Prieto.png"
            alt="Prieto & Correa"
            className="login-logo"
          />

          <h2>Mi Portal de Seguros</h2>

          <p className="login-subtitle">
            Ingresa con tus credenciales
          </p>

          <form onSubmit={ingresar} autoComplete="off">
            <div className="tipo-cliente-tabs">
              <button
                type="button"
                className={
                  formulario.tipo_cliente === "persona"
                    ? "active"
                    : ""
                }
                onClick={() => cambiarTipoCliente("persona")}
              >
                Persona
              </button>

              <button
                type="button"
                className={
                  formulario.tipo_cliente === "empresa"
                    ? "active"
                    : ""
                }
                onClick={() => cambiarTipoCliente("empresa")}
              >
                Empresa
              </button>
            </div>

            <div className="login-field">
              <span>👤</span>

              <input
                name="rut"
                autoComplete="off"
                required
                value={formulario.rut}
                onChange={cambiarDato}
                placeholder={
                  formulario.tipo_cliente === "empresa"
                    ? "RUT empresa (ej: 76.123.456-7)"
                    : "RUT persona (ej: 12.345.678-9)"
                }
              />
            </div>

            <div className="login-field">
              <span>🔒</span>

              <input
                name="password"
                autoComplete="new-password"
                type={mostrarPassword ? "text" : "password"}
                required
                value={formulario.password}
                onChange={cambiarDato}
                placeholder="Contraseña"
              />
            </div>

            <div className="login-options">
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
                  checked={recordarCuenta}
                  onChange={cambiarRecordarCuenta}
                />
                Recordar cuenta
              </label>
            </div>

            <button type="button" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </button>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="login-submit"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default LoginClientes;