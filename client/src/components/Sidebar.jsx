import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Logo from './Logo';
import {
  Users, Scale, ShieldAlert, FolderOpen, Calendar,
  Sparkles, BarChart2, ChevronLeft, MessageSquare, User,
  Home, LogOut, Settings, ArrowUpRight, Zap, Shield,
  ChevronDown, Search, CreditCard, Gavel
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
    { to: '/dashboard/judges',      label: 'Judges',       icon: Gavel,        group: 'management' },
    { to: '/dashboard/cases',       label: 'Cases',        icon: FolderOpen,   group: 'management' },
    { to: '/dashboard/scheduling',  label: 'Hearings',     icon: Calendar,     group: 'management' },
    { to: '/dashboard/applications',label: 'Legal Aid',    icon: ShieldAlert,  group: 'management' },
    { to: '/dashboard/messages',    label: 'Communications', icon: MessageSquare, group: 'management' },
    { to: '/dashboard/judgments',   label: 'Precedents',   icon: Scale,        group: 'intelligence' },
    { to: '/dashboard/analytics',   label: 'Reports',      icon: BarChart2,    group: 'intelligence' },
    { to: '/dashboard/profile',     label: 'Settings',     icon: Settings,     group: 'account' },
  ];

  const courtStaffMenuItems = [
    { to: '/dashboard', end: true,  label: 'Dashboard',       icon: Home,          group: 'overview' },
    { to: '/dashboard/cases',       label: 'Case Dockets',    icon: FolderOpen,    group: 'management' },
    { to: '/dashboard/scheduling',  label: 'Hearings Schedule', icon: Calendar,    group: 'management' },
    { to: '/dashboard/messages',    label: 'Communications',  icon: MessageSquare, group: 'workspace' },
    { to: '/dashboard/documents',   label: 'Documents',       icon: FolderOpen,    group: 'workspace' },
    { to: '/dashboard/profile',     label: 'Profile',         icon: User,          group: 'account' },
  ];

  const userMenuItems = [
    { to: '/dashboard', end: true, label: 'Dashboard',    icon: Home,          group: 'overview' },
    { to: '/dashboard/applications',label: 'Applications', icon: ShieldAlert,   group: 'workspace' },
    { to: '/dashboard/cases',       label: 'My Cases',     icon: Scale,         group: 'workspace' },
    { to: '/dashboard/fees',        label: 'Lawyer Fees',  icon: CreditCard,    group: 'workspace' },
    { to: '/dashboard/judgments',   label: 'Precedents',   icon: Scale,         group: 'workspace' },
    { to: '/dashboard/ai-recommend',label: 'AI Lawyer Match', icon: Sparkles,      group: 'workspace', aiTag: true },
    { to: '/dashboard/schedule',    label: 'Schedule',     icon: Calendar,      group: 'workspace' },
    { to: '/dashboard/documents',   label: 'Documents',    icon: FolderOpen,    group: 'workspace' },
    { to: '/dashboard/messages',    label: 'Messages',     icon: MessageSquare, group: 'workspace' },
    { to: '/dashboard/profile',     label: 'Profile',      icon: User,          group: 'account' },
  ];

  const lawyerMenuItems = [
    { to: '/dashboard', end: true,  label: 'Dashboard',     icon: Home,           group: 'overview' },
    { to: '/dashboard/assigned-cases',label: 'Cases',         icon: Scale,          group: 'workspace' },
    { to: '/dashboard/my-clients',   label: 'Clients',        icon: Users,          group: 'workspace' },
    { to: '/dashboard/fees',         label: 'Client Fees',    icon: CreditCard,     group: 'workspace' },
    { to: '/dashboard/judgments',    label: 'Precedents',     icon: Scale,          group: 'workspace' },
    { to: '/dashboard/schedule',     label: 'Schedule',       icon: Calendar,       group: 'workspace' },
    { to: '/dashboard/documents',    label: 'Documents',      icon: FolderOpen,     group: 'workspace' },
    { to: '/dashboard/messages',     label: 'Messages',       icon: MessageSquare,  group: 'workspace' },
    { to: '/dashboard/profile',      label: 'Profile',        icon: User,           group: 'account' },
  ];

  const judgeMenuItems = [
    { to: '/dashboard', end: true,  label: 'Dashboard',       icon: Home,           group: 'overview' },
    { to: '/dashboard/assigned-cases',label: 'My Cases',       icon: Scale,          group: 'workspace' },
    { to: '/dashboard/todays-hearings',label: "Today's Bench", icon: Gavel,          group: 'workspace' },
    { to: '/dashboard/schedule',     label: 'Calendar',       icon: Calendar,       group: 'workspace' },
    { to: '/dashboard/documents',    label: 'Documents',      icon: FolderOpen,     group: 'workspace' },
    { to: '/dashboard/judgments',    label: 'Precedents',     icon: Scale,          group: 'intelligence' },
    { to: '/dashboard/profile',      label: 'Chambers Profile', icon: User,         group: 'account' },
  ];

  const menuItems = role === 'Admin' ? adminMenuItems : (role === 'CourtStaff' ? courtStaffMenuItems : (role === 'Lawyer' ? lawyerMenuItems : (role === 'Judge' ? judgeMenuItems : userMenuItems)));

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
    Admin:    { label: 'Court Administration', color: '#B69B72', bg: 'rgba(182,155,114,0.15)', border: 'rgba(182,155,114,0.3)', iconBg: 'rgba(182,155,114,0.25)' },
    CourtStaff:{ label: 'Court Registry & Staff', color: '#B69B72', bg: 'rgba(182,155,114,0.15)', border: 'rgba(182,155,114,0.3)', iconBg: 'rgba(182,155,114,0.25)' },
    Lawyer:   { label: 'Advocate Chambers',    color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)',  border: 'rgba(217,199,165,0.3)',  iconBg: 'rgba(217,199,165,0.25)' },
    Judge:    { label: 'Judicial Bench',       color: '#B69B72', bg: 'rgba(182,155,114,0.15)', border: 'rgba(182,155,114,0.3)', iconBg: 'rgba(182,155,114,0.25)' },
    User:     { label: 'Citizen Portal',       color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)',  border: 'rgba(217,199,165,0.3)',  iconBg: 'rgba(217,199,165,0.25)' },
    Applicant:{ label: 'Citizen Portal',       color: '#D9C7A5', bg: 'rgba(217,199,165,0.15)',  border: 'rgba(217,199,165,0.3)',  iconBg: 'rgba(217,199,165,0.25)' },
  };
  const rc = roleConfig[role] || roleConfig['User'];
  const userInitial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col select-none transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[268px] opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #202A3B 0%, #171F2D 50%, #0E131D 100%)',
        borderRight: collapsed ? 'none' : '1px solid rgba(245,245,239,0.08)',
        boxShadow: collapsed ? 'none' : '4px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── HEADER ── */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="sidebar-logo-mark h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
            >
              <Logo className="h-5 w-5 relative z-10" strokeWidth={2} style={{ color: rc.color }} />
            </div>

            <div>
              <p
                className="text-[15px] font-extrabold leading-none tracking-wide text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Seven Seas
              </p>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1 text-slate-400">
                {rc.label}
              </p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="sidebar-collapse-btn h-7 w-7 rounded-lg flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            title="Collapse sidebar"
          >
            <ChevronLeft size={13} />
          </button>
        </div>

        {/* User identity chip */}
        <div
          className="sidebar-user-chip mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
          style={{ background: rc.bg, borderColor: rc.border }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${rc.color}, #202A3B)`,
            }}
          >
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] font-bold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: rc.color }}>
              {rc.label}
            </p>
          </div>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
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
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B69B72]/50 focus:ring-1 focus:ring-[#B69B72]/20 transition"
          />
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll">
        {sections.map(({ group, items }, si) => (
          <div key={group} className={si > 0 ? 'mt-5' : ''}>
            <p
              className="px-3 mb-2 text-[9.5px] font-extrabold tracking-[0.18em] uppercase flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)' }}
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
                          ? 'sidebar-nav-active font-semibold'
                          : 'text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.85)]'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      color: '#FFFFFF',
                      background: `linear-gradient(90deg, ${rc.bg}, rgba(255,255,255,0.01))`,
                    } : {}}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="sidebar-active-bar" style={{ background: rc.color }} />
                        )}
                        
                        {/* Icon container */}
                        <div
                          className={`sidebar-icon-wrap h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive ? 'shadow-sm' : ''
                          }`}
                          style={isActive
                            ? { background: rc.iconBg, color: rc.color }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }
                          }
                        >
                          <Icon size={13} className="transition-colors" />
                        </div>

                        <span className="truncate flex-1 nav-label">{item.label}</span>

                        {item.aiTag && (
                          <span
                            className="text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-full nav-label"
                            style={{ background: '#EDE9FE', color: '#5B21B6', border: '1px solid #DDD6FE' }}
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
