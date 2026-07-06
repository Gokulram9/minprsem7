import { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Search, Bell, Moon, Sun, ShieldCheck, FileText, Calendar, 
  ChevronDown, User, Layers, HelpCircle, Volume2, VolumeX, Sparkles, Command, Menu, Clock
} from 'lucide-react';
import Button from './ui/button';
import Logo from './Logo';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Audio Synthesizer for Background Ambient Music using Web Audio API
let audioCtx = null;
let osc = null;
let gainNode = null;

const Navbar = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isPortalServicesActive = location.pathname === '/find-lawyers' || location.pathname.startsWith('/dashboard/find-lawyers');

  // Component States
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs for click outside
  const megaMenuRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Counsel assigned', desc: 'Aisha Verma matched your family law request.', time: '10m ago', unread: true },
    { id: 2, title: 'Hearing scheduled', desc: 'Case #2481 is set for Courtroom A on July 12.', time: '2h ago', unread: true },
    { id: 3, title: 'Document approved', desc: 'Counsel agreement.docx passed legal audit.', time: '1d ago', unread: false }
  ]);

  // Handle music playing (synthetic ambient loops)
  const toggleMusic = () => {
    if (isPlaying) {
      if (osc) {
        try { osc.stop(); } catch(e) {}
        osc = null;
      }
      setIsPlaying(false);
    } else {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        
        osc = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        
        // Soft ambient triangle wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Low soothing sound
        
        // Add a LFO (Low Frequency Oscillator) to modulate pitch for relaxing space ambient feel
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.15; // ultra slow
        lfoGain.gain.value = 5; // sweep pitch slightly
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // ultra quiet
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio Context Init Failed:", e);
      }
    }
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'User';
  const userRole  = user?.role  || 'Guest';
  const userInitial = userName.charAt(0).toUpperCase();

  const roleMeta = {
    Admin:     { label: 'Super Admin',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', grad: 'linear-gradient(135deg,#6D28D9,#8B5CF6)' },
    Lawyer:    { label: 'Legal Counsel', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  grad: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
    User:      { label: 'Applicant',     color: '#B69D74', bg: 'rgba(182,157,116,0.12)', border: 'rgba(182,157,116,0.25)', grad: 'linear-gradient(135deg,#9A7E55,#B69D74)' },
    Applicant: { label: 'Applicant',     color: '#B69D74', bg: 'rgba(182,157,116,0.12)', border: 'rgba(182,157,116,0.25)', grad: 'linear-gradient(135deg,#9A7E55,#B69D74)' },
  };
  const meta = roleMeta[userRole] || roleMeta['User'];

  // Live clock effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdowns on click outside (refined with refs)
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) setMegaMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px) saturate(1.8)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Animated gradient top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #2563EB, #7C3AED, #B69D74, #2563EB)', backgroundSize: '200% auto', animation: 'gradientShift 4s ease infinite' }} />
      <div className="dark:hidden" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', zIndex: -1 }} />
      <div className="hidden dark:block" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(6,13,26,0.88)', backdropFilter: 'blur(20px)', zIndex: -1, borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1F2839] to-[#0D1526] text-[#B69D74] shadow-lg transition-transform group-hover:scale-105">
              <Logo className="h-6 w-6 text-[#B69D74]" strokeWidth={2} />
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" style={{ boxShadow: '0 0 8px #10B981' }} />
            </div>
            <div className="flex flex-col -gap-0.5">
              <span
                className="text-[15px] font-black leading-none tracking-[0.1em] uppercase"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(90deg, #B69D74 0%, #E6D5B8 50%, #9A7E55 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Seven Seas
              </span>
              <span className="text-[8.5px] text-slate-400 dark:text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase leading-none mt-0.5">
                Justice Portal
              </span>
            </div>
          </Link>
        </div>

        {/* MIDDLE NAV LINKS & MEGA MENU */}
        <nav className="hidden items-center gap-1 text-sm font-semibold text-[#1F2839] dark:text-slate-300 lg:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative rounded-full px-4 py-2 transition hover:text-[#B69D74] dark:hover:text-[#B69D74] hover:bg-[#B69D74]/8 ${
                isActive ? 'text-[#B69D74] dark:text-[#B69D74] bg-[#B69D74]/8 font-bold' : ''
              }`
            }
          >
            Home
          </NavLink>

          {/* MEGA MENU TOGGLE */}
          <div className="relative" ref={megaMenuRef} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => {
                setMegaMenuOpen(!megaMenuOpen);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className={`flex items-center gap-1 rounded-full px-4 py-2 transition hover:text-[#B69D74] dark:hover:text-[#B69D74] hover:bg-[#B69D74]/8 ${
                isPortalServicesActive ? 'text-[#B69D74] dark:text-[#B69D74] bg-[#B69D74]/8 font-bold' : ''
              }`}
            >
              Portal Services <ChevronDown size={14} className={`transform transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MEGA MENU BODY */}
            {megaMenuOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-[520px] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
                <p className="font-space text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Seven Seas Portal Services</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Link to="/find-lawyers" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">Lawyer Directory</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Browse and book vetted specialists.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard/track" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">Case Tracker</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Real-time scheduling milestones.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard/documents" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">Document Vault</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Secure drag & drop files.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">Aid Application</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Submit requests for court counsel.</p>
                    </div>
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><HelpCircle size={14} /> Need aid eligibility info?</span>
                    <Link to="/#faq" onClick={() => setMegaMenuOpen(false)} className="font-bold text-blue-600 hover:underline dark:text-blue-400">Read FAQs</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 transition hover:text-[#B69D74] dark:hover:text-[#B69D74] hover:bg-[#B69D74]/8 ${
                isActive ? 'text-[#B69D74] dark:text-[#B69D74] bg-[#B69D74]/8 font-bold' : ''
              }`
            }
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/workplace"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 transition hover:text-[#B69D74] dark:hover:text-[#B69D74] hover:bg-[#B69D74]/8 ${
                isActive ? 'text-[#B69D74] dark:text-[#B69D74] bg-[#B69D74]/8 font-bold' : ''
              }`
            }
          >
            Workplace
          </NavLink>
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition hover:text-[#B69D74] dark:hover:text-[#B69D74] hover:bg-[#B69D74]/8 ${
                  isActive ? 'text-[#B69D74] dark:text-[#B69D74] bg-[#B69D74]/8 font-bold' : ''
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* ── RIGHT: Actions (Aligned with TopBar design) ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Live Clock */}
          <div className="topbar-clock hidden lg:flex">
            <Clock size={11} className="text-[#B69D74] shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold text-[var(--text-primary)] font-mono tabular-nums">{currentTime}</span>
              <span className="text-[8.5px] text-[var(--text-muted)] mt-0.5">{currentDate}</span>
            </div>
          </div>

          <div className="topbar-divider hidden lg:block" />

          {/* AI Button */}
          <button className="topbar-ai-btn group" onClick={() => navigate('/dashboard/ai-recommend')}>
            <Sparkles size={11} className="text-[#B69D74] group-hover:animate-spin transition-all" />
            <span>Ask AI</span>
            <span className="topbar-ai-pulse" />
          </button>

          <div className="topbar-divider" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="topbar-icon-pill group"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun size={14} className="group-hover:text-amber-400 transition-colors" />
              : <Moon size={14} className="group-hover:text-indigo-500 transition-colors" />
            }
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="topbar-icon-pill group relative"
                  title="Notifications"
                >
                  <Bell size={14} className="group-hover:animate-bounce transition-all" />
                  {unreadCount > 0 && (
                    <span className="topbar-notif-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotifs && (
                  <div className="topbar-notif-panel animate-fade-in-down">
                    <div className="topbar-notif-header">
                      <div>
                        <p className="text-[12px] font-bold text-[var(--text-primary)]">Notifications</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{unreadCount} unread</p>
                      </div>
                      <span className="badge badge-blue text-[9px]">{unreadCount} New</span>
                    </div>
                    <div>
                      {notifications.map((n) => (
                        <div key={n.id} className="topbar-notif-item">
                          <div
                            className="topbar-notif-dot"
                            style={{ background: n.unread ? '#3B82F6' : 'transparent', border: n.unread ? 'none' : '1px solid var(--border-strong)' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{n.desc || n.body}</p>
                          </div>
                          <span className="text-[9.5px] text-[var(--text-muted)] shrink-0">{n.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="topbar-notif-footer">
                      <button 
                        onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}
                        className="text-[11px] text-[var(--blue-600)] font-semibold hover:underline"
                      >
                        Clear unread
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="topbar-divider" />

              {/* User Chip */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="topbar-user-chip group"
                >
                  <div
                    className="topbar-avatar"
                    style={{ background: meta.grad }}
                  >
                    {userInitial}
                  </div>
                  <div className="hidden sm:flex flex-col leading-none text-left">
                    <span className="text-[11px] font-semibold text-[var(--text-primary)] capitalize">{userName}</span>
                    <span className="text-[8.5px] font-bold uppercase tracking-wider mt-0.5" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                  <ChevronDown size={10} className="text-[var(--text-muted)] hidden sm:block transition-transform group-hover:rotate-180 duration-200" />
                </button>

                {/* ACCOUNT DROPDOWN WITH QUICK ROLE SWITCHER FOR DEMOS */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95" onClick={(e) => e.stopPropagation()}>
                    <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Logged in as</p>
                      <p className="font-space text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-slate-500">{user?.email}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        Role: {user?.role}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full rounded-xl bg-red-50 py-2 text-center text-xs font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        Logout Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button type="button" className="btn-secondary rounded-xl px-4 py-2 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button type="button" className="btn-primary rounded-xl px-4 py-2 text-xs font-bold bg-[#1F2839] hover:bg-[#1a2230] text-white transition">
                  Register
                </button>
              </Link>
            </div>
          )}

        </div>

      </div>
      {/* Slide-out Sidebar Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex justify-start"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full flex"
            >
              <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
