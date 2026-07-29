import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  Home,
  Briefcase,
  ShieldAlert,
  FolderOpen,
  Sparkles,
  Scale,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Bell,
  Heart,
  HelpCircle,
  User,
  Settings,
  Plus,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Eye,
  Smile,
  Send,
  Trash2,
  Lock,
  ShieldCheck,
  Star,
  Info,
  ChevronRight,
  Search,
  Filter,
  FileDown,
  Volume2,
  BookOpen,
  Smartphone,
  ChevronDown
} from 'lucide-react';

const ApplicantDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [profilePercent, setProfilePercent] = useState(75);
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals & Details Views
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);

  // Calendar States
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-07-15');

  // Chat/Messages state
  const [activeChatRecipient, setActiveChatRecipient] = useState('lawyer'); // 'lawyer' | 'admin'
  const [typedMessage, setTypedMessage] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, recipient: 'lawyer', sender: 'lawyer', text: 'Hello, I have reviewed your property dispute documents. We need to schedule a quick mock brief.', time: '09:30 AM', read: true },
    { id: 2, recipient: 'lawyer', sender: 'user', text: 'Thank you Advocate. What files should I bring along?', time: '09:35 AM', read: true },
    { id: 3, recipient: 'lawyer', sender: 'lawyer', text: 'Please bring the original land deed and municipal tax receipts.', time: '09:40 AM', read: true },
    { id: 4, recipient: 'admin', sender: 'admin', text: 'Dear User, your income documentation verification audit has been approved by the legal aid desk.', time: 'Yesterday', read: true }
  ]);

  // Profile Sub-tabs state
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'security' | 'preferences' | 'feedback' | 'support'

  // Application wizard form fields
  const [applyForm, setApplyForm] = useState({
    fullName: user?.name || '',
    dob: '',
    gender: 'Male',
    phone: '',
    address: '',
    occupation: '',
    monthlyIncome: '',
    caseType: 'Civil Law',
    caseDescription: '',
    urgency: 'Medium'
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const userName = user?.name ? user.name.split(' ')[0] : 'User';

  // Dynamic Data Lists (loaded from backend)
  const [applications, setApplications] = useState([]);
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const fileInputRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      // Fetch applications
      const appResp = await axios.get('/applications/mine');
      const apps = appResp.data;
      const mappedApps = apps.map(a => ({
        ...a,
        id: a._id,
        date: new Date(a.createdAt).toLocaleDateString(),
        type: a.caseType,
        desc: a.description,
        courtroom: a.court || 'District Court',
        lawyer: a.assignedLawyer?.name || 'TBD',
        nextHearing: a.hearing?.hearingDate ? new Date(a.hearing.hearingDate).toLocaleDateString() : 'TBD',
        status: a.status,
        verificationStatus: a.verificationStatus || 'Pending',
        timeline: a.timeline?.map(t => ({
          label: t.status + (t.note ? `: ${t.note}` : ''),
          date: new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          done: true
        })) || []
      }));
      setApplications(mappedApps);

      // Filter cases (applications with status other than Submitted/Verification/Under Review/Rejected)
      const activeCases = apps
        .filter(a => ['LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(a.status))
        .map(a => ({
          id: a._id,
          title: a.caseTitle,
          type: a.caseType,
          court: a.court || 'District Court',
          judge: a.hearing?.judge || 'Presiding Judge',
          lawyer: a.assignedLawyer?.name || 'TBD',
          status: a.status === 'Completed' ? 'Completed' : 'Active',
          priority: a.urgency || 'Medium',
          nextHearing: a.hearing?.hearingDate ? new Date(a.hearing.hearingDate).toLocaleDateString() : 'TBD',
          timeline: a.timeline?.map(t => ({ name: t.status, date: new Date(t.date).toLocaleDateString(), done: true })) || []
        }));
      setCases(activeCases);

      // Fetch notifications
      try {
        const notifResp = await axios.get('/notifications');
        setNotifications(notifResp.data);
      } catch (err) {
        console.warn('Failed to load notifications from server, keeping fallback.', err.message);
        setNotifications([
          { id: 1, title: 'Welcome to Seven Seas', body: 'Your dashboard is fully integrated with judicial databases.', time: '1 min ago', read: false }
        ]);
      }

      // Fetch documents for the user's applications
      let docs = [];
      if (apps.length > 0) {
        try {
          const docResp = await axios.get('/documents', { params: { application: apps[0]._id } });
          docs = docResp.data;
        } catch (err) {
          console.warn('Could not load documents from backend.', err.message);
        }
      }
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // AI Recommender Input & Recommendation state
  const [aiInputs, setAiInputs] = useState({
    caseType: 'Civil Law',
    description: '',
    language: 'English',
    location: 'Colombo',
    budget: 'Subsidized Aid',
    urgency: 'Medium'
  });
  const [recommendedLawyers, setRecommendedLawyers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // AI Recommendation Trigger
  const triggerAiMatch = async () => {
    setAiLoading(true);
    try {
      const response = await axios.get('/recommendations', {
        params: {
          caseType: aiInputs.caseType,
          location: aiInputs.location,
          specialization: aiInputs.caseType.replace(' Law', ''),
          experience: 8,
          successRate: 85,
          availability: 'High',
          activeCases: 4
        }
      });

      // Map response to premium frontend avatars
      const mappedLawyers = response.data.map((lawyer, index) => {
        const premiumProfiles = {
          'Ava Deshmukh': {
            id: 'law-1',
            rating: 4.9,
            languages: 'English, Hindi',
            fee: 'Free / Subsidized Legal Aid',
            courtExperience: 'High Court, Family Courts',
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
            bio: 'Senior Family Law practitioner with 12 years of public defender experience.'
          },
          'Dilan Fernando': {
            id: 'law-2',
            rating: 4.7,
            languages: 'English, Sinhala',
            fee: 'Free / Subsidized Legal Aid',
            courtExperience: 'District Court, Magistrate Court',
            photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
            bio: 'Dedicated Criminal defense advocate specialized in public aid trials.'
          },
          'Niranjani Perera': {
            id: 'law-3',
            rating: 4.8,
            languages: 'English, Tamil',
            fee: 'Free / Subsidized Legal Aid',
            courtExperience: 'Supreme Court, Land Registry Disputes',
            photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
            bio: 'Expert in land tenure disputes and municipal property arbitration.'
          },
          'Sameer Kottegoda': {
            id: 'law-4',
            rating: 4.6,
            languages: 'English, Sinhala, Tamil',
            fee: 'Free / Subsidized Legal Aid',
            courtExperience: 'Commercial High Court, Civil Courts',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            bio: 'Civil litigation counsel with over 90 successful legal aid representations.'
          },
          'Anjali Perera': {
            id: 'law-5',
            rating: 4.5,
            languages: 'English, Sinhala',
            fee: 'Free / Subsidized Legal Aid',
            courtExperience: 'Labour Tribunal, Civil Courts',
            photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
            bio: 'Labor and employment law advocate focused on workplace rights.'
          }
        };

        const profile = premiumProfiles[lawyer.name] || {
          id: `law-dyn-${index}`,
          rating: 4.5,
          languages: 'English',
          fee: 'Free / Subsidized Legal Aid',
          courtExperience: 'District Court',
          photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
          bio: 'Verified Legal Aid Defender.'
        };

        return {
          id: profile.id,
          name: lawyer.name,
          specialization: lawyer.specialization + ' Law',
          experience: lawyer.experience,
          successRate: lawyer.successRate,
          rating: profile.rating,
          languages: profile.languages,
          fee: profile.fee,
          availability: lawyer.availability,
          match: lawyer.matchPercentage || 90,
          distance: '2.4 km',
          courtExperience: profile.courtExperience,
          reason: lawyer.reason || profile.bio,
          photo: profile.photo
        };
      });

      setRecommendedLawyers(mappedLawyers);
    } catch (err) {
      console.error('Error triggering AI match:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Form submit handler (saves to backend application database)
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        caseTitle: `${applyForm.caseType} for ${applyForm.fullName}`,
        caseType: applyForm.caseType,
        description: applyForm.caseDescription,
        urgency: applyForm.urgency,
        court: 'District Court',
        location: applyForm.address || 'Colombo',
        occupation: applyForm.occupation,
        monthlyIncome: Number(applyForm.monthlyIncome) || 0
      };
      
      const response = await axios.post('/applications', payload);
      alert(`Success: Legal Aid Application has been successfully created!`);
      setShowApplyModal(false);
      setApplyStep(1);
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating application:', err);
      alert('Failed to submit application: ' + (err.response?.data?.message || err.message));
    }
  };

  // Real Document attachments Upload
  const handleDocumentUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRealFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (applications.length > 0) {
        formData.append('application', applications[0]._id);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      const response = await axios.post('/documents', formData, config);
      setDocuments(prev => [...prev, response.data]);
      alert('Document uploaded successfully to the verification queue.');
      fetchDashboardData();
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Action: Withdraw Application
  const handleWithdraw = (appId) => {
    if (confirm(`Are you sure you want to withdraw application ${appId}?`)) {
      setApplications(applications.filter(a => a.id !== appId));
      setSelectedApp(null);
      alert(`Application ${appId} has been successfully withdrawn.`);
    }
  };

  // Chat message send
  const handleSendMessage = () => {
    if (!typedMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      recipient: activeChatRecipient,
      sender: 'user',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    setChatMessages([...chatMessages, newMsg]);
    setTypedMessage('');
  };

  // Comparison toggle helper
  const toggleCompare = (lawyer) => {
    if (compareList.some(l => l.id === lawyer.id)) {
      setCompareList(compareList.filter(l => l.id !== lawyer.id));
    } else {
      if (compareList.length >= 2) {
        alert('You can only compare a maximum of 2 lawyers at the same time.');
        return;
      }
      setCompareList([...compareList, lawyer]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP SECTION: WELCOME CARD ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb]">
            ⚡ ONLINE USER ACCESS
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome Back, User {userName} - Personal Legal Access Hub
          </h2>
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-2.5 max-w-2xl italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--blue-600)' }}>
            “In justice, all virtues are concentrated. The shield of the law must protect the rights of every citizen with absolute equality.”
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mt-2.5">
            <span>{todayDate}</span>
            <span>·</span>
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Profile Completion tracker */}
        <div className="w-52 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500 dark:text-slate-400">Profile Completion</span>
            <span className="text-blue-500 font-bold">{profilePercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${profilePercent}%` }} />
          </div>
        </div>
      </div>

      {/* ── 1. DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Legal Subsidies</p>
                <p className="text-sm font-black mt-1">Apply for Legal Aid</p>
              </div>
              <Plus size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => navigate('/dashboard/ai-recommend')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-100">AI Concierge</p>
                <p className="text-sm font-black mt-1">Find AI Lawyer Match</p>
              </div>
              <Sparkles size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => navigate('/dashboard/documents')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Document Center</p>
                <p className="text-sm font-black mt-1">Access secure Vault</p>
              </div>
              <FileText size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Applications */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{ y: -4 }}
              className="card card-accent-gold p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-rose-500 dark:text-rose-450 uppercase tracking-wider">Total Applications</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {applications.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-450">
                  <ShieldAlert size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Awaiting verification audits</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-rose-400 animate-pulse" />
            </motion.div>
 
            {/* Card 2: Cases */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              whileHover={{ y: -4 }}
              className="card card-accent-green p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-450 uppercase tracking-wider">Active Cases</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {cases.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450">
                  <Scale size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Active representations</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-emerald-400 animate-pulse" />
            </motion.div>
 
            {/* Card 3: Hearings */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="card card-accent-blue p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-450 uppercase tracking-wider">Upcoming Hearings</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    1
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-450">
                  <Calendar size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Scheduled trial hearings</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-blue-400 animate-pulse" />
            </motion.div>
 
            {/* Card 4: Documents */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              whileHover={{ y: -4 }}
              className="card card-accent-purple p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-purple-500 dark:text-purple-450 uppercase tracking-wider">Pending Documents</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {documents.filter(d => d.status === 'Pending Review').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-450">
                  <FileText size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Awaiting validation approval</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-purple-400 animate-pulse" />
            </motion.div>
          </div>

          {/* Core Dashboard Content Layout grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left side: Case/Application progress & SVG charts */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Application progress SVG chart */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Application Progress Distribution Graph
                </h3>
                
                {/* SVG Visualizer representing progression metrics */}
                <div className="flex flex-col items-center justify-center py-4">
                  <svg viewBox="0 0 400 120" className="w-full max-w-md">
                    {/* Background path line */}
                    <path d="M 30,60 H 370" stroke="var(--border-color)" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200 dark:stroke-slate-800" />
                    
                    {/* Active completed path line */}
                    <path d="M 30,60 H 270" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Node 1: Submitted */}
                    <circle cx="30" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="30" cy="60" r="4" fill="white" />
                    <text x="30" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Submitted</text>
                    
                    {/* Node 2: Auditing */}
                    <circle cx="150" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="150" cy="60" r="4" fill="white" />
                    <text x="150" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Audit Verified</text>
                    
                    {/* Node 3: Advocate Assigned */}
                    <circle cx="270" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="270" cy="60" r="4" fill="white" />
                    <text x="270" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Lawyer Assigned</text>

                    {/* Node 4: Complete */}
                    <circle cx="370" cy="60" r="10" className="fill-slate-200 dark:fill-slate-800" />
                    <text x="370" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 dark:fill-slate-600">Trial Judgement</text>
                  </svg>
                  
                  <div className="mt-4 text-center">
                    <span className="text-xs font-semibold text-slate-500">Milestone Stage Level:</span>
                    <span className="text-xs font-bold text-blue-500 ml-1">Counsel Representation Stage (Active)</span>
                  </div>
                </div>
              </div>

              {/* Court Allocation Worklist */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
                  Court Allocation Worklist
                </h3>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded tracking-wide uppercase">
                          {app.type}
                        </span>
                        <p className="text-xs font-bold text-slate-850 dark:text-white">{app.desc || 'No brief summary description provided.'}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Docket Room: {app.courtroom} · Date: {app.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${
                          app.status === 'Assigned' ? 'badge-blue' :
                          app.status === 'Submitted' ? 'badge-slate' : 'badge-amber'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: Selected Lawyer / Hearings / Recent Notifications */}
            <div className="space-y-6">
              
              {/* Assigned Lawyer Details */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">My Assigned Legal Counsel</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                    AV
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Advocate Aisha Verma</h4>
                    <p className="text-[10px] text-blue-500 font-semibold">Public Aid Legal Defender</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 py-2 border-t border-slate-100 dark:border-slate-800">
                  <p><strong>Focus:</strong> Land tenure partitions & family arbitration</p>
                  <p><strong>Availability:</strong> Mon to Fri (10 AM - 4 PM)</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/messages')}
                  className="w-full btn-secondary text-xs py-2 justify-center rounded-xl flex items-center gap-1.5"
                >
                  <MessageSquare size={13} /> Chat with Advocate
                </button>
              </div>

              {/* Next Court Hearing details */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Next Court hearing</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">July 15, 2026</p>
                  <p className="text-xs font-bold mt-1.5">District Court Hall 3</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Time: 10:30 AM · Presiding: Justice Shanmugam</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/schedule')}
                  className="w-full btn-primary text-xs py-2 justify-center rounded-xl flex items-center gap-1.5"
                >
                  <Calendar size={13} /> View Schedule
                </button>
              </div>

              {/* Recent Notifications logs panel */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Recent Activity Logs</h3>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                      <p className="font-bold text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 2. APPLICATIONS TAB ── */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Legal Aid Subsidy Applications
              </h3>
              <p className="text-xs text-slate-400">Monitor, withdraw, or submit legal representation requests.</p>
            </div>
            
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Plus size={15} /> Submit New Application
            </button>
          </div>

          {/* Search & Filter row */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applications by type or briefs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1"><Filter size={12} /> Status:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs px-3 py-2 outline-none text-slate-800 dark:text-white"
              >
                <option>All</option>
                <option>Submitted</option>
                <option>Under Review</option>
                <option>Assigned</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* Applications list Table layout */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Submission Date</th>
                    <th>Specialization Category</th>
                    <th>Counsel Assigned</th>
                    <th>Next Hearing</th>
                    <th>Verification status</th>
                    <th className="text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .filter(app => {
                      const matchesSearch = app.type.toLowerCase().includes(searchQuery.toLowerCase()) || (app.desc && app.desc.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((app) => (
                      <tr key={app.id}>
                        <td><span className="font-mono font-bold text-xs">{app.id}</span></td>
                        <td>{app.date}</td>
                        <td>{app.type}</td>
                        <td className="font-semibold text-blue-600 dark:text-blue-400">{app.lawyer}</td>
                        <td>{app.nextHearing}</td>
                        <td>
                          <span className={`badge ${
                            app.verificationStatus === 'Verified' ? 'badge-green' :
                            app.verificationStatus === 'Rejected' ? 'badge-red' : 'badge-amber'
                          }`}>
                            {app.verificationStatus}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
                              title="View Application Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => alert(`Generating PDF statement audit output for application ${app.id}...`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition"
                              title="Download Statement Details PDF"
                            >
                              <Download size={14} />
                            </button>
                            {(app.status === 'Submitted' || app.status === 'Under Review') && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                title="Withdraw Request"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CASES TAB ── */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Active Judicial Cases
            </h3>
            <p className="text-xs text-slate-400">View live case tracking, courtroom scheduling details, and documentation.</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Docket ID</th>
                    <th>Case Title</th>
                    <th>Category</th>
                    <th>Representing Lawyer</th>
                    <th>Courtroom / Judge</th>
                    <th>Priority Level</th>
                    <th>Next Hearing</th>
                    <th>Litigation status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td><span className="font-mono font-bold text-xs">{c.id}</span></td>
                      <td className="font-bold">{c.title}</td>
                      <td>{c.type}</td>
                      <td className="font-semibold text-blue-600 dark:text-blue-400">{c.lawyer}</td>
                      <td>
                        <p className="text-xs font-semibold">{c.court}</p>
                        <p className="text-[10px] text-slate-400">{c.judge}</p>
                      </td>
                      <td>
                        <span className={`badge ${
                          c.priority === 'High' ? 'badge-red' : 'badge-slate'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="font-bold text-red-500">{c.nextHearing}</td>
                      <td>
                        <span className="badge badge-green">{c.status}</span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/track?id=${c.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-white transition text-xs font-bold"
                          >
                            Track Progress
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. AI LAWYER TAB ── */}
      {activeTab === 'ai-recommend' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                AI-Powered Advocate Recommendation System
              </h3>
              <p className="text-xs text-slate-400">Specify details to match with optimal public defenders and legal aid counsel.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Case Category</label>
                <select
                  value={aiInputs.caseType}
                  onChange={e => setAiInputs({ ...aiInputs, caseType: e.target.value })}
                  className="form-input"
                >
                  <option>Civil Law</option>
                  <option>Criminal Law</option>
                  <option>Family Law</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Preferred Language</label>
                <select
                  value={aiInputs.language}
                  onChange={e => setAiInputs({ ...aiInputs, language: e.target.value })}
                  className="form-input"
                >
                  <option>English</option>
                  <option>Sinhala</option>
                  <option>Tamil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Litigation Location</label>
                <input
                  type="text"
                  value={aiInputs.location}
                  onChange={e => setAiInputs({ ...aiInputs, location: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Representation Budget</label>
                <select
                  value={aiInputs.budget}
                  onChange={e => setAiInputs({ ...aiInputs, budget: e.target.value })}
                  className="form-input"
                >
                  <option>Subsidized Legal Aid</option>
                  <option>Pro-bono Representation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Urgency Level</label>
                <select
                  value={aiInputs.urgency}
                  onChange={e => setAiInputs({ ...aiInputs, urgency: e.target.value })}
                  className="form-input"
                >
                  <option>Medium</option>
                  <option>High (Hearing scheduled)</option>
                  <option>Normal / Advisory</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Brief litigation dispute description</label>
                <textarea
                  rows={2}
                  value={aiInputs.description}
                  onChange={e => setAiInputs({ ...aiInputs, description: e.target.value })}
                  placeholder="Summarize structural facts of claim here..."
                  className="form-input resize-none"
                />
              </div>
            </div>

            <button
              onClick={triggerAiMatch}
              disabled={aiLoading}
              className="w-full btn-primary justify-center py-3 rounded-xl shadow-lg shadow-blue-500/10 font-bold"
            >
              {aiLoading ? 'Recalculating Match Percentages...' : 'Execute Match Algorithm'}
            </button>
          </div>

          {/* AI Recommended advocate result listing cards */}
          {recommendedLawyers.length > 0 && (
            <div className="space-y-6">
              
              {/* Compare Panel Overlay (if lawyers are checked) */}
              {compareList.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold">Compare Selected Candidates ({compareList.length}/2)</h4>
                    <p className="text-[10px] text-slate-400">Analyze success parameters side-by-side.</p>
                  </div>
                  <div className="flex gap-2">
                    {compareList.map(lawyer => (
                      <span key={lawyer.id} className="text-xs font-bold bg-white dark:bg-slate-950 border px-3 py-1.5 rounded-xl flex items-center gap-1">
                        {lawyer.name}
                        <button onClick={() => toggleCompare(lawyer)} className="text-red-500 font-bold hover:scale-110 ml-1">×</button>
                      </span>
                    ))}
                    {compareList.length === 2 && (
                      <button
                        onClick={() => {
                          alert(`Advocates Comparison Audit Result:\n\n1. ${compareList[0].name}: ${compareList[0].successRate}% Success rate, ${compareList[0].experience} Years experience.\n2. ${compareList[1].name}: ${compareList[1].successRate}% Success rate, ${compareList[1].experience} Years experience.\n\nAI Choice: ${compareList[0].match > compareList[1].match ? compareList[0].name : compareList[1].name} due to partition suit specialization match.`);
                        }}
                        className="btn-primary text-xs py-1.5 px-3 rounded-xl font-bold"
                      >
                        Compare side by side
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {recommendedLawyers.map((lawyer) => (
                  <div key={lawyer.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      {/* Photo and general */}
                      <div className="flex items-start gap-4">
                        <img src={lawyer.photo} alt={lawyer.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded uppercase">
                              {lawyer.match}% Match
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                              <Star size={11} fill="currentColor" className="text-amber-400" /> {lawyer.rating}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold mt-1 text-slate-900 dark:text-white">{lawyer.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{lawyer.specialization}</p>
                        </div>
                      </div>

                      {/* Detail list parameters */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <p><strong>Experience:</strong> {lawyer.experience} Years</p>
                        <p><strong>Success Index:</strong> {lawyer.successRate}% Wins</p>
                        <p><strong>Availability:</strong> {lawyer.availability}</p>
                        <p><strong>Language:</strong> {lawyer.languages}</p>
                        <p><strong>Fee:</strong> {lawyer.fee}</p>
                        <p><strong>Distance:</strong> {lawyer.distance}</p>
                      </div>

                      {/* AI logic why recommended */}
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20 rounded-xl mt-4">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                          <strong>AI Rationale:</strong> {lawyer.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                      <button
                        onClick={() => toggleCompare(lawyer)}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition ${
                          compareList.some(l => l.id === lawyer.id)
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20'
                            : 'bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {compareList.some(l => l.id === lawyer.id) ? 'Selected' : 'Compare Advocate'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setApplications(applications.map(app => {
                            if (app.id === 'AID3902') {
                              return { ...app, lawyer: lawyer.name, status: 'Assigned' };
                            }
                            return app;
                          }));
                          alert(`Success: ${lawyer.name} has been selected to represent your legal aid application claim.`);
                        }}
                        className="btn-primary text-xs py-2 px-4 rounded-xl font-bold"
                      >
                        Select Counsel
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── 5. SCHEDULE TAB ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Judicial Hearings & Calendar Schedule
                </h3>
                <p className="text-xs text-slate-400 font-medium">Verify execution of each stage in your legal aid pipeline.</p>
              </div>

              {/* View selectors */}
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

            {/* Render Calendar based on View Selection */}
            {calendarView === 'month' && (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Calendar Grid mockup (Left 2 cols) */}
                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <p className="text-xs font-bold text-slate-550 dark:text-slate-350 uppercase mb-3">July 2026</p>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-2 text-center text-xs text-slate-700 dark:text-slate-300">
                    {/* Empty cells for calendar padding */}
                    <span className="text-slate-300 dark:text-slate-700">29</span>
                    <span className="text-slate-300 dark:text-slate-700">30</span>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                    <span>13</span><span>14</span>
                    {/* Highlighted Tomorrow Date July 15 */}
                    <span className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 animate-pulse cursor-pointer">
                      15
                    </span>
                    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span>
                    <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span>
                  </div>
                </div>

                {/* Selected date Details card (Right 1 col) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600">
                      ⏰ TOMORROW HEARING SCHEDULE
                    </div>
                    <h4 className="font-bold text-slate-850 dark:text-white text-sm mt-3">Property division dispute</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Presiding: Justice Shanmugam</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Representing: Aisha Verma</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Date & Time Hall</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-1">July 15, 2026 - 10:30 AM</p>
                    <p className="text-[#2563eb] font-semibold">Courtroom Hall 3</p>
                  </div>
                </div>
              </div>
            )}

            {calendarView === 'week' && (
              <div className="space-y-3">
                {[
                  { day: 'Mon', date: 'July 13', title: 'Preparation brief with Adv. Aisha Verma', time: '02:00 PM', type: 'Meeting' },
                  { day: 'Wed', date: 'July 15', title: 'Court Boundary Dispute Trial', time: '10:30 AM', type: 'Court Hearing' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 px-2 py-0.5 rounded uppercase tracking-wider">{item.type}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.day}, {item.date} · {item.time}</p>
                    </div>
                    <button onClick={() => alert('Hearing calendar configuration downloaded to system.')} className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1">
                      <Download size={11} /> Add to Calendar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {calendarView === 'agenda' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Upcoming Calendar deadlines</p>
                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-450">⏰ Deadline: Evidentiary survey files submission</p>
                  <p className="text-[10px] text-rose-500 mt-1">Files must be signed and validated in documents tab by July 14, 2026.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. DOCUMENTS TAB ── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Secure Documents Vault
                </h3>
                <p className="text-xs text-slate-400">Manage, replace, or preview financial eligibility and evidence files.</p>
              </div>

              {/* Upload action button */}
              <button
                onClick={handleDocumentUpload}
                disabled={isUploading}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start"
              >
                <Upload size={14} /> {isUploading ? `Uploading: ${uploadProgress}%` : 'Upload New Document'}
              </button>
            </div>

            {/* Document listings table */}
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>File Size</th>
                    <th>Upload Date</th>
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
                      <td>{doc.size}</td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`badge ${
                          doc.status === 'Approved' ? 'badge-green' : 'badge-amber'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => alert(`Document Preview: ${doc.name}`)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-250 text-xs text-slate-700"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                            className="p-1 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                          >
                            Replace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden h-[540px] flex">
          
          {/* Conversation list column */}
          <div className="w-72 shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Inbox Contacts</p>
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
              
              {/* Lawyer Option */}
              <button
                onClick={() => setActiveChatRecipient('lawyer')}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                  activeChatRecipient === 'lawyer' ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  AV
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Adv. Aisha Verma</p>
                  <p className="text-[10px] text-slate-400 truncate">Please bring the original land deed...</p>
                </div>
              </button>

              {/* Admin Option */}
              <button
                onClick={() => setActiveChatRecipient('admin')}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition ${
                  activeChatRecipient === 'admin' ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-slate-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  SA
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Super Admin Desk</p>
                  <p className="text-[10px] text-slate-400 truncate">Income documentation verified...</p>
                </div>
              </button>

            </div>
          </div>

          {/* Active Chat panel column */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeChatRecipient === 'lawyer' ? 'Adv. Aisha Verma' : 'Super Admin Desk'}
                </h4>
                <p className="text-[9px] text-[#059669] font-bold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" /> Active representation workspace
                </p>
              </div>
            </div>

            {/* Chat message timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-900/10">
              {chatMessages
                .filter(m => m.recipient === activeChatRecipient)
                .map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-150 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
            </div>

            {/* Input send bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-850 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your message..."
                value={typedMessage}
                onChange={e => setTypedMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-800 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                className="btn-primary p-2.5 rounded-xl shrink-0 shadow-sm"
              >
                <Send size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 8. PROFILE & SETTINGS TAB ── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px]">
          
          {/* Profile settings tabs selector (Left 1/4) */}
          <div className="w-full md:w-56 shrink-0 border-r border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-455 uppercase tracking-widest px-3 mb-2">Management</p>
            {[
              { id: 'personal', label: 'Personal Information', icon: User },
              { id: 'security', label: 'Security & Auth', icon: Lock },
              { id: 'preferences', label: 'Settings Preferences', icon: Settings },
              { id: 'feedback', label: 'Lawyer Feedback', icon: Heart },
              { id: 'support', label: 'FAQ & Support', icon: HelpCircle }
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

          {/* Profile Active SubTab Content (Right 3/4) */}
          <div className="flex-1 p-6">
            
            {/* PERSONAL INFO SUBTAB */}
            {profileSubTab === 'personal' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h4>
                  <p className="text-xs text-slate-400">Update registered public aid credentials details.</p>
                </div>

                {/* Picture Avatar upload */}
                <div className="flex items-center gap-4 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-extrabold text-slate-400 text-xl border border-slate-200 dark:border-slate-800">
                    GR
                  </div>
                  <div>
                    <button onClick={() => alert('Avatar upload triggers...')} className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg">Upload Picture</button>
                    <p className="text-[10px] text-slate-400 mt-1">PNG or JPG up to 1MB</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Full Name</label>
                    <input type="text" defaultValue={user?.name || 'Gokul Ram'} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Email address</label>
                    <input type="email" defaultValue={user?.email || 'user@sevenseas.com'} disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Contact Number</label>
                    <input type="text" placeholder="+94 77 123 4567" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Occupation</label>
                    <input type="text" placeholder="e.g. Farmer" className="form-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Resident Address</label>
                    <textarea rows={2} placeholder="Enter your full home address details..." className="form-input resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Emergency Contact Person</label>
                    <input type="text" placeholder="Full name of relation" className="form-input" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfilePercent(100);
                    alert('Success: Personal credentials saved.');
                  }}
                  className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                >
                  Save Profile Info
                </button>
              </div>
            )}

            {/* SECURITY SUBTAB */}
            {profileSubTab === 'security' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & Authentications</h4>
                  <p className="text-xs text-slate-400">Strengthen your dashboard access parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">New Password</label>
                      <input type="password" placeholder="••••••••" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="form-input" />
                    </div>
                  </div>
                </div>

                {/* 2FA block */}
                <div className="flex items-center justify-between p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div>
                    <h5 className="text-xs font-bold">Two-Factor Authentication (2FA)</h5>
                    <p className="text-[10px] text-slate-455 mt-0.5">Prompt for email codes on logins from new browsers.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4.5 w-4.5 text-blue-600 rounded" />
                </div>

                {/* Login audit log */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Access sessions</p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[11px] text-slate-500 space-y-1">
                    <p>🌐 Chrome Browser · Windows PC · Colombo (Active Session)</p>
                    <p>📱 Safari Browser · iOS Device · Kandy (June 28, 2026)</p>
                  </div>
                </div>

                <button onClick={() => alert('Password successfully updated.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Update Security Credentials
                </button>
              </div>
            )}

            {/* PREFERENCES SUBTAB */}
            {profileSubTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Preferences Settings</h4>
                  <p className="text-xs text-slate-400">Configure visual themes and notification channels.</p>
                </div>

                <div className="space-y-4">
                  {/* Theme toggler */}
                  <div className="flex items-center justify-between p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      <h5 className="text-xs font-bold">Enable dark mode theme</h5>
                      <p className="text-[10px] text-slate-455 mt-0.5">Toggle interface elements contrast.</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="text-xs font-bold text-blue-500 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950"
                    >
                      {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                    </button>
                  </div>

                  {/* Language selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Workspace Language</label>
                    <select className="form-input">
                      <option>English (United Kingdom)</option>
                      <option>Sinhala (Sri Lanka)</option>
                      <option>Tamil (Sri Lanka)</option>
                    </select>
                  </div>

                  {/* Alert categories checkboxes */}
                  <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notification Routes</p>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-xs text-slate-700 dark:text-slate-350">Email alerts for upcoming hearings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-xs text-slate-700 dark:text-slate-350">In-app notifications when lawyer posts messages</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => alert('Preferences configurations saved.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save Preferences Setup
                </button>
              </div>
            )}

            {/* FEEDBACK SUBTAB */}
            {profileSubTab === 'feedback' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Counsel Feedback & Suggestion board</h4>
                  <p className="text-xs text-slate-400">Audit the service delivery metrics of assigned legal defenders.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Advocate Aisha Verma representation rating</label>
                    <select className="form-input">
                      <option>⭐⭐⭐⭐⭐ (Highly satisfied)</option>
                      <option>⭐⭐⭐⭐ (Satisfied)</option>
                      <option>⭐⭐⭐ (Average assistance)</option>
                      <option>⭐⭐ (Need improvement)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Submit Portal Suggestions or Complaint files</label>
                    <textarea rows={3} placeholder="Please share suggestions or grievances regarding counsel assignments..." className="form-input resize-none" />
                  </div>
                </div>

                <button
                  onClick={() => alert('Feedback submitted. Thank you for contributing to public aid audits.')}
                  className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                >
                  Submit Suggestions
                </button>
              </div>
            )}

            {/* SUPPORT / FAQ SUBTAB */}
            {profileSubTab === 'support' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Help Desk FAQs & Contact tickets</h4>
                  <p className="text-xs text-slate-400">Quick solutions and administrative ticket creation.</p>
                </div>

                {/* FAQ checklist dropdowns */}
                <div className="space-y-2">
                  {[
                    { q: 'Who qualifies for subsidized legal aid?', a: 'Any registered citizen with monthly household income audited below LKR 50,000 qualifies for free counsel.' },
                    { q: 'How do I download my case details PDF statement?', a: 'Under the "Applications" tab, clicking the Download icon next to any approved case will generate the audited summary statement.' },
                    { q: 'Can I replace uploaded evidentiary certificates?', a: 'Yes, navigate to the "Documents" tab and click the Replace button next to the document in question to upload updated files.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-bold"
                      >
                        <span>Q: {faq.q}</span>
                        <ChevronDown size={14} className={`transform transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {activeFaq === idx && (
                        <div className="p-3.5 bg-white dark:bg-slate-950 text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-900">
                          A: {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Support Ticket form */}
                <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4 max-w-xl">
                  <h5 className="text-xs font-bold">Submit Support query ticket</h5>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                    <input type="text" placeholder="e.g. Assigned counsel scheduling error" className="form-input bg-white dark:bg-slate-950" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                    <textarea rows={2} placeholder="Explain in detail..." className="form-input bg-white dark:bg-slate-950 resize-none" />
                  </div>
                  <button onClick={() => alert('Support ticket registered. Admins will review details within 12 hours.')} className="btn-secondary text-[10px] py-1.5 px-4 rounded-xl">
                    Register Ticket
                  </button>
                </div>

                {/* Critical action area */}
                <div className="pt-6 border-t border-slate-150 dark:border-slate-850 max-w-xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-red-500">Deactivate Account</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Permanently erase your cases history from workspace portal.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('CRITICAL WARNING: Are you sure you want to delete your profile? This action is irreversible.')) {
                        logout();
                        navigate('/');
                      }
                    }}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                  >
                    Delete Account
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 9. APPLICATIONS DETAILS VIEW MODAL ── */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setSelectedApp(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Application Detail File — {selectedApp.id}</h4>
              <p className="text-xs text-slate-450 mt-1">Review validation stages and attach documentation below.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2.5 text-xs">
                <p><strong>Dispute type:</strong> {selectedApp.type}</p>
                <p><strong>Brief description:</strong> {selectedApp.desc || 'Boundary land partition suit'}</p>
                <p><strong>Submission date:</strong> {selectedApp.date}</p>
                {selectedApp.occupation && <p><strong>Occupation:</strong> {selectedApp.occupation}</p>}
                {selectedApp.monthlyIncome !== undefined && <p><strong>Monthly Income:</strong> LKR {selectedApp.monthlyIncome.toLocaleString()}</p>}
                <p><strong>Assigned advocate:</strong> {selectedApp.lawyer}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="font-bold">Verification:</span>
                  <span className={`badge ${
                    selectedApp.verificationStatus === 'Verified' ? 'badge-green' :
                    selectedApp.verificationStatus === 'Rejected' ? 'badge-red' : 'badge-amber'
                  }`}>
                    {selectedApp.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Status Tracker timelines inside detail view */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Milestones Stages</p>
                <div className="space-y-2 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                  {selectedApp.timeline?.map((step, i) => (
                    <div key={i} className="relative">
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ${step.done ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <p className={`text-xs font-bold ${step.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-[9px] text-slate-400">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachment trigger */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Attach Additional Proof Document</label>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealFileUpload} />
                <button type="button" onClick={handleDocumentUpload} disabled={isUploading} className="w-full py-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                  <Upload size={14} /> {isUploading ? `Uploading progress: ${uploadProgress}%` : 'Attach PDF File'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── 10. CASES TRACKING DETAILS MODAL ── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setSelectedCase(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Litigation Case Progress Tracker — {selectedCase.id}</h4>
              <p className="text-xs text-slate-450 mt-1">Review active case milestones progress logs.</p>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2 text-xs">
                <p><strong>Title:</strong> {selectedCase.title}</p>
                <p><strong>Assigned judge:</strong> {selectedCase.judge}</p>
                <p><strong>Court:</strong> {selectedCase.court}</p>
                <p><strong>Representing:</strong> {selectedCase.lawyer}</p>
              </div>

              {/* Case timeline milestones progress */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Milestones Progress</p>
                <div className="space-y-3 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                  {selectedCase.timeline?.map((step, i) => (
                    <div key={i} className="relative">
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ${step.done ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <p className={`text-xs font-bold ${step.done ? 'text-slate-700 dark:text-slate-350' : 'text-slate-400'}`}>{step.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. SUBMIT LEGAL AID MULTI-STEP WIZARD MODAL ── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setShowApplyModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Legal Aid Subsidy Application Wizard</h4>
              <p className="text-xs text-slate-450 mt-1">Complete details to calculate eligibility benchmarks.</p>
            </div>

            {/* Form Step indicators */}
            <div className="flex justify-between items-center max-w-xs mx-auto bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
              {[1, 2, 3].map(step => (
                <span key={step} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  applyStep === step ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}>
                  Step {step}
                </span>
              ))}
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {applyStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                    <input
                      required value={applyForm.fullName}
                      onChange={e => setApplyForm({ ...applyForm, fullName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Date of Birth</label>
                      <input
                        type="date" required value={applyForm.dob}
                        onChange={e => setApplyForm({ ...applyForm, dob: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Gender</label>
                      <select
                        value={applyForm.gender}
                        onChange={e => setApplyForm({ ...applyForm, gender: e.target.value })}
                        className="form-input"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Contact Number</label>
                    <input
                      type="text" required placeholder="+94 77 123 4567"
                      value={applyForm.phone}
                      onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => setApplyStep(2)} className="btn-primary text-xs flex items-center gap-1 font-bold">
                      Next Step <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Occupation</label>
                      <input
                        required value={applyForm.occupation}
                        onChange={e => setApplyForm({ ...applyForm, occupation: e.target.value })}
                        placeholder="e.g. Farmer" className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Monthly Income (LKR)</label>
                      <input
                        type="number" required value={applyForm.monthlyIncome}
                        onChange={e => setApplyForm({ ...applyForm, monthlyIncome: e.target.value })}
                        placeholder="e.g. 25000" className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Case Category</label>
                    <select
                      value={applyForm.caseType}
                      onChange={e => setApplyForm({ ...applyForm, caseType: e.target.value })}
                      className="form-input"
                    >
                      <option>Civil Law</option>
                      <option>Criminal Law</option>
                      <option>Family Law</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Brief summary of legal dispute</label>
                    <textarea
                      required rows={3} value={applyForm.caseDescription}
                      onChange={e => setApplyForm({ ...applyForm, caseDescription: e.target.value })}
                      placeholder="Type boundary details, family disputes context here..."
                      className="form-input resize-none"
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setApplyStep(1)} className="btn-secondary text-xs flex items-center gap-1 font-bold">
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button type="button" onClick={() => setApplyStep(3)} className="btn-primary text-xs flex items-center gap-1 font-bold">
                      Next Step <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {applyStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs space-y-1.5">
                    <p><strong>FullName:</strong> {applyForm.fullName}</p>
                    <p><strong>Dispute specialization:</strong> {applyForm.caseType}</p>
                    <p><strong>Monthly Household Income:</strong> LKR {applyForm.monthlyIncome}</p>
                    <p><strong>Auditable Income proof uploaded:</strong> Identity card verified</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Attach proof of indigency / Income Certificate</label>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealFileUpload} />
                    <button type="button" onClick={handleDocumentUpload} disabled={isUploading} className="w-full py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-xs font-bold">
                      <Upload size={18} className="mb-1" />
                      {isUploading ? `Uploading progress: ${uploadProgress}%` : 'Attach PDF Document'}
                    </button>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setApplyStep(2)} className="btn-secondary text-xs flex items-center gap-1 font-bold">
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button type="submit" className="btn-primary text-xs font-bold">
                      Submit Legal Aid Request
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicantDashboard;
