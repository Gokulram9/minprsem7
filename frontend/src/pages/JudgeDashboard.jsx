import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import judgeApi from '../api/judgeApi';
import {
  Scale,
  Calendar,
  FolderOpen,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  RefreshCw,
  User,
  Users,
  Building,
  FileSpreadsheet,
  Download,
  Lock,
  MessageSquare,
  ChevronRight,
  Filter,
  CheckSquare,
  ArrowRightLeft,
  Sparkles,
  Gavel
} from 'lucide-react';

const JudgeDashboard = ({ activeTab = 'dashboard' }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats & Core Data
  const [stats, setStats] = useState({
    totalAssignedCases: 0,
    activeCases: 0,
    todaysHearingsCount: 0,
    upcomingHearingsCount: 0,
    pendingReportsCount: 0,
    pendingInvestigationsCount: 0,
    awaitingJudgmentCount: 0,
    adjournedHearingsCount: 0,
    transferredCasesCount: 0
  });
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [judgeProfile, setJudgeProfile] = useState(null);

  // Filters & Search for Cases
  const [caseSearch, setCaseSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals & Details Views
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeCaseWorkspaceTab, setActiveCaseWorkspaceTab] = useState('overview'); // overview | parties | progress | hearings | documents | investigations | reports | transfer | confidential
  
  // Conflict Detection Dialog State
  const [conflictData, setConflictData] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    caseId: '',
    hearingDate: '',
    timeSlot: '10:00 AM',
    courtroom: 'Courtroom A',
    purpose: 'Trial Hearing'
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Hearing Action Modals
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    proceedingsSummary: '',
    outcome: 'Adjourned for Further Evidence',
    directions: '',
    nextHearingDate: '',
    confidentialJudicialNotes: ''
  });

  // Investigation Request Modal
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investForm, setInvestForm] = useState({ remarks: '', assignedTo: 'Court Investigation Division' });

  // Case Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ toCourt: 'High Court Commercial Division', reason: '' });

  // Judgment Recording Modal
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [judgmentForm, setJudgmentForm] = useState({ decision: 'Petition Allowed', summary: '', documentUrl: '', closeCase: true });

  // Confidential Note State
  const [confidentialNoteText, setConfidentialNoteText] = useState('');

  // Calendar View
  const [calendarView, setCalendarView] = useState('month');

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ── Data Fetching ──
  const fetchJudgeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, casesRes, hearingsRes, profileRes] = await Promise.allSettled([
        judgeApi.getJudgeStats(),
        judgeApi.getJudgeCases(),
        judgeApi.getJudgeHearings(),
        judgeApi.getJudgeProfile()
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});
      if (casesRes.status === 'fulfilled') setCases(casesRes.value.data || []);
      if (hearingsRes.status === 'fulfilled') setHearings(hearingsRes.value.data || []);
      if (profileRes.status === 'fulfilled') setJudgeProfile(profileRes.value.data || null);
    } catch (err) {
      console.error('Error fetching judge dashboard:', err);
      setError('Failed to sync judge data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgeData();
  }, [activeTab]);

  // Fetch full details when opening a case workspace
  const handleOpenWorkspace = async (caseId) => {
    try {
      const res = await judgeApi.getJudgeCaseById(caseId);
      setSelectedCase(res.data);
      setActiveCaseWorkspaceTab('overview');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open case workspace');
    }
  };

  // Schedule Hearing Handler with Conflict Detection
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setConflictData(null);
    try {
      setSubmittingSchedule(true);
      await judgeApi.scheduleHearing(scheduleForm);
      alert('Hearing scheduled successfully!');
      setShowScheduleModal(false);
      setScheduleForm({ caseId: '', hearingDate: '', timeSlot: '10:00 AM', courtroom: 'Courtroom A', purpose: 'Trial Hearing' });
      fetchJudgeData();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        setConflictData(err.response.data.conflict);
      } else {
        alert(err.response?.data?.message || 'Failed to schedule hearing');
      }
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Hearing Report Submit Handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHearing?._id) return;
    try {
      await judgeApi.submitHearingReport(selectedHearing._id, reportForm);
      alert('Hearing proceedings report saved.');
      setShowReportModal(false);
      setSelectedHearing(null);
      fetchJudgeData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save report');
    }
  };

  // Investigation Request Handler
  const handleInvestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase?._id) return;
    try {
      await judgeApi.requestInvestigation(selectedCase._id, investForm);
      alert('Investigation order issued.');
      setShowInvestModal(false);
      handleOpenWorkspace(selectedCase._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue investigation order');
    }
  };

  // Case Transfer Request Handler
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase?._id) return;
    try {
      await judgeApi.requestCaseTransfer(selectedCase._id, transferForm);
      alert('Case transfer request submitted.');
      setShowTransferModal(false);
      handleOpenWorkspace(selectedCase._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit transfer request');
    }
  };

  // Judgment Recording Handler
  const handleJudgmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase?._id) return;
    try {
      await judgeApi.recordJudgment(selectedCase._id, judgmentForm);
      alert('Judgment pronounced and recorded.');
      setShowJudgmentModal(false);
      handleOpenWorkspace(selectedCase._id);
      fetchJudgeData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record judgment');
    }
  };

  // Add Confidential Judicial Note Handler
  const handleAddConfidentialNote = async (e) => {
    e.preventDefault();
    if (!confidentialNoteText.trim() || !selectedCase?._id) return;
    try {
      await judgeApi.addConfidentialNote(selectedCase._id, confidentialNoteText.trim());
      setConfidentialNoteText('');
      handleOpenWorkspace(selectedCase._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record confidential note');
    }
  };

  // Filtered cases list
  const filteredCases = cases.filter(c => {
    const matchesSearch = !caseSearch ||
      c.caseId?.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.caseTitle?.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.applicant?.name?.toLowerCase().includes(caseSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesType = typeFilter === 'All' || c.caseType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const judgeTitle = user?.name ? `Hon. Justice ${user.name}` : 'Hon. Presiding Magistrate';
  const courtName = judgeProfile?.courtName || 'High Court of Sri Lanka (District Chambers)';

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP BANNER: JUDICIAL BENCH WELCOME ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-600/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            <Gavel size={12} /> JUDICIAL CHAMBERS & BENCH
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
            {judgeTitle}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Assigned Venue: {courtName} · Jurisdiction: {judgeProfile?.jurisdiction || 'Western Province Jurisdiction'}
          </p>
          <p className="text-xs font-serif italic text-slate-500 dark:text-slate-400 mt-2.5 max-w-2xl leading-relaxed">
            “Which cases and hearings require my attention, and what actions must I complete?”
          </p>
        </div>
        <div className="text-left md:text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{todayDate}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{currentTime}</p>
          </div>
          <button 
            onClick={fetchJudgeData}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-500 font-bold mt-1"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Docket
          </button>
        </div>
      </div>

      {loading && cases.length === 0 && (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm font-semibold">Loading Judicial Docket & Calendar...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── 1. DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/dashboard/todays-hearings')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-100">Courtroom Bench</p>
                <p className="text-sm font-black mt-1">Today's Hearings ({stats.todaysHearingsCount})</p>
              </div>
              <Gavel size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Hearing Calendar</p>
                <p className="text-sm font-black mt-1">Schedule Trial Session</p>
              </div>
              <Calendar size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>

            <button
              onClick={() => navigate('/dashboard/judgments')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white hover:scale-[1.02] transition shadow-md"
            >
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Judicial Decisions</p>
                <p className="text-sm font-black mt-1">Cases Awaiting Judgment ({stats.awaitingJudgmentCount})</p>
              </div>
              <Scale size={20} className="text-white bg-white/20 p-1 rounded-full shrink-0" />
            </button>
          </div>

          {/* Stats Matrix Grid (8 Metrics) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            <motion.div whileHover={{ y: -3 }} className="card card-accent-purple p-4 glass-card flex flex-col justify-between h-24">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Docket Cases</p>
                  <p className="text-2xl font-black mt-1">{stats.totalAssignedCases}</p>
                </div>
                <FolderOpen size={16} className="text-purple-500" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Under judicial management</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="card card-accent-blue p-4 glass-card flex flex-col justify-between h-24">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Active Proceedings</p>
                  <p className="text-2xl font-black mt-1 text-blue-600">{stats.activeCases}</p>
                </div>
                <Scale size={16} className="text-blue-500" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Currently in litigation</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="card card-accent-gold p-4 glass-card flex flex-col justify-between h-24">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Today's Hearing Schedule</p>
                  <p className="text-2xl font-black mt-1 text-amber-600">{stats.todaysHearingsCount}</p>
                </div>
                <Calendar size={16} className="text-amber-500" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Sessions listed today</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="card card-accent-green p-4 glass-card flex flex-col justify-between h-24">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Investigations</p>
                  <p className="text-2xl font-black mt-1 text-emerald-600">{stats.pendingInvestigationsCount}</p>
                </div>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Awaiting field audit reports</p>
            </motion.div>

          </div>

          {/* Core Sections Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left Column: Today's Hearings & Pending Reports */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Hearing Schedule */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Today's Hearing List ({hearings.filter(h => new Date(h.hearingDate).toDateString() === new Date().toDateString()).length})
                  </h3>
                  <button onClick={() => navigate('/dashboard/schedule')} className="text-xs text-purple-600 font-bold hover:underline">
                    View Full Calendar →
                  </button>
                </div>

                {hearings.filter(h => new Date(h.hearingDate).toDateString() === new Date().toDateString()).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No hearings scheduled on your bench today.</p>
                ) : (
                  <div className="space-y-3">
                    {hearings
                      .filter(h => new Date(h.hearingDate).toDateString() === new Date().toDateString())
                      .map((h, i) => (
                        <div key={h._id || i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">
                              Hearing #{h.hearingNumber || i + 1} · {h.timeSlot || '10:00 AM'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{h.application?.caseTitle || 'Trial Proceeding'}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Ref: {h.application?.caseId} · Venue: {h.courtroom || 'Courtroom A'} · Purpose: {h.purpose}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedHearing(h);
                                setReportForm({ ...reportForm, proceedingsSummary: h.report?.proceedingsSummary || '' });
                                setShowReportModal(true);
                              }}
                              className="btn-primary bg-purple-600 hover:bg-purple-500 text-xs py-1.5 px-3 rounded-lg font-bold"
                            >
                              Record Proceedings
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Pending Investigation Audit Reports */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Active Investigation Orders ({cases.filter(c => c.investigation?.status && c.investigation?.status !== 'None').length})
                </h3>

                {cases.filter(c => c.investigation?.status && c.investigation?.status !== 'None').length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No pending investigation reports requiring review.</p>
                ) : (
                  <div className="space-y-3">
                    {cases
                      .filter(c => c.investigation?.status && c.investigation?.status !== 'None')
                      .map((c) => (
                        <div key={c._id} className="p-4 border rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{c.caseTitle}</span>
                              <span className="badge badge-amber text-[9px] uppercase">{c.investigation?.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Ref: {c.caseId} · Assigned: {c.investigation?.assignedTo || 'Court Auditor'}
                            </p>
                          </div>
                          <button onClick={() => handleOpenWorkspace(c._id)} className="btn-secondary text-xs py-1.5 px-3 rounded-lg font-bold">
                            Review Workspace
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Urgent Action Notifications & Judicial Notes */}
            <div className="space-y-6">
              
              {/* Judicial Actions Alert */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Judicial Bench Checklist</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-xl">
                    <p className="font-bold text-purple-800 dark:text-purple-300">Pending Hearing Reports</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stats.pendingReportsCount} completed hearings require proceedings notes.</p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Cases Awaiting Judgment</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stats.awaitingJudgmentCount} trials ready for final decree.</p>
                  </div>
                </div>
              </div>

              {/* Bench Profile Card */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3 text-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Chambers Authorization</h3>
                <div className="space-y-2">
                  <p><strong>Designation:</strong> {judgeProfile?.designation || 'Presiding Justice'}</p>
                  <p><strong>Bench Reg No:</strong> {judgeProfile?.registrationNumber || 'JDG-8821'}</p>
                  <p><strong>Court Hall:</strong> {judgeProfile?.courtroom || 'Courtroom Hall 1'}</p>
                  <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">{judgeProfile?.status || 'Active'}</span></p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 2. MY CASES TAB ── */}
      {activeTab === 'assigned-cases' || activeTab === 'cases' || activeTab === 'my-cases' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Judicial Docket — Assigned Cases ({filteredCases.length})
              </h3>
              <p className="text-xs text-slate-400">Cases assigned under your judicial jurisdiction and authorization scope.</p>
            </div>

            <button onClick={() => setShowScheduleModal(true)} className="btn-primary bg-purple-600 hover:bg-purple-500 text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold self-start">
              <Plus size={14} /> Schedule Trial Hearing
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Case ID, title, or applicant name..."
                value={caseSearch}
                onChange={e => setCaseSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none text-slate-800 dark:text-white"
              />
            </div>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input text-xs sm:w-44">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="CourtScheduled">Court Scheduled</option>
              <option value="Hearing">Hearing</option>
              <option value="Investigation">Investigation</option>
              <option value="Judgment">Judgment</option>
              <option value="Completed">Completed</option>
            </select>

            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input text-xs sm:w-44">
              <option value="All">All Case Types</option>
              <option value="Civil Law">Civil Law</option>
              <option value="Family Law">Family Law</option>
              <option value="Property Law">Property Law</option>
              <option value="Criminal Law">Criminal Law</option>
            </select>
          </div>

          {/* Cases List */}
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <FolderOpen size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Authorized Cases Found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredCases.map((c) => (
                <div key={c._id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`badge ${c.urgency === 'High' ? 'badge-red' : 'badge-slate'} uppercase text-[9px]`}>
                          {c.urgency || 'Medium'} Priority
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{c.caseTitle}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{c.caseId} · Type: {c.caseType}</p>
                      </div>
                      <span className={`badge ${c.status === 'Active' ? 'badge-blue' : c.status === 'Judgment' ? 'badge-green' : 'badge-amber'}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <p><strong>Applicant:</strong> {c.applicant?.name || 'N/A'}</p>
                      <p><strong>Counsel:</strong> {c.assignedLawyer?.name || 'Unassigned'}</p>
                      <p><strong>Court:</strong> {c.court || 'District Court'}</p>
                      <p><strong>Location:</strong> {c.location || 'Colombo'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                    <button
                      onClick={() => handleOpenWorkspace(c._id)}
                      className="flex-1 btn-primary bg-purple-600 hover:bg-purple-500 text-xs py-2 justify-center rounded-xl font-bold"
                    >
                      Open Case Workspace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* ── 3. SCHEDULE & HEARINGS CALENDAR TAB ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Judicial Hearing Calendar ({hearings.length})
                </h3>
                <p className="text-xs text-slate-400">View trial dates, reschedule sessions, and manage double-booking conflict checks.</p>
              </div>

              <button onClick={() => setShowScheduleModal(true)} className="btn-primary bg-purple-600 hover:bg-purple-500 text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold self-start">
                <Plus size={14} /> Schedule Trial Hearing
              </button>
            </div>

            {hearings.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No court hearings listed on your calendar.</p>
            ) : (
              <div className="space-y-3">
                {hearings.map((h, i) => (
                  <div key={h._id || i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <span className="badge badge-purple text-[9px] uppercase">Hearing #{h.hearingNumber || i + 1}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-1">{h.application?.caseTitle || 'Court Session'}</h4>
                      <p className="text-slate-400 mt-0.5">
                        Ref: {h.application?.caseId} · Venue: {h.courtroom} · Time: {h.timeSlot}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-bold text-purple-600 dark:text-purple-400 block">
                          {new Date(h.hearingDate).toLocaleDateString()}
                        </span>
                        <span className="badge badge-blue text-[9px] mt-1">{h.status}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedHearing(h);
                          setReportForm({ ...reportForm, proceedingsSummary: h.report?.proceedingsSummary || '' });
                          setShowReportModal(true);
                        }}
                        className="btn-secondary text-[11px] py-1 px-3 rounded-lg font-bold"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. CASE WORKSPACE MODAL (9 SUB-TABS) ── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-3xl w-full space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedCase(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-purple text-[9px] uppercase">{selectedCase.caseId}</span>
                <span className="badge badge-blue text-[9px] uppercase">{selectedCase.status}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedCase.caseTitle}</h4>
              <p className="text-xs text-slate-400">Category: {selectedCase.caseType} · Venue: {selectedCase.court || 'District Court'}</p>
            </div>

            {/* Sub-tabs header */}
            <div className="flex gap-1.5 border-b overflow-x-auto pb-1 text-xs font-bold shrink-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'parties', label: 'Parties & Counsel' },
                { id: 'progress', label: 'Progress Stepper' },
                { id: 'hearings', label: 'Hearings' },
                { id: 'documents', label: 'Documents' },
                { id: 'investigations', label: 'Investigations' },
                { id: 'reports', label: 'Hearing Reports' },
                { id: 'transfer', label: 'Court Transfer' },
                { id: 'confidential', label: 'Confidential Notes' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCaseWorkspaceTab(tab.id)}
                  className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition ${
                    activeCaseWorkspaceTab === tab.id ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-tab Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              
              {/* 1. Overview */}
              {activeCaseWorkspaceTab === 'overview' && (
                <div className="space-y-4 text-slate-600 dark:text-slate-300">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p><strong>Applicant Name:</strong> {selectedCase.applicant?.name || 'N/A'}</p>
                    <p><strong>Applicant Phone:</strong> {selectedCase.applicant?.phone || 'N/A'}</p>
                    <p><strong>Assigned Counsel:</strong> {selectedCase.assignedLawyer?.name || 'Unassigned'}</p>
                    <p><strong>Court Name:</strong> {selectedCase.court || 'District Court'}</p>
                    <p><strong>Incident Date:</strong> {selectedCase.incidentDate ? new Date(selectedCase.incidentDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Priority Level:</strong> {selectedCase.urgency || 'Medium'}</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Case Description & Statement:</p>
                    <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">{selectedCase.description}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button onClick={() => setShowJudgmentModal(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-2 px-4 rounded-xl font-bold">
                      Pronounce Judgment
                    </button>
                    <button onClick={() => setShowInvestModal(true)} className="btn-secondary text-xs py-2 px-4 rounded-xl font-bold">
                      Issue Investigation Order
                    </button>
                    <button onClick={() => setShowTransferModal(true)} className="btn-secondary text-xs py-2 px-4 rounded-xl font-bold">
                      Request Court Transfer
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Parties & Counsel */}
              {activeCaseWorkspaceTab === 'parties' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-xl space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Applicant (Petitioner)</p>
                    <p>Name: {selectedCase.applicant?.name || 'N/A'}</p>
                    <p>Email: {selectedCase.applicant?.email || 'N/A'}</p>
                    <p>Occupation: {selectedCase.applicant?.occupation || 'N/A'}</p>
                  </div>
                  <div className="p-4 border rounded-xl space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Opponent (Respondent)</p>
                    <p>Name: {selectedCase.opponent?.name || 'State Respondent'}</p>
                    <p>Contact: {selectedCase.opponent?.contact || 'N/A'}</p>
                  </div>
                  <div className="p-4 border rounded-xl space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Assigned Legal Aid Advocate</p>
                    <p>Name: {selectedCase.assignedLawyer?.name || 'Unassigned'}</p>
                    <p>Specialization: {selectedCase.assignedLawyer?.specialization || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* 3. Dynamic Progress Stepper */}
              {activeCaseWorkspaceTab === 'progress' && (
                <div className="space-y-3 pl-4 border-l ml-2 relative">
                  {selectedCase.timeline && selectedCase.timeline.length > 0 ? (
                    selectedCase.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-purple-600" />
                        <p className="font-bold text-slate-900 dark:text-white">{item.status}</p>
                        <p className="text-[10px] text-slate-400">{item.note} · {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No stepper timeline events recorded.</p>
                  )}
                </div>
              )}

              {/* 4. Hearings */}
              {activeCaseWorkspaceTab === 'hearings' && (
                <div className="space-y-3">
                  {selectedCase.hearings && selectedCase.hearings.length > 0 ? (
                    selectedCase.hearings.map((h, i) => (
                      <div key={h._id || i} className="p-3 border rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold">Hearing #{h.hearingNumber || i + 1} — {h.purpose}</p>
                          <p className="text-[10px] text-slate-400">Date: {new Date(h.hearingDate).toLocaleDateString()} · Time: {h.timeSlot} · Venue: {h.courtroom}</p>
                        </div>
                        <span className="badge badge-purple">{h.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No hearings registered for this case.</p>
                  )}
                </div>
              )}

              {/* 5. Documents Vault */}
              {activeCaseWorkspaceTab === 'documents' && (
                <div className="space-y-2">
                  {selectedCase.documents && selectedCase.documents.length > 0 ? (
                    selectedCase.documents.map((doc) => (
                      <div key={doc._id} className="p-3 border rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold">{doc.title || doc.name || 'Evidentiary File'}</p>
                          <p className="text-[10px] text-slate-400">Type: {doc.category || doc.type || 'Evidence'}</p>
                        </div>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1 px-3 rounded-lg font-bold">
                            View Document
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No documents attached to this case file.</p>
                  )}
                </div>
              )}

              {/* 6. Investigations */}
              {activeCaseWorkspaceTab === 'investigations' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                    <p><strong>Investigation Status:</strong> <span className="font-bold text-purple-600">{selectedCase.investigation?.status || 'None'}</span></p>
                    <p><strong>Assigned Officer/Division:</strong> {selectedCase.investigation?.assignedTo || 'Court Auditor'}</p>
                    <p><strong>Remarks / Findings:</strong> {selectedCase.investigation?.remarks || 'None recorded'}</p>
                  </div>
                  <button onClick={() => setShowInvestModal(true)} className="btn-primary bg-purple-600 text-xs py-1.5 px-4 rounded-xl font-bold">
                    Update Investigation Order
                  </button>
                </div>
              )}

              {/* 7. Hearing Reports */}
              {activeCaseWorkspaceTab === 'reports' && (
                <div className="space-y-3">
                  <p className="text-slate-400">Proceedings reports from completed hearing sessions:</p>
                  {selectedCase.hearings && selectedCase.hearings.filter(h => h.report?.proceedingsSummary).length > 0 ? (
                    selectedCase.hearings.filter(h => h.report?.proceedingsSummary).map((h, i) => (
                      <div key={i} className="p-4 border rounded-xl space-y-1">
                        <p className="font-bold text-purple-600">Hearing #{h.hearingNumber} Summary:</p>
                        <p>{h.report.proceedingsSummary}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Directions: {h.report.directions || 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No proceedings reports recorded yet.</p>
                  )}
                </div>
              )}

              {/* 8. Court Transfer */}
              {activeCaseWorkspaceTab === 'transfer' && (
                <div className="space-y-3">
                  <button onClick={() => setShowTransferModal(true)} className="btn-primary bg-purple-600 text-xs py-1.5 px-4 rounded-xl font-bold">
                    Initiate Case Transfer Request
                  </button>
                  <p className="font-bold mt-2">Transfer History Logs:</p>
                  {selectedCase.transferHistory && selectedCase.transferHistory.length > 0 ? (
                    selectedCase.transferHistory.map((t, idx) => (
                      <div key={idx} className="p-3 border rounded-xl">
                        <p>From: {t.fromCourt} → To: {t.toCourt}</p>
                        <p className="text-[10px] text-slate-400">Status: {t.status} · Reason: {t.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No transfer history recorded.</p>
                  )}
                </div>
              )}

              {/* 9. Confidential Judicial Notes (Strictly Hidden from Lawyer/Applicant APIs) */}
              {activeCaseWorkspaceTab === 'confidential' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-[11px]">
                    <Lock size={12} className="inline mr-1" />
                    <strong>Confidential Judicial Deliberations:</strong> Notes recorded here are restricted exclusively to authorized judicial users.
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCase.confidentialNotes && selectedCase.confidentialNotes.length > 0 ? (
                      selectedCase.confidentialNotes.map((n, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.note}</p>
                          <p className="text-[9px] text-slate-400 mt-1">Recorded on {new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No confidential notes entered.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddConfidentialNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add private judicial deliberation note..."
                      value={confidentialNoteText}
                      onChange={e => setConfidentialNoteText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-white"
                    />
                    <button type="submit" className="btn-primary bg-purple-600 text-xs py-2 px-4 rounded-xl font-bold">
                      Add Private Note
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── 5. SCHEDULE HEARING MODAL WITH CONFLICT CHECK WARNING ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => { setShowScheduleModal(false); setConflictData(null); }} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Schedule Court Hearing</h4>

            {conflictData && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5"><AlertCircle size={16} /> Scheduling Conflict Detected!</p>
                <p>{conflictData.message}</p>
                {conflictData.suggestedSlots && (
                  <p className="text-[10px] text-rose-600 font-bold">
                    Suggested Available Slots: {conflictData.suggestedSlots.join(', ')}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Target Case</label>
                <select
                  value={scheduleForm.caseId}
                  onChange={e => setScheduleForm({ ...scheduleForm, caseId: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">-- Select Case File --</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>{c.caseId} - {c.caseTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Hearing Date</label>
                <input
                  type="date"
                  value={scheduleForm.hearingDate}
                  onChange={e => setScheduleForm({ ...scheduleForm, hearingDate: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Time Slot</label>
                <select
                  value={scheduleForm.timeSlot}
                  onChange={e => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                  className="form-input"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Courtroom Venue</label>
                <input
                  type="text"
                  value={scheduleForm.courtroom}
                  onChange={e => setScheduleForm({ ...scheduleForm, courtroom: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Purpose / Hearing Type</label>
                <input
                  type="text"
                  value={scheduleForm.purpose}
                  onChange={e => setScheduleForm({ ...scheduleForm, purpose: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={submittingSchedule} className="btn-primary bg-purple-600 hover:bg-purple-500 w-full py-2.5 rounded-xl font-bold">
                {submittingSchedule ? 'Checking Conflicts...' : 'Save & Book Session'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. RECORD HEARING PROCEEDINGS REPORT MODAL ── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowReportModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Record Hearing Proceedings Report</h4>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Proceedings Summary (Shareable to Parties)</label>
                <textarea
                  rows={3}
                  value={reportForm.proceedingsSummary}
                  onChange={e => setReportForm({ ...reportForm, proceedingsSummary: e.target.value })}
                  required
                  placeholder="Record summary of arguments, witness statements, or submissions..."
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Hearing Outcome / Status</label>
                <select
                  value={reportForm.outcome}
                  onChange={e => setReportForm({ ...reportForm, outcome: e.target.value })}
                  className="form-input"
                >
                  <option value="Adjourned for Further Evidence">Adjourned for Further Evidence</option>
                  <option value="Pre-Trial Arguments Concluded">Pre-Trial Arguments Concluded</option>
                  <option value="Interim Order Granted">Interim Order Granted</option>
                  <option value="Referred to Mediation">Referred to Mediation</option>
                  <option value="Reserved for Judgment">Reserved for Judgment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Judicial Directions & Next Actions</label>
                <input
                  type="text"
                  value={reportForm.directions}
                  onChange={e => setReportForm({ ...reportForm, directions: e.target.value })}
                  placeholder="e.g. Parties to file written submissions within 14 days"
                  className="form-input"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <label className="block font-bold text-amber-800 dark:text-amber-300">Confidential Judicial Deliberations (Restricted to Judges)</label>
                <textarea
                  rows={2}
                  value={reportForm.confidentialJudicialNotes}
                  onChange={e => setReportForm({ ...reportForm, confidentialJudicialNotes: e.target.value })}
                  placeholder="Private internal notes regarding witness credibility or evidentiary weight..."
                  className="form-input bg-white dark:bg-slate-900"
                />
              </div>

              <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-500 w-full py-2.5 rounded-xl font-bold">
                Finalize & Save Proceedings Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. ISSUE INVESTIGATION ORDER MODAL ── */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowInvestModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Issue Judicial Investigation Order</h4>

            <form onSubmit={handleInvestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Assigned Auditor / Division</label>
                <input
                  type="text"
                  value={investForm.assignedTo}
                  onChange={e => setInvestForm({ ...investForm, assignedTo: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Investigation Scope & Instructions</label>
                <textarea
                  rows={3}
                  value={investForm.remarks}
                  onChange={e => setInvestForm({ ...investForm, remarks: e.target.value })}
                  required
                  placeholder="Specify field verification instructions, land survey audits, or financial indigency checks..."
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-500 w-full py-2.5 rounded-xl font-bold">
                Issue Investigation Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. CASE TRANSFER MODAL ── */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Initiate Case Transfer Request</h4>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Destination Court Venue</label>
                <input
                  type="text"
                  value={transferForm.toCourt}
                  onChange={e => setTransferForm({ ...transferForm, toCourt: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Transfer Rationale / Reason</label>
                <textarea
                  rows={3}
                  value={transferForm.reason}
                  onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
                  required
                  placeholder="Jurisdictional reassignment, conflict of interest, or court specialization transfer..."
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-500 w-full py-2.5 rounded-xl font-bold">
                Submit Transfer Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. PRONOUNCE JUDGMENT MODAL ── */}
      {showJudgmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowJudgmentModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Pronounce & Record Decree Judgment</h4>

            <form onSubmit={handleJudgmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Judicial Verdict Decision</label>
                <select
                  value={judgmentForm.decision}
                  onChange={e => setJudgmentForm({ ...judgmentForm, decision: e.target.value })}
                  className="form-input"
                >
                  <option value="Petition Allowed">Petition Allowed in Full</option>
                  <option value="Petition Dismissed">Petition Dismissed</option>
                  <option value="Settlement Decree Approved">Settlement Decree Approved</option>
                  <option value="Partial Relief Granted">Partial Relief Granted</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Judgment Summary & Orders</label>
                <textarea
                  rows={3}
                  value={judgmentForm.summary}
                  onChange={e => setJudgmentForm({ ...judgmentForm, summary: e.target.value })}
                  required
                  placeholder="Summarize key findings of law, decree terms, and cost awards..."
                  className="form-input"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="closeCase"
                  checked={judgmentForm.closeCase}
                  onChange={e => setJudgmentForm({ ...judgmentForm, closeCase: e.target.checked })}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <label htmlFor="closeCase" className="font-bold text-slate-700 dark:text-slate-200">
                  Mark Case File as Completed / Closed
                </label>
              </div>

              <button type="submit" className="btn-primary bg-emerald-600 hover:bg-emerald-500 w-full py-2.5 rounded-xl font-bold">
                Pronounce Judgment & Record Decree
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JudgeDashboard;
