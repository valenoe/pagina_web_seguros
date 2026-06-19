import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/components/Header.css";

import useFetch from "../hooks/useFetch";
import { obtenerSeguros } from "../services/api";

function Header() {
  const navigate = useNavigate();
  const { data: seguros = [] } = useFetch(obtenerSeguros);

  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const loginRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("menu-abierto", menuAbierto);
    return () => document.body.classList.remove("menu-abierto");
  }, [menuAbierto]);

  useEffect(() => {
    if (!loginAbierto) return;
    function handleClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [loginAbierto]);

  const resultados = seguros.filter((seguro) =>
    seguro?.nombre?.toLowerCase().includes(query.toLowerCase()),
  );

  function cerrarBusqueda() {
    setOpenSearch(false);
    setQuery("");
  }

  function cerrarMenu() {
    setMenuAbierto(false);
    cerrarBusqueda();
    window.scrollTo(0, 0);
  }

  function irA(ruta) {
    cerrarMenu();
    navigate(ruta);
  }

  return (
    <>
      {/* Spacer que ocupa el espacio del header fijo en el flujo del documento */}
      <div className="header-spacer" aria-hidden="true" />
      <header className="header">
        <div className="header-logo">
          <Link to="/" aria-label="Ir al inicio" onClick={cerrarMenu}>
            <img src="/LOGO_TRANSPARENTE.svg" alt="Prieto & Correa Seguros" />
          </Link>
        </div>

        <button
          type="button"
          className={`hamburger${menuAbierto ? " abierto" : ""}`}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuAbierto((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuAbierto && <div className="mobile-overlay" onClick={cerrarMenu} />}

        <nav className={`header-nav${menuAbierto ? " mobile-abierto" : ""}`}>
          <Link to="/" onClick={cerrarMenu}>
            Inicio
          </Link>
          <Link to="/nosotros" onClick={cerrarMenu}>
            Nosotros
          </Link>
          <Link to="/seguros" onClick={cerrarMenu}>
            Seguros
          </Link>
          <Link to="/contacto" onClick={cerrarMenu}>
            Contacto
          </Link>

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

          <div className="mobile-nav-login">
            <span className="mobile-nav-login-titulo">Mi Sucursal</span>
            <Link
              to="/login-interno"
              className="mobile-nav-login-item"
              onClick={cerrarMenu}
            >
              Ejecutivo Comercial
            </Link>
            <Link
              to="/login-clientes"
              className="mobile-nav-login-item"
              onClick={cerrarMenu}
            >
              Clientes
            </Link>
          </div>
        </nav>

        <div className="header-login" ref={loginRef}>
          <button
            type="button"
            className="header-button"
            aria-label="Abrir accesos de Mi Sucursal"
            aria-expanded={loginAbierto}
            onClick={() => setLoginAbierto((prev) => !prev)}
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

          <div className={`header-login-menu${loginAbierto ? " is-open" : ""}`}>
            <Link
              to="/login-interno"
              className="login-item"
              onClick={() => { cerrarBusqueda(); setLoginAbierto(false); }}
            >
              <span>Ejecutivo Comercial</span>
            </Link>

            <Link
              to="/login-clientes"
              className="login-item"
              onClick={() => { cerrarBusqueda(); setLoginAbierto(false); }}
            >
              <span>Clientes</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
