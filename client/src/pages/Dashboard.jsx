import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import ApplicantDashboard from './ApplicantDashboard';
import LawyerDashboard from './LawyerDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';
import CaseTracker from './CaseTracker';
import Notifications from './Notifications';
import Documents from './Documents';
import TopBar from '../components/TopBar';
import FindLawyers from './FindLawyers';
import LawyerProfile from './LawyerProfile';
import JudgmentsSearch from './JudgmentsSearch';
import CaseDetailsPage from './CaseDetailsPage';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const isCitizen = user?.role === 'User' || user?.role === 'Applicant';
    const isLawyer = user?.role === 'Lawyer';
    const isAdmin = user?.role === 'Admin' || user?.role === 'CourtStaff';
    
    if (isCitizen) {
      document.documentElement.style.setProperty('--gold-500', '#C5A87C');
      document.documentElement.style.setProperty('--gold-600', '#A38558');
      
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-app', '#0A0F1D');
        document.documentElement.style.setProperty('--bg-card', '#13192B');
        document.documentElement.style.setProperty('--text-primary', '#F1F5F9');
        document.documentElement.style.setProperty('--text-secondary', '#94A3B8');
        document.documentElement.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.08)');
      } else {
        document.documentElement.style.setProperty('--bg-app', '#F8FAFC');
        document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
        document.documentElement.style.setProperty('--text-primary', '#0F172A');
        document.documentElement.style.setProperty('--text-secondary', '#475569');
        document.documentElement.style.setProperty('--border-color', 'rgba(15, 23, 42, 0.06)');
      }
    } else if (isLawyer) {
      document.documentElement.style.setProperty('--color-brand-primary', '#60B3D1');
      
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-app', '#011220');
        document.documentElement.style.setProperty('--bg-card', '#012641');
        document.documentElement.style.setProperty('--text-primary', '#F4FBFD');
        document.documentElement.style.setProperty('--text-secondary', '#CBE3ED');
        document.documentElement.style.setProperty('--border-color', 'rgba(244, 251, 253, 0.1)');
      } else {
        document.documentElement.style.setProperty('--bg-app', '#F4FBFD');
        document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
        document.documentElement.style.setProperty('--text-primary', '#012641');
        document.documentElement.style.setProperty('--text-secondary', '#21435E');
        document.documentElement.style.setProperty('--border-color', 'rgba(1, 38, 65, 0.1)');
      }
    } else if (isAdmin) {
      document.documentElement.style.setProperty('--purple-500', '#AEA668');
      document.documentElement.style.setProperty('--purple-600', '#908852');
      document.documentElement.style.setProperty('--purple-700', '#736B3D');
      
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-app', '#13141A');
        document.documentElement.style.setProperty('--bg-card', '#212530');
        document.documentElement.style.setProperty('--text-primary', '#E9EAEC');
        document.documentElement.style.setProperty('--text-secondary', '#C7C9CD');
        document.documentElement.style.setProperty('--border-color', 'rgba(233, 234, 236, 0.1)');
      } else {
        document.documentElement.style.setProperty('--bg-app', '#E9EAEC');
        document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
        document.documentElement.style.setProperty('--text-primary', '#212530');
        document.documentElement.style.setProperty('--text-secondary', '#4C505C');
        document.documentElement.style.setProperty('--border-color', 'rgba(33, 37, 48, 0.1)');
      }
    } else {
      document.documentElement.style.removeProperty('--gold-500');
      document.documentElement.style.removeProperty('--gold-600');
      document.documentElement.style.removeProperty('--color-brand-primary');
      document.documentElement.style.removeProperty('--purple-500');
      document.documentElement.style.removeProperty('--purple-600');
      document.documentElement.style.removeProperty('--purple-700');
      document.documentElement.style.removeProperty('--bg-app');
      document.documentElement.style.removeProperty('--bg-card');
      document.documentElement.style.removeProperty('--text-primary');
      document.documentElement.style.removeProperty('--text-secondary');
      document.documentElement.style.removeProperty('--border-color');
    }

    return () => {
      document.documentElement.style.removeProperty('--gold-500');
      document.documentElement.style.removeProperty('--gold-600');
      document.documentElement.style.removeProperty('--color-brand-primary');
      document.documentElement.style.removeProperty('--purple-500');
      document.documentElement.style.removeProperty('--purple-600');
      document.documentElement.style.removeProperty('--purple-700');
      document.documentElement.style.removeProperty('--bg-app');
      document.documentElement.style.removeProperty('--bg-card');
      document.documentElement.style.removeProperty('--text-primary');
      document.documentElement.style.removeProperty('--text-secondary');
      document.documentElement.style.removeProperty('--border-color');
    };
  }, [user, theme]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-app)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Loading workspace…</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const roleComponents = {
    User:       <ApplicantDashboard />,
    Lawyer:     <LawyerDashboard />,
    Admin:      <AdminDashboard />,
    Applicant:  <ApplicantDashboard />,
    CourtStaff: <AdminDashboard />,
  };

  return (
    <div className="app-layout">
      {/* Mobile backdrop overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      {/* ── STICKY SIDEBAR ── */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* ── MAIN AREA ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <TopBar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Page Content */}
        <main className="main-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Routes>
            <Route
              index
              element={
                user.role === 'Admin' ? (
                  <AdminDashboard activeTab="dashboard" />
                ) : user.role === 'Lawyer' ? (
                  <LawyerDashboard activeTab="dashboard" />
                ) : (
                  <ApplicantDashboard activeTab="dashboard" />
                )
              }
            />
            <Route path="track"         element={<CaseTracker />} />
            <Route path="find-lawyers"  element={<FindLawyers />} />
            <Route path="lawyers/:lawyerId" element={<LawyerProfile />} />
            <Route path="cases/:caseId" element={<CaseDetailsPage />} />
            <Route path="judgments"     element={<JudgmentsSearch />} />
            
            {/* Admin Management Routes */}
            <Route path="users"         element={user.role === 'Admin' ? <AdminDashboard activeTab="users" /> : <Navigate to="/" replace />} />
            <Route path="lawyers"       element={user.role === 'Admin' ? <AdminDashboard activeTab="lawyers" /> : <Navigate to="/" replace />} />
            <Route path="judges"        element={user.role === 'Admin' ? <AdminDashboard activeTab="judges" /> : <Navigate to="/" replace />} />
            <Route path="scheduling"    element={user.role === 'Admin' ? <AdminDashboard activeTab="scheduling" /> : <Navigate to="/" replace />} />
            <Route path="analytics"     element={user.role === 'Admin' ? <AdminDashboard activeTab="analytics" /> : <Navigate to="/" replace />} />
            
            {/* Shared / Dynamic Routing */}
            <Route path="apply"         element={user.role === 'User' || user.role === 'Applicant' ? <ApplicantDashboard activeTab="apply" /> : <Navigate to="/" replace />} />
            <Route path="applications"  element={user.role === 'Admin' ? <AdminDashboard activeTab="applications" /> : <ApplicantDashboard activeTab="applications" />} />
            <Route path="cases"         element={user.role === 'Admin' ? <AdminDashboard activeTab="cases" /> : (user.role === 'Lawyer' ? <LawyerDashboard activeTab="assigned-cases" /> : <ApplicantDashboard activeTab="cases" />)} />
            <Route path="ai-recommend"  element={user.role === 'Admin' ? <AdminDashboard activeTab="ai-recommend" /> : <ApplicantDashboard activeTab="ai-recommend" />} />
            <Route path="assigned-lawyer" element={user.role === 'User' || user.role === 'Applicant' ? <ApplicantDashboard activeTab="assigned-lawyer" /> : <Navigate to="/" replace />} />
            <Route path="schedule"      element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="schedule" /> : (user.role === 'User' || user.role === 'Applicant' ? <ApplicantDashboard activeTab="schedule" /> : <Navigate to="/" replace />)} />
            <Route path="timeline"      element={<Navigate to="../schedule" replace />} />
            <Route path="schedule-timeline" element={<Navigate to="../schedule" replace />} />
            <Route path="documents"     element={user.role === 'Admin' ? <AdminDashboard activeTab="documents" /> : (user.role === 'Lawyer' ? <LawyerDashboard activeTab="documents" /> : <ApplicantDashboard activeTab="documents" />)} />
            <Route path="messages"      element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="messages" /> : <ApplicantDashboard activeTab="messages" />} />
            <Route path="fees"          element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="fees" /> : <ApplicantDashboard activeTab="fees" />} />
            <Route path="feedback"      element={<Navigate to="../profile" replace />} />
            <Route path="help"          element={<Navigate to="../profile" replace />} />
            <Route path="profile"       element={user.role === 'Admin' ? <AdminDashboard activeTab="profile" /> : (user.role === 'Lawyer' ? <LawyerDashboard activeTab="profile" /> : <ApplicantDashboard activeTab="profile" />)} />
            <Route path="settings"      element={<Navigate to="../profile" replace />} />
            
            {/* Lawyer-Exclusive Routes */}
            <Route path="assigned-cases" element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="assigned-cases" /> : <Navigate to="/" replace />} />
            <Route path="my-clients"     element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="my-clients" /> : <Navigate to="/" replace />} />
            <Route path="court-calendar" element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="court-calendar" /> : <Navigate to="/" replace />} />
            <Route path="todays-hearings" element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="todays-hearings" /> : <Navigate to="/" replace />} />
            <Route path="appointments"   element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="appointments" /> : <Navigate to="/" replace />} />
            <Route path="case-notes"     element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="case-notes" /> : <Navigate to="/" replace />} />
            <Route path="reports"        element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="reports" /> : <Navigate to="/" replace />} />
            <Route path="performance"    element={user.role === 'Lawyer' ? <LawyerDashboard activeTab="performance" /> : <Navigate to="/" replace />} />
            
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
