import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { motion } from 'framer-motion';
import archangelRaguelImg from '../assets/archangel-raguel.png';
import { initSocket, subscribeToHearingUpdates, subscribeToCaseUpdates, subscribeToNotifications } from '../services/socket';
import ChatCenter from '../components/chat/ChatCenter';
import ProfilePage from './ProfilePage';
import {
  Users,
  Scale,
  ShieldAlert,
  FolderOpen,
  Calendar,
  Sparkles,
  FileText,
  BarChart2,
  Settings,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Shield,
  Download,
  AlertTriangle,
  UserX,
  UserPlus,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  MessageSquare,
  Home,
  Activity,
  Info,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  LockKeyhole,
  Cpu,
  FileDown,
  User,
  Gavel,
  MapPin,
  Building,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals & Details Views
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Judge & Lawyer Assignment states
  const [judges, setJudges] = useState([]);
  const [assignJudgeModalCase, setAssignJudgeModalCase] = useState(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [selectedCourtroom, setSelectedCourtroom] = useState('Courtroom Hall 1');
  const [assignJudgeNotes, setAssignJudgeNotes] = useState('');
  const [isAssigningJudge, setIsAssigningJudge] = useState(false);
  const [assignLawyerModalCase, setAssignLawyerModalCase] = useState(null);
  const [selectedLawyerId, setSelectedLawyerId] = useState('');
  const [isAssigningLawyer, setIsAssigningLawyer] = useState(false);

  // Judge Management & Court Elevation States
  const [judgeSubTab, setJudgeSubTab] = useState('registry'); // 'registry' | 'awaiting' | 'elevation-requests'
  const [judgeRecords, setJudgeRecords] = useState([]);
  const [pendingCourtChanges, setPendingCourtChanges] = useState([]);
  const [unassignedCases, setUnassignedCases] = useState([]);
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [showCreateJudgeModal, setShowCreateJudgeModal] = useState(false);
  const [createJudgeForm, setCreateJudgeForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'District Judge',
    courtLevel: 'District Court',
    courtName: 'District Court, Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    courtroom: 'Courtroom 1',
    availability: 'Available',
    status: 'Active',
    experienceYears: 10
  });
  const [reviewCourtChangeModal, setReviewCourtChangeModal] = useState(null);
  const [courtChangeDecision, setCourtChangeDecision] = useState({ status: 'Approved', remarks: '' });
  const [isSubmittingCourtChange, setIsSubmittingCourtChange] = useState(false);

  // Forms states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', role: 'User', password: 'Password@1234' });
  const [showScheduleHearingModal, setShowScheduleHearingModal] = useState(false);
  const [hearingForm, setHearingForm] = useState({ caseId: '', date: '', time: '', courtroom: 'Courtroom A', judge: 'Justice Shanmugam' });

  // Calendar View state
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'

  // Central System Logs state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'security' | 'database' | 'api'
  const [reportsTimeRange, setReportsTimeRange] = useState('30days'); // '7days' | '30days' | 'ytd'

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const appResp = await axios.get('/applications');
      const apps = appResp.data.map(a => ({
        id: a._id,
        applicant: a.applicant?.name || 'Unknown',
        income: a.monthlyIncome ? `LKR ${a.monthlyIncome.toLocaleString()}/mo` : 'TBD',
        occupation: a.occupation || 'TBD',
        caseType: a.caseType,
        date: new Date(a.createdAt).toLocaleDateString(),
        status: a.status,
        document: a.documents && a.documents.length > 0 ? a.documents[0].originalName || 'Proof.pdf' : 'NIC_Proof.pdf',
        verification: a.verificationStatus || 'Pending'
      }));
      setApplications(apps);

      if (appResp.data.length > 0) {
        const mappedCases = appResp.data.map(a => ({
          _id: a._id,
          id: a.caseId || a._id,
          title: a.caseTitle,
          type: a.caseType,
          district: a.courtDetails?.district || a.location || 'Colombo',
          tier: a.courtDetails?.courtTier || 'District Court',
          judge: a.assignedJudge ? `Justice ${a.assignedJudge.name}` : (a.judge ? `Justice ${a.judge.name}` : 'Unassigned'),
          assignedJudge: a.assignedJudge || a.judge,
          lawyer: a.assignedLawyer ? `Adv. ${a.assignedLawyer.name}` : (a.chosenLawyer ? `Req: Adv. ${a.chosenLawyer.name}` : 'Unassigned'),
          assignedLawyer: a.assignedLawyer || a.chosenLawyer,
          courtroom: a.courtDetails?.courtName || a.court || 'Courtroom Hall 1',
          priority: a.urgency || 'Medium',
          status: a.status,
          nextHearing: a.hearing?.hearingDate ? new Date(a.hearing.hearingDate).toLocaleDateString() : 'Pending Scheduling',
          applicant: a.applicant?.name || 'Unknown',
          applicantId: a.applicant?._id,
          raw: a
        }));
        setCases(mappedCases);
      }
      
      const hearingResp = await axios.get('/hearings').catch(() => ({ data: [] }));
      const hList = Array.isArray(hearingResp.data) ? hearingResp.data : (hearingResp.data?.data || []);
      if (hList.length > 0) {
        setHearings(hList.map(h => ({
          _id: h._id,
          id: h.hearingNumber ? `HR${h.hearingNumber}` : (h._id.slice(-6)),
          caseId: h.application?._id || h.application,
          caseTitle: h.application?.caseTitle || h.application?.type || 'General Litigation File',
          judge: h.judgeName || 'Justice Shanmugam',
          hall: h.courtroom || 'Courtroom Hall 1',
          date: new Date(h.hearingDate).toLocaleDateString(),
          time: h.timeSlot || '10:00 AM',
          status: h.status || 'Scheduled'
        })));
      }
      const userResp = await axios.get('/admin/users');
      const allUsers = userResp.data;
      const mappedUsers = allUsers.map(u => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || 'N/A',
        status: 'Active',
        date: new Date(u.createdAt).toLocaleDateString(),
        cases: 0
      }));
      setApplicants(mappedUsers.filter(u => u.role === 'Applicant' || u.role === 'User'));

      // Filter and register active Judges
      const judgeUsers = allUsers.filter(u => u.role === 'Judge');
      setJudges(judgeUsers);

      // Fetch verified & pending Lawyers from /admin/lawyers
      try {
        const lawyerResp = await axios.get('/admin/lawyers');
        if (lawyerResp?.data?.data && lawyerResp.data.data.length > 0) {
          setLawyers(lawyerResp.data.data.map(l => ({
            id: l._id,
            _id: l._id,
            userId: l.userId?._id || l.userId,
            name: l.fullName.startsWith('Advocate') ? l.fullName : `Advocate ${l.fullName}`,
            email: l.userId?.email || 'N/A',
            license: l.barRegistrationNumber || 'BC/VERIFIED',
            specialization: (l.specializations && l.specializations[0]) || l.specialization || 'General Practice',
            experience: l.experience || 5,
            rating: l.rating || 4.8,
            successRate: l.successRate || 85,
            status: l.availabilityStatus || 'Active',
            verification: l.verificationStatus === 'Pending' ? 'Pending Approval' : (l.verificationStatus || 'Verified'),
            availability: l.availabilityStatus || 'Available'
          })));
        } else {
          const lawyerUsers = allUsers.filter(u => u.role === 'Lawyer');
          if (lawyerUsers.length > 0) {
            setLawyers(lawyerUsers.map(l => ({
              id: l._id,
              _id: l._id,
              name: `Advocate ${l.name}`,
              email: l.email,
              license: l.barNumber || 'BC/SL/88219',
              specialization: l.specialization || 'General Practice',
              experience: l.experience || 10,
              rating: 4.8,
              successRate: 92,
              status: 'Active',
              verification: 'Verified',
              availability: 'High'
            })));
          }
        }
      } catch (err) {
        console.warn('Could not load /admin/lawyers:', err);
      }

      // Fetch dedicated Judge records from /judges/all
      try {
        const judgeResp = await axios.get('/judges/all');
        if (judgeResp.data?.data) {
          setJudgeRecords(judgeResp.data.data);
        }
      } catch (e) {
        console.warn('Could not fetch /judges/all:', e);
      }

      // Fetch pending court change requests from /applications/pending-court-changes
      try {
        const courtChangeResp = await axios.get('/applications/pending-court-changes');
        if (courtChangeResp.data?.data) {
          setPendingCourtChanges(courtChangeResp.data.data);
        }
      } catch (e) {
        console.warn('Could not fetch pending court changes:', e);
      }

      // Fetch unassigned cases from /applications/unassigned
      try {
        const unassignedResp = await axios.get('/applications/unassigned');
        if (unassignedResp.data?.data) {
          setUnassignedCases(unassignedResp.data.data);
        }
      } catch (e) {
        console.warn('Could not fetch unassigned cases:', e);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    }
  };

  const fetchAdminData = fetchDashboardData;

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Dynamic Lists for Administration Control
  const [applicants, setApplicants] = useState([
    { id: 'USR001', name: 'Priya Nair', email: 'priya@sevenseas.com', phone: '+94 77 123 4567', status: 'Active', date: '2026-06-15', cases: 1 },
    { id: 'USR002', name: 'Arjun Das', email: 'arjun@test.com', phone: '+94 77 987 6543', status: 'Active', date: '2026-06-18', cases: 1 },
    { id: 'USR003', name: 'Meera Singh', email: 'meera@nair.com', phone: '+94 76 555 4321', status: 'Suspended', date: '2026-06-25', cases: 0 },
    { id: 'USR004', name: 'Ravi Kumar', email: 'ravi@gmail.com', phone: '+94 75 111 2222', status: 'Active', date: '2026-06-28', cases: 0 }
  ]);

  const [lawyers, setLawyers] = useState([
    { id: 'LAW201', name: 'Advocate Rajan Kumar', license: 'BC/SL/88219', specialization: 'Criminal Law', experience: 18, rating: 4.9, successRate: 93, status: 'Active', verification: 'Verified', availability: 'High' },
    { id: 'LAW202', name: 'Advocate Aisha Verma', license: 'BC/SL/71629', specialization: 'Family Law', experience: 12, rating: 4.8, successRate: 96, status: 'Active', verification: 'Verified', availability: 'Medium' },
    { id: 'LAW203', name: 'Advocate Nidhi Sharma', license: 'BC/SL/90123', specialization: 'Corporate Law', experience: 8, rating: 4.6, successRate: 86, status: 'Inactive', verification: 'Pending Approval', availability: 'Medium' }
  ]);

  const [applications, setApplications] = useState([
    { id: 'AID501', applicant: 'Priya Nair', income: 'LKR 45,000/mo', occupation: 'Clerk', caseType: 'Civil Law', date: '2026-06-28', status: 'Approved', document: 'NIC_Proof.pdf', verification: 'Verified' },
    { id: 'AID502', applicant: 'Arjun Das', income: 'LKR 28,000/mo', occupation: 'Mechanic', caseType: 'Family Law', date: '2026-06-29', status: 'Under Review', document: 'Income_Certificate.pdf', verification: 'Verified' },
    { id: 'AID503', applicant: 'Meera Singh', income: 'LKR 15,000/mo', occupation: 'Unemployed', caseType: 'Civil Law', date: '2026-06-30', status: 'Submitted', document: 'Termination_Letter.pdf', verification: 'Pending Audit' }
  ]);

  const [cases, setCases] = useState([
    { id: 'CASE801', title: 'Estate Land Boundary Dispute', type: 'Civil Law', judge: 'Justice Shanmugam', lawyer: 'Advocate Aisha Verma', courtroom: 'Courtroom Hall 3', priority: 'High', status: 'Active', nextHearing: '2026-07-15' },
    { id: 'CASE802', title: 'Guardianship Hearing — Das Custody', type: 'Family Law', judge: 'Justice Meera Rajan', lawyer: 'Advocate Rohan Mehta', courtroom: 'Courtroom Hall 1', priority: 'Medium', status: 'Active', nextHearing: '2026-07-22' }
  ]);

  const [hearings, setHearings] = useState([
    { id: 'HR901', caseTitle: 'Estate Land Boundary Dispute', judge: 'Justice Shanmugam', hall: 'Courtroom Hall 3', date: '2026-07-15', time: '10:30 AM', status: 'Scheduled' },
    { id: 'HR902', caseTitle: 'Guardianship Hearing — Das Custody', judge: 'Justice Meera Rajan', hall: 'Courtroom Hall 1', date: '2026-07-22', time: '11:30 AM', status: 'Scheduled' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Aid Submission', body: 'Meera Singh submitted aid request AID503.', time: '10 min ago' },
    { id: 2, title: 'Lawyer Audit Pending', block: 'Nidhi Sharma request verification.', time: '2 hrs ago' }
  ]);


  // User Actions (Real Backend API Integration)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/users', createUserForm);
      if (res.data?.success || res.data?.user) {
        alert(`Success: User ${createUserForm.name} created successfully in MongoDB Atlas.`);
        setShowCreateUserModal(false);
        setCreateUserForm({ name: '', email: '', role: 'User', password: 'Password@1234' });
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to create user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await axios.patch(`/admin/users/${userId}/status`);
      const updated = res.data?.user;
      setApplicants(applicants.map(u => {
        if (u.id === userId || u._id === userId) {
          const nextStatus = updated?.status || (u.status === 'Active' ? 'Suspended' : 'Active');
          return { ...u, status: nextStatus };
        }
        return u;
      }));
      alert('User status persisted to database.');
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        setApplicants(applicants.filter(u => u.id !== userId && u._id !== userId));
        alert('User removed from system.');
        fetchAdminData();
      } catch (err) {
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Lawyer approvals actions (Real Backend API Integration)
  const handleApproveLawyer = async (lawyerId) => {
    try {
      await axios.patch(`/admin/lawyers/${lawyerId}/verify`, { status: 'Verified' });
      setLawyers(lawyers.map(l => {
        if (l.id === lawyerId || l._id === lawyerId) {
          return { ...l, verification: 'Verified', status: 'Active' };
        }
        return l;
      }));
      alert('Lawyer credentials verified and approved in database.');
      fetchAdminData();
    } catch (err) {
      alert('Failed to verify lawyer: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectLawyer = async (lawyerId) => {
    try {
      await axios.patch(`/admin/lawyers/${lawyerId}/verify`, { status: 'Rejected' });
      setLawyers(lawyers.map(l => {
        if (l.id === lawyerId || l._id === lawyerId) {
          return { ...l, verification: 'Rejected', status: 'Suspended' };
        }
        return l;
      }));
      alert('Lawyer verification rejected in database.');
      fetchAdminData();
    } catch (err) {
      alert('Failed to reject lawyer: ' + (err.response?.data?.message || err.message));
    }
  };

  // Legal Aid controls
  const handleApproveAid = async (appId) => {
    try {
      await axios.patch(`/applications/${appId}/status`, { status: 'Verification', verificationStatus: 'Verified', note: 'Income and documentation verified.' });
      alert(`Success: Aid application ${appId} verified and approved.`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application.');
    }
  };

  const handleRejectAid = async (appId) => {
    try {
      await axios.patch(`/applications/${appId}/status`, { status: 'Rejected', verificationStatus: 'Rejected', note: 'Verification rejected.' });
      alert(`Success: Aid application ${appId} rejected.`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Failed to reject application.');
    }
  };

  // Real Hearing Scheduler connecting to backend MongoDB & notifying parties
  const handleScheduleHearingSubmit = async (e) => {
    e.preventDefault();
    const matchedCase = cases.find(c => c.id === hearingForm.caseId || c._id === hearingForm.caseId);
    if (!matchedCase) {
      alert('Please choose a valid case docket.');
      return;
    }

    try {
      await axios.post('/hearings', {
        applicationId: matchedCase._id || matchedCase.id,
        hearingDate: hearingForm.date,
        timeSlot: hearingForm.time || '10:00 AM',
        courtroom: hearingForm.courtroom || 'Courtroom Hall 1',
        judge: hearingForm.judge || 'Justice Shanmugam',
        purpose: 'Court Hearing & Pre-Trial Proceedings'
      });
      alert(`Court hearing successfully scheduled for ${matchedCase.title}. Lawyer and Applicant notified in real time!`);
      setShowScheduleHearingModal(false);
      setHearingForm({ caseId: '', date: '', time: '', courtroom: 'Courtroom Hall 1', judge: 'Justice Shanmugam' });
      fetchDashboardData();
    } catch (err) {
      alert(`Failed to schedule hearing: ${err.response?.data?.message || err.message}`);
    }
  };

  // Real Judicial Bench Assignment handler
  const handleAssignJudgeSubmit = async (e) => {
    e.preventDefault();
    if (!assignJudgeModalCase || !selectedJudgeId) {
      alert('Please select a presiding judge to assign.');
      return;
    }
    const isReassign = assignJudgeModalCase.assignedJudge || (assignJudgeModalCase.judge && assignJudgeModalCase.judge !== 'Unassigned');
    if (isReassign && !reassignmentReason.trim() && !assignJudgeNotes.trim()) {
      alert('Please provide a mandatory reassignment reason for the official judicial record.');
      return;
    }

    setIsAssigningJudge(true);
    try {
      const res = await axios.patch(`/applications/${assignJudgeModalCase._id || assignJudgeModalCase.id}/assign-judge`, {
        judgeId: selectedJudgeId,
        courtroom: selectedCourtroom,
        notes: assignJudgeNotes,
        reason: reassignmentReason || assignJudgeNotes
      });
      alert(`🎉 Judicial Assignment Confirmed!\n\n${res.data.message || 'Judge assigned successfully.'}\n\nReal-time notifications dispatched to Citizen (User) and Assigned Advocate (Lawyer).`);
      setAssignJudgeModalCase(null);
      setSelectedJudgeId('');
      setAssignJudgeNotes('');
      setReassignmentReason('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(`Assignment Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsAssigningJudge(false);
    }
  };

  // Add New Judicial Officer Handler
  const handleCreateJudgeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/judges/create', createJudgeForm);
      alert(`Judicial Officer Registered: Hon. Justice ${createJudgeForm.name} added to Judicial Registry.`);
      setShowCreateJudgeModal(false);
      setCreateJudgeForm({
        name: '',
        email: '',
        phone: '',
        designation: 'District Judge',
        courtLevel: 'District Court',
        courtName: 'District Court, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        courtroom: 'Courtroom 1',
        availability: 'Available',
        status: 'Active',
        experienceYears: 10
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(`Failed to create judge record: ${err.response?.data?.message || err.message}`);
    }
  };

  // Review Court Elevation / Change Request Handler
  const handleReviewCourtChangeSubmit = async (e) => {
    e.preventDefault();
    if (!reviewCourtChangeModal) return;
    setIsSubmittingCourtChange(true);
    try {
      const res = await axios.patch(`/applications/${reviewCourtChangeModal._id}/review-court-change`, {
        status: courtChangeDecision.status,
        remarks: courtChangeDecision.remarks
      });
      alert(`Court Elevation Decision Recorded: ${courtChangeDecision.status}!\n\nAutomated notifications and court docket transfer dispatched to Citizen and Assigned Counsel.`);
      setReviewCourtChangeModal(null);
      setCourtChangeDecision({ status: 'Approved', remarks: '' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(`Error reviewing court transfer: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmittingCourtChange(false);
    }
  };

  // Real Legal Counsel Assignment handler
  const handleAssignLawyerSubmit = async (e) => {
    e.preventDefault();
    if (!assignLawyerModalCase || !selectedLawyerId) {
      alert('Please select a lawyer to assign.');
      return;
    }
    setIsAssigningLawyer(true);
    try {
      await axios.patch(`/applications/${assignLawyerModalCase._id || assignLawyerModalCase.id}/assign-lawyer`, {
        lawyerId: selectedLawyerId
      });
      alert('Advocate assigned successfully! Real-time notifications dispatched to user and counsel.');
      setAssignLawyerModalCase(null);
      setSelectedLawyerId('');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(`Assignment Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsAssigningLawyer(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP SECTION: WELCOME & META (Only on Dashboard Overview) ── */}
      {activeTab === 'dashboard' && (
        <div 
          className="bg-white dark:bg-[#1B2332] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden relative"
          style={{ borderTop: '3px solid #B69B72' }}
        >
          <div className="flex-1 relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome, {user?.name || 'Admin'}
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Last Login: Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · System Status: Healthy
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="text-left md:text-right">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{todayDate}</p>
              <p className="text-xs text-[#B69B72] font-semibold mt-0.5">{currentTime}</p>
            </div>
            <div className="h-20 w-20 rounded-xl overflow-hidden border border-[#B69B72]/30 bg-slate-50 dark:bg-slate-900/50 p-1 flex items-center justify-center shrink-0">
              <img 
                src={archangelRaguelImg} 
                alt="Archangel Raguel - Angel of Justice" 
                className="h-full w-full object-cover rounded-lg"
                title="Archangel Raguel, Angel of Justice and Harmony"
              />
            </div>
          </div>

          {/* Subtle background decorative watermark */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-[0.04] pointer-events-none select-none overflow-hidden hidden md:block">
            <img 
              src={archangelRaguelImg} 
              alt="" 
              className="h-full w-full object-cover scale-150 origin-bottom-right"
            />
          </div>
        </div>
      )}

      {/* ── 1. DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in stagger">

          {/* ── OFFICIAL MINISTRY OF JUSTICE OVERSIGHT & COMMAND BANNER ── */}
          <div className="bg-white dark:bg-[#1B2332] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#202A3B] via-[#B69B72] to-[#202A3B]" />
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#202A3B]/10 dark:bg-[#B69B72]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#202A3B] dark:text-[#D9C7A5] border border-[#202A3B]/20 dark:border-[#B69B72]/30">
                  🏛️ MINISTRY OF JUSTICE OVERSIGHT DESK
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                  System Status: 100% Operational
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                National Judicial System & Legal Aid Compliance Panel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super Administrator Authority • Real-Time Docket Audit & Advocate Registry Oversight
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setShowScheduleHearingModal(true)}
                className="btn-gold btn-sm flex items-center gap-1.5 shadow-sm"
              >
                <Calendar size={13} /> Schedule Hearing
              </button>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <UserPlus size={13} /> Add User
              </button>
            </div>
          </div>

          {/* ── KPI STAT CARDS ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Active Applicants', value: applicants.length,
                sub: '+2 this week', trend: '+',
                color: '#202A3B', bg: 'rgba(32,42,59,0.08)',
                icon: Users, borderCol: '#202A3B'
              },
              {
                label: 'Verified Advocates', value: lawyers.filter(l => l.verification === 'Verified').length,
                sub: 'Bar Council verified', trend: null,
                color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
                icon: Scale, borderCol: '#16A34A'
              },
              {
                label: 'Pending Reviews', value: applications.filter(a => a.status === 'Submitted').length,
                sub: 'Eligibility checks', trend: '!',
                color: '#B69B72', bg: 'rgba(182,155,114,0.12)',
                icon: ShieldAlert, borderCol: '#B69B72'
              },
              {
                label: 'Active Court Cases', value: cases.length,
                sub: 'Ongoing litigations', trend: null,
                color: '#202A3B', bg: 'rgba(32,42,59,0.08)',
                icon: FolderOpen, borderCol: '#B69B72'
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  key={i} 
                  className="reports-glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200"
                  style={{ borderBottom: `3px solid ${stat.borderCol}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="section-label">{stat.label}</p>
                      <p
                        className="text-[2.2rem] font-black leading-none mt-2 tracking-tight text-slate-800 dark:text-white"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: stat.bg, color: stat.color }}
                    >
                      <Icon size={17} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[11px] text-slate-400 font-semibold">{stat.sub}</p>
                    {stat.trend && (
                      <span
                        className="text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      >
                        {stat.trend === '+' ? '↑ Growing' : '⚑ Action'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── CHART + QUEUE ROW ── */}
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Case Distribution Chart */}
            <div
              className="lg:col-span-2 reports-glass-card p-6 space-y-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-sm font-bold text-slate-800 dark:text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Monthly Cases Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Court utilization by case type · Last 30 days</p>
                </div>
                <span className="badge badge-blue badge-dot">Live</span>
              </div>

              <div className="relative">
                <svg viewBox="0 0 540 130" className="w-full">
                  <defs>
                    <linearGradient id="barCivil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="barFamily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="barCriminal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                    <linearGradient id="barMediation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af70" />
                      <stop offset="100%" stopColor="#b69d74" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[10, 45, 80].map((y, idx) => (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="510" y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
                      <text x="40" y={y + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" fontWeight="600">{30 - idx * 12}</text>
                    </g>
                  ))}

                  {/* Bars */}
                  {[
                    { x: 80,  h: 70, color: 'url(#barCivil)',     textCol: '#2563EB', label: 'Civil',    val: 28, labelX: 95  },
                    { x: 190, h: 50, color: 'url(#barFamily)',    textCol: '#16A34A', label: 'Family',   val: 19, labelX: 205 },
                    { x: 300, h: 80, color: 'url(#barCriminal)',  textCol: '#7C3AED', label: 'Criminal', val: 31, labelX: 315 },
                    { x: 410, h: 55, color: 'url(#barMediation)', textCol: '#B69D74', label: 'Mediation',val: 21, labelX: 425 },
                  ].map((bar, i) => (
                    <g key={i}>
                      {/* Shadow */}
                      <rect x={bar.x + 2} y={89 - bar.h + 3} width="34" height={bar.h + 5} rx="5" fill={bar.textCol} opacity="0.08" />
                      {/* Bar with animation */}
                      <rect x={bar.x} y={89 - bar.h} width="34" height={bar.h} rx="5" fill={bar.color} opacity="0.85" className="animate-grow-bar" style={{ transformOrigin: 'bottom' }} />
                      {/* Top highlight */}
                      <rect x={bar.x} y={89 - bar.h} width="34" height="4" rx="2" fill="white" opacity="0.15" />
                      {/* Value label */}
                      <text x={bar.labelX} y={82 - bar.h} textAnchor="middle" fontSize="9" fill={bar.color} fontWeight="800">{bar.val}</text>
                      {/* X Label */}
                      <text x={bar.labelX} y="120" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="600">{bar.label}</text>
                    </g>
                  ))}

                  {/* Baseline */}
                  <line x1="50" y1="90" x2="510" y2="90" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: 'Civil Disputes', color: '#2563EB' },
                  { label: 'Family Law',     color: '#16A34A' },
                  { label: 'Criminal',       color: '#7C3AED' },
                  { label: 'Mediation',      color: '#B69D74' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Awaiting Audits Queue */}
            <div
              className="reports-glass-card p-5 flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white">Awaiting Audits</h3>
                <span className="badge badge-gold">{applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length} Pending</span>
              </div>

              <div className="space-y-2 flex-1">
                {applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                    onClick={() => { setSelectedApplication(app); navigate('/dashboard/applications'); }}
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-white" style={{ background: 'linear-gradient(135deg, #1A2236, #2d3a55)' }}>
                      {app.applicant.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{app.applicant}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.caseType} · {app.income}</p>
                    </div>
                    <span
                      className={`badge text-[8.5px] shrink-0 ${app.status === 'Submitted' ? 'badge-gold' : 'badge-blue'}`}
                    >
                      {app.status === 'Submitted' ? 'New' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard/applications')}
                className="btn-secondary btn-sm w-full justify-center mt-3"
              >
                View All Applications
              </button>
            </div>

          </div>

          {/* ── LIVE ACTIVITY LOGS ROW ── */}
          <div className="reports-glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>⚡</span> Live Platform Action logs
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Real-time state transitions recorded by portal tasks</p>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">STREAM ONLINE</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { log: 'AI Match suggested Aisha Verma for Land boundary boundary survey files.', time: '2 mins ago', icon: '🤖', badge: 'AI Engine' },
                { log: 'Hearing scheduled for CASE801 in Courtroom Hall 3 by Registrar.', time: '15 mins ago', icon: '📅', badge: 'Scheduler' },
                { log: 'New applicant registration verified for Priya Nair.', time: '40 mins ago', icon: '👤', badge: 'Auditor' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:-translate-y-0.5 transition-all">
                  <span className="text-lg">{item.icon}</span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-extrabold tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-450 px-1.5 py-0.5 rounded-md">{item.badge}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">{item.log}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── 2. USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Citizen Users Directory
              </h3>
              <p className="text-xs text-slate-400">Suspend, reset passwords, or create new applicant accounts.</p>
            </div>
            
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <UserPlus size={15} /> Create User Account
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered Date</th>
                    <th>Account status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants
                    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <tr key={item.id}>
                        <td><span className="font-mono font-bold text-xs">{item.id}</span></td>
                        <td className="font-bold">{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{item.date}</td>
                        <td>
                          <span className={`badge ${
                            item.status === 'Active' ? 'badge-green' : 'badge-red'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => {
                                handleToggleUserStatus(item.id);
                              }}
                              className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                              title="Toggle Suspend"
                            >
                              {item.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button
                              onClick={() => {
                                const newPw = prompt(`Enter new password for ${item.name}:`);
                                if (newPw) alert('Password updated successfully.');
                              }}
                              className="p-1 rounded bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                              title="Reset Password"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              className="p-1 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. LAWYERS TAB ── */}
      {activeTab === 'lawyers' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Lawyers Registry & Licensures
            </h3>
            <p className="text-xs text-slate-400">Approve registrations, audit bar licensures, evaluate performance.</p>
          </div>

          <table className="premium-table">
            <thead>
              <tr>
                <th>Lawyer ID</th>
                <th>Advocate Name</th>
                <th>License Number</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Win Rate</th>
                <th>Verification</th>
                <th className="text-right">Licensures Actions</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lawyer) => (
                <tr key={lawyer.id}>
                  <td><span className="font-mono text-xs">{lawyer.id}</span></td>
                  <td className="font-bold">{lawyer.name}</td>
                  <td>{lawyer.license}</td>
                  <td>{lawyer.specialization}</td>
                  <td>{lawyer.experience} Years</td>
                  <td className="font-bold text-[#059669]">{lawyer.successRate}% Wins</td>
                  <td>
                    <span className={`badge ${
                      lawyer.verification === 'Verified' ? 'badge-green' : 'badge-amber'
                    }`}>
                      {lawyer.verification}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      {lawyer.verification === 'Pending Approval' && (
                        <>
                          <button onClick={() => handleApproveLawyer(lawyer.id)} className="p-1.5 rounded bg-emerald-50 text-emerald-600 text-xs hover:bg-emerald-100 font-bold">Approve</button>
                          <button onClick={() => handleRejectLawyer(lawyer.id)} className="p-1.5 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100 font-bold">Reject</button>
                        </>
                      )}
                      <button onClick={() => alert(`Advocate Profile details: Bar registration BC/SL-${lawyer.license}`)} className="p-1 rounded bg-slate-100 text-slate-700 text-xs hover:bg-slate-200">
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3.5 JUDGES MANAGEMENT TAB ── */}
      {activeTab === 'judges' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                  <Gavel size={22} />
                </span>
                Judicial Officers, Bench Roster & Court Allocation Management
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Administer judge registries, manual docket bench allocations, jurisdiction compatibility checks, and citizen court-level transfer requests.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateJudgeModal(true)}
                className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs py-2.5 px-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <Plus size={15} /> Add Judicial Officer
              </button>
            </div>
          </div>

          {/* Metric KPI Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Gavel size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Judicial Officers</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                  {judgeRecords.length > 0 ? judgeRecords.length : judges.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Presiding Benches</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {judgeRecords.length > 0
                    ? judgeRecords.filter(j => j.status === 'Active' || j.isActive !== false).length
                    : judges.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dockets Awaiting Bench</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {cases.filter(c => c.judge === 'Unassigned' || !c.assignedJudge).length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Building size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Court Elevation Requests</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {pendingCourtChanges.length}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setJudgeSubTab('registry')}
              className={`pb-3 font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                judgeSubTab === 'registry'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Gavel size={14} /> Judicial Registry ({judgeRecords.length > 0 ? judgeRecords.length : judges.length})
            </button>
            <button
              onClick={() => setJudgeSubTab('awaiting')}
              className={`pb-3 font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                judgeSubTab === 'awaiting'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Scale size={14} /> Dockets Awaiting Bench (
              {cases.filter(c => c.judge === 'Unassigned' || !c.assignedJudge).length})
            </button>
            <button
              onClick={() => setJudgeSubTab('elevation-requests')}
              className={`pb-3 font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                judgeSubTab === 'elevation-requests'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Building size={14} /> Court Elevation Requests
              {pendingCourtChanges.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-600 text-white font-bold">
                  {pendingCourtChanges.length}
                </span>
              )}
            </button>
          </div>

          {/* SUB-TAB 1: JUDICIAL REGISTRY */}
          {judgeSubTab === 'registry' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111928]">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th>Judicial Officer</th>
                      <th>Designation & Court Level</th>
                      <th>Jurisdiction / District</th>
                      <th>Courtroom Hall</th>
                      <th>Experience</th>
                      <th>Bench Availability</th>
                      <th>Active Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(judgeRecords.length > 0 ? judgeRecords : judges).map((j, idx) => {
                      const judgeName = j.name || j.userId?.name || 'Judicial Officer';
                      const judgeEmail = j.email || j.userId?.email || 'judge@judiciary.gov.in';
                      const designation = j.designation || (j.courtLevel ? `${j.courtLevel} Judge` : 'District Judge');
                      const courtLevel = j.courtLevel || 'District Court';
                      const district = j.district || 'Coimbatore';
                      const state = j.state || 'Tamil Nadu';
                      const courtroom = j.courtroom || 'Courtroom Hall 1';
                      const exp = j.experienceYears || j.experience || 12;
                      const status = j.status || (j.isActive === false ? 'Inactive' : 'Active');
                      const availability = j.availability || 'Available';

                      return (
                        <tr key={j._id || idx}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                                ⚖️
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                  Hon. Justice {judgeName}
                                </p>
                                <p className="text-[11px] text-slate-400">{judgeEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-xs text-purple-700 dark:text-purple-300">
                                {designation}
                              </span>
                              <p className="text-[10px] text-slate-400">{courtLevel}</p>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <MapPin size={12} className="text-purple-500 shrink-0" />
                              <span>{district}, {state}</span>
                            </div>
                          </td>
                          <td className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            {courtroom}
                          </td>
                          <td className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {exp} Years Bench
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              availability === 'Available'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : availability === 'Busy'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {availability}
                            </span>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'Active'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedJudgeId(j._id || (j.userId?._id));
                                setSelectedCourtroom(courtroom);
                                setJudgeSubTab('awaiting');
                              }}
                              className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                              title="Allocate this Judge to pending dockets"
                            >
                              <Scale size={12} /> Allocate Docket
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: CASES AWAITING JUDGE ALLOCATION */}
          {judgeSubTab === 'awaiting' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111928]">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th>Docket ID</th>
                      <th>Case Title & Category</th>
                      <th>Applicant / Client</th>
                      <th>Registered District & State</th>
                      <th>Proposed Court & Tier</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases
                      .filter(c => c.judge === 'Unassigned' || !c.assignedJudge)
                      .map((c) => (
                        <tr key={c.id}>
                          <td className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                            {c.id}
                          </td>
                          <td>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.title}</p>
                            <p className="text-[10px] text-slate-400">{c.type}</p>
                          </td>
                          <td>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.applicant}</p>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span>{c.district || 'Coimbatore'}, Tamil Nadu</span>
                            </div>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                              {c.tier || 'District Court'}
                            </span>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.priority === 'High' || c.priority === 'Critical'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setAssignJudgeModalCase(c);
                                setSelectedJudgeId(c.assignedJudge?._id || '');
                                setSelectedCourtroom(c.courtroom || 'Courtroom Hall 1');
                                setAssignJudgeNotes('');
                                setReassignmentReason('');
                              }}
                              className="btn-primary bg-purple-600 hover:bg-purple-700 text-[11px] py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <Scale size={12} /> Assign Presiding Judge
                            </button>
                          </td>
                        </tr>
                      ))}
                    {cases.filter(c => c.judge === 'Unassigned' || !c.assignedJudge).length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-xs text-slate-400">
                          🎉 All active dockets currently have designated presiding judges.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: COURT ELEVATION REQUESTS */}
          {judgeSubTab === 'elevation-requests' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111928]">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th>Docket ID</th>
                      <th>Case Title</th>
                      <th>Current Court Jurisdiction</th>
                      <th>Requested Higher Tier & Court</th>
                      <th>Justification / Grounds</th>
                      <th>Requested Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCourtChanges.map((req) => (
                      <tr key={req._id}>
                        <td className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                          {req.caseId || req._id}
                        </td>
                        <td>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{req.caseTitle}</p>
                          <p className="text-[10px] text-slate-400">{req.caseType}</p>
                        </td>
                        <td>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {req.courtDetails?.courtName || 'District Court, Coimbatore'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {req.courtDetails?.courtTier || 'District Court'} · {req.courtDetails?.district || 'Coimbatore'}
                          </p>
                        </td>
                        <td>
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {req.courtChangeRequest?.requestedTier}
                            </span>
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1">
                              {req.courtChangeRequest?.requestedCourt}
                            </p>
                          </div>
                        </td>
                        <td className="max-w-xs">
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            "{req.courtChangeRequest?.reason || 'Elevation requested under legal grounds.'}"
                          </p>
                        </td>
                        <td className="text-xs text-slate-500 whitespace-nowrap">
                          {req.courtChangeRequest?.requestedAt
                            ? new Date(req.courtChangeRequest.requestedAt).toLocaleDateString()
                            : new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Pending Review
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setReviewCourtChangeModal(req);
                              setCourtChangeDecision({ status: 'Approved', remarks: '' });
                            }}
                            className="btn-primary bg-blue-600 hover:bg-blue-700 text-[11px] py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Building size={12} /> Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingCourtChanges.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-xs text-slate-400">
                          ✨ No pending court elevation requests. All dockets are operating within sanctioned jurisdictions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. CASES TAB ── */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Judicial Cases Management Center
            </h3>
            <p className="text-xs text-slate-400">Assign judges, courtroom halls, and attorneys to active trials.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Docket ID</th>
                  <th>Case Title</th>
                  <th>Category</th>
                  <th>Presiding Judge</th>
                  <th>Representing Attorney</th>
                  <th>Courtroom Hall</th>
                  <th>Hearing Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-mono text-xs font-bold">{c.id}</span>
                      {c.tier && (
                        <span className="block text-[9px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                          {c.tier}
                        </span>
                      )}
                    </td>
                    <td>
                      <p className="font-bold text-slate-800 dark:text-white">{c.title}</p>
                      {c.district && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          📍 {c.district}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-slate text-[10px]">{c.type}</span>
                    </td>
                    <td>
                      <span className={`font-semibold text-xs ${c.judge === 'Unassigned' ? 'text-amber-500' : 'text-purple-700 dark:text-purple-300'}`}>
                        {c.judge}
                      </span>
                    </td>
                    <td className="font-semibold text-blue-600 dark:text-blue-400 text-xs">{c.lawyer}</td>
                    <td>{c.courtroom}</td>
                    <td>{c.nextHearing}</td>
                    <td>
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setAssignJudgeModalCase(c);
                            setSelectedJudgeId(c.assignedJudge?._id || '');
                            setSelectedCourtroom(c.courtroom || 'Courtroom Hall 1');
                            setAssignJudgeNotes('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950/60 dark:hover:bg-purple-900 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          title="Assign Presiding Judge"
                        >
                          <Scale size={12} /> Assign Judge
                        </button>
                        <button
                          onClick={() => {
                            setAssignLawyerModalCase(c);
                            setSelectedLawyerId(c.assignedLawyer?._id || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          title="Assign Representing Advocate"
                        >
                          <UserPlus size={12} /> Assign Lawyer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. HEARINGS (SCHEDULING) TAB ── */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Interactive Court Calendar & Hearings Tracker
                </h3>
                <p className="text-xs text-slate-400">Schedule new hearings, assign court halls, and resolve timing conflicts.</p>
              </div>

              <button
                onClick={() => setShowScheduleHearingModal(true)}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start"
              >
                <Plus size={14} /> Schedule Court Hearing
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850">
                <p className="text-xs font-bold text-slate-550 dark:text-slate-350 uppercase mb-3">July 2026</p>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2 text-center text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-300 dark:text-slate-700">29</span>
                  <span className="text-slate-300 dark:text-slate-700">30</span>
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                  <span>13</span><span>14</span>
                  <span className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto shadow-md cursor-pointer animate-pulse">
                    15
                  </span>
                  <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span>
                  <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase">Court Hearing</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">Property Partition suit trial</h4>
                  <p className="text-[10px] text-slate-450 mt-1">Courtroom Hall 3 · District Court</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Judge Shanmugam · Priya Nair</p>
                </div>
                <div className="pt-3 border-t border-slate-200 mt-4 text-[10px] text-slate-450">
                  <p><strong>Time:</strong> 10:30 AM</p>
                  <p><strong>Reminder Status:</strong> Tomorrow check complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. LEGAL AID (APPLICATIONS) TAB ── */}
      {activeTab === 'applications' && (() => {
        const pendingCount = applications.filter(a => a.verification === 'Pending').length;
        const verifiedCount = applications.filter(a => a.verification === 'Verified').length;
        const rejectedCount = applications.filter(a => a.verification === 'Rejected').length;

        return (
          <div className="space-y-4">
            {/* Top Compact Hero Banner */}
            <div className="bg-[#202A3B] text-white rounded-xl border border-[#B69B72]/30 px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B69B72]/15 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#B69B72]/20 text-[#D9C7A5] flex items-center justify-center shrink-0">
                    <ShieldAlert size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Legal Aid Applications Verification Desk
                  </h2>
                  <span className="text-[9px] font-bold text-[#D9C7A5] bg-white/10 px-2 py-0.5 rounded-full border border-[#B69B72]/30">
                    Article 39A Oversight
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Total:</span>
                    <span className="font-bold text-white font-mono">{applications.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Pending:</span>
                    <span className="font-bold text-[#D9C7A5] font-mono">{pendingCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-[#EDE9FE]/10 border border-[#DDD6FE]/20 rounded-lg px-2 py-1">
                    <span className="text-[#EDE9FE]/75">Verified:</span>
                    <span className="font-bold text-[#EDE9FE] font-mono">{verifiedCount}</span>
                  </div>
                  {rejectedCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] bg-rose-500/10 border border-rose-500/20 rounded-lg px-2 py-1">
                      <span className="text-rose-400">Rejected:</span>
                      <span className="font-bold text-rose-300 font-mono">{rejectedCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Applicant Name</th>
                      <th>Reported Income</th>
                      <th>Occupation</th>
                      <th>Specialization Category</th>
                      <th>Attachment proof</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <span className="font-mono text-xs font-bold bg-[#FAF9F5] dark:bg-[#202A3B]/60 px-2 py-0.5 rounded border border-[#202A3B]/10 dark:border-white/10">
                            {app.id}
                          </span>
                        </td>
                        <td className="font-bold text-[#202A3B] dark:text-white">{app.applicant}</td>
                        <td className="text-xs font-mono">{app.income}</td>
                        <td className="text-xs text-slate-600 dark:text-slate-300">{app.occupation}</td>
                        <td>
                          <span className="text-xs font-semibold text-[#B69B72]">{app.caseType}</span>
                        </td>
                        <td className="font-semibold text-[#B69B72]">
                          <button onClick={() => alert(`Opening document preview for file: ${app.document}`)} className="hover:underline flex items-center gap-1.5 text-xs font-bold">
                            <FileText size={12} /> {app.document}
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${
                            app.verification === 'Verified' ? 'badge-green' :
                            app.verification === 'Rejected' ? 'badge-red' : 'badge-amber'
                          }`}>
                            {app.verification}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-1.5">
                            {app.verification === 'Pending' ? (
                              <>
                                <button onClick={() => handleApproveAid(app.id)} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs transition">
                                  Approve
                                </button>
                                <button onClick={() => handleRejectAid(app.id)} className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shadow-xs transition">
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400 text-xs italic px-2">Processed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}



      {/* ── 8. REPORTS & ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header section with Purple Icon and Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 reports-glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#7c3aed] text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-500/10 shrink-0">
                <BarChart2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#7c3aed] dark:text-[#a78bfa] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Analytics Intelligence
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Strategic insights across your organizational workflows
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Chips */}
              <div className="flex bg-slate-100/85 dark:bg-slate-900/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/80">
                {[
                  { id: '7days', label: '7 Days' },
                  { id: '30days', label: '30 Days' },
                  { id: 'ytd', label: 'YTD' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setReportsTimeRange(chip.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      reportsTimeRange === chip.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => alert('Refreshing platform diagnostic telemetry...')}
                className="btn-neon-glow text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 self-start sm:self-auto"
              >
                <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                <span>Refresh Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Core charts grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Daily Operational Activity (Wave Chart) */}
            <div className="reports-glass-card lg:col-span-2 p-6 space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📈</span> Daily Operational Activity
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vite + React live workspace telemetry load tracker</p>
                </div>
                <span className="text-[9px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 px-2.5 py-1 rounded-md tracking-wider">
                  {reportsTimeRange === '7days' ? 'LATEST 7 DAYS' : reportsTimeRange === '30days' ? 'LATEST 30 DAYS' : 'YEAR-TO-DATE'}
                </span>
              </div>

              {/* Advanced Wave SVG Area Chart */}
              <div className="relative pt-4">
                <svg viewBox="0 0 500 200" className="w-full">
                  {/* Grid Lines */}
                  {[0, 2, 4, 6, 8, 10, 12].map((yVal) => {
                    const yPos = 170 - (yVal * 12);
                    return (
                      <g key={yVal} className="opacity-40">
                        <line x1="40" y1={yPos} x2="480" y2={yPos} stroke="var(--border-color, #e2e8f0)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <text x="25" y={yPos + 3} className="text-[9px] fill-slate-400 font-bold" textAnchor="end">
                          {reportsTimeRange === 'ytd' ? yVal * 15 : yVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Smooth Wave Area Gradient */}
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-brand-primary, #2563EB)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-brand-primary, #2563EB)" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Filled Area below Wave */}
                  <path
                    d="M 40,50 C 100,30 150,150 200,120 C 250,90 300,130 350,110 C 400,90 440,110 480,90 L 480,170 L 40,170 Z"
                    fill="url(#waveGrad)"
                  />

                  {/* Main Smooth Wave Line */}
                  <path
                    d="M 40,50 C 100,30 150,150 200,120 C 250,90 300,130 350,110 C 400,90 440,110 480,90"
                    fill="none"
                    stroke="var(--color-brand-primary, #2563EB)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                    className="wave-path-animated"
                  />

                  {/* Circle nodes at data points with value labels */}
                  {(reportsTimeRange === '7days' ? [
                    { x: 40, y: 100, val: 6 },
                    { x: 113, y: 120, val: 4 },
                    { x: 186, y: 140, val: 2 },
                    { x: 259, y: 130, val: 3 },
                    { x: 332, y: 110, val: 5 },
                    { x: 405, y: 120, val: 4 },
                    { x: 480, y: 80, val: 8 }
                  ] : reportsTimeRange === '30days' ? [
                    { x: 40, y: 50, val: 10 },
                    { x: 113, y: 30, val: 12 },
                    { x: 186, y: 150, val: 2 },
                    { x: 259, y: 120, val: 4 },
                    { x: 332, y: 90, val: 7 },
                    { x: 405, y: 110, val: 5 },
                    { x: 480, y: 90, val: 7 }
                  ] : [
                    { x: 40, y: 70, val: 120 },
                    { x: 113, y: 50, val: 145 },
                    { x: 186, y: 110, val: 80 },
                    { x: 259, y: 100, val: 95 },
                    { x: 332, y: 80, val: 110 },
                    { x: 405, y: 90, val: 105 },
                    { x: 480, y: 60, val: 130 }
                  ]).map((pt, idx) => (
                    <g key={idx}>
                      {/* Outer pulse glow */}
                      <circle cx={pt.x} cy={pt.y} r="6" fill="#3b82f6" opacity="0.35" />
                      {/* Inner solid circle */}
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
                      {/* Floating case count value tag */}
                      <text x={pt.x} y={pt.y - 7} textAnchor="middle" className="text-[8px] fill-blue-600 dark:fill-blue-400 font-extrabold">
                        {pt.val}
                      </text>
                    </g>
                  ))}

                  {/* Custom grid X labels */}
                  {[
                    { label: 'Fri', x: 40 },
                    { label: 'Sat', x: 113 },
                    { label: 'Sun', x: 186 },
                    { label: 'Mon', x: 259 },
                    { label: 'Tue', x: 332 },
                    { label: 'Wed', x: 405 },
                    { label: 'Thu', x: 480 }
                  ].map((lbl, idx) => (
                    <text key={idx} x={lbl.x} y="190" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">
                      {lbl.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Case Resolutions & Outcomes (Pie Chart) */}
            <div className="reports-glass-card p-6 flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🍕</span> Case Resolutions
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Outcomes distribution by type</p>
              </div>

              {/* Dynamic Native SVG Pie Chart */}
              <div className="flex justify-center items-center py-4 relative">
                <svg viewBox="0 0 100 100" className="w-36 h-36 animate-pie">
                  {/* Segment 1: Judgment (40%) - Blue */}
                  <path d="M 50 50 L 26.48 82.36 A 40 40 0 0 1 50 10 Z" fill="#3b82f6" className="pie-segment" onClick={() => alert('Judgments represent 40% of cases.')} />
                  
                  {/* Segment 2: Mediation (35%) - Green */}
                  <path d="M 50 50 L 90 50 A 40 40 0 0 1 26.48 82.36 Z" fill="#10b981" className="pie-segment" onClick={() => alert('Mediation represents 35% of cases.')} />

                  {/* Segment 3: Settlement (15%) - Gold */}
                  <path d="M 50 50 L 50 10 A 40 40 0 0 1 82.36 26.48 Z" fill="#b69d74" className="pie-segment" onClick={() => alert('Settlements represent 15% of cases.')} />

                  {/* Segment 4: Dismissed (10%) - Pink */}
                  <path d="M 50 50 L 82.36 26.48 A 40 40 0 0 1 90 50 Z" fill="#ec4899" className="pie-segment" onClick={() => alert('Dismissed cases represent 10% of cases.')} />
                </svg>
              </div>

              {/* Legend with Dynamic Values */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold border-t pt-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  <span>Judgment ({reportsTimeRange === '7days' ? '10' : reportsTimeRange === '30days' ? '40' : '480'})</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span>Mediation ({reportsTimeRange === '7days' ? '8' : reportsTimeRange === '30days' ? '35' : '420'})</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#b69d74]" />
                  <span>Settlement ({reportsTimeRange === '7days' ? '4' : reportsTimeRange === '30days' ? '15' : '180'})</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#ec4899]" />
                  <span>Dismissed ({reportsTimeRange === '7days' ? '1' : reportsTimeRange === '30days' ? '10' : '120'})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Second Row: Funding Grants disbursements & Task Distribution */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Grants & Funding utilization Area Chart */}
            <div className="reports-glass-card lg:col-span-2 p-6 space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>💵</span> Legal Aid Grants Allocation
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Budget disbursements across active civic files (LKR Millions)</p>
                </div>
                <span className="badge badge-emerald">Live Budget Tracker</span>
              </div>

              {/* Area SVG Chart */}
              <div className="relative pt-4">
                <svg viewBox="0 0 500 150" className="w-full">
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map((y, idx) => (
                    <line key={idx} x1="40" y1={30 + y * 30} x2="480" y2={30 + y * 30} stroke="var(--border-color, #e2e8f0)" strokeWidth="0.5" strokeDasharray="3 3" />
                  ))}

                  {/* Filled Area */}
                  <path
                    d="M 40,110 C 120,80 200,100 280,50 C 360,60 420,30 480,20 L 480,140 L 40,140 Z"
                    fill="url(#purpleGrad)"
                  />

                  {/* Funding Path */}
                  <path
                    d="M 40,110 C 120,80 200,100 280,50 C 360,60 420,30 480,20"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="wave-path-animated"
                  />

                  {/* Data Labels */}
                  {[
                    { label: 'Jan', x: 40, y: 110, val: '2.5M' },
                    { label: 'Feb', x: 120, y: 80, val: '3.8M' },
                    { label: 'Mar', x: 200, y: 100, val: '3.0M' },
                    { label: 'Apr', x: 280, y: 50, val: '5.2M' },
                    { label: 'May', x: 360, y: 60, val: '4.8M' },
                    { label: 'Jun', x: 480, y: 20, val: '6.4M' }
                  ].map((lbl, idx) => (
                    <g key={idx}>
                      <circle cx={lbl.x} cy={lbl.y} r="3.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="1.5" />
                      <text x={lbl.x} y={lbl.y - 8} textAnchor="middle" className="text-[8px] fill-[#7c3aed] font-extrabold">{lbl.val}</text>
                      <text x={lbl.x} y="142" textAnchor="middle" className="text-[9px] fill-slate-400 font-bold">{lbl.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Task Distribution (Donut Chart) */}
            <div className="reports-glass-card p-6 flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📋</span> Task Distribution
              </h4>

              {/* Donut Chart SVG */}
              <div className="flex justify-center items-center py-6 relative">
                <svg viewBox="0 0 100 100" className="w-36 h-36 animate-donut">
                  {/* Segment Grey (Backlog): 12% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#94a3b8" strokeWidth="9" strokeDasharray="28 240" strokeDashoffset="0" />
                  
                  {/* Segment Orange (Processing): 18% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="9" strokeDasharray="42 240" strokeDashoffset="-28" />

                  {/* Segment Blue (In Review): 25% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="9" strokeDasharray="60 240" strokeDashoffset="-70" />

                  {/* Segment Green (Completed): 45% */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="9" strokeDasharray="110 240" strokeDashoffset="-130" />
                </svg>
              </div>

              {/* Color legend metrics */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold border-t pt-4">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                  <span>Backlog</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  <span>Processing</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  <span>In Review</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span>Completed</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom row: Resource Priority & Workflow momentum + telemetry logs */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Resource Priority (Vertical Bar charts) */}
            <div className="reports-glass-card p-6 space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🎯</span> Resource Priority
              </h4>
              
              <div className="flex items-end justify-around h-32 pt-4 border-b pb-1">
                {[
                  { label: 'L1 (High)', val: 75, color: '#B69D74' },
                  { label: 'L2 (Med)', val: 40, color: '#3b82f6' },
                  { label: 'L3 (Low)', val: 90, color: '#16a34a' }
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-1/3 relative group">
                    <span className="text-[8px] font-extrabold text-[#1F2839] dark:text-slate-350 mb-0.5">{bar.val}%</span>
                    <div className="w-6 rounded-t-lg transition-all hover:scale-110 animate-grow-bar" style={{ height: `${bar.val * 0.8}px`, backgroundColor: bar.color }} />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Momentum */}
            <div className="reports-glass-card md:col-span-2 flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex-1 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚀</span> Workflow Momentum
                </h4>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>Case Application Verification</span>
                      <span className="text-blue-500">84%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full animate-progress-bar" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>AI Advocate Matching Ratio</span>
                      <span className="text-[#B69D74]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-[#B69D74] rounded-full animate-progress-bar" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-455 font-bold">
                      <span>Court Hearing Scheduling</span>
                      <span className="text-emerald-500">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full animate-progress-bar" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Telemetry Load card with logins & latency */}
              <div className="w-full md:w-60 bg-gradient-to-tr from-[#6366f1] via-[#4f46e5] to-[#7c3aed] text-white p-5 rounded-2xl flex flex-col justify-between relative shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold tracking-widest text-indigo-200 uppercase">SYS TELEMETRY</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Database status online" />
                  </div>
                  <h4 className="text-lg font-black mt-1" style={{ fontFamily: 'var(--font-display)' }}>DAILY LOGINS</h4>
                </div>
                
                <div className="my-2">
                  <div className="flex justify-between text-[9px] text-indigo-150 font-bold border-b border-indigo-500/30 pb-1">
                    <span>Database Latency</span>
                    <span>12ms</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-indigo-150 font-bold border-b border-indigo-500/30 py-1">
                    <span>API Resp Time</span>
                    <span>34ms</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-black">
                    {reportsTimeRange === '7days' ? '42' : reportsTimeRange === '30days' ? '142' : '1,842'}
                  </p>
                  <span className="text-[10px] text-emerald-300 font-bold">Active users</span>
                </div>

                {/* Violet floating star overlay button */}
                <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-95">
                  <Sparkles size={16} className="text-indigo-100" />
                </button>
              </div>
            </div>

          </div>

          {/* Recent Reports & Telemetry Audits Table */}
          <div className="reports-glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📄</span> Recent Generated Reports
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Audit reports ready for system configuration diagnostics.</p>
              </div>
              <button 
                onClick={() => alert('Compiling all recent report logs to Excel format...')}
                className="btn-secondary btn-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet size={13} /> Export Logs
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <table className="premium-table">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                    <th>Report ID</th>
                    <th>Report Type</th>
                    <th>Generated By</th>
                    <th>Target Period</th>
                    <th>File Size</th>
                    <th>Audit Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'REP-2026-004', type: 'Advocate Performance Audit', user: 'Super Admin', date: 'Aug 2026', size: '2.4 MB', status: 'Verified' },
                    { id: 'REP-2026-003', type: 'Civil Court Utilization', user: 'Court Staff', date: 'Jul 2026', size: '1.8 MB', status: 'Verified' },
                    { id: 'REP-2026-002', type: 'Legal Aid Budget Allocation', user: 'Super Admin', date: 'Jul 2026', size: '3.1 MB', status: 'Pending Review' },
                    { id: 'REP-2026-001', type: 'AI Recommend Match Accuracy Log', user: 'System Task', date: 'Jun 2026', size: '940 KB', status: 'Archived' }
                  ].map((rep, idx) => (
                    <tr key={idx} className="premium-table-row">
                      <td><span className="font-mono text-xs font-bold text-slate-650 dark:text-slate-350">{rep.id}</span></td>
                      <td className="font-bold text-slate-800 dark:text-white">{rep.type}</td>
                      <td className="text-slate-600 dark:text-slate-400 font-semibold">{rep.user}</td>
                      <td>{rep.date}</td>
                      <td className="font-mono text-xs text-slate-500">{rep.size}</td>
                      <td>
                        <span className={`badge ${
                          rep.status === 'Verified' ? 'badge-green' :
                          rep.status === 'Pending Review' ? 'badge-gold' : 'badge-slate'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => alert(`Downloading report document for ${rep.id}...`)}
                          className="btn-ghost btn-xs text-blue-600 dark:text-blue-450 hover:underline font-bold"
                        >
                          <Download size={12} className="inline mr-1" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── 9. PROFILE & SECURITY TAB ── */}
      {activeTab === 'profile' && (
        <ProfilePage />
      )}
      {false && (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px]">
          
          <div className="w-full md:w-56 shrink-0 border-r bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-455 uppercase tracking-widest px-3 mb-2">Workspace settings</p>
            {[
              { id: 'personal', label: 'Office Profile', icon: User },
              { id: 'preferences', label: 'Theme & Design', icon: Settings },
              { id: 'security', label: 'Security & Auth', icon: Lock },
              { id: 'database', label: 'Database Backup', icon: Database },
              { id: 'api', label: 'API & Maintenance', icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProfileSubTab(tab.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                    profileSubTab === tab.id
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-6">
            {profileSubTab === 'personal' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admin Profile details</h4>
                  <p className="text-xs text-slate-400">Office credentials configuration.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Legal Name</label>
                    <input type="text" defaultValue="Super Administrator Desk" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Role level</label>
                    <input type="text" defaultValue="Super Admin" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Office Email</label>
                    <input type="text" defaultValue="gokulrams.cs23@bitsathy.ac.in" disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>

                <button onClick={() => alert('Profile credentials updated.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save Profile Info
                </button>
              </div>
            )}

            {profileSubTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Design & Accessibility Settings</h4>
                  <p className="text-xs text-slate-400">Configure visual accent colors, background themes, contrast modes, and text scaling.</p>
                </div>

                {/* Embedded Design & Accessibility Customizer */}
                <ThemeCustomizer />
              </div>
            )}

            {profileSubTab === 'security' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & 2FA controls</h4>
                  <p className="text-xs text-slate-400">Configure password updates and safety parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Current password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">New password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                </div>

                <button onClick={() => alert('Password updated successfully.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save security credentials
                </button>
              </div>
            )}

            {profileSubTab === 'database' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Database Backup & Restores</h4>
                  <p className="text-xs text-slate-400">Download Mongo dump files or schedule automated backups.</p>
                </div>

                <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Backup Mongo Database</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Creates a zipped JSON export file of all collections.</p>
                  </div>
                  <button onClick={() => alert('Creating dump file... Zipped JSON export successfully downloaded to system.')} className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1">
                    <Database size={12} /> Backup now
                  </button>
                </div>
              </div>
            )}

            {profileSubTab === 'api' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">API settings & Maintenance Mode</h4>
                  <p className="text-xs text-slate-400">Toggle public visibility parameters and configure API keys.</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <p className="text-xs font-bold">Activate Maintenance Mode</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">If active, redirects citizens to public advisory pages.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      alert(`Maintenance Mode updated: ${!maintenanceMode ? 'Active' : 'Inactive'}`);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                      maintenanceMode ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {maintenanceMode ? 'Mode Active' : 'Mode Inactive'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMMUNICATIONS / MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <ChatCenter />
        </div>
      )}

      {/* ── 10. CREATE USER ACCOUNT MODAL ── */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setShowCreateUserModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h4>
              <p className="text-xs text-slate-450 mt-1">Register a citizen user directly inside the database.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text" required
                  value={createUserForm.name}
                  onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  placeholder="e.g. Priya Nair" className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email address</label>
                <input
                  type="email" required
                  value={createUserForm.email}
                  onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  placeholder="e.g. user@sevenseas.com" className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Initial password</label>
                <input
                  type="password" required
                  value={createUserForm.password}
                  onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 rounded-xl font-bold justify-center">
                Register Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 11. SCHEDULE COURT HEARING MODAL ── */}
      {showScheduleHearingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setShowScheduleHearingModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Schedule Court Hearing</h4>
              <p className="text-xs text-slate-455 mt-1">Assign courtroom halls, timing, and presiding judges.</p>
            </div>

            <form onSubmit={handleScheduleHearingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Select Case Docket</label>
                <select
                  value={hearingForm.caseId}
                  onChange={e => setHearingForm({ ...hearingForm, caseId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">-- Choose Case Docket --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Hearing Date</label>
                  <input
                    type="date" required
                    value={hearingForm.date}
                    onChange={e => setHearingForm({ ...hearingForm, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Hearing Time</label>
                  <input
                    type="time" required
                    value={hearingForm.time}
                    onChange={e => setHearingForm({ ...hearingForm, time: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Courtroom Hall</label>
                  <select
                    value={hearingForm.courtroom}
                    onChange={e => setHearingForm({ ...hearingForm, courtroom: e.target.value })}
                    className="form-input"
                  >
                    <option>Courtroom Hall 1</option>
                    <option>Courtroom Hall 2</option>
                    <option>Courtroom Hall 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Presiding Judge</label>
                  <select
                    value={hearingForm.judge}
                    onChange={e => setHearingForm({ ...hearingForm, judge: e.target.value })}
                    className="form-input"
                  >
                    {judges.length > 0 ? (
                      judges.map(j => (
                        <option key={j._id} value={`Justice ${j.name}`}>Justice {j.name}</option>
                      ))
                    ) : (
                      <>
                        <option>Justice Shanmugam</option>
                        <option>Justice Meera Rajan</option>
                        <option>Justice Amarasinghe</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 rounded-xl font-bold justify-center shadow-md">
                Schedule Hearing Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 12. ASSIGN PRESIDING JUDGE MODAL ── */}
      {assignJudgeModalCase && (() => {
        const isReassign = assignJudgeModalCase.assignedJudge || (assignJudgeModalCase.judge && assignJudgeModalCase.judge !== 'Unassigned');
        const judgeHistory = assignJudgeModalCase.raw?.judgeHistory || [];
        const caseTier = assignJudgeModalCase.tier || 'District Court';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setAssignJudgeModalCase(null);
                  setReassignmentReason('');
                }}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                ×
              </button>

              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                  <Gavel size={22} />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {isReassign ? 'Reassign Presiding Judicial Officer' : 'Assign Presiding Judicial Officer'}
                  </h4>
                  <p className="text-xs text-slate-400">Bench designation for docket <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{assignJudgeModalCase.id}</span></p>
                </div>
              </div>

              {/* Case Overview Card */}
              <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{assignJudgeModalCase.title}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <p>Category: <strong className="text-slate-700 dark:text-slate-300">{assignJudgeModalCase.type}</strong></p>
                  <p>Jurisdiction Tier: <strong className="text-purple-700 dark:text-purple-300">{caseTier}</strong></p>
                  <p>District: <strong className="text-slate-700 dark:text-slate-300">{assignJudgeModalCase.district || 'Coimbatore'}</strong></p>
                  <p>Current Presiding Bench: <strong className="text-purple-700 dark:text-purple-400">{assignJudgeModalCase.judge}</strong></p>
                </div>
              </div>

              {/* Reassignment Warning */}
              {isReassign && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[11px]">
                    <AlertCircle size={14} className="text-amber-600" /> Judicial Reassignment Notice
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    This docket is currently presided by <strong>{assignJudgeModalCase.judge}</strong>. Reassigning will record a permanent audit entry and immediately dispatch notifications and emails to the user and counsel.
                  </p>
                </div>
              )}

              {/* Previous Judge Assignment History */}
              {judgeHistory.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock size={12} /> Previous Bench Assignment History ({judgeHistory.length})
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
                    {judgeHistory.map((h, i) => (
                      <div key={i} className="text-[11px] flex flex-col gap-0.5 border-b border-slate-200/50 dark:border-slate-800/50 pb-1 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-purple-700 dark:text-purple-300">{h.judgeName || 'Hon. Justice'}</span>
                          <span className="text-[10px] text-slate-400">{new Date(h.assignedAt || h.date).toLocaleDateString()}</span>
                        </div>
                        {h.reason && <p className="text-[10px] text-slate-500 italic">Reason: {h.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAssignJudgeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Presiding Judge *
                  </label>
                  <select
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                    className="form-input w-full font-medium"
                    required
                  >
                    <option value="">-- Choose Judicial Officer --</option>
                    {(judgeRecords.length > 0 ? judgeRecords : judges).map((j) => {
                      const jId = j._id || j.userId?._id || j.id;
                      const jName = j.name || j.userId?.name;
                      const jTier = j.courtLevel || 'District Court';
                      const jDesignation = j.designation || `${jTier} Judge`;
                      const jDistrict = j.district || '';
                      const isIncompatible = caseTier === 'Supreme Court' && jTier === 'District Court';

                      return (
                        <option key={jId} value={jId} disabled={isIncompatible}>
                          Hon. Justice {jName} · {jDesignation} ({jTier}{jDistrict ? `, ${jDistrict}` : ''}){isIncompatible ? ' [INCOMPATIBLE: District Judge cannot preside Supreme Court]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {isReassign && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                      Mandatory Reason for Reassignment *
                    </label>
                    <textarea
                      value={reassignmentReason}
                      onChange={(e) => setReassignmentReason(e.target.value)}
                      required
                      rows={2}
                      className="form-input w-full resize-none text-xs border-amber-300 dark:border-amber-700/60"
                      placeholder="e.g. Judicial recusal under Section 479, annual bench rotation roster, leave of absence, or administrative transfer..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Courtroom Hall / Bench
                    </label>
                    <input
                      value={selectedCourtroom}
                      onChange={(e) => setSelectedCourtroom(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Courtroom Hall 3"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Court Tier
                    </label>
                    <input
                      value={caseTier}
                      disabled
                      className="form-input bg-slate-100 dark:bg-slate-900 opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Administrative Assignment Notes & Bench Directives
                  </label>
                  <textarea
                    value={assignJudgeNotes}
                    onChange={(e) => setAssignJudgeNotes(e.target.value)}
                    rows={2}
                    className="form-input w-full resize-none text-xs"
                    placeholder="e.g. Assigned for preliminary dispute hearing & evidence verification..."
                  />
                </div>

                {/* Real-time notification guarantee alert */}
                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[11px]">
                    <span>⚡</span> Automated Notifications Dispatched
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    Formal notifications and real-time emails will be dispatched to both the <strong>Citizen (User)</strong> and the <strong>Representing Advocate (Lawyer)</strong> containing the Case ID, previous bench, new judge designation, courtroom, and full assignment history.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignJudgeModalCase(null);
                      setReassignmentReason('');
                    }}
                    className="btn-secondary text-xs py-2 px-4 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningJudge}
                    className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs py-2 px-5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                  >
                    <Gavel size={14} />
                    {isAssigningJudge ? 'Dispatching Assignment...' : (isReassign ? 'Confirm Reassignment' : 'Confirm Bench Assignment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ── 13. ASSIGN ADVOCATE MODAL ── */}
      {assignLawyerModalCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setAssignLawyerModalCase(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300">
                <UserPlus size={22} />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Assign Representing Advocate</h4>
                <p className="text-xs text-slate-400">Allocate legal counsel to docket {assignLawyerModalCase.id}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">{assignLawyerModalCase.title}</p>
              <p className="text-slate-500 mt-0.5">Applicant: {assignLawyerModalCase.applicant} · Category: {assignLawyerModalCase.type}</p>
            </div>

            <form onSubmit={handleAssignLawyerSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Legal Counsel *
                </label>
                <select
                  value={selectedLawyerId}
                  onChange={(e) => setSelectedLawyerId(e.target.value)}
                  className="form-input w-full font-medium"
                  required
                >
                  <option value="">-- Choose Advocate --</option>
                  {lawyers.map((l) => (
                    <option key={l._id || l.id} value={l._id || l.id}>
                      {l.name} ({l.specialization} · Exp: {l.experience}y)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAssignLawyerModalCase(null)}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningLawyer}
                  className="btn-primary text-xs py-2 px-5 rounded-xl font-bold"
                >
                  {isAssigningLawyer ? 'Assigning...' : 'Assign Advocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 14. ADD JUDICIAL OFFICER MODAL ── */}
      {showCreateJudgeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full space-y-4 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateJudgeModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                <Gavel size={22} />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Add New Judicial Officer</h4>
                <p className="text-xs text-slate-400">Register judge record, judicial rank, court level, and assigned district.</p>
              </div>
            </div>

            <form onSubmit={handleCreateJudgeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Judicial Officer Name *
                  </label>
                  <input
                    value={createJudgeForm.name}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, name: e.target.value })}
                    required
                    placeholder="e.g. S. K. Radhakrishnan"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Official Judiciary Email *
                  </label>
                  <input
                    type="email"
                    value={createJudgeForm.email}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, email: e.target.value })}
                    required
                    placeholder="judge@judiciary.gov.in"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={createJudgeForm.phone}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, phone: e.target.value })}
                    placeholder="+91 98401 23456"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Designation *
                  </label>
                  <select
                    value={createJudgeForm.designation}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, designation: e.target.value })}
                    className="form-input"
                  >
                    <option value="District Judge">Principal District Judge</option>
                    <option value="Additional District Judge">Additional District Judge</option>
                    <option value="Senior Civil Judge">Senior Civil Judge</option>
                    <option value="Chief Judicial Magistrate">Chief Judicial Magistrate</option>
                    <option value="High Court Judge">High Court Judge</option>
                    <option value="Supreme Court Justice">Supreme Court Justice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Court Level *
                  </label>
                  <select
                    value={createJudgeForm.courtLevel}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, courtLevel: e.target.value })}
                    className="form-input"
                  >
                    <option value="District Court">District Court</option>
                    <option value="High Court">High Court</option>
                    <option value="Supreme Court">Supreme Court</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    District *
                  </label>
                  <input
                    value={createJudgeForm.district}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, district: e.target.value })}
                    required
                    placeholder="e.g. Coimbatore"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    value={createJudgeForm.state}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, state: e.target.value })}
                    required
                    placeholder="e.g. Tamil Nadu"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Courtroom / Bench
                  </label>
                  <input
                    value={createJudgeForm.courtroom}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, courtroom: e.target.value })}
                    placeholder="Courtroom 1"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Court Name
                  </label>
                  <input
                    value={createJudgeForm.courtName}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, courtName: e.target.value })}
                    placeholder="District Court, Coimbatore"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Availability
                  </label>
                  <select
                    value={createJudgeForm.availability}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, availability: e.target.value })}
                    className="form-input"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy (Presiding Trials)</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={createJudgeForm.status}
                    onChange={(e) => setCreateJudgeForm({ ...createJudgeForm, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Retired">Retired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateJudgeModal(false)}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs py-2 px-5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Plus size={14} /> Register Judicial Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 15. REVIEW COURT ELEVATION REQUEST MODAL ── */}
      {reviewCourtChangeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setReviewCourtChangeModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300">
                <Building size={22} />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Review Court Elevation Request</h4>
                <p className="text-xs text-slate-400">Jurisdictional transfer evaluation for docket <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{reviewCourtChangeModal.caseId || reviewCourtChangeModal._id}</span></p>
              </div>
            </div>

            {/* Case & Court Transition Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-3">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{reviewCourtChangeModal.caseTitle}</p>
                <p className="text-[11px] text-slate-500">Category: {reviewCourtChangeModal.caseType} · Client: {reviewCourtChangeModal.applicant?.name || 'Applicant'}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Current Court</p>
                  <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {reviewCourtChangeModal.courtDetails?.courtTier || 'District Court'}
                  </p>
                  <p className="text-[10px] text-slate-400">{reviewCourtChangeModal.courtDetails?.courtName}</p>
                </div>
                <ArrowRight size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mx-2" />
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Requested Elevation</p>
                  <p className="font-bold text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                    {reviewCourtChangeModal.courtChangeRequest?.requestedTier}
                  </p>
                  <p className="text-[10px] text-slate-400">{reviewCourtChangeModal.courtChangeRequest?.requestedCourt}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Applicant Justification & Legal Grounds:
                </p>
                <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 italic leading-relaxed">
                  "{reviewCourtChangeModal.courtChangeRequest?.reason || 'Elevation sought under applicable legal procedures.'}"
                </div>
              </div>
            </div>

            <form onSubmit={handleReviewCourtChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Administrative Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition-all ${
                    courtChangeDecision.status === 'Approved'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      checked={courtChangeDecision.status === 'Approved'}
                      onChange={() => setCourtChangeDecision({ ...courtChangeDecision, status: 'Approved' })}
                      className="hidden"
                    />
                    <CheckCircle2 size={16} className={courtChangeDecision.status === 'Approved' ? 'text-emerald-600' : 'text-slate-400'} />
                    Approve Court Elevation
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition-all ${
                    courtChangeDecision.status === 'Rejected'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      checked={courtChangeDecision.status === 'Rejected'}
                      onChange={() => setCourtChangeDecision({ ...courtChangeDecision, status: 'Rejected' })}
                      className="hidden"
                    />
                    <XCircle size={16} className={courtChangeDecision.status === 'Rejected' ? 'text-red-600' : 'text-slate-400'} />
                    Reject Elevation Request
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Administrative Review Remarks & Legal Notes
                </label>
                <textarea
                  value={courtChangeDecision.remarks}
                  onChange={(e) => setCourtChangeDecision({ ...courtChangeDecision, remarks: e.target.value })}
                  rows={2}
                  className="form-input w-full resize-none text-xs"
                  placeholder="e.g. Approved under appellate jurisdiction Article 226. Case files scheduled for High Court Registry transmission..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewCourtChangeModal(null)}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourtChange}
                  className={`btn-primary text-xs py-2 px-5 rounded-xl font-bold flex items-center gap-1.5 ${
                    courtChangeDecision.status === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
                  }`}
                >
                  {isSubmittingCourtChange ? 'Recording Decision...' : `Confirm Decision (${courtChangeDecision.status})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
