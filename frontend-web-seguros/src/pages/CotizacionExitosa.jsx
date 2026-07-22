import Header from "../components/Header";
import Footer from "../components/Footer";
import CotizacionExitosaContent from "../components/CotizacionExitosaContent";

// Cotización exitosa (web pública): el mismo contenido que ve el portal, pero
// con Header/Footer y el fondo azul de página completa.
function CotizacionExitosa() {
  return (
    <>
      <Header />

      <section className="cotizacion-exitosa">
        <CotizacionExitosaContent />
      </section>

      <Footer />
    </>
  );
}

export default CotizacionExitosa;
