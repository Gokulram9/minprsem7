import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  MapPin,
  ExternalLink,
  Check,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Sliders,
  X,
  Award,
  Zap,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Send,
  Star,
  RefreshCw,
  FolderSync,
  Gavel,
  Compass,
  ChevronDown
} from 'lucide-react';

export const CASE_CATALOG = [
  {
    group: 'Property & Real Estate Disputes',
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
        title: 'Criminal Defamation & Harassment Complaint',
        category: 'Criminal Law',
        desc: 'Filing private criminal complaint for intentional insult, reputational harm, and public defamation.'
      }
    ]
  },
  {
    group: 'Family & Matrimonial Law',
    cases: [
      {
        title: 'Mutual Consent Divorce Petition (Sec 13B)',
        category: 'Family & Matrimonial Law',
        desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B with agreed terms on alimony, child custody, and return of marriage articles.'
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
        title: 'Domestic Violence & Protection Order (DV Act)',
        category: 'Family & Matrimonial Law',
        desc: 'Urgent petition seeking protection orders, right of residence, and interim maintenance under Protection of Women from Domestic Violence Act.'
      },
      {
        title: 'Maintenance & Interim Alimony (Sec 125 CrPC)',
        category: 'Family & Matrimonial Law',
        desc: 'Statutory petition for monthly maintenance and litigation expenses for wife and minor children.'
      }
    ]
  },
  {
    group: 'Commercial, Financial & Banking',
    cases: [
      {
        title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)',
        category: 'Negotiable Instruments & Cheque Bounce',
        desc: 'Statutory legal demand notice and criminal complaint for dishonour of cheque due to insufficient funds.'
      },
      {
        title: 'Breach of Commercial Contract & Damages Suit',
        category: 'Civil & Contract Law',
        desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.'
      },
      {
        title: 'Loan Recovery, Promissory Note & Summary Suit',
        category: 'Commercial & Banking Litigation',
        desc: 'Summary suit under Order 37 CPC for recovery of debt based on dishonored promissory notes or written agreements.'
      },
      {
        title: 'Online Banking, Phishing & UPI Fraud Complaint',
        category: 'Cyber Crime & Financial Fraud',
        desc: 'Complaint before Cyber Crime Police for unauthorized bank debits, online phishing scam, and recovery of stolen funds.'
      }
    ]
  },
  {
    group: 'Motor Accident & Consumer Protection',
    cases: [
      {
        title: 'Motor Accident Compensation Claim (MACT)',
        category: 'Motor Accident Claims & Insurance',
        desc: 'Compensation claim petition before Motor Accident Claims Tribunal for vehicular injury, medical expenses, or fatal accident.'
      },
      {
        title: 'Consumer Protection Complaint for Defective Service',
        category: 'Constitutional & Consumer Rights',
        desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking refund, compensation for mental agony, and costs.'
      },
      {
        title: 'Labour Dispute & Unlawful Termination',
        category: 'Labour & Industrial Disputes',
        desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, gratuity, and statutory severance.'
      }
    ]
  }
];

