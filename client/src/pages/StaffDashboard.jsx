import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import ChatCenter from '../components/chat/ChatCenter';
import { initSocket, subscribeToHearingUpdates, subscribeToCaseUpdates, subscribeToNotifications } from '../services/socket';
import {
  Calendar, CheckCircle2, AlertTriangle, Scale, FolderOpen,
  Clock, Plus, Search, MessageSquare, FileText, User,
  Building, Check, X, RefreshCw, AlertCircle, Eye, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProfilePage from './ProfilePage';

const StaffDashboard = ({ activeTab = 'dashboard' }) => {
  const { user } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Data states
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
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

  // Fetch all court hearings from MongoDB
  const fetchHearings = async () => {
    try {
      const res = await axios.get('/hearings');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHearings(list);
    } catch (err) {
      console.warn('Could not fetch hearings:', err.message);
    }
  };

  // Fetch all applications / cases from MongoDB
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

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchHearings(), fetchCases()]);
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

  // Handle schedule hearing submission
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
    const num = c.caseNumber || c.applicationNumber || '';
    const applicant = c.applicant?.name || '';
    const lawyer = c.assignedLawyer?.name || '';
    return title.toLowerCase().includes(q) || num.toLowerCase().includes(q) || applicant.toLowerCase().includes(q) || lawyer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP BANNER: COURT REGISTRY & CHAMBER STAFF (Only on Dashboard Overview) ── */}
      {currentTab === 'dashboard' && (
        <>
          <div 
            className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ borderTop: '3px solid #B69B72' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#202A3B]/10 dark:bg-[#B69B72]/20 text-[#202A3B] dark:text-[#D9C7A5] border border-[#B69B72]/30">
                  Judicial Registry & Clerk Office
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                Welcome, {user?.name || 'Court Staff Officer'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Presiding Court: Combined Court Complex, Theni • Interconnected Dockets Registry
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn-gold text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#B69B72]/20"
              >
                <Plus size={15} /> Schedule Hearing Slot
              </button>
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                title="Refresh Registry Data"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* ── STATS CARDS ── */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard title="Active Case Dockets" value={cases.length.toString()} subtitle="Registered in registry" trend="Synchronized" />
            <StatCard title="Scheduled Hearings" value={hearings.length.toString()} subtitle="Benches across courts" trend="Real-time" />
            <StatCard title="Assigned Counsel" value={cases.filter(c => c.assignedLawyer).length.toString()} subtitle="Active advocates" trend="Verified" />
            <StatCard title="Courtroom Halls" value="5 Active" subtitle="Daily calendar sync" trend="Available" />
          </div>
        </>
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
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
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
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
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
              className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto"
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
                        <span className="font-mono text-[9px] text-slate-400 block">{h.application?.caseNumber || h.application?._id}</span>
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
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateHearingStatus(h._id, 'Adjourned')}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold"
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
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Registry Case Dockets & Litigant Records
            </h3>
            <p className="text-xs text-slate-400">Complete view of Applicants, Assigned Counsel, Opposing Parties, and Presiding Benches.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCases.map(c => (
              <div key={c._id} className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.caseNumber || c.applicationNumber || c._id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {c.caseTitle || c.caseType}
                    </h4>
                  </div>
                  <span className="badge badge-blue text-[10px]">{c.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <p><strong>Applicant:</strong> {c.applicant?.name || 'Applicant'}</p>
                  <p><strong>Advocate:</strong> {c.assignedLawyer?.name || 'Unassigned'}</p>
                  <p><strong>Opponent:</strong> {c.opponentDetails?.name || 'Not on Record'}</p>
                  <p><strong>Opponent Counsel:</strong> {c.opponentDetails?.lawyerName || 'None'}</p>
                  <p><strong>Court Hall:</strong> {c.courtDetails?.courtName || 'District Court'}</p>
                  <p><strong>Hearing:</strong> {c.hearing?.hearingDate ? new Date(c.hearing.hearingDate).toLocaleDateString() : 'Pending'}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setHearingForm(prev => ({ ...prev, caseId: c._id }));
                      setShowScheduleModal(true);
                    }}
                    className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1"
                  >
                    <Calendar size={13} /> Schedule Hearing
                  </button>
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

      {/* ── MODAL: SCHEDULE NEW HEARING ── */}
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
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
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
                      {c.caseNumber || c._id} - {c.caseTitle || c.caseType} ({c.assignedLawyer?.name ? `Adv. ${c.assignedLawyer.name}` : 'No Lawyer'})
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
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={hearingForm.timeSlot}
                    onChange={e => setHearingForm({ ...hearingForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none font-medium"
                  />
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
                    <option>Justice Shanmugam</option>
                    <option>Justice Meera Rajan</option>
                    <option>Justice Amarasinghe</option>
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
                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
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
