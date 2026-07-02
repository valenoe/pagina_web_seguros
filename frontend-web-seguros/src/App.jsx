import "./styles/global.css";
import Router from "./routes/Router";
import WhatsAppButton from "./components/WhatsAppButton";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <>
      <Router />
      <WhatsAppButton />
      <ChatBot />
    </>
  );
}

export default App;