import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, PlusCircle, CheckCircle, ArrowRightCircle, 
  UserCheck, Users, Video, Phone, MessageCircle, 
  Star, Clock, MapPin, Award, TrendingUp, Heart
} from "lucide-react";

const therapists = [
  { 
    id: 1, 
    name: "Dr. Sarah Lee", 
    specialty: "Cognitive Behavioral Therapy", 
    rate: 50, 
    online: true, 
    rating: 4.9, 
    reviews: 127,
    experience: "8 years",
    image: "👩‍⚕️",
    languages: ["English", "Spanish"],
    nextAvailable: "Today, 2:00 PM"
  },
  { 
    id: 2, 
    name: "Dr. John Doe", 
    specialty: "Trauma & PTSD Specialist", 
    rate: 40, 
    online: true, 
    rating: 4.7, 
    reviews: 89,
    experience: "6 years",
    image: "👨‍⚕️",
    languages: ["English", "French"],
    nextAvailable: "Today, 3:30 PM"
  },
  { 
    id: 3, 
    name: "Dr. Amy Smith", 
    specialty: "Anxiety & Stress Management", 
    rate: 60, 
    online: false, 
    rating: 4.8, 
    reviews: 156,
    experience: "10 years",
    image: "👩‍⚕️",
    languages: ["English", "German"],
    nextAvailable: "Tomorrow, 9:00 AM"
  },
  { 
    id: 4, 
    name: "Dr. Michael Chen", 
    specialty: "Relationship Counseling", 
    rate: 55, 
    online: true, 
    rating: 4.9, 
    reviews: 204,
    experience: "12 years",
    image: "👨‍⚕️",
    languages: ["English", "Mandarin"],
    nextAvailable: "Today, 4:15 PM"
  },
];

