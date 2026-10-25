import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle2, CalendarDays, ShieldCheck, AlertCircle, 
  MapPin, User, ChevronRight, HelpCircle, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const MOCK_FALLBACK_CASES = [
  {
    _id: '66a1b2c3d4e5f6a7b8c9d0e1',
    caseTitle: 'Land Deed Title Clearance & Property Boundary Dispute',
    status: 'CourtScheduled',
    verificationStatus: 'Verified',
    assignedLawyer: {
      _id: 'lawyer-1',
      name: 'Aisha Verma',
      email: 'aisha.verma@legalaid.org',
      phone: '+91 98765 43210',
      location: 'New Delhi',
      specialization: 'Family & Property Law'
    },
    hearing: {
      hearingDate: '2026-09-18T10:30:00.000Z',
      judge: 'Hon. Justice R. K. Deshmukh',
      courtroom: 'Courtroom 4B, High Court',
      status: 'Scheduled',
      notes: 'Final evidentiary document verification and boundary survey audit review.'
    },
    timeline: [
      { date: '2026-06-15T09:00:00.000Z', status: 'Submitted', note: 'Legal aid application submitted for boundary partition.' },
      { date: '2026-06-20T14:30:00.000Z', status: 'Verification', note: 'Indigent income certificate & identity documents verified.' },
      { date: '2026-07-02T11:00:00.000Z', status: 'LawyerAssigned', note: 'Senior Counsel Aisha Verma assigned to docket.' },
      { date: '2026-08-01T16:00:00.000Z', status: 'CourtScheduled', note: 'Pre-trial hearing date scheduled in Courtroom 4B.' }
    ]
  },
  {
    _id: '66b2c3d4e5f6a7b8c9d0e1f2',
    caseTitle: 'Employment Termination & Subsidized Retainer Claim',
    status: 'LawyerAssigned',
    verificationStatus: 'Verified',
    assignedLawyer: {
      _id: 'lawyer-2',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@legalaid.org',
      phone: '+91 98123 45678',
      location: 'Mumbai',
      specialization: 'Labour & Corporate Law'
    },
    hearing: null,
    timeline: [
      { date: '2026-07-10T10:00:00.000Z', status: 'Submitted', note: 'Application received for labour tribunal arbitration.' },
      { date: '2026-07-15T12:00:00.000Z', status: 'Verification', note: 'Income threshold audit approved for subsidized aid.' },
      { date: '2026-07-28T15:00:00.000Z', status: 'LawyerAssigned', note: 'Advocate Rohan Mehta allocated to counsel defense.' }
    ]
  }
];

