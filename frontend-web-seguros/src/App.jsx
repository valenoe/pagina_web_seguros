import "./styles/global.css";
import "./App.css";
import Router from "./routes/Router";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  return (
    <>
      <Router />
      <WhatsAppButton />
    </>
  );
}

export default App;