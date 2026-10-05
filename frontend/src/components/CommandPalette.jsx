import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, ArrowRight, Shield, FileText, Users, Eye, Sparkles } from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Command items definitions
  const baseItems = [
    { name: 'Assign Lawyer', category: 'Operational Command', shortcut: '⌘ + A', keyword: 'assign lawyer representation allocation', action: () => navigate('/dashboard/applications') },
    { name: 'View Active Case: CASE-SL-8201', category: 'Cases Search', shortcut: '⌘ + 1', keyword: 'case 2025 case-sl-8201 civil dispute', action: () => navigate('/dashboard/cases') },
    { name: 'Review Pending Applications', category: 'Applications Control', shortcut: '⌘ + P', keyword: 'pending legal aid eligibility', action: () => navigate('/dashboard/applications') },
    { name: 'Interactive Schedule Planner', category: 'Court Scheduling', shortcut: '⌘ + S', keyword: 'schedule hearing courtroom conflict calendar', action: () => navigate('/dashboard/scheduling') },
    { name: 'Database Backups Console', category: 'System Administration', shortcut: '⌘ + B', keyword: 'database backups restore mongodb settings', action: () => navigate('/dashboard/settings') },
    { name: 'Toggle Light/Dark Theme', category: 'System Settings', shortcut: 'T + D', keyword: 'theme mode dark light background toggle', action: () => {
      const current = localStorage.getItem('legalAidTheme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('legalAidTheme', next);
      window.location.reload();
    }}
  ];

  // Hotkey listener: Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-command-palette', handleToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleToggle);
    };
  }, []);

  // Lock scroll and focus inputs
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Search logic covering queries and keyword flags
  const filteredItems = baseItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.keyword.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/60 p-4 pt-[15vh] backdrop-blur-md select-none"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-950/95 backdrop-blur-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, lawyers, or type operational command commands (e.g. 'assign lawyer')..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-white"
          />
          <kbd className="hidden items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-sans text-[10px] font-bold text-slate-450 dark:border-slate-800 dark:bg-slate-900 sm:flex shrink-0 ml-2">
            ESC
          </kbd>
        </div>

        {/* Dynamic Matches List */}
        <div className="max-h-[340px] overflow-y-auto p-3">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      {item.category.includes('Command') && <Sparkles size={14} className="text-purple-500" />}
                      {item.category.includes('Cases') && <FileText size={14} className="text-blue-500" />}
                      {item.category.includes('Applications') && <Users size={14} className="text-amber-500" />}
                      {item.category.includes('Scheduling') && <Calendar size={14} className="text-emerald-500" />}
                      {item.category.includes('Settings') && <Eye size={14} />}
                      {item.category.includes('Administration') && <Shield size={14} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-850 dark:text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.category}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 dark:bg-slate-900">
                    {item.shortcut}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <Command size={24} className="mx-auto text-slate-350 opacity-60" />
              <p className="mt-2 text-xs font-bold">No operational commands match your query.</p>
              <p className="text-[10px] text-slate-400 mt-1">Try typing 'assign lawyer', 'case 2025', or 'pending'.</p>
            </div>
          )}
        </div>

        {/* Command palette hint text footer */}
        <div className="flex justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
          <span>Use commands to skip dashboard navigation.</span>
          <span className="flex items-center gap-1"><Command size={10} /> + K to toggle anytime</span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