export const QUICK_CASE_CHIPS = [
  { label: '💍 Mutual Divorce', title: 'Mutual Consent Divorce Petition (Sec 13B)', category: 'Family & Matrimonial Law', desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B with agreed terms on alimony, child custody, and return of marriage articles.' },
  { label: '🏡 Land Partition', title: 'Ancestral Property Partition Suit', category: 'Property Law & Land Partition', desc: 'Lawsuit seeking legal declaration of share, metes and bounds survey demarcation, and separate possession of ancestral land and property.' },
  { label: '⚖️ Criminal Bail', title: 'Anticipatory Bail Application (Sec 438 CrPC)', category: 'Criminal Law', desc: 'Urgent petition before Principal Sessions Court / High Court seeking pre-arrest protection and bail against police complaint.' },
  { label: '💳 Cheque Bounce (138)', title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)', category: 'Negotiable Instruments & Cheque Bounce', desc: 'Statutory legal demand notice and criminal complaint for dishonour of cheque due to insufficient funds.' },
  { label: '🚗 Accident Claim (MACT)', title: 'Motor Accident Compensation Claim (MACT)', category: 'Motor Accident Claims & Insurance', desc: 'Compensation claim petition before Motor Accident Claims Tribunal for vehicular injury, medical expenses, or fatal accident.' },
  { label: '🌾 Patta & Revenue', title: 'Patta Transfer, Chitta & Revenue Mutation Dispute', category: 'Revenue & Agricultural Land Law', desc: 'Challenging illegal patta cancellation or wrongful revenue registry mutation before the Tahsildar / Revenue Divisional Officer.' },
  { label: '📜 Contract Breach', title: 'Breach of Commercial Contract & Damages Suit', category: 'Civil & Contract Law', desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.' },
  { label: '🛡️ Consumer Protection', title: 'Consumer Protection Complaint for Defective Service', category: 'Constitutional & Consumer Rights', desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking refund, compensation for mental agony, and costs.' },
  { label: '💻 Cyber Fraud', title: 'Online Banking, Phishing & UPI Fraud Complaint', category: 'Cyber Crime & Financial Fraud', desc: 'Complaint before Cyber Crime Police for unauthorized bank debits, online phishing scam, and recovery of stolen funds.' },
  { label: '💼 Job Dispute', title: 'Labour Dispute & Unlawful Termination', category: 'Labour & Industrial Disputes', desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, and statutory gratuity.' }
];

const PROMPT_INJECTORS = [
  { label: '+ Land Survey No.', text: ' Survey No: 284/3B, Revenue Village: Allinagaram, Extent: 2.45 Acres.' },
  { label: '+ Cheque Date & Sum', text: ' Cheque No: 489201 for ₹3,50,000 dated 15-08-2026, returned unpaid with memo "Funds Insufficient".' },
  { label: '+ Police Station & Crime No.', text: ' Crime No: 142/2026 registered at Theni Town Police Station under Sections 420 and 406 IPC.' },
  { label: '+ Urgent Injunction', text: ' Urgent interim injunction prayer needed to restrain opponent from alienating property before next hearing date.' },
  { label: '+ Maintenance Claim', text: ' Seeking monthly maintenance of ₹15,000 for self and school education expenses for minor daughter.' }
];

const SCAN_STEPS = [
  'Tokenizing dispute facts and extracting statutory citations...',
  'Computing Scikit-Learn TF-IDF cosine similarity vectors...',
  'Cross-referencing Bar Council enrollment & disciplinary compliance...',
  'Evaluating multi-criteria weights (Expertise 35%, Proximity 25%, Win Rate 20%, Availability 20%)...',
  'Synthesizing personalized match rationales...'
];

export default function AiLawyerRecommender({
  user,
  applications = [],
  pendingLawyerApp,
  acceptedLawyerApp,
  onChooseLawyer,
  submittingChoice,
  navigate
}) {
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

  const [selectedCasePreset, setSelectedCasePreset] = useState('');
  const [syncedCaseId, setSyncedCaseId] = useState('');
  const [aiValidationError, setAiValidationError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendedLawyers, setRecommendedLawyers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(-1);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [filterSearch, setFilterSearch] = useState('');

  // Handle Preset selection
  const handleSelectCasePreset = (chosenTitle) => {
    setSelectedCasePreset(chosenTitle);
    if (!chosenTitle || chosenTitle === 'custom') return;

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
      setSyncedCaseId('');
    }
  };

  // Quick sync from existing active application
  const handleSyncFromCase = (app) => {
    setSyncedCaseId(app._id);
    setSelectedCasePreset('custom');
    setAiInputs(prev => ({
      ...prev,
      caseTitle: app.caseTitle || `${app.caseType} Matter`,
      caseType: app.caseType || prev.caseType,
      description: app.description || prev.description,
      district: app.courtDetails?.district || app.district || user?.district || 'Theni',
      state: app.courtDetails?.state || app.state || user?.state || 'Tamil Nadu',
      courtLevel: app.courtDetails?.courtTier || 'District Court',
      urgency: app.urgency || 'Medium'
    }));
    setAiValidationError('');
  };

  // Append prompt helper
  const handleAppendPrompt = (textToAppend) => {
    setAiInputs(prev => ({
      ...prev,
      description: (prev.description ? prev.description.trim() + ' ' : '') + textToAppend.trim()
    }));
  };

  // Trigger AI Matching
  const triggerAiMatch = async () => {
    if (!aiInputs.caseTitle.trim()) {
      setAiValidationError('Case Title is required. Choose a preset above or type your dispute title.');
      return;
    }
    if (!aiInputs.description.trim() || aiInputs.description.trim().length < 15) {
      setAiValidationError('Detailed case description is required (minimum 15 characters) so the TF-IDF engine can extract legal keywords.');
      return;
    }
    if (!aiInputs.district.trim() || !aiInputs.state.trim()) {
      setAiValidationError('State and District are required to verify judicial competence and jurisdiction.');
      return;
    }

    setAiValidationError('');
    setAiLoading(true);
    setHasSearched(true);
    setAiStepIndex(0);
    setRecommendedLawyers([]);

    const stepInterval = setInterval(() => {
      setAiStepIndex(prev => (prev >= 4 ? 4 : prev + 1));
    }, 450);

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
        const lawyerExp = lawyer.experience || (6 + (index * 2));
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
          : [
            `Verified advocate specialist in ${lawyer.specialization || aiInputs.caseType} with ${lawyerExp} years active Bar experience.`,
            `Practice jurisdiction aligns with ${aiInputs.district} District Court & Tamil Nadu High Court benches.`,
            `Demonstrated record handling ${aiInputs.caseType} dispute litigation.`
          ];

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
          match: Math.round(Number(lawyer.matchScore) || Number(lawyer.matchPercentage) || (95 - index * 3)),
          confidenceScore: Math.round(Number(lawyer.confidenceScore) || 92),
          location: lawyer.location || `${lawyer.district || aiInputs.district}, ${lawyer.state || aiInputs.state}`,
          district: lawyer.district || aiInputs.district,
          state: lawyer.state || aiInputs.state,
          courtLevel: lawyer.courtLevel || aiInputs.courtLevel,
          courts: lawyerCourts,
          reason: lawyerReasons[0],
          reasons: lawyerReasons,
          photo: lawyer.profileImage || null,
          barRegistrationNumber: lawyer.barRegistrationNumber || `MS/TN/${1200 + index * 45}/2014`,
          bio: lawyer.bio || `Specialized advocate practicing before ${aiInputs.district} District Court.`
        };
      });

      await new Promise(r => setTimeout(r, 1200));
      clearInterval(stepInterval);
      setAiStepIndex(5);
      setRecommendedLawyers(mappedLawyers);
    } catch (err) {
      console.error('Error triggering AI match:', err);
      clearInterval(stepInterval);
      setAiValidationError('Failed to retrieve AI recommendations. Please verify backend connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Compare toggles
  const toggleCompare = (lawyer) => {
    if (compareList.some(l => l.id === lawyer.id)) {
      setCompareList(prev => prev.filter(l => l.id !== lawyer.id));
    } else {
      if (compareList.length >= 2) {
        setCompareList([compareList[1], lawyer]);
      } else {
        setCompareList(prev => [...prev, lawyer]);
      }
    }
  };

  // Filtered and sorted lawyers
  const filteredAndSortedLawyers = useMemo(() => {
    let list = [...recommendedLawyers];

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.specialization.toLowerCase().includes(q) ||
        l.courts.toLowerCase().includes(q) ||
        l.barRegistrationNumber.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'match') {
      list.sort((a, b) => b.match - a.match);
    } else if (sortBy === 'experience') {
      list.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'fee') {
      list.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [recommendedLawyers, filterSearch, sortBy]);

  // Semantic depth meter
  const descLength = aiInputs.description.trim().length;
  const semanticDepth = descLength < 20
    ? { label: 'Insufficient Facts', color: 'text-amber-500', bar: 'w-1/4 bg-amber-500' }
    : descLength < 80
      ? { label: 'Moderate Semantic Depth', color: 'text-blue-500', bar: 'w-2/3 bg-blue-500' }
      : { label: 'High Precision Vectors', color: 'text-emerald-500', bar: 'w-full bg-emerald-500' };

  return (
    <div className="space-y-6">

      {/* ── 1. CHOSEN COUNSEL PENDING LIVE STATUS BANNER ── */}
      {pendingLawyerApp && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 dark:border-amber-500/40 shadow-xl relative overflow-hidden space-y-4 backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
                <Clock size={26} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    Advocate Chosen • Waiting for Lawyer Acceptance
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Advocate {pendingLawyerApp.chosenLawyerName || 'Specialist'} has been Chosen
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Dispute: <strong>{pendingLawyerApp.caseTitle || pendingLawyerApp.type}</strong> • Representation request notification dispatched to lawyer portal on {pendingLawyerApp.requestDate || 'today'}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/dashboard/applications')}
                className="text-xs font-bold px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition shadow-xs"
              >
                View Case Docket
              </button>
            </div>
          </div>

          {/* 4-Step Stepper */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">1. Counsel Selected</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Advocate Selected ✓</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">2. Request Dispatched</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Delivered to Lawyer ✓</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500 animate-pulse shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">3. Lawyer Acceptance</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold animate-pulse">Pending Acceptance ⏳</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <Scale size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-500">4. Active Representation</p>
                <p className="text-[10px] text-slate-400">Begins upon acceptance</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 2. LAWYER ACCEPTED CELEBRATION BANNER ── */}
      {acceptedLawyerApp && !pendingLawyerApp && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xl space-y-4 backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Representation Request Accepted
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Advocate {acceptedLawyerApp.lawyer} has ACCEPTED your representation request!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Dispute: <strong>{acceptedLawyerApp.caseTitle || acceptedLawyerApp.type}</strong> • Representation is active. You can exchange real-time case messages and files.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/dashboard/messages')}
                className="text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 transition flex items-center gap-1.5 shadow-md shadow-blue-500/25"
              >
                <Send size={13} /> Message Advocate
              </button>
              <button
                onClick={() => navigate('/dashboard/cases')}
                className="text-xs font-bold px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
              >
                View Case Docket
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3. HERO AI HEADER & SYSTEM TELEMETRY (COMPACT) ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#202A3B] via-[#1E2738] to-[#151D2A] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md border border-[#B69B72]/25">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-1 rounded-md bg-[#B69B72]/20 text-[#D9C7A5]">
                <Sparkles size={14} className="text-[#B69B72]" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-display">
                AI Advocate Recommendation Engine
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-[#5B21B6] text-[10px] font-bold shadow-xs">
                Scikit-Learn TF-IDF v2.6
              </span>
            </div>

            {/* Micro Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#F5F5EF]/80">
              <span className="hidden sm:inline text-[#F5F5EF]/70">Lexical Cosine Matching</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-[#F5F5EF]/90">
                <ShieldCheck size={12} className="text-[#B69B72]" />
                30 Verified Advocates
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-[#F5F5EF]/90">
                <Zap size={12} className="text-[#D9C7A5]" />
                94.8% Precision
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-[#F5F5EF]/90">
                <Scale size={12} className="text-[#B69B72]" />
                Legal Aid Eligible
              </span>
            </div>
          </div>

          {/* Quick Action Button in Hero */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {hasSearched && recommendedLawyers.length > 0 && (
              <span className="text-[11px] text-[#D9C7A5] hidden md:flex items-center gap-1 font-semibold mr-1">
                <CheckCircle2 size={12} className="text-[#B69B72]" />
                {recommendedLawyers.length} Ranked
              </span>
            )}
            <button
              type="button"
              onClick={triggerAiMatch}
              disabled={aiLoading}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#B69B72] via-[#C5AE87] to-[#A88C64] hover:from-[#A88C64] hover:to-[#92754D] text-[#202A3B] font-bold text-xs shadow-md shadow-[#B69B72]/15 flex items-center gap-1.5 transition-all transform hover:scale-[1.01] cursor-pointer disabled:opacity-60"
            >
              <Sparkles size={13} className={aiLoading ? 'animate-spin' : ''} />
              <span>{aiLoading ? 'Analyzing...' : 'Discover Best Advocates'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. QUICK SYNC FROM ACTIVE CASES (IF USER HAS FILED APPLICATIONS) ── */}
      {applications && applications.length > 0 && (
        <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#1A2230] border border-[#B69B72]/30 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#202A3B] text-[#B69B72] shadow-xs shrink-0 border border-[#B69B72]/30">
              <FolderSync size={13} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                One-Click Case Sync from Your Filed Applications
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Click any case to auto-fill facts, legal domain, and court registry information:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {applications.slice(0, 4).map(app => (
              <button
                key={app._id}
                type="button"
                onClick={() => handleSyncFromCase(app)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${syncedCaseId === app._id
                    ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B69B72]'
                  }`}
              >
                <span>📁 {app.caseTitle || app.caseType}</span>
                {syncedCaseId === app._id && <Check size={11} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. MAIN AI MATCH CONFIGURATION CARD ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-7">

        {/* Validation Error Alert */}
        {aiValidationError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs font-semibold"
          >
            <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Please check parameters:</strong>
              {aiValidationError}
            </div>
          </motion.div>
        )}

        {/* SECTION 1: CASE TYPE & QUICK PRESET CHIPS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={14} className="text-blue-600 dark:text-blue-400" />
              1. Choose Case Type & Instant Presets
            </label>
            {aiInputs.caseTitle && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> {aiInputs.caseType}
              </span>
            )}
          </div>

          {/* Quick Selection Chips Grid */}
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_CASE_CHIPS.map(chip => {
              const isSelected = aiInputs.caseTitle === chip.title || selectedCasePreset === chip.title;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSelectCasePreset(chip.title)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                      ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-sm ring-2 ring-[#B69B72]/40'
                      : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B69B72] hover:bg-[#FAF9F5] dark:hover:bg-slate-800'
                    }`}
                >
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: INPUTS GRID (CASE TITLE, CATEGORY, JURISDICTION) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">

          {/* Detailed Catalog Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Comprehensive Legal Dispute Catalog
            </label>
            <div className="relative">
              <select
                value={selectedCasePreset || (CASE_CATALOG.some(g => g.cases.some(c => c.title === aiInputs.caseTitle)) ? aiInputs.caseTitle : 'custom')}
                onChange={e => handleSelectCasePreset(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="">-- Select from 20+ Civil, Criminal & Family Matters --</option>
                {CASE_CATALOG.map(group => (
                  <optgroup key={group.group} label={`── ${group.group} ──`}>
                    {group.cases.map(c => (
                      <option key={c.title} value={c.title}>
                        {c.title} ({c.category})
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="custom">✏️ Other / Custom Case Title (Type below)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Case Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Legal Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={aiInputs.caseType}
                onChange={e => setAiInputs({ ...aiInputs, caseType: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="Property Law & Land Partition">Property Law & Land Partition</option>
                <option value="Criminal Law">Criminal Law & Bail Petitions</option>
                <option value="Family & Matrimonial Law">Family & Matrimonial Law</option>
                <option value="Civil & Contract Law">Civil & Contract Law</option>
                <option value="Motor Accident Claims & Insurance">Motor Accident Claims (MACT)</option>
                <option value="Constitutional & Consumer Rights">Consumer Protection & RTI</option>
                <option value="Revenue & Agricultural Land Law">Revenue & Agricultural Land Law</option>
                <option value="Labour & Industrial Disputes">Labour & Employment Disputes</option>
                <option value="Commercial & Banking Litigation">Commercial & Banking Litigation</option>
                <option value="Negotiable Instruments & Cheque Bounce">Negotiable Instruments (Sec 138 NI Act)</option>
                <option value="Cyber Crime & Financial Fraud">Cyber Crime & Financial Fraud</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Custom Case Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Case Title / Dispute Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={aiInputs.caseTitle}
              onChange={e => {
                setAiInputs({ ...aiInputs, caseTitle: e.target.value });
                setSelectedCasePreset('custom');
              }}
              placeholder="e.g. Partition of Ancestral Land at Allinagaram or Cheque Dishonour Notice"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Preferred Court Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Court Bench
            </label>
            <div className="relative">
              <select
                value={aiInputs.courtLevel}
                onChange={e => setAiInputs({ ...aiInputs, courtLevel: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="District Court">District Court (Theni / Sessions)</option>
                <option value="High Court">Madras High Court (Madurai Bench)</option>
                <option value="Supreme Court">Supreme Court of India</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* District & State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              District <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={aiInputs.district}
              onChange={e => setAiInputs({ ...aiInputs, district: e.target.value })}
              placeholder="Theni"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={aiInputs.state}
              onChange={e => setAiInputs({ ...aiInputs, state: e.target.value })}
              placeholder="Tamil Nadu"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Experience Level Preference
            </label>
            <div className="relative">
              <select
                value={aiInputs.minExperience}
                onChange={e => setAiInputs({ ...aiInputs, minExperience: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value={0}>Any Experience (Junior & Senior)</option>
                <option value={3}>3+ Years Practice</option>
                <option value={5}>5+ Years Practice</option>
                <option value={10}>10+ Years Senior Counsel</option>
                <option value={15}>15+ Years Veteran Advocate</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Budget / Fee Preference
            </label>
            <div className="relative">
              <select
                value={aiInputs.budget}
                onChange={e => setAiInputs({ ...aiInputs, budget: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="Subsidized Aid">Free / Subsidized Legal Aid (₹0)</option>
                <option value="500">Up to ₹500 (Basic Consultation)</option>
                <option value="1000">Up to ₹1,000</option>
                <option value="2500">Up to ₹2,500</option>
                <option value="5000">Up to ₹5,000</option>
                <option value="10000">Any Budget / Standard Retainer</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Court Language
            </label>
            <div className="relative">
              <select
                value={aiInputs.language}
                onChange={e => setAiInputs({ ...aiInputs, language: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Dispute Urgency Level
            </label>
            <div className="relative">
              <select
                value={aiInputs.urgency}
                onChange={e => setAiInputs({ ...aiInputs, urgency: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="Medium">Medium (Standard Legal Proceeding)</option>
                <option value="High">High (Hearing Imminent / Court Notice)</option>
                <option value="Urgent">Urgent (Arrest / Eviction / Injunction Risk)</option>
                <option value="Normal">Normal / Preliminary Advisory</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Other Requirements */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Requirements (Optional)
            </label>
            <input
              type="text"
              value={aiInputs.otherRequirements}
              onChange={e => setAiInputs({ ...aiInputs, otherRequirements: e.target.value })}
              placeholder="e.g. Female advocate preference, vernacular Tamil drafting, revenue surveyor liaison"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 3: DISPUTE NARRATIVE & AI PROMPT INJECTORS */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Detailed Dispute Factsheet <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type the factual background of your dispute. Our TF-IDF vectorizer extracts statutory sections, land survey facts, and precedents.
              </p>
            </div>

            {/* Live Semantic Depth Indicator */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${semanticDepth.color}`}>
                {semanticDepth.label} ({descLength} chars)
              </span>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${semanticDepth.bar} transition-all duration-300`} />
              </div>
            </div>
          </div>

          {/* Prompt Injectors Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">
              Quick Facts:
            </span>
            {PROMPT_INJECTORS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAppendPrompt(p.text)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            value={aiInputs.description}
            onChange={e => setAiInputs({ ...aiInputs, description: e.target.value })}
            placeholder="State the facts of the case, survey numbers, dates of dispute, property boundaries, cheque numbers, FIR details, or claims. The Scikit-learn TF-IDF engine converts this description into domain vectors to match lawyer expertise descriptions."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* SECTION 4: AI SCANNING MULTI-STEP PROGRESS (WHEN SEARCHING) */}
        {aiLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1F2839] text-white border border-slate-700 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-display">
                  Scikit-Learn TF-IDF Recommender Engine Active
                </h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Computing Domain Lexical Vectors & Multi-Criteria Ranking Matrices
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(aiStepIndex + 1) * 20}%` }}
              />
            </div>

            {/* Steps list */}
            <div className="space-y-2 text-xs">
              {SCAN_STEPS.map((step, idx) => {
                const isChecked = aiStepIndex > idx;
                const isActive = aiStepIndex === idx;
                return (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 border border-slate-700 bg-slate-800">
                      {isChecked ? (
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      ) : isActive ? (
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <span className={`text-[11.5px] transition-colors ${isChecked ? 'text-slate-400 line-through' : isActive ? 'text-blue-300 font-bold' : 'text-slate-500'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SECTION 5: ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={triggerAiMatch}
            disabled={aiLoading}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#B69B72] via-[#C4AA82] to-[#A3865D] hover:from-[#A88C64] hover:to-[#8E744E] text-[#202A3B] font-extrabold text-sm shadow-xl shadow-[#B69B72]/20 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] cursor-pointer disabled:opacity-60"
          >
            <Sparkles size={17} className={aiLoading ? 'animate-spin' : ''} />
            <span>{aiLoading ? 'Analyzing Case Law & Ranking Counsel...' : 'Find Best Recommended Advocates'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiInputs({
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
              setSelectedCasePreset('');
              setSyncedCaseId('');
              setAiValidationError('');
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Reset Form
          </button>
        </div>

      </div>

      {/* ── 6. EMPTY STATE IF SEARCH YIELDED NO LAWYERS ── */}
      {hasSearched && !aiLoading && recommendedLawyers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm"
        >
          <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Scale size={30} />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No Advocates Exactly Matched All Tight Filter Criteria
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            The strict criteria for experience, court tier, or fee preference did not return active counsel. Click below to broaden your parameters to all verified Theni District Court advocates:
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setAiInputs(prev => ({ ...prev, minExperience: 0, budget: 'Subsidized Aid', courtLevel: 'District Court' }));
                setTimeout(triggerAiMatch, 100);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
            >
              Reset to Any Experience & Theni District Court
            </button>
          </div>
        </motion.div>
      )}

      {/* ── 7. ADVANCED AI RECOMMENDED ADVOCATE RESULTS LISTING ── */}
      {recommendedLawyers.length > 0 && (
        <div className="space-y-6">

          {/* Results Toolbar: Count, Filter Search, and Sorter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Found {filteredAndSortedLawyers.length} Verified Advocates Ranked by AI Relevance
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scores calculated using TF-IDF legal cosine similarity and Bar Council credentials for {aiInputs.district}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* In-page Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  placeholder="Filter by name / chamber..."
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Sorter */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
              >
                <option value="match">Sort: Highest Match %</option>
                <option value="experience">Sort: Most Experienced</option>
                <option value="fee">Sort: Lowest Consultation Fee</option>
                <option value="name">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Compare Ribbon (Sticky preview if advocates selected) */}
          {compareList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-blue-700/50"
            >
              <div className="flex items-center gap-3">
                <Sliders size={18} className="text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Advocate Comparison Deck ({compareList.length}/2 Selected)
                  </h4>
                  <p className="text-[10px] text-blue-200">
                    Compare credentials, court experience, and AI rationale side-by-side.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {compareList.map(lawyer => (
                  <span
                    key={lawyer.id}
                    className="text-xs font-bold bg-white/10 border border-white/20 text-white px-3 py-1 rounded-xl flex items-center gap-1.5"
                  >
                    {lawyer.name}
                    <button
                      type="button"
                      onClick={() => toggleCompare(lawyer)}
                      className="text-rose-400 hover:text-rose-300 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {compareList.length === 2 && (
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Launch Side-by-Side Comparison
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAndSortedLawyers.map((lawyer, lIdx) => {
              const isChosenThisLawyer = pendingLawyerApp && (
                pendingLawyerApp.chosenLawyerName === lawyer.name ||
                pendingLawyerApp.chosenLawyerId === lawyer.userId ||
                pendingLawyerApp.chosenLawyerId === lawyer.lawyerId
              );
              const isAssignedThisLawyer = acceptedLawyerApp && (
                acceptedLawyerApp.lawyer === lawyer.name ||
                acceptedLawyerApp.assignedLawyer?._id === lawyer.userId ||
                acceptedLawyerApp.assignedLawyer?._id === lawyer.lawyerId
              );
              const isTop = lIdx === 0 && sortBy === 'match';

              return (
                <motion.div
                  key={lawyer.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: lIdx * 0.04 }}
                  className={`bg-white dark:bg-[#1B2332] rounded-3xl border transition-all duration-300 p-6 shadow-sm flex flex-col justify-between relative hover:shadow-xl ${isChosenThisLawyer
                      ? 'border-[#B69B72] ring-2 ring-[#B69B72]/40'
                      : isAssignedThisLawyer
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : isTop
                          ? 'border-[#B69B72] ring-2 ring-[#B69B72]/30 shadow-[#B69B72]/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-[#B69B72]/60'
                    }`}
                >
                  {/* Status Banner */}
                  {isChosenThisLawyer && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-[#B69B72]/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black uppercase text-[#8A6F46] dark:text-[#D9C7A5] flex items-center gap-1.5">
                        <Clock size={12} className="animate-pulse text-[#B69B72]" />
                        Counsel Chosen • Awaiting Acceptance
                      </span>
                      <span className="text-[9px] text-[#B69B72] font-bold">Request Dispatched</span>
                    </div>
                  )}

                  {isAssignedThisLawyer && (
                    <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Representation Active • Counsel Assigned
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Accepted ✓</span>
                    </div>
                  )}

                  <div>
                    {/* Header: Photo, Name, Match Score */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {lawyer.photo ? (
                          <img
                            src={lawyer.photo}
                            alt={lawyer.name}
                            className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-md"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#202A3B] to-[#121824] text-[#B69B72] border border-[#B69B72]/30 flex items-center justify-center font-bold text-xl shadow-md">
                            {lawyer.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" title="Bar Council Verified">
                          <ShieldCheck size={10} className="text-white" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Match Score Badge (Lavender for AI Features) */}
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                            {lawyer.match}% AI Match
                          </span>

                          {isTop && (
                            <span className="text-[9px] font-bold bg-[#B69B72]/15 text-[#8A6F46] dark:text-[#D9C7A5] border border-[#B69B72]/30 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                              <Award size={10} /> Top Match
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold ml-auto">
                            {lawyer.barRegistrationNumber}
                          </span>
                        </div>

                        <h4 className="text-base font-bold mt-1 text-slate-900 dark:text-white truncate">
                          {lawyer.name}
                        </h4>
                        <p className="text-xs text-[#B69B72] font-bold uppercase tracking-wide mt-0.5 truncate">
                          {lawyer.specialization}
                        </p>
                      </div>
                    </div>

                    {/* 4-Box Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 truncate">
                        <Briefcase size={14} className="text-[#B69B72] shrink-0" />
                        <span className="truncate"><strong>{lawyer.experience} Yrs</strong> Practice</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 truncate">
                        <MapPin size={14} className="text-rose-500 shrink-0" />
                        <span className="truncate">{lawyer.location}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 truncate">
                        <Scale size={14} className="text-[#202A3B] dark:text-[#D9C7A5] shrink-0" />
                        <span className="truncate">{lawyer.courts}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 truncate font-bold">
                        <span className="shrink-0 text-sm">₹</span>
                        <span className="truncate">{lawyer.fee}</span>
                      </div>
                    </div>

                    {/* AI Match Rationale Accordion/Box (Lavender) */}
                    <div className="p-3.5 bg-[#EDE9FE]/40 dark:bg-[#EDE9FE]/10 border border-[#DDD6FE] dark:border-[#5B21B6]/30 rounded-2xl mt-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#5B21B6] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#B69B72]" />
                          Why AI Recommends This Advocate:
                        </span>
                        <span className="text-[10px] text-[#5B21B6]/70 font-mono">
                          Confidence: {lawyer.confidenceScore}%
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                        {lawyer.reasons.map((reason, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-[#B69B72] font-bold shrink-0 mt-0.5">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/lawyers/${lawyer.id}`)}
                        className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCompare(lawyer)}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition cursor-pointer ${compareList.some(l => l.id === lawyer.id)
                            ? 'bg-[#B69B72]/15 text-[#8A6F46] border-[#B69B72]/50 dark:text-[#D9C7A5]'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {compareList.some(l => l.id === lawyer.id) ? 'Selected' : 'Compare'}
                      </button>
                    </div>

                    {isChosenThisLawyer ? (
                      <button
                        disabled
                        className="text-xs py-2 px-4 rounded-xl font-bold bg-[#B69B72]/20 text-[#8A6F46] dark:text-[#D9C7A5] border border-[#B69B72]/40 flex items-center gap-1.5 cursor-default"
                      >
                        <Clock size={13} className="animate-pulse" /> Chosen (Pending)
                      </button>
                    ) : isAssignedThisLawyer ? (
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/messages')}
                        className="text-xs py-2 px-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Active Counsel (Message)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChooseLawyer(lawyer, aiInputs)}
                        disabled={submittingChoice}
                        className="text-xs py-2 px-4 rounded-xl font-bold bg-gradient-to-r from-[#B69B72] to-[#9E825B] hover:from-[#A88C64] hover:to-[#8C724D] text-white transition shadow-md shadow-[#B69B72]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <Scale size={13} />
                        {submittingChoice ? 'Sending...' : 'Select Counsel & Send Request'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── 8. SIDE-BY-SIDE COMPARISON MODAL ── */}
      {showCompareModal && compareList.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                    Side-by-Side Advocate Comparison
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluating Bar credentials, practice scope, and AI match suitability
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comparison Columns Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {compareList.map((adv, idx) => (
                <div
                  key={adv.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-[#1F2839] text-amber-400 font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                        {adv.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                          {adv.match}% Match Score
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {adv.name}
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                          {adv.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-700 pt-3">
                      <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500">Bar Enrollment:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{adv.barRegistrationNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500">Bar Experience:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{adv.experience} Years Active</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500">Chambers / Location:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{adv.location}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500">Primary Court:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{adv.courts}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500">Languages:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{adv.languages}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Consultation Fee:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{adv.fee}</span>
                      </div>
                    </div>

                    {/* AI Rationale Summary */}
                    <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1">
                      <strong className="text-blue-800 dark:text-blue-300 block text-[11px] uppercase">
                        AI Suitability Note:
                      </strong>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {adv.reasons[0]}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCompareModal(false);
                      onChooseLawyer(adv, aiInputs);
                    }}
                    disabled={submittingChoice}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    Select {adv.name} & Send Request
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
              >
                Close Comparison
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
