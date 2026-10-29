import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../api/axios';
import {
  Eye, EyeOff, Scale, Crown, User, ArrowRight,
  CheckCircle, Shield, Lock, Mail, AlertCircle, Gavel, Building,
  PhoneCall, Check, Sparkles
} from 'lucide-react';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import archangelRaguelImg from '../assets/archangel-raguel.png';
import InteractiveCanvasBackground from '../components/InteractiveCanvasBackground';

export const ROLES = [
  {
    id: 'User',
    label: 'Applicant',
    icon: User,
    email: 'applicant@test.com',
    desc: 'Citizen Legal Aid & Docket Tracking',
    badge: 'Citizen Access',
  },
  {
    id: 'Lawyer',
    label: 'Advocate',
    icon: Scale,
    email: 'lawyer@test.com',
    desc: 'Counsel Hearings, Dockets & Briefs',
    badge: 'Bar Council',
  },
  {
    id: 'Judge',
    label: 'Judge',
    icon: Gavel,
    email: 'judge@sevenseas.com',
    desc: 'Courtroom Bench, Orders & Cause Lists',
    badge: 'Judicial Officer',
  },
  {
    id: 'CourtStaff',
    label: 'Court Staff',
    icon: Building,
    email: 'staff@test.com',
    desc: 'Registry Filings, Schedules & Notices',
    badge: 'Registry Staff',
  },
  {
    id: 'Admin',
    label: 'Admin',
    icon: Crown,
    email: 'gokulrams.cs23@bitsathy.ac.in',
    desc: 'Chamber & Portal Administration',
    badge: 'Chamber Admin',
  },
];