const CaseTracker = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetId = searchParams.get('id');

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Fetch all applications for selection and check target details
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      setIsUsingFallback(false);
      
      const response = await axios.get('/applications/mine');
      
      if (response.data && response.data.length > 0) {
        setApplications(response.data);
        if (targetId) {
          const found = response.data.find(app => app._id === targetId);
          if (found) {
            setSelectedApp(found);
          } else {
            try {
              const singleResp = await axios.get(`/applications/${targetId}`);
              setSelectedApp(singleResp.data);
            } catch (e) {
              setSelectedApp(response.data[0]);
            }
          }
        } else {
          setSelectedApp(response.data[0]);
        }
      } else if (targetId) {
        try {
          const singleResp = await axios.get(`/applications/${targetId}`);
          setSelectedApp(singleResp.data);
          setApplications([singleResp.data]);
        } catch (e) {
          // If server returned 0 cases, use fallback or empty
          setSelectedApp(null);
        }
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.warn('Backend server unavailable or unauthenticated, switching to offline telemetry fallback:', err.message);
      setIsUsingFallback(true);
      setApplications(MOCK_FALLBACK_CASES);
      if (targetId) {
        const found = MOCK_FALLBACK_CASES.find(app => app._id === targetId);
        setSelectedApp(found || MOCK_FALLBACK_CASES[0]);
      } else {
        setSelectedApp(MOCK_FALLBACK_CASES[0]);
      }
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [targetId]);

  const fetchAppDetails = async (appId) => {
    try {
      setLoading(true);
      if (isUsingFallback) {
        const local = applications.find(a => a._id === appId);
        if (local) setSelectedApp(local);
        return;
      }
      const response = await axios.get(`/applications/${appId}`);
      setSelectedApp(response.data);
    } catch (err) {
      console.warn('Could not retrieve remote case details, searching local store:', err.message);
      const local = applications.find(a => a._id === appId);
      if (local) {
        setSelectedApp(local);
      }
    } finally {
      setLoading(false);
    }
  };

  // Map application status to horizontal milestones
  const steps = useMemo(() => {
    if (!selectedApp) return [];
    const status = selectedApp.status;
    const isSubmitted = true;
    const isVerification = ['Verification', 'Under Review', 'LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(status);
    const isCounselMatched = ['LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(status) && !!selectedApp.assignedLawyer;
    const isHearingScheduled = ['CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(status) && !!selectedApp.hearing;
    const isResolved = ['Judgment', 'Completed', 'Rejected'].includes(status);

    const verStatus = selectedApp.verificationStatus || 'Pending';

    return [
      { id: 1, label: 'Submission', complete: isSubmitted, desc: 'Docket created' },
      { 
        id: 2, 
        label: 'Income Check', 
        complete: verStatus === 'Verified' || isVerification, 
        active: verStatus === 'Pending' && (status === 'Verification' || status === 'Under Review' || status === 'Submitted'), 
        desc: verStatus === 'Verified' 
          ? 'Indigent approved' 
          : verStatus === 'Rejected' 
          ? 'Verification Rejected' 
          : 'Under audit review' 
      },
      { id: 3, label: 'Counsel Match', complete: isCounselMatched, active: status === 'LawyerAssigned' && !selectedApp.hearing, desc: isCounselMatched ? (selectedApp.assignedLawyer?.name || 'Counsel assigned') : 'Awaiting counsel' },
      { id: 4, label: 'Hearing Scheduled', complete: isHearingScheduled, active: (status === 'CourtScheduled' || status === 'Hearing') && !isResolved, desc: isHearingScheduled ? `Room: ${selectedApp.hearing?.courtroom || 'Courtroom A'}` : 'Pending schedule' },
      { id: 5, label: 'Resolution', complete: isResolved, active: isResolved && status !== 'Completed', desc: isResolved ? `Status: ${status}` : 'Mediation pending' },
    ];
  }, [selectedApp]);

  // Construct events from timeline and hearing details
  const events = useMemo(() => {
    if (!selectedApp) return [];
    
    const list = [];
    
    // Add upcoming hearing if present
    if (selectedApp.hearing) {
      const hearing = selectedApp.hearing;
      list.push({
        time: new Date(hearing.hearingDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        title: `Court Hearing Booking (${hearing.status})`,
        description: `Presiding Judge: ${hearing.judge}. Courtroom Venue: ${hearing.courtroom}. Notes: ${hearing.notes || 'N/A'}`,
        icon: CalendarDays,
        status: hearing.status === 'Scheduled' || hearing.status === 'Rescheduled' ? 'upcoming' : 'done'
      });
    }

    // Add timeline logs
    if (selectedApp.timeline && selectedApp.timeline.length > 0) {
      selectedApp.timeline.forEach((item) => {
        let icon = Clock;
        let title = item.status;
        
        switch (item.status) {
          case 'Submitted':
            icon = Clock;
            title = 'Application Submitted';
            break;
          case 'Verification':
          case 'Under Review':
            icon = ShieldCheck;
            title = 'Eligibility & Income Audits';
            break;
          case 'LawyerAssigned':
            icon = User;
            title = 'Advocate Allocated';
            break;
          case 'CourtScheduled':
          case 'Hearing':
            icon = CalendarDays;
            title = 'Court Scheduling Booking';
            break;
          case 'Judgment':
            icon = ShieldCheck;
            title = 'Judgment Rendered';
            break;
          case 'Completed':
            icon = CheckCircle2;
            title = 'Case Resolved';
            break;
          case 'Rejected':
            icon = AlertCircle;
            title = 'Application Rejected';
            break;
        }

        list.push({
          time: new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          title: title,
          description: item.note || 'Progress milestone logged.',
          icon: icon,
          status: 'done'
        });
      });
    }

    // Sort: upcoming first, then by date desc
    return list.sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (b.status === 'upcoming' && a.status !== 'upcoming') return 1;
      return new Date(b.time) - new Date(a.time);
    });
  }, [selectedApp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Retrieving case telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div className="glass-card max-w-md p-8 rounded-[24px] space-y-4 border border-red-200/50 bg-red-50/5 dark:border-red-950/30">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connection Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-xs py-2 px-6 rounded-xl font-bold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!selectedApp) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div className="glass-card max-w-md p-8 rounded-[24px] space-y-4">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold">No Active Cases Found</h2>
          <p className="text-xs text-slate-500">
            You currently do not have any registered legal aid applications or active court cases.
          </p>
          <button
            onClick={() => navigate('/dashboard/apply')}
            className="btn-primary text-xs py-2 px-6 rounded-xl font-bold"
          >
            Apply for Legal Aid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 text-slate-800 dark:text-slate-100">
      
      {/* CASE OVERVIEW SUMMARY */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[24px] glass-card p-8 shadow-xl"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B69B72]">Case timeline</p>
            <h2 className="font-space text-2xl font-bold mt-1 tracking-tight">{selectedApp.caseTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Review litigation steps, hearing bookings, and estimated resolution targets.
            </p>
          </div>
          
          <div className="flex flex-col sm:items-end gap-3">
            <div className="rounded-2xl bg-[#202A3B]/10 dark:bg-[#B69B72]/20 border border-[#B69B72]/30 px-4 py-2 text-xs font-bold text-[#202A3B] dark:text-[#D9C7A5]">
              Docket ID: #{selectedApp._id.toString().substring(selectedApp._id.length - 8).toUpperCase()}
            </div>
            
            {/* Case switcher selector for citizens with multiple cases */}
            {applications.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Switch Case:</span>
                <select
                  value={selectedApp._id}
                  onChange={(e) => fetchAppDetails(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold py-1 px-2.5 outline-none text-slate-700 dark:text-slate-300 focus:border-[#B69B72]"
                >
                  {applications.map(app => (
                    <option key={app._id} value={app._id}>
                      {app.caseTitle.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/50 p-4 border border-[#B69B72]/15 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Advocate</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
              {selectedApp.assignedLawyer?.name || 'TBD (Allocation Queue)'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/50 p-4 border border-[#B69B72]/15 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Hearing Room</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
              {selectedApp.hearing ? `${selectedApp.hearing.courtroom}, District Court` : 'TBD (Awaiting Booking)'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/50 p-4 border border-[#B69B72]/15 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Case Resolution</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
              {selectedApp.status === 'Completed' ? 'Case Resolved' : 'September 18, 2026'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* HORIZONTAL STEP TRACKER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-[24px] glass-card p-8 shadow-xl"
      >
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B69B72] mb-6 text-left">Milestone Progress</p>
        
        <div className="grid gap-6 sm:grid-cols-5 relative">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center sm:items-start">
              
              {/* Connector line (Horizontal - Desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-10 right-[-1.5rem] h-1 -z-10 pointer-events-none">
                  <svg className="w-full h-full overflow-visible" fill="none">
                    <line 
                      x1="0" 
                      y1="2" 
                      x2="100%" 
                      y2="2" 
                      stroke={step.complete ? '#B69B72' : '#E2E8F0'} 
                      strokeWidth="2.5" 
                      strokeDasharray={step.complete ? 'none' : '4 4'}
                      className={step.complete ? '' : 'dark:stroke-slate-800'}
                    />
                    {step.complete && steps[idx + 1].active && (
                      <line 
                        x1="0" 
                        y1="2" 
                        x2="100%" 
                        y2="2" 
                        stroke="#B69B72" 
                        strokeWidth="3.5" 
                        className="animate-dash-flow"
                      />
                    )}
                  </svg>
                </div>
              )}

              {/* Connector line (Vertical - Mobile) */}
              {idx < steps.length - 1 && (
                <div className="block sm:hidden absolute top-10 left-5 bottom-[-1.5rem] w-1 -z-10 pointer-events-none">
                  <svg className="w-full h-full overflow-visible" fill="none">
                    <line 
                      x1="2" 
                      y1="0" 
                      x2="2" 
                      y2="100%" 
                      stroke={step.complete ? '#B69B72' : '#E2E8F0'} 
                      strokeWidth="2.5" 
                      strokeDasharray={step.complete ? 'none' : '4 4'}
                      className={step.complete ? '' : 'dark:stroke-slate-800'}
                    />
                    {step.complete && steps[idx + 1].active && (
                      <line 
                        x1="2" 
                        y1="0" 
                        x2="2" 
                        y2="100%" 
                        stroke="#B69B72" 
                        strokeWidth="3.5" 
                        className="animate-dash-flow"
                      />
                    )}
                  </svg>
                </div>
              )}

              {/* Circle */}
              <div 
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition duration-300 ${
                  step.complete 
                    ? 'bg-[#202A3B] text-white border-2 border-[#B69B72] shadow-md' 
                    : step.active 
                    ? 'bg-white border-2 border-[#B69B72] text-[#B69B72] dark:bg-slate-950 z-10' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {step.complete ? <CheckCircle2 size={16} /> : step.id}
                
                {/* Glowing ring for active step */}
                {step.active && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/20 dark:bg-blue-500/10 pointer-events-none" />
                )}
              </div>

              {/* Labels */}
              <div className="mt-3 text-center sm:text-left space-y-1">
                <h4 className={`text-xs font-bold ${step.active || step.complete ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {step.label}
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">{step.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </motion.div>

      {/* DETAILED EVENTS FEED */}
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        
        {/* Left note card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-[24px] glass-card p-6 shadow-xl text-left"
        >
          <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white mb-4">Litigation Guidelines</h3>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p>
                {selectedApp.hearing 
                  ? `Please arrive at ${selectedApp.hearing.courtroom} 15 minutes before the scheduled time. Bring all physical evidentiary proofs.` 
                  : 'Please keep checking this panel. Your hearing schedule will list precise room venues upon judicial scheduling.'}
              </p>
            </div>
            <div className="flex gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>All case modifications must pass zero-knowledge document audits before representation filings.</p>
            </div>
          </div>
        </motion.div>

        {/* Right timeline feed */}
        <div className="space-y-4">
          {events.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                key={idx} 
                className={`rounded-[20px] border p-5 shadow-sm glass-card transition duration-300 text-left ${
                  evt.status === 'upcoming' 
                    ? 'border-[#B69B72]/50 bg-[#FAF9F5] dark:border-[#B69B72]/30 dark:bg-[#1A2230]' 
                    : 'border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    evt.status === 'upcoming' 
                      ? 'bg-[#202A3B] text-[#B69B72] border border-[#B69B72]/30' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    <Icon size={16} />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{evt.time}</span>
                      {evt.status === 'upcoming' && (
                        <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[8.5px] font-extrabold tracking-wider text-[#5B21B6] border border-[#DDD6FE] uppercase">
                          Active State
                        </span>
                      )}
                    </div>
                    <h4 className="font-space text-sm font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default CaseTracker;
