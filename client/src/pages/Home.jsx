import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Scale, Shield, Users, Calendar,
  Sparkles, BarChart2, FileText, CheckCircle, Mail, MapPin, Phone, MessageSquare, Send,
  Star, Zap, Globe, Lock, TrendingUp, Award, ShieldCheck, CheckCircle2,
  Clock, FileCheck, ChevronDown, ExternalLink, Search, Check, Layers,
  ChevronRight, ArrowUpRight, HelpCircle, Activity, Compass, BookOpen,
  Gavel, Landmark, ShieldAlert, BadgePercent, FileSearch, KeyRound,
  Filter, CheckSquare, RefreshCw, Smartphone, HeartHandshake, Eye,
  UserCheck, Smile, Heart, MessageCircleQuestion, MessagesSquare, Sparkle,
  PhoneCall, ShieldQuestion, UserCheck2, Quote
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../contexts/AuthContext';
import InteractiveCanvasBackground from '../components/InteractiveCanvasBackground';

/* ─── Animated Number Counter Hook ─── */
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const isDecimal = String(target).includes('.');
    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = eased * numericTarget;
      setCount(isDecimal ? current.toFixed(1) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [start, target, duration]);
  return count;
};

/* ─── Humanized Stat Item ─── */
const StatItem = ({ value, label, subtext, icon: Icon, color, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const suffix = String(value).replace(/[0-9.]/g, '');
  const numericVal = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const count = useCounter(numericVal, 2200, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-md backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={22} />
        </div>
        <span className="text-[10.5px] font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Audited & Verified
        </span>
      </div>
      <div className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
        {visible ? count : 0}{suffix}
      </div>
      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{label}</div>
      {subtext && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{subtext}</div>}
    </motion.div>
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Eligibility Calculator States
  const [calcIncome, setCalcIncome] = useState('low'); // 'low' (<1.5L), 'mid' (1.5L-3L), 'midhigh' (3L-5L), 'high' (>5L)
  const [calcCategory, setCalcCategory] = useState('women_sc_st'); // 'women_sc_st', 'general_ews', 'senior', 'general'
  const [calcDispute, setCalcDispute] = useState('property');
  
  // Precedents Preview Filter
  const [precedentCategory, setPrecedentCategory] = useState('All');
  
  // Advocate Filter
  const [advocateSpecialization, setAdvocateSpecialization] = useState('All');

  // FAQ States
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', caseNumber: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', phone: '', caseNumber: '', message: '' });
      setContactSubmitted(false);
      alert('Thank you for reaching out to Seven Seas Legal Aid. A dedicated legal support coordinator will contact you directly within 24 hours.');
    }, 1200);
  };

  // Humanized Eligibility Assessment Logic
  const getEligibilityResult = () => {
    if (calcIncome === 'low' || calcCategory === 'women_sc_st') {
      return {
        rate: '100% Free Legal Aid',
        status: 'Full Government Subsidy',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        headline: 'Great news! You are entitled to complete free legal representation.',
        details: 'Under Section 12 of the Legal Services Authorities Act (Article 39A), the government fully covers your advocate fees, court e-filing charges, and legal documentation. You pay absolutely zero rupees out of pocket.',
        scheme: 'National & State Legal Services (NALSA / DLSA)'
      };
    } else if (calcIncome === 'mid' || calcCategory === 'general_ews' || calcCategory === 'senior') {
      return {
        rate: '75% Subsidized Aid',
        status: 'High Government Assistance',
        badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        headline: 'You qualify for substantial government subsidy.',
        details: 'Your case qualifies for the Subsidized Legal Retainer Program. Standard advocate rates are capped at nominal honorarium rates, with complete escrow transparency.',
        scheme: 'State Judicial Access Subsidy'
      };
    } else if (calcIncome === 'midhigh') {
      return {
        rate: 'Pro Bono & Capped Retainer',
        status: 'Standard Escrow Protection',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        headline: 'Access vetted counsel with transparent capped fees.',
        details: 'You can choose from our curated network of High Court and Supreme Court advocates under transparent milestone pricing held in protected judicial escrow.',
        scheme: 'Seven Seas Verified Advocate Panel'
      };
    } else {
      return {
        rate: 'Standard Retainer Panel',
        status: 'Direct Advocate Booking',
        badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        headline: 'Direct access to senior advocates and specialized counsel.',
        details: 'Connect directly with senior legal counsel across all High Courts with guaranteed milestone protection and private document vaults.',
        scheme: 'Seven Seas Senior Legal Counsel'
      };
    }
  };

  const eligibility = getEligibilityResult();

  // Precedents Data in Plain English
  const precedents = [
    { 
      id: 1, 
      category: 'Land & Property',
      title: 'State of Maharashtra v. Union Land Registry (2024)', 
      citation: 'SC 482/2024 • 3-Judge Bench', 
      outcome: 'Partition Title Upheld', 
      match: '98% relevance',
      summary: 'Ancestral land partition cannot be delayed or denied by government revenue offices if family mutation records exist.'
    },
    { 
      id: 2, 
      category: 'Constitutional',
      title: 'National Legal Services Authority v. Union of India (2023)', 
      citation: 'SC 802/2023 • Constitutional Bench', 
      outcome: 'Subsidized Aid Mandate', 
      match: '96% relevance',
      summary: 'Reaffirmed that financial hardship must never prevent any citizen from receiving competent, senior courtroom defense.'
    },
    { 
      id: 3, 
      category: 'Criminal Defense',
      title: 'Ramesh Sharma v. State Criminal Investigation Bureau (2024)', 
      citation: 'SC 119/2024 • Criminal Appellate Bench', 
      outcome: 'Statutory Bail Granted', 
      match: '94% relevance',
      summary: 'Citizens have an inviolable right to default bail if preliminary police charges are not submitted within statutory deadlines.'
    },
    { 
      id: 4, 
      category: 'Workplace & Labor',
      title: 'Federation of Tech Workers v. Apex Services Corp (2023)', 
      citation: 'SC 651/2023 • Division Bench', 
      outcome: 'Unlawful Termination Overturned', 
      match: '92% relevance',
      summary: 'Sudden employment termination without a fair 30-day inquiry violates fundamental natural justice principles.'
    },
    { 
      id: 5, 
      category: 'Family & Custody',
      title: 'Ananya Singhania v. Aditya Singhania (2024)', 
      citation: 'SC 531/2024 • Family Welfare Bench', 
      outcome: 'Mutual Consent Fast-Tracked', 
      match: '91% relevance',
      summary: 'The 6-month statutory waiting period can be waived when both spouses reach an amicable settlement and custody agreement.'
    },
    { 
      id: 6, 
      category: 'Consumer & Banking',
      title: 'Kavita Iyer v. Central Digital Banking Authority (2024)', 
      citation: 'SC 294/2024 • High Court Referral', 
      outcome: 'Full Financial Restitution', 
      match: '95% relevance',
      summary: 'Banks are strictly responsible to refund citizens when unauthorized cyber theft occurs without customer fault.'
    }
  ];

  const filteredPrecedents = precedentCategory === 'All' 
    ? precedents 
    : precedents.filter(p => p.category === precedentCategory);

  // Featured Lawyers with Human Philosophy & Details
  const lawyers = [
    {
      id: 'lawyer-1',
      name: 'Aisha Verma',
      title: 'Senior Civil & Family Law Advocate',
      philosophy: '“I believe every family deserves dignity, patience, and a fair resolution to their property and marital disputes.”',
      experience: 14,
      rating: 4.9,
      reviews: 218,
      winRate: 96,
      location: 'New Delhi (Supreme Court & Delhi HC)',
      specialization: 'Civil & Property',
      languages: 'English, Hindi, Punjabi',
      initials: 'AV',
      color: '#2563EB',
      barCouncilId: 'D/1942/2012'
    },
    {
      id: 'lawyer-2',
      name: 'Rohan Mehta',
      title: 'Criminal Defense & Human Rights Counsel',
      philosophy: '“Standing firmly with citizens to protect liberty, constitutional bail rights, and fair trial procedures.”',
      experience: 18,
      rating: 4.8,
      reviews: 264,
      winRate: 94,
      location: 'Mumbai (Bombay High Court)',
      specialization: 'Criminal Defense',
      languages: 'English, Hindi, Marathi',
      initials: 'RM',
      color: '#0284C7',
      barCouncilId: 'MAH/5821/2008'
    },
    {
      id: 'lawyer-3',
      name: 'Nidhi Sharma',
      title: 'Employment, Tech & Consumer Rights Advisor',
      philosophy: '“Helping working individuals stand up against wrongful termination, wage denial, and corporate overreach.”',
      experience: 11,
      rating: 4.9,
      reviews: 172,
      winRate: 92,
      location: 'Bengaluru (Karnataka High Court)',
      specialization: 'Workplace & Tech',
      languages: 'English, Hindi, Kannada',
      initials: 'NS',
      color: '#8B5CF6',
      barCouncilId: 'KAR/3490/2015'
    },
    {
      id: 'lawyer-4',
      name: 'Vikramaditya Rao',
      title: 'Constitutional & Public Interest Counsel',
      philosophy: '“Dedicated to bringing state subsidies and free legal representation to rural and underprivileged citizens.”',
      experience: 22,
      rating: 4.9,
      reviews: 310,
      winRate: 97,
      location: 'Hyderabad (Telangana HC & SC)',
      specialization: 'Constitutional',
      languages: 'English, Hindi, Telugu',
      initials: 'VR',
      color: '#059669',
      barCouncilId: 'TS/1209/2004'
    }
  ];

  const filteredLawyers = advocateSpecialization === 'All'
    ? lawyers
    : lawyers.filter(l => l.specialization.includes(advocateSpecialization));

  // FAQs in Plain, Human Terms
  const allFaqs = [
    { 
      cat: 'Free Legal Aid',
      q: 'Can I really get 100% free legal help without paying advocate fees?', 
      a: 'Yes, absolutely. Under Article 39A of the Constitution and Section 12 of the Legal Services Authorities Act, women, children, members of SC/ST communities, persons with disabilities, and citizens earning below state income thresholds receive 100% free legal defense. The government directly funds all advocate fees and court filing expenses.' 
    },
    { 
      cat: 'Getting Started',
      q: 'What happens after I submit my case on this portal?', 
      a: 'Once you fill out our simple 3-minute intake, our legal desk reviews your documents within 24 hours. We verify your eligibility and connect you with a verified, experienced advocate who specializes in your exact dispute. You receive their direct contact details and schedule your first consultation.' 
    },
    { 
      cat: 'Privacy & Safety',
      q: 'Will my family, employer, or the opposing party find out that I applied?', 
      a: 'No. All case submissions, identity papers, and private documents are protected by strict attorney-client privilege and 256-bit encryption. Only you, your assigned advocate, and the court registrar have access.' 
    },
    { 
      cat: 'Costs & Fees',
      q: 'What if my income is slightly higher than the free legal aid limit?', 
      a: 'Even if you do not qualify for 100% free aid, you qualify for our Subsidized Retainer Panel. Advocate fees are pre-agreed at capped, transparent honorarium rates and held safely in judicial escrow until work is completed.' 
    },
    { 
      cat: 'Court Hearings',
      q: 'How will I know when my court hearing or judge order is scheduled?', 
      a: 'You will receive automatic SMS and WhatsApp alerts whenever your hearing date, courtroom room number, or judge order is updated. You can also view your full timeline anytime from your personal citizen dashboard.' 
    },
    { 
      cat: 'Free Legal Aid',
      q: 'What documents do I need to prepare before applying?', 
      a: 'You only need an identity proof (such as Aadhaar Card, Voter ID, or Ration Card), an income certificate or self-attested declaration, and any papers related to your issue (like property documents, notice letters, or police reports).' 
    }
  ];

  const filteredFaqs = allFaqs.filter(f => {
    const matchCat = activeFaqCategory === 'All' || f.cat === activeFaqCategory;
    const matchSearch = f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = [
    { value: '54200+', label: 'Citizens Supported', subtext: '96.4% on-time resolution across High Courts', icon: HeartHandshake, color: '#2563EB', delay: 0 },
    { value: '4850+',  label: 'Dedicated Advocates', subtext: 'Verified Bar Council members ready to guide you', icon: Users, color: '#0284C7', delay: 0.1 },
    { value: '98.2%',  label: 'Citizen Satisfaction', subtext: 'Based on over 14,000 genuine case reviews', icon: Smile, color: '#10B981', delay: 0.2 },
    { value: '₹0',     label: 'Legal Aid Intake Cost', subtext: 'Free constitutional assistance for eligible citizens', icon: ShieldCheck, color: '#8B5CF6', delay: 0.3 },
  ];

  // Genuine Citizen Stories
  const testimonials = [
    {
      name: 'Sunita Devi',
      location: 'Pune, Maharashtra',
      caseType: 'Family Land Partition',
      timeTaken: 'Resolved in 45 Days',
      advocate: 'Adv. Aisha Verma',
      quote: 'We had been running from pillar to post for 7 years to partition our ancestral family farmland. Seven Seas verified my free legal aid in 1 day and assigned Advocate Aisha Verma. She treated me with immense respect and resolved our decree peacefully.',
      rating: 5,
      subsidy: '100% Free Legal Aid'
    },
    {
      name: 'Karthik Ramanathan',
      location: 'Chennai, Tamil Nadu',
      caseType: 'Unfair Workplace Termination',
      timeTaken: 'Reinstated in 28 Days',
      advocate: 'Adv. Nidhi Sharma',
      quote: 'When my company terminated me without notice, I felt completely powerless. The transparent guidance, clear precedent research, and compassionate advocate gave me my job and dignity back.',
      rating: 5,
      subsidy: 'Subsidized Legal Aid'
    },
    {
      name: 'Harpreet Singh',
      location: 'Amritsar, Punjab',
      caseType: 'Emergency Bail & Family Support',
      timeTaken: 'Bail in < 72 Hours',
      advocate: 'Adv. Rohan Mehta',
      quote: 'When my brother was wrongfully detained without reason, Advocate Rohan Mehta took charge immediately. He explained everything in simple Punjabi to our mother and got bail before the weekend.',
      rating: 5,
      subsidy: '100% Free Legal Aid'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 overflow-x-hidden font-sans selection:bg-blue-500/20">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          1. HERO SECTION (CENTERED, CLEAN & PRESTIGIOUS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Canvas Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25 dark:opacity-40">
          <InteractiveCanvasBackground density={50} maxDistance={120} speed={0.35} interactive={true} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center space-y-7">
          
          {/* Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Government Certified • Article 39A Free Legal Aid Portal</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#202A3B] dark:text-white leading-[1.08]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Legal Help That Feels Human,{' '}
            <span className="bg-gradient-to-r from-[#B69B72] via-[#D9C7A5] to-[#9A7E55] bg-clip-text text-transparent drop-shadow-sm">
              Fair, and Within Reach.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto"
          >
            When legal troubles arise, stress and confusion shouldn't stand in your way. We connect everyday citizens with caring, verified advocates and 100% state-funded legal defense — with empathy, transparency, and dignity.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link to="/register">
              <button className="btn-gold px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl shadow-[#B69B72]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group">
                <Sparkles size={18} className="text-[#FAF8F3] group-hover:rotate-12 transition-transform" />
                Apply for Free Legal Aid (₹0)
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <a href="#calculator">
              <button className="px-7 py-4 rounded-2xl bg-white dark:bg-[#1B2332] hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B] border border-[#202A3B]/10 dark:border-white/10 text-[#202A3B] dark:text-slate-100 font-bold text-sm shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md">
                <BadgePercent size={18} className="text-[#B69B72]" />
                Check Subsidy (30s)
              </button>
            </a>

            <Link to="/marketplace">
              <button className="px-7 py-4 rounded-2xl bg-transparent hover:bg-[#FAF9F5] dark:hover:bg-[#202A3B]/50 border border-slate-200/80 dark:border-slate-800 text-[#202A3B] dark:text-slate-200 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer">
                <Scale size={18} className="text-[#B69B72]" />
                Browse Lawyers
              </button>
            </Link>
          </motion.div>

          {/* Social Proof & Human Trust Avatar Stack */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/80"
          >
            <div className="flex -space-x-2.5 overflow-hidden">
              {[
                { bg: '#2563EB', text: 'SD' },
                { bg: '#0284C7', text: 'KR' },
                { bg: '#8B5CF6', text: 'HS' },
                { bg: '#10B981', text: 'AV' },
              ].map((av, idx) => (
                <div 
                  key={idx} 
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-xs"
                  style={{ background: av.bg }}
                >
                  {av.text}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
                <span className="font-bold text-slate-900 dark:text-white ml-1">4.9 / 5</span>
              </div>
              <span className="font-medium">Trusted by 54,000+ citizens with dedicated legal counsel</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. IMPACT NUMBERS (PEOPLE-CENTRIC REPUTATION)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. HUMAN VALUES GRID ("WHY CITIZENS TRUST US")
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6 text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
              <Heart size={13} className="text-rose-500" />
              Built for Everyday Citizens
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Why Finding Legal Help Here Feels Different
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We took away the intimidation, hidden charges, and cold bureaucracy so you can get the support you deserve.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                title: 'In Plain Everyday Words', 
                desc: 'No confusing legal jargon. Everything is explained clearly in your preferred language so you stay in full control.', 
                icon: BookOpen, 
                color: '#2563EB' 
              },
              { 
                title: 'Zero Hidden Charges', 
                desc: '100% free under Article 39A for eligible citizens, or clearly capped milestone rates held safely in escrow.', 
                icon: ShieldCheck, 
                color: '#10B981' 
              },
              { 
                title: 'Lawyers Who Truly Care', 
                desc: 'Every advocate on our panel is vetted for both courtroom capability and genuine empathy toward citizens.', 
                icon: HeartHandshake, 
                color: '#8B5CF6' 
              },
              { 
                title: 'Always Kept in the Loop', 
                desc: 'Receive direct SMS & WhatsApp reminders on upcoming court dates, evidence papers, and judge orders.', 
                icon: Smartphone, 
                color: '#0284C7' 
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-md relative group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-xs transition-transform group-hover:scale-105"
                      style={{ background: `${card.color}15`, color: card.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. CONVERSATIONAL LEGAL AID SUBSIDY CALCULATOR
      ══════════════════════════════════════════════════════════════ */}
      <section id="calculator" className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              <BadgePercent size={14} />
              Instant 30-Second Check
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Check Your Legal Aid Subsidy in 30 Seconds
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Find out whether the government covers your advocate fees under the Legal Services Authorities Act (Article 39A).
            </p>
          </div>

          {/* Interactive Calculator Box */}
          <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-12 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
            
            {/* Left Column: 3 Friendly Questions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Question 1: Income Bracket */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  What is your annual household income?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'low', label: 'Below ₹1.5 Lakhs / year', sub: 'Standard BPL / EWS' },
                    { id: 'mid', label: '₹1.5L – ₹3.0 Lakhs / year', sub: 'Low Income Tier' },
                    { id: 'midhigh', label: '₹3.0L – ₹5.0 Lakhs / year', sub: 'Middle Bracket' },
                    { id: 'high', label: 'Above ₹5.0 Lakhs / year', sub: 'Standard Bracket' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCalcIncome(opt.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        calcIncome === opt.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <p className={`text-xs font-bold ${calcIncome === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Category */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Do any of these categories apply to you?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'women_sc_st', label: 'Women / Children / SC / ST', sub: 'Mandatory 100% Free Aid' },
                    { id: 'general_ews', label: 'Economically Weaker Section', sub: 'Subsidized Government Tier' },
                    { id: 'senior', label: 'Senior Citizen / Differently Abled', sub: 'Priority Fast-Track Panel' },
                    { id: 'general', label: 'General Citizen', sub: 'Standard Transparent Panel' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCalcCategory(opt.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        calcCategory === opt.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <p className={`text-xs font-bold ${calcCategory === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Legal Matter */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  What kind of legal matter is this?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'property', label: 'Land & Property' },
                    { id: 'criminal', label: 'Criminal Defense' },
                    { id: 'family', label: 'Family & Custody' },
                    { id: 'labor', label: 'Workplace & Wages' },
                    { id: 'consumer', label: 'Consumer & Banking' },
                    { id: 'rights', label: 'Fundamental Rights' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCalcDispute(opt.id)}
                      className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                        calcDispute === opt.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <p className="text-xs">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Clear Result Card */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-950 dark:to-blue-950/30 border border-slate-200/90 dark:border-slate-800 text-left space-y-5">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Your Entitlement
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${eligibility.badgeBg}`}>
                    {eligibility.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {eligibility.rate}
                  </h3>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                    Scheme: {eligibility.scheme}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{eligibility.headline}</p>
                  <p>{eligibility.details}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    <span>Free Document Preparation & E-Filing</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    <span>Dedicated Senior Advocate Allocated</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    <span>Continuous Hearing Updates & Support</span>
                  </div>
                </div>
              </div>

              <Link to="/register" className="w-full pt-3">
                <button className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                  <Sparkles size={16} />
                  Claim Your Free Legal Aid Now
                  <ArrowRight size={16} />
                </button>
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. MEET ADVOCATES WHO CARE (HUMANIZED LAWYER DIRECTORY)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6 text-left space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                <Users size={13} />
                Verified Legal Counsel
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Meet Advocates Who Put Citizens First
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                State-verified public defenders and partner advocates ready to listen and represent you.
              </p>
            </div>
            
            <Link to="/marketplace">
              <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 shadow-xs">
                View All Advocates <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Civil & Property', 'Criminal Defense', 'Workplace & Tech', 'Constitutional'].map((spec) => (
              <button
                key={spec}
                onClick={() => setAdvocateSpecialization(spec)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  advocateSpecialization === spec
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Advocate Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredLawyers.map((lawyer) => (
              <div 
                key={lawyer.id}
                className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md"
                      style={{ background: `linear-gradient(135deg, ${lawyer.color}, ${lawyer.color}cc)` }}
                    >
                      {lawyer.initials}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Bar Verified
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{lawyer.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{lawyer.title}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">Bar Reg: {lawyer.barCouncilId}</p>
                  </div>

                  {/* Personal Philosophy Quote */}
                  <p className="text-[11.5px] italic text-slate-600 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {lawyer.philosophy}
                  </p>

                  <div className="space-y-2 py-2 border-y border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Client Rating</span>
                      <div className="flex items-center gap-1.5">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-amber-500 font-bold">{lawyer.rating}</span>
                        <span className="text-slate-400">({lawyer.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Experience</span>
                      <span className="font-bold text-slate-900 dark:text-white">{lawyer.experience} Years</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Languages:</span> {lawyer.languages}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin size={13} className="shrink-0 text-blue-600" /> {lawyer.location}
                  </span>
                  <Link to={`/dashboard/lawyers/${lawyer.id}`} className="block">
                    <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs">
                      Book Consultation
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. REAL CITIZEN STORIES & RESOLUTIONS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6 text-left space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
              <HeartHandshake size={13} />
              Real Stories of Relief
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Real Citizens. Real Justice Delivered.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Discover how free and subsidized legal aid helped everyday families claim what is rightfully theirs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {item.subsidy}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.location} • {item.caseType}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{item.advocate}</span>
                    <span className="text-emerald-600 font-bold">{item.timeTaken}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. PLAIN-ENGLISH PRECEDENTS ARCHIVE
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 text-left space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                <BookOpen size={13} />
                Understand Your Rights
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Supreme Court Precedents in Plain English
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Explore how landmark judgments protect your property, family, bail, and employment rights.
              </p>
            </div>
            
            <Link to="/dashboard/judgments">
              <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                Search Full Database <ArrowUpRight size={15} />
              </button>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Land & Property', 'Constitutional', 'Criminal Defense', 'Workplace & Labor', 'Family & Custody', 'Consumer & Banking'].map((cat) => (
              <button
                key={cat}
                onClick={() => setPrecedentCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  precedentCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Precedent Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrecedents.map((item) => (
              <div 
                key={item.id} 
                className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-500/60 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
                      {item.citation}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {item.match}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Outcome: {item.outcome}
                  </span>
                  <Link to="/dashboard/judgments" className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline">
                    Read Details <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. APPROACHABLE FAQ SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-4xl px-6 text-left space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
              <HelpCircle size={13} />
              Plain Answers to Common Worries
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Here are honest, transparent answers to questions citizens ask us every day:
            </p>
          </div>

          {/* FAQ Search & Category Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search any question (e.g. costs, privacy, documents, hearing dates)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Free Legal Aid', 'Getting Started', 'Privacy & Safety', 'Costs & Fees', 'Court Hearings'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFaqCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeFaqCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3.5">
            {filteredFaqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-xs overflow-hidden backdrop-blur-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left outline-none cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white pr-4">{f.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${activeFaq === i ? 'rotate-180 text-blue-600' : ''}`} 
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          9. NEED TO TALK TO A REAL PERSON? (WARM SUPPORT DESK)
      ══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start text-left">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                <Heart size={13} className="text-rose-500" />
                We Are Here to Listen
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Speak With a Legal Support Coordinator
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Unsure if you qualify for free legal aid? Or need help filling out your case summary? Reach out to our compassionate intake team. We are available 24/7 to guide you.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  { icon: Phone, text: '1800-555-JUSTICE (Toll-Free 24/7 Helpline)', label: 'Emergency Legal Assistance Helpline', color: '#10B981' },
                  { icon: Mail, text: 'helpdesk@sevenseas.gov.in', label: 'Direct Citizen Support Email', color: '#2563EB' },
                  { icon: MapPin, text: 'Supreme Court Judicial Complex, Sector 4, New Delhi', label: 'Central Registrar & Legal Aid Clinic', color: '#8B5CF6' },
                ].map(({ icon: Icon, text, label, color }) => (
                  <div key={text} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Message Box */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leave Us a Message</h3>
                <p className="text-xs text-slate-500 mt-1">A dedicated legal counselor will call or email you back within 24 hours.</p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Your Phone Number</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Case or Docket Number (If Any)</label>
                    <input
                      type="text"
                      value={contactForm.caseNumber}
                      onChange={e => setContactForm({ ...contactForm, caseNumber: e.target.value })}
                      placeholder="e.g. AID-2026-8821"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">How Can We Help You?</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Briefly describe your situation or legal questions..."
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitted}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {contactSubmitted ? 'Sending Your Message...' : 'Send Message to Support Team'}
                  <Send size={14} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          10. HEARTFELT CLOSING CONVERSION BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.25),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-200">
            <Sparkles size={14} /> Constitutional Dignity & Equality
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            You Have Rights. Let Us Help You Claim Them.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of everyday citizens who found peace, fair counsel, and constitutional protection through Seven Seas Legal Aid.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link to="/register">
              <button className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-2xl shadow-blue-600/40 transition hover:scale-105 cursor-pointer flex items-center gap-2">
                <Sparkles size={18} />
                Apply for Free Legal Aid
                <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition hover:scale-105 cursor-pointer">
                Sign In to Portal
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
