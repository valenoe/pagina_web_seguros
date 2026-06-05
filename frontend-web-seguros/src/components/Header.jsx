import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

function Header() {
  const navigate = useNavigate();

  const { data: seguros = [] } =
    useFetch(obtenerSeguros);

  const [openSearch, setOpenSearch] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const resultados = seguros
    .filter((s) =>
      s.nombre
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .map((s) => ({
      texto: s.nombre,
      ruta: "/seguros",
    }));

  function irA(ruta) {
    setOpenSearch(false);
    setQuery("");
    navigate(ruta);
  }

  return (
    <header className="header">

      <div className="header-logo">

        <Link to="/">

          <img
            src="/Logo Prieto.png"
            alt="Prieto & Correa Seguros"
          />

        </Link>

      </div>

      <nav className="header-nav">

        <Link to="/">
          Inicio
        </Link>

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
            onClick={() =>
              setOpenSearch(!openSearch)
            }
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
                onChange={(e) =>
                  setQuery(e.target.value)
                }
              />

              {query && (

                <div className="search-results">

                  {resultados.length ? (

                    resultados.map(
                      (item) => (

                        <button
                          key={item.texto}
                          onClick={() =>
                            irA(item.ruta)
                          }
                        >

                          {item.texto}

                        </button>

                      )
                    )

                  ) : (

                    <span>

                      No encontramos resultados

                    </span>

                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </nav>

      <div className="header-login">

        <button className="header-button">

          <div className="header-user">

            <img
              src="/icon-mi-sucursal.png"
              alt="Mi Sucursal"
              className="header-user-image"
            />

            <span>

              Mi Sucursal

            </span>

          </div>

        </button>

        <div className="header-login-menu">

          <Link
            to="/login-interno"
            className="login-item"
          >

            <img
              src="/icon-edificio.png"
              alt="Ejecutivo"
              className="login-icon"
            />

            <span>

              Ejecutivo Comercial

            </span>

          </Link>

          <Link
            to="/login-clientes"
            className="login-item"
          >

            <img
              src="/icon-usuario.png"
              alt="Cliente"
              className="login-icon"
            />

            <span>

              Clientes

            </span>

          </Link>

        </div>

      </div>

    </header>
  );
}

export default Header;
