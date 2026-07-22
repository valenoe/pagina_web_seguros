import "./styles/global.css";
import Router from "./routes/Router";
import WhatsAppButton from "./components/WhatsAppButton";
// Corredín (ChatBot) OCULTO temporalmente mientras está en proceso de renovación.
// NO eliminar: para volver a mostrarlo, descomentar el import y el <ChatBot /> de abajo.
// import ChatBot from "./components/ChatBot";
import { ClienteProvider } from "./context/ClienteContext";

function App() {
  return (
    <ClienteProvider>
      <Router />
      <WhatsAppButton />
      {/* <ChatBot />  ← Corredín oculto temporalmente (en renovación) */}
    </ClienteProvider>
  );
}

export default App;