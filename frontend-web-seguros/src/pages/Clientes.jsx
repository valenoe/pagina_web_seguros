import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../services/api";

function Clientes() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    rut: "",
    tipo_cliente: "persona",
    password: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function cambiarDato(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  async function ingresar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await login(formulario);
      localStorage.setItem("token", data.access_token);
      navigate("/clientes/dashboard");
    } catch {
      setError("RUT o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Header />

      <section className="clientes">
        <div className="clientes-box">
          <h1>Acceso Clientes</h1>
          <p>Ingresa al portal con tu RUT y contraseña.</p>

          <form onSubmit={ingresar}>
            <input
              name="rut"
              required
              value={formulario.rut}
              onChange={cambiarDato}
              placeholder="RUT (ej: 12.345.678-9)"
            />

            <select
              name="tipo_cliente"
              value={formulario.tipo_cliente}
              onChange={cambiarDato}
            >
              <option value="persona">Persona natural</option>
              <option value="empresa">Empresa</option>
            </select>

            <input
              name="password"
              type="password"
              required
              value={formulario.password}
              onChange={cambiarDato}
              placeholder="Contraseña"
            />

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Clientes;
