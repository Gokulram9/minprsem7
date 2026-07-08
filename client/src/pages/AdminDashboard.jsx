import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  Users,
  Scale,
  ShieldAlert,
  FolderOpen,
  Calendar,
  Sparkles,
  FileText,
  BarChart2,
  Settings,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Shield,
  Download,
  AlertTriangle,
  UserX,
  UserPlus,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  MessageSquare,
  Home,
  Activity,
  Info,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  LockKeyhole,
  Cpu,
  FileDown,
  User
} from 'lucide-react';

const AdminDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals & Details Views
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Forms states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', role: 'User', password: 'Password@1234' });
  const [showScheduleHearingModal, setShowScheduleHearingModal] = useState(false);
  const [hearingForm, setHearingForm] = useState({ caseId: '', date: '', time: '', courtroom: 'Courtroom A', judge: 'Justice Shanmugam' });

  // Calendar View state
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'

  // Central System Logs state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'security' | 'database' | 'api'

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

  // Dynamic Lists for Administration Control
  const [applicants, setApplicants] = useState([
    { id: 'USR001', name: 'Priya Nair', email: 'priya@sevenseas.com', phone: '+94 77 123 4567', status: 'Active', date: '2026-06-15', cases: 1 },
    { id: 'USR002', name: 'Arjun Das', email: 'arjun@test.com', phone: '+94 77 987 6543', status: 'Active', date: '2026-06-18', cases: 1 },
    { id: 'USR003', name: 'Meera Singh', email: 'meera@nair.com', phone: '+94 76 555 4321', status: 'Suspended', date: '2026-06-25', cases: 0 },
    { id: 'USR004', name: 'Ravi Kumar', email: 'ravi@gmail.com', phone: '+94 75 111 2222', status: 'Active', date: '2026-06-28', cases: 0 }
  ]);

  const [lawyers, setLawyers] = useState([
    { id: 'LAW201', name: 'Advocate Rajan Kumar', license: 'BC/SL/88219', specialization: 'Criminal Law', experience: 18, rating: 4.9, successRate: 93, status: 'Active', verification: 'Verified', availability: 'High' },
    { id: 'LAW202', name: 'Advocate Aisha Verma', license: 'BC/SL/71629', specialization: 'Family Law', experience: 12, rating: 4.8, successRate: 96, status: 'Active', verification: 'Verified', availability: 'Medium' },
    { id: 'LAW203', name: 'Advocate Nidhi Sharma', license: 'BC/SL/90123', specialization: 'Corporate Law', experience: 8, rating: 4.6, successRate: 86, status: 'Inactive', verification: 'Pending Approval', availability: 'Medium' }
  ]);

  const [applications, setApplications] = useState([
    { id: 'AID501', applicant: 'Priya Nair', income: 'LKR 45,000/mo', occupation: 'Clerk', caseType: 'Civil Law', date: '2026-06-28', status: 'Approved', document: 'NIC_Proof.pdf', verification: 'Verified' },
    { id: 'AID502', applicant: 'Arjun Das', income: 'LKR 28,000/mo', occupation: 'Mechanic', caseType: 'Family Law', date: '2026-06-29', status: 'Under Review', document: 'Income_Certificate.pdf', verification: 'Verified' },
    { id: 'AID503', applicant: 'Meera Singh', income: 'LKR 15,000/mo', occupation: 'Unemployed', caseType: 'Civil Law', date: '2026-06-30', status: 'Submitted', document: 'Termination_Letter.pdf', verification: 'Pending Audit' }
  ]);

  const [cases, setCases] = useState([
    { id: 'CASE801', title: 'Estate Land Boundary Dispute', type: 'Civil Law', judge: 'Justice Shanmugam', lawyer: 'Advocate Aisha Verma', courtroom: 'Courtroom Hall 3', priority: 'High', status: 'Active', nextHearing: '2026-07-15' },
    { id: 'CASE802', title: 'Guardianship Hearing — Das Custody', type: 'Family Law', judge: 'Justice Meera Rajan', lawyer: 'Advocate Rohan Mehta', courtroom: 'Courtroom Hall 1', priority: 'Medium', status: 'Active', nextHearing: '2026-07-22' }
  ]);

  const [hearings, setHearings] = useState([
    { id: 'HR901', caseTitle: 'Estate Land Boundary Dispute', judge: 'Justice Shanmugam', hall: 'Courtroom Hall 3', date: '2026-07-15', time: '10:30 AM', status: 'Scheduled' },
    { id: 'HR902', caseTitle: 'Guardianship Hearing — Das Custody', judge: 'Justice Meera Rajan', hall: 'Courtroom Hall 1', date: '2026-07-22', time: '11:30 AM', status: 'Scheduled' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Aid Submission', body: 'Meera Singh submitted aid request AID503.', time: '10 min ago' },
    { id: 2, title: 'Lawyer Audit Pending', block: 'Nidhi Sharma request verification.', time: '2 hrs ago' }
  ]);

  // AI Matches / Prediction history
  const [aiMatchStats] = useState({
    avgMatchScore: 92,
    mostRecommendedLawyer: 'Advocate Aisha Verma',
    totalRecommendationsToday: 14
  });

  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    minMatchScore: 85,
    experienceWeight: 40,
    successRateWeight: 45,
    distanceWeight: 15,
  });

  // User Actions
  const handleCreateUser = (e) => {
    e.preventDefault();
    const newId = `USR00${applicants.length + 1}`;
    setApplicants([...applicants, {
      id: newId,
      name: createUserForm.name,
      email: createUserForm.email,
      phone: '+94 77 000 0000',
      status: 'Active',
      date: new Date().toISOString().split('T')[0],
      cases: 0
    }]);
    alert(`Success: User ${createUserForm.name} created successfully.`);
    setShowCreateUserModal(false);
    setCreateUserForm({ name: '', email: '', role: 'User', password: 'Password@1234' });
  };

  const handleToggleUserStatus = (userId) => {
    setApplicants(applicants.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        alert(`User ${u.name} status updated to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      setApplicants(applicants.filter(u => u.id !== userId));
      alert('User deleted.');
    }
  };

  // Lawyer approvals actions
  const handleApproveLawyer = (lawyerId) => {
    setLawyers(lawyers.map(l => {
      if (l.id === lawyerId) {
        alert(`Lawyer ${l.name} has been verified and registered.`);
        return { ...l, verification: 'Verified', status: 'Active' };
      }
      return l;
    }));
  };

  const handleRejectLawyer = (lawyerId) => {
    setLawyers(lawyers.map(l => {
      if (l.id === lawyerId) {
        alert(`Lawyer ${l.name} application rejected.`);
        return { ...l, verification: 'Rejected', status: 'Suspended' };
      }
      return l;
    }));
  };

  // Legal Aid controls
  const handleApproveAid = (appId) => {
    setApplications(applications.map(a => {
      if (a.id === appId) {
        alert(`Aid application ${appId} approved.`);
        return { ...a, status: 'Approved' };
      }
      return a;
    }));
  };

  const handleRejectAid = (appId) => {
    setApplications(applications.map(a => {
      if (a.id === appId) {
        alert(`Aid application ${appId} rejected.`);
        return { ...a, status: 'Rejected' };
      }
      return a;
    }));
  };

  // Hearing Scheduler
  const handleScheduleHearingSubmit = (e) => {
    e.preventDefault();
    const newId = `HR${900 + hearings.length + 1}`;
    
    // Simple conflict detection validation check
    const hasConflict = hearings.some(h => h.date === hearingForm.date && h.time === hearingForm.time && h.hall === hearingForm.courtroom);
    if (hasConflict) {
      alert(`⚠️ Conflict Detected: Courtroom Hall ${hearingForm.courtroom} is already booked at ${hearingForm.time} on ${hearingForm.date}!`);
      return;
    }

    const matchedCase = cases.find(c => c.id === hearingForm.caseId);
    setHearings([...hearings, {
      id: newId,
      caseTitle: matchedCase ? matchedCase.title : 'General Litigation File',
      judge: hearingForm.judge,
      hall: hearingForm.courtroom,
      date: hearingForm.date,
      time: hearingForm.time,
      status: 'Scheduled'
    }]);
    alert(`Success: Court Hearing ${newId} scheduled for case ${hearingForm.caseId}.`);
    setShowScheduleHearingModal(false);
    setHearingForm({ caseId: '', date: '', time: '', courtroom: 'Courtroom A', judge: 'Justice Shanmugam' });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP SECTION: WELCOME & META ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 dark:bg-purple-950/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
            👑 SUPER ADMIN SYSTEM CONTROL
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </h2>
          <p className="text-xs text-slate-450 font-bold mt-1">
            Last Login: Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · System Status: Healthy
          </p>
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-3.5 max-w-2xl italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold-500)' }}>
            “Justice is the constant and perpetual will to give to each their due. True governance is built upon the foundation of swift, impartial, and transparent rule of law.”
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{todayDate}</p>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">{currentTime}</p>
        </div>
      </div>

      {/* ── 1. DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in stagger">

          {/* ── QUICK ACTIONS TOOLBAR ── */}
          <div
            className="flex flex-wrap gap-2 p-4 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
          >
            <button
              onClick={() => setShowScheduleHearingModal(true)}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Calendar size={13} /> Schedule Hearing
            </button>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <UserPlus size={13} /> Create User
            </button>
            <button
              onClick={() => navigate('/dashboard/ai-recommend')}
              className="btn-ai btn-sm flex items-center gap-1.5"
            >
              <Sparkles size={13} /> AI Recommendations
            </button>
            <div className="flex-1" />
            <span className="text-[10px] text-[var(--text-muted)] font-medium self-center">
              {new Date().toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
            </span>
          </div>

          {/* ── KPI STAT CARDS ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Active Applicants', value: applicants.length,
                sub: '+2 this week', trend: '+',
                color: '#2563EB', bg: 'rgba(37,99,235,0.08)',
                icon: Users, accentClass: 'card-accent-blue',
              },
              {
                label: 'Verified Advocates', value: lawyers.filter(l => l.verification === 'Verified').length,
                sub: 'Bar Council verified', trend: null,
                color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
                icon: Scale, accentClass: 'card-accent-green',
              },
              {
                label: 'Pending Reviews', value: applications.filter(a => a.status === 'Submitted').length,
                sub: 'Eligibility checks', trend: '!',
                color: '#B69D74', bg: 'rgba(182,157,116,0.10)',
                icon: ShieldAlert, accentClass: 'card-accent-gold',
              },
              {
                label: 'Active Court Cases', value: cases.length,
                sub: 'Ongoing litigations', trend: null,
                color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',
                icon: FolderOpen, accentClass: 'card-accent-purple',
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  key={i} 
                  className={`stat-card glass-card ${stat.accentClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="section-label">{stat.label}</p>
                      <p
                        className="text-[2.2rem] font-black leading-none mt-2 tracking-tight"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: stat.bg, color: stat.color }}
                    >
                      <Icon size={17} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium">{stat.sub}</p>
                    {stat.trend && (
                      <span
                        className="text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: stat.trend === '+' ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
                          color: stat.trend === '+' ? '#16A34A' : '#D97706',
                          border: stat.trend === '+' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)',
                        }}
                      >
                        {stat.trend === '+' ? '↑ Growing' : '⚑ Action'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── CHART + QUEUE ROW ── */}
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Case Distribution Chart */}
            <div
              className="lg:col-span-2 rounded-2xl p-6 space-y-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    Monthly Cases Distribution
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Court utilization by case type · Last 30 days</p>
                </div>
                <span className="badge badge-blue badge-dot">Live</span>
              </div>

              <div className="relative">
                <svg viewBox="0 0 540 130" className="w-full">
                  <defs>
                    <linearGradient id="barCivil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="barFamily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="barCriminal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                    <linearGradient id="barMediation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af70" />
                      <stop offset="100%" stopColor="#b69d74" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[10, 45, 80].map((y, idx) => (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="510" y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                      <text x="40" y={y + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" fontWeight="600">{30 - idx * 12}</text>
                    </g>
                  ))}

                  {/* Bars */}
                  {[
                    { x: 80,  h: 70, color: 'url(#barCivil)',     textCol: '#2563EB', label: 'Civil',    val: 28, labelX: 95  },
                    { x: 190, h: 50, color: 'url(#barFamily)',    textCol: '#16A34A', label: 'Family',   val: 19, labelX: 205 },
                    { x: 300, h: 80, color: 'url(#barCriminal)',  textCol: '#7C3AED', label: 'Criminal', val: 31, labelX: 315 },
                    { x: 410, h: 55, color: 'url(#barMediation)', textCol: '#B69D74', label: 'Mediation',val: 21, labelX: 425 },
                  ].map((bar, i) => (
                    <g key={i}>
                      {/* Shadow */}
                      <rect x={bar.x + 2} y={89 - bar.h + 3} width="34" height={bar.h + 5} rx="5" fill={bar.textCol} opacity="0.08" />
                      {/* Bar */}
                      <rect x={bar.x} y={89 - bar.h} width="34" height={bar.h} rx="5" fill={bar.color} opacity="0.85" />
                      {/* Top highlight */}
                      <rect x={bar.x} y={89 - bar.h} width="34" height="4" rx="2" fill="white" opacity="0.15" />
                      {/* Value label */}
                      <text x={bar.labelX} y={82 - bar.h} textAnchor="middle" fontSize="9" fill={bar.color} fontWeight="800">{bar.val}</text>
                      {/* X Label */}
                      <text x={bar.labelX} y="120" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="600">{bar.label}</text>
                    </g>
                  ))}

                  {/* Baseline */}
                  <line x1="50" y1="90" x2="510" y2="90" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: 'Civil Disputes', color: '#2563EB' },
                  { label: 'Family Law',     color: '#16A34A' },
                  { label: 'Criminal',       color: '#7C3AED' },
                  { label: 'Mediation',      color: '#B69D74' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Awaiting Audits Queue */}
            <div
              className="rounded-2xl p-5 flex flex-col"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Awaiting Audits</h3>
                <span className="badge badge-gold">{applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length} Pending</span>
              </div>

              <div className="space-y-2 flex-1">
                {applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').map(app => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-app)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    onClick={() => { setSelectedApplication(app); navigate('/dashboard/applications'); }}
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #1A2236, #2d3a55)' }}>
                      {app.applicant.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{app.applicant}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{app.caseType} · {app.income}</p>
                    </div>
                    <span
                      className={`badge text-[8.5px] shrink-0 ${app.status === 'Submitted' ? 'badge-gold' : 'badge-blue'}`}
                    >
                      {app.status === 'Submitted' ? 'New' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard/applications')}
                className="btn-secondary btn-sm w-full justify-center mt-3"
              >
                View All Applications
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 2. USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Citizen Users Directory
              </h3>
              <p className="text-xs text-slate-400">Suspend, reset passwords, or create new applicant accounts.</p>
            </div>
            
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <UserPlus size={15} /> Create User Account
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered Date</th>
                    <th>Account status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants
                    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id}>
                        <td><span className="font-mono font-bold text-xs">{item.id}</span></td>
                        <td className="font-bold">{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{item.date}</td>
                        <td>
                          <span className={`badge ${
                            item.status === 'Active' ? 'badge-green' : 'badge-red'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => {
                                handleToggleUserStatus(item.id);
                              }}
                              className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                              title="Toggle Suspend"
                            >
                              {item.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button
                              onClick={() => {
                                const newPw = prompt(`Enter new password for ${item.name}:`);
                                if (newPw) alert('Password updated successfully.');
                              }}
                              className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                              title="Reset Password"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              className="p-1 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                              title="Delete User"
                            >
                              Delete
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

      {/* ── 3. LAWYERS TAB ── */}
      {activeTab === 'lawyers' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Lawyers Registry & Licensures
            </h3>
            <p className="text-xs text-slate-400">Approve registrations, audit bar licensures, evaluate performance.</p>
          </div>

          <table className="premium-table">
            <thead>
              <tr>
                <th>Lawyer ID</th>
                <th>Advocate Name</th>
                <th>License Number</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Win Rate</th>
                <th>Verification</th>
                <th className="text-right">Licensures Actions</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lawyer) => (
                <tr key={lawyer.id}>
                  <td><span className="font-mono text-xs">{lawyer.id}</span></td>
                  <td className="font-bold">{lawyer.name}</td>
                  <td>{lawyer.license}</td>
                  <td>{lawyer.specialization}</td>
                  <td>{lawyer.experience} Years</td>
                  <td className="font-bold text-[#059669]">{lawyer.successRate}% Wins</td>
                  <td>
                    <span className={`badge ${
                      lawyer.verification === 'Verified' ? 'badge-green' : 'badge-amber'
                    }`}>
                      {lawyer.verification}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      {lawyer.verification === 'Pending Approval' && (
                        <>
                          <button onClick={() => handleApproveLawyer(lawyer.id)} className="p-1.5 rounded bg-emerald-50 text-emerald-600 text-xs hover:bg-emerald-100 font-bold">Approve</button>
                          <button onClick={() => handleRejectLawyer(lawyer.id)} className="p-1.5 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100 font-bold">Reject</button>
                        </>
                      )}
                      <button onClick={() => alert(`Advocate Profile details: Bar registration BC/SL-${lawyer.license}`)} className="p-1 rounded bg-slate-100 text-slate-700 text-xs hover:bg-slate-200">
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 4. CASES TAB ── */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Judicial Cases Management Center
            </h3>
            <p className="text-xs text-slate-400">Assign judges, courtroom halls, and attorneys to active trials.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Docket ID</th>
                  <th>Case Title</th>
                  <th>Category</th>
                  <th>Presiding Judge</th>
                  <th>Representing Attorney</th>
                  <th>Courtroom Hall</th>
                  <th>Hearing Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-xs">{c.id}</span></td>
                    <td className="font-bold">{c.title}</td>
                    <td>{c.type}</td>
                    <td>{c.judge}</td>
                    <td className="font-semibold text-blue-600 dark:text-blue-400">{c.lawyer}</td>
                    <td>{c.courtroom}</td>
                    <td>{c.nextHearing}</td>
                    <td>
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            const judge = prompt('Assign Presiding Judge:');
                            if (judge) setCases(cases.map(item => item.id === c.id ? { ...item, judge: `Justice ${judge}` } : item));
                          }}
                          className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-250"
                        >
                          Assign Judge
                        </button>
                        <button
                          onClick={() => {
                            const lawyer = prompt('Assign Representing Advocate:');
                            if (lawyer) setCases(cases.map(item => item.id === c.id ? { ...item, lawyer: `Adv. ${lawyer}` } : item));
                          }}
                          className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-250"
                        >
                          Assign Lawyer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. HEARINGS (SCHEDULING) TAB ── */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Interactive Court Calendar & Hearings Tracker
                </h3>
                <p className="text-xs text-slate-400">Schedule new hearings, assign court halls, and resolve timing conflicts.</p>
              </div>

              <button
                onClick={() => setShowScheduleHearingModal(true)}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start"
              >
                <Plus size={14} /> Schedule Court Hearing
              </button>
            </div>

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
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">Property Partition suit trial</h4>
                  <p className="text-[10px] text-slate-450 mt-1">Courtroom Hall 3 · District Court</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Judge Shanmugam · Priya Nair</p>
                </div>
                <div className="pt-3 border-t border-slate-200 mt-4 text-[10px] text-slate-450">
                  <p><strong>Time:</strong> 10:30 AM</p>
                  <p><strong>Reminder Status:</strong> Tomorrow check complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. LEGAL AID (APPLICATIONS) TAB ── */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Legal Aid Applications Verification Desk
            </h3>
            <p className="text-xs text-slate-400">Validate applicant income certificates and approve counsel allocations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Applicant Name</th>
                  <th>Reported Income</th>
                  <th>Occupation</th>
                  <th>Specialization Category</th>
                  <th>Attachment proof</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td><span className="font-mono text-xs">{app.id}</span></td>
                    <td className="font-bold">{app.applicant}</td>
                    <td>{app.income}</td>
                    <td>{app.occupation}</td>
                    <td>{app.caseType}</td>
                    <td className="font-semibold text-blue-600 dark:text-blue-400">
                      <button onClick={() => alert(`Opening document preview for file: ${app.document}`)} className="hover:underline flex items-center gap-1.5 text-xs font-bold">
                        <FileText size={12} /> {app.document}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${
                        app.status === 'Approved' ? 'badge-green' :
                        app.status === 'Submitted' ? 'badge-slate' : 'badge-amber'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        {app.status === 'Submitted' || app.status === 'Under Review' ? (
                          <>
                            <button onClick={() => handleApproveAid(app.id)} className="p-1 rounded bg-emerald-50 text-emerald-600 text-xs hover:bg-emerald-100 font-bold">Approve</button>
                            <button onClick={() => handleRejectAid(app.id)} className="p-1 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100 font-bold">Reject</button>
                          </>
                        ) : (
                          <button onClick={() => alert('Application already verified.')} disabled className="p-1 text-slate-400 text-xs">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. AI ASSISTANT TAB ── */}
      {activeTab === 'ai-recommend' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Centralized AI Recommendation & Matching Analytics
              </h3>
              <p className="text-xs text-slate-400">Configure weighting values for matching algorithm and view stats logs.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Average Match Score</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{aiMatchStats.avgMatchScore}% Accuracy</p>
              </div>
              
              <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Most Recommended Lawyer</p>
                <p className="text-2xl font-black text-[#2563eb]">{aiMatchStats.mostRecommendedLawyer}</p>
              </div>

              <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Calculations Executed Today</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{aiMatchStats.totalRecommendationsToday} Matches</p>
              </div>
            </div>

            {/* Weights config */}
            <div className="p-5 border border-slate-150 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Algorithmic Match Weight Settings</h4>
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Advocate Experience (Years) Weight</label>
                  <input
                    type="number"
                    value={aiSettings.experienceWeight}
                    onChange={e => setAiSettings({ ...aiSettings, experienceWeight: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Advocate Success (Win rate) Weight</label>
                  <input
                    type="number"
                    value={aiSettings.successRateWeight}
                    onChange={e => setAiSettings({ ...aiSettings, successRateWeight: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1.5">Distance Location Index Weight</label>
                  <input
                    type="number"
                    value={aiSettings.distanceWeight}
                    onChange={e => setAiSettings({ ...aiSettings, distanceWeight: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>
              <button
                onClick={() => alert('Matching weight matrices updated in MongoDB parameters.')}
                className="btn-primary text-xs py-2 px-5 rounded-xl font-bold"
              >
                Save Weight Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. REPORTS & ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header section with Purple Icon and Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#7c3aed] text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-500/10 shrink-0">
                <BarChart2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#7c3aed] dark:text-[#a78bfa] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Analytics Intelligence
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Strategic insights across your organizational workflows
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Refreshing platform diagnostic telemetry...')}
              className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-purple-500/10 active:scale-95 transition-all self-start sm:self-auto"
            >
              <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>Refresh Diagnostics</span>
            </button>
          </div>

          {/* Core charts grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Daily Operational Activity (Wave Chart) */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📈</span> Daily Operational Activity
                </h4>
                <span className="text-[9px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 px-2.5 py-1 rounded-md tracking-wider">
                  LATEST 7 CYCLES
                </span>
              </div>

              {/* Advanced Wave SVG Area Chart */}
              <div className="relative pt-4">
                <svg viewBox="0 0 500 200" className="w-full">
                  {/* Grid Lines */}
                  {[0, 2, 4, 6, 8, 10, 12].map((yVal) => {
                    const yPos = 170 - (yVal * 12);
                    return (
                      <g key={yVal} className="opacity-40">
                        <line x1="40" y1={yPos} x2="480" y2={yPos} stroke="var(--border-color, #e2e8f0)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <text x="25" y={yPos + 3} className="text-[9px] fill-slate-400 font-bold" textAnchor="end">{yVal}</text>
                      </g>
                    );
                  })}

                  {/* Smooth Wave Area Gradient */}
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-brand-primary, #2563EB)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-brand-primary, #2563EB)" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Filled Area below Wave */}
                  <path
                    d="M 40,50 C 100,30 150,150 200,120 C 250,90 300,130 350,110 C 400,90 440,110 480,90 L 480,170 L 40,170 Z"
                    fill="url(#waveGrad)"
                  />

                  {/* Main Smooth Wave Line */}
                  <path
                    d="M 40,50 C 100,30 150,150 200,120 C 250,90 300,130 350,110 C 400,90 440,110 480,90"
                    fill="none"
                    stroke="var(--color-brand-primary, #2563EB)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                  />

                  {/* Circle nodes at data points with value labels */}
                  {[
                    { x: 40, y: 50, val: 10 },
                    { x: 113, y: 30, val: 12 },
                    { x: 186, y: 150, val: 2 },
                    { x: 259, y: 120, val: 4 },
                    { x: 332, y: 90, val: 7 },
                    { x: 405, y: 110, val: 5 },
                    { x: 480, y: 90, val: 7 }
                  ].map((pt, idx) => (
                    <g key={idx}>
                      {/* Outer pulse glow */}
                      <circle cx={pt.x} cy={pt.y} r="6" fill="#3b82f6" opacity="0.35" />
                      {/* Inner solid circle */}
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
                      {/* Floating case count value tag */}
                      <text x={pt.x} y={pt.y - 7} textAnchor="middle" className="text-[8px] fill-blue-600 dark:fill-blue-400 font-extrabold">
                        {pt.val}
                      </text>
                    </g>
                  ))}

                  {/* Custom grid X labels */}
                  {[
                    { label: 'Fri', x: 40 },
                    { label: 'Sat', x: 113 },
                    { label: 'Sun', x: 186 },
                    { label: 'Mon', x: 259 },
                    { label: 'Tue', x: 332 },
                    { label: 'Wed', x: 405 },
                    { label: 'Thu', x: 480 }
                  ].map((lbl, idx) => (
                    <text key={idx} x={lbl.x} y="190" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">
                      {lbl.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Task Distribution (Donut Chart) */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📋</span> Task Distribution
              </h4>

              {/* Donut Chart SVG */}
              <div className="flex justify-center items-center py-6 relative">
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  {/* Segment Grey (Backlog): 12% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#94a3b8" strokeWidth="9" strokeDasharray="28 240" strokeDashoffset="0" />
                  
                  {/* Segment Orange (Processing): 18% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="9" strokeDasharray="42 240" strokeDashoffset="-28" />

                  {/* Segment Blue (In Review): 25% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="9" strokeDasharray="60 240" strokeDashoffset="-70" />

                  {/* Segment Green (Completed): 45% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="9" strokeDasharray="110 240" strokeDashoffset="-130" />
                </svg>
              </div>

              {/* Color legend metrics */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold border-t pt-4">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                  <span>Backlog</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  <span>Processing</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  <span>In Review</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span>Completed</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom row: Resource Priority & Workflow momentum + logins card */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Resource Priority (Vertical Bar charts) */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎯</span> Resource Priority
              </h4>
              
              <div className="flex items-end justify-around h-32 pt-4 border-b pb-1">
                {[
                  { label: 'L1 (High)', val: 75, color: '#B69D74' },
                  { label: 'L2 (Med)', val: 40, color: '#3b82f6' },
                  { label: 'L3 (Low)', val: 90, color: '#16a34a' }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-1/3 relative group">
                    <span className="text-[8px] font-extrabold text-[#1F2839] dark:text-slate-350 mb-0.5">{bar.val}%</span>
                    <div className="w-6 rounded-t-lg transition-all hover:scale-110" style={{ height: `${bar.val * 0.8}px`, backgroundColor: bar.color }} />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Momentum */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm md:col-span-2 flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden">
              <div className="flex-1 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚀</span> Workflow Momentum
                </h4>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>Case Application Verification</span>
                      <span className="text-blue-500">84%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>AI Advocate Matching Ratio</span>
                      <span className="text-[#B69D74]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-[#B69D74] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>Court Hearing Scheduling</span>
                      <span className="text-emerald-500">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient card DAILY LOGINS with Sparkle Overlay */}
              <div className="w-full md:w-60 bg-gradient-to-tr from-[#6366f1] via-[#4f46e5] to-[#7c3aed] text-white p-5 rounded-2xl flex flex-col justify-between relative shadow-lg">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-indigo-200 uppercase">TELEMETRY</span>
                  <h4 className="text-lg font-black mt-1" style={{ fontFamily: 'var(--font-display)' }}>DAILY LOGINS</h4>
                </div>
                
                <div className="flex items-baseline gap-1.5 mt-4">
                  <p className="text-3xl font-black">142</p>
                  <span className="text-[10px] text-emerald-300 font-bold">↑ 12% today</span>
                </div>

                {/* Violet floating star overlay button */}
                <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-95">
                  <Sparkles size={16} className="text-indigo-100" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── 9. PROFILE & SECURITY TAB ── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px]">
          
          <div className="w-full md:w-56 shrink-0 border-r bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-455 uppercase tracking-widest px-3 mb-2">Workspace settings</p>
            {[
              { id: 'personal', label: 'Office Profile', icon: User },
              { id: 'security', label: 'Security & Auth', icon: Lock },
              { id: 'database', label: 'Database Backup', icon: Database },
              { id: 'api', label: 'API & Maintenance', icon: Cpu }
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
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admin Profile details</h4>
                  <p className="text-xs text-slate-400">Office credentials configuration.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Legal Name</label>
                    <input type="text" defaultValue="Super Administrator Desk" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Role level</label>
                    <input type="text" defaultValue="Super Admin" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Office Email</label>
                    <input type="text" defaultValue="gokulrams.cs23@bitsathy.ac.in" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>

                <button onClick={() => alert('Profile credentials updated.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save Profile Info
                </button>
              </div>
            )}

            {profileSubTab === 'security' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & 2FA controls</h4>
                  <p className="text-xs text-slate-400">Configure password updates and safety parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Current password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">New password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                </div>

                <button onClick={() => alert('Password updated successfully.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save security credentials
                </button>
              </div>
            )}

            {profileSubTab === 'database' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Database Backup & Restores</h4>
                  <p className="text-xs text-slate-400">Download Mongo dump files or schedule automated backups.</p>
                </div>

                <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Backup Mongo Database</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Creates a zipped JSON export file of all collections.</p>
                  </div>
                  <button onClick={() => alert('Creating dump file... Zipped JSON export successfully downloaded to system.')} className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1">
                    <Database size={12} /> Backup now
                  </button>
                </div>
              </div>
            )}

            {profileSubTab === 'api' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">API settings & Maintenance Mode</h4>
                  <p className="text-xs text-slate-400">Toggle public visibility parameters and configure API keys.</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <p className="text-xs font-bold">Activate Maintenance Mode</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">If active, redirects citizens to public advisory pages.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      alert(`Maintenance Mode updated: ${!maintenanceMode ? 'Active' : 'Inactive'}`);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                      maintenanceMode ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {maintenanceMode ? 'Mode Active' : 'Mode Inactive'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 10. CREATE USER ACCOUNT MODAL ── */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setShowCreateUserModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h4>
              <p className="text-xs text-slate-450 mt-1">Register a citizen user directly inside the database.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text" required
                  value={createUserForm.name}
                  onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  placeholder="e.g. Priya Nair" className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email address</label>
                <input
                  type="email" required
                  value={createUserForm.email}
                  onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  placeholder="e.g. user@sevenseas.com" className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Initial password</label>
                <input
                  type="password" required
                  value={createUserForm.password}
                  onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 rounded-xl font-bold justify-center">
                Register Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 11. SCHEDULE COURT HEARING MODAL ── */}
      {showScheduleHearingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setShowScheduleHearingModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Schedule Court Hearing</h4>
              <p className="text-xs text-slate-455 mt-1">Assign courtroom halls, timing, and presiding judges.</p>
            </div>

            <form onSubmit={handleScheduleHearingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Select Case Docket</label>
                <select
                  value={hearingForm.caseId}
                  onChange={e => setHearingForm({ ...hearingForm, caseId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Case Docket --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Hearing Date</label>
                  <input
                    type="date" required
                    value={hearingForm.date}
                    onChange={e => setHearingForm({ ...hearingForm, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Hearing Time</label>
                  <input
                    type="time" required
                    value={hearingForm.time}
                    onChange={e => setHearingForm({ ...hearingForm, time: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Courtroom Hall</label>
                  <select
                    value={hearingForm.courtroom}
                    onChange={e => setHearingForm({ ...hearingForm, courtroom: e.target.value })}
                    className="form-input"
                  >
                    <option>Courtroom Hall 1</option>
                    <option>Courtroom Hall 2</option>
                    <option>Courtroom Hall 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Presiding Judge</label>
                  <select
                    value={hearingForm.judge}
                    onChange={e => setHearingForm({ ...hearingForm, judge: e.target.value })}
                    className="form-input"
                  >
                    <option>Justice Shanmugam</option>
                    <option>Justice Meera Rajan</option>
                    <option>Justice Dilan Perera</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 rounded-xl font-bold justify-center shadow-md">
                Schedule Hearing Slot
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
