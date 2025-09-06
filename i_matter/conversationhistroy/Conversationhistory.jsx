// ---------------- ConversationSummary.jsx ----------------
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Smile, Meh, AlertTriangle, Zap, RefreshCw } from "lucide-react";

export default function ConversationSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/conversation-summary");
      const raw = res.data.data?.summary || "";

      // Split summary into points for cards
      const sections = raw.split(". ").map(s => s.trim()).filter(Boolean);
      setSummary(sections);
    } catch (err) {
      console.error(err);
      setSummary(["Error fetching summary."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Mood mapping
  const moodIcons = {
    happy: <Smile size={24} className="text-yellow-600" />,
    neutral: <Meh size={24} className="text-gray-600" />,
    alert: <AlertTriangle size={24} className="text-red-600" />,
    calm: <Zap size={24} className="text-green-600" />,
  };

  const moodColors = {
    happy: "bg-yellow-100 text-yellow-800",
    neutral: "bg-gray-100 text-gray-800",
    alert: "bg-red-100 text-red-800",
    calm: "bg-green-100 text-green-800",
  };

  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-gradient-to-b from-purple-50 to-blue-50 overflow-hidden flex flex-col justify-start items-center p-8">
      
      {/* Floating 3D bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="w-6 h-6 rounded-full opacity-30 bg-purple-300"
            animate={{ y: [0, 25, 0], x: [0, -20, 0], rotate: [0, 360, 0] }}
            transition={{ repeat: Infinity, duration: 8 + i, ease: "easeInOut", delay: i * 0.2 }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.h1
        className="text-4xl font-extrabold text-purple-700 mb-8 z-10"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Conversation Insights
      </motion.h1>

      {/* Summary container */}
      <motion.div
        className="w-[95vw] mx-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <p className="text-gray-500 italic text-lg">Generating insights...</p>
          </motion.div>
        ) : (
          summary.map((item, idx) => {
            // Detect mood keywords
            const lower = item.toLowerCase();
            let moodKey = "neutral";
            if (lower.includes("happy")) moodKey = "happy";
            else if (lower.includes("alert") || lower.includes("problem")) moodKey = "alert";
            else if (lower.includes("calm") || lower.includes("support")) moodKey = "calm";

            return (
              <motion.div
                key={idx}
                className={`relative p-6 rounded-3xl shadow-2xl ${moodColors[moodKey]} flex items-start gap-4 cursor-pointer hover:scale-105 transform-gpu transition mx-12`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex-shrink-0">{moodIcons[moodKey]}</div>
                <p className="text-lg font-medium">{item}</p>
                {/* Floating mini bubble */}
                <motion.div
                  className="w-3 h-3 rounded-full bg-white absolute top-4 right-4 opacity-50"
                  animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 + idx * 0.2, ease: "easeInOut" }}
                />
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Regenerate Button */}
      <motion.button
        className="mt-6 px-8 py-3 bg-purple-500 text-white rounded-xl shadow-lg hover:bg-purple-600 flex items-center gap-2 z-10"
        onClick={fetchSummary}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshCw size={20} />
        Regenerate Insights
      </motion.button>

      {/* Background 3D floating bars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-24 bg-purple-400/30 rounded-full"
          animate={{ y: [0, -30, 0], rotate: [0, 180, 0] }}
          transition={{ repeat: Infinity, duration: 6 + i, delay: i * 0.3, ease: "easeInOut" }}
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
        />
      ))}
    </div>
  );
}
