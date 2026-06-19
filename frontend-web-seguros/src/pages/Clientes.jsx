import { Link } from "react-router-dom";
import "../styles/pages/Clientes.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Clientes() {
  return (
    <>
      <Header />

      <section className="clientes-panel">

        <div className="clientes-content">

          <h1>
            Sistema de Gestión de Seguros
          </h1>

          <p className="clientes-subtitle">
            Prieto & Correa Seguros
          </p>

          <div className="clientes-cards">

            <Link
              to="/login-interno"
              className="cliente-card"
            >

              <div className="cliente-icon">

                <img
                  src="/icon-edificio.png"
                  alt="Panel Corporativo"
                />

              </div>

              <div>

                <h2>
                  Panel Corporativo
                </h2>

                <span>
                  Gestión interna de la corredora
                </span>

                <p>
                  Acceso exclusivo para colaboradores,
                  ejecutivos y administración.
                </p>

              </div>

            </Link>

            <Link
              to="/login-clientes"
              className="cliente-card"
            >

              <div className="cliente-icon">

                <img
                  src="/icon-usuario.png"
                  alt="Portal Clientes"
                />

              </div>

              <div>

                <h2>
                  Mi Portal de Seguros
                </h2>

                <span>
                  Accede a tus pólizas y servicios
                </span>

                <p>
                  Consulta pólizas, documentos
                  y seguimiento de solicitudes.
                </p>

              </div>

            </Link>

          </div>

        </div>

      </section>

      <Footer />

    </>
  );
}

export default Clientes;