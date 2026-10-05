import StatCard from '../components/StatCard';
import { Calendar, CheckCircle2, AlertTriangle, HelpCircle, Layers } from 'lucide-react';

const StaffDashboard = () => {
  // Occupancy list
  const courtrooms = [
    { name: 'Courtroom A', status: 'In Use', load: 'High', color: 'bg-blue-500' },
    { name: 'Courtroom B', status: 'Available', load: 'None', color: 'bg-emerald-500' },
    { name: 'Courtroom C', status: 'In Use', load: 'Moderate', color: 'bg-blue-500' },
    { name: 'Courtroom D', status: 'Maintenance', load: 'None', color: 'bg-amber-500' },
    { name: 'Courtroom E', status: 'Available', load: 'None', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Scheduled Hearings" value="23" subtitle="Assigned next 7 days" trend="+4 today" />
        <StatCard title="Pending Approvals" value="14" subtitle="Indigency reviews required" trend="Attention" />
        <StatCard title="Courtroom Occupancy" value="60%" subtitle="Physical hall capacity" trend="Moderate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        
        {/* Courtroom grids occupancy simulator */}
        <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/40 p-6 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Court capacity</p>
              <h3 className="font-space text-base font-bold text-slate-900 dark:text-white mt-1">Courtrooms Occupancy Status</h3>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              5 Rooms
            </span>
          </div>

          {/* occupancy rows */}
          <div className="mt-6 space-y-3">
            {courtrooms.map((room, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 transition hover:border-blue-500/40"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${room.color}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{room.name}</p>
                    <p className="text-[10px] text-slate-400">Filing Load: {room.load}</p>
                  </div>
                </div>

                <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  room.status === 'Available' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' 
                    : room.status === 'In Use' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' 
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CALENDAR SCHEDULER WIDGET */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-xl relative overflow-hidden">
            <h4 className="font-space text-xs font-bold uppercase tracking-wider text-blue-400">Calendar Directives</h4>
            <p className="mt-4 text-3xl font-bold font-space">July 2026</p>
            <p className="text-xs text-slate-400 mt-1">Reviewing courtroom assignments and scheduling hearings.</p>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/40 p-6 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/40">
            <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white mb-4">Operations</h3>
            <div className="space-y-2">
              <button className="w-full rounded-2xl bg-blue-600 py-3 text-center text-xs font-bold text-white shadow-md hover:bg-blue-500 transition">
                Configure New Hearing
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3 text-center text-xs font-bold hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800">
                Audits Document Uploads
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StaffDashboard;
