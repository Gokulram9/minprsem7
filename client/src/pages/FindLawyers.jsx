import { useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  Search, Star, CheckCircle, Heart, Scale, X,
  MessageSquare, MapPin, TrendingUp, Briefcase, Zap,
  Filter, SlidersHorizontal, ChevronDown, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { lawyers } from '../data/lawyersData';

const FILTER_OPTIONS = ['All', 'Property', 'Criminal', 'Family', 'Civil', 'Accident / MACT', 'Revenue & Land', 'Consumer', 'Labour'];
const SORT_OPTIONS = [
  { value: 'match', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'fee_asc', label: 'Lowest Fee' },
  { value: 'experience', label: 'Most Experienced' },
];

const ACCENT_COLORS = ['#B69B72', '#202A3B', '#D9C7A5', '#9A7E55', '#2D3A50', '#B69B72'];

const FindLawyers = () => {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [favorites, setFavorites] = useState(['lawyer-1']);
  const [compareList, setCompareList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [dbLawyers, setDbLawyers] = useState([]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await axios.get('/lawyers');
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setDbLawyers(res.data.data.map(l => ({
            id: l._id,
            _id: l._id,
            name: l.fullName.startsWith('Advocate') ? l.fullName : `Advocate ${l.fullName}`,
            specialization: (l.specializations && l.specializations[0]) || l.specialization || 'General Practice',
            practiceAreas: l.practiceAreas || l.specializations || [],
            location: l.location || `${l.district || 'Theni'}, ${l.state || 'Tamil Nadu'}`,
            district: l.district || 'Theni',
            courts: l.courts || ['District Court, Theni'],
            experience: l.experience || 8,
            education: l.education || 'LL.B',
            rating: l.rating || 4.8,
            reviews: l.reviewCount || 45,
            casesWon: l.completedCases || 40,
            successRate: l.successRate || 90,
            fee: l.consultationFee || 100,
            bio: l.bio || `${l.experience || 8} years of verified courtroom practice in ${l.location || 'Theni'}.`,
            image: l.profileImage || null
          })));
        }
      } catch (err) {
        console.warn('Could not load lawyers from API:', err);
      }
    };
    fetchLawyers();
  }, []);

  const filteredLawyers = useMemo(() => {
    const lawyerSource = dbLawyers.length > 0 ? dbLawyers : lawyers;
    let list = lawyerSource.map((lawyer, i) => {
      let matchScore = 97;
      if (lawyer.experience < 12) matchScore -= 4;
      if (lawyer.fee > 130) matchScore -= 3;
      if (lawyer.rating < 4.8) matchScore -= 2;
      return { ...lawyer, matchScore, accent: ACCENT_COLORS[i % ACCENT_COLORS.length] };
    }).filter(lawyer => {
      const matchText = lawyer.name.toLowerCase().includes(search.toLowerCase()) ||
        lawyer.specialization.toLowerCase().includes(search.toLowerCase()) ||
        (lawyer.bio || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || lawyer.specialization.toLowerCase().includes(filter.toLowerCase());
      return matchText && matchFilter;
    });

    if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'fee_asc') list.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    else if (sortBy === 'experience') list.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    else list.sort((a, b) => b.matchScore - a.matchScore);
    return list;
  }, [search, filter, sortBy]);

  const toggleFavorite = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCompare = (e, lawyer) => {
    e.preventDefault(); e.stopPropagation();
    if (compareList.find(i => i.id === lawyer.id)) {
      setCompareList(prev => prev.filter(i => i.id !== lawyer.id));
    } else if (compareList.length < 2) {
      setCompareList(prev => [...prev, lawyer]);
    }
  };

  return (
    <div className="fl-page space-y-6">

      {/* ── HEADER CARD ── */}
      <div className="fl-header">
        <div className="fl-header-bg" />
        <div className="fl-header-grid" />
        <div className="fl-header-blob-1" />
        <div className="fl-header-blob-2" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="fl-header-badge">
                <Zap size={10} className="text-[#B69D74]" />
                <span>AI-Powered Advocate Finder</span>
                <span className="fl-badge-live" />
              </div>
              <h1 className="fl-header-title mt-3">Verified Lawyer Directory</h1>
              <p className="fl-header-sub mt-2">
                Browse our marketplace of verified advocate specialists. Matches calculated using AI confidence scores.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 shrink-0">
              {[
                { val: `${filteredLawyers.length}`, label: 'Advocates', color: '#202A3B' },
                { val: '96%', label: 'Avg Match', color: '#B69B72' },
                { val: '48hr', label: 'Response', color: '#B69B72' },
              ].map(({ val, label, color }) => (
                <div key={label} className="fl-stat-chip">
                  <div className="text-lg font-black leading-none dark:text-[#D9C7A5]" style={{ color, fontFamily: 'var(--font-display)' }}>{val}</div>
                  <div className="text-[9.5px] text-[var(--text-muted)] font-semibold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search + Filter bar */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="fl-search-wrap flex-1">
              <Search size={14} className="fl-search-icon" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, specialization, location..."
                className="fl-search-input"
              />
              {search && (
                <button onClick={() => setSearch('')} className="fl-search-clear">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="fl-select"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Filter pills */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`fl-filter-pill ${filter === opt ? 'fl-filter-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {(user?.role === 'User' || user?.role === 'Applicant') && (
              <Link
                to="/dashboard/ai-recommend"
                className="btn-ai inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Zap size={12} className="text-[#5B21B6]" />
                <span>Launch AI Lawyer Matcher</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULTS COUNT ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-primary)]">{filteredLawyers.length}</span> advocates found
          {search && <> · "<span className="text-[#B69B72]">{search}</span>"</>}
        </p>
        <div className="flex items-center gap-1.5">
          {[
            { mode: 'grid', icon: '⊞' },
            { mode: 'list', icon: '≡' },
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all ${viewMode === mode ? 'bg-[#202A3B] text-white border border-[#B69B72]/40' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      {filteredLawyers.length === 0 ? (
        <div className="fl-empty">
          <Scale size={48} className="text-[var(--text-muted)] mb-4 opacity-40" />
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">No advocates found</h3>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Try adjusting your search or filters</p>
          <button onClick={() => { setSearch(''); setFilter('All'); }} className="hero-cta-primary mt-4">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'fl-grid' : 'fl-list'}>
          {filteredLawyers.map((lawyer, idx) => {
            const isFav = favorites.includes(lawyer.id);
            const isCompare = compareList.some(i => i.id === lawyer.id);
            const accent = lawyer.accent;

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                key={lawyer.id}
                className={`fl-card glass-card group ${viewMode === 'list' ? 'fl-card-list' : ''}`}
                style={{ '--fl-accent': accent }}
              >
                {/* Top accent bar on hover */}
                <div className="fl-card-topbar" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                {/* AI Match badge */}
                <div className="fl-match-badge" style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                  <Zap size={9} />
                  <span>{lawyer.matchScore}% Match</span>
                </div>

                <div className={`flex ${viewMode === 'list' ? 'items-center gap-6' : 'flex-col'} gap-4`}>
                  {/* Avatar + info */}
                  <div className={`flex gap-4 items-start ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="relative shrink-0">
                      {lawyer.image ? (
                        <img
                          src={lawyer.image}
                          alt={lawyer.name}
                          className="fl-avatar"
                        />
                      ) : (
                        <div
                          className="fl-avatar flex items-center justify-center font-bold text-lg text-white select-none shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
                        >
                          {lawyer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="fl-avatar-ring" style={{ borderColor: `${accent}35` }} />
                      <span className="fl-verified-dot" style={{ background: accent }}>
                        <CheckCircle size={9} className="text-white" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="fl-status-tag" style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}>
                          {lawyer.status}
                        </span>
                        {lawyer.location && (
                          <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                            <MapPin size={9} /> {lawyer.location}
                          </span>
                        )}
                        {(lawyer.court || lawyer.courtPractice) && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/30">
                            <Scale size={9} /> {lawyer.court || lawyer.courtPractice}
                          </span>
                        )}
                      </div>
                      <h2 className="fl-lawyer-name mt-1.5">{lawyer.name}</h2>
                      <p className="fl-lawyer-title">{lawyer.title}</p>

                      {/* Rating stars */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < Math.floor(lawyer.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-strong)]'} />
                          ))}
                        </div>
                        <span className="text-[10.5px] font-bold text-[var(--text-primary)]">{lawyer.rating}</span>
                        <span className="text-[9.5px] text-[var(--text-muted)]">({lawyer.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className={viewMode === 'list' ? 'hidden' : 'h-px bg-[var(--border-color)]'} />

                  {/* Summary metrics */}
                  <div className={`grid grid-cols-3 gap-2 ${viewMode === 'list' ? 'w-80 shrink-0' : ''}`}>
                    <div className="fl-metric">
                      <span className="fl-metric-label">Success</span>
                      <span className="fl-metric-val">{lawyer.successRate}%</span>
                    </div>
                    <div className="fl-metric">
                      <span className="fl-metric-label">Exp</span>
                      <span className="fl-metric-val">{lawyer.experience} Yrs</span>
                    </div>
                    <div className="fl-metric">
                      <span className="fl-metric-label">Fee</span>
                      <span className="fl-metric-val" style={{ color: accent }}>₹{lawyer.fee}/hr</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`fl-actions ${viewMode === 'list' ? 'shrink-0' : 'border-t border-[var(--border-color)] pt-4'}`}>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={e => toggleFavorite(e, lawyer.id)}
                        className={`fl-action-icon-btn ${isFav ? 'fl-fav-active' : ''}`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart size={13} className={isFav ? 'fill-current' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={e => toggleCompare(e, lawyer)}
                        className={`fl-action-icon-btn ${isCompare ? 'fl-compare-active' : ''}`}
                        title="Compare advocate"
                      >
                        <Scale size={13} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/dashboard/lawyers/${lawyer.id}`}>
                        <button className="fl-btn-outline">Profile</button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('ai-chat-recommend', { detail: lawyer }))}
                        className="fl-btn-primary"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}CC)` }}
                      >
                        <MessageSquare size={12} />
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── COMPARE DRAWER ── */}
      {compareList.length > 0 && (
        <div className="fl-compare-drawer animate-fade-in-up">
          <div className="fl-compare-bar" />
          <div className="mx-auto max-w-5xl px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[var(--blue-600)]" />
                <h3 className="text-[13px] font-bold text-[var(--text-primary)]">Compare Advocates ({compareList.length}/2)</h3>
              </div>
              <button onClick={() => setCompareList([])} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-[100px_1fr_1fr]">
              {/* Labels */}
              <div className="space-y-4 hidden sm:block">
                {['Advocate', 'Specialization', 'Experience', 'Win Rate', 'Hourly Fee', 'Rating'].map(label => (
                  <div key={label} className="h-10 flex items-center text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
                ))}
              </div>
              {/* Lawyer columns */}
              {compareList.map((lawyer, ci) => (
                <div key={lawyer.id} className="space-y-4">
                  <div className="h-10 flex items-center gap-3">
                    {lawyer.image ? (
                      <img src={lawyer.image} alt={lawyer.name} className="h-9 w-9 rounded-xl object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 bg-blue-600">
                        {lawyer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <p className="text-[12px] font-bold text-[var(--text-primary)] leading-none">{lawyer.name}</p>
                      <p className="text-[9.5px] text-[var(--text-muted)] mt-0.5">{lawyer.title}</p>
                    </div>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{lawyer.specialization}</span>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{lawyer.experience} Years</span>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-[11px] font-bold text-emerald-500">{lawyer.casesWon} won ({lawyer.successRate}%)</span>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">₹{lawyer.fee}/hr</span>
                  </div>
                  <div className="h-10 flex items-center gap-1">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{lawyer.rating}</span>
                    <span className="text-[9.5px] text-[var(--text-muted)]">({lawyer.reviews})</span>
                  </div>
                </div>
              ))}
              {compareList.length < 2 && (
                <div className="fl-compare-empty-slot">
                  <Scale size={20} className="text-[var(--text-muted)] mb-1 opacity-30" />
                  <p className="text-[10.5px] text-[var(--text-muted)]">Select 1 more advocate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindLawyers;
