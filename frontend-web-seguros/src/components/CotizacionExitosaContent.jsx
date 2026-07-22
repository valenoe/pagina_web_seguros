import { Link } from "react-router-dom";
import { useCliente } from "../context/ClienteContext";
import "../styles/pages/CotizacionExitosa.css";

/*
  Contenido (tarjeta) de "Cotización exitosa", REUTILIZABLE:
    - web pública      → pages/CotizacionExitosa.jsx (con Header/Footer + fondo azul)
    - portal cliente   → vista del Dashboard (dentro del marco, con menú + logout)

  Los botones se adaptan a la sesión: si estás logueado, te mantienen DENTRO del
  portal (para que tengas dónde cerrar sesión); si eres invitado, van a la web.
*/
function CotizacionExitosaContent() {
  const { cliente } = useCliente();

  return (
    <div className="cotizacion-card">
      <img
        src="/logotipo-prieto-correa.svg"
        alt="Prieto & Correa Seguros"
        className="cotizacion-logo"
      />

      <div className="success-icon">✓</div>

      <h1>Recibimos tu solicitud exitosamente</h1>

      <p>
        Gracias por confiar en Prieto & Correa Seguros. Nuestro equipo revisará tu
        información y se pondrá en contacto contigo para entregarte una propuesta
        personalizada.
      </p>

      <div className="cotizacion-buttons">
        {cliente ? (
          <>
            <Link to="/clientes/dashboard">Ir a mi portal</Link>
            <Link to="/clientes/dashboard/explora">Cotizar otro seguro</Link>
          </>
        ) : (
          <>
            <Link to="/">Volver al inicio</Link>
            <Link to="/seguros">Ver otros seguros</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default CotizacionExitosaContent;
