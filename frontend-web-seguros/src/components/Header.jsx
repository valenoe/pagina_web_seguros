import { Link } from "react-router-dom";
import { segurosMenu } from "../data/siteData";

function Header() {
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
            {segurosMenu.map((grupo) => (
              <div className="mega-column" key={grupo.categoria}>
                <h3>{grupo.categoria}</h3>

                {grupo.items.map((item) => (
                  <Link to="/seguros" key={item}>
                    {item}
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