import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

const CATEGORIAS = {
  "Seguro de Auto": "Vehículos",
  SOAP: "Vehículos",
  Mascotas: "Personas",
  Hogar: "Personas",
  "Mujer Segura": "Personas",
  "Accidentes Personales": "Personas",
  "Asistencia en Viaje": "Personas",
  Garantías: "Empresas y otros",
  "Responsabilidad Civil": "Empresas y otros",
};

function getCategoria(nombre) {
  for (const [key, cat] of Object.entries(CATEGORIAS)) {
    if (nombre.toLowerCase().includes(key.toLowerCase())) return cat;
  }
  return "Otros";
}

function agruparPorCategoria(seguros) {
  const orden = ["Vehículos", "Personas", "Empresas y otros"];
  const grupos = {};
  for (const s of seguros) {
    const cat = getCategoria(s.nombre);
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(s);
  }
  return orden.filter((c) => grupos[c]).map((c) => ({ categoria: c, items: grupos[c] }));
}

function Header() {
  const { data: seguros } = useFetch(obtenerSeguros);
  const grupos = agruparPorCategoria(seguros);

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/">
          <img src="/Logo Prieto.png" alt="Prieto & Correa Seguros" />
        </Link>
      </div>

      <nav className="header-nav">
        <Link to="/">Inicio</Link>
        <Link to="/nosotros">Nosotros</Link>

        <div className="mega-dropdown">
          <button className="mega-button">
            Seguros <span>▼</span>
          </button>

          <div className="mega-menu">
            {grupos.map((grupo) => (
              <div className="mega-column" key={grupo.categoria}>
                <h3>{grupo.categoria}</h3>
                {grupo.items.map((seguro) => (
                  <Link to="/seguros" key={seguro.id_seguro}>
                    {seguro.nombre}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Link to="/contacto">Contacto</Link>
      </nav>

      <Link to="/clientes">
        <button className="header-button">Clientes</button>
      </Link>
    </header>
  );
}

export default Header;
