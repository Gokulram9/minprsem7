import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { initSocket, subscribeToMessages } from '../services/socket';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Users,
  Calendar,
  Scale,
  Clock,
  FileText,
  MessageSquare,
  Bell,
  BarChart2,
  Sparkles,
  User,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Send,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Info,
  ShieldCheck,
  Lock,
  ChevronDown,
  Trash2,
  Filter,
  Star,
  CreditCard,
  DollarSign,
  Receipt
} from 'lucide-react';

const LawyerDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Modals & Details Views
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeCaseDetailTab, setActiveCaseDetailTab] = useState('overview'); // 'overview' | 'documents' | 'timeline' | 'notes'
  const [activeClientDetailTab, setActiveClientDetailTab] = useState('overview'); // 'overview' | 'documents' | 'hearings'
  
  // Calendar States
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-07-15');

  // AI Assistant Drawer State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    { role: 'assistant', text: 'Greetings Counselor. I can generate summaries, compile hearing checklists, search case precedents, and flag missing items. What can I do for you today?' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Chat/Messages State
  const [activeChatRecipient, setActiveChatRecipient] = useState('client-1'); // 'client-1' | 'admin'
  const [typedMessage, setTypedMessage] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, recipient: 'client-1', sender: 'client', text: 'Hello Advocate, is my utility proof format sufficient for district filing?', time: '09:30 AM', read: true },
    { id: 2, recipient: 'client-1', sender: 'lawyer', text: 'Yes Priya, the PDF upload looks correct. I will present it in our next pre-trial conference.', time: '09:40 AM', read: true },
    { id: 3, recipient: 'admin', sender: 'admin', text: 'Admin Note: Property partition hearing scheduled for July 15 is listed in Courtroom Hall 3.', time: 'Yesterday', read: true }
  ]);

  // Profile/Settings Sub-tabs
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'performance' | 'security' | 'preferences'

  // Client Fees State
  const defaultFeesData = [
    {
      id: 'FEE-2026-001',
      caseId: 'CAS-8821',
      caseTitle: 'Land Deed Title Clearance & Property Dispute',
      lawyerName: user?.name || 'Adv. Rajesh Sharma',
      lawyerId: user?._id || 'L-101',
      clientName: 'Priya Sharma',
      clientId: 'U-501',
      description: 'Court Representation & Chamber Retainer Fee',
      totalAmount: 450,
      amountDue: 450,
      dueDate: '2026-08-30',
      status: 'Pending',
      paymentMethod: null,
      paidAt: null,
      transactionId: null
    },
    {
      id: 'FEE-2026-002',
      caseId: 'CAS-9410',
      caseTitle: 'Commercial Contract & Tender Audit',
      lawyerName: user?.name || 'Adv. Rajesh Sharma',
      lawyerId: user?._id || 'L-101',
      clientName: 'Sunil Perera',
      clientId: 'U-502',
      description: 'Document Verification & Legal Drafting',
      totalAmount: 280,
      amountDue: 0,
      dueDate: '2026-08-10',
      status: 'Paid',
      paymentMethod: 'Credit Card (**** 4242)',
      paidAt: '2026-08-08 14:22',
      transactionId: 'TXN-984210'
    },
    {
      id: 'FEE-2026-003',
      caseId: 'CAS-7102',
      caseTitle: 'Tenancy Agreement & Lease Hearing',
      lawyerName: user?.name || 'Adv. Rajesh Sharma',
      lawyerId: user?._id || 'L-101',
      clientName: 'Nishani Fernando',
      clientId: 'U-503',
      description: 'Subsidized Court Processing & Legal Counsel',
      totalAmount: 180,
      amountDue: 180,
      dueDate: '2026-08-15',
      status: 'Overdue',
      paymentMethod: null,
      paidAt: null,
      transactionId: null
    }
  ];

  const [fees, setFees] = useState(() => {
    const saved = localStorage.getItem('lexora_fees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return defaultFeesData; }
    }
    return defaultFeesData;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('lexora_fees');
      if (saved) {
        try { setFees(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [feeFilterStatus, setFeeFilterStatus] = useState('All');
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [selectedInvoiceFee, setSelectedInvoiceFee] = useState(null);

  const handleSendReminder = (fee) => {
    alert(`Fee Payment Reminder notification sent to client ${fee.clientName} for Case ${fee.caseId} (Amount Due: ₹${fee.amountDue}, Due Date: ${fee.dueDate}).`);
  };

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/messages/conversations');
      if (res.data.success && Array.isArray(res.data.data)) {
        const convs = res.data.data.map(c => ({
          id: c.contact._id,
          name: c.contact.name,
          email: c.contact.email,
          role: c.contact.role,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount
        }));
        if (convs.length > 0) {
          setClients(convs);
        }
      }
    } catch (err) {
      console.warn('Could not fetch conversations:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      initSocket(user);
      fetchConversations();

      subscribeToMessages((newMsg) => {
        setChatMessages((prev) => {
          if (prev.some(m => m.id === newMsg._id || m.text === newMsg.text)) return prev;
          return [...prev, {
            id: newMsg._id,
            recipient: newMsg.sender._id === user._id ? newMsg.receiver._id : newMsg.sender._id,
            sender: newMsg.sender._id === user._id ? 'lawyer' : 'user',
            text: newMsg.text,
            time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
        fetchConversations();
      });

      axios.get('/messages')
        .then(res => {
          if (res.data.success && Array.isArray(res.data.data)) {
            const msgs = res.data.data.map(m => ({
              id: m._id,
              recipient: m.sender._id === user._id ? m.receiver._id : m.sender._id,
              sender: m.sender._id === user._id ? 'lawyer' : 'user',
              text: m.text,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            if (msgs.length > 0) setChatMessages(msgs);
          }
        })
        .catch(err => console.warn('Could not load messages:', err.message));
    }
  }, [user]);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const advocateName = user?.name || 'Advocate Aisha Verma';

  // Dynamic States for Cases/Clients/Docs
  const [cases, setCases] = useState([
    { 
      id: 'CASE-SL-8201', 
      title: 'Estate Land Boundary Dispute', 
      applicant: 'Priya Nair', 
      court: 'District Court Hall 3', 
      judge: 'Justice Shanmugam', 
      priority: 'High', 
      status: 'Active', 
      nextHearing: '2026-07-15',
      type: 'Civil Law',
      progress: 60,
      timeline: [
        { label: 'Indigency Verification Audited', date: '2026-06-25', done: true },
        { label: 'Counsel Allocation Accepted', date: '2026-06-28', done: true },
        { label: 'Plea Entry Trials Programmed', date: '2026-07-15', done: false }
      ],
      notes: [
        { id: 1, text: 'Confirm land partition maps from 2012 survey office.', date: '2026-06-30' }
      ]
    },
    { 
      id: 'CASE-SL-8202', 
      title: 'Guardianship & Child Support Petition', 
      applicant: 'Arjun Das', 
      court: 'Family Court Hall 1', 
      judge: 'Justice Meera Rajan', 
      priority: 'Medium', 
      status: 'Pending Review', 
      nextHearing: 'TBD',
      type: 'Family Law',
      progress: 20,
      timeline: [
        { label: 'Indigency Verification Audited', date: '2026-06-29', done: true },
        { label: 'Counsel Assignment Pending Acceptance', date: 'Pending', done: false }
      ],
      notes: []
    }
  ]);

  const [clients, setClients] = useState([
    { 
      id: 'client-1', 
      name: 'Priya Nair', 
      email: 'priya@sevenseas.com', 
      phone: '+94 77 123 4567', 
      caseType: 'Property Partition Dispute', 
      status: 'Active', 
      assignedDate: '2026-06-28',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      address: '72, Baseline Road, Colombo 08',
      occupation: 'Retail Clerk'
    },
    { 
      id: 'client-2', 
      name: 'Arjun Das', 
      email: 'arjun@test.com', 
      phone: '+94 77 987 6543', 
      caseType: 'Guardianship Custody Claim', 
      status: 'Awaiting Audit', 
      assignedDate: '2026-06-29',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      address: '14/3, High Level Road, Maharagama',
      occupation: 'Mechanic'
    }
  ]);

  const [documents, setDocuments] = useState([
    { id: 'doc-1', name: 'Land_Registry_Partition_Plan.pdf', type: 'Evidence Document', uploadedBy: 'Priya Nair', date: '2026-06-25', status: 'Approved' },
    { id: 'doc-2', name: 'Pre_Trial_Hearing_Notice.pdf', type: 'Court Order', uploadedBy: 'Court Registrar', date: '2026-06-29', status: 'Verified' },
    { id: 'doc-3', name: 'Income_Certificate_Indigent_Das.pdf', type: 'Income Certificate', uploadedBy: 'Arjun Das', date: '2026-06-30', status: 'Awaiting Audit' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Case Allocated', body: 'Super Admin has assigned Guardianship case (Arjun Das) to you.', time: '1 hr ago', read: false },
    { id: 2, title: 'Document Upload Alert', body: 'Priya Nair added Land_Registry_Partition_Plan.pdf to documents vault.', time: '1 day ago', read: true }
  ]);

  const [deadlines, setDeadlines] = useState([
    { title: 'Evidentiary Survey Maps Submission', date: '2026-07-12', details: 'Must be verified by survey department.' },
    { title: 'Custody Income Proof File Verification', date: '2026-07-20', details: 'Das guardianship case audit.' }
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review land partition boundaries maps', done: false },
    { id: 2, text: 'Schedule pre-trial brief with Priya Nair', done: true },
    { id: 3, text: 'Draft mediation terms proposal for family court', done: false }
  ]);

  // Private note adding
  const [noteInputText, setNoteInputText] = useState('');
  const handleAddPrivateNote = (caseId) => {
    if (!noteInputText.trim()) return;
    setCases(cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          notes: [...(c.notes || []), { id: Date.now(), text: noteInputText, date: new Date().toISOString().split('T')[0] }]
        };
      }
      return c;
    }));
    setNoteInputText('');
    alert('Private case note updated successfully.');
  };

  // Accept/Reject Case Actions
  const handleAcceptCase = (caseId) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Active' } : c));
    alert(`Case ${caseId} assignment accepted. Schedule updated.`);
  };

  const handleRejectCase = (caseId) => {
    const reason = prompt('Specify case rejection audit rationale:');
    if (reason) {
      setCases(cases.filter(c => c.id !== caseId));
      alert(`Case ${caseId} assignment returned to Admin queue.`);
    }
  };

  // Chat message send
  const handleSendMessage = async () => {
    if (!typedMessage.trim()) return;

    const textToSend = typedMessage;
    const targetRecipientId = activeChatRecipient;

    const newMsg = {
      id: Date.now(),
      recipient: targetRecipientId,
      sender: 'lawyer',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    setChatMessages(prev => [...prev, newMsg]);
    setTypedMessage('');

    if (targetRecipientId) {
      try {
        await axios.post('/messages', {
          receiver: targetRecipientId,
          text: textToSend
        });
      } catch (err) {
        console.error('Failed to post lawyer reply to backend:', err.message);
      }
    }
  };

  // AI Assistant Query simulation
  const handleAiQuerySubmit = () => {
    if (!aiQuery.trim()) return;
    const userQ = aiQuery;
    setAiChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
    setAiQuery('');
    setAiLoading(true);
    
    setTimeout(() => {
      let aiResponse = '';
      const q = userQ.toLowerCase();
      if (q.includes('summary') || q.includes('case')) {
        aiResponse = 'CASE SUMMARY: Property Partition dispute (Nair vs Municipal Corp). Key issue involves overlapping survey boundaries of estate plots. Recommended action: Submit 2012 certified partition map.';
      } else if (q.includes('precedent') || q.includes('reference') || q.includes('law')) {
        aiResponse = 'LEGAL REFERENCE: Under Section 5 of the Partition Law Act, boundary survey reports validated by certified surveyors carry presumption of accuracy unless disproven by historical registry.';
      } else if (q.includes('checklist') || q.includes('hearing')) {
        aiResponse = 'HEARING CHECKLIST:\n1. Verify original partition deed registry seal.\n2. Cross-examine municipal surveyor.\n3. Request in-app verification of client income proof.';
      } else {
        aiResponse = 'I have analyzed the documents archive. Missing item detected: Client Arjun Das is yet to upload certified income statements. Notifications reminders triggered.';
      }
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: aiResponse }]);
      setAiLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP BANNER: ADVOCATE WELCOME ── */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        {/* Subtle executive background accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-amber-500 to-indigo-900" />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-900/10 dark:bg-blue-500/20 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300 border border-blue-900/20 dark:border-blue-500/30">
              ⚖️ STATE BAR ASSOCIATION ADVOCATE DESK
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Verified Legal Aid Defender
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Advocate Chamber Workspace • Welcome, {advocateName}
          </h2>

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
            BAR COUNCIL REG NO: BC/SL/71629 · CERTIFIED SPECIALIZATION: CIVIL & LITIGATION
          </p>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed italic">
            “In the defense of law and human rights, certified legal counsel stands as the guardian of equity and constitutional representation.”
          </p>
        </div>

        <div className="text-left md:text-right shrink-0 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-800 dark:text-white">📅 {todayDate}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">🕒 {currentTime}</p>
        </div>
      </div>

      {/* ── 1. DASHBOARD VIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick actions row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/dashboard/assigned-cases')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Docket Audits</p>
                <p className="text-sm font-black mt-1">Review Cases Allocations</p>
              </div>
              <FolderOpen size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => setShowAiAssistant(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-100">AI Litigator</p>
                <p className="text-sm font-black mt-1">AI Precedent Suggestion</p>
              </div>
              <Sparkles size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => navigate('/dashboard/schedule')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Court Agenda</p>
                <p className="text-sm font-black mt-1">Manage Schedules</p>
              </div>
              <Calendar size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>
          </div>

          {/* Stats matrix cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Active Cases Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{ y: -4 }}
              className="card card-accent-blue p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned / Active Cases</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{cases.length} / {cases.filter(c => c.status === 'Active').length}</p>
                </div>
                <FolderOpen size={16} className="text-blue-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Active representation caseload</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-blue-500 animate-pulse" />
            </motion.div>
 
            {/* Hearings Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              whileHover={{ y: -4 }}
              className="card card-accent-purple p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's hearings</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">1</p>
                </div>
                <Calendar size={16} className="text-purple-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Scheduled in Courtroom Hall 3</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-purple-500 animate-pulse" />
            </motion.div>
 
            {/* Rating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="card card-accent-gold p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Client rating</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">4.9 ⭐</p>
                </div>
                <Star size={16} className="text-amber-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Based on 140 public aid clients audits</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-amber-500 animate-pulse" />
            </motion.div>
          </div>

          {/* Core Dashboard sections grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's hearings checklist */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Today's Trial Hearings Checklist
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded tracking-wide uppercase">
                        Civil Law
                      </span>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white mt-1.5">Property Partition Dispute</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">District Court Hall 3 · Presiding: Justice Shanmugam · Client: Priya Nair</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-600 dark:text-blue-400">10:30 AM</p>
                      <span className="badge badge-amber mt-1.5">Awaiting Trial</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Progress Chart (SaaS visual block) */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Advocate Representation Performance Matrix
                </h3>
                
                {/* SVG Visualizer */}
                <div className="flex flex-col items-center py-2">
                  <svg viewBox="0 0 500 120" className="w-full max-w-lg">
                    {/* SVG bars */}
                    <g fill="#2563eb" opacity="0.15">
                      <rect x="50" y="20" width="40" height="80" rx="4" />
                      <rect x="150" y="20" width="40" height="80" rx="4" />
                      <rect x="250" y="20" width="40" height="80" rx="4" />
                      <rect x="350" y="20" width="40" height="80" rx="4" />
                    </g>
                    <g fill="#2563eb">
                      <rect x="50" y="40" width="40" height="60" rx="4" />
                      <rect x="150" y="30" width="40" height="70" rx="4" fill="#7c3aed" />
                      <rect x="250" y="50" width="40" height="50" rx="4" fill="#059669" />
                      <rect x="350" y="60" width="40" height="40" rx="4" fill="#ef4444" />
                    </g>
                    {/* Grid labels */}
                    <text x="70" y="115" textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">Active Claims</text>
                    <text x="170" y="115" textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">Completed Trials</text>
                    <text x="270" y="115" textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">Aid Allocations</text>
                    <text x="370" y="115" textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">Mediation briefs</text>
                  </svg>
                </div>
              </div>

            </div>

            {/* Right side: Deadlines / Private tasks */}
            <div className="space-y-6">
              
              {/* Upcoming deadlines */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {deadlines.map((dl, i) => (
                    <div key={i} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl">
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{dl.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Due: {dl.date} · {dl.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks checklist */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Pending tasks checklist</h3>
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                        className="h-4 w-4 text-blue-600 rounded mt-0.5"
                      />
                      <span className={`text-xs ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 2. ASSIGNED CASES TAB ── */}
      {activeTab === 'assigned-cases' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Assigned Legal Aid Cases
            </h3>
            <p className="text-xs text-slate-400">Review briefs, accept allocations, update courtroom litigation files status.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {cases.map((c) => (
              <div key={c.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`badge ${
                        c.priority === 'High' ? 'badge-red' : 'badge-slate'
                      } uppercase`}>
                        {c.priority} Priority
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{c.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{c.id} · Category: {c.type}</p>
                    </div>
                    <span className={`badge ${
                      c.status === 'Active' ? 'badge-blue' : 'badge-amber'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                    <p><strong>Applicant:</strong> {c.applicant}</p>
                    <p><strong>Presiding:</strong> {c.judge}</p>
                    <p><strong>Court Hall:</strong> {c.court}</p>
                    <p><strong>Next Hearing:</strong> {c.nextHearing}</p>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Milestone Progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  <button
                    onClick={() => setSelectedCase(c)}
                    className="flex-1 btn-secondary text-xs py-2 justify-center rounded-xl"
                  >
                    View Details
                  </button>
                  
                  {c.status === 'Pending Review' ? (
                    <div className="flex gap-2 w-full mt-2">
                      <button
                        onClick={() => handleAcceptCase(c.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs py-2 font-bold transition"
                      >
                        Accept Docket
                      </button>
                      <button
                        onClick={() => handleRejectCase(c.id)}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs py-2 font-bold transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const newStatus = prompt('Enter new litigation status: (e.g. Completed, Postponed)');
                        if (newStatus) {
                          setCases(cases.map(item => item.id === c.id ? { ...item, status: newStatus } : item));
                        }
                      }}
                      className="flex-1 btn-primary text-xs py-2 justify-center rounded-xl"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. CLIENTS TAB ── */}
      {activeTab === 'my-clients' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Assigned Legal Aid Clients
            </h3>
            <p className="text-xs text-slate-400">Access profiles, contact numbers, case histories, and uploaded document vaults.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {clients.map((client) => (
              <div key={client.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <img src={client.photo} alt={client.name} className="h-14 w-14 rounded-2xl object-cover border" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{client.id} · Assigned: {client.assignedDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                    <p><strong>Phone:</strong> {client.phone}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p className="col-span-2"><strong>Case Category:</strong> {client.caseType}</p>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 btn-secondary text-xs py-2 justify-center rounded-xl"
                  >
                    View Client
                  </button>
                  <button
                    onClick={() => {
                      setActiveChatRecipient(client.id);
                      navigate('/dashboard/messages');
                    }}
                    className="flex-1 btn-primary text-xs py-2 justify-center rounded-xl"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. SCHEDULE TAB ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Advocate Court Calendar Schedules
                </h3>
                <p className="text-xs text-slate-400 font-medium">Verify execution of each stage in your legal aid pipeline.</p>
              </div>

              <div className="flex rounded-xl border border-slate-200 dark:border-slate-850 p-1 bg-slate-50 dark:bg-slate-900 max-w-xs shrink-0 self-start">
                {['month', 'week', 'agenda'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize ${
                      calendarView === view ? 'bg-white dark:bg-slate-950 text-blue-600 shadow' : 'text-slate-500'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar render */}
            {calendarView === 'month' && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <p className="text-xs font-bold text-slate-550 dark:text-slate-350 uppercase mb-3">July 2026</p>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-2 text-center text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-slate-300 dark:text-slate-700">29</span>
                    <span className="text-slate-300 dark:text-slate-700">30</span>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                    <span>13</span><span>14</span>
                    <span className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto shadow-md cursor-pointer animate-pulse">
                      15
                    </span>
                    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span>
                    <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase">Court Hearing</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">Nair Boundary Dispute Trial</h4>
                    <p className="text-[10px] text-slate-450 mt-1">Courtroom Hall 3 · District Court</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Judge Shanmugam · Priya Nair</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4 text-[10px] text-slate-400">
                    <p><strong>Time:</strong> 10:30 AM</p>
                    <p><strong>Reminder Status:</strong> Tomorrow alerts check complete</p>
                  </div>
                </div>
              </div>
            )}

            {calendarView !== 'month' && (
              <div className="space-y-3">
                {[
                  { title: 'Custody mediation meeting', time: '11:00 AM', client: 'Arjun Das', place: 'Family Court Hall 1' },
                  { title: 'Boundary trial preliminary submissions', time: '10:30 AM', client: 'Priya Nair', place: 'Court Hall 3' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-white">{item.title}</p>
                      <p className="text-slate-400 mt-0.5">Client: {item.client} · Location: {item.place}</p>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. DOCUMENTS TAB ── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Secure Documents Vault
                </h3>
                <p className="text-xs text-slate-400">Search, preview, replace and audit client evidentiary documents.</p>
              </div>

              <button
                onClick={() => alert('Advocate upload files action initialized...')}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Upload size={14} /> Upload Case File
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>Uploaded By</th>
                    <th>Date Attached</th>
                    <th>Verification status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="font-bold">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td>{doc.type}</td>
                      <td>{doc.uploadedBy}</td>
                      <td>{doc.date}</td>
                      <td>
                        <span className="badge badge-green">{doc.status}</span>
                      </td>
                      <td className="text-right">
                        <button onClick={() => alert(`Previewing ${doc.name}`)} className="p-1 rounded bg-slate-100 text-slate-700 text-xs hover:bg-slate-200">
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden h-[540px] flex">
          
          <div className="w-72 shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2.5">Clients Inbox</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={chatSearchQuery}
                  onChange={e => setChatSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => setActiveChatRecipient('client-1')}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                  activeChatRecipient === 'client-1' ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  PN
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Priya Nair</p>
                  <p className="text-[10px] text-slate-450 truncate">Yes Priya, the PDF upload looks...</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Priya Nair</h4>
                <p className="text-[9px] text-[#059669] font-bold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" /> Active client chat
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages
                .filter(m => 
                  m.recipient === activeChatRecipient || 
                  m.recipient === 'client-1' || 
                  m.sender === 'user' || 
                  m.sender === 'User' ||
                  m.sender === 'applicant'
                )
                .map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'lawyer' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'lawyer'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-150 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-850 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your message..."
                value={typedMessage}
                onChange={e => setTypedMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-800 dark:text-white"
              />
              <button onClick={handleSendMessage} className="btn-primary p-2.5 rounded-xl shrink-0 shadow-sm">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT FEES & PAYMENTS TAB (LAWYER VIEW) ── */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-700/50">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                <CreditCard size={14} /> Advocate Chamber Revenue & Fee Escrow
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Client Fee Management & Payment Status
              </h2>
              <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
                Monitor client retainer fees, check payment receipts, track due dates, and dispatch payment reminders to clients.
              </p>
            </div>
            <div className="flex gap-3 z-10 shrink-0">
              <button 
                onClick={() => alert('Exported client fee ledger to CSV format.')}
                className="btn-secondary text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-bold"
              >
                <Download size={14} /> Export Statement
              </button>
            </div>
            <div className="absolute right-[-20px] bottom-[-30px] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue Collected</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹{fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.totalAmount, 0)}
                </p>
                <p className="text-[11px] text-emerald-500 font-medium mt-1">
                  {fees.filter(f => f.status === 'Paid').length} paid client invoices
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Client Fees</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹{fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amountDue, 0)}
                </p>
                <p className="text-[11px] text-amber-500 font-medium mt-1">
                  {fees.filter(f => f.status === 'Pending').length} pending client payments
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Payments</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {fees.filter(f => f.status === 'Overdue').length}
                </p>
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  Requires fee payment reminder
                </p>
              </div>
            </div>
          </div>

          {/* Client Fee Table Section */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search client or case ID..."
                    value={feeSearchQuery}
                    onChange={e => setFeeSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white w-64"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {['All', 'Paid', 'Pending', 'Overdue'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFeeFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      feeFilterStatus === st 
                        ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Client Fees */}
            <div className="space-y-4">
              {fees
                .filter(f => feeFilterStatus === 'All' ? true : f.status === feeFilterStatus)
                .filter(f => feeSearchQuery ? (f.clientName.toLowerCase().includes(feeSearchQuery.toLowerCase()) || f.caseId.toLowerCase().includes(feeSearchQuery.toLowerCase())) : true)
                .map(fee => (
                  <div 
                    key={fee.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-cyan-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {fee.clientName.charAt(0)}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {fee.clientName}
                        </h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {fee.caseId}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : fee.status === 'Overdue'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {fee.status === 'Paid' && <CheckCircle2 size={11} />}
                          {fee.status === 'Overdue' && <AlertCircle size={11} />}
                          {fee.status === 'Pending' && <Clock size={11} />}
                          {fee.status === 'Paid' ? 'Fee Paid' : fee.status === 'Overdue' ? 'Payment Overdue' : 'Fee Pending'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <strong>Case:</strong> {fee.caseTitle} • <strong>Service:</strong> {fee.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span><strong>Payment Due Date:</strong> {fee.dueDate}</span>
                        {fee.paidAt && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-medium"><strong>Paid On:</strong> {fee.paidAt}</span>
                            <span>•</span>
                            <span className="text-slate-400"><strong>Ref:</strong> {fee.transactionId}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-semibold">Total Fee</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">₹{fee.totalAmount}</p>
                        {fee.amountDue > 0 ? (
                          <p className="text-[11px] text-rose-500 font-bold">Unpaid: ₹{fee.amountDue}</p>
                        ) : (
                          <p className="text-[11px] text-emerald-500 font-bold">Paid by Client</p>
                        )}
                      </div>

                      {fee.status !== 'Paid' ? (
                        <button
                          onClick={() => handleSendReminder(fee)}
                          className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition"
                        >
                          <Bell size={14} /> Send Fee Reminder
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedInvoiceFee(fee)}
                          className="btn-secondary text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <Receipt size={14} /> View Invoice
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 7. PROFILE & PERFORMANCE TAB ── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px]">
          
          <div className="w-full md:w-56 shrink-0 border-r border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-455 uppercase tracking-widest px-3 mb-2">Advocate settings</p>
            {[
              { id: 'personal', label: 'Office Profile', icon: User },
              { id: 'performance', label: 'Performance Metrics', icon: BarChart2 },
              { id: 'security', label: 'Security Password', icon: Lock },
              { id: 'preferences', label: 'Preferences setup', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProfileSubTab(tab.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                    profileSubTab === tab.id
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-6">
            {profileSubTab === 'personal' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Office Profile details</h4>
                  <p className="text-xs text-slate-400">Public defender profile configurations.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Full Legal Name</label>
                    <input type="text" defaultValue="Advocate Aisha Verma" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Bar Registration No</label>
                    <input type="text" defaultValue="BC/SL/71629" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Practice Experience</label>
                    <input type="text" defaultValue="12 Years" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Primary Specialization</label>
                    <input type="text" defaultValue="Civil disputes & boundary partition suits" className="form-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#60a5fa] uppercase mb-1.5">Languages spoken</label>
                    <input type="text" defaultValue="English, Sinhala, Tamil" className="form-input" />
                  </div>
                </div>

                <button onClick={() => alert('Profile credentials updated successfully.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save Profile Info
                </button>
              </div>
            )}

            {profileSubTab === 'performance' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Performance Metrics & Reports</h4>
                  <p className="text-xs text-slate-400">Download performance logs and review success ratings.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Total Case Allocations</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">164 Cases</p>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Case Success Win rate</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-450">95% Success</p>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Completed Arbitrations</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">148 cases</p>
                  </div>
                </div>

                {/* SVG Performance graph */}
                <div className="p-4 border rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Case closure history charts</p>
                  <svg viewBox="0 0 400 100" className="w-full h-24">
                    <path d="M 10,80 L 100,50 L 200,60 L 300,30 L 390,10" fill="none" stroke="#2563eb" strokeWidth="3" />
                    <circle cx="390" cy="10" r="5" fill="#2563eb" />
                  </svg>
                </div>

                {/* Download Actions */}
                <div className="flex gap-2">
                  <button onClick={() => alert('Downloading Advocate monthly report...')} className="btn-secondary text-[11px] py-2 px-4 rounded-xl flex items-center gap-1">
                    <Download size={13} /> Monthly Report
                  </button>
                  <button onClick={() => alert('Exporting full case history statement spreadsheet...')} className="btn-secondary text-[11px] py-2 px-4 rounded-xl flex items-center gap-1">
                    <FileSpreadsheet size={13} /> Export Case History
                  </button>
                </div>
              </div>
            )}

            {profileSubTab === 'security' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Change Credentials Password</h4>
                  <p className="text-xs text-slate-400">Strengthen your security credentials access parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                </div>

                <button onClick={() => alert('Password updated successfully.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Update Password
                </button>
              </div>
            )}

            {profileSubTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Portal Design & Accessibility Preferences</h4>
                  <p className="text-xs text-slate-400">Configure visual themes, contrast modes, text size scaling, and workspace settings.</p>
                </div>

                {/* Embedded Design & Accessibility Customizer */}
                <ThemeCustomizer />

                <div className="flex items-center justify-between p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h5 className="text-xs font-bold">Enable dark mode theme</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle interface elements contrast.</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="text-xs font-bold text-blue-500 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950"
                  >
                    {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 9. CASE DETAILS MODAL ── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-xl w-full space-y-6 shadow-2xl relative h-[90vh] flex flex-col justify-between">
            <button onClick={() => setSelectedCase(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Case Details — {selectedCase.id}</h4>
                <p className="text-xs text-slate-450 mt-1">{selectedCase.title}</p>
              </div>

              {/* Subtabs for modal details */}
              <div className="flex gap-2 border-b pb-1 text-xs">
                {['overview', 'timeline', 'notes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCaseDetailTab(tab)}
                    className={`pb-2 px-2 capitalize font-bold ${
                      activeCaseDetailTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeCaseDetailTab === 'overview' && (
                <div className="space-y-3 text-xs">
                  <p><strong>Applicant Name:</strong> {selectedCase.applicant}</p>
                  <p><strong>Presiding Judge:</strong> {selectedCase.judge}</p>
                  <p><strong>Courtroom Hall:</strong> {selectedCase.court}</p>
                  <p><strong>Litigation priority:</strong> {selectedCase.priority}</p>
                  <p><strong>Current Status:</strong> {selectedCase.status}</p>
                </div>
              )}

              {activeCaseDetailTab === 'timeline' && (
                <div className="space-y-3 pl-4 border-l ml-2 text-xs relative">
                  {selectedCase.timeline?.map((step, i) => (
                    <div key={i} className="relative">
                      <span className={`absolute -left-6 top-1 h-3 w-3 rounded-full ${step.done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                      <p className="font-bold">{step.label}</p>
                      <p className="text-[10px] text-slate-400">{step.date}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeCaseDetailTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    {selectedCase.notes?.map(n => (
                      <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <p>{n.text}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{n.date}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add private note..."
                      value={noteInputText}
                      onChange={e => setNoteInputText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-1.5 text-xs outline-none"
                    />
                    <button onClick={() => handleAddPrivateNote(selectedCase.id)} className="btn-primary text-xs py-1.5 px-3 rounded-lg">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 10. CLIENT DETAILS MODAL ── */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setSelectedClient(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div className="flex items-center gap-3">
              <img src={selectedClient.photo} alt={selectedClient.name} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedClient.name}</h4>
                <p className="text-xs text-slate-400">{selectedClient.email} · {selectedClient.phone}</p>
              </div>
            </div>

            <div className="flex gap-2 border-b pb-1 text-xs">
              {['overview', 'documents'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveClientDetailTab(tab)}
                  className={`pb-2 px-2 capitalize font-bold ${
                    activeClientDetailTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeClientDetailTab === 'overview' && (
              <div className="space-y-2 text-xs text-slate-500">
                <p><strong>Resident address:</strong> {selectedClient.address}</p>
                <p><strong>Occupation:</strong> {selectedClient.occupation}</p>
                <p><strong>Case matter:</strong> {selectedClient.caseType}</p>
                <p><strong>Assigned date:</strong> {selectedClient.assignedDate}</p>
              </div>
            )}

            {activeClientDetailTab === 'documents' && (
              <div className="space-y-2">
                {documents
                  .filter(d => d.uploadedBy === selectedClient.name)
                  .map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs flex justify-between items-center">
                      <p>{doc.name}</p>
                      <button onClick={() => alert(`Reviewing document ${doc.name}...`)} className="text-blue-500 font-bold">Preview</button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 11. AI LITIGATOR ASSISTANT DRAWER PANEL (RIGHT SLIDE OUT) ── */}
      {showAiAssistant && (
        <div className="fixed inset-y-0 right-0 z-[200] w-[400px] max-w-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-screen animate-slide-in">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Litigator Concierge</h4>
                <p className="text-[9px] text-slate-400">Summarizes cases & details precedents</p>
              </div>
            </div>
            <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
          </div>

          {/* AI chat history panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-150 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-1.5 p-2 bg-slate-100 rounded-xl justify-center max-w-[80px] dark:bg-slate-900">
                <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Prompt options suggestion */}
          <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap gap-1.5">
            {[
              'Summarize boundary suit',
              'Check boundary precedent',
              'Highlight missing documents',
              'Generate trial checklist'
            ].map(item => (
              <button
                key={item}
                onClick={() => {
                  setAiQuery(item);
                }}
                className="text-[9px] font-bold bg-white border dark:bg-slate-900 dark:border-slate-800 px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-600"
              >
                {item}
              </button>
            ))}
          </div>

          {/* AI input text bar */}
          <div className="p-3 border-t flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask AI Litigator..."
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiQuerySubmit()}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none"
            />
            <button onClick={handleAiQuerySubmit} className="btn-primary bg-purple-600 hover:bg-purple-500 p-2 rounded-xl text-xs">
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── LAWYER CLIENT INVOICE MODAL ── */}
      {selectedInvoiceFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 relative space-y-5">
            <button 
              onClick={() => setSelectedInvoiceFee(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Client Chamber Invoice</h3>
                <p className="text-xs text-slate-400 font-mono">Ref: {selectedInvoiceFee.transactionId || selectedInvoiceFee.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Client Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoiceFee.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Case Matter:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoiceFee.caseId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Total Fee Charged:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{selectedInvoiceFee.totalAmount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-500">{selectedInvoiceFee.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Paid On:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoiceFee.paidAt || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Gateway Method:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoiceFee.paymentMethod || 'Pending Deposit'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  alert('Chamber Invoice copy exported as PDF.');
                  setSelectedInvoiceFee(null);
                }}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download Copy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LawyerDashboard;
