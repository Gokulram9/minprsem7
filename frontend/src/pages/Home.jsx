import { useState, useContext, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, Scale, CreditCard, Video,
  ChevronDown, ExternalLink, Shield, Users, Calendar,
  Sparkles, BarChart2, FileText, CheckCircle, Mail, MapPin, Phone, MessageSquare, Send,
  Star, Zap, Globe, Lock, TrendingUp, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../contexts/AuthContext';
import ladyJusticeImg from '../assets/lady-justice.png';

/* ─── Animated Counter Hook ─── */
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

/* ─── Stat Counter Item ─── */
const StatItem = ({ value, label, icon: Icon, color, delay }) => {
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
    <div
      ref={ref}
      className="stat-counter-item group"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="stat-icon-ring" style={{ '--stat-color': color }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="stat-number" style={{ color }}>
        {visible ? count : 0}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

/* ─── Floating Particle ─── */
const Particle = ({ style }) => (
  <div className="particle" style={style} />
);

const Home = () => {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);



  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitted(false);
      alert('Thank you for contacting Seven Seas Support. Our administrative desk will review your query and reply via email.');
    }, 1200);
  };

  const faqs = [
    { q: 'How do I search for a case docket?', a: 'Input the Case Title or Docket Number in the lookup search bar above or sign in to access your custom Case Tracker panel.' },
    { q: 'How are virtual hearings conducted?', a: 'Virtual hearings are hosted securely within the portal browser using encrypted WebRTC streams connecting litigants, advocates, and presiding judges.' },
    { q: 'Who qualifies for Seven Seas legal aid?', a: 'Any citizen with household income below the indigency threshold can apply. Submit address details, income certificate docs, and case outlines for audit.' },
    { q: 'How can I settle pending court fees?', a: 'Access the Pay a Fine utility card to settle citations and legal fees securely via our digital payment gateway.' },
  ];

  const stats = [
    { value: '54200+', label: 'Cases Managed', icon: FileText, color: '#3B82F6', delay: 0 },
    { value: '4850+',  label: 'Verified Lawyers', icon: Users, color: '#B69D74', delay: 0.1 },
    { value: '96.4%',  label: 'Success Rate', icon: TrendingUp, color: '#10B981', delay: 0.2 },
    { value: '24/7',   label: 'Support Desk', icon: Shield, color: '#8B5CF6', delay: 0.3 },
  ];

  const features = [
    { icon: Sparkles,  title: 'AI Advocate Matcher', desc: 'Predictive analytics algorithms pairing claims with vetted counselors based on win records and case expertise.', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { icon: Calendar,  title: 'Integrated Schedulers', desc: 'Real-time conflict-checker hearing calendars that prevent double-booking across courthouse chambers.', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { icon: Shield,    title: 'Legal Aid Tracker', desc: 'Follow application reviews, asset checks, and public defender assignments in a transparent timeline.', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { icon: BarChart2, title: 'Operational Analytics', desc: 'Detailed SVG chart telemetry for judges and advocates to monitor court throughput.', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: FileText,  title: 'Encrypted Doc Vault', desc: 'Secure cloud file system using zero-knowledge architecture to store ID papers and legal proofs.', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { icon: Users,     title: 'Automated Reminders', desc: 'Configured email and text alerts dispatched 24 hours prior to scheduled virtual court dates.', color: '#B69D74', bg: 'rgba(182,157,116,0.1)' },
  ];

  // Particles for hero
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${2 + Math.random() * 4}px`,
    height: `${2 + Math.random() * 4}px`,
    animationDuration: `${4 + Math.random() * 6}s`,
    animationDelay: `${Math.random() * 4}s`,
    opacity: 0.2 + Math.random() * 0.4,
    background: ['#B69D74', '#3B82F6', '#8B5CF6', '#10B981'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* ══════════ HERO SECTION ══════════ */}
      <section id="home" className="hero-section relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="hero-bg-gradient" />
        
        {/* Animated mesh grid */}
        <div className="hero-grid-overlay" />
        
        {/* Floating particles */}
        <div className="particles-container" aria-hidden="true">
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        {/* Ambient blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-36"
        >
          <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            
            {/* Hero Left */}
            <motion.div 
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="hero-badge">
                <div className="hero-badge-dot" />
                <Scale size={12} className="text-[#B69D74]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#B69D74]">
                  Official Justice Portal · Seven Seas Judicial System
                </span>
              </div>

              {/* Headline */}
              <h1 className="hero-headline">
                Equal Justice
                <br />
                <span className="hero-headline-gradient">Under Rule of</span>
                <br />
                <span className="hero-headline-gradient">Law.</span>
              </h1>

              {/* Quote pill */}
              <div className="hero-quote-pill">
                <div className="hero-quote-line" />
                <p className="text-[12px] italic font-medium leading-relaxed text-[var(--text-secondary)]">
                  "Justice is the constant and perpetual will to give to each their due. Delayed justice is denied justice; we make legal representation and case coordination transparent, accessible, and fair for all."
                </p>
              </div>

              <p className="max-w-lg text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Seven Seas coordinates scheduling dockets, matches indigent applicants with qualified advocates, and hosts remote courtroom chambers securely for citizens, lawyers, and administrators.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <button className="hero-cta-primary group">
                    <Sparkles size={14} className="group-hover:animate-spin transition-all duration-300" />
                    Apply for Legal Aid
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="hero-cta-secondary group">
                    Enter Workspace Portal
                    <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { icon: Shield, text: 'SSL Encrypted', color: '#10B981' },
                  { icon: Award, text: 'Court Certified', color: '#B69D74' },
                  { icon: Globe, text: 'Nationwide Access', color: '#3B82F6' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon size={12} style={{ color }} />
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
 
            {/* Hero Right - Live Activity Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative flex justify-center items-center"
            >
              {/* Rotating ring */}
              <div className="rotating-ring-outer" />
              <div className="rotating-ring-inner" />
 
              {/* Main card */}
              <div className="hero-card group glass-card">
                <div className="hero-card-glow" />
                
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10 dark:border-white/5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-extrabold">Live Activity Log</p>
                    <p
                      className="text-lg font-bold mt-0.5"
                      style={{
                        fontFamily: 'var(--font-display)',
                        background: 'linear-gradient(90deg, #B69D74 0%, #E6D5B8 50%, #9A7E55 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'inline-block'
                      }}
                    >
                      Seven Seas Registry
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'AID-992', title: 'Asset Verification Passed', status: 'Approved', color: '#10B981', icon: CheckCircle },
                    { id: 'CRT-105', title: 'Chamber 4 Conflict Resolved', status: 'Scheduled', color: '#3B82F6', icon: Calendar },
                    { id: 'ADV-402', title: 'AI matching score 98%', status: 'Assigned', color: '#8B5CF6', icon: Sparkles },
                    { id: 'DOC-731', title: 'Document vault encrypted', status: 'Secured', color: '#B69D74', icon: Lock },
                  ].map((log, i) => {
                    const Icon = log.icon;
                    return (
                      <div
                        key={i}
                        className="hero-log-item"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="hero-log-icon" style={{ background: `${log.color}20`, color: log.color }}>
                          <Icon size={11} />
                        </div>
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ color: log.color, background: `${log.color}15` }}>{log.id}</span>
                        <div className="flex-1 text-[11px] font-semibold text-white/70 truncate">{log.title}</div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${log.color}20`, color: log.color }}>{log.status}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Mini chart visualization */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-end gap-1 h-10">
                    {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, #3B82F6, #8B5CF6)`,
                          opacity: 0.6 + i * 0.04,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-white/30 mt-1.5 text-center uppercase tracking-widest">Case Resolution Rate — 30 Days</p>
                </div>
              </div>

              {/* Floating accent cards */}
              <div className="floating-accent-card floating-accent-1">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] font-bold text-white">48hr Processing</span>
              </div>
              <div className="floating-accent-card floating-accent-2">
                <Star size={14} className="text-purple-400" />
                <span className="text-[10px] font-bold text-white">AI Powered</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Wave divider */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg-app)" />
          </svg>
        </div>
      </section>

      {/* ══════════ STATS SECTION ══════════ */}
      <section className="stats-section relative py-20">
        <div className="stats-bg-gradient" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="stats-grid"
          >
            {stats.map((s, i) => (
              <StatItem key={s.label} {...s} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ ABOUT SECTION ══════════ */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="about-bg-blob" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.8fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <span className="section-pill section-pill-blue">About Us</span>
              <h2 className="section-headline">
                Delivering Accessible Justice
                <span className="section-headline-accent"> for All Citizens</span>
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Seven Seas is built upon the premise that financial hardship should never bar a citizen from their constitutional right to counsel. We bridge the gap between indigent applicants and certified legal professionals through a high-performance, auditable digital workflow.
              </p>
              <div className="about-quote-box">
                <div className="about-quote-mark">"</div>
                <p className="text-xs italic text-[var(--text-secondary)] font-medium leading-relaxed">
                  Justice is the constant and perpetual will to render to each his due.
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">– Justinian Code</p>
              </div>
              <Link to="/register">
                <button className="hero-cta-primary group mt-2">
                  Start Your Application <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Column 2: Lady Justice Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/10 dark:border-white/5 bg-slate-950/20 max-w-xs mx-auto shrink-0 group"
            >
              <img 
                src={ladyJusticeImg} 
                alt="Lady Justice Illustration" 
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#B69D74]">Equitable Representation</p>
                <p className="text-[11px] font-bold text-white mt-0.5 leading-relaxed">Protecting civil rights & constitutional liberties.</p>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="grid gap-4"
            >
              {[
                { title: 'Accessible Legal Aid', desc: 'Secure portal for low-income citizens to submit documentation and verify income levels securely for public legal support.', icon: Shield, color: '#3B82F6' },
                { title: 'Vetted Lawyer Network', desc: 'A registered database of certified legal defense counsels, advocates, and courtroom public defenders.', icon: Users, color: '#B69D74' },
                { title: 'Cloud-Encrypted Vault', desc: 'Encrypted document management vault with zero-knowledge signatures, fully conforming to national privacy acts.', icon: Lock, color: '#10B981' },
                { title: 'Virtual Courthouse', desc: 'Hosting secure high-definition remote hearings directly in the browser to reduce case delays.', icon: Video, color: '#8B5CF6' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    key={idx} 
                    className="about-feature-card group glass-card"
                  >
                    <div className="about-feature-icon" style={{ background: `${item.color}15`, color: item.color }}>
                      <Icon size={18} />
                    </div>
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--blue-600)] transition-colors">{item.title}</h3>
                    <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                    <div className="about-feature-hover-bar" style={{ background: item.color }} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES SECTION ══════════ */}
      <section id="features" className="features-section py-24 relative overflow-hidden">
        <div className="features-bg" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="section-pill section-pill-purple">Core Features</span>
            <h2 className="section-headline">
              Advanced Judicial
              <span className="section-headline-accent"> Tools</span>
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
              An enterprise-grade legal management platform built for speed, transparency, and trust.
            </p>
          </div>

          {/* Feature tab preview */}
          <div className="features-layout">
            <div className="features-tabs">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.title}
                    onClick={() => setActiveFeature(i)}
                    className={`feature-tab ${activeFeature === i ? 'feature-tab-active' : ''}`}
                    style={activeFeature === i ? { '--tab-color': f.color } : {}}
                  >
                    <div className="feature-tab-icon" style={{ background: activeFeature === i ? f.bg : 'var(--bg-overlay)', color: activeFeature === i ? f.color : 'var(--text-muted)' }}>
                      <Icon size={16} />
                    </div>
                    <div className="text-left">
                      <p className={`text-[12px] font-bold transition-colors ${activeFeature === i ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{f.title}</p>
                    </div>
                    {activeFeature === i && <div className="feature-tab-indicator" style={{ background: f.color }} />}
                  </button>
                );
              })}
            </div>

            <div className="feature-preview">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className={`feature-preview-item ${activeFeature === i ? 'feature-preview-active' : 'feature-preview-hidden'}`}>
                    <div className="feature-preview-icon-large" style={{ background: f.bg, color: f.color }}>
                      <Icon size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-6 mb-3" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                    <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-sm">{f.desc}</p>
                    <div className="feature-preview-bar" style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature grid cards below */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`feature-grid-card group ${activeFeature === i ? 'feature-grid-card-active' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s`, '--card-color': f.color }}
                  onClick={() => setActiveFeature(i)}
                >
                  <div className="feature-grid-icon" style={{ background: f.bg, color: f.color }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-[13px] text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--blue-600)] transition-colors">{f.title}</h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                  <div className="feature-card-accent" style={{ background: f.color }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="hiw-blob-1" />
        <div className="hiw-blob-2" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <span className="section-pill section-pill-gold">Workflow Flowchart</span>
            <h2 className="section-headline">
              Four Steps to
              <span className="section-headline-accent"> Counseling</span>
            </h2>
            <p className="text-[14px] text-[var(--text-muted)]">
              A transparent path from submitting your legal aid request to standing before the courtroom bench.
            </p>
          </div>

          <div className="hiw-grid relative">
            {/* Connection line */}
            <div className="hiw-connector" />
            
            {[
              { step: '01', title: 'Submit Case Details', desc: 'Create an account and outline your claims, uploading income statements and ID papers to the secure doc vault.', icon: FileText, color: '#3B82F6' },
              { step: '02', title: 'Eligibility Verification', desc: 'Our administrative audit desk verifies details against indigency benchmarks, approving aid in under 48 hours.', icon: Shield, color: '#10B981' },
              { step: '03', title: 'AI Match Counselor', desc: 'Our AI Recommendation matching engine scans advocate dockets and assigns the optimal lawyer to represent you.', icon: Sparkles, color: '#8B5CF6' },
              { step: '04', title: 'Schedule Hearing', desc: 'The calendar scheduler resolves chamber conflicts and locks in your remote virtual courtroom hearing date.', icon: Calendar, color: '#B69D74' },
            ].map((stepItem, idx) => {
              const Icon = stepItem.icon;
              return (
                <div key={idx} className="hiw-card group" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="hiw-step-number" style={{ color: `${stepItem.color}30` }}>{stepItem.step}</div>
                  <div className="hiw-icon-ring" style={{ background: `${stepItem.color}15`, color: stepItem.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="hiw-step-circle" style={{ background: stepItem.color }}>
                    <span className="text-white text-[10px] font-black">{idx + 1}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-2 mt-3">{stepItem.title}</h3>
                  <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">{stepItem.desc}</p>
                  <div className="hiw-hover-line" style={{ background: stepItem.color }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="testimonials-section py-24 relative overflow-hidden">
        <div className="testimonials-bg" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <span className="section-pill section-pill-blue">Testimonials</span>
            <h2 className="section-headline">
              Citizen
              <span className="section-headline-accent"> Success Stories</span>
            </h2>
            <p className="text-[14px] text-[var(--text-muted)]">
              Read how Seven Seas has helped citizens across the nation obtain proper legal counsel.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: 'I was facing eviction and had no way to pay a lawyer. Within two days of registering on Seven Seas, I was assigned a pro-bono family advocate who resolved my tenancy lease dispute in Court 1.', author: 'Maria D. Santos', role: 'Tenant Applicant', rating: 5, color: '#3B82F6' },
              { quote: 'An incredible dashboard. I could upload my proof files immediately, track my application status, and join the virtual courtroom meeting directly in my browser. Seamless and secure.', author: 'Ravi Kumar', role: 'Aid Seeker', rating: 5, color: '#B69D74' },
              { quote: 'As a public defender, managing cases was chaotic. The Seven Seas scheduling conflict checker is a game-changer. I receive notifications on my phone, saving hours of courtroom calendar delay.', author: 'Devin Cole, Esq.', role: 'Lawyer Partner', rating: 5, color: '#8B5CF6' },
            ].map((t, idx) => (
              <div key={idx} className="testimonial-card group" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="testimonial-quote-icon" style={{ color: t.color }}>"</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed italic flex-1">"{t.quote}"</p>
                <div className="testimonial-author mt-5">
                  <div className="testimonial-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[var(--text-primary)]">{t.author}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">{t.role}</p>
                  </div>
                </div>
                <div className="testimonial-glow" style={{ background: `radial-gradient(circle at center, ${t.color}15, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ SECTION ══════════ */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-950 relative">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-14 space-y-4">
            <span className="section-pill section-pill-slate">Checklist FAQ</span>
            <h2 className="section-headline">
              Common
              <span className="section-headline-accent"> Inquiries</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`faq-item ${activeFaq === i ? 'faq-item-open' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left outline-none"
                >
                  <span className="text-[13px] font-bold text-[var(--text-primary)] pr-4">{f.q}</span>
                  <div className={`faq-chevron ${activeFaq === i ? 'faq-chevron-open' : ''}`}>
                    <ChevronDown size={15} className="text-[var(--text-muted)]" />
                  </div>
                </button>
                <div className={`faq-answer ${activeFaq === i ? 'faq-answer-open' : ''}`}>
                  <p className="px-6 pb-5 text-[12.5px] text-[var(--text-muted)] leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT SECTION ══════════ */}
      <section id="contact" className="contact-section py-24 relative overflow-hidden">
        <div className="contact-bg" />
        <div className="contact-blob-1" />
        <div className="contact-blob-2" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <div className="space-y-7">
              <span className="section-pill section-pill-gold">Contact Us</span>
              <h2 className="section-headline">
                Reach the
                <span className="section-headline-accent"> Administrative Desk</span>
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Have questions regarding legal aid eligibility thresholds, verified lawyer onboarding, or technical virtual chambers access? Complete the form to open a support ticket.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'support@sevenseas.gov', color: '#3B82F6' },
                  { icon: Phone, text: '+1 (800) 555-0199', color: '#10B981' },
                  { icon: MapPin, text: 'Supreme Court Plaza, Judicial Wing Suite 400', color: '#B69D74' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="contact-info-item group">
                    <div className="contact-icon" style={{ background: `${color}15`, color }}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-form-panel">
              <div className="contact-form-header">
                <MessageSquare size={18} className="text-[#B69D74]" />
                <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Send a Secure Query</h3>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4 mt-5">
                <div className="contact-field">
                  <label className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="form-input contact-input"
                  />
                </div>
                <div className="contact-field">
                  <label className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="form-input contact-input"
                  />
                </div>
                <div className="contact-field">
                  <label className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest">Message Inquiry</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="State details of your aid file or portal registration query..."
                    className="form-input contact-input resize-none py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitted}
                  className="hero-cta-primary w-full justify-center"
                >
                  {contactSubmitted ? 'Submitting...' : 'Submit Support Ticket'}
                  <Send size={13} className="ml-1" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="cta-banner-section relative overflow-hidden py-20">
        <div className="cta-banner-bg" />
        <div className="cta-banner-particles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="cta-particle" style={{ left: `${12 + i * 12}%`, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#B69D74]/30 bg-[#B69D74]/10 px-4 py-1.5">
            <Scale size={13} className="text-[#B69D74]" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#B69D74]">Seven Seas Justice Portal</span>
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Justice Shouldn't Be a
            <br />
            <span className="cta-gradient-text">Privilege.</span> It's Your Right.
          </h2>
          <p className="text-[15px] text-white/60 max-w-xl mx-auto leading-relaxed">
            Join thousands of citizens who've accessed fair legal representation through Seven Seas. Apply today — it's free, secure, and takes under 5 minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <button className="cta-button-primary group">
                <Sparkles size={15} />
                Apply for Legal Aid
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="cta-button-secondary">
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
