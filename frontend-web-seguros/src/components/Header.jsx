import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

function Header() {
  const navigate = useNavigate();
  const { data: seguros = [] } = useFetch(obtenerSeguros);

  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");

  const resultados = seguros.filter((seguro) =>
    seguro?.nombre?.toLowerCase().includes(query.toLowerCase())
  );

  function cerrarBusqueda() {
    setOpenSearch(false);
    setQuery("");
  }

  function irA(ruta) {
    cerrarBusqueda();
    navigate(ruta);
  }

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/" aria-label="Ir al inicio">
          <img
            src="/Logo Prieto.png"
            alt="Prieto & Correa Seguros"
          />
        </Link>
      </div>

      <nav className="header-nav">
        <Link to="/">Inicio</Link>
        <Link to="/nosotros">Nosotros</Link>
        <Link to="/seguros">Seguros</Link>
        <Link to="/contacto">Contacto</Link>

        <div className="header-search">
          <button
            type="button"
            className="search-button"
            aria-label="Buscar seguros"
            onClick={() => setOpenSearch((prev) => !prev)}
          >
            <span className="search-icon" />
          </button>

          {openSearch && (
            <div className="search-box">
              <input
                type="text"
                autoFocus
                placeholder="Buscar seguro..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              {query && (
                <div className="search-results">
                  {resultados.length > 0 ? (
                    resultados.map((seguro) => (
                      <button
                        type="button"
                        key={seguro.id_seguro || seguro.nombre}
                        onClick={() => irA("/seguros")}
                      >
                        {seguro.nombre}
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

      <div className="header-login">
        <button
          type="button"
          className="header-button"
          aria-label="Abrir accesos de Mi Sucursal"
        >
          <div className="header-user">
            <img
              src="/edificio.png"
              alt="Mi Sucursal"
              className="header-user-image"
            />

            <span>Mi Sucursal</span>
          </div>
        </button>

        <div className="header-login-menu">
          <Link
            to="/login-interno"
            className="login-item"
            onClick={cerrarBusqueda}
          >

            <span>Ejecutivo Comercial</span>
          </Link>

          <Link
            to="/login-clientes"
            className="login-item"
            onClick={cerrarBusqueda}
          >

            <span>Clientes</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