const appointmentStats = {
  completed: 24,
  upcoming: 3,
  totalHours: 47,
  streak: 12
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([
    { 
      id: 1, 
      therapist: "Dr. Sarah Lee", 
      time: "10:00 AM", 
      date: "2025-09-07", 
      status: "confirmed",
      duration: "50 min",
      type: "Video Call",
      meetingLink: "https://meet.jit.si/mental-wellness-123"
    },
    { 
      id: 2, 
      therapist: "Dr. John Doe", 
      time: "02:00 PM", 
      date: "2025-09-05", 
      status: "completed",
      duration: "45 min",
      type: "Voice Call",
      rating: 5
    },
    { 
      id: 3, 
      therapist: "Dr. Amy Smith", 
      time: "11:00 AM", 
      date: "2025-09-10", 
      status: "requested",
      duration: "60 min",
      type: "Video Call"
    },
    { 
      id: 4, 
      therapist: "Dr. Michael Chen", 
      time: "03:30 PM", 
      date: "2025-09-12", 
      status: "confirmed",
      duration: "50 min",
      type: "Video Call",
      meetingLink: "https://meet.jit.si/mental-wellness-456"
    },
  ]);
  
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("video");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);

  const handleScheduleConfirm = () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) return;
    
    const newAppointment = { 
      id: appointments.length + 1, 
      therapist: selectedTherapist.name, 
      date: selectedDate, 
      time: selectedTime, 
      status: "requested",
      duration: "50 min",
      type: selectedType === "video" ? "Video Call" : "Voice Call"
    };
    
    if (selectedType === "video") {
      newAppointment.meetingLink = `https://meet.jit.si/mental-wellness-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    setAppointments(prev => [...prev, newAppointment]);
    setShowSchedule(false);
    setSelectedTherapist(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("video");
  };

  const joinVideoCall = (meetingLink) => {
    setCurrentMeeting(meetingLink);
    setShowVideoModal(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute top-0 left-0 min-h-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 overflow-y-auto">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            animate={{ 
              y: [0, 20, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, 
                ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#10b981'}, 
                ${i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#10b981' : '#3b82f6'})`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Appointments Hub</h1>
            <p className="text-gray-600 mt-2">Manage your therapy sessions and connect with professionals</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSchedule(true)}
            className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg hover:bg-blue-700"
          >
            <PlusCircle size={20} className="mr-2" /> New Appointment
          </motion.button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{appointmentStats.upcoming}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{appointmentStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{appointmentStats.totalHours}</div>
                <div className="text-sm text-gray-600">Therapy Hours</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Heart className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{appointmentStats.streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current & Upcoming Appointments */}
          <div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold mb-4 text-gray-800 flex items-center"
            >
              <Calendar className="mr-2" /> Your Appointments
            </motion.h2>
            
            <div className="space-y-4">
              {appointments.filter(a => a.status === "confirmed" || a.status === "requested").map((appt, index) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-2xl shadow-md bg-white border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="text-lg font-semibold text-gray-900">{appt.therapist}</div>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          appt.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock size={14} className="mr-1" />
                        {formatDate(appt.date)} • {appt.time} • {appt.duration}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        {appt.type === "Video Call" ? (
                          <Video size={14} className="mr-1" />
                        ) : (
                          <Phone size={14} className="mr-1" />
                        )}
                        {appt.type}
                      </div>
                    </div>
                    
                    {appt.status === "confirmed" && appt.meetingLink && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinVideoCall(appt.meetingLink)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 ml-4"
                      >
                        <Video className="mr-2" size={16} /> Join
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Past Appointments */}
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold mb-4 mt-8 text-gray-800 flex items-center"
            >
              <CheckCircle className="mr-2" /> Past Sessions
            </motion.h2>
            
            <div className="space-y-3">
              {appointments.filter(a => a.status === "completed").map((appt, index) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-800">{appt.therapist}</div>
                    <div className="text-sm text-gray-600">{formatDate(appt.date)} • {appt.time}</div>
                  </div>
                  <div className="flex items-center">
                    {appt.rating && (
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < appt.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-green-600 font-semibold text-sm">Completed</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Therapists & Progress */}
          <div>
            {/* Therapists List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <Users className="mr-2" /> Available Therapists
                <span className="ml-2 text-sm font-normal text-gray-500">({therapists.filter(t => t.online).length} online)</span>
              </h2>
              
              <div className="space-y-4">
                {therapists.map((t, index) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    whileHover={{ y: -5 }}
                    className="p-4 rounded-2xl shadow-sm bg-white border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="text-3xl mr-4">{t.image}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900">{t.name}</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${t.online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {t.online ? "Online" : "Offline"}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 mb-1">{t.specialty}</div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <div className="flex items-center mr-3">
                            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                            {t.rating} ({t.reviews} reviews)
                          </div>
                          <div>• ${t.rate}/hr • {t.experience}</div>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin size={12} className="mr-1" />
                          {t.languages.join(", ")}
                        </div>
                        
                        {t.online && (
                          <div className="flex items-center text-xs text-blue-600">
                            <Clock size={12} className="mr-1" />
                            Next available: {t.nextAvailable}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {t.online && (
                      <div className="flex space-x-2 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex-1 justify-center"
                        >
                          <Video size={16} className="mr-1" /> Video Call
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                        >
                          <MessageCircle size={16} className="mr-1" /> Message
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <TrendingUp className="mr-2" /> Your Progress
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-gray-700">Mental Wellbeing</div>
                    <div className="text-sm font-semibold text-blue-600">78%</div>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-blue-500 h-3" 
                      initial={{ width: "0%" }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-gray-700">Stress Level</div>
                    <div className="text-sm font-semibold text-green-600">Low</div>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-green-500 h-3" 
                      initial={{ width: "0%" }}
                      animate={{ width: "30%" }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-gray-700">Session Consistency</div>
                    <div className="text-sm font-semibold text-purple-600">92%</div>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-purple-500 h-3" 
                      initial={{ width: "0%" }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Therapy streak</div>
                  <div className="flex items-center">
                    <Award className="text-yellow-500 mr-1" size={16} />
                    <span className="font-semibold">12 days</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Schedule New Appointment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Select Therapist</label>
                  <select
                    value={selectedTherapist?.id || ""}
                    onChange={(e) => setSelectedTherapist(therapists.find(t => t.id === parseInt(e.target.value)))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a therapist</option>
                    {therapists.filter(t => t.online).map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Appointment Type</label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedType("video")}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center ${
                        selectedType === "video" 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Video size={18} className="mr-2" /> Video Call
                    </button>
                    <button
                      onClick={() => setSelectedType("voice")}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center ${
                        selectedType === "voice" 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Phone size={18} className="mr-2" /> Voice Call
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Select Time</label>
                  <input 
                    type="time" 
                    value={selectedTime} 
                    onChange={(e) => setSelectedTime(e.target.value)} 
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowSchedule(false)} 
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleConfirm} 
                  disabled={!selectedTherapist || !selectedDate || !selectedTime}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <CheckCircle size={18} className="mr-2" /> Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Join Video Call</h2>
              
              <div className="bg-gray-800 rounded-xl h-64 mb-4 flex items-center justify-center">
                <div className="text-white text-center">
                  <Video size={48} className="mx-auto mb-3" />
                  <p>Video call ready to connect</p>
                  <p className="text-sm text-gray-400 mt-1">{currentMeeting}</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <Phone size={24} className="rotate-135" />
                </button>
                <button className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600">
                  <Video size={24} />
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowVideoModal(false)} 
                  className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <a 
                  href={currentMeeting} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center"
                >
                  <ArrowRightCircle size={18} className="mr-2" /> Join Call
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
      onClick={() => window.location.href = "/"}
      className="fixed bottom-5 right-5 text-black items-center justify-center flex rounded-full bg-black/50 w-15 h-15 z-50
      hover:scale-110 hover:bg-black/80 hover:text-white transition-all duration-300">

        <MessageCircle className=""/>

      </button>
    </div>
  );
}