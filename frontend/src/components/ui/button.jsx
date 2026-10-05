import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-900 focus-visible:ring-sky-400/60',
  secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-sky-400/50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-sky-400/50',
  outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-sky-400/50',
};

const sizes = {
  default: 'h-12 px-6 text-sm',
  sm: 'h-10 px-4 text-sm',
  lg: 'h-14 px-8 text-base',
};

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-[1.25rem] font-semibold transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  />
));

Button.displayName = 'Button';

export default Button;