export const THENI_ADVOCATE_LOGINS = [
  { name: 'Advocate A. Sundaramurthy', email: 'lawyer17@sevenseas.com', court: 'Sub Court, Periyakulam / Theni', spec: 'Property Law & Land Partition' },
  { name: 'Advocate S. Murugan', email: 'lawyer@sevenseas.com', court: 'District Court, Theni', spec: 'Senior Property Counsel' },
  { name: 'Advocate K. Meenakshi Sundaram', email: 'lawyer2@sevenseas.com', court: 'Sessions Court, Theni', spec: 'Criminal Defense Counsel' },
  { name: 'Advocate R. Kavitha', email: 'lawyer3@sevenseas.com', court: 'Family Court, Theni', spec: 'Family & Matrimonial Advocate' },
  { name: 'Advocate P. Senthil Kumar', email: 'lawyer4@sevenseas.com', court: 'Sub Court, Periyakulam', spec: 'Civil & Contract Law' },
  { name: 'Advocate M. Balamurugan', email: 'lawyer5@sevenseas.com', court: 'MACT Tribunal, Theni', spec: 'Motor Accident Claims (MACT)' },
  { name: 'Advocate V. Anitha', email: 'lawyer6@sevenseas.com', court: 'Mahila Court, Theni', spec: 'Human Rights & Consumer' },
  { name: 'Advocate T. Rajendran', email: 'lawyer7@sevenseas.com', court: 'Principal District Court, Theni', spec: 'Revenue & Agricultural Land' },
  { name: 'Advocate S. Priya Dharshini', email: 'lawyer8@sevenseas.com', court: 'DLSA Theni', spec: 'Legal Aid & Women Rights' },
  { name: 'Advocate G. Karuppasamy', email: 'lawyer9@sevenseas.com', court: 'CJM Court, Theni', spec: 'Criminal Trial & Sessions' },
  { name: 'Advocate A. Mohamed Ismail', email: 'lawyer10@sevenseas.com', court: 'District Court, Theni', spec: 'Commercial & Banking' },
  { name: 'Advocate N. Lakshmi Narayanan', email: 'lawyer11@sevenseas.com', court: 'Combined Court, Theni', spec: 'Agricultural & Revenue' },
  { name: 'Advocate D. Jayanthi', email: 'lawyer12@sevenseas.com', court: 'District Court, Theni', spec: 'Appellate & Writs' },
  { name: 'Advocate K. Muthuvel', email: 'lawyer13@sevenseas.com', court: 'Labour Court, Theni', spec: 'Labour & Employment' },
  { name: 'Advocate C. Saravanan', email: 'lawyer14@sevenseas.com', court: 'Sub Court, Theni', spec: 'Property Registration' },
  { name: 'Advocate J. Deepa Rani', email: 'lawyer15@sevenseas.com', court: 'ADR Centre, Theni', spec: 'ADR Mediation & Succession' },
  { name: 'Advocate R. Thirunavukkarasu', email: 'lawyer16@sevenseas.com', court: 'Fast Track Court, Theni', spec: 'Sec 138 NI Act Cheque Bounce' },
  { name: 'Advocate P. Mariselvi', email: 'lawyer18@sevenseas.com', court: 'Family Court, Theni', spec: 'Family & Matrimonial' },
  { name: 'Advocate M. Alagarsamy', email: 'lawyer19@sevenseas.com', court: 'Sessions Court, Theni', spec: 'Criminal Law & Sessions' },
  { name: 'Advocate S. Veerachamy', email: 'lawyer20@sevenseas.com', court: 'Combined Court, Theni', spec: 'Revenue & Water Rights' },
  { name: 'Advocate K. Bhuvaneswari', email: 'lawyer21@sevenseas.com', court: 'Family Mediation, Theni', spec: 'ADR & Family Law' },
  { name: 'Advocate V. Manikandan', email: 'lawyer22@sevenseas.com', court: 'Fast Track JM Court, Theni', spec: 'Sec 138 Cheque Bounce' },
  { name: 'Advocate T. Pandiarajan', email: 'lawyer23@sevenseas.com', court: 'MACT Tribunal, Theni', spec: 'Motor Accident Claims' },
  { name: 'Advocate N. Subbiah', email: 'lawyer24@sevenseas.com', court: 'Principal District Court, Theni', spec: 'Civil & Contract' },
  { name: 'Advocate R. Malathi', email: 'lawyer25@sevenseas.com', court: 'Consumer Commission, Theni', spec: 'Consumer & RTI Redressal' },
  { name: 'Advocate G. Thavasi', email: 'lawyer26@sevenseas.com', court: 'Andipatti / Theni Court', spec: 'Grama Natham & Land Law' },
  { name: 'Advocate J. Francis Xavier', email: 'lawyer27@sevenseas.com', court: 'Bodinayakanur / Theni Court', spec: 'Commercial & Spice Traders' },
  { name: 'Advocate D. Chidambaram', email: 'lawyer28@sevenseas.com', court: 'Judicial Magistrate, Theni', spec: 'Magistrate Criminal Defense' },
  { name: 'Advocate M. Revathi', email: 'lawyer29@sevenseas.com', court: 'Cyber Cell, Theni', spec: 'Cyber Crime & Online Fraud' },
  { name: 'Advocate S. Palanichamy', email: 'lawyer30@sevenseas.com', court: 'Uthamapalayam / Theni Court', spec: 'Estate & Labour Disputes' },
];

