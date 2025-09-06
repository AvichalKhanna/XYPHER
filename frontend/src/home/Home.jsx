import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Keyboard, Cpu, Cloud, History, PhoneOff, MicOff, Volume2, VolumeX } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiState, setAiState] = useState("idle");
  const [currentText, setCurrentText] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [chatMode, setChatMode] = useState("neural");
  const [isConnected, setIsConnected] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS toggle state
  const statusInterval = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const displayedHistory = chatHistory.slice(-4);

  // ---------------- API helpers ----------------
  const postUserAction = async (action, payload = {}) => {
    try {
      const response = await fetch("/api/user-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error("POST user action failed:", err);
      setIsConnected(false);
      return { status: "error", message: err.message };
    }
  };

  const getAiStatus = async () => {
    try {
      const response = await fetch("/api/ai-status");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data) {
        const { currentText, aiState, mood } = data.data;
        
        if (currentText && currentText !== currentText) {
          setCurrentText(currentText);
          if (aiState === "speaking") {
            setChatHistory(prev => [...prev, { type: "ai", text: currentText }]);
          }
        }
        
        if (aiState) setAiState(aiState);
        if (mood) setMood(mood);
      }
      
      setIsConnected(true);
      return data;
    } catch (err) {
      console.error("GET AI status failed:", err);
      setIsConnected(false);
      return { status: "error", message: err.message };
    }
  };

  // ---------------- Speech Recognition ----------------
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Automatically restart if we're still in listening mode
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
          setIsListening(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ---------------- Toggle TTS ----------------
  const toggleTts = async () => {
    const newTtsEnabled = !ttsEnabled;
    setTtsEnabled(newTtsEnabled);
    
    // Send TTS preference to backend
    await postUserAction("set_tts_enabled", { ttsEnabled: newTtsEnabled });
  };

  // ---------------- Toggle voice listening ----------------
  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      
      // If we have a transcript, send it to the backend
      if (transcript.trim() && transcript !== "Listening...") {
        handleVoiceInput(transcript);
      }
      setTranscript("");
    } else {
      // Start listening
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("Listening...");
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  // ---------------- Handle voice input ----------------
  const handleVoiceInput = async (text) => {
    if (!text.trim()) return;

    setChatHistory(prev => [...prev, { type: "user", text: text }]);
    setAiState("thinking");

    try {
      const data = await postUserAction("send_message", { 
        text: text,
        ttsEnabled: ttsEnabled // Send TTS preference with the message
      });

      if (data.status === "ok" && data.data) {
        const { reply, mood } = data.data;
        setChatHistory(prev => [...prev, { type: "ai", text: reply }]);
        setCurrentText(reply);
        setMood(mood || "neutral");
        setAiState("speaking");

        setTimeout(() => setAiState("idle"), 2000);
      } else {
        setAiState("idle");
        console.error("Failed to send message:", data.message);
      }
    } catch (err) {
      console.error("Voice input error:", err);
      setAiState("idle");
    }
  };

  // ---------------- Status polling ----------------
  useEffect(() => {
    statusInterval.current = setInterval(async () => {
      await getAiStatus();
    }, 1000);

    return () => {
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, []);

  // ---------------- Send message ----------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setChatHistory(prev => [...prev, { type: "user", text: userText }]);
    setInput("");
    setAiState("thinking");

    try {
      const data = await postUserAction("send_message", { 
        text: userText,
        ttsEnabled: ttsEnabled // Send TTS preference with the message
      });

      if (data.status === "ok" && data.data) {
        const { reply, mood } = data.data;
        setChatHistory(prev => [...prev, { type: "ai", text: reply }]);
        setCurrentText(reply);
        setMood(mood || "neutral");
        setAiState("speaking");

        setTimeout(() => setAiState("idle"), 2000);
      } else {
        setAiState("idle");
        console.error("Failed to send message:", data.message);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setAiState("idle");
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // ---------------- Toggle voice/chat ----------------
  const handleToggleVoice = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    
    // If turning off voice mode, make sure to stop listening
    if (!newVoiceMode && isListening) {
      toggleListening();
    }
  };

  // ---------------- Toggle chat mode ----------------
  const handleToggleChatMode = async () => {
    const newMode = chatMode === "neural" ? "gemini" : "neural";
    
    const data = await postUserAction("set_chat_mode", { mode: newMode });
    
    if (data.status === "ok") {
      setChatMode(newMode);
    } else {
      console.error("Failed to switch chat mode:", data.message);
    }
  };

  // ---------------- Mood colors ----------------
  const moodColors = {
    happy: ["#f59e0b", "#facc15", "#10b981", "#3b82f6"],
    neutral: ["#4b5563", "#6b7280", "#9ca3af", "#2563eb"],
    alert: ["#ef4444", "#f87171", "#dc2626", "#b91c1c"],
    calm: ["#10b981", "#34d399", "#6ee7b7", "#3b82f6"],
  };

  const blobVariants = {
    idle: { scale: 1, rotate: 0, boxShadow: `0 0 30px ${moodColors[mood][0]}` },
    listening: { scale: 1.25, rotate: [0, 5, -5, 0], boxShadow: `0 0 40px ${moodColors[mood][1]}` },
    thinking: { 
      scale: [1, 1.2, 1], 
      rotate: [0, 10, -10, 0], 
      boxShadow: `0 0 50px ${moodColors[mood][2]}`,
      transition: { duration: 1.5, repeat: Infinity }
    },
    speaking: { 
      scale: [1, 1.15, 1], 
      rotate: [0, 3, -3, 0], 
      boxShadow: `0 0 45px ${moodColors[mood][3]}`,
      transition: { duration: 0.8, repeat: Infinity }
    },
  };

  const floatingText = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } 
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gray-900 flex flex-col justify-end items-center overflow-hidden">

      {/* Connection Status Indicator */}
      <div className={`absolute top-4 left-4 flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Voice Mode Status */}
      {voiceMode && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full flex items-center">
          <span className="text-sm">Voice Mode Active</span>
        </div>
      )}

      {/* Chat History Floating */}
      <div className="absolute bottom-20 flex flex-col items-center w-full max-w-xl mb-4 px-4">
        <AnimatePresence mode="wait">
          {displayedHistory.map((msg, index) => (
            <motion.div
              key={`${msg.type}-${index}-${msg.text}`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={floatingText}
              className={`text-sm px-4 py-2 rounded-2xl mb-3 max-w-[80%] ${
                msg.type === "user" 
                  ? "bg-gray-700 text-white self-end rounded-br-none" 
                  : "bg-blue-600 text-white self-start rounded-bl-none"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Center Blob */}
      <div className="absolute top-[7%] flex flex-col items-center">
        <motion.div
          className="w-48 h-48 rounded-full relative overflow-hidden flex items-center justify-center"
          animate={isListening ? "listening" : aiState}
          variants={blobVariants}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.9, 0.7],
              rotate: [0, 180, 360] 
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            style={{
              background: `conic-gradient(from 0deg, ${moodColors[mood].join(", ")})`,
              mixBlendMode: "screen",
              filter: "blur(15px)",
            }}
          />

        </motion.div>

        <motion.div
          className="mt-8 text-white text-lg font-mono min-w-[200px] text-center max-w-2xl min-h-[60px] flex items-center justify-center"
          key={currentText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isListening ? transcript : (currentText || (aiState === "thinking" ? "Thinking..." : "Ready to chat"))}
        </motion.div>

        <div className="mt-5 text-gray-400 text-xs font-mono flex items-center space-x-4">
          <span>{isListening ? "Listening" : aiState.charAt(0).toUpperCase() + aiState.slice(1)}</span>
          <span>•</span>
          <span>Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
          <span>•</span>
          <span>Mode: {chatMode.charAt(0).toUpperCase() + chatMode.slice(1)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-16 right-8 flex flex-col space-y-3">
        {/* TTS Toggle Button */}
        <motion.button
          onClick={toggleTts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            ttsEnabled 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-sm">{ttsEnabled ? "Sound On" : "Sound Off"}</span>
        </motion.button>

        {/* Voice/Chat Toggle */}
        <motion.button
          onClick={handleToggleVoice}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            voiceMode 
              ? "bg-red-600 text-white hover:bg-red-700" 
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {voiceMode ? <Keyboard size={16} /> : <Mic size={16} />}
          <span className="text-sm">{voiceMode ? "Text Mode" : "Voice Mode"}</span>
        </motion.button>

        {/* Listen/Talk Button - Only shown in voice mode */}
        {voiceMode && (
          <motion.button
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
              isListening 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="text-sm">{isListening ? "Stop Listening" : "Start Talking"}</span>
          </motion.button>
        )}

        {/* Appointments Button */} 
        <motion.button 
          onClick={() => window.location.href = "/appointments"} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 flex items-center space-x-2"
        >
          <span className="text-sm">Appointments</span>
          
          {/* Notification badge */} 
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center animate-pulse">
            3
          </span> 
        </motion.button>

        {/* Chat Mode Toggle */}
        <motion.button
          onClick={handleToggleChatMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-800 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-700"
        >
          {chatMode === "neural" ? <Cpu size={16} /> : <Cloud size={16} />}
          <span className="text-sm">{chatMode === "neural" ? "Neural" : "Gemini"}</span>
        </motion.button>
      </div>

      {/* Floating 3D bubbles */}
      <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="w-6 h-6 bg-pink-400/20 rounded-full opacity-40 absolute"
              animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6 + i, ease: "easeInOut", delay: i }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
      </div>

      {/* Chat Input - Only shown in text mode */}
      {!voiceMode && (
        <motion.div 
          className="w-full flex justify-center pb-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-full max-w-xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-full py-4 px-6 bg-white text-black text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={aiState === "thinking"}
            />
            <motion.button
              onClick={handleSend}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
              disabled={!input.trim() || aiState === "thinking"}
            >
              <Send size={24} />
            </motion.button>
            <motion.button
              onClick={() => window.location.href = "/conversationhistory"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900"
            >
              <History size={24} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}