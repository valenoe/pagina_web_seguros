import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

function agruparPorCategoria(seguros) {
  const orden = ["Vehículos", "Personas", "Empresas y otros"];
  const grupos = {};
  for (const s of seguros) {
    const cat = s.categoria ?? "Otros";
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(s);
  }
  return orden
    .filter((c) => grupos[c])
    .map((c) => ({ categoria: c, items: grupos[c] }));
}

function Header() {
  const navigate = useNavigate();
  const { data: seguros } = useFetch(obtenerSeguros);

  const grupos = agruparPorCategoria(seguros);

  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");

  const resultados = seguros
    .filter((s) => s.nombre.toLowerCase().includes(query.toLowerCase()))
    .map((s) => ({ texto: s.nombre, ruta: "/seguros" }));

  function irA(ruta) {
    setOpenSearch(false);
    setQuery("");
    navigate(ruta);
  }

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
                {grupo.items.map((item) => {
                  const nombre = typeof item === "string" ? item : item.nombre;
                  return (
                    <Link to="/seguros" key={nombre}>
                      {nombre}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Link to="/contacto">Contacto</Link>

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
                      <button key={item.texto} onClick={() => irA(item.ruta)}>
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
        <button className="header-button">Clientes</button>
      </Link>
    </header>
  );
}

export default Header;
