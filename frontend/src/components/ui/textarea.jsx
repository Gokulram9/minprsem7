import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[120px] w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export default Textarea;
