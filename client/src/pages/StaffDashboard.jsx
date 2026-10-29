import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import ChatCenter from '../components/chat/ChatCenter';
import { initSocket, subscribeToHearingUpdates, subscribeToCaseUpdates, subscribeToNotifications } from '../services/socket';
import {
  Calendar, CheckCircle2, AlertTriangle, Scale, FolderOpen,
  Clock, Plus, Search, MessageSquare, FileText, User,
  Building, Check, X, RefreshCw, AlertCircle, Eye, ChevronRight,
  Gavel, ShieldCheck, UserCheck, MapPin, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProfilePage from './ProfilePage';

const StaffDashboard = ({ activeTab = 'dashboard' }) => {
  const { user } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Data states
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [judgesList, setJudgesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule Hearing Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    caseId: '',
    hearingDate: '',
    timeSlot: '10:00 AM',
    courtroom: 'Courtroom A',
    judge: 'Justice Shanmugam',
    purpose: 'Preliminary Hearing & Evidence Presentation',
    notes: ''
  });

  // Dedicated Docket Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingCase, setConfirmingCase] = useState(null);
  const [confirmingLoading, setConfirmingLoading] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    judgeId: '',
    courtroom: 'Courtroom A',
    hearingDate: '',
    timeSlot: '10:00 AM',
    purpose: 'Preliminary Hearing & Docket Admission',
    notes: ''
  });

  // Fetch court hearings from MongoDB
  const fetchHearings = async () => {
    try {
      const res = await axios.get('/hearings');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHearings(list);
    } catch (err) {
      console.warn('Could not fetch hearings:', err.message);
    }
  };

  // Fetch applications / cases from MongoDB
  const fetchCases = async () => {
    try {
      const res = await axios.get('/applications');
      if (Array.isArray(res.data)) {
        setCases(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch cases:', err.message);
    }
  };

  // Fetch active judges from judicial module
  const fetchJudges = async () => {
    try {
      const res = await axios.get('/judge/all');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list.length > 0) {
        setJudgesList(list);
        return;
      }
    } catch (e) {
      // Fallback
    }
    try {
      const res2 = await axios.get('/users?role=Judge');
      const list2 = Array.isArray(res2.data) ? res2.data : (res2.data?.data || []);
      setJudgesList(list2);
    } catch (err) {
      console.warn('Could not fetch judges list:', err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchHearings(), fetchCases(), fetchJudges()]);
    setLoading(false);
  };

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    loadData();

    if (user) {
      initSocket(user);

      subscribeToHearingUpdates(() => {
        fetchHearings();
        fetchCases();
      });

      subscribeToCaseUpdates(() => {
        fetchCases();
      });

      subscribeToNotifications(() => {
        fetchHearings();
        fetchCases();
      });
    }
  }, [user]);

  // Handle standard schedule hearing submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!hearingForm.caseId || !hearingForm.hearingDate) {
      alert('Please select a Case Docket and specify Hearing Date.');
      return;
    }

    setScheduling(true);
    try {
      const payload = {
        applicationId: hearingForm.caseId,
        hearingDate: hearingForm.hearingDate,
        timeSlot: hearingForm.timeSlot,
        courtroom: hearingForm.courtroom,
        judge: hearingForm.judge,
        purpose: hearingForm.purpose,
        notes: hearingForm.notes
      };

      const res = await axios.post('/hearings', payload);
      if (res.data?.success || res.status === 201) {
        alert('Court hearing successfully scheduled! Assigned Lawyer and Applicant have been notified automatically in real time.');
        setShowScheduleModal(false);
        setHearingForm({
          caseId: '',
          hearingDate: '',
          timeSlot: '10:00 AM',
          courtroom: 'Courtroom A',
          judge: 'Justice Shanmugam',
          purpose: 'Preliminary Hearing & Evidence Presentation',
          notes: ''
        });
        await loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message;
      alert(`Scheduling Conflict / Error: ${msg}`);
    } finally {
      setScheduling(false);
    }
  };

  // Open Docket Confirmation Modal
  const handleOpenConfirmModal = (caseItem) => {
    setConfirmingCase(caseItem);

    // Default to 7 days ahead for hearing date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const dateStr = targetDate.toISOString().split('T')[0];

    const defaultJudgeId = caseItem.assignedJudge?._id || caseItem.assignedJudge || (judgesList[0]?.userId?._id || judgesList[0]?._id || '');

    setConfirmForm({
      judgeId: defaultJudgeId,
      courtroom: caseItem.courtDetails?.courtName || caseItem.court || 'Courtroom A',
      hearingDate: dateStr,
      timeSlot: '10:00 AM',
      purpose: 'Preliminary Hearing & Docket Admission',
      notes: `Case admitted to official Court Docket. Representation confirmed for Advocate ${caseItem.assignedLawyer?.name || caseItem.chosenLawyer?.name || 'Counsel'}.`
    });
    setShowConfirmModal(true);
  };

  // Submit Docket Confirmation and Schedule Hearing
  const handleConfirmDocketSubmit = async (e) => {
    e.preventDefault();
    if (!confirmingCase) return;
    if (!confirmForm.hearingDate) {
      alert('Please select a Hearing Date.');
      return;
    }

    setConfirmingLoading(true);
    try {
      const payload = {
        judgeId: confirmForm.judgeId,
        courtroom: confirmForm.courtroom,
        hearingDate: confirmForm.hearingDate,
        timeSlot: confirmForm.timeSlot,
        hearingTime: confirmForm.timeSlot,
        hearingType: confirmForm.purpose,
        purpose: confirmForm.purpose,
        notes: confirmForm.notes,
      };

      const res = await axios.patch(`/applications/${confirmingCase._id}/confirm-docket`, payload);
      if (res.data?.success) {
        alert(`🎉 Case Confirmed & Admitted to Court Docket!\n\nCase: "${confirmingCase.caseTitle}"\nHearing Date: ${new Date(confirmForm.hearingDate).toLocaleDateString()} at ${confirmForm.timeSlot} in ${confirmForm.courtroom}.\n\nPresiding Judge, Advocate, and Applicant have received real-time docket notices.`);
        setShowConfirmModal(false);
        setConfirmingCase(null);
        await loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Docket Confirmation Failed: ${msg}`);
    } finally {
      setConfirmingLoading(false);
    }
  };

  // Quick Reschedule or Status Update
  const handleUpdateHearingStatus = async (hearingId, newStatus) => {
    try {
      await axios.patch(`/hearings/${hearingId}`, { status: newStatus });
      alert(`Hearing marked as ${newStatus}. All participants updated.`);
      fetchHearings();
    } catch (err) {
      alert(`Failed to update hearing: ${err.response?.data?.message || err.message}`);
    }
  };

  const courtrooms = [
    { name: 'Courtroom A', status: 'In Use', load: 'High', color: 'bg-blue-500' },
    { name: 'Courtroom B', status: 'Available', load: 'None', color: 'bg-emerald-500' },
    { name: 'Courtroom C', status: 'In Use', load: 'Moderate', color: 'bg-blue-500' },
    { name: 'Courtroom D', status: 'Maintenance', load: 'None', color: 'bg-amber-500' },
    { name: 'Courtroom E', status: 'Available', load: 'None', color: 'bg-emerald-500' },
  ];

  // Cases awaiting court staff confirmation
  const pendingConfirmationCases = cases.filter(c => 
    c.status === 'PendingStaffConfirmation' ||
    c.status === 'PendingCourtApproval' ||
    (c.representationStatus === 'Accepted' && (c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'LawyerAssigned'))
  );

  const filteredHearings = hearings.filter(h => {
    const q = searchQuery.toLowerCase();
    const caseTitle = h.application?.caseTitle || h.application?.type || '';
    const courtroom = h.courtroom || '';
    const judge = h.judgeName || '';
    return caseTitle.toLowerCase().includes(q) || courtroom.toLowerCase().includes(q) || judge.toLowerCase().includes(q);
  });

  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const title = c.caseTitle || c.caseType || '';
    const num = c.caseNumber || c.applicationNumber || c.caseId || '';
    const applicant = c.applicant?.name || '';
    const lawyer = c.assignedLawyer?.name || c.chosenLawyer?.name || '';
    return title.toLowerCase().includes(q) || num.toLowerCase().includes(q) || applicant.toLowerCase().includes(q) || lawyer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">

      {/* ── TOP BANNER: COURT REGISTRY & CHAMBER STAFF ── */}
      <div 
        className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ borderTop: '3px solid #B69B72' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#202A3B]/10 dark:bg-[#B69B72]/20 text-[#202A3B] dark:text-[#D9C7A5] border border-[#B69B72]/30">
              Judicial Registry & Clerk Office
            </span>
            {pendingConfirmationCases.length > 0 && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                {pendingConfirmationCases.length} Awaiting Confirmation
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome, {user?.name || 'Court Staff Officer'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Presiding Court: Combined Court Complex, Theni • Interconnected Dockets Registry
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentTab('confirmation')}
            className={`text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              currentTab === 'confirmation'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <CheckCircle2 size={15} />
            Docket Confirmations ({pendingConfirmationCases.length})
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-gold text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#B69B72]/20 cursor-pointer"
          >
            <Plus size={15} /> Schedule Slot
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh Registry Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Building },
          { id: 'confirmation', label: `Pending Confirmation (${pendingConfirmationCases.length})`, icon: CheckCircle2, badge: pendingConfirmationCases.length },
          { id: 'scheduling', label: `Hearings Calendar (${hearings.length})`, icon: Calendar },
          { id: 'cases', label: `Case Dockets (${cases.length})`, icon: FolderOpen },
          { id: 'messages', label: 'Communications', icon: MessageSquare },
        ].map(t => {
          const Icon = t.icon;
          const isActive = currentTab === t.id || (t.id === 'confirmation' && currentTab === 'pending-approvals');
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── STATS CARDS ── */}
      {currentTab === 'dashboard' && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard title="Active Case Dockets" value={cases.length.toString()} subtitle="Registered in registry" trend="Synchronized" />
          <StatCard title="Awaiting Confirmation" value={pendingConfirmationCases.length.toString()} subtitle="Accepted by Advocate" trend={pendingConfirmationCases.length > 0 ? "Action Required" : "Cleared"} />
          <StatCard title="Scheduled Hearings" value={hearings.length.toString()} subtitle="Benches across courts" trend="Real-time" />
          <StatCard title="Assigned Counsel" value={cases.filter(c => c.assignedLawyer || c.chosenLawyer).length.toString()} subtitle="Active advocates" trend="Verified" />
        </div>
      )}

      {/* ── PENDING CONFIRMATION ALERT BANNER (On Dashboard) ── */}
      {currentTab === 'dashboard' && pendingConfirmationCases.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                {pendingConfirmationCases.length} Legal Aid Case(s) Awaiting Docket Confirmation
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                The chosen Advocates have accepted representation. Confirm docket admission, assign Presiding Judge, and schedule hearing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('confirmation')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm"
          >
            Review Queue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── TAB: PENDING REGISTRY CONFIRMATION (Dedicated Approval & Docketing Page) ── */}
      {(currentTab === 'confirmation' || currentTab === 'pending-approvals') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Registry Case Docket Confirmation Queue
              </h3>
              <p className="text-xs text-slate-400">
                Sequential Workflow: Cases accepted by Legal Counsel ready for Court Staff registry confirmation, courtroom allocation, and hearing date scheduling.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 self-start sm:self-auto">
              {pendingConfirmationCases.length} Pending Actions
            </span>
          </div>

          {pendingConfirmationCases.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All Docket Confirmations Cleared
              </h4>
              <p className="text-xs max-w-md mx-auto text-slate-500 dark:text-slate-400">
                There are currently no cases waiting for Court Staff confirmation. When an advocate accepts an applicant's representation request, it will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingConfirmationCases.map(c => {
                const assignedAdvocate = c.assignedLawyer || c.chosenLawyer;
                const lawyerName = assignedAdvocate?.name || 'Advocate';
                const lawyerBar = assignedAdvocate?.barRegistrationNumber || 'Verified Bar Council Advocate';
                const applicantName = c.applicant?.name || 'Applicant Citizen';
                const applicantPhone = c.applicant?.phone || 'Contact not on record';
                const applicantDist = c.applicant?.location || c.location || 'Local District';
                const cnr = c.caseId || c.caseNumber || c._id;

                return (
                  <div
                    key={c._id}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl border border-amber-200/80 dark:border-amber-900/60 p-5 shadow-sm space-y-4 hover:border-amber-400 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            CNR: {cnr}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {c.caseType || 'Civil'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                          {c.caseTitle}
                        </h4>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                        {c.status}
                      </span>
                    </div>

                    {/* Applicant & Accepted Advocate Dossier Box */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400">Applicant / Citizen</p>
                        <p className="font-bold text-slate-800 dark:text-white truncate">{applicantName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{applicantPhone}</p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-blue-500">Accepted Advocate</p>
                        <p className="font-bold text-blue-700 dark:text-blue-400 truncate">Adv. {lawyerName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{lawyerBar}</p>
                      </div>

                      <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800 mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">
                          <strong>Court Venue:</strong> {c.courtDetails?.courtName || c.court || 'Combined Court Complex, Theni'}
                        </span>
                        <span className="text-slate-500">
                          <strong>Jurisdiction:</strong> {c.courtDetails?.courtTier || 'District Court'}
                        </span>
                      </div>
                    </div>

                    {/* Case Description snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {c.description || 'No detailed petition notes recorded.'}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FileText size={12} className="text-blue-500" />
                        {c.documents?.length || 0} Evidence Docs
                      </span>

                      <button
                        onClick={() => handleOpenConfirmModal(c)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 size={14} /> Review & Admit to Docket
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: OVERVIEW ── */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            
            {/* Recent Scheduled Hearings */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Hearings Calendar</h3>
                  <p className="text-xs text-slate-400">Live docket schedule shared with Counsel & Citizens</p>
                </div>
                <button
                  onClick={() => setCurrentTab('scheduling')}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All ({hearings.length}) <ChevronRight size={14} />
                </button>
              </div>

              {hearings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No hearings scheduled yet</p>
                  <p className="text-[11px]">Click "Schedule Hearing Slot" to configure the first court calendar session.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hearings.slice(0, 5).map(h => (
                    <div
                      key={h._id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-500/40 transition"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            {h.courtroom || 'Courtroom A'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {h.application?.caseTitle || h.purpose || 'Legal Aid Hearing'}
                          </h4>
                          <span className="text-[10px] uppercase font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {h.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          <strong>Date:</strong> {new Date(h.hearingDate).toLocaleDateString()} at {h.timeSlot} • <strong>Judge:</strong> {h.judgeName}
                        </p>
                        {h.application?.assignedLawyer && (
                          <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                            Assigned Advocate: {h.application.assignedLawyer.name || 'Counsel'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateHearingStatus(h._id, 'Completed')}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Courtroom Capacity Status */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hall Occupancy Monitor</h3>
                    <p className="text-[10px] text-slate-400">Combined Court Complex Chambers</p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                    5 Halls
                  </span>
                </div>

                <div className="space-y-2.5">
                  {courtrooms.map((room, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${room.color}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{room.name}</p>
                          <p className="text-[10px] text-slate-400">Schedule Load: {room.load}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {room.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Communication Shortcut */}
              <div className="bg-[#202A3B] border border-[#B69B72]/25 rounded-2xl p-6 text-white shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#B69B72]" />
                  <h4 className="text-sm font-bold text-white">Interconnected Communications</h4>
                </div>
                <p className="text-xs text-[#F5F5EF]/80 leading-relaxed">
                  Direct communication channels are open between Court Staff, Assigned Advocates, and Chamber Administration.
                </p>
                <button
                  onClick={() => setCurrentTab('messages')}
                  className="w-full bg-gradient-to-r from-[#B69B72] to-[#9A7E55] hover:from-[#A88C64] hover:to-[#8C724D] text-white py-2.5 rounded-xl text-xs font-bold shadow hover:opacity-95 transition cursor-pointer"
                >
                  Open Communications Center
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: HEARINGS SCHEDULING MASTER ── */}
      {(currentTab === 'scheduling' || currentTab === 'hearings') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Official Court Hearings Docket
              </h3>
              <p className="text-xs text-slate-400">
                Scheduled hearings synchronize automatically across Staff, Lawyer, and Applicant dashboards.
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} /> Schedule New Hearing Slot
            </button>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search hearings by case, courtroom, judge..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="p-3">Courtroom</th>
                    <th className="p-3">Hearing Date & Time</th>
                    <th className="p-3">Case Docket Title</th>
                    <th className="p-3">Presiding Judge</th>
                    <th className="p-3">Assigned Lawyer</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHearings.map(h => (
                    <tr key={h._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-bold font-mono text-sky-600 dark:text-sky-400">{h.courtroom}</td>
                      <td className="p-3">
                        <span className="font-bold">{new Date(h.hearingDate).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-400 block">{h.timeSlot}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {h.application?.caseTitle || h.application?.caseType || 'Litigation File'}
                        <span className="font-mono text-[9px] text-slate-400 block">{h.application?.caseNumber || h.application?.caseId || h.application?._id}</span>
                      </td>
                      <td className="p-3">{h.judgeName}</td>
                      <td className="p-3 text-sky-600 dark:text-sky-400 font-medium">
                        {h.application?.assignedLawyer?.name || 'Unassigned'}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleUpdateHearingStatus(h._id, 'Completed')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold cursor-pointer"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateHearingStatus(h._id, 'Adjourned')}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold cursor-pointer"
                          >
                            Adjourn
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

      {/* ── TAB 3: CASE DOCKETS ── */}
      {currentTab === 'cases' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Registry Case Dockets & Litigant Records
              </h3>
              <p className="text-xs text-slate-400">Complete view of Applicants, Assigned Counsel, Opposing Parties, and Presiding Benches.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCases.map(c => (
              <div key={c._id} className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.caseNumber || c.caseId || c.applicationNumber || c._id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {c.caseTitle || c.caseType}
                    </h4>
                  </div>
                  <span className={`badge text-[10px] ${
                    c.status === 'PendingStaffConfirmation' ? 'badge-amber' :
                    c.status === 'CourtScheduled' ? 'badge-emerald' : 'badge-blue'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p><strong>Applicant:</strong> {c.applicant?.name || 'Applicant'}</p>
                  <p><strong>Advocate:</strong> {c.assignedLawyer?.name || c.chosenLawyer?.name || 'Unassigned'}</p>
                  <p><strong>Opponent:</strong> {c.opponentDetails?.name || c.opponent?.name || 'Not on Record'}</p>
                  <p><strong>Judge:</strong> {c.assignedJudge?.name || c.hearing?.judgeName || 'To Be Assigned'}</p>
                  <p><strong>Court Hall:</strong> {c.courtDetails?.courtName || c.court || 'District Court'}</p>
                  <p><strong>Hearing:</strong> {c.hearing?.hearingDate ? new Date(c.hearing.hearingDate).toLocaleDateString() : 'Pending'}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {c.status === 'PendingStaffConfirmation' || c.status === 'PendingCourtApproval' ? (
                    <button
                      onClick={() => handleOpenConfirmModal(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                    >
                      <CheckCircle2 size={13} /> Confirm & Admit Docket
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setHearingForm(prev => ({ ...prev, caseId: c._id }));
                        setShowScheduleModal(true);
                      }}
                      className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar size={13} /> Schedule Hearing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: COMMUNICATIONS / MESSAGES ── */}
      {currentTab === 'messages' && (
        <div className="space-y-4">
          <ChatCenter />
        </div>
      )}

      {/* ── TAB 5: PROFILE & STAFF CREDENTIALS ── */}
      {(currentTab === 'profile' || activeTab === 'profile') && (
        <ProfilePage />
      )}

      {/* ── MODAL: CONFIRM DOCKET & SCHEDULE HEARING (Sequential Multi-Tier Step) ── */}
      {showConfirmModal && confirmingCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Confirm Case & Admit to Official Court Docket
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Step 2: Court Staff Approval & Bench Scheduling
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Case Dossier Summary Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  CNR: {confirmingCase.caseId || confirmingCase._id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {confirmingCase.caseType || 'Civil'}
                </span>
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                {confirmingCase.caseTitle}
              </h5>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Applicant:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {confirmingCase.applicant?.name || 'Citizen'} ({confirmingCase.applicant?.phone || 'No phone'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold uppercase">Accepted Counsel:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    Adv. {confirmingCase.assignedLawyer?.name || confirmingCase.chosenLawyer?.name || 'Assigned Counsel'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduling Form */}
            <form onSubmit={handleConfirmDocketSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Presiding Judge Dropdown */}
                <div className="col-span-2">
                  <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">
                    Designate Presiding Judicial Officer (Judge) *
                  </label>
                  <select
                    value={confirmForm.judgeId}
                    onChange={e => setConfirmForm({ ...confirmForm, judgeId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium text-xs"
                    required
                  >
                    <option value="">-- Select Presiding Judge Bench --</option>
                    {judgesList.map(j => {
                      const jId = j.userId?._id || j.userId || j._id;
                      const jName = j.name || j.fullName || (j.userId?.name ? `Hon. Justice ${j.userId.name}` : 'Hon. Judicial Officer');
                      const jCourt = j.courtLevel || j.designation || 'District Judge';
                      return (
                        <option key={jId} value={jId}>
                          {jName} ({jCourt})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Courtroom Hall */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">Courtroom Hall *</label>
                  <select
                    value={confirmForm.courtroom}
                    onChange={e => setConfirmForm({ ...confirmForm, courtroom: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium text-xs"
                    required
                  >
                    <option>Courtroom A</option>
                    <option>Courtroom B</option>
                    <option>Courtroom C</option>
                    <option>Courtroom Hall 1 - Principal Bench</option>
                    <option>Courtroom Hall 2 - Fast Track Court</option>
                    <option>Chambers Bench 3</option>
                  </select>
                </div>

                {/* Hearing Date */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    required
                    value={confirmForm.hearingDate}
                    onChange={e => setConfirmForm({ ...confirmForm, hearingDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium text-xs"
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">Time Slot *</label>
                  <select
                    value={confirmForm.timeSlot}
                    onChange={e => setConfirmForm({ ...confirmForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium text-xs"
                  >
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                  </select>
                </div>

                {/* Hearing Purpose */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">Hearing Purpose / Stage</label>
                  <input
                    type="text"
                    value={confirmForm.purpose}
                    onChange={e => setConfirmForm({ ...confirmForm, purpose: e.target.value })}
                    placeholder="e.g. Preliminary Hearing & Docket Admission"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium text-xs"
                  />
                </div>
              </div>

              {/* Registry Notes */}
              <div>
                <label className="block font-bold text-slate-500 uppercase text-[10px] mb-1">Court Registry Notes & Directions</label>
                <textarea
                  rows={2}
                  value={confirmForm.notes}
                  onChange={e => setConfirmForm({ ...confirmForm, notes: e.target.value })}
                  placeholder="Official docket directions or notices to counsel..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={confirmingLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 text-xs cursor-pointer transition disabled:opacity-60"
                >
                  {confirmingLoading ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Approve & Admit to Court Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE NEW HEARING (Standard Calendar) ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Court Hearing Slot</h4>
                  <p className="text-[10px] text-slate-400">Notifies Assigned Lawyer & Citizen automatically</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Select Case Docket *</label>
                <select
                  value={hearingForm.caseId}
                  onChange={e => setHearingForm({ ...hearingForm, caseId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  required
                >
                  <option value="">-- Choose Docket --</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.caseNumber || c.caseId || c._id} - {c.caseTitle || c.caseType} ({c.assignedLawyer?.name ? `Adv. ${c.assignedLawyer.name}` : 'No Lawyer'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    required
                    value={hearingForm.hearingDate}
                    onChange={e => setHearingForm({ ...hearingForm, hearingDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Time Slot *</label>
                  <select
                    value={hearingForm.timeSlot}
                    onChange={e => setHearingForm({ ...hearingForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Courtroom Hall</label>
                  <select
                    value={hearingForm.courtroom}
                    onChange={e => setHearingForm({ ...hearingForm, courtroom: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option>Courtroom A</option>
                    <option>Courtroom B</option>
                    <option>Courtroom C</option>
                    <option>Courtroom D</option>
                    <option>Courtroom Hall 1</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Presiding Judge</label>
                  <select
                    value={hearingForm.judge}
                    onChange={e => setHearingForm({ ...hearingForm, judge: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  >
                    {judgesList.length > 0 ? (
                      judgesList.map(j => {
                        const name = j.name || j.fullName || (j.userId?.name ? `Hon. Justice ${j.userId.name}` : 'Hon. Judicial Officer');
                        return <option key={j._id} value={name}>{name}</option>;
                      })
                    ) : (
                      <>
                        <option>Justice Shanmugam</option>
                        <option>Justice Meera Rajan</option>
                        <option>Justice Amarasinghe</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Hearing Purpose / Stage</label>
                <input
                  type="text"
                  value={hearingForm.purpose}
                  onChange={e => setHearingForm({ ...hearingForm, purpose: e.target.value })}
                  placeholder="e.g. Preliminary Hearing & Framing of Issues"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Docket Notes / Required Documents</label>
                <textarea
                  rows={2}
                  value={hearingForm.notes}
                  onChange={e => setHearingForm({ ...hearingForm, notes: e.target.value })}
                  placeholder="e.g. Counsel requested to submit certified boundary partitions map..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={scheduling}
                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
              >
                {scheduling ? <RefreshCw size={16} className="animate-spin" /> : <Calendar size={16} />}
                Confirm & Dispatch Hearing Notice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;