/* Consistent, Majestic Gold Scale-of-Justice Illustration */
const ScaleIllustration = () => (
  <svg viewBox="0 0 220 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="100" r="85" stroke="#B69D74" strokeOpacity="0.12" strokeWidth="1" />
    <circle cx="110" cy="100" r="60" stroke="#B69D74" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="4 4" />
    <line x1="110" y1="30" x2="110" y2="160" stroke="#B69D74" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="110" cy="30" r="6" fill="#B69D74" />
    <circle cx="110" cy="30" r="10" fill="#B69D74" fillOpacity="0.25" />
    <circle cx="110" cy="90" r="8" fill="#B69D74" fillOpacity="0.95" />
    <circle cx="110" cy="90" r="14" stroke="#B69D74" strokeOpacity="0.3" strokeWidth="1" />
    <rect x="90" y="158" width="40" height="6" rx="3" fill="#B69D74" fillOpacity="0.75" />
    <line x1="75" y1="164" x2="145" y2="164" stroke="#B69D74" strokeWidth="2" strokeLinecap="round" />
    <line x1="45" y1="78" x2="175" y2="78" stroke="#B69D74" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="52" y1="78" x2="38" y2="125" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="78" x2="66" y2="125" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 33,125 H 71" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 33,125 C 33,140 71,140 71,125" fill="#B69D74" fillOpacity="0.2" stroke="#B69D74" strokeWidth="1.5" />
    <line x1="168" y1="78" x2="154" y2="125" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="168" y1="78" x2="182" y2="125" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 149,125 H 187" stroke="#B69D74" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 149,125 C 149,140 187,140 187,125" fill="#B69D74" fillOpacity="0.2" stroke="#B69D74" strokeWidth="1.5" />
    <circle cx="52" cy="58" r="4" fill="#B69D74" fillOpacity="0.6" />
    <circle cx="168" cy="58" r="4" fill="#B69D74" fillOpacity="0.6" />
    <circle cx="45" cy="78" r="3" fill="#B69D74" />
    <circle cx="175" cy="78" r="3" fill="#B69D74" />
    <circle cx="110" cy="90" r="30" fill="#B69D74" fillOpacity="0.06" />
  </svg>
);

