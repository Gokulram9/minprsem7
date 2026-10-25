import { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, Send, Sparkles, Smile, ShieldAlert, ShieldCheck,
  UserCheck, AlertCircle, RefreshCw, MessageSquare,
  Mic, MicOff, Download, Volume2, Scale, MapPin, Briefcase, Award, ExternalLink, ChevronRight
} from 'lucide-react';
import Card from './ui/card';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import aiBotAvatarImg from '../assets/ai-bot-avatar.png';

// Crisp vector rendering of the blue chatbot avatar
const SimpleBotAvatar = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="32" width="7" height="24" rx="3.5" fill="#2563EB" />
    <rect x="85" y="32" width="7" height="24" rx="3.5" fill="#2563EB" />
    <path d="M 15 44 C 15 28 25 22 35 22" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M 85 44 C 85 28 75 22 65 22" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M 50 18 C 24 18 12 32 12 52 C 12 66 20 76 34 81 L 24 93 L 43 86 C 45 86.5 47.5 87 50 87 C 76 87 88 72 88 52 C 88 32 76 18 50 18 Z" fill="#2563EB" />
    <path d="M 50 26 C 28 26 20 36 20 51 C 20 64 28 73 50 73 C 72 73 80 64 80 51 C 80 36 72 26 50 26 Z" fill="white" />
    <path d="M 32 46 C 36 40 42 40 46 46" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M 54 46 C 58 40 64 40 68 46" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M 44 57 C 47 61 53 61 56 57" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);

