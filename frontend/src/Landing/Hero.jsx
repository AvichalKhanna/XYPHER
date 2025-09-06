import { Link } from "react-router-dom";
// ---------------- Hero Section ----------------
export default function Hero() {
  return (
    <section className="bg-gray-100 py-20 text-center">
      <h2 className="text-4xl font-bold mb-4">Automated Attendance with Face Recognition</h2>
      <p className="text-lg mb-6">
        Log in as Administrator, Moderator, Student, or Collaborator.
      </p>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700"
      >
        Get Started
      </Link>
    </section>
  );
}
