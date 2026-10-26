import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../api/axios';
import {
  Eye, EyeOff, Scale, Crown, User, ArrowRight,
  CheckCircle, Shield, Sparkles, Lock, Mail, AlertCircle, Gavel, Building,
  RefreshCw, Check, PhoneCall, HelpCircle
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
    color: '#202A3B',
    grad: 'linear-gradient(135deg,#202A3B,#334259)',
    email: 'applicant@test.com',
    desc: 'Apply for legal aid, track case dockets & counsel consultations',
    bg: 'rgba(32,42,59,0.08)',
    border: 'rgba(32,42,59,0.25)',
  },
  {
    id: 'Lawyer',
    label: 'Advocate',
    icon: Scale,
    color: '#B69B72',
    grad: 'linear-gradient(135deg,#B69B72,#D9C7A5)',
    email: 'lawyer17@sevenseas.com',
    desc: 'Manage hearings, legal dockets & client representation',
    bg: 'rgba(182,155,114,0.12)',
    border: 'rgba(182,155,114,0.35)',
  },
  {
    id: 'Judge',
    label: 'Judge',
    icon: Gavel,
    color: '#8A5836',
    grad: 'linear-gradient(135deg,#3F2415,#8A5836)',
    email: 'judge@sevenseas.com',
    desc: 'Preside court bench, issue daily orders & causelists',
    bg: 'rgba(138,88,54,0.12)',
    border: 'rgba(138,88,54,0.35)',
  },
  {
    id: 'CourtStaff',
    label: 'Court Staff',
    icon: Building,
    color: '#202A3B',
    grad: 'linear-gradient(135deg,#202A3B,#3F506B)',
    email: 'staff@test.com',
    desc: 'Schedule hearings, update cause lists & court notices',
    bg: 'rgba(32,42,59,0.08)',
    border: 'rgba(32,42,59,0.25)',
  },
  {
    id: 'Admin',
    label: 'Admin',
    icon: Crown,
    color: '#B69B72',
    grad: 'linear-gradient(135deg,#202A3B,#B69B72)',
    email: 'gokulrams.cs23@bitsathy.ac.in',
    desc: 'Assign lawyers, approve legal aid & system administration',
    bg: 'rgba(182,155,114,0.12)',
    border: 'rgba(182,155,114,0.35)',
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

/* SVG Scale-of-Justice illustration */
const ScaleIllustration = ({ color }) => (
  <svg viewBox="0 0 220 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="100" r="85" stroke={color} strokeOpacity="0.06" strokeWidth="1" />
    <circle cx="110" cy="100" r="60" stroke={color} strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
    <line x1="110" y1="30" x2="110" y2="160" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="110" cy="30" r="6" fill={color} />
    <circle cx="110" cy="30" r="10" fill={color} fillOpacity="0.15" />
    <circle cx="110" cy="90" r="8" fill={color} fillOpacity="0.9" />
    <circle cx="110" cy="90" r="14" stroke={color} strokeOpacity="0.2" strokeWidth="1" />
    <rect x="90" y="158" width="40" height="6" rx="3" fill={color} fillOpacity="0.6" />
    <line x1="75" y1="164" x2="145" y2="164" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="45" y1="78" x2="175" y2="78" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="52" y1="78" x2="38" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="78" x2="66" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 33,125 H 71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 33,125 C 33,140 71,140 71,125" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
    <line x1="168" y1="78" x2="154" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="168" y1="78" x2="182" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 149,125 H 187" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 149,125 C 149,140 187,140 187,125" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
    <circle cx="52" cy="58" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="168" cy="58" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="45" cy="78" r="3" fill={color} />
    <circle cx="175" cy="78" r="3" fill={color} />
    <circle cx="110" cy="90" r="30" fill={color} fillOpacity="0.04" />
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

  // Interactive Bot Prevention Captcha (eCourts National Standard)
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 1;
    return { num1, num2, answer: num1 + num2 };
  };
  const [captchaQ, setCaptchaQ] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState(() => String(captchaQ.answer));

  const refreshCaptcha = () => {
    const nextQ = generateCaptcha();
    setCaptchaQ(nextQ);
    setCaptchaInput('');
  };

  const role = ROLES.find(r => r.id === selectedRole) || ROLES[0];

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

  const handleRoleSelect = (r) => {
    setSelectedRole(r.id);
    setIsRegister(false);
    setEmail(r.email);
    setPassword('Admin@1234');
    setName('');
    setPhone('');
    setExperienceYears('');
    setError('');
    setCaptchaInput(String(captchaQ.answer));
  };

  const handleQuickAccount = (acc) => {
    setSelectedRole(acc.roleId);
    setEmail(acc.email);
    setPassword('Admin@1234');
    setIsRegister(false);
    setError('');
    setCaptchaInput(String(captchaQ.answer));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Captcha validation
    if (parseInt(String(captchaInput).trim(), 10) !== captchaQ.answer) {
      setError(`Security Verification failed: ${captchaQ.num1} + ${captchaQ.num2} is not "${captchaInput}". Please enter the correct sum.`);
      return;
    }

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
      // Navigate to dashboard cleanly
      setTimeout(() => navigate(redirectPath), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── 1. SPLASH SCREEN (WITH INSTANT SKIP OPTION) ── */
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050B14] select-none overflow-hidden font-sans">
        {/* Floating backdrop canvas grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Matrix grid streams */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg px-6">
          
          {/* Concentric Rotating Telemetry Rings */}
          <div className="relative flex items-center justify-center w-52 h-52">
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '40s' }} />
            
            <div className="absolute w-40 h-40 rounded-full border border-[rgba(255,255,255,0.05)] animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            </div>

            {/* Inner SVG progress circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-40 h-40 transform -rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={role?.color || '#2563EB'} />
                    <stop offset="100%" stopColor="#B69D74" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="85" fill="none" stroke="url(#ringGrad)" strokeWidth="5"
                  strokeDasharray="534"
                  strokeDashoffset={534 - (534 * progress) / 100}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.15s ease-out',
                    filter: `drop-shadow(0 0 10px ${role?.color || '#2563EB'}80)`
                  }}
                />
              </svg>
            </div>

            {/* Central Seven Seas Logo Badge */}
            <div className="absolute h-24 w-24 rounded-3xl flex items-center justify-center shadow-2xl bg-[#1F2839] border border-white/10 hover:border-white/20 transition-all duration-300">
              <Logo className="h-12 w-12 text-[#B69D74]" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-3xl border border-[#B69D74]/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Heading Credentials */}
          <div className="space-y-2.5 animate-fade-in-up">
            <h1 
              className="text-3xl font-black tracking-[0.25em] uppercase font-space bg-gradient-to-r from-[#B69D74] via-[#FFFFFF] to-[#B69D74] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(182,157,116,0.35)]"
              style={{ backgroundSize: '200% auto', animation: 'textShimmer 3s linear infinite' }}
            >
              Seven Seas
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] font-sans" style={{ color: role?.color }}>
              {role?.label} Secure Session
            </p>
            <div className="flex items-center justify-center gap-3 py-0.5">
              <span className="h-px w-8 bg-white/10" />
              <span className="text-[11px] font-mono font-bold text-white/50 tracking-wider">{progress}% SECURED</span>
              <span className="h-px w-8 bg-white/10" />
            </div>
            <p className="text-xs font-semibold italic text-white/50 leading-relaxed max-w-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Balancing the scales of equity, securing rights with absolute integrity."
            </p>
          </div>

          {/* High-tech status logger logs */}
          <div className="w-80 pt-1 flex flex-col items-center space-y-2.5">
            <div className="flex items-center gap-2 text-[10.5px] text-white/50 uppercase tracking-[0.2em] font-mono">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusText}</span>
            </div>

            {/* Direct Instant Access Button */}
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

  /* ── 2. MAIN LOGIN PAGE ── */
  return (
    <div className="h-screen overflow-hidden flex bg-[var(--bg-app)]">

      {/* ── LEFT PANEL ── */}
      <div 
        className="hidden lg:flex lg:w-[460px] xl:w-[490px] shrink-0 flex-col justify-between p-7 xl:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1F2839 0%, #151C28 50%, #0E131C 100%)', borderRight: '1px solid rgba(245,245,239,0.08)' }}
      >

        {/* Archangel Raguel Left Panel Watermark */}
        <div className="absolute right-[-15%] bottom-[-5%] w-[360px] h-[360px] opacity-[0.06] pointer-events-none select-none z-0">
          <img src={archangelRaguelImg} alt="" className="w-full h-full object-contain" />
        </div>

        {/* Floating background particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <InteractiveCanvasBackground 
            colorOverride={role?.color || '#3B82F6'} 
            density={45} 
            maxDistance={110} 
            speed={0.5} 
            interactive={true} 
          />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* Logo & Portal Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(182,157,116,0.15)', border: '1px solid rgba(182,157,116,0.3)' }}>
            <Logo className="h-5 w-5 text-[#B69D74]" strokeWidth={2} />
          </div>
          <div>
            <p
              className="font-bold text-[15px] uppercase tracking-wider bg-clip-text text-transparent"
              style={{
                fontFamily: 'var(--font-display)',
                backgroundImage: 'linear-gradient(90deg, #B69D74 0%, #E6D5B8 50%, #B69D74 100%)',
                display: 'inline-block'
              }}
            >
              Seven Seas
            </p>
            <p className="text-[9px] text-[#D9C7A5]/60 font-bold tracking-[0.25em] uppercase mt-0.5">National Legal Services System</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-5 my-auto">
          {/* Scale SVG */}
          <div className="w-32 h-32 mx-auto" style={{ transition: 'all 0.5s ease' }}>
            <ScaleIllustration color={role?.color || '#B69D74'} />
          </div>

          <div className="space-y-1.5 text-center">
            <h2 className="text-[1.4rem] font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Secure Judicial Portal Gateway
            </h2>
            <p className="text-[11.5px] text-white/50 leading-relaxed max-w-xs mx-auto">
              Unified digital access point for petitioners, advocates, judicial officers, and court registries.
            </p>
          </div>

          {/* Role access list (All 5 roles) */}
          <div className="space-y-1.5">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer"
                  style={{
                    background: isActive ? r.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? r.border : 'rgba(255,255,255,0.06)'}`,
                  }}
                  onClick={() => handleRoleSelect(r)}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: isActive ? `${r.color}30` : 'rgba(255,255,255,0.05)' }}>
                    <Icon size={13} style={{ color: isActive ? r.color : 'rgba(255,255,255,0.45)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold leading-tight" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.6)' }}>{r.label} Portal</p>
                    <p className="text-[9px] mt-0.5 leading-tight truncate" style={{ color: isActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)' }}>{r.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legal Aid Trust Metrics */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: '54K+', label: 'Cases Filed' },
              { val: '4.8K+', label: 'Advocates' },
              { val: '96%', label: 'Resolution' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center px-1.5 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[13px] font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>{val}</div>
                <div className="text-[8px] text-white/40 mt-0.5 font-semibold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Helpline */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-white/40">
          <span className="flex items-center gap-1 text-[#D9C7A5]">
            <PhoneCall size={10} /> Helpline: 15100 (Toll-Free)
          </span>
          <span>© 2026 Seven Seas Judiciary · Art. 39A</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-6 h-full overflow-y-auto bg-[var(--bg-app)] relative">
        {/* Archangel Raguel Form Background Watermark */}
        <div className="absolute right-[5%] bottom-[-10%] w-[380px] h-[380px] opacity-[0.03] dark:opacity-[0.015] pointer-events-none select-none z-0">
          <img src={archangelRaguelImg} alt="" className="w-full h-full object-contain" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[450px] p-6 sm:p-7 rounded-[22px] glass-card space-y-4 shadow-2xl relative z-10 my-auto"
        >

          {/* Mobile logo header */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1F2839,#2D3A50)' }}>
              <Logo className="h-4 w-4 text-[#B69D74]" strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-[14px] uppercase tracking-wider text-[#B69D74]" style={{ fontFamily: 'var(--font-display)' }}>
                Seven Seas Justice
              </span>
              <p className="text-[8px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Judicial Portal</p>
            </div>
          </div>

          {/* Title Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.45rem] font-extrabold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                Portal Authentication
              </h1>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Sign in to your authorized court workstation</p>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SSL Secured
            </span>
          </div>

          {/* 5-Role Selector Tabs */}
          <div className="flex gap-1 p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)]">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all duration-200 text-[10px] font-bold"
                  style={isActive ? {
                    background: r.bg,
                    color: r.color,
                    border: `1px solid ${r.border}`,
                    boxShadow: `0 2px 8px ${r.color}20`,
                  } : {
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }}
                >
                  <Icon size={14} />
                  <span className="truncate max-w-full">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1-Click Fast Verified Role Logins (For All 5 Roles) */}
          <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-[#202A3B]/10 dark:border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-[#B69B72] dark:text-[#D9C7A5] flex items-center gap-1">
                <Sparkles size={11} /> 1-Click Fast Verified Logins
              </span>
              <span className="text-[9px] font-mono text-slate-400">PW: Admin@1234</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: 'Citizen', email: 'applicant@test.com', roleId: 'User' },
                { label: 'Advocate', email: 'lawyer17@sevenseas.com', roleId: 'Lawyer' },
                { label: 'Judge', email: 'judge@sevenseas.com', roleId: 'Judge' },
                { label: 'Staff', email: 'staff@test.com', roleId: 'CourtStaff' },
                { label: 'Admin', email: 'gokulrams.cs23@bitsathy.ac.in', roleId: 'Admin' }
              ].map(acc => {
                const isSelected = email === acc.email || (acc.roleId === 'Admin' && email === 'admin@test.com');
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickAccount(acc)}
                    className={`py-1.5 px-1 rounded-lg text-[9.5px] font-bold border transition truncate text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-sm ring-1 ring-[#B69B72]'
                        : 'bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B69B72]'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign In vs Create Account Toggle (for Citizens, Lawyers, CourtStaff) */}
          {selectedRole !== 'Admin' && selectedRole !== 'Judge' && (
            <div className="flex rounded-xl border border-[var(--border-color)] p-1 bg-[var(--bg-app)]">
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-bold transition-all duration-200 ${!isRegister ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-bold transition-all duration-200 ${isRegister ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
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

            {/* Quick Advocate Account Picker (Only visible in Advocate Login) */}
            {selectedRole === 'Lawyer' && !isRegister && (
              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/10 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Scale size={13} className="text-[#B69B72] dark:text-[#D9C7A5]" />
                    Select Advocate:
                  </label>
                  <span className="text-[9.5px] text-[#202A3B] dark:text-[#D9C7A5] font-bold bg-[#B69B72]/20 px-2 py-0.5 rounded-full">
                    Theni District Panel
                  </span>
                </div>

                {/* Direct 1-click button for Advocate A. Sundaramurthy */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('lawyer17@sevenseas.com');
                    setPassword('Admin@1234');
                    setCaptchaInput(String(captchaQ.answer));
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    email === 'lawyer17@sevenseas.com' || email.toLowerCase().includes('sundaramurthy')
                      ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-sm ring-1 ring-[#B69B72]'
                      : 'bg-white dark:bg-[#1B2332] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#B69B72]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#B69D74]">⭐</span>
                    <strong>Advocate A. Sundaramurthy</strong>
                  </span>
                  <span className="text-[10px] opacity-80 font-normal">Sub Court Periyakulam</span>
                </button>

                {/* Dropdown for all 30 Theni advocates */}
                <div>
                  <select
                    value={THENI_ADVOCATE_LOGINS.some(a => a.email === email) ? email : ''}
                    onChange={(e) => {
                      const chosen = THENI_ADVOCATE_LOGINS.find(a => a.email === e.target.value);
                      if (chosen) {
                        setEmail(chosen.email);
                        setPassword('Admin@1234');
                        setCaptchaInput(String(captchaQ.answer));
                      }
                    }}
                    className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#B69B72] cursor-pointer"
                  >
                    <option value="">-- Choose from 30 Theni Panel Advocates --</option>
                    {THENI_ADVOCATE_LOGINS.map(adv => (
                      <option key={adv.email} value={adv.email}>
                        {adv.name} — {adv.spec} ({adv.court})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Email Address / Advocate Name */}
            <div className="login-field">
              <label className="login-label">
                {selectedRole === 'Lawyer' ? 'Advocate Name or Email' : 'Email Address'}
              </label>
              <div className="login-input-wrap">
                <Mail size={14} className="login-input-icon" />
                <input 
                  type={selectedRole === 'Lawyer' ? 'text' : 'email'} 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'Lawyer' ? 'e.g. Advocate A. Sundaramurthy or lawyer17@sevenseas.com' :
                    selectedRole === 'Judge' ? 'e.g. judge@sevenseas.com' :
                    selectedRole === 'Admin' ? 'gokulrams.cs23@bitsathy.ac.in or admin@test.com' :
                    'you@example.com'
                  }
                  className="login-input"
                />
              </div>
            </div>

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
              <div className="grid grid-cols-2 gap-2.5">
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
                <Link to="/forgot-password" className="text-[10px] font-semibold hover:underline" style={{ color: role?.color }}>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Captcha Security Check (Standard for eCourts Indian Portals) */}
            <div className="login-field">
              <div className="flex items-center justify-between">
                <label className="login-label flex items-center gap-1.5">
                  <Shield size={11} className="text-[#B69D74]" />
                  Security Verification (Bot Protection)
                </label>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-[9.5px] text-[var(--text-muted)] hover:text-[#B69D74] flex items-center gap-1 font-semibold cursor-pointer"
                  title="Generate new question"
                >
                  <RefreshCw size={10} /> Refresh
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono font-extrabold text-xs tracking-wider text-slate-800 dark:text-[#D9C7A5] select-none shrink-0 shadow-inner">
                  {captchaQ.num1} + {captchaQ.num2} = ?
                </div>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="Answer"
                  className="login-input font-mono font-bold text-center"
                  style={{ paddingLeft: '12px' }}
                />
              </div>
            </div>

            {/* Remember Terminal & SSL indicator */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[var(--text-secondary)] font-medium text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#B69D74] focus:ring-0 cursor-pointer"
                />
                Remember my terminal
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check size={11} /> 256-Bit TLS Protected
              </span>
            </div>

            {/* Admin Notice */}
            {selectedRole === 'Admin' && (
              <div className="login-admin-notice">
                <Lock size={12} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed">
                  Designated Admin accounts: <code className="font-mono font-bold">gokulrams.cs23@bitsathy.ac.in</code> or <code className="font-mono">admin@test.com</code>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="login-submit-btn w-full cursor-pointer shadow-md"
              style={{ background: role?.grad, boxShadow: `0 4px 18px ${role?.color}35` }}
            >
              {success ? (
                <><CheckCircle size={15} /> Authentication Successful — Launching...</>
              ) : loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying Credentials…</>
              ) : (
                <>{isRegister ? 'Create Authorized Account' : `Sign In to ${role?.label} Portal`} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Footer Assistance & Homepage link */}
          <div className="pt-2 border-t border-[var(--border-color)]/70 text-center space-y-2">
            <p className="text-center text-[11px] text-[var(--text-muted)]">
              <Link to="/" className="font-semibold hover:underline" style={{ color: role?.color }}>
                ← Return to Public Homepage
              </Link>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[9.5px] text-[var(--text-muted)] opacity-85">
              <span>Article 39A Compliant</span>
              <span>·</span>
              <span>NALSA Legal Aid 24x7: <strong className="text-[#B69D74]">15100</strong></span>
              <span>·</span>
              <span>eCourts Integrated</span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
