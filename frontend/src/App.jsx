import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./home/Home";
import "./App.css"
import Appointments from "./appointments/Appointments";
import ConversationHistory from "../conversationhistroy/Conversationhistory";

// ---------------- Main App ----------------
export default function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/appointments" element={<Appointments/>}/>
            <Route path="/conversationhistory" element={<ConversationHistory/>}/>
          </Routes>
    </Router>
  );
}
