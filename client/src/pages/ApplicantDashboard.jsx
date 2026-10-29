import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { initSocket, subscribeToMessages, subscribeToNotifications, subscribeToHearingUpdates, subscribeToCaseUpdates } from '../services/socket';
import ChatCenter from '../components/chat/ChatCenter';
import { motion } from 'framer-motion';
import {
  Home,
  Briefcase,
  ShieldAlert,
  FolderOpen,
  Sparkles,
  Scale,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Bell,
  Heart,
  HelpCircle,
  User,
  Settings,
  Plus,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Eye,
  Smile,
  Send,
  Trash2,
  Lock,
  ShieldCheck,
  Star,
  Info,
  ChevronRight,
  Search,
  Filter,
  FileDown,
  Volume2,
  BookOpen,
  Smartphone,
  ChevronDown,
  CreditCard,
  DollarSign,
  Check,
  Receipt,
  Shield,
  Gavel,
  Building,
  MapPin,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import RegistrationWizard from '../components/RegistrationWizard';
import AiLawyerRecommender from '../components/applicant/AiLawyerRecommender';
import ProfilePage from './ProfilePage';

// Comprehensive Catalog of All Types of Legal Cases
export const CASE_CATALOG = [
  {
    group: 'Family & Matrimonial Law',
    cases: [
      {
        title: 'Mutual Consent Divorce Petition (Sec 13B)',
        category: 'Family & Matrimonial Law',
        desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B of the Hindu Marriage Act with settlement on alimony, custody, and return of marriage articles.'
      },
      {
        title: 'Contested Divorce & Marital Dissolution',
        category: 'Family & Matrimonial Law',
        desc: 'Petition for dissolution of marriage on grounds of cruelty, desertion, or non-cohabitation before the Family Court.'
      },
      {
        title: 'Child Custody & Legal Guardianship',
        category: 'Family & Matrimonial Law',
        desc: 'Petition seeking physical custody, legal guardianship, and reasonable visitation schedule for minor children.'
      },
      {
        title: 'Maintenance & Alimony Application (Sec 125 CrPC)',
        category: 'Family & Matrimonial Law',
        desc: 'Application claiming monthly interim and permanent maintenance allowance for spouse and dependent children.'
      },
      {
        title: 'Domestic Violence Protection & Relief Order',
        category: 'Family & Matrimonial Law',
        desc: 'Urgent magistrate application seeking protection order, residential rights, and monetary relief under the Protection of Women from Domestic Violence Act.'
      },
      {
        title: 'Restitution of Conjugal Rights (Sec 9)',
        category: 'Family & Matrimonial Law',
        desc: 'Petition filed under Section 9 of the Hindu Marriage Act seeking decree directing spouse to resume marital cohabitation.'
      }
    ]
  },
  {
    group: 'Property Law & Land Partition',
    cases: [
      {
        title: 'Ancestral Property Partition Suit',
        category: 'Property Law & Land Partition',
        desc: 'Lawsuit seeking legal declaration of share, metes and bounds survey demarcation, and separate possession of ancestral agricultural land and residential property.'
      },
      {
        title: 'Land Boundary, Encroachment & Injunction Suit',
        category: 'Property Law & Land Partition',
        desc: 'Civil suit for declaration of title, revenue survey demarcation, and permanent injunction restraining neighboring encroachment on registered land.'
      },
      {
        title: 'Patta Transfer, Chitta & Revenue Mutation Dispute',
        category: 'Revenue & Agricultural Land Law',
        desc: 'Challenging illegal patta cancellation or wrongful revenue registry mutation before the Tahsildar / Revenue Divisional Officer.'
      },
      {
        title: 'Declaration of Ownership Title & Possession',
        category: 'Property Law & Land Partition',
        desc: 'Civil lawsuit for declaration of absolute title, cancellation of fraudulent registered sale deeds, and recovery of lawful possession.'
      },
      {
        title: 'Landlord-Tenant Eviction & Rent Arrears Dispute',
        category: 'Civil & Contract Law',
        desc: 'Eviction petition regarding non-payment of lease rent, statutory notice expiry, and recovery of commercial/residential premises.'
      }
    ]
  },
  {
    group: 'Criminal Law & Bail Petitions',
    cases: [
      {
        title: 'Anticipatory Bail Application (Sec 438 CrPC)',
        category: 'Criminal Law',
        desc: 'Urgent petition before Principal Sessions Court / High Court seeking pre-arrest protection and bail against false police complaint.'
      },
      {
        title: 'Regular Court Bail Petition (Sec 437/439 CrPC)',
        category: 'Criminal Law',
        desc: 'Bail petition seeking immediate release from judicial custody following arrest under criminal charges.'
      },
      {
        title: 'Criminal FIR Quashing Petition (Sec 482 CrPC)',
        category: 'Criminal Law',
        desc: 'High Court inherent jurisdiction petition seeking quashing of groundless, vexatious FIR and police charge sheet.'
      },
      {
        title: 'Criminal Complaint & Trial Defense',
        category: 'Criminal Law',
        desc: 'Criminal defense representation before Judicial Magistrate / Sessions Court, examination of witnesses, and trial advocacy.'
      }
    ]
  },
  {
    group: 'Negotiable Instruments & Banking Litigation',
    cases: [
      {
        title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)',
        category: 'Negotiable Instruments & Cheque Bounce',
        desc: 'Statutory legal demand notice and criminal complaint before Judicial Magistrate for dishonour of cheque due to insufficient funds.'
      },
      {
        title: 'Bank Loan Default & SARFAESI Act Defense',
        category: 'Commercial & Banking Litigation',
        desc: 'Defense against bank possession notice, debt recovery proceedings, and seeking loan regularization before Debt Recovery Tribunal (DRT).'
      }
    ]
  },
  {
    group: 'Motor Accident Claims & Compensation (MACT)',
    cases: [
      {
        title: 'Motor Accident Compensation Claim (MACT)',
        category: 'Motor Accident Claims & Insurance',
        desc: 'Compensation claim petition before Motor Accident Claims Tribunal for serious vehicular injury, disability, medical treatment, or fatal accident.'
      }
    ]
  },
  {
    group: 'Civil & Contract Law',
    cases: [
      {
        title: 'Breach of Commercial Contract & Damages Suit',
        category: 'Civil & Contract Law',
        desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.'
      },
      {
        title: 'Money Recovery Suit & Promissory Note Claim',
        category: 'Civil & Contract Law',
        desc: 'Summary civil suit under Order 37 CPC for recovery of debt with interest based on executed promissory note or commercial invoices.'
      }
    ]
  },
  {
    group: 'Consumer Protection & Public Rights',
    cases: [
      {
        title: 'Consumer Protection Complaint for Defective Service',
        category: 'Constitutional & Consumer Rights',
        desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking full refund, compensation for mental agony, and costs.'
      }
    ]
  },
  {
    group: 'Cyber Crime & Financial Fraud',
    cases: [
      {
        title: 'Online Banking, Phishing & UPI Fraud Complaint',
        category: 'Cyber Crime & Financial Fraud',
        desc: 'Complaint before Cyber Crime Police and Judicial Magistrate for unauthorized bank transfers, phishing fraud, and freezing beneficiary accounts.'
      }
    ]
  },
  {
    group: 'Labour & Employment Disputes',
    cases: [
      {
        title: 'Labour Dispute & Unlawful Termination',
        category: 'Labour & Industrial Disputes',
        desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, gratuity, and statutory severance.'
      }
    ]
  }
];

