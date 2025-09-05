import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./Landing/Header";
import Footer from "./Landing/Footer";
import Hero from "./Landing/Hero";
import Contact from "./Landing/Contact";

// ---------------- Login Page ----------------
function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h2>
        <p className="text-center text-gray-600 mb-4">Select your role to continue</p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/admin"
            className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold p-3 rounded-lg text-center"
          >
            Administrator
          </Link>
          <Link
            to="/moderator"
            className="bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold p-3 rounded-lg text-center"
          >
            Moderator
          </Link>
          <Link
            to="/student"
            className="bg-purple-500 hover:bg-purple-600 transition-colors text-white font-semibold p-3 rounded-lg text-center"
          >
            Student
          </Link>
          <Link
            to="/collaborator"
            className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold p-3 rounded-lg text-center"
          >
            Collaborator
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------- Main App ----------------
export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            {/* Future pages like AI Therapist Dashboard can go here */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
