import Header from "../components/Header";
import Footer from "../components/Footer";
import CotizadorForm from "../components/CotizadorForm";

// Cotizador público: el mismo formulario (CotizadorForm) que usa el portal,
// pero con Header/Footer de la web pública.
function Cotizador() {
  return (
    <>
      <Header />
      <CotizadorForm />
      <Footer />
    </>
  );
}

export default Cotizador;