export const QUICK_CASE_CHIPS = [
  { label: '💍 Divorce Petition', title: 'Mutual Consent Divorce Petition (Sec 13B)', category: 'Family & Matrimonial Law', desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B with agreed terms on alimony, child custody, and return of marriage articles.' },
  { label: '💔 Contested Divorce', title: 'Contested Divorce & Marital Dissolution', category: 'Family & Matrimonial Law', desc: 'Petition for dissolution of marriage on grounds of cruelty, desertion, or non-cohabitation before the Family Court.' },
  { label: '👨‍👩‍👧 Child Custody', title: 'Child Custody & Legal Guardianship', category: 'Family & Matrimonial Law', desc: 'Petition seeking physical custody, legal guardianship, and reasonable visitation schedule for minor children.' },
  { label: '🏡 Land Partition', title: 'Ancestral Property Partition Suit', category: 'Property Law & Land Partition', desc: 'Lawsuit seeking legal declaration of share, metes and bounds survey demarcation, and separate possession of ancestral land and property.' },
  { label: '⚖️ Criminal Bail', title: 'Anticipatory Bail Application (Sec 438 CrPC)', category: 'Criminal Law', desc: 'Urgent petition before Principal Sessions Court / High Court seeking pre-arrest protection and bail against police complaint.' },
  { label: '💳 Cheque Bounce (138)', title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)', category: 'Negotiable Instruments & Cheque Bounce', desc: 'Statutory legal demand notice and criminal complaint for dishonour of cheque due to insufficient funds.' },
  { label: '🚗 Accident Claim (MACT)', title: 'Motor Accident Compensation Claim (MACT)', category: 'Motor Accident Claims & Insurance', desc: 'Compensation claim petition before Motor Accident Claims Tribunal for vehicular injury, medical expenses, or fatal accident.' },
  { label: '🌾 Patta & Revenue', title: 'Patta Transfer & Revenue Settlement Dispute', category: 'Revenue & Agricultural Land Law', desc: 'Challenging illegal patta cancellation or wrongful revenue registry mutation before the Tahsildar / Revenue Divisional Officer.' },
  { label: '📜 Contract Breach', title: 'Breach of Commercial Contract & Damages Suit', category: 'Civil & Contract Law', desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.' },
  { label: '🛡️ Consumer Dispute', title: 'Consumer Protection Complaint for Defective Service', category: 'Constitutional & Consumer Rights', desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking refund, compensation for mental agony, and costs.' },
  { label: '💻 Cyber Fraud', title: 'Online Banking, Phishing & UPI Fraud Complaint', category: 'Cyber Crime & Financial Fraud', desc: 'Complaint before Cyber Crime Police for unauthorized bank debits, online phishing scam, and recovery of stolen funds.' },
  { label: '💼 Job Dispute', title: 'Labour Dispute & Unlawful Termination', category: 'Labour & Industrial Disputes', desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, and statutory gratuity.' }
];

const ApplicantDashboard = ({ activeTab = 'dashboard' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [profilePercent, setProfilePercent] = useState(75);
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [appViewMode, setAppViewMode] = useState('grid'); // 'grid' | 'table'
  const [appCategoryFilter, setAppCategoryFilter] = useState('All');
  const [appVerificationFilter, setAppVerificationFilter] = useState('All');
  
  // My Cases View & Filtering States
  const [caseViewMode, setCaseViewMode] = useState('grid'); // 'grid' | 'table'
  const [caseSearchTerm, setCaseSearchTerm] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState('All');
  const [caseCategoryFilter, setCaseCategoryFilter] = useState('All');
  
  // Modals & Details Views
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);

  // Court Transfer Request state
  const [showCourtTransferModal, setShowCourtTransferModal] = useState(false);
  const [courtTransferForm, setCourtTransferForm] = useState({ requestedTier: 'High Court', requestedCourt: 'Madras High Court', reason: '' });
  const [transferringCase, setTransferringCase] = useState(null);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Calendar States & Engine
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'agenda'
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHearingSession, setSelectedHearingSession] = useState(null);

  // Chat/Messages state
  const [activeChatRecipient, setActiveChatRecipient] = useState('lawyer'); // 'lawyer' | 'admin'
  const [typedMessage, setTypedMessage] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, recipient: 'lawyer', sender: 'lawyer', text: 'Hello, I have reviewed your property dispute documents. We need to schedule a quick mock brief.', time: '09:30 AM', read: true },
    { id: 2, recipient: 'lawyer', sender: 'user', text: 'Thank you Advocate. What files should I bring along?', time: '09:35 AM', read: true },
    { id: 3, recipient: 'lawyer', sender: 'lawyer', text: 'Please bring the original land deed and municipal tax receipts.', time: '09:40 AM', read: true },
    { id: 4, recipient: 'admin', sender: 'admin', text: 'Dear User, your income documentation verification audit has been approved by the legal aid desk.', time: 'Yesterday', read: true }
  ]);

  // Profile Sub-tabs state
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'security' | 'preferences' | 'feedback' | 'support'

  // Fees and Lawyer Payment State
  const defaultFeesData = [
    {
      id: 'FEE-2026-001',
      caseId: 'CAS-8821',
      caseTitle: 'Land Deed Title Clearance & Property Dispute',
      lawyerName: 'Adv. Rajesh Sharma',
      lawyerId: 'L-101',
      clientName: user?.name || 'Priya Sharma',
      clientId: user?._id || 'U-501',
      description: 'Court Representation & Chamber Retainer Fee',
      totalAmount: 450,
      amountDue: 450,
      dueDate: '2026-08-30',
      status: 'Pending',
      paymentMethod: null,
      paidAt: null,
      transactionId: null
    },
    {
      id: 'FEE-2026-002',
      caseId: 'CAS-9410',
      caseTitle: 'Commercial Contract & Tender Audit',
      lawyerName: 'Adv. Rajesh Sharma',
      lawyerId: 'L-101',
      clientName: user?.name || 'Priya Sharma',
      clientId: user?._id || 'U-501',
      description: 'Document Verification & Legal Drafting',
      totalAmount: 280,
      amountDue: 0,
      dueDate: '2026-08-10',
      status: 'Paid',
      paymentMethod: 'Credit Card (**** 4242)',
      paidAt: '2026-08-08 14:22',
      transactionId: 'TXN-984210'
    },
    {
      id: 'FEE-2026-003',
      caseId: 'CAS-7102',
      caseTitle: 'Tenancy Agreement & Lease Hearing',
      lawyerName: 'Adv. Ananya Roy',
      lawyerId: 'L-102',
      clientName: user?.name || 'Priya Sharma',
      clientId: user?._id || 'U-501',
      description: 'Subsidized Court Processing & Legal Counsel',
      totalAmount: 180,
      amountDue: 180,
      dueDate: '2026-08-15',
      status: 'Overdue',
      paymentMethod: null,
      paidAt: null,
      transactionId: null
    }
  ];

  const [fees, setFees] = useState(() => {
    const saved = localStorage.getItem('lexora_fees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return defaultFeesData; }
    }
    return defaultFeesData;
  });

  const [feeFilterStatus, setFeeFilterStatus] = useState('All');
  const [payingFee, setPayingFee] = useState(null);
  const [paymentStep, setPaymentStep] = useState('method'); // 'method' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardForm, setCardForm] = useState({
    number: '4242 4242 4242 4242',
    name: user?.name || 'Priya Sharma',
    expiry: '08/28',
    cvc: '888',
    upiId: 'priya@okicici'
  });
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);

  const saveFeesToStorage = (updatedFees) => {
    setFees(updatedFees);
    localStorage.setItem('lexora_fees', JSON.stringify(updatedFees));
  };

  const handleStartPayment = (fee) => {
    setPayingFee(fee);
    setPaymentStep('method');
  };

  const handleConfirmPayment = () => {
    if (!payingFee) return;
    setPaymentStep('processing');

    setTimeout(() => {
      const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      const paidDate = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      const methodName = paymentMethod === 'card' 
        ? 'Credit Card (**** 4242)' 
        : paymentMethod === 'upi' 
        ? `UPI (${cardForm.upiId})` 
        : paymentMethod === 'netbanking' 
        ? 'Net Banking (HDFC Bank)' 
        : 'Legal Aid Wallet';

      const updated = fees.map(f => {
        if (f.id === payingFee.id) {
          return {
            ...f,
            status: 'Paid',
            amountDue: 0,
            paymentMethod: methodName,
            paidAt: paidDate,
            transactionId: txnId
          };
        }
        return f;
      });

      saveFeesToStorage(updated);
      setPaymentStep('success');
    }, 2500);
  };

  // Application wizard form fields
  const [applyForm, setApplyForm] = useState({
    fullName: user?.name || '',
    dob: '',
    gender: 'Male',
    phone: '',
    address: '',
    occupation: '',
    monthlyIncome: '',
    caseType: 'Civil Law',
    caseDescription: '',
    urgency: 'Medium'
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userName = user?.name || 'User';

  // Dynamic Data Lists (loaded from backend)
  const [applications, setApplications] = useState([]);
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Derived chosen & accepted lawyer states
  const pendingLawyerApp = applications.find(a => 
    (a.representationStatus === 'Requested' || a.status === 'PendingLawyerAcceptance') && (a.chosenLawyer || a.chosenLawyerName)
  );
  const acceptedLawyerApp = applications.find(a =>
    (a.representationStatus === 'Accepted' || a.status === 'LawyerAssigned') && (a.assignedLawyer || (a.lawyer && a.lawyer !== 'TBD'))
  );

  const fileInputRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      // Fetch applications
      const appResp = await axios.get('/applications/mine');
      const apps = appResp.data;
      const mappedApps = apps.map(a => ({
        ...a,
        id: a._id,
        date: new Date(a.createdAt).toLocaleDateString(),
        type: a.caseType,
        desc: a.description,
        courtroom: a.courtDetails?.courtName || a.court || 'District Court',
        courtTier: a.courtDetails?.courtTier || 'District Court',
        district: a.courtDetails?.district || a.location || 'Local District',
        judgeName: a.assignedJudge?.name ? `Hon. Justice ${a.assignedJudge.name}` : (a.judge?.name ? `Hon. Justice ${a.judge.name}` : null),
        assignedJudge: a.assignedJudge || a.judge,
        lawyer: a.assignedLawyer?.name || 'TBD',
        assignedLawyer: a.assignedLawyer,
        chosenLawyer: a.chosenLawyer,
        chosenLawyerName: a.chosenLawyer?.name || (typeof a.chosenLawyer === 'string' ? a.chosenLawyer : null),
        chosenLawyerId: a.chosenLawyer?._id || a.chosenLawyer || null,
        representationStatus: a.representationStatus || 'None',
        requestDate: a.requestDate ? new Date(a.requestDate).toLocaleDateString() : null,
        requestNote: a.requestNote || null,
        nextHearing: a.hearing?.hearingDate ? new Date(a.hearing.hearingDate).toLocaleDateString() : 'TBD',
        status: a.status,
        verificationStatus: a.verificationStatus || 'Pending',
        timeline: a.timeline?.map(t => ({
          label: t.status + (t.note ? `: ${t.note}` : ''),
          date: new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          done: true
        })) || []
      }));
      setApplications(mappedApps);

      // Filter cases (applications with status other than Submitted/Verification/Under Review/Rejected, or with assigned/accepted lawyer)
      const activeCases = apps
        .filter(a => 
          ['Active', 'LawyerAssigned', 'Lawyer Assigned', 'CourtScheduled', 'Hearing Scheduled', 'Hearing', 'Investigation', 'Case In Progress', 'Evidence Submitted', 'Judgment', 'Completed', 'Approved'].includes(a.status) || 
          Boolean(a.assignedLawyer) || 
          a.representationStatus === 'Accepted'
        )
        .map(a => ({
          id: a._id,
          title: a.caseTitle,
          type: a.caseType,
          court: a.courtDetails?.courtName || a.court || 'District Court',
          tier: a.courtDetails?.courtTier || 'District Court',
          district: a.courtDetails?.district || a.location || 'Coimbatore',
          state: a.courtDetails?.state || 'Tamil Nadu',
          judge: a.assignedJudge?.name ? `Hon. Justice ${a.assignedJudge.name}` : (a.judge?.name ? `Hon. Justice ${a.judge.name}` : (a.hearing?.judge || 'Presiding Judge')),
          assignedJudge: a.assignedJudge || a.judge,
          lawyer: a.assignedLawyer?.name || (a.chosenLawyer?.name ? `Adv. ${a.chosenLawyer.name}` : (a.representationStatus === 'Accepted' && a.chosenLawyerName ? `Adv. ${a.chosenLawyerName}` : 'TBD')),
          assignedLawyer: a.assignedLawyer || a.chosenLawyer,
          status: a.status === 'Completed' ? 'Completed' : (a.representationStatus === 'Accepted' ? 'Counsel Assigned' : (a.status || 'Active')),
          priority: a.urgency || 'Medium',
          nextHearing: a.hearing?.hearingDate ? new Date(a.hearing.hearingDate).toLocaleDateString() : 'TBD',
          courtChangeRequest: a.courtChangeRequest,
          judgeHistory: a.judgeHistory || [],
          timeline: a.timeline?.map(t => ({ name: t.status, date: new Date(t.date).toLocaleDateString(), done: true })) || [],
          raw: a
        }));
      setCases(activeCases);

      // Fetch notifications
      try {
        const notifResp = await axios.get('/notifications');
        setNotifications(notifResp.data);
      } catch (err) {
        console.warn('Failed to load notifications from server, keeping fallback.', err.message);
        setNotifications([
          { id: 1, title: 'Welcome to Seven Seas', body: 'Your dashboard is fully integrated with judicial databases.', time: '1 min ago', read: false }
        ]);
      }

      // Fetch documents for the user's applications
      let docs = [];
      if (apps.length > 0) {
        try {
          const docResp = await axios.get('/documents', { params: { application: apps[0]._id } });
          docs = docResp.data;
        } catch (err) {
          console.warn('Could not load documents from backend.', err.message);
        }
      }
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (user) {
      initSocket(user);
      subscribeToMessages((newMsg) => {
        setChatMessages((prev) => {
          if (prev.some(m => m.id === newMsg._id || m.text === newMsg.text)) return prev;
          return [...prev, {
            id: newMsg._id,
            recipient: 'lawyer',
            sender: newMsg.sender._id === user._id ? 'user' : 'lawyer',
            text: newMsg.text,
            time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      });

      subscribeToNotifications((newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        fetchDashboardData();
      });

      subscribeToHearingUpdates(() => {
        fetchDashboardData();
      });

      subscribeToCaseUpdates(() => {
        fetchDashboardData();
      });

      axios.get('/messages')
        .then(res => {
          if (res.data.success && Array.isArray(res.data.data)) {
            const dbMsgs = res.data.data.map(m => ({
              id: m._id,
              recipient: 'lawyer',
              sender: m.sender._id === user._id ? 'user' : 'lawyer',
              text: m.text,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            if (dbMsgs.length > 0) {
              setChatMessages(dbMsgs);
            }
          }
        })
        .catch(err => console.warn('Could not load message history:', err.message));
    }
  }, [user]);

  // AI Recommender Input & Recommendation state
  const [aiInputs, setAiInputs] = useState({
    caseTitle: '',
    caseType: 'Property Law & Land Partition',
    description: '',
    district: user?.district || 'Theni',
    state: user?.state || 'Tamil Nadu',
    courtLevel: 'District Court',
    language: 'Tamil',
    minExperience: 0,
    budget: 'Subsidized Aid',
    urgency: 'Medium',
    otherRequirements: ''
  });
  const [aiValidationError, setAiValidationError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendedLawyers, setRecommendedLawyers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [aiStepIndex, setAiStepIndex] = useState(-1);

  const [submittingChoice, setSubmittingChoice] = useState(false);
  const [chosenNotice, setChosenNotice] = useState(null);
  const [selectedCasePreset, setSelectedCasePreset] = useState('');

  const handleSelectCasePreset = (chosenTitle) => {
    setSelectedCasePreset(chosenTitle);
    if (!chosenTitle || chosenTitle === 'custom') {
      return;
    }
    
    let found = null;
    for (const group of CASE_CATALOG) {
      const match = group.cases.find(c => c.title === chosenTitle);
      if (match) {
        found = match;
        break;
      }
    }

    if (found) {
      setAiInputs(prev => ({
        ...prev,
        caseTitle: found.title,
        caseType: found.category,
        description: (!prev.description.trim() || prev.description.length < 20) ? found.desc : prev.description
      }));
      setAiValidationError('');
    }
  };

  // Court Transfer Request submission handler
  const handleRequestCourtTransfer = async (e) => {
    e.preventDefault();
    if (!transferringCase || !courtTransferForm.reason.trim()) {
      alert('Please provide a mandatory legal reason for requesting court level transfer.');
      return;
    }
    setIsSubmittingTransfer(true);
    try {
      const targetId = transferringCase.id || transferringCase._id;
      const res = await axios.post(`/applications/${targetId}/court-change`, courtTransferForm);
      alert('Court transfer request submitted for Administrative review!\n\nStatus: Pending. Your current court assignment remains active until reviewed.');
      setShowCourtTransferModal(false);
      setTransferringCase(null);
      setCourtTransferForm({ requestedTier: 'High Court', requestedCourt: 'Madras High Court', reason: '' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(`Error submitting transfer request: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // AI Recommendation Trigger
  // AI Recommendation Trigger with strict validation and real backend matching
  const triggerAiMatch = async () => {
    // 1. Validation of required inputs
    if (!aiInputs.caseTitle.trim()) {
      setAiValidationError('Case Title is required. Please provide a brief title for your dispute.');
      return;
    }
    if (!aiInputs.description.trim() || aiInputs.description.trim().length < 15) {
      setAiValidationError('Detailed case description is required (minimum 15 characters) so our AI can accurately analyze legal intent, statutory sections, and case law precedents.');
      return;
    }
    if (!aiInputs.district.trim() || !aiInputs.state.trim()) {
      setAiValidationError('State and District are required to verify jurisdictional competence and court registry eligibility.');
      return;
    }

    setAiValidationError('');
    setAiLoading(true);
    setHasSearched(true);
    setAiStepIndex(0);
    setRecommendedLawyers([]);

    const stepInterval = setInterval(() => {
      setAiStepIndex((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          return 4;
        }
        return prev + 1;
      });
    }, 400);

    try {
      const response = await axios.post('/recommendations', {
        caseTitle: aiInputs.caseTitle.trim(),
        caseType: aiInputs.caseType,
        description: aiInputs.description.trim(),
        district: aiInputs.district.trim(),
        state: aiInputs.state.trim(),
        courtLevel: aiInputs.courtLevel,
        language: aiInputs.language,
        experience: Number(aiInputs.minExperience) || 0,
        budget: aiInputs.budget === 'Subsidized Aid' ? 0 : (Number(aiInputs.budget) || 0),
        urgency: aiInputs.urgency,
        otherRequirements: aiInputs.otherRequirements ? aiInputs.otherRequirements.trim() : ''
      });

      const rawList = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.lawyers || []);

      const mappedLawyers = rawList.map((lawyer, index) => {
        const lawyerName = lawyer.fullName || lawyer.name || `Advocate ${index + 1}`;
        const lawyerExp = lawyer.experience || 6;
        const lawyerFee = (lawyer.consultationFee && lawyer.consultationFee > 0)
          ? `₹${lawyer.consultationFee}`
          : 'Free / Subsidized Legal Aid';
        const lawyerLangs = Array.isArray(lawyer.languages) 
          ? lawyer.languages.join(', ') 
          : (lawyer.languages || 'Tamil, English');
        const lawyerCourts = Array.isArray(lawyer.courts) 
          ? lawyer.courts.join(', ') 
          : (lawyer.courtLevel || `${aiInputs.district} District Court`);
        const lawyerReasons = Array.isArray(lawyer.reasons) && lawyer.reasons.length > 0
          ? lawyer.reasons
          : [lawyer.reason || `Verified legal specialist in ${lawyer.specialization || aiInputs.caseType} with ${lawyerExp} years experience.`];

        return {
          id: lawyer.lawyerId || lawyer._id || `law-dyn-${index}`,
          lawyerId: lawyer.lawyerId || lawyer._id,
          userId: lawyer.userId || lawyer.lawyerId || lawyer._id,
          name: lawyerName,
          specialization: lawyer.specialization || (Array.isArray(lawyer.specializations) ? lawyer.specializations[0] : aiInputs.caseType),
          specializations: lawyer.specializations || [lawyer.specialization || aiInputs.caseType],
          experience: lawyerExp,
          languages: lawyerLangs,
          fee: lawyerFee,
          consultationFee: lawyer.consultationFee || 0,
          availability: lawyer.availabilityStatus || lawyer.availability || 'Available',
          match: Math.round(Number(lawyer.matchScore) || Number(lawyer.matchPercentage) || 92),
          confidenceScore: Math.round(Number(lawyer.confidenceScore) || 90),
          location: lawyer.location || `${lawyer.district || aiInputs.district}, ${lawyer.state || aiInputs.state}`,
          district: lawyer.district || aiInputs.district,
          state: lawyer.state || aiInputs.state,
          courtLevel: lawyer.courtLevel || aiInputs.courtLevel,
          courts: lawyerCourts,
          reason: lawyerReasons[0],
          reasons: lawyerReasons,
          photo: lawyer.profileImage || null,
          barRegistrationNumber: lawyer.barRegistrationNumber || 'BC/VERIFIED',
          bio: lawyer.bio || `Specialized advocate practicing before ${aiInputs.district} District Court.`
        };
      });

      // Brief animation settle
      await new Promise(r => setTimeout(r, 1200));
      clearInterval(stepInterval);
      setAiStepIndex(5);
      setRecommendedLawyers(mappedLawyers);
    } catch (err) {
      console.error('Error triggering AI match:', err);
      clearInterval(stepInterval);
      setAiValidationError('Failed to retrieve AI recommendations. Please check your backend connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Choose lawyer handler: dispatches notification to the selected advocate
  const handleChooseLawyer = async (lawyer, customParams = null) => {
    try {
      setSubmittingChoice(true);
      const inputs = (customParams && typeof customParams === 'object' && customParams.caseTitle) 
        ? customParams 
        : aiInputs;
      let targetId = typeof customParams === 'string' ? customParams : null;
      if (!targetId) {
        const eligible = applications.find(a => ['Submitted', 'Verification', 'Under Review', 'PendingLawyerAcceptance'].includes(a.status));
        targetId = eligible?._id || applications[0]?._id || 'new';
      }

      const activeApp = applications.find(a => a._id === targetId);
      const chosenLawyerName = lawyer.name || lawyer.fullName || 'Advocate';
      const chosenLawyerId = lawyer.userId || lawyer.lawyerId || lawyer.id;

      const payload = {
        lawyerId: chosenLawyerId,
        lawyerName: chosenLawyerName,
        name: chosenLawyerName,
        barNumber: lawyer.barNumber || lawyer.bar || lawyer.barRegistrationNumber,
        caseTitle: inputs.caseTitle?.trim() || activeApp?.caseTitle || `${inputs.caseType} for ${user?.name || 'Applicant'}`,
        caseType: inputs.caseType || activeApp?.caseType || 'General Litigation',
        description: inputs.description?.trim() || activeApp?.description || 'Representation requested through AI Recommendation System',
        location: inputs.district ? `${inputs.district}, ${inputs.state || 'Tamil Nadu'}` : (activeApp?.location || 'Theni, Tamil Nadu'),
        note: `Applicant ${user?.name || 'Citizen'} selected ${chosenLawyerName} for legal representation via AI Matcher.`
      };

      const res = await axios.post(`/applications/${targetId}/choose-lawyer`, payload);
      const conversationId = res.data?.conversationId;
      const targetLawyerUserId = res.data?.lawyerId || chosenLawyerId;
      setChosenNotice({
        lawyerName: chosenLawyerName,
        caseTitle: payload.caseTitle,
        lawyerId: targetLawyerUserId,
        conversationId: conversationId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      await fetchDashboardData();
      const openChat = window.confirm(
        `🎉 Representation Request Sent to ${chosenLawyerName}!\n\nCase: "${payload.caseTitle}"\n\nA direct message channel has been created in your Messages tab.\n\nWould you like to open your chat with Advocate ${chosenLawyerName} right now?`
      );
      if (openChat) {
        navigate(`/dashboard/messages?conversationId=${conversationId || ''}&lawyerId=${targetLawyerUserId}`);
      }
    } catch (err) {
      console.error('Error choosing lawyer:', err);
      alert('Failed to request representation: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingChoice(false);
    }
  };

  // Form submit handler (saves to backend application database)
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const appDistrict = user?.district || 'Theni';
      const appState = user?.state || 'Tamil Nadu';
      const payload = {
        caseTitle: (applyForm.caseTitle || '').trim() || `${applyForm.caseType || 'Civil'} for ${applyForm.fullName || user?.name || 'Citizen'}`,
        caseType: applyForm.caseType || 'Civil',
        description: (applyForm.caseDescription || '').trim() || `${applyForm.caseType || 'Civil'} application submitted for legal aid.`,
        urgency: applyForm.urgency || 'Medium',
        court: `${appDistrict} District Court`,
        location: applyForm.address || `${appDistrict}, ${appState}`,
        occupation: applyForm.occupation || '',
        monthlyIncome: Number(applyForm.monthlyIncome) || 0,
        courtDetails: {
          district: appDistrict,
          state: appState,
          courtTier: 'District Court',
          courtName: `${appDistrict} District Court`
        }
      };
      
      const response = await axios.post('/applications', payload);
      const generatedCaseId = response.data?.caseId || response.data?._id || '';
      alert(`Success: Legal Aid Application has been successfully created!\n\nReference Case ID: ${generatedCaseId}`);
      setShowApplyModal(false);
      setApplyStep(1);
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating application:', err);
      const errMsg = err.response?.data?.message || err.message || 'Submission failed. Please check your network and required fields.';
      alert('Failed to submit application: ' + errMsg);
    }
  };

  // Real Document attachments Upload
  const handleDocumentUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRealFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (applications.length > 0) {
        formData.append('application', applications[0]._id);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      const response = await axios.post('/documents', formData, config);
      setDocuments(prev => [...prev, response.data]);
      alert('Document uploaded successfully to the verification queue.');
      fetchDashboardData();
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Action: Withdraw Application
  const handleWithdraw = (appId) => {
    if (confirm(`Are you sure you want to withdraw application ${appId}?`)) {
      setApplications(applications.filter(a => a.id !== appId));
      setSelectedApp(null);
      alert(`Application ${appId} has been successfully withdrawn.`);
    }
  };

  // Chat message send
  const handleSendMessage = async () => {
    if (!typedMessage.trim()) return;

    let receiverId = null;
    let appId = null;

    if (applications.length > 0 && applications[0].assignedLawyer) {
      receiverId = applications[0].assignedLawyer._id || applications[0].assignedLawyer;
      appId = applications[0]._id;
    }

    const textToSend = typedMessage;
    const newMsg = {
      id: Date.now(),
      recipient: activeChatRecipient,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    setChatMessages(prev => [...prev, newMsg]);
    setTypedMessage('');

    if (receiverId) {
      try {
        await axios.post('/messages', {
          receiver: receiverId,
          application: appId,
          text: textToSend
        });
      } catch (err) {
        console.error('Failed to post message to backend:', err.message);
      }
    }
  };

  // Comparison toggle helper
  const toggleCompare = (lawyer) => {
    if (compareList.some(l => l.id === lawyer.id)) {
      setCompareList(compareList.filter(l => l.id !== lawyer.id));
    } else {
      if (compareList.length >= 2) {
        alert('You can only compare a maximum of 2 lawyers at the same time.');
        return;
      }
      setCompareList([...compareList, lawyer]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10 text-slate-800 dark:text-slate-100">
      
      {/* ── TOP SECTION: OFFICIAL GOVERNMENT EXECUTIVE WELCOME BANNER (Only on Dashboard Overview) ── */}
      {activeTab === 'dashboard' && (
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden border-t-2 border-t-[#B69D74]">

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome, {userName}
          </h2>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            “The National Legal Services System guarantees equality before the law and provides free, certified legal representation to eligible citizens under the Ministry of Justice framework.”
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
            <span>📅 {todayDate}</span>
            <span>·</span>
            <span>🕒 {currentTime}</span>
            <span>·</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">DOCKET: CASE-2026-8841</span>
          </div>
        </div>

        {/* Executive Action Desk */}
        <div className="w-60 shrink-0 space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Identity Verification</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{profilePercent}% Complete</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${profilePercent}%` }} />
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            title="Download or Print Official Certified Case Summary PDF"
          >
            <FileDown size={14} className="text-amber-400" /> Export Certified Case PDF
          </button>
        </div>
      </div>
      )}

      {/* ── 1. DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">

          {/* CHOSEN COUNSEL LIVE STATUS BANNER */}
          {pendingLawyerApp && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 dark:border-amber-500/40 shadow-lg relative overflow-hidden space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
                    <Clock size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                        Counsel Chosen • Waiting for Lawyer Acceptance
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                      Advocate {pendingLawyerApp.chosenLawyerName || 'Specialist'} has been Chosen
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Dispute: <strong>{pendingLawyerApp.caseTitle || pendingLawyerApp.type}</strong> • Formal representation notification dispatched to advocate inbox on {pendingLawyerApp.requestDate || 'today'}.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/dashboard/applications')}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
                  >
                    View Case Details
                  </button>
                </div>
              </div>

              {/* 4-Step Visual Progress Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">1. Counsel Selected</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Advocate Selected ✓</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">2. Notification Sent</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Delivered to Lawyer ✓</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">3. Lawyer Acceptance</p>
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold animate-pulse">Waiting for Acceptance ⏳</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Scale size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500">4. Active Representation</p>
                    <p className="text-[9px] text-slate-400">Begins upon acceptance</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LAWYER ACCEPTED CELEBRATION BANNER */}
          {acceptedLawyerApp && !pendingLawyerApp && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 dark:border-emerald-500/40 shadow-lg space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Request Accepted • Counsel Assigned
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                      Advocate {acceptedLawyerApp.lawyer} has ACCEPTED your representation request!
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Dispute: <strong>{acceptedLawyerApp.caseTitle || acceptedLawyerApp.type}</strong> • Representation is officially active.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/dashboard/messages')}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <MessageSquare size={14} /> Message Advocate
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/cases')}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
                  >
                    View Case Docket
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 🔔 LIVE COURT HEARING COUNTDOWN BANNER */}
          <div className="bg-[#202A3B] border border-[#B69B72]/30 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#B69B72] shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#B69B72]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#D9C7A5] uppercase tracking-wider border border-[#B69B72]/30">
                  <Clock size={11} /> Next Hearing Scheduled
                </div>
                <h3 className="text-sm md:text-base font-bold text-white mt-1">Property Dispute Hearing • Courtroom Hall 04</h3>
                <p className="text-xs text-slate-300">Presiding Judge: Hon. Justice Perera • District Magistrate Court</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex gap-2 text-center">
                <div className="bg-[#151C28] px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                  <span className="text-sm font-black text-[#B69B72]">02</span>
                  <span className="block text-[8px] uppercase text-slate-400 font-bold">Days</span>
                </div>
                <div className="bg-[#151C28] px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                  <span className="text-sm font-black text-[#B69B72]">14</span>
                  <span className="block text-[8px] uppercase text-slate-400 font-bold">Hours</span>
                </div>
                <div className="bg-[#151C28] px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                  <span className="text-sm font-black text-[#B69B72]">30</span>
                  <span className="block text-[8px] uppercase text-slate-400 font-bold">Mins</span>
                </div>
              </div>
              
              <button
                onClick={() => alert('SMS & Email Hearing Notification Alert activated! You will receive reminder alerts 24h & 2h before the courtroom session.')}
                className="btn-gold text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0"
              >
                <Bell size={13} /> Remind Me
              </button>
            </div>
          </div>
          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#B69B72] text-slate-800 dark:text-white hover:-translate-y-0.5 transition shadow-sm"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#B69B72]">Legal Subsidies</p>
                <p className="text-sm font-bold mt-0.5">Apply for Legal Aid</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center shrink-0 border border-[#B69B72]/20">
                <Plus size={16} />
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/ai-recommend')}
              className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#DDD6FE] text-slate-800 dark:text-white hover:-translate-y-0.5 transition shadow-sm"
            >
              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                  <Sparkles size={10} /> AI Concierge
                </span>
                <p className="text-sm font-bold mt-1">Find AI Lawyer Match</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
                <Sparkles size={16} />
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/documents')}
              className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#B69B72] text-slate-800 dark:text-white hover:-translate-y-0.5 transition shadow-sm"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Document Center</p>
                <p className="text-sm font-bold mt-0.5">Access Secure Vault</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center shrink-0 border border-[#B69B72]/20">
                <FileText size={16} />
              </div>
            </button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Applications */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{ y: -4 }}
              className="card card-accent-gold p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-rose-500 dark:text-rose-450 uppercase tracking-wider">Total Applications</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {applications.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-450">
                  <ShieldAlert size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Awaiting verification audits</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-rose-400 animate-pulse" />
            </motion.div>
 
            {/* Card 2: Cases */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              whileHover={{ y: -4 }}
              className="card card-accent-green p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-450 uppercase tracking-wider">Active Cases</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {cases.length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450">
                  <Scale size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Active representations</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-emerald-400 animate-pulse" />
            </motion.div>
 
            {/* Card 3: Hearings */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="card card-accent-blue p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-450 uppercase tracking-wider">Upcoming Hearings</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    1
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-450">
                  <Calendar size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Scheduled trial hearings</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-blue-400 animate-pulse" />
            </motion.div>
 
            {/* Card 4: Documents */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              whileHover={{ y: -4 }}
              className="card card-accent-purple p-5 glass-card flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-purple-500 dark:text-purple-450 uppercase tracking-wider">Pending Documents</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    {documents.filter(d => d.status === 'Pending Review').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-450">
                  <FileText size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-auto text-left">Awaiting validation approval</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 w-1/3 bg-purple-400 animate-pulse" />
            </motion.div>
          </div>

          {/* Core Dashboard Content Layout grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left side: Case/Application progress & SVG charts */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Application progress SVG chart */}
              <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Application Progress Distribution Graph
                </h3>
                
                {/* SVG Visualizer representing progression metrics */}
                <div className="flex flex-col items-center justify-center py-4">
                  <svg viewBox="0 0 400 120" className="w-full max-w-md">
                    {/* Background path line */}
                    <path d="M 30,60 H 370" stroke="var(--border-color)" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200 dark:stroke-slate-800" />
                    
                    {/* Active completed path line */}
                    <path d="M 30,60 H 270" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Node 1: Submitted */}
                    <circle cx="30" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="30" cy="60" r="4" fill="white" />
                    <text x="30" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Submitted</text>
                    
                    {/* Node 2: Auditing */}
                    <circle cx="150" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="150" cy="60" r="4" fill="white" />
                    <text x="150" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Audit Verified</text>
                    
                    {/* Node 3: Advocate Assigned */}
                    <circle cx="270" cy="60" r="10" fill="#3b82f6" />
                    <circle cx="270" cy="60" r="4" fill="white" />
                    <text x="270" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-450">Lawyer Assigned</text>

                    {/* Node 4: Complete */}
                    <circle cx="370" cy="60" r="10" className="fill-slate-200 dark:fill-slate-800" />
                    <text x="370" y="85" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 dark:fill-slate-600">Trial Judgement</text>
                  </svg>
                  
                  <div className="mt-4 text-center">
                    <span className="text-xs font-semibold text-slate-500">Milestone Stage Level:</span>
                    <span className="text-xs font-bold text-blue-500 ml-1">Counsel Representation Stage (Active)</span>
                  </div>
                </div>
              </div>

              {/* Court Allocation Worklist */}
              <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
                  Court Allocation Worklist
                </h3>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded tracking-wide uppercase">
                          {app.type}
                        </span>
                        <p className="text-xs font-bold text-slate-850 dark:text-white">{app.desc || 'No brief summary description provided.'}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Docket Room: {app.courtroom} · Date: {app.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${
                          app.status === 'Assigned' ? 'badge-blue' :
                          app.status === 'Submitted' ? 'badge-slate' : 'badge-amber'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: Selected Lawyer / Hearings / Recent Notifications */}
            <div className="space-y-6">
              
              {/* Assigned Lawyer Details */}
              <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">My Assigned Legal Counsel</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                    AV
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Advocate Aisha Verma</h4>
                    <p className="text-[10px] text-blue-500 font-semibold">Public Aid Legal Defender</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 py-2 border-t border-slate-100 dark:border-slate-800">
                  <p><strong>Focus:</strong> Land tenure partitions & family arbitration</p>
                  <p><strong>Availability:</strong> Mon to Fri (10 AM - 4 PM)</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/messages')}
                  className="w-full btn-secondary text-xs py-2 justify-center rounded-xl flex items-center gap-1.5"
                >
                  <MessageSquare size={13} /> Chat with Advocate
                </button>
              </div>

              {/* Next Court Hearing details */}
              <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Next Court hearing</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">July 15, 2026</p>
                  <p className="text-xs font-bold mt-1.5">District Court Hall 3</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Time: 10:30 AM · Presiding: Justice Shanmugam</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/schedule')}
                  className="w-full btn-primary text-xs py-2 justify-center rounded-xl flex items-center gap-1.5"
                >
                  <Calendar size={13} /> View Schedule
                </button>
              </div>

              {/* Recent Notifications logs panel */}
              <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Recent Activity Logs</h3>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                      <p className="font-bold text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 2. APPLICATIONS TAB (LEGAL AID SUBSIDY PORTFOLIO) ── */}
      {activeTab === 'applications' && (() => {
        const uniqueAppCategories = ['All', ...new Set(applications.map(a => a.type).filter(Boolean))];
        
        const filteredApps = applications.filter(app => {
          const q = searchQuery.toLowerCase();
          const matchesSearch = !searchQuery || 
            (app.id && app.id.toLowerCase().includes(q)) ||
            (app.type && app.type.toLowerCase().includes(q)) ||
            (app.desc && app.desc.toLowerCase().includes(q)) ||
            (app.caseTitle && app.caseTitle.toLowerCase().includes(q)) ||
            (app.lawyer && app.lawyer.toLowerCase().includes(q)) ||
            (app.chosenLawyerName && app.chosenLawyerName.toLowerCase().includes(q));

          const matchesStatus = filterStatus === 'All' || 
            (filterStatus === 'Submitted' && app.status === 'Submitted') ||
            (filterStatus === 'Under Review' && (app.status === 'Under Review' || app.status === 'Verification')) ||
            (filterStatus === 'Pending Acceptance' && (app.status === 'PendingLawyerAcceptance' || app.representationStatus === 'Requested')) ||
            (filterStatus === 'Assigned' && (app.status === 'LawyerAssigned' || app.representationStatus === 'Accepted')) ||
            (filterStatus === 'Completed' && app.status === 'Completed');

          const matchesVerification = appVerificationFilter === 'All' || app.verificationStatus === appVerificationFilter;
          const matchesCategory = appCategoryFilter === 'All' || app.type === appCategoryFilter;

          return matchesSearch && matchesStatus && matchesVerification && matchesCategory;
        });

        const underReviewCount = applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted' || a.status === 'Verification' || a.verificationStatus === 'Pending').length;
        const counselAssignedCount = applications.filter(a => a.representationStatus === 'Accepted' || a.status === 'LawyerAssigned' || (a.lawyer && a.lawyer !== 'TBD' && !a.lawyer.includes('Unassigned'))).length;
        const verifiedCount = applications.filter(a => a.verificationStatus === 'Verified').length;

        return (
          <div className="space-y-4">
            
            {/* ── TOP HERO BANNER: LEGAL AID SUBSIDY APPLICATIONS (COMPACT & SLEEK) ── */}
            <div className="bg-[#202A3B] text-white rounded-xl border border-[#B69B72]/30 px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B69B72]/15 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Title & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#B69B72]/20 text-[#D9C7A5] flex items-center justify-center shrink-0">
                    <ShieldAlert size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Legal Aid Subsidy Applications
                  </h2>
                  <span className="text-[9px] font-bold text-[#D9C7A5] bg-white/10 px-2 py-0.5 rounded-full border border-[#B69B72]/30">
                    Article 39A Protected
                  </span>
                </div>

                {/* Inline Telemetry & Actions */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Total:</span>
                    <span className="font-bold text-white font-mono">{applications.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">In Review:</span>
                    <span className="font-bold text-[#D9C7A5] font-mono">{underReviewCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Assigned:</span>
                    <span className="font-bold text-white font-mono">{counselAssignedCount}</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-[11px] bg-[#EDE9FE]/10 border border-[#DDD6FE]/20 rounded-lg px-2 py-1">
                    <span className="text-[#EDE9FE]/75">Verified:</span>
                    <span className="font-bold text-[#EDE9FE] font-mono">{verifiedCount}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-1">
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-gold px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm hover:scale-[1.02] transition"
                    >
                      <Plus size={12} /> Submit Request
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/ai-recommend')}
                      className="btn-ai px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Sparkles size={12} className="text-[#5B21B6]" /> Match Advocate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SEARCH, FILTER & VIEW CONTROLS ── */}
            <div className="bg-white dark:bg-[#1B2332] px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Application ID, dispute brief, or assigned counsel..."
                    className="w-full bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 sm:flex-none text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Pending Acceptance">Pending Acceptance</option>
                    <option value="Assigned">Counsel Assigned</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select
                    value={appVerificationFilter}
                    onChange={(e) => setAppVerificationFilter(e.target.value)}
                    className="flex-1 sm:flex-none text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    <option value="All">All Verifications</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    value={appCategoryFilter}
                    onChange={(e) => setAppCategoryFilter(e.target.value)}
                    className="hidden sm:block text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    {uniqueAppCategories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Showing <strong>{filteredApps.length}</strong> of {applications.length}
                </span>
                <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-[#202A3B]/60 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => setAppViewMode('grid')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                      appViewMode === 'grid'
                        ? 'bg-[#202A3B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>⊞ Grid</span>
                  </button>
                  <button
                    onClick={() => setAppViewMode('table')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                      appViewMode === 'table'
                        ? 'bg-[#202A3B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>≡ Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── APPLICATIONS LIST: GRID OR TABLE ── */}
            {filteredApps.length === 0 ? (
              <div className="bg-white dark:bg-[#1B2332] rounded-2xl p-10 text-center border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#B69B72]/15 text-[#B69B72] flex items-center justify-center mx-auto">
                  <ShieldAlert size={26} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#202A3B] dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    No Matching Legal Aid Applications Found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {searchQuery || filterStatus !== 'All' || appVerificationFilter !== 'All' || appCategoryFilter !== 'All'
                      ? 'No applications match your active filters. Try adjusting or resetting your search.'
                      : 'You do not have any registered legal aid applications yet. Submit a petition to request bar-certified representation.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  {(searchQuery || filterStatus !== 'All' || appVerificationFilter !== 'All' || appCategoryFilter !== 'All') && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterStatus('All'); setAppVerificationFilter('All'); setAppCategoryFilter('All'); }}
                      className="text-xs font-bold py-1.5 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FAF9F5] text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-gold text-xs font-bold py-1.5 px-4 rounded-lg text-white shadow-sm transition"
                  >
                    <Plus size={13} className="inline mr-1" /> Submit Application
                  </button>
                </div>
              </div>
            ) : appViewMode === 'grid' ? (
              /* GRID CARDS VIEW */
              <div className="grid gap-3.5 md:grid-cols-2">
                {filteredApps.map((app) => {
                  const isVerified = app.verificationStatus === 'Verified';
                  const isPending = app.verificationStatus === 'Pending';
                  const isRejected = app.verificationStatus === 'Rejected';

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-[#1B2332] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-4.5 shadow-sm hover:shadow-md hover:border-[#B69B72]/40 transition-all flex flex-col justify-between space-y-3.5"
                    >
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-black text-[#202A3B] dark:text-[#D9C7A5] bg-[#FAF9F5] dark:bg-[#202A3B]/60 px-2 py-0.5 rounded-md border border-[#202A3B]/10 dark:border-white/10">
                                {app.id}
                              </span>
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                                isVerified 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              }`}>
                                {app.verificationStatus} Audit
                              </span>
                            </div>
                            
                            <h3 className="text-sm font-extrabold text-[#202A3B] dark:text-white mt-1.5 leading-snug">
                              {app.caseTitle || `${app.type} Petition`}
                            </h3>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-semibold text-[#B69B72] dark:text-[#D9C7A5]">
                                {app.type}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Building size={10} className="text-slate-400" /> {app.courtroom || 'District Court'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[10px] text-slate-400">
                                {app.date}
                              </span>
                            </div>
                          </div>

                          <span className={`badge shrink-0 text-[10px] py-0.5 px-2 ${
                            app.status === 'Completed' ? 'badge-green' : 'badge-gold'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Brief Snippet */}
                        {app.desc && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                            {app.desc}
                          </p>
                        )}

                        {/* Legal Counsel & Representation Status Box */}
                        <div className="p-2.5 my-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/5 dark:border-white/5 space-y-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Assigned Legal Defense
                          </span>

                          {app.representationStatus === 'Requested' || app.status === 'PendingLawyerAcceptance' ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-amber-500 animate-pulse shrink-0" />
                                <div>
                                  <span className="text-xs font-bold text-[#202A3B] dark:text-white block">
                                    {app.chosenLawyerName || 'Advocate Chosen'}
                                  </span>
                                  <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-semibold block">
                                    Pending Lawyer Acceptance
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9.5px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                                Awaiting Retainer
                              </span>
                            </div>
                          ) : app.representationStatus === 'Accepted' || app.status === 'LawyerAssigned' ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                <div>
                                  <span className="text-xs font-bold text-[#202A3B] dark:text-white block">
                                    {app.lawyer}
                                  </span>
                                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                    Representation Confirmed · Bar Certified
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                                Active Counsel
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs italic text-slate-450 dark:text-slate-400">
                                No counsel assigned yet
                              </span>
                              <button
                                onClick={() => navigate('/dashboard/ai-recommend')}
                                className="btn-ai text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                              >
                                <Sparkles size={10} className="text-[#5B21B6]" /> Match Advocate
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Court Hearing / Schedule Preview if available */}
                        {app.nextHearing && app.nextHearing !== 'TBD' && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-[#B69B72]" />
                              <div>
                                <span className="text-[9px] uppercase font-bold text-[#B69B72] block">Next Court Listing</span>
                                <span className="font-bold text-[#202A3B] dark:text-[#D9C7A5] text-[11px]">{app.nextHearing}</span>
                              </div>
                            </div>
                            <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                              Courtroom Hall A
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Operations Footer Actions */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="flex-1 btn-gold py-1.5 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Eye size={12} /> View Dossier
                        </button>
                        
                        <button
                          onClick={() => alert(`Downloading official PDF statement audit for application ${app.id}...`)}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 hover:border-[#B69B72] hover:text-[#B69B72] text-xs font-bold transition flex items-center gap-1"
                          title="Download Statement Details PDF"
                        >
                          <Download size={12} />
                        </button>

                        {(app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Verification') && (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            className="py-1.5 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1"
                            title="Withdraw Application"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>Submission Date</th>
                        <th>Specialization Category</th>
                        <th>Counsel Representation</th>
                        <th>Court Venue</th>
                        <th>Verification Status</th>
                        <th>State</th>
                        <th className="text-right">Operational Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <span className="font-mono font-bold text-xs bg-[#FAF9F5] dark:bg-[#202A3B]/60 px-2 py-0.5 rounded border border-[#202A3B]/10 dark:border-white/10">
                              {app.id}
                            </span>
                          </td>
                          <td className="text-xs text-slate-600 dark:text-slate-300">{app.date}</td>
                          <td>
                            <span className="text-xs font-semibold text-[#B69B72]">{app.type}</span>
                          </td>
                          <td className="font-semibold text-xs">
                            {app.representationStatus === 'Requested' || app.status === 'PendingLawyerAcceptance' ? (
                              <div className="flex flex-col">
                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold text-xs">
                                  <Clock size={11} className="animate-pulse" /> {app.chosenLawyerName || 'Counsel Chosen'}
                                </span>
                                <span className="text-[9px] text-amber-600/80 font-bold">
                                  Pending Acceptance
                                </span>
                              </div>
                            ) : app.representationStatus === 'Accepted' || app.status === 'LawyerAssigned' ? (
                              <div className="flex flex-col">
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold text-xs">
                                  <CheckCircle2 size={11} /> {app.lawyer}
                                </span>
                                <span className="text-[9px] text-emerald-600/80 font-bold">
                                  Confirmed Counsel
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Unassigned</span>
                            )}
                          </td>
                          <td className="text-xs text-slate-600 dark:text-slate-300">{app.courtroom || 'District Court'}</td>
                          <td>
                            <span className={`badge ${
                              app.verificationStatus === 'Verified' ? 'badge-green' :
                              app.verificationStatus === 'Rejected' ? 'badge-red' : 'badge-amber'
                            }`}>
                              {app.verificationStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${app.status === 'Completed' ? 'badge-green' : 'badge-gold'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="px-2.5 py-1 rounded-lg btn-gold text-white text-xs font-bold transition flex items-center gap-1"
                              >
                                <Eye size={11} /> Dossier
                              </button>
                              <button
                                onClick={() => alert(`Downloading official PDF statement audit for application ${app.id}...`)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-600 dark:text-slate-300 hover:text-[#B69B72] text-xs font-bold transition"
                                title="Download PDF"
                              >
                                <Download size={12} />
                              </button>
                              {(app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Verification') && (
                                <button
                                  onClick={() => handleWithdraw(app.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition"
                                  title="Withdraw Application"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── 3. CASES TAB (MY CASES PAGE REDESIGN) ── */}
      {(activeTab === 'cases' || activeTab === 'my-cases') && (() => {
        // Derive full case list: prioritize activeCases, fallback to mapped applications if cases array is empty
        const baseCaseList = cases.length > 0 
          ? cases 
          : applications.map(a => ({
              id: a.id || a._id,
              title: a.caseTitle || a.desc || `${a.type} Legal Aid Petition`,
              type: a.type || 'Civil Law',
              court: a.courtroom || a.court || 'District Court, Theni',
              tier: a.tier || 'District Court',
              district: a.district || 'Theni',
              state: 'Tamil Nadu',
              judge: a.judge || 'Hon. Presiding Magistrate',
              lawyer: a.lawyer || (a.chosenLawyerName ? `Advocate ${a.chosenLawyerName}` : 'Counsel Assignment in Progress'),
              status: a.representationStatus === 'Requested' 
                ? 'Pending Acceptance' 
                : (a.representationStatus === 'Accepted' ? 'Counsel Assigned' : (a.status || 'Active')),
              priority: a.priority || a.urgency || 'Normal',
              nextHearing: a.nextHearing || 'Awaiting Court Listing',
              raw: a.raw || a,
              timeline: a.timeline || []
            }));

        const filteredCases = baseCaseList.filter(c => {
          const q = caseSearchTerm.toLowerCase();
          const matchesSearch = !q ||
            c.id?.toLowerCase().includes(q) ||
            c.title?.toLowerCase().includes(q) ||
            c.type?.toLowerCase().includes(q) ||
            c.court?.toLowerCase().includes(q) ||
            c.lawyer?.toLowerCase().includes(q);

          const matchesStatus = caseStatusFilter === 'All' || 
            (caseStatusFilter === 'Active' && c.status !== 'Completed') ||
            (caseStatusFilter === 'Completed' && c.status === 'Completed') ||
            (caseStatusFilter === 'Hearing' && c.nextHearing && c.nextHearing !== 'Awaiting Court Listing' && c.nextHearing !== 'TBD');

          const matchesCategory = caseCategoryFilter === 'All' || c.type === caseCategoryFilter;

          return matchesSearch && matchesStatus && matchesCategory;
        });

        const activeHearingsCount = baseCaseList.filter(c => c.nextHearing && c.nextHearing !== 'TBD' && c.nextHearing !== 'Awaiting Court Listing').length;
        const assignedCounselCount = baseCaseList.filter(c => c.lawyer && !c.lawyer.includes('Pending') && !c.lawyer.includes('Assignment') && c.lawyer !== 'TBD').length;

        // Unique categories for filtering
        const uniqueCategories = ['All', ...new Set(baseCaseList.map(c => c.type).filter(Boolean))];

        return (
          <div className="space-y-4">
            
            {/* ── TOP HERO BANNER: MY JUDICIAL DOCKET PORTFOLIO (ULTRA-COMPACT & SLEEK) ── */}
            <div className="bg-[#202A3B] text-white rounded-xl border border-[#B69B72]/30 px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B69B72]/15 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Title + Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#B69B72]/20 text-[#D9C7A5] flex items-center justify-center shrink-0">
                    <Scale size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    My Active Legal Cases & Court Dockets
                  </h2>
                  <span className="text-[9px] font-bold text-[#D9C7A5] bg-white/10 px-2 py-0.5 rounded-full border border-[#B69B72]/30">
                    Article 39A Protected
                  </span>
                </div>

                {/* Inline Stats & Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Micro metric badges */}
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Dockets:</span>
                    <span className="font-bold text-white font-mono">{baseCaseList.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Hearings:</span>
                    <span className="font-bold text-[#D9C7A5] font-mono">{activeHearingsCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Advocates:</span>
                    <span className="font-bold text-white font-mono">{assignedCounselCount}</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-[11px] bg-[#EDE9FE]/10 border border-[#DDD6FE]/20 rounded-lg px-2 py-1">
                    <span className="text-[#EDE9FE]/75">Subsidy:</span>
                    <span className="font-bold text-[#EDE9FE]">100% Free</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-1">
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-gold px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm hover:scale-[1.02] transition"
                    >
                      <Plus size={12} /> File Petition
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/ai-recommend')}
                      className="btn-ai px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Sparkles size={12} className="text-[#5B21B6]" /> Find Advocate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SEARCH, FILTER & VIEW TOGGLE CONTROLS (COMPACT) ── */}
            <div className="bg-white dark:bg-[#1B2332] px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={caseSearchTerm}
                    onChange={(e) => setCaseSearchTerm(e.target.value)}
                    placeholder="Search by Docket ID, dispute title, advocate, or court..."
                    className="w-full bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72]"
                  />
                  {caseSearchTerm && (
                    <button onClick={() => setCaseSearchTerm('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={caseStatusFilter}
                    onChange={(e) => setCaseStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-none text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active Proceedings</option>
                    <option value="Hearing">With Scheduled Hearings</option>
                    <option value="Completed">Concluded Dockets</option>
                  </select>

                  <select
                    value={caseCategoryFilter}
                    onChange={(e) => setCaseCategoryFilter(e.target.value)}
                    className="flex-1 sm:flex-none text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-[#202A3B] dark:text-white outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'All' ? 'All Dispute Categories' : cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Showing <strong>{filteredCases.length}</strong> of {baseCaseList.length}
                </span>
                <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-[#202A3B]/60 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => setCaseViewMode('grid')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                      caseViewMode === 'grid'
                        ? 'bg-[#202A3B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>⊞ Grid</span>
                  </button>
                  <button
                    onClick={() => setCaseViewMode('table')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                      caseViewMode === 'table'
                        ? 'bg-[#202A3B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>≡ Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── CASE CONTENT: GRID OR TABLE ── */}
            {filteredCases.length === 0 ? (
              <div className="bg-white dark:bg-[#1B2332] rounded-3xl p-12 text-center border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#B69B72]/15 text-[#B69B72] flex items-center justify-center mx-auto">
                  <FolderOpen size={30} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#202A3B] dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    No Matching Judicial Dockets Found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {caseSearchTerm || caseStatusFilter !== 'All' || caseCategoryFilter !== 'All'
                      ? 'No cases match your current search criteria. Try clearing your filters.'
                      : 'You do not have any registered cases under this view yet. Start by filing a new petition or choosing an advocate.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {(caseSearchTerm || caseStatusFilter !== 'All' || caseCategoryFilter !== 'All') && (
                    <button
                      onClick={() => { setCaseSearchTerm(''); setCaseStatusFilter('All'); setCaseCategoryFilter('All'); }}
                      className="text-xs font-bold py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FAF9F5] text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-gold text-xs font-bold py-2 px-5 rounded-xl text-white shadow-md transition"
                  >
                    <Plus size={14} className="inline mr-1" /> File Case Petition
                  </button>
                </div>
              </div>
            ) : caseViewMode === 'grid' ? (
              /* GRID CARDS VIEW */
              <div className="grid gap-3.5 md:grid-cols-2">
                {filteredCases.map((c) => {
                  const isHighPriority = c.priority === 'High' || c.priority === 'Immediate' || c.priority === 'Urgent';
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-[#1B2332] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-4.5 shadow-sm hover:shadow-md hover:border-[#B69B72]/40 transition-all flex flex-col justify-between space-y-3.5"
                    >
                      {/* Card Header Top */}
                      <div>
                        <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-black text-[#202A3B] dark:text-[#D9C7A5] bg-[#FAF9F5] dark:bg-[#202A3B]/60 px-2 py-0.5 rounded-md border border-[#202A3B]/10 dark:border-white/10">
                                {c.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isHighPriority 
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {c.priority} Priority
                              </span>
                            </div>
                            <h3 className="text-sm font-extrabold text-[#202A3B] dark:text-white mt-1.5 leading-snug">
                              {c.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-semibold text-[#B69B72] dark:text-[#D9C7A5]">
                                {c.type}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Building size={11} className="text-slate-400" /> {c.court}
                              </span>
                            </div>
                          </div>

                          <span className={`badge shrink-0 text-[10px] py-0.5 px-2 ${
                            c.status === 'Completed' ? 'badge-green' : 'badge-gold'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        {/* Presiding Bench & Representing Advocate Box */}
                        <div className="grid grid-cols-2 gap-2.5 p-2.5 my-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/5 dark:border-white/5 text-xs">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Presiding Bench
                            </span>
                            <div className="flex items-center gap-1.5 font-bold text-[#202A3B] dark:text-slate-200 truncate text-[11px]">
                              <Gavel size={11} className="text-[#B69B72] shrink-0" />
                              <span className="truncate">{c.judge || 'Hon. Presiding Magistrate'}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-400 block mt-0.5">{c.tier || 'District Court'}</span>
                          </div>

                          <div>
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Assigned Defense
                            </span>
                            <div className="flex items-center gap-1.5 font-bold text-[#202A3B] dark:text-slate-200 truncate text-[11px]">
                              <Scale size={11} className="text-[#B69B72] shrink-0" />
                              <span className="truncate">{c.lawyer || 'Awaiting Counsel'}</span>
                            </div>
                            <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                              Certified Legal Defender
                            </span>
                          </div>
                        </div>

                        {/* Next Scheduled Hearing Block */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-[#B69B72]" />
                            <div>
                              <span className="text-[9px] uppercase font-bold text-[#B69B72] block">Next Scheduled Hearing</span>
                              <span className="font-bold text-[#202A3B] dark:text-[#D9C7A5] text-[11px]">{c.nextHearing}</span>
                            </div>
                          </div>
                          <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            Courtroom Hall A
                          </span>
                        </div>

                        {/* Milestone Progression Bar */}
                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-400">
                            <span>Procedural Stage</span>
                            <span className="text-[#B69B72]">
                              {c.status === 'Completed' ? 'Decree Pronounced' : 'Trial Proceeding (Active)'}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#202A3B] via-[#B69B72] to-[#D9C7A5] rounded-full transition-all duration-500" 
                              style={{ width: c.status === 'Completed' ? '100%' : '75%' }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Operations Footer Actions */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            if (c.raw?._id || c.id) {
                              navigate(`/dashboard/cases/${c.raw?._id || c.id}`);
                            } else {
                              setSelectedCase(c);
                            }
                          }}
                          className="flex-1 btn-gold py-2 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Eye size={13} /> View Docket Dossier
                        </button>
                        
                        <button
                          onClick={() => navigate(`/dashboard/track?id=${c.id}`)}
                          className="py-2 px-3 rounded-xl bg-[#202A3B] text-white hover:bg-[#2d3a50] text-xs font-bold flex items-center gap-1.5 transition"
                          title="Track real-time milestone progress"
                        >
                          <Clock size={13} className="text-[#D9C7A5]" /> Track Timeline
                        </button>

                        <button
                          onClick={() => {
                            setTransferringCase(c);
                            setShowCourtTransferModal(true);
                          }}
                          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 hover:border-[#B69B72] hover:text-[#B69B72] text-xs font-bold transition"
                          title="Request higher court elevation"
                        >
                          <Building size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="bg-white dark:bg-[#1B2332] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Docket ID</th>
                        <th>Case Title</th>
                        <th>Category</th>
                        <th>Representing Counsel</th>
                        <th>Presiding Bench</th>
                        <th>Priority</th>
                        <th>Next Hearing</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span className="font-mono font-bold text-xs bg-[#FAF9F5] dark:bg-[#202A3B]/60 px-2 py-0.5 rounded border border-[#202A3B]/10 dark:border-white/10">
                              {c.id}
                            </span>
                          </td>
                          <td className="font-bold text-[#202A3B] dark:text-white max-w-[220px] truncate">
                            {c.title}
                          </td>
                          <td>
                            <span className="text-xs font-semibold text-[#B69B72]">{c.type}</span>
                          </td>
                          <td className="font-semibold text-xs text-[#202A3B] dark:text-slate-200">
                            {c.lawyer}
                          </td>
                          <td>
                            <p className="text-xs font-semibold text-[#202A3B] dark:text-white">{c.judge}</p>
                            <p className="text-[10px] text-slate-400">{c.court}</p>
                          </td>
                          <td>
                            <span className={`badge ${
                              c.priority === 'High' || c.priority === 'Immediate' ? 'badge-red' : 'badge-slate'
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="font-bold text-[#B69B72]">{c.nextHearing}</td>
                          <td>
                            <span className={`badge ${c.status === 'Completed' ? 'badge-green' : 'badge-gold'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => {
                                  if (c.raw?._id || c.id) {
                                    navigate(`/dashboard/cases/${c.raw?._id || c.id}`);
                                  } else {
                                    setSelectedCase(c);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg btn-gold text-white text-xs font-bold transition"
                              >
                                Dossier
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/track?id=${c.id}`)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#202A3B] text-white hover:bg-[#2d3a50] text-xs font-bold transition"
                                title="Timeline Tracker"
                              >
                                Track
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

          </div>
        );
      })()}

      {/* ── 4. AI LAWYER TAB ── */}
      {activeTab === 'ai-recommend' && (
        <div className="space-y-4">
          {chosenNotice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Advocate {chosenNotice.lawyerName} Selected!
                  </p>
                  <p className="text-xs text-slate-500">
                    Case: <strong>{chosenNotice.caseTitle}</strong> • Direct consultation message channel is open in your Messages tab.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/messages?lawyerId=${chosenNotice.lawyerId}&conversationId=${chosenNotice.conversationId || ''}`)}
                className="btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 shrink-0"
              >
                <MessageSquare size={13} /> Open Chat in Messages
              </button>
            </div>
          )}
          <AiLawyerRecommender
            user={user}
            applications={applications}
            pendingLawyerApp={pendingLawyerApp}
            acceptedLawyerApp={acceptedLawyerApp}
            onChooseLawyer={handleChooseLawyer}
            submittingChoice={submittingChoice}
            navigate={navigate}
          />
        </div>
      )}

      {/* ── 4B. ASSIGNED / CHOSEN LAWYER TAB ── */}
      {activeTab === 'assigned-lawyer' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Counsel Representation Center
              </h3>
              <p className="text-xs text-slate-400">Manage representation requests, assigned advocates, and legal defense coordination.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/ai-recommend')}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Sparkles size={14} /> Find Recommended Advocates
            </button>
          </div>

          {pendingLawyerApp ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 dark:border-amber-500/40 shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30 shadow-inner shrink-0">
                    {pendingLawyerApp.chosenLawyerName ? pendingLawyerApp.chosenLawyerName.charAt(0) : 'L'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 inline-flex items-center gap-1">
                      <Clock size={11} className="animate-pulse" /> Request Dispatched • Waiting for Lawyer Acceptance
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                      Advocate {pendingLawyerApp.chosenLawyerName || 'Counsel'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Case: <strong>{pendingLawyerApp.caseTitle || pendingLawyerApp.type}</strong> • Requested on {pendingLawyerApp.requestDate || 'today'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/messages?lawyerId=${pendingLawyerApp.chosenLawyer || pendingLawyerApp.raw?.chosenLawyer}`)}
                    className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <MessageSquare size={14} /> Message Advocate
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/applications')}
                    className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-bold"
                  >
                    View Application Docket
                  </button>
                </div>
              </div>

              {/* Progress timeline */}
              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">1. Counsel Selected</p>
                    <p className="text-[10px] text-slate-400">Chosen from AI Matcher</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">2. Notification Sent</p>
                    <p className="text-[10px] text-slate-400">Sent to advocate inbox</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-amber-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">3. Lawyer Acceptance</p>
                    <p className="text-[10px] text-amber-500 font-semibold animate-pulse">Awaiting counsel decision</p>
                  </div>
                </div>
              </div>
            </div>
          ) : acceptedLawyerApp ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 dark:border-emerald-500/40 shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30 shadow-inner shrink-0">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> Representation Active • Counsel Assigned
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                      Advocate {acceptedLawyerApp.lawyer}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Case: <strong>{acceptedLawyerApp.caseTitle || acceptedLawyerApp.type}</strong> • Presiding Court: {acceptedLawyerApp.courtroom || 'District Court'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard/messages')}
                    className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <MessageSquare size={14} /> Message Advocate
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/cases')}
                    className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-bold"
                  >
                    View Court Docket
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] dark:bg-[#1e293b] border border-slate-200/80 dark:border-slate-800 space-y-4">
              <Scale size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Counsel Currently Selected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use our AI Recommendation System to match your dispute category with verified advocate specialists and dispatch your representation request.
              </p>
              <button
                onClick={() => navigate('/dashboard/ai-recommend')}
                className="btn-primary text-xs py-2.5 px-5 rounded-xl font-bold shadow-md shadow-blue-500/20"
              >
                Match with Advocates Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 5. SCHEDULE TAB (JUDICIAL COURTROOM HEARINGS & TRIAL CALENDAR) ── */}
      {activeTab === 'schedule' && (() => {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        // Compile real & simulated judicial hearings from cases and applications
        const compiledHearings = [
          ...cases.filter(c => c.nextHearing && c.nextHearing !== 'TBD' && c.nextHearing !== 'Awaiting Court Listing').map(c => ({
            id: c.id,
            caseId: c.id,
            title: c.title,
            date: c.nextHearing,
            dayOfMonth: 28, // mapped for current month visual placement
            time: '10:30 AM – 12:00 PM',
            courtroom: c.court || 'Courtroom Hall 3, District Complex',
            judge: c.judge || 'Hon. Presiding Magistrate',
            lawyer: c.lawyer || 'Assigned Defense Counsel',
            type: 'Trial Proceeding',
            stage: 'Witness Cross-Examination & Trial Arguments',
            docketRef: c.id
          })),
          ...applications.filter(a => a.nextHearing && a.nextHearing !== 'TBD').map(a => ({
            id: a.id,
            caseId: a.id,
            title: a.caseTitle || `${a.type} Legal Aid Hearing`,
            date: a.nextHearing,
            dayOfMonth: 18,
            time: '11:45 AM – 01:00 PM',
            courtroom: a.courtroom || 'Courtroom Hall 1, Theni Courts',
            judge: a.judgeName || 'Hon. Justice Shanmugam',
            lawyer: a.lawyer || 'Advocate Assigned',
            type: 'Interlocutory Petition',
            stage: 'Substantive Relief & Interim Injunction Scrutiny',
            docketRef: a.id
          }))
        ];

        // Guaranteed baseline court sessions for current month calendar interactivity
        const sampleHearings = [
          {
            id: 'SES-OCT-14',
            caseId: 'CAS-8821',
            title: 'Pre-Trial Discovery & Settlement Conference',
            date: 'Oct 14, 2026',
            dayOfMonth: 14,
            time: '02:30 PM – 03:45 PM',
            courtroom: 'ADR Centre, Court Complex, Theni',
            judge: 'Principal District Judge',
            lawyer: 'Advocate T. Rajendran',
            type: 'ADR Mediation',
            stage: 'Mediation & Document Verification Brief',
            docketRef: 'CAS-8821'
          },
          {
            id: 'SES-OCT-28',
            caseId: 'CAS-9410',
            title: 'Land Partition & Boundary Dispute Trial Hearing',
            date: 'Oct 28, 2026',
            dayOfMonth: 28,
            time: '10:30 AM – 12:00 PM',
            courtroom: 'Courtroom Hall 3, Combined Court, Theni',
            judge: 'Hon. Justice Shanmugam',
            lawyer: 'Advocate Aisha Verma',
            type: 'Trial Hearing',
            stage: 'Cross-Examination of Survey Commissioner',
            docketRef: 'CAS-9410'
          },
          {
            id: 'SES-NOV-04',
            caseId: 'CAS-7102',
            title: 'Tenancy Injunction & Commercial Order Scrutiny',
            date: 'Nov 04, 2026',
            dayOfMonth: 4,
            time: '11:30 AM – 01:00 PM',
            courtroom: 'Courtroom Hall 2, Fast Track Court, Theni',
            judge: 'Senior Civil Judge & CJM',
            lawyer: 'Advocate Rajesh Sharma',
            type: 'Substantive Injunction',
            stage: 'Arguments on Written Statement & Counter-Claim',
            docketRef: 'CAS-7102'
          }
        ];

        const activeCalendarSessions = compiledHearings.length > 0 
          ? [...compiledHearings, ...sampleHearings.filter(s => !compiledHearings.some(c => c.caseId === s.caseId))]
          : sampleHearings;

        // Current active session for dossier display
        const currentSelectedSession = selectedHearingSession || activeCalendarSessions[0];

        // Generate days in active calendar month
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayIndex = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7; // Monday as 0
        const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

        // Previous and Next month navigation
        const handlePrevMonth = () => {
          if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(y => y - 1);
          } else {
            setCalendarMonth(m => m - 1);
          }
        };

        const handleNextMonth = () => {
          if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(y => y + 1);
          } else {
            setCalendarMonth(m => m + 1);
          }
        };

        // Export iCal (.ics) file handler
        const handleExportICS = () => {
          const s = currentSelectedSession;
          const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SevenSeas Court Legal Aid Portal//EN',
            'BEGIN:VEVENT',
            `SUMMARY:${s.title} (${s.docketRef})`,
            `DESCRIPTION:Court Proceeding: ${s.stage}\\nPresiding: ${s.judge}\\nCounsel: ${s.lawyer}`,
            `LOCATION:${s.courtroom}`,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\r\n');

          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Court_Hearing_${s.docketRef}.ics`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="space-y-4">
            
            {/* ── TOP HERO BANNER: HEARING & TRIAL CALENDAR (COMPACT & SLEEK) ── */}
            <div className="bg-[#202A3B] text-white rounded-xl border border-[#B69B72]/30 px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B69B72]/15 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Title & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#B69B72]/20 text-[#D9C7A5] flex items-center justify-center shrink-0">
                    <Calendar size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Judicial Hearings & Chamber Trial Schedule
                  </h2>
                  <span className="text-[9px] font-bold text-[#D9C7A5] bg-white/10 px-2 py-0.5 rounded-full border border-[#B69B72]/30">
                    Live Court Listings
                  </span>
                </div>

                {/* Inline Telemetry & Actions */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Sessions:</span>
                    <span className="font-bold text-white font-mono">{activeCalendarSessions.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-white/60">Next:</span>
                    <span className="font-bold text-[#D9C7A5] font-mono">{currentSelectedSession.date}</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-[11px] bg-[#EDE9FE]/10 border border-[#DDD6FE]/20 rounded-lg px-2 py-1">
                    <span className="text-[#EDE9FE]/75">Chamber:</span>
                    <span className="font-bold text-[#EDE9FE] truncate max-w-[120px]">{currentSelectedSession.courtroom.split(',')[0]}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-1">
                    <button
                      onClick={handleExportICS}
                      className="btn-gold px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm hover:scale-[1.02] transition"
                      title="Download .ICS file to add session to Apple / Google / Outlook calendar"
                    >
                      <Download size={12} /> Sync .ICS
                    </button>
                    <button
                      onClick={() => {
                        setTransferringCase(cases[0] || null);
                        setShowCourtTransferModal(true);
                      }}
                      className="btn-ai px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      title="Request session postponement or court transfer"
                    >
                      <Building size={12} className="text-[#5B21B6]" /> Reschedule / Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CALENDAR VIEW CONTROLS & HEADER ── */}
            <div className="bg-white dark:bg-[#1B2332] px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-slate-700 dark:text-slate-300 hover:text-[#B69B72] transition"
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-black text-[#202A3B] dark:text-white uppercase tracking-wider min-w-[120px] text-center" style={{ fontFamily: 'var(--font-display)' }}>
                  {monthNames[calendarMonth]} {calendarYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-slate-700 dark:text-slate-300 hover:text-[#B69B72] transition"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>

                <button
                  onClick={() => {
                    setCalendarMonth(new Date().getMonth());
                    setCalendarYear(new Date().getFullYear());
                  }}
                  className="text-[11px] font-bold text-[#B69B72] hover:underline ml-2"
                >
                  Today
                </button>
              </div>

              {/* View Selector Switcher */}
              <div className="flex items-center gap-1 bg-[#FAF9F5] dark:bg-[#202A3B]/60 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
                {['month', 'week', 'agenda'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition ${
                      calendarView === view
                        ? 'bg-[#202A3B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* ── VIEW 1: MONTH CALENDAR GRID + SELECTED SESSION DOSSIER ── */}
            {calendarView === 'month' && (
              <div className="grid gap-3.5 md:grid-cols-3">
                
                {/* Left 2 Columns: Calendar Month Table */}
                <div className="md:col-span-2 p-4 bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {/* Previous month trailing days */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`prev-${i}`} className="h-10 sm:h-12 flex items-center justify-center text-slate-300 dark:text-slate-700 text-[11px]">
                        {prevMonthDays - firstDayIndex + i + 1}
                      </div>
                    ))}

                    {/* Current month days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const hasHearing = activeCalendarSessions.find(s => s.dayOfMonth === dayNumber);
                      const isToday = dayNumber === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
                      const isSelected = currentSelectedSession?.dayOfMonth === dayNumber;

                      return (
                        <div
                          key={`day-${dayNumber}`}
                          onClick={() => {
                            if (hasHearing) {
                              setSelectedHearingSession(hasHearing);
                            }
                          }}
                          className={`h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center relative transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#202A3B] text-white ring-2 ring-[#B69B72] shadow-sm'
                              : hasHearing
                              ? 'bg-[#B69B72]/15 text-[#202A3B] dark:text-[#D9C7A5] font-black hover:bg-[#B69B72]/25'
                              : isToday
                              ? 'border border-[#B69B72] text-[#B69B72] font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="text-xs font-bold leading-none">{dayNumber}</span>
                          
                          {/* Hearing indicator dot / pill */}
                          {hasHearing && (
                            <div className="flex items-center gap-0.5 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B69B72] animate-pulse" />
                              <span className={`text-[8.5px] font-bold hidden sm:inline ${
                                isSelected ? 'text-[#D9C7A5]' : 'text-[#B69B72]'
                              }`}>
                                Trial
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B69B72]" /> Scheduled Trial Hearing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full border border-[#B69B72]" /> Current Date
                    </span>
                  </div>
                </div>

                {/* Right Column: Selected Session Dossier */}
                <div className="p-4 bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#B69B72] bg-[#B69B72]/10 px-2.5 py-0.5 rounded-md border border-[#B69B72]/20">
                        {currentSelectedSession.type}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {currentSelectedSession.docketRef}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-[#202A3B] dark:text-white leading-snug">
                        {currentSelectedSession.title}
                      </h4>
                      <p className="text-[11px] text-[#B69B72] font-semibold mt-0.5">
                        {currentSelectedSession.stage}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/5 dark:border-white/5 space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Date & Hearing Time</span>
                        <div className="font-bold text-[#202A3B] dark:text-white flex items-center gap-1.5 mt-0.5">
                          <Clock size={12} className="text-[#B69B72]" />
                          <span>{currentSelectedSession.date} · {currentSelectedSession.time}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Courtroom & Bench</span>
                        <div className="font-bold text-[#202A3B] dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                          <Building size={12} className="text-slate-400" />
                          <span className="truncate">{currentSelectedSession.courtroom}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Gavel size={11} className="text-[#B69B72]" /> Presiding: {currentSelectedSession.judge}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Assigned Legal Defender</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                          <Scale size={11} /> {currentSelectedSession.lawyer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dossier Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      onClick={handleExportICS}
                      className="w-full btn-gold py-1.5 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Download size={12} /> Add to Device Calendar
                    </button>
                    
                    <button
                      onClick={() => {
                        const targetCase = cases.find(c => c.id === currentSelectedSession.docketRef) || cases[0];
                        if (targetCase?._id || targetCase?.id) {
                          navigate(`/dashboard/cases/${targetCase._id || targetCase.id}`);
                        } else {
                          navigate('/dashboard/cases');
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 hover:border-[#B69B72] hover:text-[#B69B72] text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye size={12} /> View Complete Case Dossier
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── VIEW 2: WEEK TIMELINE VIEW ── */}
            {calendarView === 'week' && (
              <div className="space-y-3">
                {activeCalendarSessions.map((session, i) => (
                  <motion.div
                    key={session.id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 sm:p-4 bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#B69B72]/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#B69B72] bg-[#B69B72]/10 px-2 py-0.5 rounded border border-[#B69B72]/20">
                          {session.docketRef}
                        </span>
                        <span className="text-[10px] font-bold bg-[#202A3B] text-white px-2 py-0.5 rounded">
                          {session.type}
                        </span>
                        <span className="text-xs font-extrabold text-[#202A3B] dark:text-white">
                          {session.date} · {session.time}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-[#202A3B] dark:text-white">
                        {session.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Building size={11} /> {session.courtroom}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Gavel size={11} className="text-[#B69B72]" /> {session.judge}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><Scale size={11} /> {session.lawyer}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={handleExportICS}
                        className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FAF9F5] dark:bg-[#202A3B]/50 text-slate-700 dark:text-slate-300 hover:border-[#B69B72] hover:text-[#B69B72] text-xs font-bold transition flex items-center gap-1"
                      >
                        <Download size={11} /> Sync .ICS
                      </button>
                      <button
                        onClick={() => setSelectedHearingSession(session)}
                        className="btn-gold py-1.5 px-3 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition"
                      >
                        <Eye size={11} /> Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── VIEW 3: PROCEDURAL MILESTONES AGENDA VIEW ── */}
            {calendarView === 'agenda' && (
              <div className="bg-white dark:bg-[#1B2332] rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Chronological Trial Milestones & Procedural Deadlines
                  </h3>
                  <span className="text-[10px] font-bold text-[#B69B72]">
                    High Priority Court Listings
                  </span>
                </div>

                <div className="space-y-3 relative pl-4 border-l-2 border-[#B69B72]/30 ml-2">
                  {[
                    {
                      date: 'Oct 14, 2026',
                      time: '02:30 PM',
                      title: 'ADR Mediation Session & Survey Settlement Discussion',
                      desc: 'Appearance before ADR Centre officer with Advocate T. Rajendran. Bring original deed and property tax receipt.',
                      badge: 'Pre-Trial Briefing',
                      docket: 'CAS-8821'
                    },
                    {
                      date: 'Oct 22, 2026',
                      time: '05:00 PM',
                      title: 'Deadline: Evidentiary Partition Survey Deposition Files',
                      desc: 'All boundary dispute survey records must be uploaded in the Documents tab for judicial clerk validation.',
                      badge: 'Registry Deadline',
                      docket: 'CAS-9410'
                    },
                    {
                      date: 'Oct 28, 2026',
                      time: '10:30 AM',
                      title: 'Substantive Courtroom Trial: Cross Examination of Witness',
                      desc: 'Oral testimony and cross examination in Courtroom Hall 3 before Hon. Justice Shanmugam.',
                      badge: 'Trial Hearing',
                      docket: 'CAS-9410'
                    },
                    {
                      date: 'Nov 04, 2026',
                      time: '11:30 AM',
                      title: 'Commercial Injunction Scrutiny & Order Reading',
                      desc: 'Pronouncement of interlocutory relief and decree recording in Fast Track Court.',
                      badge: 'Bench Order',
                      docket: 'CAS-7102'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-[#B69B72] border-2 border-white dark:border-[#1B2332]" />
                      <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/5 dark:border-white/5 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#202A3B] dark:text-[#D9C7A5]">
                              {item.date} · {item.time}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-slate-400 bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded">
                              {item.docket}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#B69B72] bg-[#B69B72]/10 px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#202A3B] dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── 6. DOCUMENTS TAB ── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Secure Documents Vault
                </h3>
                <p className="text-xs text-slate-400">Manage, replace, or preview financial eligibility and evidence files.</p>
              </div>

              {/* Upload action button */}
              <button
                onClick={handleDocumentUpload}
                disabled={isUploading}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 self-start"
              >
                <Upload size={14} /> {isUploading ? `Uploading: ${uploadProgress}%` : 'Upload New Document'}
              </button>
            </div>

            {/* Document listings table */}
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>File Size</th>
                    <th>Upload Date</th>
                    <th>Verification status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="font-bold">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td>{doc.type}</td>
                      <td>{doc.size}</td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`badge ${
                          doc.status === 'Approved' ? 'badge-green' : 'badge-amber'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => alert(`Document Preview: ${doc.name}`)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-250 text-xs text-slate-700"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                            className="p-1 rounded bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                          >
                            Replace
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

      {/* ── 7. MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <ChatCenter />
        </div>
      )}

      {/* ── LAWYER FEES & PAYMENTS TAB ── */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-[#1F2839] text-white rounded-2xl p-6 shadow-sm border border-[#B69D74]/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B69D74]/20 text-[#D4C2A3] border border-[#B69D74]/30 text-xs font-bold">
                <CreditCard size={14} /> Judicial Escrow Payment Portal
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Lawyer Fees & Payment Escrow
              </h2>
              <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
                Review counsel fees, retainers, and filing costs. Payments made here are held in safe judicial escrow until hearing confirmation.
              </p>
            </div>
            <div className="flex gap-3 z-10 shrink-0">
              <button 
                onClick={() => {
                  const pending = fees.find(f => f.status !== 'Paid');
                  if (pending) handleStartPayment(pending);
                  else alert('All current lawyer fees are paid up to date!');
                }}
                className="btn-primary text-xs px-5 py-3 rounded-xl flex items-center gap-2 font-bold shadow-sm hover:scale-105 transition"
              >
                <DollarSign size={16} /> Pay Due Lawyer Fees
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Fees Due</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹{fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amountDue, 0)}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                  {fees.filter(f => f.status !== 'Paid').length} pending fee invoices
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settled Payments</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹{fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.totalAmount, 0)}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  {fees.filter(f => f.status === 'Paid').length} completed receipts
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Earliest Due Date</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {fees.find(f => f.status !== 'Paid')?.dueDate || 'No Pending Due'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {fees.find(f => f.status !== 'Paid')?.lawyerName || 'Counsel Account Verified'}
                </p>
              </div>
            </div>
          </div>

          {/* Fees Table / Cards */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Counsel Fee Statements</h3>
                <p className="text-xs text-slate-400">View and settle retainers, court processing, and consultation fees</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {['All', 'Pending', 'Paid', 'Overdue'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFeeFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      feeFilterStatus === st 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {fees
                .filter(f => feeFilterStatus === 'All' ? true : f.status === feeFilterStatus)
                .map(fee => (
                  <div 
                    key={fee.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {fee.caseId}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {fee.caseTitle}
                        </h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : fee.status === 'Overdue'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {fee.status === 'Paid' && <CheckCircle2 size={11} />}
                          {fee.status === 'Overdue' && <AlertCircle size={11} />}
                          {fee.status === 'Pending' && <Clock size={11} />}
                          {fee.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <strong>Description:</strong> {fee.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span><strong>Counsel:</strong> {fee.lawyerName}</span>
                        <span>•</span>
                        <span><strong>Due Date:</strong> {fee.dueDate}</span>
                        {fee.paidAt && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-medium"><strong>Paid On:</strong> {fee.paidAt} ({fee.paymentMethod})</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-semibold">Total Fee</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">₹{fee.totalAmount}</p>
                        {fee.amountDue > 0 ? (
                          <p className="text-[11px] text-rose-500 font-bold">Due: ₹{fee.amountDue}</p>
                        ) : (
                          <p className="text-[11px] text-emerald-500 font-bold">Fully Paid</p>
                        )}
                      </div>

                      {fee.status !== 'Paid' ? (
                        <button
                          onClick={() => handleStartPayment(fee)}
                          className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition"
                        >
                          <CreditCard size={14} /> Pay Fee Now
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedReceiptFee(fee)}
                          className="btn-secondary text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <Receipt size={14} /> View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. PROFILE & SETTINGS TAB ── */}
      {activeTab === 'profile' && (
        <ProfilePage />
      )}
      {false && (
        <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px]">
          
          {/* Profile settings tabs selector (Left 1/4) */}
          <div className="w-full md:w-56 shrink-0 border-r border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-455 uppercase tracking-widest px-3 mb-2">Management</p>
            {[
              { id: 'personal', label: 'Personal Information', icon: User },
              { id: 'security', label: 'Security & Auth', icon: Lock },
              { id: 'preferences', label: 'Settings Preferences', icon: Settings },
              { id: 'feedback', label: 'Lawyer Feedback', icon: Heart },
              { id: 'support', label: 'FAQ & Support', icon: HelpCircle }
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

          {/* Profile Active SubTab Content (Right 3/4) */}
          <div className="flex-1 p-6">
            
            {/* PERSONAL INFO SUBTAB */}
            {profileSubTab === 'personal' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h4>
                  <p className="text-xs text-slate-400">Update registered public aid credentials details.</p>
                </div>

                {/* Picture Avatar upload */}
                <div className="flex items-center gap-4 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-extrabold text-slate-400 text-xl border border-slate-200 dark:border-slate-800">
                    GR
                  </div>
                  <div>
                    <button onClick={() => alert('Avatar upload triggers...')} className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg">Upload Picture</button>
                    <p className="text-[10px] text-slate-400 mt-1">PNG or JPG up to 1MB</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Full Name</label>
                    <input type="text" defaultValue={user?.name || 'Gokul Ram'} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Email address</label>
                    <input type="email" defaultValue={user?.email || 'user@sevenseas.com'} disabled className="form-input bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Contact Number</label>
                    <input type="text" placeholder="+94 77 123 4567" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Occupation</label>
                    <input type="text" placeholder="e.g. Farmer" className="form-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Resident Address</label>
                    <textarea rows={2} placeholder="Enter your full home address details..." className="form-input resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Registered District</label>
                    <input type="text" defaultValue={user?.district || 'Coimbatore'} disabled className="form-input bg-slate-50 dark:bg-slate-900 font-semibold text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Registered State</label>
                    <input type="text" defaultValue={user?.state || 'Tamil Nadu'} disabled className="form-input bg-slate-50 dark:bg-slate-900 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Emergency Contact Person</label>
                    <input type="text" placeholder="Full name of relation" className="form-input" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfilePercent(100);
                    alert('Success: Personal credentials saved.');
                  }}
                  className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                >
                  Save Profile Info
                </button>
              </div>
            )}

            {/* SECURITY SUBTAB */}
            {profileSubTab === 'security' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & Authentications</h4>
                  <p className="text-xs text-slate-400">Strengthen your dashboard access parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">New Password</label>
                      <input type="password" placeholder="••••••••" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="form-input" />
                    </div>
                  </div>
                </div>

                {/* 2FA block */}
                <div className="flex items-center justify-between p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div>
                    <h5 className="text-xs font-bold">Two-Factor Authentication (2FA)</h5>
                    <p className="text-[10px] text-slate-455 mt-0.5">Prompt for email codes on logins from new browsers.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4.5 w-4.5 text-blue-600 rounded" />
                </div>

                {/* Login audit log */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Access sessions</p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[11px] text-slate-500 space-y-1">
                    <p>🌐 Chrome Browser · Windows PC · Colombo (Active Session)</p>
                    <p>📱 Safari Browser · iOS Device · Kandy (June 28, 2026)</p>
                  </div>
                </div>

                <button onClick={() => alert('Password successfully updated.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Update Security Credentials
                </button>
              </div>
            )}

            {/* PREFERENCES SUBTAB */}
            {profileSubTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Preferences & Design Settings</h4>
                  <p className="text-xs text-slate-400">Configure visual themes, contrast modes, text size scaling, and notification channels.</p>
                </div>

                {/* Embedded Design & Accessibility Customizer */}
                <ThemeCustomizer />

                <div className="space-y-4">
                  {/* Theme toggler */}
                  <div className="flex items-center justify-between p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      <h5 className="text-xs font-bold">Enable dark mode theme</h5>
                      <p className="text-[10px] text-slate-455 mt-0.5">Toggle interface elements contrast.</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="text-xs font-bold text-blue-500 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950"
                    >
                      {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                    </button>
                  </div>

                  {/* Language selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Workspace Language</label>
                    <select className="form-input">
                      <option>English</option>
                      <option>Tamil (Tamil Nadu)</option>
                      <option>Hindi</option>
                    </select>
                  </div>

                  {/* Alert categories checkboxes */}
                  <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notification Routes</p>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-xs text-slate-700 dark:text-slate-350">Email alerts for upcoming hearings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-xs text-slate-700 dark:text-slate-350">In-app notifications when lawyer posts messages</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => alert('Preferences configurations saved.')} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
                  Save Preferences Setup
                </button>
              </div>
            )}

            {/* FEEDBACK SUBTAB */}
            {profileSubTab === 'feedback' && (
              <div className="space-y-6 animate-fade-in max-w-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Counsel Feedback & Suggestion board</h4>
                  <p className="text-xs text-slate-400">Audit the service delivery metrics of assigned legal defenders.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Advocate Aisha Verma representation rating</label>
                    <select className="form-input">
                      <option>⭐⭐⭐⭐⭐ (Highly satisfied)</option>
                      <option>⭐⭐⭐⭐ (Satisfied)</option>
                      <option>⭐⭐⭐ (Average assistance)</option>
                      <option>⭐⭐ (Need improvement)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-455 uppercase mb-1.5">Submit Portal Suggestions or Complaint files</label>
                    <textarea rows={3} placeholder="Please share suggestions or grievances regarding counsel assignments..." className="form-input resize-none" />
                  </div>
                </div>

                <button
                  onClick={() => alert('Feedback submitted. Thank you for contributing to public aid audits.')}
                  className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                >
                  Submit Suggestions
                </button>
              </div>
            )}

            {/* SUPPORT / FAQ SUBTAB */}
            {profileSubTab === 'support' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Help Desk FAQs & Contact tickets</h4>
                  <p className="text-xs text-slate-400">Quick solutions and administrative ticket creation.</p>
                </div>

                {/* FAQ checklist dropdowns */}
                <div className="space-y-2">
                  {[
                    { q: 'Who qualifies for subsidized legal aid?', a: 'Any registered citizen with monthly household income audited below LKR 50,000 qualifies for free counsel.' },
                    { q: 'How do I download my case details PDF statement?', a: 'Under the "Applications" tab, clicking the Download icon next to any approved case will generate the audited summary statement.' },
                    { q: 'Can I replace uploaded evidentiary certificates?', a: 'Yes, navigate to the "Documents" tab and click the Replace button next to the document in question to upload updated files.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-bold"
                      >
                        <span>Q: {faq.q}</span>
                        <ChevronDown size={14} className={`transform transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {activeFaq === idx && (
                        <div className="p-3.5 bg-white dark:bg-slate-950 text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-900">
                          A: {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Support Ticket form */}
                <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4 max-w-xl">
                  <h5 className="text-xs font-bold">Submit Support query ticket</h5>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                    <input type="text" placeholder="e.g. Assigned counsel scheduling error" className="form-input bg-white dark:bg-slate-950" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                    <textarea rows={2} placeholder="Explain in detail..." className="form-input bg-white dark:bg-slate-950 resize-none" />
                  </div>
                  <button onClick={() => alert('Support ticket registered. Admins will review details within 12 hours.')} className="btn-secondary text-[10px] py-1.5 px-4 rounded-xl">
                    Register Ticket
                  </button>
                </div>

                {/* Critical action area */}
                <div className="pt-6 border-t border-slate-150 dark:border-slate-850 max-w-xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-red-500">Deactivate Account</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Permanently erase your cases history from workspace portal.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('CRITICAL WARNING: Are you sure you want to delete your profile? This action is irreversible.')) {
                        logout();
                        navigate('/');
                      }
                    }}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                  >
                    Delete Account
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 9. APPLICATIONS DETAILS VIEW MODAL ── */}
      {/* ── 9. APPLICATION DOSSIER DETAILS MODAL ── */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2332] rounded-2xl border border-[#B69B72]/40 max-w-lg w-full overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="bg-[#202A3B] text-white p-4 sm:p-5 border-b border-[#B69B72]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B69B72]/20 text-[#D9C7A5] flex items-center justify-center">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Legal Aid Dossier — {selectedApp.id}
                  </h4>
                  <p className="text-[10px] text-[#FAF9F5]/70">Article 39A Certified Representation Request</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-7 h-7 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center text-base transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3.5 bg-[#FAF9F5] dark:bg-[#202A3B]/40 rounded-xl border border-[#202A3B]/5 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Dispute Type</span>
                  <span className="font-bold text-[#B69B72]">{selectedApp.type}</span>
                </div>
                
                {selectedApp.caseTitle && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Petition Title</span>
                    <span className="font-bold text-[#202A3B] dark:text-white text-right max-w-[220px] truncate">{selectedApp.caseTitle}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Brief Summary</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedApp.desc || 'Legal aid representation requested under Article 39A statutory mandate.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 block">Submitted On</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp.date}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 block">Court Venue</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{selectedApp.courtroom || 'District Court'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 block">Verification Audit</span>
                    <span className={`badge text-[9.5px] mt-0.5 ${
                      selectedApp.verificationStatus === 'Verified' ? 'badge-green' :
                      selectedApp.verificationStatus === 'Rejected' ? 'badge-red' : 'badge-amber'
                    }`}>
                      {selectedApp.verificationStatus}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9.5px] font-bold text-slate-400 block">Assigned Counsel</span>
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {selectedApp.lawyer || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Tracker timelines inside detail view */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-extrabold text-[#B69B72] uppercase tracking-wider">
                  Verification Milestones & Procedural Audit
                </p>
                <div className="space-y-2.5 relative pl-4 border-l-2 border-[#B69B72]/30 ml-2">
                  {selectedApp.timeline?.map((step, i) => (
                    <div key={i} className="relative">
                      <span className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ${
                        step.done ? 'bg-[#B69B72]' : 'bg-slate-200 dark:bg-slate-800'
                      }`} />
                      <p className={`text-xs font-bold ${step.done ? 'text-[#202A3B] dark:text-slate-200' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachment trigger */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Upload Supporting Affidavit / Evidence
                </label>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealFileUpload} />
                <button
                  type="button"
                  onClick={handleDocumentUpload}
                  disabled={isUploading}
                  className="w-full py-2.5 border-2 border-dashed border-[#B69B72]/30 hover:border-[#B69B72] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#B69B72] hover:bg-[#B69B72]/5 transition"
                >
                  <Upload size={13} /> {isUploading ? `Uploading: ${uploadProgress}%` : 'Attach PDF Document'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#FAF9F5] dark:bg-[#202A3B]/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Downloading signed legal aid petition statement for ${selectedApp.id}...`)}
                className="btn-gold px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition"
              >
                <Download size={12} /> Download Certified Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. CASES TRACKING DETAILS MODAL ── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-850 p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedCase(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">×</button>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300">
                  {selectedCase.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                  {selectedCase.tier || 'District Court'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{selectedCase.title}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Docket Reference: {selectedCase.id}</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Presiding Bench:</strong> <span className="text-purple-700 dark:text-purple-300 font-semibold">{selectedCase.judge}</span></p>
                <p><strong>Representing Counsel:</strong> <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedCase.lawyer}</span></p>
                <p><strong>Allocated Court:</strong> {selectedCase.court}</p>
                <p><strong>District of Origin:</strong> {selectedCase.district}, {selectedCase.state || 'Tamil Nadu'}</p>
                <p><strong>Priority Level:</strong> {selectedCase.priority}</p>
                <p><strong>Next Hearing:</strong> {selectedCase.nextHearing}</p>
              </div>
            </div>

            {/* Court Elevation Request Status or Trigger */}
            {selectedCase.courtChangeRequest && selectedCase.courtChangeRequest.status === 'Pending' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <Clock size={13} className="text-amber-600" /> Court Elevation Request Under Review
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
                  Requested Level: <strong>{selectedCase.courtChangeRequest.requestedTier}</strong> ({selectedCase.courtChangeRequest.requestedCourt}). Awaiting administrative confirmation.
                </p>
              </div>
            ) : selectedCase.courtChangeRequest && selectedCase.courtChangeRequest.status === 'Approved' ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs space-y-1 text-emerald-700 dark:text-emerald-300">
                <p className="font-bold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={13} /> Court Transfer Approved
                </p>
                <p className="text-[10px]">
                  This docket was officially elevated to <strong>{selectedCase.tier}</strong>.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTransferringCase(selectedCase);
                  setShowCourtTransferModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition"
              >
                <Building size={14} /> Request Higher Court Elevation (High / Supreme Court)
              </button>
            )}

            {/* Case timeline milestones progress */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Milestones Progress</p>
              <div className="space-y-3 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                {selectedCase.timeline?.map((step, i) => (
                  <div key={i} className="relative">
                    <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ${step.done ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    <p className={`text-xs font-bold ${step.done ? 'text-slate-700 dark:text-slate-350' : 'text-slate-400'}`}>{step.name}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex gap-2">
              <button
                onClick={() => navigate('/dashboard/cases/' + selectedCase.id)}
                className="w-full btn-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Eye size={14} /> Open Full Case Dossier & History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COURT ELEVATION REQUEST MODAL ── */}
      {showCourtTransferModal && transferringCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => {
                setShowCourtTransferModal(false);
                setTransferringCase(null);
              }}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                <Building size={22} />
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Request Court Level Elevation</h4>
                <p className="text-xs text-slate-400">Apply to transfer docket <span className="font-mono font-bold text-purple-600">{transferringCase.id}</span> to a higher forum.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs">
              <p>Current Forum: <strong>{transferringCase.court}</strong> ({transferringCase.tier || 'District Court'})</p>
              <p className="text-slate-400 mt-0.5">District Jurisdiction: {transferringCase.district}, {transferringCase.state || 'Tamil Nadu'}</p>
            </div>

            <form onSubmit={handleRequestCourtTransfer} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Higher Court Level *
                </label>
                <select
                  value={courtTransferForm.requestedTier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    const court = tier === 'Supreme Court' ? 'Supreme Court of India, New Delhi' : 'Madras High Court, Chennai Bench';
                    setCourtTransferForm({ ...courtTransferForm, requestedTier: tier, requestedCourt: court });
                  }}
                  className="form-input w-full font-medium"
                >
                  <option value="High Court">High Court (State Jurisdiction)</option>
                  <option value="Supreme Court">Supreme Court of India (Apex Constitutional Court)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Proposed Court Name *
                </label>
                <input
                  value={courtTransferForm.requestedCourt}
                  onChange={(e) => setCourtTransferForm({ ...courtTransferForm, requestedCourt: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mandatory Legal Grounds & Reason for Transfer *
                </label>
                <textarea
                  value={courtTransferForm.reason}
                  onChange={(e) => setCourtTransferForm({ ...courtTransferForm, reason: e.target.value })}
                  required
                  rows={3}
                  className="form-input w-full resize-none text-xs"
                  placeholder="Specify legal justification (e.g. Fundamental rights petition under Article 32/226, appeal against lower court decree, jurisdictional conflict)..."
                />
              </div>

              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle size={13} className="text-amber-600 shrink-0" /> Judicial Notice:
                </p>
                <p className="text-[10px] leading-relaxed">
                  Cases are not automatically transferred upon selection. Court administration evaluates jurisdictional eligibility, appeal procedures, and case characteristics before authorizing court transfers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourtTransferModal(false);
                    setTransferringCase(null);
                  }}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="btn-primary bg-purple-600 hover:bg-purple-700 text-xs py-2 px-5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Building size={14} />
                  {isSubmittingTransfer ? 'Submitting Application...' : 'Submit Elevation Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 11. SUBMIT LEGAL AID MULTI-STEP WIZARD MODAL ── */}
      {showApplyModal && (
        <RegistrationWizard 
          onClose={() => setShowApplyModal(false)} 
          onSuccess={() => {
            setShowApplyModal(false);
            fetchDashboardData();
          }} 
        />
      )}

      {/* ── PAYMENT MODAL (WITH MOTION ANIMATIONS) ── */}
      {payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
              <button 
                onClick={() => setPayingFee(null)}
                className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
                <Shield size={12} /> Secure Escrow Checkout
              </div>
              <h3 className="text-xl font-black">{payingFee.caseTitle}</h3>
              <p className="text-xs text-slate-300 mt-1">Lawyer: {payingFee.lawyerName} • Case ID: {payingFee.caseId}</p>
            </div>

            {/* STEP 1: PAYMENT METHOD SELECT & DETAILS */}
            {paymentStep === 'method' && (
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Amount to Pay</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">₹{payingFee.amountDue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold">Due Date</p>
                    <p className="text-xs font-bold text-amber-500">{payingFee.dueDate}</p>
                  </div>
                </div>

                {/* Payment Method Tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'upi', label: 'UPI / Wallet', icon: Smartphone },
                      { id: 'netbanking', label: 'Net Banking', icon: BookOpen },
                    ].map(pm => {
                      const IconComp = pm.icon;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                            paymentMethod === pm.id
                              ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <IconComp size={18} />
                          {pm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields depending on method */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        value={cardForm.number}
                        onChange={e => setCardForm({...cardForm, number: e.target.value})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          value={cardForm.expiry}
                          onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">CVC / CVV</label>
                        <input 
                          type="password" 
                          value={cardForm.cvc}
                          onChange={e => setCardForm({...cardForm, cvc: e.target.value})}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Enter UPI Virtual Address</label>
                    <input 
                      type="text" 
                      value={cardForm.upiId}
                      onChange={e => setCardForm({...cardForm, upiId: e.target.value})}
                      placeholder="username@upi"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono"
                    />
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold mb-2">Select Escrow Partner Bank:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Judicial Gateway', 'State Bank Escrow', 'Commercial Bank Aid', 'National Treasury Gateway'].map((b, i) => (
                        <div key={b} className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${i === 0 ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-800'}`}>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full btn-primary py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition"
                  >
                    <ShieldCheck size={18} /> Confirm & Deposit ₹{payingFee.amountDue} in Escrow
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING MOTION ANIMATION */}
            {paymentStep === 'processing' && (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent"
                  />
                  <motion.div 
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center text-blue-500"
                  >
                    <Lock size={24} />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Processing Judicial Escrow Payment</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Connecting to encrypted payment gateway and verifying advocate account...
                  </p>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.3, ease: "easeInOut" }}
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CELEBRATION ANIMATION */}
            {paymentStep === 'success' && (
              <div className="p-8 text-center space-y-6">
                {/* Animated Spring Checkmark */}
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500/30"
                >
                  <CheckCircle2 size={44} />
                </motion.div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Payment Escrow Secured
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h4>
                  <p className="text-xs text-slate-400">
                    Your payment for ₹{payingFee.amountDue} has been transferred to judicial escrow.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction Ref:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {fees.find(f => f.id === payingFee.id)?.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Counsel:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{payingFee.lawyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Case Title:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{payingFee.caseTitle}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      const updatedFee = fees.find(f => f.id === payingFee.id);
                      setSelectedReceiptFee(updatedFee);
                      setPayingFee(null);
                    }}
                    className="flex-1 btn-secondary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Receipt size={14} /> Download Receipt
                  </button>
                  <button 
                    onClick={() => setPayingFee(null)}
                    className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RECEIPT MODAL ── */}
      {selectedReceiptFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 relative space-y-5">
            <button 
              onClick={() => setSelectedReceiptFee(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Receipt</h3>
                <p className="text-xs text-slate-400 font-mono">Ref: {selectedReceiptFee.transactionId}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Case ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptFee.caseId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Lawyer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptFee.lawyerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-500">₹{selectedReceiptFee.totalAmount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-400">Paid On:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptFee.paidAt}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Method:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptFee.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  alert('Official PDF Fee Receipt downloaded to device.');
                  setSelectedReceiptFee(null);
                }}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicantDashboard;
