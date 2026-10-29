import { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { subscribeToNotifications } from '../services/socket';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Bell, Sun, Moon, Sparkles, ChevronDown, Menu, Clock, Layers, Calendar, FileText, ShieldCheck, HelpCircle, Search, CheckCheck, User } from 'lucide-react';
import Logo from './Logo';

const TopBar = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [liveNotifs, setLiveNotifs] = useState([]);
  const notifRef = useRef(null);
  const megaMenuRef = useRef(null);
  const profileRef = useRef(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const isPortalServicesActive = location.pathname === '/find-lawyers' || location.pathname.startsWith('/dashboard/find-lawyers');

  const getFormattedName = () => {
    if (!user?.name) return 'User';
    if (user?.role === 'Judge') {
      return user.name.replace(/^Hon\.\s*/i, '');
    }
    if (user?.role === 'Lawyer' && user.name.startsWith('Advocate ')) {
      return user.name.replace('Advocate ', 'Adv. ');
    }
    return user.name;
  };

  const userName = getFormattedName();
  const userRole  = user?.role  || 'Guest';
  const userInitial = user?.role === 'Judge'
    ? (userName.replace(/^Justice\s*/i, '').charAt(0) || 'J').toUpperCase()
    : (userName.charAt(0) || 'U').toUpperCase();

  // Fetch real notifications
  const fetchLiveNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      if (Array.isArray(res.data)) {
        setLiveNotifs(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveNotifications();
      subscribeToNotifications((newNotif) => {
        setLiveNotifs(prev => [newNotif, ...prev]);
      });
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      setLiveNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark all as read:', err.message);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read && notif._id) {
        await axios.patch(`/notifications/${notif._id}/read`);
        setLiveNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      const caseTargetId = notif.application?._id || notif.application || notif.metadata?.applicationId;
      if (caseTargetId) {
        navigate(`/dashboard/cases/${caseTargetId}`);
      } else if (user?.role === 'Lawyer') {
        navigate('/dashboard/assigned-cases');
      } else if (user?.role === 'Judge') {
        navigate('/dashboard/assigned-cases');
      } else {
        navigate('/dashboard/applications');
      }
      setShowNotifs(false);
    } catch (err) {
      console.warn(err);
    }
  };

  // Live clock
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

  const roleMeta = {
    Admin:     { label: 'Court Administration', color: '#B69B72', bg: 'rgba(182,155,114,0.15)', border: 'rgba(182,155,114,0.3)', grad: 'linear-gradient(135deg,#202A3B,#B69B72)' },
    Judge:     { label: 'Judicial Bench',       color: '#B69B72', bg: 'rgba(182,155,114,0.15)', border: 'rgba(182,155,114,0.3)', grad: 'linear-gradient(135deg,#202A3B,#B69B72)' },
    Lawyer:    { label: 'Advocate Chambers',    color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)', border: 'rgba(217,199,165,0.3)', grad: 'linear-gradient(135deg,#202A3B,#D9C7A5)' },
    User:      { label: 'Citizen Portal',       color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)', border: 'rgba(217,199,165,0.3)', grad: 'linear-gradient(135deg,#202A3B,#B69B72)' },
    Applicant: { label: 'Citizen Portal',       color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)', border: 'rgba(217,199,165,0.3)', grad: 'linear-gradient(135deg,#202A3B,#B69B72)' },
  };
  const meta = roleMeta[userRole] || roleMeta['User'];

  const notificationsList = liveNotifs.length > 0 ? liveNotifs.map(n => ({
    id: n._id || n.id,
    _id: n._id,
    title: n.title || (n.category === 'RepresentationRequest' ? 'New Representation Request' : (n.category === 'RequestAccepted' ? 'Representation Accepted! 🎉' : (n.category === 'JudgeAssigned' ? '⚖️ Presiding Judge Assigned' : 'Case Notification'))),
    body: n.message || n.body,
    time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    unread: !n.read,
    color: n.category === 'RepresentationRequest' ? '#F59E0B' : (n.category === 'RequestAccepted' ? '#10B981' : (n.category === 'JudgeAssigned' ? '#8B5CF6' : '#3B82F6')),
    category: n.category
  })) : [
    { id: 1, title: 'Portal Connected', body: 'Judicial docket synchronized with active registry.', time: 'Now', unread: false, color: '#3B82F6' },
  ];
  const unreadCount = notificationsList.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) setMegaMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="topbar-premium sticky top-0 z-30 select-none">
      <div className="flex items-center justify-between gap-4 px-5 py-3">

        {/* ── LEFT: Brand + Toggle ── */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="topbar-icon-pill group"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={15} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="topbar-brand-icon shrink-0">
              <Logo className="h-[15px] w-[15px] text-[#B69B72]" strokeWidth={2} />
            </div>
            <div className="flex flex-col -gap-0.5">
              <span
                className="text-[14px] font-bold leading-none tracking-[0.1em] uppercase"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(90deg, #B69B72 0%, #D9C7A5 50%, #9A7E55 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Seven Seas
              </span>
            </div>
          </div>
        </div>

        {/* ── CENTER: Navigation Links ── */}
        <nav className="hidden items-center gap-1 text-[13px] font-semibold text-[#202A3B] dark:text-slate-300 lg:flex mx-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 transition hover:text-[#B69B72] dark:hover:text-[#B69B72] hover:bg-[#B69B72]/8 ${
                isActive ? 'text-[#B69B72] dark:text-[#B69B72] bg-[#B69B72]/8 font-bold' : ''
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
                setShowNotifs(false);
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
                <p className="font-space text-xs font-semibold uppercase tracking-[0.2em] text-[#B69B72]">Seven Seas Portal Services</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Link to="/find-lawyers" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B]/60 text-left transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202A3B] text-[#B69B72] dark:bg-[#202A3B] dark:text-[#D9C7A5]">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#202A3B] group-hover:text-[#B69B72] dark:text-white dark:group-hover:text-[#D9C7A5]">Lawyer Directory</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Browse and book vetted specialists.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard/track" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B]/60 text-left transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B69B72]/15 text-[#B69B72] dark:bg-[#B69B72]/25 dark:text-[#D9C7A5]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#202A3B] group-hover:text-[#B69B72] dark:text-white dark:group-hover:text-[#D9C7A5]">Case Tracker</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Real-time scheduling milestones.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard/documents" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B]/60 text-left transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202A3B]/10 text-[#202A3B] dark:bg-white/10 dark:text-white">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#202A3B] group-hover:text-[#B69B72] dark:text-white dark:group-hover:text-[#D9C7A5]">Document Vault</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Secure drag & drop files.</p>
                    </div>
                  </Link>

                  <Link to="/dashboard" onClick={() => setMegaMenuOpen(false)} className="group flex gap-3 rounded-2xl p-3 hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B]/60 text-left transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#EDE9FE]/20 dark:text-[#DDD6FE]">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#202A3B] group-hover:text-[#B69B72] dark:text-white dark:group-hover:text-[#D9C7A5]">Aid Application</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Submit requests for court counsel.</p>
                    </div>
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-[#FAF9F5] p-4 dark:bg-[#202A3B]/40 border border-[#202A3B]/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><HelpCircle size={14} /> Need aid eligibility info?</span>
                    <Link to="/#faq" onClick={() => setMegaMenuOpen(false)} className="font-bold text-[#B69B72] hover:underline dark:text-[#D9C7A5]">Read FAQs</Link>
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
        </nav>

        {/* ── RIGHT: Actions ── */}
        <div className="flex items-center gap-2 shrink-0">
 




          {/* AI Button - ONLY FOR CITIZEN USER / APPLICANT */}
          {(user?.role === 'User' || user?.role === 'Applicant') && (
            <Link to="/dashboard/ai-recommend" className="btn-ai px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-xs">
              <Sparkles size={13} className="text-[#5B21B6]" />
              <span>AI Matcher</span>
            </Link>
          )}

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
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 hover:underline"
                        title="Mark all as read"
                      >
                        <CheckCheck size={12} /> Mark Read
                      </button>
                    )}
                    <span className="badge badge-blue text-[9px]">{unreadCount} New</span>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationsList.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`topbar-notif-item cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                        n.unread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div
                        className="topbar-notif-dot"
                        style={{ background: n.unread ? n.color : 'transparent', border: n.unread ? 'none' : '1px solid var(--border-strong)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-[11px] truncate ${n.unread ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-secondary)]'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-[var(--text-muted)] shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-0.5">{n.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="topbar-notif-footer flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-muted)]">Live Case Updates</span>
                  <button
                    onClick={() => {
                      if (user?.role === 'Lawyer') navigate('/dashboard/assigned-cases');
                      else navigate('/dashboard/applications');
                      setShowNotifs(false);
                    }}
                    className="text-[11px] text-[var(--blue-600)] font-semibold hover:underline"
                  >
                    View cases →
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
              onClick={() => {
                setProfileOpen(!profileOpen);
                setShowNotifs(false);
                setMegaMenuOpen(false);
              }}
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
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800 text-left">
                  <p className="text-xs text-slate-400">Logged in as</p>
                  <p className="font-space text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                  <span className="mt-1.5 inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Role: {user?.role}
                  </span>
                </div>

                <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/dashboard/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
                  >
                    <User size={14} className="text-[#B69B72]" />
                    <span>View Profile & Credentials</span>
                  </button>
                </div>

                <div className="mt-2 pt-1">
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

        </div>
      </div>
    </header>
  );
};

export default TopBar;
