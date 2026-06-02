function WhatsAppButton() {
  const phone = "56950801142";

  const message =
    "Hola, quiero recibir asesoría para cotizar un seguro con Prieto & Correa.";

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <span>💬</span>
      <strong>WhatsApp</strong>
    </a>
  );
}

export default WhatsAppButton;