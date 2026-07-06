import { useContext, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
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
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

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
            <Route path="notifications" element={user.role === 'Admin' ? <AdminDashboard activeTab="notifications" /> : (user.role === 'Lawyer' ? <LawyerDashboard activeTab="notifications" /> : <ApplicantDashboard activeTab="notifications" />)} />
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
