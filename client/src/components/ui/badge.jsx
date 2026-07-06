import { cn } from '../../lib/utils';

const Badge = ({ variant = 'default', className, children, ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200',
    slate: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase shadow-sm',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
