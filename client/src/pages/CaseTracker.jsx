import { useMemo } from 'react';
import { 
  Clock, CheckCircle2, CalendarDays, ShieldCheck, AlertCircle, 
  MapPin, User, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const caseEvents = [
  { time: 'Today, 11:30 AM', title: 'Hearing confirmed', description: 'Your preliminary hearing is set in Courtroom C. Judge Ramesh presiding.', icon: CalendarDays, status: 'upcoming' },
  { time: 'Yesterday, 4:15 PM', title: 'Affidavits verified', description: 'Secure vault audit complete. Evidence packet uploaded successfully.', icon: ShieldCheck, status: 'done' },
  { time: 'June 28, 2026', title: 'Advocate Assigned', description: 'Aisha Verma matched your case requirements with 96% confidence score.', icon: CheckCircle2, status: 'done' },
  { time: 'June 25, 2026', title: 'Eligibility Approved', description: 'Income check passed. Legal aid credentials verified.', icon: CheckCircle2, status: 'done' },
  { time: 'June 24, 2026', title: 'Application submitted', description: 'Lexora scheduling request created under Docket #3842-DL.', icon: Clock, status: 'done' },
];

const CaseTracker = () => {
  const steps = useMemo(
    () => [
      { id: 1, label: 'Submission', complete: true, desc: 'Docket created' },
      { id: 2, label: 'Income Check', complete: true, desc: 'Indigent approved' },
      { id: 3, label: 'Counsel Match', complete: true, desc: 'Aisha Verma assigned' },
      { id: 4, label: 'Hearing Scheduled', complete: false, desc: 'Pending courtroom', active: true },
      { id: 5, label: 'Resolution', complete: false, desc: 'Court decision' },
    ],
    []
  );

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
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-blue-600 dark:text-blue-400">Lexora Case timeline</p>
            <h2 className="font-space text-2xl font-bold mt-1 tracking-tight">Active Case Tracking</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Review litigation steps, hearing bookings, and estimated resolution targets.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            Docket ID: #3842-DL
          </div>
        </div>

        {/* METADATA GRID */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-900/50 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Advocate</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Aisha Verma</p>
          </div>
          <div className="rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-900/50 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Hearing Room</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">Courtroom C, District Court</p>
          </div>
          <div className="rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-900/50 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Case Resolution</p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">September 18, 2026</p>
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
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-purple-600 dark:text-purple-450 mb-6 text-left">Milestone Progress</p>
        
        <div className="grid gap-6 sm:grid-cols-5 relative">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center sm:items-start">
              
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-10 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
              )}
              {idx < steps.length - 1 && steps[idx + 1].complete && (
                <div className="hidden sm:block absolute top-5 left-10 right-0 h-0.5 bg-blue-600 -z-10" />
              )}

              {/* Circle */}
              <div 
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition duration-300 ${
                  step.complete 
                    ? 'bg-blue-600 text-white' 
                    : step.active 
                    ? 'bg-white border-2 border-blue-500 text-blue-600 ring-4 ring-blue-100/50 dark:bg-slate-950 dark:ring-blue-950/30' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {step.complete ? <CheckCircle2 size={16} /> : step.id}
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
              <p>Please arrive at District Court Room C 15 minutes before the docket call. Bring printouts of verified affidavits.</p>
            </div>
            <div className="flex gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>All case modifications must pass zero-knowledge document audits before representation filings.</p>
            </div>
          </div>
        </motion.div>

        {/* Right timeline feed */}
        <div className="space-y-4">
          {caseEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                key={idx} 
                className={`rounded-[20px] border p-5 shadow-sm glass-card transition duration-300 text-left ${
                  evt.status === 'upcoming' 
                    ? 'border-blue-300 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20' 
                    : 'border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    evt.status === 'upcoming' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    <Icon size={16} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{evt.time}</span>
                      {evt.status === 'upcoming' && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-950 dark:text-blue-300">
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
