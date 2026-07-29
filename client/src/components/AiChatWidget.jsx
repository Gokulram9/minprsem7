import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Mic, Sparkles, Smile, ShieldCheck, 
  UserCheck, AlertCircle, Calendar, Star, RefreshCw
} from 'lucide-react';
import Card from './ui/card';
import axios from '../api/axios';

// Custom synthesis speech recognition simulator (Web Speech API mockup or recording simulator)
const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotContext, setChatbotContext] = useState({});
  
  // Conversation History
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Greetings. I am Lexora, your AI Legal aid concierge. Ask me legal queries, and I will calculate matching advocate dockets.',
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);

  // Suggested Prompts
  const suggestedPrompts = [
    { label: 'Family dispute counsel', text: 'I need a divorce lawyer for child custody issues.' },
    { label: 'Tenant dispute advice', text: 'My landlord is refusing to return my security deposit.' },
    { label: 'Corporate compliance', text: 'I need advice setting up employment contracts.' }
  ];

  // Emojis list
  const emojis = ['⚖️', '💬', '🤖', '🤝', '📁', '💡', '✅', '❤️'];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Listen to global open event (e.g. from FindLawyers page or Profile page)
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

  // Voice recording mock simulator
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setQuery('Identify criminal defense lawyers in Mumbai.');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setQuery('Identify criminal defense lawyers in Mumbai.');
      }, 3000);
    }
  };

  const addEmoji = (emoji) => {
    setQuery((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // Submit search query to AI engine
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
        const rec = response.data.lawyers[0];
        aiMsg.lawyerCard = {
          id: rec.lawyerId,
          name: rec.fullName,
          specialization: rec.specialization,
          rating: 4.8,
          fee: rec.consultationFee,
          experience: rec.experience,
          successRate: rec.matchScore,
          availableSlots: ['Mon 10:00 AM', 'Wed 02:00 PM'],
          image: rec.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
        };
      }

      setChatbotContext(response.data.context || {});
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Forgive me, my neural circuits are currently experiencing communication delays. Please try again shortly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Immediate Appointment Booking in Widget
  const bookAppointment = (lawyerName, slot) => {
    alert(`Appointment successfully confirmed with ${lawyerName} on ${slot}! Dynamic calendar updated.`);
  };

  return (
    <div className="z-[100]">
      
      {/* SIDEBAR LAUNCHER TAB ON THE RIGHT EDGE */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/3 -translate-y-1/2 z-[100] flex h-12 w-10 items-center justify-center rounded-l-2xl bg-[#1F2839] hover:bg-[#1a2230] text-white shadow-xl hover:w-12 hover:scale-105 transition-all duration-300 border-l border-y border-slate-700/20"
          title="Open AI Legal Assistant"
        >
          <MessageSquare className="h-5 w-5 animate-pulse" />
        </button>
      )}

      {/* CHAT SIDE DRAWER */}
      {open && (
        <div className="fixed inset-y-0 right-0 z-[100] w-[380px] max-w-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-screen animate-slide-in">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <Sparkles size={16} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Seven Seas AI Assistant</h3>
                <p className="text-[10px] text-slate-400">Contextual Legal Concierge</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-155 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Conversation history area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div 
                  className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10' 
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Inline Lawyer Card matching results */}
                {msg.lawyerCard && (
                  <Card className="mt-3 w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <img src={msg.lawyerCard.image} alt={msg.lawyerCard.name} className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{msg.lawyerCard.name}</h4>
                        <p className="text-[9px] text-slate-400">{msg.lawyerCard.specialization}</p>
                      </div>
                    </div>

                    {/* Progress Circle match simulator */}
                    <div className="mt-3 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Match score:</span>
                      <span className="font-bold text-emerald-500">{msg.lawyerCard.successRate || 95}% Match</span>
                    </div>

                    <div className="mt-3 grid gap-1">
                      <p className="text-[9px] font-semibold text-slate-400">Request consultation slot:</p>
                      <div className="flex gap-1.5">
                        {msg.lawyerCard.availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => bookAppointment(msg.lawyerCard.name, slot)}
                            className="flex-1 py-1 rounded bg-blue-50 text-blue-600 text-[9px] font-bold hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {/* TYPING DOTS SIMULATOR */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-slate-100 rounded-xl max-w-[80px] dark:bg-slate-900 justify-center">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED PILLS AREA */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {suggestedPrompts.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(pill.text)}
                className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* INPUT FORM CONTROLS */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
            
            {/* Visual voice recording panel overlay */}
            {isRecording && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-3 text-xs font-semibold animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Mic size={14} className="animate-bounce" /> Listening to voice input...
                </span>
                <button onClick={() => setIsRecording(false)} className="text-red-500 font-bold">Cancel</button>
              </div>
            )}

            <div className="relative flex items-center gap-2">
              
              {/* Emojis trigger */}
              <button 
                type="button" 
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Smile size={18} />
              </button>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Lexora AI legal concierge..."
                className="w-full bg-transparent text-xs outline-none text-slate-800 placeholder-slate-400 dark:text-white"
              />

              {/* Mic Input */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRecording ? 'text-blue-500 animate-pulse' : ''}`}
              >
                <Mic size={18} />
              </button>

              {/* Submit btn */}
              <button
                type="button"
                onClick={() => handleSend()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-500 transition"
              >
                <Send size={12} />
              </button>

              {/* Emoji Drawer */}
              {showEmoji && (
                <div className="absolute bottom-full left-0 mb-2 flex gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
                  {emojis.map((emoji) => (
                    <button 
                      key={emoji} 
                      onClick={() => addEmoji(emoji)} 
                      className="text-sm hover:scale-125 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AiChatWidget;
