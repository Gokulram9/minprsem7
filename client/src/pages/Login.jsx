import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../api/axios';
import {
  Eye, EyeOff, Scale, Crown, User, ArrowRight,
  CheckCircle, Shield, Sparkles, Lock, Mail, AlertCircle, Gavel, Building
} from 'lucide-react';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import archangelRaguelImg from '../assets/archangel-raguel.png';
import InteractiveCanvasBackground from '../components/InteractiveCanvasBackground';


const ROLES = [
  {
    id: 'User',
    label: 'Applicant',
    icon: User,
    color: '#202A3B',
    grad: 'linear-gradient(135deg,#202A3B,#334259)',
    email: 'applicant@test.com',
    desc: 'Apply for legal aid, track your case & chat with counsel',
    bg: 'rgba(32,42,59,0.08)',
    border: 'rgba(32,42,59,0.25)',
  },
  {
    id: 'Lawyer',
    label: 'Advocate',
    icon: Scale,
    color: '#B69B72',
    grad: 'linear-gradient(135deg,#B69B72,#D9C7A5)',
    email: 'lawyer@test.com',
    desc: 'Manage hearings, update cases & client communication',
    bg: 'rgba(182,155,114,0.12)',
    border: 'rgba(182,155,114,0.35)',
  },
  {
    id: 'CourtStaff',
    label: 'Court Staff',
    icon: Building,
    color: '#202A3B',
    grad: 'linear-gradient(135deg,#202A3B,#3F506B)',
    email: 'staff@test.com',
    desc: 'Schedule hearings, manage dockets & notify parties',
    bg: 'rgba(32,42,59,0.08)',
    border: 'rgba(32,42,59,0.25)',
  },
  {
    id: 'Admin',
    label: 'Admin',
    icon: Crown,
    color: '#B69B72',
    grad: 'linear-gradient(135deg,#202A3B,#B69B72)',
    email: 'admin@test.com',
    desc: 'Assign lawyers, approve legal aid & administration',
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
    {/* Background rings */}
    <circle cx="110" cy="100" r="85" stroke={color} strokeOpacity="0.06" strokeWidth="1" />
    <circle cx="110" cy="100" r="60" stroke={color} strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
    
    {/* Pillar */}
    <line x1="110" y1="30" x2="110" y2="160" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Crown node */}
    <circle cx="110" cy="30" r="6" fill={color} />
    <circle cx="110" cy="30" r="10" fill={color} fillOpacity="0.15" />
    
    {/* Center pivot */}
    <circle cx="110" cy="90" r="8" fill={color} fillOpacity="0.9" />
    <circle cx="110" cy="90" r="14" stroke={color} strokeOpacity="0.2" strokeWidth="1" />

    {/* Base */}
    <rect x="90" y="158" width="40" height="6" rx="3" fill={color} fillOpacity="0.6" />
    <line x1="75" y1="164" x2="145" y2="164" stroke={color} strokeWidth="2" strokeLinecap="round" />
    
    {/* Beam */}
    <line x1="45" y1="78" x2="175" y2="78" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Left hangers */}
    <line x1="52" y1="78" x2="38" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="52" y1="78" x2="66" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Left pan */}
    <path d="M 33,125 H 71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 33,125 C 33,140 71,140 71,125" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
    
    {/* Right hangers */}
    <line x1="168" y1="78" x2="154" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="168" y1="78" x2="182" y2="125" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Right pan */}
    <path d="M 149,125 H 187" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 149,125 C 149,140 187,140 187,125" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
    
    {/* Accent dots */}
    <circle cx="52" cy="58" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="168" cy="58" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="45" cy="78" r="3" fill={color} />
    <circle cx="175" cy="78" r="3" fill={color} />

    {/* Glow effect */}
    <circle cx="110" cy="90" r="30" fill={color} fillOpacity="0.04" />
  </svg>
);

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('User');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('user@sevenseas.com');
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
  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 90}%`,
      w: 2 + Math.random() * 4,
      dur: 4 + Math.random() * 6,
      delay: Math.random() * 4,
      color: ['#B69D74','#3B82F6','#8B5CF6','#10B981'][i % 4],
    }))
  );

  const role = ROLES.find(r => r.id === selectedRole);

  useEffect(() => {
    if (!showSplash) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = Math.floor(Math.random() * 10) + 4;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return;
    if (progress < 20) {
      setStatusText('Connecting to secure database...');
    } else if (progress < 40) {
      setStatusText('Verifying session credentials...');
    } else if (progress < 60) {
      setStatusText('Loading user profile settings...');
    } else if (progress < 80) {
      setStatusText('Synchronizing calendar hearings...');
    } else if (progress < 95) {
      setStatusText('Opening system control panel...');
    } else {
      setStatusText('Workspace Ready.');
    }
  }, [progress, showSplash]);

  const handleRoleSelect = (r) => {
    setSelectedRole(r.id);
    setIsRegister(false);
    setEmail(r.email);
    setPassword('Admin@1234');
    setName(''); setPhone(''); setExperienceYears('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (selectedRole === 'Admin' && email.toLowerCase() !== 'gokulrams.cs23@bitsathy.ac.in') {
      setError('Access Denied: Only the designated admin email holds Admin authority.');
      setLoading(false);
      return;
    }
    try {
      if (isRegister) {
        const regData = { name, email, password, role: selectedRole, phone,
          specialization: selectedRole === 'Lawyer' ? specialization : undefined,
          experienceYears: selectedRole === 'Lawyer' ? Number(experienceYears) : undefined,
        };
        const response = await axios.post('/auth/register', regData);
        localStorage.setItem('legalAidToken', response.data.token);
        localStorage.setItem('legalAidUser', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth-status-changed'));
      } else {
        await login({ email, password });
      }
      setSuccess(true);
      setShowSplash(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── SPLASH SCREEN ── */
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050B14] select-none overflow-hidden font-sans">
        {/* Floating backdrop canvas grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Matrix grid streams */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

        <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-lg px-6">
          
          {/* Concentric Rotating Telemetry Rings */}
          <div className="relative flex items-center justify-center w-60 h-60">
            {/* Outer dotted orbital ring */}
            <div className="absolute w-56 h-56 rounded-full border border-dashed border-white/5 animate-spin" style={{ animationDuration: '40s' }} />
            
            {/* Middle telemetry nodes ring */}
            <div className="absolute w-48 h-48 rounded-full border border-[rgba(255,255,255,0.03)] animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Inner SVG progress circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={role?.color || '#2563EB'} />
                    <stop offset="100%" stopColor="#B69D74" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.02)"
                  strokeWidth="6"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="5"
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
            <div className="absolute h-28 w-28 rounded-3xl flex items-center justify-center shadow-2xl bg-[#1F2839] border border-white/10 hover:border-white/20 transition-all duration-300">
              <Logo className="h-14 w-14 text-[#B69D74]" strokeWidth={1.5} />
              
              {/* Pulse circle */}
              <div className="absolute inset-0 rounded-3xl border border-[#B69D74]/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Heading Credentials */}
          <div className="space-y-3 animate-fade-in-up">
            <h1 
              className="text-4xl font-black tracking-[0.25em] uppercase font-space bg-gradient-to-r from-[#B69D74] via-[#FFFFFF] to-[#B69D74] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(182,157,116,0.35)]"
              style={{
                backgroundSize: '200% auto',
                animation: 'textShimmer 3s linear infinite'
              }}
            >
              Seven Seas
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] font-sans" style={{ color: role?.color }}>
              Justice Portal
            </p>
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="h-px w-8 bg-white/10" />
              <span className="text-[11px] font-mono font-bold text-white/45 tracking-wider">{progress}% SECURED</span>
              <span className="h-px w-8 bg-white/10" />
            </div>
            <p className="text-xs font-semibold italic text-white/50 leading-relaxed max-w-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Balancing the scales of equity, securing rights with absolute integrity."
            </p>
          </div>

          {/* High-tech status logger logs */}
          <div className="w-80 pt-4 flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.25em] font-mono">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusText}</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ── MAIN LOGIN ── */
  return (
    <div className="h-screen overflow-hidden flex bg-[var(--bg-app)]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[500px] shrink-0 flex-col justify-between p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1F2839 0%, #151C28 50%, #0E131C 100%)', borderRight: '1px solid rgba(245,245,239,0.08)' }}>

        {/* Archangel Raguel Left Panel Watermark */}
        <div className="absolute right-[-15%] bottom-[-5%] w-[360px] h-[360px] opacity-[0.06] pointer-events-none select-none z-0">
          <img 
            src={archangelRaguelImg} 
            alt="" 
            className="w-full h-full object-contain"
          />
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

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(182,157,116,0.12)', border: '1px solid rgba(182,157,116,0.25)' }}>
            <Logo className="h-6 w-6 text-[#B69D74]" strokeWidth={2} />
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
            <p className="text-[9px] text-white/30 font-bold tracking-[0.25em] uppercase mt-0.5">Justice Portal</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          {/* Scale SVG */}
          <div className="w-44 h-44 mx-auto" style={{ transition: 'all 0.5s ease' }}>
            <ScaleIllustration color={role?.color || '#B69D74'} />
          </div>

          <div className="space-y-3">
            <h2 className="text-[1.6rem] font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Access your secure<br />judicial workspace
            </h2>
            <p className="text-[12px] text-white/40 leading-relaxed max-w-xs">
              A centralized platform to coordinate courtroom schedules, legal aid applications, and advocate management.
            </p>
          </div>

          {/* Role access cards */}
          <div className="space-y-2">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 cursor-pointer"
                  style={{
                    background: isActive ? r.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? r.border : 'rgba(255,255,255,0.05)'}`,
                  }}
                  onClick={() => handleRoleSelect(r)}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: isActive ? `${r.color}20` : 'rgba(255,255,255,0.04)' }}>
                    <Icon size={14} style={{ color: isActive ? r.color : 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-bold leading-none" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.45)' }}>{r.label} Access</p>
                    <p className="text-[9.5px] mt-0.5 leading-none" style={{ color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}>{r.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: '54K+', label: 'Cases Filed' },
              { val: '4.8K+', label: 'Advocates' },
              { val: '96%', label: 'Resolution' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center px-2 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[15px] font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>{val}</div>
                <div className="text-[8.5px] text-white/30 mt-0.5 font-semibold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[9.5px] text-white/15 font-medium">
          © 2026 Seven Seas Justice System · All rights reserved
        </p>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-8 h-full overflow-y-auto bg-[var(--bg-app)] relative">
        {/* Archangel Raguel Form Background Watermark */}
        <div className="absolute right-[5%] bottom-[-10%] w-[380px] h-[380px] opacity-[0.03] dark:opacity-[0.015] pointer-events-none select-none z-0">
          <img 
            src={archangelRaguelImg} 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[430px] p-8 rounded-[24px] glass-card space-y-6 shadow-2xl relative z-10"
        >

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1F2839,#2D3A50)' }}>
              <Logo className="h-5 w-5 text-[#B69D74]" strokeWidth={2} />
            </div>
            <span
              className="font-bold text-[15px] uppercase tracking-wider bg-clip-text text-transparent"
              style={{
                fontFamily: 'var(--font-display)',
                backgroundImage: 'linear-gradient(90deg, #B69D74 0%, #E6D5B8 50%, #B69D74 100%)',
              }}
            >
              Seven Seas
            </span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-[1.65rem] font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome back
            </h1>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Sign in to your portal workspace</p>
          </div>

          {/* Role selector tabs */}
          <div className="flex gap-2 p-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]">
            {ROLES.map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200 text-[11px] font-bold"
                  style={isActive ? {
                    background: r.bg,
                    color: r.color,
                    border: `1px solid ${r.border}`,
                    boxShadow: `0 2px 12px ${r.color}20`,
                  } : {
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* 1-Click Test Switcher for all 4 Roles */}
          <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/10 dark:border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B69B72] dark:text-[#D9C7A5]">
                1-Click Verified Role Logins
              </span>
              <span className="text-[9px] text-slate-400">PW: Admin@1234</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { label: 'Applicant', email: 'applicant@test.com', roleId: 'User' },
                { label: 'Lawyer', email: 'lawyer@test.com', roleId: 'Lawyer' },
                { label: 'Court Staff', email: 'staff@test.com', roleId: 'CourtStaff' },
                { label: 'Admin', email: 'admin@test.com', roleId: 'Admin' }
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setSelectedRole(acc.roleId);
                    setEmail(acc.email);
                    setPassword('Admin@1234');
                    setIsRegister(false);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition truncate ${
                    email === acc.email
                      ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-sm'
                      : 'bg-white dark:bg-[#1B2332] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B69B72]'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign in / Register toggle */}
          {selectedRole !== 'Admin' && (
            <div className="flex rounded-xl border border-[var(--border-color)] p-1 bg-[var(--bg-app)]">
              <button type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${!isRegister ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                Sign In
              </button>
              <button type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${isRegister ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Full Name</label>
                <div className="login-input-wrap">
                  <User size={14} className="login-input-icon" />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your legal full name"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {/* Quick Advocate Account Picker (Only visible in Advocate Login) */}
            {selectedRole === 'Lawyer' && !isRegister && (
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#202A3B]/40 border border-[#202A3B]/10 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Scale size={13} className="text-[#B69B72] dark:text-[#D9C7A5]" />
                    Select Advocate to Login:
                  </label>
                  <span className="text-[10px] text-[#202A3B] dark:text-[#D9C7A5] font-bold bg-[#B69B72]/20 dark:bg-[#B69B72]/30 px-2 py-0.5 rounded-full">
                    Theni District Court
                  </span>
                </div>

                {/* Direct 1-click button for Advocate A. Sundaramurthy */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('lawyer17@sevenseas.com');
                    setPassword('Admin@1234');
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    email === 'lawyer17@sevenseas.com' || email.toLowerCase().includes('sundaramurthy')
                      ? 'bg-[#202A3B] text-white border-[#B69B72] shadow-sm shadow-[#B69B72]/20 ring-2 ring-[#B69B72]/40'
                      : 'bg-white dark:bg-[#1B2332] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#B69B72]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#B69B72]">⭐</span>
                    <strong>Advocate A. Sundaramurthy</strong>
                  </span>
                  <span className="text-[10.5px] opacity-80 font-normal">Sub Court Periyakulam</span>
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
                      }
                    }}
                    className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B2332] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B69B72] cursor-pointer"
                  >
                    <option value="">-- Or choose from all 30 Theni Advocates --</option>
                    {THENI_ADVOCATE_LOGINS.map(adv => (
                      <option key={adv.email} value={adv.email}>
                        {adv.name} — {adv.spec} ({adv.court})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
                  placeholder={selectedRole === 'Lawyer' ? 'e.g., Advocate A. Sundaramurthy or lawyer17@sevenseas.com' : (selectedRole === 'Admin' ? 'admin@domain.com' : 'you@example.com')}
                  className="login-input"
                />
              </div>
            </div>

            {isRegister && (
              <div className="login-field">
                <label className="login-label">Mobile Number</label>
                <div className="login-input-wrap">
                  <Shield size={14} className="login-input-icon" />
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="login-input"
                  />
                </div>
              </div>
            )}

            {isRegister && selectedRole === 'Lawyer' && (
              <div className="grid grid-cols-2 gap-3">
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
                  <input type="number" required min="0" max="60" value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    placeholder="e.g. 5" className="login-input"
                  />
                </div>
              </div>
            )}

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
                  required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="login-input pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Demo credentials */}
            {!isRegister && (
              <div className="login-demo-box">
                <Sparkles size={12} className="text-[#B69D74] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10.5px] font-bold text-[var(--text-secondary)]">Demo credentials active</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Default password: <code className="font-mono bg-[var(--border-color)] px-1.5 py-0.5 rounded text-[var(--text-primary)]">Admin@1234</code>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="login-error">
                <AlertCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {selectedRole === 'Admin' && (
              <div className="login-admin-notice">
                <Lock size={11} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium">Only <code className="font-mono">gokulrams.cs23@bitsathy.ac.in</code> holds Admin authority.</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="login-submit-btn w-full"
              style={{ background: role?.grad, boxShadow: `0 4px 20px ${role?.color}40` }}
            >
              {success ? (
                <><CheckCircle size={15} /> Authentication Successful</>
              ) : loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying…</>
              ) : (
                <>{isRegister ? 'Create Account' : `Sign In as ${role?.label}`} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-[11.5px] text-[var(--text-muted)]">
            <Link to="/" className="font-semibold hover:underline" style={{ color: role?.color }}>
              ← Back to homepage
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
