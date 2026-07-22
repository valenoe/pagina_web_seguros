import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../services/api";
import "../styles/pages/LoginClientes.css";

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

function LoginClientes() {
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
      try {
        const cuenta = JSON.parse(cuentaGuardada);

        setFormulario({
          rut: cuenta.rut || "",
          tipo_cliente: cuenta.tipo_cliente || "persona",
          password: "",
        });

        setRecordarCuenta(true);
      } catch {
        localStorage.removeItem("cuenta_recordada");
      }
    }
  }, []);

  function cambiarDato(e) {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: name === "rut" ? formatearRut(value) : value,
    });
  }

  function cambiarTipoCliente(tipo) {
    setFormulario({
      ...formulario,
      tipo_cliente: tipo,
    });
  }

  function cambiarRecordarCuenta() {
    setRecordarCuenta(!recordarCuenta);
  }

  async function ingresar(e) {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const data = await login(formulario);

      const token = data?.access_token;

      if (!token) {
        throw new Error("No se recibió token desde el backend");
      }

      // Purga espejos de perfil viejos (de antes del ClienteContext). Ya no se
      // usan: el perfil lo trae el contexto con getMiCuenta al cargar el portal.
      [
        "nombre_cliente",
        "rut_cliente",
        "correo_cliente",
        "telefono_cliente",
        "direccion_cliente",
        "tipo_cliente",
        "avatar_cliente",
      ].forEach((k) => localStorage.removeItem(k));

      // Solo se guarda el token (llave de sesión). El perfil lo carga el contexto.
      localStorage.setItem("token", token);

      if (recordarCuenta) {
        localStorage.setItem(
          "cuenta_recordada",
          JSON.stringify({
            rut: formulario.rut,
            tipo_cliente: formulario.tipo_cliente,
          }),
        );
      } else {
        localStorage.removeItem("cuenta_recordada");
      }

      // Si vino con ?redirect=/ruta interna, vuelve ahí (ej. el cotizador);
      // si no, al dashboard. Se valida que sea una ruta interna (evita open redirect).
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const destino =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/clientes/dashboard";

      window.location.href = destino;
    } catch (error) {
      console.error("ERROR LOGIN:", error);
      localStorage.removeItem("token");
      setError(
        "RUT o contraseña incorrectos. Verifica que estés en la pestaña correcta (Persona / Empresa).",
      );
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

          <p>Accede a tus pólizas, documentos y estado de solicitudes.</p>
        </div>

        <div className="login-clientes-card">
          <img
            src="/LOGO_TRANSPARENTE.svg"
            alt="Prieto & Correa"
            className="login-logo"
          />

          <h2>Mi Portal de Seguros</h2>

          <p className="login-subtitle">Ingresa con tus credenciales</p>

          <form onSubmit={ingresar} autoComplete="off">
            <div className="tipo-cliente-tabs">
              <button
                type="button"
                className={
                  formulario.tipo_cliente === "persona" ? "active" : ""
                }
                onClick={() => cambiarTipoCliente("persona")}
              >
                Persona
              </button>

              <button
                type="button"
                className={
                  formulario.tipo_cliente === "empresa" ? "active" : ""
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

            <button type="submit" className="login-submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="registro-login-link">
              ¿No tienes cuenta?{" "}
              <Link to="/registro-clientes">Crear cuenta</Link>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default LoginClientes;
