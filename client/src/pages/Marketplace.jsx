import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, MapPin, Calendar, Heart, Star, Award, Sparkles,
  Clock, ShieldCheck, DollarSign, Search, Filter, ArrowRight,
  TrendingUp, Users, Briefcase, Globe, CheckCircle, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { lawyers } from '../data/lawyersData';

/* ── Animated counter ── */
const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [start, target, duration]);
  return count;
};

/* ── Category Pills ── */
const CATEGORIES = ['All', 'Civil Law', 'Criminal Defense', 'Family Law', 'Property', 'Corporate', 'Human Rights'];

const Marketplace = () => {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredLawyers = lawyers.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' ||
      l.specialization.toLowerCase().includes(activeCategory.toLowerCase()) ||
      l.title?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const c1 = useCounter(filteredLawyers.length, 1500, statsVisible);
  const c2 = useCounter(98, 1800, statsVisible);
  const c3 = useCounter(4850, 2000, statsVisible);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-x-hidden">
      <Navbar />

      {/* ══════════ HERO HEADER ══════════ */}
      <section className="marketplace-hero relative overflow-hidden">
        <div className="marketplace-hero-bg" />
        <div className="marketplace-hero-grid" />
        <div className="marketplace-hero-blob-1" />
        <div className="marketplace-hero-blob-2" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B69D74]/30 bg-[#B69D74]/08 px-4 py-2 backdrop-blur-sm">
              <Scale size={12} className="text-[#B69D74]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#B69D74]">
                Public Advocate Marketplace
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="marketplace-hero-headline">
              Find Your
              <span className="marketplace-hero-gradient"> Perfect Advocate</span>
            </h1>

            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              Browse our verified directory of certified legal defense counsels, public defenders, and partner advocates. Transparent pricing, real availability, zero guesswork.
            </p>

            {/* Search + Filter */}
            <div className="marketplace-search-bar max-w-lg mx-auto">
              <div className="marketplace-search-icon">
                <Search size={15} className="text-[var(--text-muted)]" />
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, specialization, or location..."
                className="marketplace-search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="marketplace-search-clear"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`marketplace-cat-pill ${activeCategory === cat ? 'marketplace-cat-active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div ref={statsRef} className="marketplace-stats-row mt-12">
            {[
              { val: `${c1}+`, label: 'Verified Advocates', icon: Users, color: '#3B82F6' },
              { val: `${c2}%`, label: 'Client Satisfaction', icon: TrendingUp, color: '#10B981' },
              { val: `${c3}+`, label: 'Cases Managed', icon: Briefcase, color: '#B69D74' },
              { val: '48hr', label: 'Avg. Response', icon: Zap, color: '#8B5CF6' },
            ].map(({ val, label, icon: Icon, color }) => (
              <div key={label} className="marketplace-stat-pill">
                <div className="marketplace-stat-icon" style={{ color, background: `${color}15` }}>
                  <Icon size={14} />
                </div>
                <div>
                  <div className="text-lg font-black leading-none" style={{ color, fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="var(--bg-app)" />
          </svg>
        </div>
      </section>

      {/* ══════════ RESULTS ══════════ */}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-[12px] text-[var(--text-muted)] font-semibold">
            Showing <span className="text-[var(--text-primary)] font-bold">{filteredLawyers.length}</span> advocates
            {search && <> for "<span className="text-[var(--blue-600)]">{search}</span>"</>}
          </p>
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-[var(--text-muted)]" />
            <span className="text-[11px] text-[var(--text-muted)]">Sort by: Best Match</span>
          </div>
        </div>

        {/* Lawyer Cards Grid */}
        {filteredLawyers.length === 0 ? (
          <div className="marketplace-empty">
            <Scale size={40} className="text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">No advocates found</h3>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Try a different search term or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="hero-cta-primary mt-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLawyers.map((lawyer, idx) => {
              const isFav = favorites.includes(lawyer.id);
              const isHovered = hoveredCard === lawyer.id;
              const accentColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#B69D74'];
              const accent = accentColors[idx % accentColors.length];

              return (
                <div
                  key={lawyer.id}
                  className={`lawyer-card group ${isHovered ? 'lawyer-card-hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(lawyer.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ '--accent': accent, animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Card glow on hover */}
                  <div className="lawyer-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${accent}20, transparent 70%)` }} />

                  {/* Top accent bar */}
                  <div className="lawyer-card-top-bar" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4 relative">
                    <div className="flex gap-3 items-start">
                      {/* Avatar */}
                      <div className="lawyer-avatar-wrap relative shrink-0">
                        <img
                          src={lawyer.image}
                          alt={lawyer.name}
                          className="lawyer-avatar"
                        />
                        <div className="lawyer-avatar-ring" style={{ borderColor: `${accent}40` }} />
                        <span
                          className="lawyer-verified-badge"
                          style={{ background: accent }}
                          title="Verified Advocate"
                        >
                          <ShieldCheck size={9} className="text-white" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="lawyer-status-badge" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                          {lawyer.status}
                        </div>
                        <h3 className="lawyer-name mt-1.5">{lawyer.name}</h3>
                        <p className="lawyer-title">{lawyer.title}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(lawyer.id)}
                      className={`lawyer-fav-btn shrink-0 ${isFav ? 'lawyer-fav-active' : ''}`}
                    >
                      <Heart size={13} className={isFav ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Specialization tag + location */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="lawyer-spec-tag" style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}20` }}>
                      {lawyer.specialization}
                    </span>
                    {lawyer.location && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-medium">
                        <MapPin size={10} />
                        {lawyer.location}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-5">
                    {lawyer.bio}
                  </p>

                  {/* Metrics row */}
                  <div className="lawyer-metrics">
                    <div className="lawyer-metric">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-[var(--text-primary)]">{lawyer.rating || '4.9'}</span>
                      <span className="text-[var(--text-muted)] text-[9px]">({lawyer.reviews || '120'})</span>
                    </div>
                    <div className="lawyer-metric-divider" />
                    <div className="lawyer-metric">
                      <TrendingUp size={11} style={{ color: accent }} />
                      <span className="font-bold text-[var(--text-primary)]">{lawyer.successRate || 95}%</span>
                      <span className="text-[var(--text-muted)] text-[9px]">win rate</span>
                    </div>
                    <div className="lawyer-metric-divider" />
                    <div className="lawyer-metric">
                      <Briefcase size={11} className="text-[var(--text-muted)]" />
                      <span className="font-bold text-[var(--text-primary)]">+{lawyer.casesWon || 80}</span>
                      <span className="text-[var(--text-muted)] text-[9px]">won</span>
                    </div>
                  </div>

                  {/* Pricing Block */}
                  <div className="lawyer-pricing-block mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold flex items-center gap-1">
                        <DollarSign size={11} style={{ color: accent }} />
                        Consultation
                      </span>
                      <span className="text-[13px] font-black text-[var(--text-primary)]">
                        ${lawyer.fee}<span className="text-[10px] font-semibold text-[var(--text-muted)]">/session</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">Legal Aid Eligible</span>
                      <span className="lawyer-aid-badge">
                        <CheckCircle size={9} />
                        Yes
                      </span>
                    </div>
                  </div>

                  {/* Available Slots */}
                  <div className="mt-4">
                    <p className="text-[9.5px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-extrabold flex items-center gap-1.5 mb-2">
                      <Calendar size={10} style={{ color: accent }} />
                      Available Slots
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(lawyer.availableSlots || []).slice(0, 3).map((slot, sIdx) => (
                        <span
                          key={sIdx}
                          className="lawyer-slot-pill"
                          style={{ borderColor: `${accent}25`, background: `${accent}08` }}
                        >
                          {slot}
                        </span>
                      ))}
                      {(lawyer.availableSlots || []).length > 3 && (
                        <span className="lawyer-slot-pill text-[var(--text-muted)]">
                          +{lawyer.availableSlots.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex gap-2">
                    <Link to="/login" className="flex-1">
                      <button
                        className="lawyer-cta-btn w-full group/btn"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}CC)` }}
                      >
                        Schedule Appointment
                        <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    {lawyer.id && (
                      <Link to={`/find-lawyers/${lawyer.id}`}>
                        <button className="lawyer-view-btn" title="View full profile">
                          <Globe size={13} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
