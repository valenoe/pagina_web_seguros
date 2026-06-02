import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const opcionesBusqueda = [
  { texto: "Seguro de Auto", ruta: "/seguros" },
  { texto: "SOAP", ruta: "/seguros" },
  { texto: "Seguro de Hogar", ruta: "/seguros" },
  { texto: "Mascotas", ruta: "/seguros" },
  { texto: "Asistencia en Viaje", ruta: "/seguros" },
  { texto: "Responsabilidad Civil", ruta: "/seguros" },
  { texto: "Garantías", ruta: "/seguros" },
  { texto: "Mujer Segura", ruta: "/seguros" },
  { texto: "Accidentes Personales", ruta: "/seguros" },

  { texto: "Cotizar seguro", ruta: "/cotizador" },

  { texto: "Nosotros", ruta: "/nosotros" },
  { texto: "Contacto", ruta: "/contacto" },
  { texto: "Clientes", ruta: "/clientes" },
];

function Header() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const resultados =
    query.trim() === ""
      ? []
      : opcionesBusqueda.filter((item) =>
          item.texto.toLowerCase().includes(query.toLowerCase())
        );

  const irA = (ruta) => {
    setQuery("");
    setOpenSearch(false);
    navigate(ruta);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/">
          <img src="/Logo Prieto.png" alt="Prieto & Correa Seguros" />
        </Link>
      </div>

      <nav className="header-nav">
        <Link to="/">Inicio</Link>

        <Link to="/nosotros">
          Nosotros
        </Link>

        <Link to="/seguros">
          Seguros
        </Link>

        <Link to="/contacto">
          Contacto
        </Link>

        <div className="header-search">
          <button
            className="search-button"
            onClick={() => setOpenSearch(!openSearch)}
          >
            <span className="search-icon"></span>
          </button>

          {openSearch && (
            <div className="search-box">
              <input
                type="text"
                autoFocus
                placeholder="Buscar seguro..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {query && (
                <div className="search-results">
                  {resultados.length > 0 ? (
                    resultados.map((item) => (
                      <button
                        key={item.texto}
                        onClick={() => irA(item.ruta)}
                      >
                        {item.texto}
                      </button>
                    ))
                  ) : (
                    <span>No encontramos resultados</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <Link to="/clientes">
        <button className="header-button">
          Clientes
        </button>
      </Link>
    </header>
  );
}

export default Header;