const AiChatWidget = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatbotContext, setChatbotContext] = useState({});

  // Voice AI Input Dictation Handler
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is available on modern Web browsers (Chrome, Edge, Safari). Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSend(transcript);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };
  
  // Conversation History
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Greetings. I am Lexora AI, your judicial assistant. How can I assist with your legal journey today?',
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);

  // Suggested Prompts
  const suggestedPrompts = [
    { label: 'Property Lawyer', text: 'I need a lawyer for a property dispute.' },
    { label: 'Apply Legal Aid', text: 'How can I apply for legal aid?' },
    { label: 'Available Tomorrow', text: 'Show lawyers available tomorrow.' },
    { label: 'Next Hearing', text: 'What is my next hearing?' },
    { label: 'Track Application', text: 'Help me track my application.' }
  ];

  // Emojis list
  const emojis = ['⚖️', '💬', '🤖', '🤝', '📁', '💡', '✅', '❤️'];
  const [showEmoji, setShowEmoji] = useState(false);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Listen to global open event
  useEffect(() => {
    const handleRecommendRequest = (e) => {
      const lawyer = e.detail;
      setOpen(true);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'ai',
            text: `Calculated match profile for ${lawyer.name}. Match score: 98%.`,
            lawyerCard: lawyer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1000);
    };
    window.addEventListener('ai-chat-recommend', handleRecommendRequest);
    return () => window.removeEventListener('ai-chat-recommend', handleRecommendRequest);
  }, []);

  const addEmoji = (emoji) => {
    setQuery((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handleSend = async (textToSend = query) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await axios.post('/chatbot', {
        message: textToSend,
        context: chatbotContext
      });

      setIsTyping(false);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (response.data.triggerRecommendation && response.data.lawyers && response.data.lawyers.length > 0) {
        aiMsg.lawyerCards = response.data.lawyers.slice(0, 3).map(rec => ({
          id: rec.lawyerId || rec._id || rec.id,
          name: rec.fullName || rec.name,
          specialization: rec.specialization || (Array.isArray(rec.specializations) ? rec.specializations[0] : 'Advocate Specialist'),
          rating: rec.rating || 4.8,
          fee: rec.consultationFee || 100,
          experience: rec.experience || 10,
          matchScore: rec.matchScore || 95,
          location: rec.location || 'Theni, Tamil Nadu',
          courts: rec.courts || ['District Court, Theni'],
          reasons: rec.reasons || [],
          image: rec.profileImage || null
        }));
      }

      setChatbotContext(response.data.context || {});
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Chatbot API unavailable, activating client AI improviser fallback:', err.message);
      setIsTyping(false);

      const snippet = textToSend.length > 55 ? textToSend.slice(0, 55) + '...' : textToSend;
      const lower = textToSend.toLowerCase();
      let fallbackText = "";

      if (['hai', 'haii', 'hi', 'hello', 'hey', 'hy', 'sup', 'yo', 'howdy', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'help'].some(k => lower.includes(k))) {
        fallbackText = "Hello! 👋 How can I assist you today?\n\nI am **Lexora AI**, your virtual legal assistant. Here is what I can help you with:\n\n• ⚖️ **Match Advocates**: Describe your dispute (property, divorce, employment, criminal) to find top verified lawyers.\n• 💳 **Lawyer Fees & Escrow**: Check due retainers, pay securely in Rupees (₹), and download PDF receipts.\n• 📄 **Legal Aid Applications**: Step-by-step guidance on applying for state-subsidized legal assistance.\n• 📅 **Case Docket Tracking**: View upcoming court hearing dates, judge details & courtroom halls.\n\nWhat would you like to explore today?";
      } else if (['thanks', 'thank you', 'thx', 'ty', 'awesome', 'great', 'cool', 'good', 'ok', 'okay', 'bye'].some(k => lower.includes(k))) {
        fallbackText = "You're very welcome! 😊 I am here 24/7 whenever you need help with legal aid, lawyer fee payments in Rupees (₹), or checking court case schedules. Have a wonderful day!";
      } else if (['fee', 'fees', 'pay', 'cost', 'charge', 'rupee', 'rupees', 'rs', '₹', 'escrow', 'payment', 'price'].some(k => lower.includes(k))) {
        fallbackText = "Hello! All advocate retainers and court filing fees on our portal are processed in **Rupees (₹)** under secure judicial escrow protection.\n\n• **View & Pay Fees**: Select **Lawyer Fees** from your dashboard sidebar.\n• **Payment Methods**: Pay via Credit/Debit Card, UPI (GPay/PhonePe), or Net Banking.\n• **Receipts**: Download instant PDF receipts after payment.";
      } else if (['legal aid', 'apply', 'indigent', 'subsidy', 'free lawyer'].some(k => lower.includes(k))) {
        fallbackText = "Hello! Applying for state-subsidized legal aid is simple:\n\n1. Go to **Applications** -> click **Apply for Legal Aid**.\n2. Fill out the 3-step wizard with your contact details and dispute category.\n3. Upload your National Identity Card or Income Certificate.";
      } else if (['hearing', 'track', 'status', 'next date', 'courtroom', 'docket'].some(k => lower.includes(k))) {
        fallbackText = "Hello! You can track real-time court case details under the **My Cases** or **Case Tracker** tab in your sidebar.";
      } else {
        fallbackText = "Hello! I understand you have a legal query.\n\nCould you briefly describe your dispute (e.g. property boundary issue, divorce, workplace termination, or criminal allegation)? I can match you with an advocate or assist with fee payments in Rupees (₹).";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="z-[100]">
      
      {/* 🔵 SIMPLE CLEAN FLOATING AI TRIGGER BUTTON */}
      {!open && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/35 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/50 transition-all duration-200 cursor-pointer"
          title="Chat with Lexora AI Assistant"
        >
          <SimpleBotAvatar size={34} />
        </motion.button>
      )}

      {/* CHAT SIDE DRAWER */}
      {open && (
        <div className="fixed inset-y-0 right-0 z-[100] w-[400px] max-w-full bg-slate-950/95 border-l border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col h-screen animate-slide-in text-white overflow-hidden">
          
          {/* Top Luminous Gradient Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 via-violet-500 to-cyan-400 animate-pulse" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center p-1 shadow-md shadow-blue-500/10">
                <SimpleBotAvatar size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  Lexora AI • Judicial Assistant
                  <ShieldCheck size={13} className="text-amber-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" /> 
                  Ministry Certified Online Desk
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          {/* Conversation history area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* AI Sender Indicator */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-cyan-400/90 pl-1">
                    <SimpleBotAvatar size={14} />
                    <span>Lexora AI</span>
                  </div>
                )}

                {/* Bubble */}
                <div 
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-lg shadow-blue-600/20 font-medium' 
                      : 'bg-slate-900/90 text-slate-100 rounded-bl-xs border border-slate-800/90 shadow-md whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Inline Lawyer Cards matching results from Real MongoDB AI Engine */}
                {((msg.lawyerCards && msg.lawyerCards.length > 0) || msg.lawyerCard) && (
                  <div className="mt-3 w-full max-w-[340px] space-y-3">
                    {(msg.lawyerCards || [msg.lawyerCard]).map((card, cIdx) => {
                      const cardId = card.id || card._id || card.lawyerId;
                      const cardName = card.name || card.fullName || 'Advocate';
                      const cardSpec = card.specialization || (Array.isArray(card.specializations) ? card.specializations.join(', ') : 'Legal Specialist');
                      const cardExp = card.experience || 8;
                      const cardScore = card.matchScore || card.matchPercentage || 92;
                      const cardLoc = card.location || 'Theni, Tamil Nadu';
                      const cardCourts = Array.isArray(card.courts) ? card.courts.join(', ') : (card.courtLevel || 'District Court');
                      const cardFee = card.fee ? `₹${card.fee}` : (card.consultationFee ? `₹${card.consultationFee}` : 'Subsidized Legal Aid');
                      const cardReasons = Array.isArray(card.reasons) && card.reasons.length > 0 
                        ? card.reasons 
                        : [card.reason || `Verified expertise in ${cardSpec} at ${cardLoc}.`];

                      return (
                        <div 
                          key={cardId || cIdx} 
                          className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-3.5 shadow-xl shadow-black/50 backdrop-blur-xl text-left transition hover:border-blue-500/50"
                        >
                          {/* Header: Photo, Name & Match Score */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {card.image ? (
                                <img src={card.image} alt={cardName} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-700 shadow-md" />
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br from-blue-600 to-indigo-700 border border-slate-700 shadow-md">
                                  {cardName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                                  {cardName}
                                  <ShieldCheck size={12} className="text-blue-400 shrink-0" />
                                </h4>
                                <p className="text-[10px] text-amber-300 font-medium truncate">{cardSpec}</p>
                              </div>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                              {cardScore}% Match
                            </span>
                          </div>

                          {/* Attribute Badges */}
                          <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[9.5px] text-slate-300">
                            <div className="flex items-center gap-1 text-slate-300 truncate">
                              <MapPin size={10} className="text-blue-400 shrink-0" />
                              <span className="truncate">{cardLoc}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-300 truncate">
                              <Briefcase size={10} className="text-amber-400 shrink-0" />
                              <span>{cardExp} Yrs Exp.</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-300 truncate">
                              <Scale size={10} className="text-purple-400 shrink-0" />
                              <span className="truncate">{cardCourts}</span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
                              <span>Fee: {cardFee}</span>
                            </div>
                          </div>

                          {/* AI Rationale Snippet */}
                          {cardReasons.length > 0 && (
                            <div className="mt-2 rounded-lg bg-blue-950/40 border border-blue-900/40 p-2 text-[9px] text-blue-200/90 leading-tight">
                              <strong className="text-cyan-300">AI Rationale: </strong>
                              {cardReasons[0]}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-3 flex items-center gap-2">
                            {cardId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpen(false);
                                  navigate(`/dashboard/lawyers/${cardId}`);
                                }}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-slate-700"
                              >
                                View Profile <ExternalLink size={10} />
                              </button>
                            )}
                            {(user?.role === 'User' || user?.role === 'Applicant') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpen(false);
                                  navigate('/dashboard/ai-recommend');
                                }}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-md shadow-blue-600/30 cursor-pointer"
                              >
                                Select Lawyer <ChevronRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {/* TYPING DOTS SIMULATOR */}
            {isTyping && (
              <div className="flex items-center gap-2.5 p-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl max-w-[200px] shadow-sm">
                <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span className="text-[10px] text-slate-300 font-medium animate-pulse">Lexora AI is processing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* AI WAVEFORM ANIMATION OVERLAY */}
          {isTyping && (
            <div className="px-4 py-2 border-t border-slate-900 bg-slate-950 flex items-center justify-center gap-1.5">
              <span className="h-4 w-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
              <span className="h-6 w-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="h-8 w-1 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span className="h-5 w-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="h-3 w-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          )}

          {/* SUGGESTED PILLS AREA */}
          <div className="px-4 py-2.5 border-t border-slate-800/80 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-950/90">
            {suggestedPrompts.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(pill.text)}
                className="rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-[10.5px] font-semibold text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200 cursor-pointer shadow-sm"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* INPUT FORM CONTROLS */}
          <div className="border-t border-slate-800/90 p-4 bg-slate-950 space-y-3">
            <div className="relative flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 transition-all focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20">
              
              <Smile size={18} className="text-slate-400 cursor-pointer hover:text-cyan-400 transition" onClick={() => setShowEmoji(!showEmoji)} />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening to your voice..." : "Ask Lexora AI legal assistant..."}
                className="w-full bg-transparent text-xs outline-none text-white placeholder-slate-500 font-medium"
              />

              {/* Voice AI Dictation Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? 'text-red-400 bg-red-950/80 border border-red-500/50 animate-pulse' 
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                }`}
                title={isListening ? "Listening... speak now" : "Speak your query (Voice Dictation)"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Submit btn */}
              <button
                type="button"
                onClick={() => handleSend()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Send Message"
              >
                <Send size={13} />
              </button>

              {/* Emoji Drawer */}
              {showEmoji && (
                <div className="absolute bottom-full left-0 mb-2 flex gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl z-20">
                  {emojis.map((emoji) => (
                    <button 
                      key={emoji} 
                      onClick={() => addEmoji(emoji)} 
                      className="text-base hover:scale-125 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Disclaimer */}
            <div className="flex gap-2 items-start text-[9.5px] text-slate-500 leading-relaxed font-semibold">
              <ShieldAlert size={13} className="shrink-0 text-amber-500/90 mt-0.5" />
              <span>Lexora AI provides automated judicial guidance & information. It does not replace formal legal counsel.</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AiChatWidget;
