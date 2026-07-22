import CotizadorForm from "../../components/CotizadorForm";

/*
  Vista "Explorar Seguros" del portal cliente.

  Ahora usa el MISMO cotizador que la web pública (CotizadorForm), pero renderizado
  dentro del marco del dashboard (menú + header con el botón de cuenta / cerrar
  sesión). Así hay un solo formato de cotizador en todo el sitio.

  El cotizador simple anterior (catálogo/carrusel + cotización compacta) se
  conservó intacto en `ExplorarSeguros_viejo.jsx` por si se quiere reconectar
  ese carrusel más adelante.
*/
function ExplorarSeguros() {
  // El wrapper permite recortar el padding propio del cotizador dentro del
  // portal (el marco del dashboard ya aporta su espaciado).
  return (
    <div className="cotizador-en-portal">
      <CotizadorForm />
    </div>
  );
}

export default ExplorarSeguros;
