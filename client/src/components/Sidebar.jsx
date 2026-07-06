import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Logo from './Logo';
import {
  Users, Scale, ShieldAlert, FolderOpen, Calendar,
  Sparkles, BarChart2, ChevronLeft, MessageSquare, User,
  Home, LogOut, Settings, ArrowUpRight, Zap, Shield,
  ChevronDown, Search
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role || 'User';
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('Chambers Registry');
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  const adminMenuItems = [
    { to: '/dashboard', end: true, label: 'Dashboard',   icon: Home,         group: 'overview' },
    { to: '/dashboard/users',       label: 'Users',        icon: Users,        group: 'management' },
    { to: '/dashboard/lawyers',     label: 'Lawyers',      icon: Scale,        group: 'management' },
    { to: '/dashboard/cases',       label: 'Cases',        icon: FolderOpen,   group: 'management' },
    { to: '/dashboard/scheduling',  label: 'Hearings',     icon: Calendar,     group: 'management' },
    { to: '/dashboard/applications',label: 'Legal Aid',    icon: ShieldAlert,  group: 'management' },
    { to: '/dashboard/judgments',   label: 'Precedents',   icon: Scale,        group: 'intelligence' },
    { to: '/dashboard/ai-recommend',label: 'AI Assistant', icon: Sparkles,     group: 'intelligence', aiTag: true },
    { to: '/dashboard/analytics',   label: 'Reports',      icon: BarChart2,    group: 'intelligence' },
    { to: '/dashboard/profile',     label: 'Settings',     icon: Settings,     group: 'account' },
  ];

  const userMenuItems = [
    { to: '/dashboard', end: true, label: 'Dashboard',    icon: Home,          group: 'overview' },
    { to: '/dashboard/applications',label: 'Applications', icon: ShieldAlert,   group: 'workspace' },
    { to: '/dashboard/cases',       label: 'My Cases',     icon: Scale,         group: 'workspace' },
    { to: '/dashboard/judgments',   label: 'Precedents',   icon: Scale,         group: 'workspace' },
    { to: '/dashboard/ai-recommend',label: 'AI Lawyer',    icon: Sparkles,      group: 'workspace', aiTag: true },
    { to: '/dashboard/schedule',    label: 'Schedule',     icon: Calendar,      group: 'workspace' },
    { to: '/dashboard/documents',   label: 'Documents',    icon: FolderOpen,    group: 'workspace' },
    { to: '/dashboard/messages',    label: 'Messages',     icon: MessageSquare, group: 'workspace' },
    { to: '/dashboard/profile',     label: 'Profile',      icon: User,          group: 'account' },
  ];

  const lawyerMenuItems = [
    { to: '/dashboard', end: true,  label: 'Dashboard',     icon: Home,           group: 'overview' },
    { to: '/dashboard/assigned-cases',label: 'Cases',         icon: Scale,          group: 'workspace' },
    { to: '/dashboard/my-clients',   label: 'Clients',        icon: Users,          group: 'workspace' },
    { to: '/dashboard/judgments',    label: 'Precedents',     icon: Scale,          group: 'workspace' },
    { to: '/dashboard/schedule',     label: 'Schedule',       icon: Calendar,       group: 'workspace' },
    { to: '/dashboard/documents',    label: 'Documents',      icon: FolderOpen,     group: 'workspace' },
    { to: '/dashboard/messages',     label: 'Messages',       icon: MessageSquare,  group: 'workspace' },
    { to: '/dashboard/profile',      label: 'Profile',        icon: User,           group: 'account' },
  ];

  const menuItems = role === 'Admin' ? adminMenuItems : (role === 'Lawyer' ? lawyerMenuItems : userMenuItems);

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupMeta = {
    overview:     { label: 'Overview' },
    management:   { label: 'Management' },
    intelligence: { label: 'Intelligence' },
    workspace:    { label: 'Workspace' },
    account:      { label: 'Account' },
  };

  const groupOrder = ['overview', 'management', 'intelligence', 'workspace', 'account'];
  const sections = groupOrder.reduce((acc, g) => {
    const items = filteredMenuItems.filter(i => i.group === g);
    if (items.length) acc.push({ group: g, items });
    return acc;
  }, []);

  const roleConfig = {
    Admin:    { label: 'System Control', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
    Lawyer:   { label: 'Lawyer Portal',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)' },
    User:     { label: 'Citizen Space',  color: '#B69D74', bg: 'rgba(182,157,116,0.12)', border: 'rgba(182,157,116,0.2)' },
    Applicant:{ label: 'Citizen Space',  color: '#B69D74', bg: 'rgba(182,157,116,0.12)', border: 'rgba(182,157,116,0.2)' },
  };
  const rc = roleConfig[role] || roleConfig['User'];
  const userInitial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col select-none transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[268px] opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0D1626 0%, #111E32 30%, #0F1A2D 70%, #0D1626 100%)',
        borderRight: collapsed ? 'none' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: collapsed ? 'none' : '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top glow line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #B69D74, #3B82F6, #8B5CF6, transparent)', opacity: 0.5 }} />

      {/* ── HEADER ── */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated logo mark */}
            <div
              className="sidebar-logo-mark h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ background: 'rgba(182,157,116,0.1)', border: '1px solid rgba(182,157,116,0.2)' }}
            >
              <div className="absolute inset-0 sidebar-logo-shimmer" />
              <Logo className="h-5 w-5 text-[#B69D74] relative z-10" strokeWidth={2} />
            </div>

            <div>
              <p
                className="text-[15px] font-black text-white leading-none tracking-wide uppercase"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Seven Seas
              </p>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: '#B69D74' }}>
                {rc.label}
              </p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="sidebar-collapse-btn h-7 w-7 rounded-lg flex items-center justify-center transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft size={13} />
          </button>
        </div>

        {/* User identity chip */}
        <div
          className="sidebar-user-chip mt-4 flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{
              background: rc.color === '#B69D74'
                ? 'linear-gradient(135deg,#9A7E55,#B69D74)'
                : rc.color === '#3B82F6'
                ? 'linear-gradient(135deg,#1D4ED8,#3B82F6)'
                : 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
            }}
          >
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: rc.color }}>
              {role}
            </p>
          </div>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
 
        {/* Workspace Switcher */}
        <div className="relative mt-3">
          <button
            onClick={() => setShowWorkspaces(!showWorkspaces)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-left text-xs text-white hover:bg-white/10 transition duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-[#B69D74]/20 border border-[#B69D74]/30 flex items-center justify-center shrink-0">
                <Zap size={10} className="text-[#B69D74]" />
              </div>
              <span className="font-bold truncate text-[11px] text-slate-350">{activeWorkspace}</span>
            </div>
            <ChevronDown size={11} className={`text-white/40 transition-transform ${showWorkspaces ? 'rotate-180' : ''}`} />
          </button>
          {showWorkspaces && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl bg-[#0F172A] border border-white/10 shadow-2xl z-50 space-y-0.5 animate-fade-in-down">
              {['Chambers Registry', 'AI Sandbox', 'Supreme Command'].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setActiveWorkspace(w);
                    setShowWorkspaces(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition"
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* ── SEARCH INPUT ── */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B69D74]/50 focus:ring-1 focus:ring-[#B69D74]/20 transition"
          />
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll">
        {sections.map(({ group, items }, si) => (
          <div key={group} className={si > 0 ? 'mt-5' : ''}>
            <p
              className="px-3 mb-2 text-[9.5px] font-extrabold tracking-[0.18em] uppercase flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span className="flex-1">{groupMeta[group]?.label}</span>
              <span style={{ height: '1px', background: 'rgba(255,255,255,0.06)', flex: 1 }} />
            </p>

            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `sidebar-nav-item group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-150 relative overflow-hidden ${
                        isActive
                          ? 'sidebar-nav-active text-[#E6D5B8] font-semibold'
                          : 'text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.85)]'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'linear-gradient(90deg, rgba(182,157,116,0.12), rgba(182,157,116,0.04))',
                    } : {}}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="sidebar-active-bar" style={{ background: '#B69D74' }} />
                        )}
                        
                        {/* Icon container */}
                        <div
                          className={`sidebar-icon-wrap h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive ? 'shadow-sm' : ''
                          }`}
                          style={isActive
                            ? { background: 'rgba(182,157,116,0.2)', color: '#B69D74' }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }
                          }
                        >
                          <Icon size={13} className="transition-colors" />
                        </div>

                        <span className="truncate flex-1 nav-label">{item.label}</span>

                        {item.aiTag && (
                          <span
                            className="text-[7.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full nav-label"
                            style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.25)' }}
                          >
                            AI
                          </span>
                        )}
                        
                        {isActive && (
                          <div className="sidebar-active-glow" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── FOOTER ── */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* System status */}
        <div
          className="sidebar-status flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-semibold text-emerald-400">System Operational</p>
            <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>All services online</p>
          </div>
          <Shield size={12} style={{ color: 'rgba(34,197,94,0.6)' }} />
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="sidebar-logout-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-150 text-left group"
        >
          <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all" style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.5)' }}>
            <LogOut size={13} />
          </div>
          <span className="nav-label" style={{ color: 'rgba(239,68,68,0.55)' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
