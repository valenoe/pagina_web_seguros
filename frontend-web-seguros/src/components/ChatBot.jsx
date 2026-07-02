import { useEffect, useRef, useState } from "react";
import { mensajeWhatsAppCorredin, responderCorredin } from "../services/corredinService";
import "../styles/components/ChatBot.css";

const WHATSAPP_EJECUTIVO = "56966541939";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      title: "¡Hola! Soy Corredín 👋",
      text:
        "Soy el asistente virtual de Prieto & Correa. Puedo ayudarte con seguros, coberturas, pagos, asistencias, deducibles, exclusiones, siniestros, portal cliente y consultas generales de la corredora. Escríbeme tu consulta.",
    },
  ]);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading, open, minimized]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [open, minimized]);

  async function enviarMensaje(event) {
    event?.preventDefault();

    const consulta = input.trim();
    if (!consulta || loading) return;

    setInput("");
    setLastQuestion(consulta);
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text: consulta,
      },
    ]);

    try {
      const respuesta = await responderCorredin(consulta);

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          title: respuesta.title,
          text: respuesta.text,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          title: "No pude resolverlo en este momento",
          text:
            "Tuve un problema al buscar la información. Puedes intentarlo nuevamente o hablar con un ejecutivo comercial para recibir ayuda directa.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function hablarWhatsapp() {
    window.open(
      `https://wa.me/${WHATSAPP_EJECUTIVO}?text=${mensajeWhatsAppCorredin(lastQuestion)}`,
      "_blank"
    );
  }

  function abrirChat() {
    setOpen(true);
    setMinimized(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="corredin-launcher"
        onClick={abrirChat}
        aria-label="Abrir chat de Corredín"
      >
        <span className="corredin-launcher-pulse" />
        <span className="corredin-launcher-avatar">
          <img src="/chatbot.png" alt="Corredín" />
        </span>
        <span className="corredin-launcher-bubble">
          <strong>¡Hola! Soy Corredín</strong>
          <small>¿Te ayudo con tu seguro?</small>
        </span>
      </button>
    );
  }

  return (
    <section className={`corredin-widget ${minimized ? "is-minimized" : ""}`}>
      <header className="corredin-header">
        <div className="corredin-header-avatar">
          <img src="/chatbot.png" alt="Corredín" />
        </div>

        <div className="corredin-header-text">
          <strong>Corredín</strong>
          <span>
            <i /> Asistente Prieto & Correa
          </span>
        </div>

        <div className="corredin-controls">
          <button
            type="button"
            onClick={() => setMinimized((value) => !value)}
            aria-label={minimized ? "Abrir chat" : "Minimizar chat"}
          >
            {minimized ? "+" : "−"}
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar chat"
          >
            ×
          </button>
        </div>
      </header>

      {!minimized && (
        <>
          <div className="corredin-body" ref={messagesRef}>
            {messages.map((message, index) => (
              <article
                key={`${message.from}-${index}`}
                className={`corredin-message ${message.from === "user" ? "from-user" : "from-bot"}`}
              >
                {message.title && <strong>{message.title}</strong>}
                <p>{message.text}</p>
              </article>
            ))}

            {loading && (
              <article className="corredin-message from-bot corredin-thinking">
                <strong>Corredín está revisando...</strong>
                <p>
                  <span />
                  <span />
                  <span />
                </p>
              </article>
            )}
          </div>

          <form className="corredin-form" onSubmit={enviarMensaje}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu consulta..."
              aria-label="Escribe tu consulta para Corredín"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>

          <button
            type="button"
            className="corredin-whatsapp"
            onClick={hablarWhatsapp}
          >
            Hablar con ejecutivo comercial
          </button>
        </>
      )}
    </section>
  );
}

export default ChatBot;
