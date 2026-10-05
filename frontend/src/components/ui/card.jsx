import { cn } from '../../lib/utils';

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.2)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_120px_-48px_rgba(15,23,42,0.25)] dark:border-slate-700/80 dark:bg-slate-950/85',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
