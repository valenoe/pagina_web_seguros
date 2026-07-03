import "./styles/global.css";
import Router from "./routes/Router";
import WhatsAppButton from "./components/WhatsAppButton";
import ChatBot from "./components/ChatBot";
import { ClienteProvider } from "./context/ClienteContext";

function App() {
  return (
    <ClienteProvider>
      <Router />
      <WhatsAppButton />
      <ChatBot />
    </ClienteProvider>
  );
}

export default App;