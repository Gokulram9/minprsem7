import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock, Star, MapPin, Calendar,
  Video, Award, GraduationCap, MessageSquare, Globe,
  TrendingUp, Shield, Zap, ChevronRight, Heart, Share2,
  Phone, Mail, Users, Briefcase
} from 'lucide-react';
import { lawyers } from '../data/lawyersData';

/* Circular progress meter */
const CircleProgress = ({ value, max = 100, color, size = 80, label, sub }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (value / max) * circ;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(progress), 200);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <div className="lp-circle-meter">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - animated}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="lp-circle-inner">
        <span className="lp-circle-value" style={{ color }}>{value}{max === 100 ? '%' : ''}</span>
      </div>
      <p className="lp-circle-label">{label}</p>
      {sub && <p className="lp-circle-sub">{sub}</p>}
    </div>
  );
};

const LawyerProfile = () => {
  const { lawyerId } = useParams();
  const lawyer = lawyers.find(item => item.id === lawyerId);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booked, setBooked] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = heroRef.current?.closest('.main-content');
    if (!el) return;
    const handler = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  if (!lawyer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <Scale size={48} className="text-[var(--text-muted)] opacity-30" />
        <h1 className="text-[18px] font-bold text-[var(--text-primary)]">Lawyer not found</h1>
        <p className="text-[13px] text-[var(--text-muted)]">Please return to the directory and select another profile.</p>
        <Link to="/dashboard/find-lawyers" className="hero-cta-primary">← Return to Directory</Link>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedSlot) return;
    setBooked(true);
  };

  const ACCENT = '#3B82F6';

  return (
    <div className="lp-page space-y-6">

      {/* ── BACK BUTTON ── */}
      <Link to="/dashboard/find-lawyers" className="lp-back-btn group inline-flex">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </Link>

      {/* ══ HERO BANNER ══ */}
      <div ref={heroRef} className="lp-hero relative overflow-hidden">
        {/* Decorative bg */}
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-blob" style={{ background: `radial-gradient(circle, ${ACCENT}15, transparent 70%)` }} />

        {/* Top gradient bar */}
        <div className="lp-hero-topbar" style={{ background: `linear-gradient(90deg, ${ACCENT}, #8B5CF6, #B69D74)` }} />

        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile photo with rings */}
            <div className="lp-avatar-section relative shrink-0">
              <div className="lp-avatar-ring-outer" style={{ borderColor: `${ACCENT}20` }} />
              <div className="lp-avatar-ring-inner" style={{ borderColor: `${ACCENT}35` }} />
              <div className="lp-avatar-wrap">
                <img src={lawyer.image} alt={lawyer.name} className="lp-avatar-img" />
              </div>
              {/* Verified badge */}
              <div className="lp-verified-badge" style={{ background: ACCENT }}>
                <Shield size={12} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="lp-status-badge" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                  {lawyer.status} Advocate
                </span>
                {lawyer.location && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                    <MapPin size={12} /> {lawyer.location}
                  </span>
                )}
              </div>

              <div>
                <h1 className="lp-hero-name">{lawyer.name}</h1>
                <p className="lp-hero-title">{lawyer.title}</p>
              </div>

              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">{lawyer.bio}</p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: `${lawyer.rating} Rating`, color: '#F59E0B' },
                  { icon: TrendingUp, label: `${lawyer.successRate}% Win Rate`, color: '#10B981' },
                  { icon: Briefcase, label: `${lawyer.casesWon}+ Cases Won`, color: ACCENT },
                  { icon: Clock, label: lawyer.responseTime || '< 24hr Response', color: '#8B5CF6' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="lp-quick-stat">
                    <Icon size={13} style={{ color }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setIsFav(!isFav)}
                  className={`lp-action-btn ${isFav ? 'lp-fav-active' : ''}`}
                >
                  <Heart size={14} className={isFav ? 'fill-current' : ''} />
                  {isFav ? 'Saved' : 'Save'}
                </button>
                <button className="lp-action-btn">
                  <Share2 size={14} />
                  Share
                </button>
                <button className="lp-action-btn">
                  <MessageSquare size={14} />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="lp-tabs">
        {['overview', 'credentials', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`lp-tab-btn ${activeTab === tab ? 'lp-tab-active' : ''}`}
            style={activeTab === tab ? { color: ACCENT, borderBottomColor: ACCENT } : {}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ══ BODY ══ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Performance Metrics */}
          <div className="lp-card">
            <div className="lp-card-header">
              <TrendingUp size={16} style={{ color: ACCENT }} />
              <h3 className="lp-card-title">Performance Metrics</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4">
              <CircleProgress value={lawyer.successRate} color="#10B981" label="Win Rate" sub="Case success" />
              <CircleProgress value={Math.round((lawyer.rating / 5) * 100)} color={ACCENT} label="Client Rating" sub={`${lawyer.rating}/5 stars`} />
              <CircleProgress value={Math.min(lawyer.casesWon, 100)} color="#8B5CF6" label="Cases Won" sub={`${lawyer.casesWon}+ total`} />
            </div>

            {/* Progress bars */}
            <div className="mt-6 space-y-3">
              {[
                { label: 'Civil Cases', value: 82, color: '#3B82F6' },
                { label: 'Criminal Defense', value: 68, color: '#8B5CF6' },
                { label: 'Settlement Success', value: 91, color: '#10B981' },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)] font-semibold">{label}</span>
                    <span className="font-bold text-[var(--text-primary)]">{value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${value}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Introduction */}
          <div className="lp-card">
            <div className="lp-card-header">
              <Video size={16} style={{ color: ACCENT }} />
              <h3 className="lp-card-title">Introduction Video</h3>
            </div>
            <div className="lp-video-wrap mt-4">
              {videoPlaying ? (
                <div className="lp-video-playing">
                  <Video className="h-10 w-10 text-[#3B82F6] animate-pulse" />
                  <p className="mt-3 text-[12px] font-semibold text-white/70">Streaming introduction…</p>
                  <button onClick={() => setVideoPlaying(false)} className="lp-video-close-btn mt-4">
                    Close Player
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                    alt="Courtroom"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1626]/80 to-transparent" />
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="lp-play-btn relative z-10"
                    style={{ background: ACCENT, boxShadow: `0 0 30px ${ACCENT}50` }}
                  >
                    <Video size={22} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 text-center relative z-10">
                    <p className="text-[11px] text-white/60 font-semibold">Click to play introduction</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="lp-card">
              <div className="lp-card-header">
                <GraduationCap size={15} className="text-[#3B82F6]" />
                <h4 className="lp-card-title text-[13px]">Education</h4>
              </div>
              <p className="text-[12px] font-bold text-[var(--text-primary)] mt-3">{lawyer.education}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{lawyer.courtPractice}</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-header">
                <Award size={15} className="text-[#8B5CF6]" />
                <h4 className="lp-card-title text-[13px]">Achievements</h4>
              </div>
              <ul className="space-y-2 mt-3">
                {(lawyer.achievements || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11.5px] text-[var(--text-secondary)]">
                    <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: Booking ── */}
        <aside className="space-y-4">
          <div className="lp-booking-card relative">
            {/* Success overlay */}
            {booked && (
              <div className="lp-booking-success">
                <div className="lp-success-icon">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-[15px] font-bold mt-3 text-[var(--text-primary)]">Consultation Requested!</h3>
                <p className="text-[11.5px] text-[var(--text-muted)] mt-1 leading-relaxed text-center">
                  Request for <strong>"{selectedSlot}"</strong> has been sent to {lawyer.name}. You'll be notified shortly.
                </p>
                <button onClick={() => setBooked(false)} className="mt-4 text-[11px] text-[var(--blue-600)] font-semibold hover:underline">
                  Book another slot
                </button>
              </div>
            )}

            {/* Booking header */}
            <div className="lp-booking-header" style={{ background: `linear-gradient(135deg, ${ACCENT}10, transparent)` }}>
              <div className="lp-booking-badge">
                <Calendar size={12} style={{ color: ACCENT }} />
                <span>Consultation Calendar</span>
              </div>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mt-1">Book Appointment</h3>
            </div>

            {/* Fees breakdown */}
            <div className="lp-fees-block mt-4">
              {[
                { label: 'Response Speed', value: lawyer.responseTime || '< 48hr' },
                { label: 'Consultation Rate', value: `$${lawyer.fee}/session` },
                { label: 'Docket Filing', value: `$${lawyer.fees?.filing || 200}` },
                { label: 'Legal Aid Eligible', value: 'Yes', highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="lp-fee-row">
                  <span className="lp-fee-label">{label}</span>
                  <span className={`lp-fee-value ${highlight ? 'text-emerald-500' : ''}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Slots */}
            <div className="mt-5">
              <p className="lp-slots-label">
                <Calendar size={11} style={{ color: ACCENT }} />
                Available Consultation Slots
              </p>
              <div className="mt-3 grid gap-2">
                {(lawyer.availableSlots || []).map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`lp-slot-btn ${selectedSlot === slot ? 'lp-slot-selected' : ''}`}
                    style={selectedSlot === slot ? {
                      background: `${ACCENT}12`,
                      border: `1.5px solid ${ACCENT}`,
                      color: ACCENT,
                    } : {}}
                  >
                    <Calendar size={12} />
                    {slot}
                    {selectedSlot === slot && <CheckCircle2 size={12} className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Book button */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleBooking}
                className="w-full lp-book-btn"
                style={selectedSlot ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, boxShadow: `0 4px 16px ${ACCENT}35` } : {}}
                disabled={!selectedSlot}
              >
                {selectedSlot ? 'Confirm Appointment' : 'Select a Slot First'}
                {selectedSlot && <ChevronRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('ai-chat-recommend', { detail: lawyer }))}
                className="lp-ai-chat-btn w-full"
              >
                <Zap size={13} className="text-[#8B5CF6]" />
                Start AI Aid Consultation
              </button>
            </div>
          </div>

          {/* Contact card */}
          <div className="lp-card">
            <p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-[var(--text-muted)] mb-3">Contact</p>
            <div className="space-y-2">
              {[
                { icon: Globe, label: 'Languages', value: 'English, Hindi' },
                { icon: Users, label: 'Clients Served', value: '200+' },
                { icon: Clock, label: 'Avg. Resolution', value: '4-6 months' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                    <Icon size={12} style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">{label}</p>
                    <p className="text-[12px] font-bold text-[var(--text-primary)]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LawyerProfile;
