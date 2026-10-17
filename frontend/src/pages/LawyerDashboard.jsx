import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import lawyerApi from '../api/lawyerApi';
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
  Activity,
  UserCheck,
  Filter,
  Star,
  RefreshCw
} from 'lucide-react';

const LawyerDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    pendingRequests: 0,
    rating: 5.0,
    reviewCount: 0
  });
  const [documents, setDocuments] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lawyerProfile, setLawyerProfile] = useState(null);

  // Modals & Details Views
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeCaseDetailTab, setActiveCaseDetailTab] = useState('overview'); // 'overview' | 'timeline' | 'notes'
  const [activeClientDetailTab, setActiveClientDetailTab] = useState('overview'); // 'overview' | 'documents'
  
  // Case Notes state for selected case
  const [caseNotes, setCaseNotes] = useState([]);
  const [noteInputText, setNoteInputText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Calendar States
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'

  // AI Assistant Drawer State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    { role: 'assistant', text: 'Greetings Counselor. I can generate case summaries, compile hearing checklists, search case precedents, and flag missing items. What can I do for you today?' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Chat/Messages State
  const [conversations, setConversations] = useState([]);
  const [activeChatRecipient, setActiveChatRecipient] = useState(null); // User object or ID
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Profile/Settings Sub-tabs & Form State
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'performance' | 'security' | 'preferences'
  const [profileFormData, setProfileFormData] = useState({
    specializations: '',
    experienceYears: 0,
    officeAddress: '',
    bio: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // File Upload State
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('Evidence Document');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const advocateName = user?.name || 'Counselor';

  // ── 1. MAIN DATA FETCHING ──
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignedRes, statsRes, notifRes, docRes, hearingRes, profileRes] = await Promise.allSettled([
        lawyerApi.getAssignedCases(),
        lawyerApi.getLawyerStats(),
        lawyerApi.getNotifications(),
        lawyerApi.getDocuments(),
        lawyerApi.getHearings(),
        lawyerApi.getMyProfile()
      ]);

      if (assignedRes.status === 'fulfilled') {
        setCases(assignedRes.value || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || {});
      }
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) ? notifRes.value : (notifRes.value?.data || []));
      }
      if (docRes.status === 'fulfilled') {
        setDocuments(docRes.value?.data || docRes.value || []);
      }
      if (hearingRes.status === 'fulfilled') {
        setHearings(hearingRes.value?.data || hearingRes.value || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const p = profileRes.value.data;
        setLawyerProfile(p);
        setProfileFormData({
          specializations: Array.isArray(p.specializations) ? p.specializations.join(', ') : (p.specializations || ''),
          experienceYears: p.experience || p.experienceYears || 0,
          officeAddress: p.officeAddress || p.address || '',
          bio: p.bio || '',
          phone: p.phone || user?.phone || ''
        });
      }
    } catch (err) {
      console.error('Error loading lawyer dashboard:', err);
      setError('Failed to load dashboard data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  // Fetch messages/conversations when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000); // 10s polling
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch active conversation messages
  useEffect(() => {
    if (activeChatRecipient?._id || typeof activeChatRecipient === 'string') {
      const recipientId = activeChatRecipient._id || activeChatRecipient;
      fetchConversationMessages(recipientId);
    }
  }, [activeChatRecipient]);

  // Fetch notes when a case is selected
  useEffect(() => {
    if (selectedCase?._id) {
      fetchCaseNotes(selectedCase._id);
    }
  }, [selectedCase]);

  const fetchConversations = async () => {
    try {
      const data = await lawyerApi.getConversations();
      setConversations(data || []);
      if (!activeChatRecipient && data && data.length > 0) {
        setActiveChatRecipient(data[0].contact);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchConversationMessages = async (userId) => {
    try {
      const msgs = await lawyerApi.getConversationMessages(userId);
      setActiveChatMessages(msgs || []);
    } catch (err) {
      console.error('Error fetching conversation messages:', err);
    }
  };

  const fetchCaseNotes = async (caseId) => {
    try {
      const notes = await lawyerApi.getCaseNotes(caseId);
      setCaseNotes(notes || []);
    } catch (err) {
      console.error('Error fetching case notes:', err);
    }
  };

  // ── HANDLERS ──
  const handleAcceptCase = async (caseId) => {
    try {
      await lawyerApi.acceptCase(caseId);
      alert('Case representation accepted.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept case');
    }
  };

  const handleDeclineCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to decline this case allocation?')) return;
    try {
      await lawyerApi.declineCase(caseId);
      alert('Case returned to queue.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline case');
    }
  };

  const handleUpdateStatus = async (caseId) => {
    const newStatus = prompt('Enter new litigation status:\n(e.g., Active, Hearing, Judgment, Completed)');
    if (!newStatus) return;
    try {
      await lawyerApi.updateCaseStatus(caseId, newStatus, `Status updated to ${newStatus} by lawyer`);
      alert(`Case status updated to ${newStatus}`);
      fetchDashboardData();
      if (selectedCase && selectedCase._id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update case status');
    }
  };

  const handleAddPrivateNote = async () => {
    if (!noteInputText.trim() || !selectedCase?._id) return;
    try {
      setAddingNote(true);
      const updatedNotes = await lawyerApi.addCaseNote(selectedCase._id, noteInputText.trim());
      setCaseNotes(updatedNotes || []);
      setNoteInputText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !activeChatRecipient) return;
    const recipientId = activeChatRecipient._id || activeChatRecipient;
    try {
      setSendingMsg(true);
      await lawyerApi.sendMessage({ receiver: recipientId, text: typedMessage });
      setTypedMessage('');
      fetchConversationMessages(recipientId);
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const specs = profileFormData.specializations.split(',').map(s => s.trim()).filter(Boolean);
      await lawyerApi.updateMyProfile({
        specializations: specs,
        experience: Number(profileFormData.experienceYears),
        officeAddress: profileFormData.officeAddress,
        bio: profileFormData.bio,
        phone: profileFormData.phone
      });
      alert('Lawyer profile updated successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      alert('Please select a file and enter a document title.');
      return;
    }
    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('document', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadType);
      if (selectedCase?._id) {
        formData.append('application', selectedCase._id);
      }

      await lawyerApi.uploadDocument(formData);
      alert('Document uploaded successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  // AI Query Submit Handler
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
        aiResponse = `CASE SUMMARY: Active assigned cases count is ${cases.length}. Priority items focus on upcoming court schedule hearings.`;
      } else if (q.includes('precedent') || q.includes('reference') || q.includes('law')) {
        aiResponse = 'LEGAL REFERENCE: Under Legal Aid Act guidelines, representation documents and indigency audit logs carry statutory weight in legal aid petitions.';
      } else if (q.includes('checklist') || q.includes('hearing')) {
        aiResponse = 'HEARING CHECKLIST:\n1. Verify client identity and income proof.\n2. Cross-examine evidentiary deeds.\n3. Request in-app status updates post-hearing.';
      } else {
        aiResponse = 'I have scanned your active cases. Ensure all hearing notices are attached to the document vault for scheduled trials.';
      }
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: aiResponse }]);
      setAiLoading(false);
    }, 1000);
  };

  // Derived unique clients list from cases
  const clientsList = cases.reduce((acc, currentCase) => {
    if (currentCase.applicant && currentCase.applicant._id) {
      const existing = acc.find(c => c._id === currentCase.applicant._id);
      if (!existing) {
        acc.push({
          ...currentCase.applicant,
          caseTitle: currentCase.caseTitle,
          caseId: currentCase.caseId,
          caseType: currentCase.caseType,
          status: currentCase.status
        });
      }
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP BANNER: ADVOCATE WELCOME ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb]">
            ⚖️ STATE ADVOCATE COUNSEL
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome Back, {advocateName.split(' ')[0]}
          </h2>
          <p className="text-xs text-slate-450 font-bold mt-1">
            Specialization: {user?.specialization || lawyerProfile?.specializations?.join(', ') || 'General Legal Aid Practice'}
          </p>
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-3.5 max-w-2xl italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--blue-600)' }}>
            “Let justice be done, though the heavens fall. In the defense of law, our counsel stands as the guardian of liberty and equity.”
          </p>
        </div>
        <div className="text-left md:text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-250">{todayDate}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{currentTime}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold mt-1"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Data
          </button>
        </div>
      </div>

      {loading && cases.length === 0 && (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm font-semibold">Synchronizing Legal Aid Docket...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

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
                <p className="text-sm font-black mt-1">Review Cases Allocations ({cases.length})</p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Active Cases Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="card card-accent-blue p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned / Active</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalCases} / {stats.activeCases}</p>
                </div>
                <FolderOpen size={16} className="text-blue-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Active representation caseload</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-blue-500 animate-pulse" />
            </motion.div>

            {/* Pending Requests Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -4 }}
              className="card card-accent-gold p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Acceptance</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.pendingRequests}</p>
                </div>
                <Clock size={16} className="text-amber-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">New cases awaiting your review</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-amber-500 animate-pulse" />
            </motion.div>
 
            {/* Hearings Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="card card-accent-purple p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Hearings</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{hearings.length}</p>
                </div>
                <Calendar size={16} className="text-purple-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Upcoming court calendar dates</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-purple-500 animate-pulse" />
            </motion.div>
 
            {/* Rating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -4 }}
              className="card card-accent-green p-5 glass-card flex flex-col justify-between h-28 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Rating</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.rating} ⭐</p>
                </div>
                <Star size={16} className="text-emerald-500 shrink-0" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold text-left">Based on {stats.reviewCount || 0} reviews</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-emerald-500 animate-pulse" />
            </motion.div>
          </div>

          {/* Core Dashboard sections grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's hearings checklist */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Upcoming Trial Hearings Schedule
                </h3>
                
                {hearings.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming court hearings scheduled in system.</p>
                ) : (
                  <div className="space-y-3">
                    {hearings.slice(0, 3).map((h, i) => (
                      <div key={h._id || i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded tracking-wide uppercase">
                            {h.caseType || 'Trial Hearing'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-850 dark:text-white mt-1.5">{h.caseTitle || h.title || 'Legal Hearing'}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {h.courtLocation || h.courtName || 'District Court'} · Judge: {h.judgeName || 'Hon. Judge'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                            {h.hearingDate ? new Date(h.hearingDate).toLocaleDateString() : 'Scheduled'}
                          </p>
                          <span className="badge badge-amber mt-1.5">{h.status || 'Active'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Assigned Cases */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Recent Case Allocations
                  </h3>
                  <button onClick={() => navigate('/dashboard/assigned-cases')} className="text-xs text-blue-600 font-bold hover:underline">
                    View All ({cases.length})
                  </button>
                </div>

                {cases.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No cases currently assigned to your account.</p>
                ) : (
                  <div className="space-y-3">
                    {cases.slice(0, 3).map((c) => (
                      <div key={c._id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{c.caseTitle}</span>
                            <span className={`badge text-[9px] ${c.status === 'Active' ? 'badge-blue' : c.status === 'LawyerAssigned' ? 'badge-amber' : 'badge-green'}`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Ref: {c.caseId} · Applicant: {c.applicant?.name || 'Assigned Client'} · Category: {c.caseType}
                          </p>
                        </div>
                        <button onClick={() => setSelectedCase(c)} className="btn-secondary text-[10px] py-1 px-3 rounded-lg">
                          Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right side: Notifications & System info */}
            <div className="space-y-6">
              
              {/* Notifications */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Case Alerts & Notifications</h3>
                  <Bell size={14} className="text-slate-400" />
                </div>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No new notifications.</p>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div key={n._id || n.id} className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300">{n.message || n.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Profile Summary */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3 text-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Advocate Status Summary</h3>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                  <p><strong>Availability:</strong> <span className="text-emerald-600 font-bold">{lawyerProfile?.availabilityStatus || 'Available'}</span></p>
                  <p><strong>Verification:</strong> <span className="text-blue-600 font-bold">{lawyerProfile?.verificationStatus || 'Verified'}</span></p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 2. ASSIGNED CASES TAB ── */}
      {activeTab === 'assigned-cases' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Assigned Legal Aid Cases ({cases.length})
              </h3>
              <p className="text-xs text-slate-400">Review briefs, accept allocations, and update courtroom litigation file status.</p>
            </div>
            <button onClick={fetchDashboardData} className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <FolderOpen size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Legal Aid Cases Currently Assigned</p>
              <p className="text-xs text-slate-400 mt-1">When court staff or admin assigns cases to your profile, they will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {cases.map((c) => (
                <div key={c._id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`badge ${c.urgency === 'High' ? 'badge-red' : 'badge-slate'} uppercase`}>
                          {c.urgency || 'Medium'} Priority
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{c.caseTitle}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{c.caseId} · Category: {c.caseType}</p>
                      </div>
                      <span className={`badge ${c.status === 'Active' ? 'badge-blue' : c.status === 'LawyerAssigned' ? 'badge-amber' : 'badge-green'}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <p><strong>Applicant:</strong> {c.applicant?.name || 'N/A'}</p>
                      <p><strong>Contact:</strong> {c.applicant?.phone || c.applicant?.email || 'N/A'}</p>
                      <p><strong>Court:</strong> {c.court || c.courtDetails?.courtName || 'District Court'}</p>
                      <p><strong>Location:</strong> {c.location || c.courtDetails?.city || 'Colombo'}</p>
                    </div>

                    {c.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl line-clamp-2">
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* Operations buttons */}
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="flex-1 btn-secondary text-xs py-2 justify-center rounded-xl font-bold"
                    >
                      View Full File
                    </button>
                    
                    {c.status === 'LawyerAssigned' ? (
                      <div className="flex gap-2 w-full mt-2">
                        <button
                          onClick={() => handleAcceptCase(c._id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs py-2 font-bold transition"
                        >
                          Accept Case
                        </button>
                        <button
                          onClick={() => handleDeclineCase(c._id)}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs py-2 font-bold transition"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(c._id)}
                        className="flex-1 btn-primary text-xs py-2 justify-center rounded-xl font-bold"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. CLIENTS TAB ── */}
      {activeTab === 'my-clients' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Assigned Legal Aid Clients ({clientsList.length})
            </h3>
            <p className="text-xs text-slate-400">Access profiles, contact numbers, case histories, and uploaded document vaults.</p>
          </div>

          {clientsList.length === 0 ? (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Users size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Assigned Clients</p>
              <p className="text-xs text-slate-400 mt-1">Clients associated with your assigned cases will be listed here.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {clientsList.map((client) => (
                <div key={client._id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                        {client.name ? client.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CL'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Case: {client.caseId} ({client.caseTitle})</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
                      <p><strong>Email:</strong> {client.email || 'N/A'}</p>
                      <p><strong>Occupation:</strong> {client.occupation || 'N/A'}</p>
                      <p><strong>Location:</strong> {client.location || 'N/A'}</p>
                      <p className="col-span-2"><strong>Case Category:</strong> {client.caseType}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 btn-secondary text-xs py-2 justify-center rounded-xl font-bold"
                    >
                      View Client
                    </button>
                    <button
                      onClick={() => {
                        setActiveChatRecipient(client);
                        navigate('/dashboard/messages');
                      }}
                      className="flex-1 btn-primary text-xs py-2 justify-center rounded-xl font-bold"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. SCHEDULE TAB ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Advocate Court Calendar Schedules ({hearings.length})
                </h3>
                <p className="text-xs text-slate-400 font-medium">Verify court trial dates and pre-trial conferences.</p>
              </div>

              <div className="flex rounded-xl border border-slate-200 dark:border-slate-850 p-1 bg-slate-50 dark:bg-slate-900 max-w-xs shrink-0 self-start">
                {['month', 'agenda'].map((view) => (
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

            {hearings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No court hearings currently scheduled in system database.</p>
            ) : (
              <div className="space-y-3">
                {hearings.map((h, i) => (
                  <div key={h._id || i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-white">{h.caseTitle || h.title || 'Trial Hearing'}</p>
                      <p className="text-slate-400 mt-0.5">Court: {h.courtLocation || h.courtName || 'District Court'} · Judge: {h.judgeName || 'Hon. Judge'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600 dark:text-blue-400 block">
                        {h.hearingDate ? new Date(h.hearingDate).toLocaleDateString() : 'TBD'}
                      </span>
                      <span className="badge badge-blue mt-1">{h.status || 'Scheduled'}</span>
                    </div>
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
                  Secure Case Documents Vault ({documents.length})
                </h3>
                <p className="text-xs text-slate-400">Search, preview, and upload client evidentiary documents.</p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
              >
                <Upload size={14} /> Upload Case File
              </button>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No documents uploaded yet. Click "Upload Case File" to attach evidentiary files.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="premium-table w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-slate-400">
                      <th className="py-2">File Title</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Uploaded By</th>
                      <th className="py-2">Date Attached</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id} className="border-b border-slate-100 dark:border-slate-850">
                        <td className="py-3 font-bold">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-slate-400" />
                            <span>{doc.title || doc.name || doc.originalName || 'Document'}</span>
                          </div>
                        </td>
                        <td className="py-3">{doc.category || doc.type || 'Evidence'}</td>
                        <td className="py-3">{doc.uploadedBy?.name || 'User'}</td>
                        <td className="py-3">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 text-right">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
                            >
                              Download / Preview
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden h-[540px] flex">
          
          <div className="w-72 shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2.5">Client Messages Inbox</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contact..."
                  value={chatSearchQuery}
                  onChange={e => setChatSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No conversation history yet.</p>
              ) : (
                conversations
                  .filter(c => !chatSearchQuery || c.contact?.name?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                  .map((conv) => {
                    const isSelected = activeChatRecipient?._id === conv.contact?._id;
                    return (
                      <button
                        key={conv.contact?._id}
                        onClick={() => setActiveChatRecipient(conv.contact)}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                          isSelected ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                          {conv.contact?.name ? conv.contact.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{conv.contact?.name || 'User'}</p>
                          <p className="text-[10px] text-slate-450 truncate">{conv.lastMessage || 'Click to chat'}</p>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {activeChatRecipient ? (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeChatRecipient.name || 'Client'}</h4>
                    <p className="text-[9px] text-[#059669] font-bold flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" /> Active client channel
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChatMessages.map((msg) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-150 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })}
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
                  <button onClick={handleSendMessage} disabled={sendingMsg} className="btn-primary p-2.5 rounded-xl shrink-0 shadow-sm font-bold">
                    <Send size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a client conversation from the sidebar to send messages.
              </div>
            )}
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
              <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Office Profile details</h4>
                  <p className="text-xs text-slate-400">Public defender & state advocate profile configurations.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Full Legal Name</label>
                    <input type="text" value={user?.name || ''} disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Email Address</label>
                    <input type="text" value={user?.email || ''} disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Practice Experience (Years)</label>
                    <input 
                      type="number" 
                      value={profileFormData.experienceYears} 
                      onChange={e => setProfileFormData({ ...profileFormData, experienceYears: e.target.value })} 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Phone Contact</label>
                    <input 
                      type="text" 
                      value={profileFormData.phone} 
                      onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value })} 
                      className="form-input" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Specializations (comma separated)</label>
                    <input 
                      type="text" 
                      value={profileFormData.specializations} 
                      onChange={e => setProfileFormData({ ...profileFormData, specializations: e.target.value })} 
                      placeholder="Civil Law, Family Law, Property Disputes"
                      className="form-input" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Office Address</label>
                    <input 
                      type="text" 
                      value={profileFormData.officeAddress} 
                      onChange={e => setProfileFormData({ ...profileFormData, officeAddress: e.target.value })} 
                      placeholder="123 Legal Chambers, Colombo 03"
                      className="form-input" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={savingProfile} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  {savingProfile ? 'Saving...' : 'Save Profile Info'}
                </button>
              </form>
            )}

            {profileSubTab === 'performance' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Performance Metrics & Reports</h4>
                  <p className="text-xs text-slate-400">View real-time representation metrics aggregated from MongoDB.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Total Assigned Cases</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalCases} Cases</p>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Active Cases</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.activeCases} Cases</p>
                  </div>
                  <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Completed Trials</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-450">{stats.completedCases} Cases</p>
                  </div>
                </div>
              </div>
            )}

            {profileSubTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Display Settings</h4>
                  <p className="text-xs text-slate-400">Toggle interface theme.</p>
                </div>

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

      {/* ── 8. CASE DETAILS MODAL ── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setSelectedCase(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div>
                <span className="badge badge-blue text-[9px] uppercase">{selectedCase.caseId}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedCase.caseTitle}</h4>
                <p className="text-xs text-slate-450">Category: {selectedCase.caseType}</p>
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
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p><strong>Applicant Name:</strong> {selectedCase.applicant?.name || 'N/A'}</p>
                  <p><strong>Applicant Contact:</strong> {selectedCase.applicant?.phone || selectedCase.applicant?.email || 'N/A'}</p>
                  <p><strong>Court Name:</strong> {selectedCase.court || selectedCase.courtDetails?.courtName || 'District Court'}</p>
                  <p><strong>Location:</strong> {selectedCase.location || selectedCase.courtDetails?.city || 'Colombo'}</p>
                  <p><strong>Urgency Level:</strong> {selectedCase.urgency}</p>
                  <p><strong>Current Status:</strong> <span className="font-bold text-blue-600">{selectedCase.status}</span></p>
                  <div className="pt-2 border-t">
                    <p className="font-bold mb-1">Case Description:</p>
                    <p className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">{selectedCase.description}</p>
                  </div>
                </div>
              )}

              {activeCaseDetailTab === 'timeline' && (
                <div className="space-y-3 pl-4 border-l ml-2 text-xs relative">
                  {selectedCase.timeline && selectedCase.timeline.length > 0 ? (
                    selectedCase.timeline.map((step, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-blue-600" />
                        <p className="font-bold text-slate-800 dark:text-white">{step.status}</p>
                        <p className="text-[10px] text-slate-400">{step.note} · {step.date ? new Date(step.date).toLocaleDateString() : ''}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No timeline entries recorded yet.</p>
                  )}
                </div>
              )}

              {activeCaseDetailTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {caseNotes.length === 0 ? (
                      <p className="text-slate-400 py-2">No private case notes added yet.</p>
                    ) : (
                      caseNotes.map((n, idx) => (
                        <div key={n._id || idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.text}</p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            Added by {n.author?.name || 'Lawyer'} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add private note to case file..."
                      value={noteInputText}
                      onChange={e => setNoteInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddPrivateNote()}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-1.5 text-xs outline-none text-slate-800 dark:text-white"
                    />
                    <button onClick={handleAddPrivateNote} disabled={addingNote} className="btn-primary text-xs py-1.5 px-3 rounded-lg font-bold">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. CLIENT DETAILS MODAL ── */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setSelectedClient(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
                {selectedClient.name ? selectedClient.name.slice(0, 2).toUpperCase() : 'CL'}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedClient.name}</h4>
                <p className="text-xs text-slate-400">{selectedClient.email} · {selectedClient.phone || 'No phone'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p><strong>Resident Location:</strong> {selectedClient.location || 'Colombo'}</p>
              <p><strong>Occupation:</strong> {selectedClient.occupation || 'N/A'}</p>
              <p><strong>Monthly Income:</strong> {selectedClient.monthlyIncome ? `LKR ${selectedClient.monthlyIncome}` : 'Audited Indigent'}</p>
              <p><strong>Associated Case:</strong> {selectedClient.caseId} - {selectedClient.caseTitle}</p>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setActiveChatRecipient(selectedClient);
                  navigate('/dashboard/messages');
                }}
                className="btn-primary w-full text-xs py-2 rounded-xl font-bold"
              >
                Open Direct Message Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. UPLOAD DOCUMENT MODAL ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button onClick={() => setShowUploadModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Case File Document</h4>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g., Partition Survey Plan Deed.pdf"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Document Category</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="form-input">
                  <option value="Evidence Document">Evidence Document</option>
                  <option value="Court Order">Court Order</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="Pleading / Petition">Pleading / Petition</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Select File (PDF, DOCX, PNG, JPG)</label>
                <input
                  type="file"
                  onChange={e => setUploadFile(e.target.files[0])}
                  required
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 p-2 border rounded-xl"
                />
              </div>

              <button type="submit" disabled={uploadingDoc} className="btn-primary w-full py-2.5 rounded-xl font-bold">
                {uploadingDoc ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
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
              'Summarize active cases',
              'Check legal aid precedents',
              'Highlight hearing checklist'
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
              className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-white"
            />
            <button onClick={handleAiQuerySubmit} className="btn-primary bg-purple-600 hover:bg-purple-500 p-2 rounded-xl text-xs font-bold">
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LawyerDashboard;
