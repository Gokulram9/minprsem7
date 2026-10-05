import { cn } from '../lib/utils';

const StatCard = ({ title, value, subtitle, trend, className }) => (
  <div 
    className={cn(
      'rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60',
      className
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wider font-bold text-slate-400">{title}</p>
      {trend && (
        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
          trend.startsWith('+') 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' 
            : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="mt-4 font-space text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
    {subtitle && <p className="mt-2 text-xs text-slate-400 leading-normal">{subtitle}</p>}
  </div>
);

export default StatCard;