const Login = () => {
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/dashboard';

  const [selectedRole, setSelectedRole] = useState('User');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('applicant@test.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Admin@1234');
  const [specialization, setSpecialization] = useState('Civil Law');
  const [experienceYears, setExperienceYears] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing secure workspace...');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('sevenseas_remember_me') === 'true');

  const currentRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('sevenseas_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Splash Screen progress animation
  useEffect(() => {
    if (!showSplash) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = Math.floor(Math.random() * 12) + 8;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return;
    if (progress < 25) {
      setStatusText('Connecting to Theni Combined Court Complex Network...');
    } else if (progress < 50) {
      setStatusText('Verifying judicial credentials & TLS certificate...');
    } else if (progress < 75) {
      setStatusText('Loading role permissions & active case dockets...');
    } else if (progress < 95) {
      setStatusText('Synchronizing causelist hearings...');
    } else {
      setStatusText('Workspace Ready. Launching Dashboard...');
    }
  }, [progress, showSplash]);

  // Handle clean role switching (keeps graphics completely unchanged)
  const handleRoleSelect = (r) => {
    setSelectedRole(r.id);
    setIsRegister(false);
    setEmail(r.email);
    setPassword('Admin@1234');
    setName('');
    setPhone('');
    setExperienceYears('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = (email || '').trim();
    const cleanEmailLower = cleanEmail.toLowerCase();
    const allowedAdminEmails = ['gokulrams.cs23@bitsathy.ac.in', 'admin@test.com', 'admin@sevenseas.com'];
    
    if (selectedRole === 'Admin' && !allowedAdminEmails.includes(cleanEmailLower)) {
      setError('Access Denied: Admin role requires a verified administrative email (e.g. gokulrams.cs23@bitsathy.ac.in or admin@test.com).');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const regData = {
          name,
          email: cleanEmail,
          password,
          role: selectedRole === 'User' ? 'Applicant' : selectedRole,
          phone,
          specialization: selectedRole === 'Lawyer' ? specialization : undefined,
          experienceYears: selectedRole === 'Lawyer' ? Number(experienceYears) : undefined,
        };
        const response = await axios.post('/auth/register', regData);
        localStorage.setItem('legalAidToken', response.data.token);
        localStorage.setItem('legalAidUser', JSON.stringify(response.data.user));
        if (setUser) setUser(response.data.user);
        window.dispatchEvent(new Event('auth-status-changed'));
      } else {
        await login({ email: cleanEmail, password });
      }

      // Remember Me storage
      if (rememberMe) {
        localStorage.setItem('sevenseas_remember_me', 'true');
        localStorage.setItem('sevenseas_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('sevenseas_remember_me');
        localStorage.removeItem('sevenseas_remembered_email');
      }

      setSuccess(true);
      setShowSplash(true);
      setTimeout(() => navigate(redirectPath), 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 1. SPLASH SCREEN (CONSISTENT GRAPHICS) ── */
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#070C15] select-none overflow-hidden font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(182,157,116,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-7 max-w-lg px-6">
          <div className="relative flex items-center justify-center w-48 h-48">
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#B69D74]/20 animate-spin" style={{ animationDuration: '30s' }} />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-36 h-36 transform -rotate-90">
                <defs>
                  <linearGradient id="splashGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#B69D74" />
                    <stop offset="100%" stopColor="#E6D5B8" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="85" fill="none" stroke="url(#splashGrad)" strokeWidth="5"
                  strokeDasharray="534"
                  strokeDashoffset={534 - (534 * progress) / 100}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.15s ease-out',
                    filter: 'drop-shadow(0 0 10px rgba(182,157,116,0.5))'
                  }}
                />
              </svg>
            </div>

            <div className="absolute h-20 w-20 rounded-2xl flex items-center justify-center shadow-2xl bg-[#162032] border border-[#B69D74]/40">
              <Logo className="h-10 w-10 text-[#B69D74]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-[0.2em] uppercase font-space bg-gradient-to-r from-[#B69D74] via-[#FFFFFF] to-[#B69D74] bg-clip-text text-transparent">
              Seven Seas
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D9C7A5]">
              {currentRole.label} Session Authenticated
            </p>
            <div className="flex items-center justify-center gap-3 py-0.5">
              <span className="h-px w-8 bg-white/10" />
              <span className="text-[11px] font-mono font-bold text-white/50 tracking-wider">{progress}% SECURED</span>
              <span className="h-px w-8 bg-white/10" />
            </div>
          </div>

          <div className="w-80 pt-1 flex flex-col items-center space-y-2.5">
            <div className="flex items-center gap-2 text-[10.5px] text-white/50 uppercase tracking-[0.2em] font-mono">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusText}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate(redirectPath)}
              className="mt-2 text-xs font-bold text-[#D9C7A5] hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-[#B69B72]/40 shadow-sm transition-all cursor-pointer"
            >
              Proceed to Dashboard Now <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 2. MAIN LOGIN PAGE (STABLE GRAPHICS ACROSS ALL LOGIN TYPES) ── */
  return (
    <div className="min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden flex bg-[var(--bg-app)]">

      {/* ── LEFT PANEL: CONSTANT, MAJESTIC SEVEN SEAS JUDICIAL SHOWCASE ── */}
      <div 
        className="hidden lg:flex lg:w-[460px] xl:w-[490px] shrink-0 flex-col justify-between p-8 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(165deg, #162032 0%, #101827 50%, #0A0F1A 100%)', 
          borderRight: '1px solid rgba(182,157,116,0.15)' 
        }}
      >
        {/* Constant Archangel Raguel Watermark Artwork */}
        <div className="absolute right-[-10%] bottom-[-5%] w-[380px] h-[380px] opacity-[0.07] pointer-events-none select-none z-0">
          <img src={archangelRaguelImg} alt="Raguel Judicial Guardian" className="w-full h-full object-contain" />
        </div>

        {/* Ambient Gold Particle Atmosphere (Always Consistent) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <InteractiveCanvasBackground 
            colorOverride="#B69D74" 
            density={38} 
            maxDistance={115} 
            speed={0.4} 
            interactive={true} 
          />
        </div>

        {/* Subtle Architectural Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(182,157,116,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(182,157,116,0.06) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-[#202A3B] border border-[#B69D74]/40">
            <Logo className="h-6 w-6 text-[#B69D74]" strokeWidth={2} />
          </div>
          <div>
            <p
              className="font-bold text-[17px] uppercase tracking-wider bg-clip-text text-transparent"
              style={{
                fontFamily: 'var(--font-display)',
                backgroundImage: 'linear-gradient(90deg, #B69D74 0%, #F5EAD4 50%, #B69D74 100%)',
                display: 'inline-block'
              }}
            >
              Seven Seas
            </p>
            <p className="text-[9px] text-[#D9C7A5]/80 font-bold tracking-[0.25em] uppercase mt-0.5">
              National Legal Services System
            </p>
          </div>
        </div>

        {/* Centerpiece: Scale of Justice Visual & Core Identity */}
        <div className="relative z-10 space-y-6 my-auto text-center">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Soft Ambient Halo */}
            <div className="absolute inset-0 rounded-full bg-[#B69D74]/10 blur-2xl pointer-events-none" />
            <ScaleIllustration />
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-white leading-tight font-space">
              Supreme Judicial & Legal Aid Gateway
            </h2>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Unified digital access point for petitioners, advocates, judicial officers, and court registries.
            </p>
          </div>

          {/* Core Trust Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {[
              { val: '54K+', label: 'Resolved Cases' },
              { val: '4.8K+', label: 'Panel Advocates' },
              { val: 'Art. 39A', label: 'Free Legal Aid' },
            ].map(({ val, label }) => (
              <div 
                key={label} 
                className="text-center py-2.5 px-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-xs backdrop-blur-xs"
              >
                <div className="text-[14px] font-black text-[#D9C7A5] font-space">{val}</div>
                <div className="text-[8.5px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Constitutional Quote */}
          <p className="text-[11px] italic text-[#D9C7A5]/70 max-w-xs mx-auto leading-relaxed pt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            "Equal justice under law, ensuring that opportunities for securing justice are not denied by reason of economic disability."
          </p>
        </div>

        {/* Footer Helpline */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[9.5px] text-slate-400">
          <span className="flex items-center gap-1.5 text-[#D9C7A5] font-semibold">
            <PhoneCall size={11} className="text-[#B69D74]" /> Legal Aid Helpline: 15100 (24x7 Toll-Free)
          </span>
          <span className="font-mono text-slate-500">v2.4 SSL</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: STREAMLINED, UNCLUTTERED AUTHENTICATION CARD ── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--bg-app)] relative">
        
        {/* Subtle Watermark on Form Background */}
        <div className="absolute right-[5%] bottom-[-5%] w-[340px] h-[340px] opacity-[0.03] pointer-events-none select-none z-0">
          <img src={archangelRaguelImg} alt="" className="w-full h-full object-contain" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[440px] p-6 sm:p-8 rounded-3xl glass-card space-y-4 shadow-2xl relative z-10 border border-slate-200/80 dark:border-slate-800"
        >

          {/* Mobile Header Branding */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1F2839] border border-[#B69D74]/40">
              <Logo className="h-4 w-4 text-[#B69D74]" strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-sm uppercase tracking-wider text-[#B69D74] font-space">
                Seven Seas Judiciary
              </span>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">National Portal</p>
            </div>
          </div>

          {/* Card Title & SSL Badge */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-space">
                Portal Authentication
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentRole.desc}
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              TLS Secured
            </span>
          </div>

          {/* ── SINGLE UNIFIED 5-ROLE SELECTOR ── */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all duration-200 text-[10px] font-bold cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1F2839] text-[#8A6F46] dark:text-[#D9C7A5] shadow-xs border border-[#B69B72]/50'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#B69B72]' : 'text-slate-400'} />
                  <span className="truncate max-w-full text-center">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sign In vs Create Account Toggle (for Citizens & Advocates) */}
          {(selectedRole === 'User' || selectedRole === 'Lawyer') && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isRegister 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isRegister 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Full Name</label>
                <div className="login-input-wrap">
                  <User size={14} className="login-input-icon" />
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your legal full name"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {/* Email Address or Panel Advocate Dropdown */}
            {selectedRole === 'Lawyer' && !isRegister ? (
              <div className="login-field">
                <div className="flex items-center justify-between mb-1">
                  <label className="login-label flex items-center gap-1.5">
                    <Scale size={13} className="text-[#B69D74]" />
                    Select Verified Advocate
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Theni District Bar</span>
                </div>
                <div className="login-input-wrap">
                  <select
                    value={THENI_ADVOCATE_LOGINS.some(a => a.email === email) ? email : 'lawyer17@sevenseas.com'}
                    onChange={(e) => {
                      const chosen = THENI_ADVOCATE_LOGINS.find(a => a.email === e.target.value);
                      if (chosen) {
                        setEmail(chosen.email);
                        setPassword('Admin@1234');
                      }
                    }}
                    className="login-input login-select text-xs font-semibold cursor-pointer truncate"
                  >
                    {THENI_ADVOCATE_LOGINS.map(adv => (
                      <option key={adv.email} value={adv.email}>
                        {adv.name} — {adv.spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="login-field">
                <label className="login-label">
                  {selectedRole === 'Lawyer' ? 'Advocate Email Address' : 'Email Address'}
                </label>
                <div className="login-input-wrap">
                  <Mail size={14} className="login-input-icon" />
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'Judge' ? 'judge@sevenseas.com' :
                      selectedRole === 'Admin' ? 'gokulrams.cs23@bitsathy.ac.in or admin@test.com' :
                      'you@example.com'
                    }
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Mobile Number</label>
                <div className="login-input-wrap">
                  <Shield size={14} className="login-input-icon" />
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {isRegister && selectedRole === 'Lawyer' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="login-field">
                  <label className="login-label">Specialization</label>
                  <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="login-input login-select">
                    {['Civil Law', 'Criminal Law', 'Family Law', 'Property Law', 'Corporate Law'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="login-field">
                  <label className="login-label">Experience (yrs)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    max="60" 
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    placeholder="e.g. 5" 
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="login-field">
              <div className="flex items-center justify-between">
                <label className="login-label">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-semibold text-[#8A6F46] dark:text-[#D9C7A5] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="login-input-wrap">
                <Lock size={14} className="login-input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="login-input pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Terminal checkbox */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#B69B72] focus:ring-0 cursor-pointer"
                />
                Remember this workstation
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                PW: Admin@1234
              </span>
            </div>

            {/* Admin Notice */}
            {selectedRole === 'Admin' && (
              <div className="login-admin-notice">
                <Lock size={12} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed">
                  Admin authorization: <code className="font-mono font-bold">gokulrams.cs23@bitsathy.ac.in</code> or <code className="font-mono">admin@test.com</code>
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="login-error animate-fade-in">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* ── SINGLE CONSISTENT ACTION BUTTON ACROSS ALL ROLES ── */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B69B72] via-[#A88C64] to-[#8C724D] hover:from-[#A88C64] hover:to-[#7E6542] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#B69B72]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {success ? (
                <><CheckCircle size={15} /> Authentication Verified — Launching...</>
              ) : loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying Credentials…</>
              ) : (
                <>{isRegister ? 'Create Authorized Account' : `Sign In to ${currentRole.label} Portal`} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Footer Assistance & Homepage link */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-1.5">
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              <Link to="/" className="font-semibold text-[#8A6F46] dark:text-[#D9C7A5] hover:underline">
                ← Return to Public Homepage
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span>eCourts Integrated</span>
              <span>•</span>
              <span>24x7 Legal Aid: <strong className="text-[#8A6F46] dark:text-[#D9C7A5]">15100</strong></span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
