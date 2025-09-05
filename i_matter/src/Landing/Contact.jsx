// ---------------- Contact Page ----------------
export default function Contact() {
  return (
    <div className="p-8 max-w-xl mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Contact Us</h2>
      <p className="mb-2 text-gray-700">
        Have questions or need support with our AI Therapy assistant? Reach out to us!
      </p>
      <p className="mb-1 text-gray-700"><strong>Email:</strong> support@facetrack.com</p>
      <p className="mb-4 text-gray-700"><strong>Phone:</strong> +1 234 567 890</p>

      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Your Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Message</label>
          <textarea
            placeholder="Type your message..."
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
