import Chat from "../components/ChatWindow/Chat";
import AuthScreen from "../components/Auth/AuthScreen";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
