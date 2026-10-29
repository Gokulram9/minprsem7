import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Scale, Calendar, Shield, ArrowUpRight, FileText, Download, 
  Sparkles, Filter, CheckCircle2, Copy, Check, BookOpen, Layers, 
  Award, MessageSquare, ChevronRight, X, Info, HelpCircle, ExternalLink,
  Gavel, Compass, BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';

const SPECIALIZATIONS = [
  'All', 
  'Constitutional & Criminal', 
  'Family Law', 
  'Property & Civil', 
  'Corporate & Financial', 
  'Civil Law'
];

const BENCH_TYPES = [
  'All',
  'Constitution Bench',
  'Full Bench',
  'Division Bench'
];

const QUICK_TOPICS = [
  { label: 'All Precedents', value: 'All' },
  { label: '⚖️ Bail & Arrest', value: 'Arrest & Bail' },
  { label: '🏡 Women & Coparcenary', value: 'Women & Property' },
  { label: '🔒 Privacy & Liberty', value: 'Privacy & Rights' },
  { label: '📜 Cheque Bounce (Sec 138)', value: 'Cheque Bounce' },
  { label: '🤝 Matrimonial Maintenance', value: 'Maintenance' }
];

const SPOTLIGHT_PRECEDENTS = [
  {
    id: 'PREC-118',
    title: 'D.K. Basu v. State of West Bengal (1997)',
    citation: 'AIR 1997 SC 610',
    benchType: 'Division Bench',
    year: '1997',
    tag: 'Arrest & Custodial Safeguards',
    highlight: 'Mandatory 11-point arrest checklist, inspection memo, and right to legal counsel during interrogation under Art. 21/22.',
    category: 'Constitutional & Criminal'
  },
  {
    id: 'PREC-102',
    title: 'Vineeta Sharma v. Rakesh Sharma (2020)',
    citation: '2020 9 SCC 1',
    benchType: '3-Judge Full Bench',
    year: '2020',
    tag: 'Daughters\' Coparcenary Rights',
    highlight: 'Unconditional retroactive birthright in ancestral coparcenary property under Hindu Succession Act Section 6.',
    category: 'Property & Civil'
  },
  {
    id: 'PREC-108',
    title: 'Satender Kumar Antil v. CBI (2022)',
    citation: '2022 10 SCC 51',
    benchType: 'Division Bench',
    year: '2022',
    tag: 'Bail Reform & Liberty Safeguards',
    highlight: 'Bail is the inviolable rule and jail the exception; courts must resolve regular bail within 14 days.',
    category: 'Constitutional & Criminal'
  },
  {
    id: 'PREC-106',
    title: 'Justice K.S. Puttaswamy v. Union of India (2017)',
    citation: '2017 10 SCC 1',
    benchType: '9-Judge Constitutional Bench',
    year: '2017',
    tag: 'Fundamental Right to Privacy',
    highlight: 'Privacy declared an intrinsic fundamental right under Article 21; bodily autonomy & data protected.',
    category: 'Constitutional & Criminal'
  },
  {
    id: 'PREC-119',
    title: 'Lalita Kumari v. Govt. of Uttar Pradesh (2014)',
    citation: '2014 2 SCC 1',
    benchType: '5-Judge Constitution Bench',
    year: '2014',
    tag: 'Mandatory FIR Registration',
    highlight: 'Police cannot conduct preliminary inquiry if complaint discloses cognizable offence; FIR is mandatory under Sec. 154 CrPC.',
    category: 'Constitutional & Criminal'
  },
  {
    id: 'PREC-120',
    title: 'Maneka Gandhi v. Union of India (1978)',
    citation: 'AIR 1978 SC 597',
    benchType: '7-Judge Constitution Bench',
    year: '1978',
    tag: 'Due Process & Personal Liberty',
    highlight: 'Procedure depriving personal liberty under Article 21 must be just, fair and reasonable, not arbitrary.',
    category: 'Constitutional & Criminal'
  }
];

const JudgmentsSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBenchType, setSelectedBenchType] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  
  // Knowledge drawer tab & toast state
  const [activeGuideTab, setActiveGuideTab] = useState('hierarchy');
  const [showLegalGuide, setShowLegalGuide] = useState(false);
  const [copiedCitationId, setCopiedCitationId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Generate year options from 2024 to 1950
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = 2024; y >= 1950; y--) {
      years.push(y.toString());
    }
    return years;
  }, []);

  const fetchJudgments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.query = query;
      if (selectedYear) params.year = selectedYear;
      if (selectedSpec && selectedSpec !== 'All') params.specialization = selectedSpec;
      
      const response = await axios.get('/judgments', { params });
      setJudgments(response.data.judgments || []);
      setSourceInfo(response.data.source || 'verified_archive');
    } catch (error) {
      console.error('Failed to query judgments database:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run search when core query parameters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJudgments();
    }, 280);
    return () => clearTimeout(delayDebounce);
  }, [query, selectedSpec, selectedYear]);

  // Client-side refined filtering for bench type and quick topics
  const filteredJudgments = useMemo(() => {
    return judgments.filter(item => {
      // Bench filter
      if (selectedBenchType !== 'All') {
        const benchLower = `${item.benchType || ''} ${item.citation || ''}`.toLowerCase();
        if (selectedBenchType === 'Constitution Bench') {
          const isConst = benchLower.includes('constitution') || 
                          benchLower.includes('5-judge') || 
                          benchLower.includes('7-judge') || 
                          benchLower.includes('9-judge') || 
                          benchLower.includes('13-judge');
          if (!isConst) return false;
        } else if (selectedBenchType === 'Full Bench') {
          const isFull = benchLower.includes('3-judge') || benchLower.includes('full bench');
          if (!isFull) return false;
        } else if (selectedBenchType === 'Division Bench') {
          const isDiv = benchLower.includes('division bench') || benchLower.includes('2-judge');
          if (!isDiv) return false;
        }
      }

      // Quick topic filter
      if (selectedTopic !== 'All') {
        const fullContent = `${item.title} ${item.summary} ${item.ratio || ''} ${(item.statutes || []).join(' ')} ${item.category || ''} ${item.outcome || ''}`.toLowerCase();
        if (selectedTopic === 'Arrest & Bail') {
          if (!fullContent.includes('arrest') && !fullContent.includes('bail') && !fullContent.includes('167') && !fullContent.includes('41a')) return false;
        } else if (selectedTopic === 'Women & Property') {
          if (!fullContent.includes('property') && !fullContent.includes('coparcenary') && !fullContent.includes('succession') && !fullContent.includes('daughter') && !fullContent.includes('hindu')) return false;
        } else if (selectedTopic === 'Privacy & Rights') {
          if (!fullContent.includes('privacy') && !fullContent.includes('art. 21') && !fullContent.includes('article 21') && !fullContent.includes('basic structure')) return false;
        } else if (selectedTopic === 'Cheque Bounce') {
          if (!fullContent.includes('138') && !fullContent.includes('cheque') && !fullContent.includes('negotiable')) return false;
        } else if (selectedTopic === 'Maintenance') {
          if (!fullContent.includes('maintenance') && !fullContent.includes('125') && !fullContent.includes('domestic violence') && !fullContent.includes('matrimonial')) return false;
        }
      }

      return true;
    });
  }, [judgments, selectedBenchType, selectedTopic]);

  const handleCopyCitation = (item, e) => {
    if (e) e.stopPropagation();
    const citationText = `${item.title} [${item.citation}] - Supreme Court of India (${item.year})`;
    navigator.clipboard.writeText(citationText);
    setCopiedCitationId(item.id);
    setToastMessage(`Citation copied: "${item.citation}"`);
    setTimeout(() => setCopiedCitationId(null), 2400);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleCiteInChat = (item, e) => {
    if (e) e.stopPropagation();
    const formattedCitation = `[Legal Precedent Reference: ${item.title} (${item.year}) • ${item.citation} • Holding: "${item.ratio || item.summary}"]`;
    navigator.clipboard.writeText(formattedCitation);
    setToastMessage(`Precedent formatted & copied. Opening Case Messages...`);
    setTimeout(() => {
      navigate('/dashboard/messages', { state: { prefilledMessage: formattedCitation } });
    }, 700);
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedSpec('All');
    setSelectedYear('');
    setSelectedBenchType('All');
    setSelectedTopic('All');
  };

  const isAnyFilterActive = query || selectedSpec !== 'All' || selectedYear || selectedBenchType !== 'All' || selectedTopic !== 'All';

  return (
    <div className="space-y-8 pb-16 text-slate-800 dark:text-slate-100">
      
      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[150] flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 text-white border border-slate-700/60 shadow-2xl backdrop-blur-md text-xs font-semibold"
          >
            <BookmarkCheck size={16} className="text-[#B69D74]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER HERO CARD ── */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[28px] glass-card p-8 lg:p-10 shadow-xl relative overflow-hidden border border-slate-200/70 dark:border-slate-800/70"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between relative z-10">
          <div className="text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
              <Scale size={12} className="text-[#B69D74]" />
              <span>Supreme Court of India Jurisprudence Corpus</span>
            </div>
            
            <h1 className="font-space text-3xl lg:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
              Indian Precedents Archive
            </h1>
            
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              Official repository of landmark Supreme Court judgments, authoritative legal ratios (<em className="font-serif italic font-semibold text-slate-800 dark:text-slate-100">Ratio Decidendi</em>), statutory sections, and binding jurisprudence under Article 141 of the Constitution of India.
            </p>

            {/* Quick Institutional Metric Badges */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                <Gavel size={12} className="text-[#B69D74]" />
                <span>Article 141 Binding Precedents</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                <Shield size={12} className="text-emerald-500" />
                <span>Verified Legal Citations</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                <FileText size={12} className="text-blue-500" />
                <span>Statutory Cross-References</span>
              </span>
              <button
                onClick={() => setShowLegalGuide(!showLegalGuide)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 transition"
              >
                <BookOpen size={12} />
                <span>{showLegalGuide ? 'Hide Legal Guide' : 'Legal Doctrine Guide'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repository Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-900/50">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Connected (Supreme Court Corpus)</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1">1950 – 2024 Judicial Reports</span>
          </div>
        </div>

        {/* ── EXPANDABLE LEGAL DOCTRINE REFERENCE ACCORDION ── */}
        <AnimatePresence>
          {showLegalGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveGuideTab('hierarchy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeGuideTab === 'hierarchy' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                >
                  Article 141 Hierarchy
                </button>
                <button
                  onClick={() => setActiveGuideTab('ratio')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeGuideTab === 'ratio' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                >
                  Ratio Decidendi vs. Obiter Dicta
                </button>
                <button
                  onClick={() => setActiveGuideTab('aid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeGuideTab === 'aid' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                >
                  Article 39A Free Legal Aid
                </button>
                <button
                  onClick={() => setActiveGuideTab('citations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeGuideTab === 'citations' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                >
                  Citation Decoders & Bench Types
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-slate-900/70 border border-blue-100 dark:border-slate-800 text-left space-y-2">
                {activeGuideTab === 'hierarchy' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Scale size={14} className="text-blue-500" />
                      Article 141: Supreme Court of India Binding Precedent Hierarchy
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Under <strong>Article 141 of the Constitution of India</strong>, the law declared by the Supreme Court of India is unconditionally binding upon all High Courts, District Courts, Sessions Courts, and Subordinate Tribunals across the entire territory of India. When pleading a petition or defense in any subordinate court, a Supreme Court holding takes absolute precedence over conflicting High Court orders.
                    </p>
                  </div>
                )}

                {activeGuideTab === 'ratio' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Gavel size={14} className="text-[#B69D74]" />
                      Ratio Decidendi vs. Obiter Dicta
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <strong>Ratio Decidendi</strong> ("reason for deciding") constitutes the operative rule of law upon which the case is decided. It is the only component of a judgment that possesses binding authoritative force on lower benches. Conversely, <strong>Obiter Dicta</strong> ("said by the way") represents observations, philosophical thoughts, or analogies made by judges in passing, which hold strong persuasive weight but do not bind other courts.
                    </p>
                  </div>
                )}

                {activeGuideTab === 'aid' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield size={14} className="text-emerald-500" />
                      Article 39A: Equal Justice & Free Legal Assistance
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <strong>Article 39A</strong> directs the State to secure that the operation of the legal system promotes justice on a basis of equal opportunity, providing free legal aid through the Legal Services Authorities Act (1987). No citizen may be denied justice or courtroom advocacy due to economic hardship, marginalized identity, or incarceration status.
                    </p>
                  </div>
                )}

                {activeGuideTab === 'citations' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-500" />
                      Deciphering Indian Legal Citations & Benches
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>Standard Reporters:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li><code>SCC</code>: Supreme Court Cases (Eastern Book Co.)</li>
                          <li><code>AIR</code>: All India Reporter</li>
                          <li><code>SCR</code>: Supreme Court Reports (Official)</li>
                          <li><code>INSC</code>: Neutral Indian Supreme Court Citation</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Bench Classifications:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li><code>Division Bench</code>: 2 Judges (Standard roster)</li>
                          <li><code>Full Bench</code>: 3 Judges (Resolving conflict)</li>
                          <li><code>Constitution Bench</code>: 5+ Judges (Art. 145(3) constitutional questions)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row">
          
          {/* Main search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case title, citation (e.g. 10 SCC 51), judge name, statute section (e.g. 41A, 167), or ratio..."
              className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3.5 pl-12 pr-4 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Bench Type selector */}
          <div className="relative w-full lg:w-[190px]">
            <Gavel className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedBenchType}
              onChange={(e) => setSelectedBenchType(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/70 py-3.5 pl-11 pr-8 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
            >
              <option value="All">All Benches</option>
              {BENCH_TYPES.filter(b => b !== 'All').map(bench => (
                <option key={bench} value={bench}>{bench}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Year selector */}
          <div className="relative w-full lg:w-[150px]">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/70 py-3.5 pl-11 pr-8 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</div>
          </div>

          {isAnyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="rounded-2xl px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}

        </div>

        {/* ── SPECIALIZATION FILTER TABS ── */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Domain:</span>
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition duration-200 ${
                selectedSpec === spec
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* ── QUICK STATUTORY TOPIC CHIPS ── */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Focus:</span>
          {QUICK_TOPICS.map(topic => (
            <button
              key={topic.value}
              onClick={() => setSelectedTopic(topic.value)}
              className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition ${
                selectedTopic === topic.value
                  ? 'bg-[#B69D74] text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>

      </motion.div>

      {/* ── LANDMARK PRECEDENTS SPOTLIGHT SHOWCASE ── */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Award className="text-[#B69D74]" size={18} />
            <h2 className="font-space text-lg font-bold text-slate-900 dark:text-white">Landmark Precedents Spotlight</h2>
          </div>
          <span className="text-xs text-slate-400">Foundational Supreme Court Jurisprudence</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {SPOTLIGHT_PRECEDENTS.map((spot, idx) => (
            <motion.div
              key={spot.id}
              whileHover={{ y: -3 }}
              className="rounded-2xl glass-card p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/50 transition cursor-pointer relative group"
              onClick={() => {
                const found = judgments.find(j => j.id === spot.id || j.title.toLowerCase().includes(spot.title.slice(0, 12).toLowerCase()));
                if (found) setPreviewItem(found);
                else setQuery(spot.title.split('v.')[0].trim());
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    {spot.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {spot.year}
                  </span>
                </div>
                
                <h3 className="font-space text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition line-clamp-1">
                  {spot.title}
                </h3>

                <p className="text-[10px] text-slate-400 font-mono">
                  {spot.citation} • {spot.benchType}
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {spot.highlight}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold group-hover:underline flex items-center gap-1">
                  <span>View Landmark Brief</span>
                  <ArrowUpRight size={12} />
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  {spot.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── SEARCH RESULTS HEADER & RECORD COUNT ── */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-blue-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Displaying <span className="font-bold text-slate-900 dark:text-white">{filteredJudgments.length}</span> verified precedent records
              {isAnyFilterActive && <span className="text-blue-500 ml-1">(Filtered)</span>}
            </p>
          </div>
          
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click 'Cite in Chat' to instantly link precedent into active client/advocate discussions
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Searching precedent records database...</p>
          </div>
        ) : filteredJudgments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[24px] glass-card p-12 text-center border border-slate-200/80 dark:border-slate-800"
          >
            <Scale size={42} className="mx-auto text-slate-400/40 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No precedent records match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Try adjusting your search terms, removing specific bench type filters, or switching back to 'All Precedents'.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 rounded-full px-5 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              Reset All Search Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredJudgments.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.02 }}
                whileHover={{ y: -3 }}
                className="rounded-[24px] glass-card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition duration-300 text-left relative overflow-hidden"
              >
                <div className="space-y-3.5">
                  
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                        {item.year}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {item.specialization || item.category}
                      </span>
                      {item.benchType && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1">
                          <Gavel size={10} />
                          <span>{item.benchType}</span>
                        </span>
                      )}
                    </div>

                    {item.outcome && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40">
                        {item.outcome}
                      </span>
                    )}
                  </div>
                  
                  {/* Title & Official Citation */}
                  <div>
                    <h3 className="font-space text-base font-black text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    
                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>{item.citation}</span>
                      <button
                        onClick={(e) => handleCopyCitation(item, e)}
                        className="p-1 hover:text-blue-500 transition text-slate-400 rounded"
                        title="Copy Official Citation"
                      >
                        {copiedCitationId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Presiding Bench if present */}
                  {item.bench && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                      <Scale size={13} className="shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-1 italic">{item.bench}</span>
                    </div>
                  )}

                  {/* Applicable Statutes */}
                  {item.statutes && item.statutes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.statutes.slice(0, 3).map((stat, sIdx) => (
                        <span 
                          key={sIdx}
                          className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                        >
                          {stat}
                        </span>
                      ))}
                      {item.statutes.length > 3 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                          +{item.statutes.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ratio Decidendi (Binding Principle) Highlight */}
                  {item.ratio && (
                    <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-[#B69D74] border-t border-r border-b border-amber-200/40 dark:border-amber-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9A7E55] dark:text-[#D9C7A5]">
                        <Gavel size={11} />
                        <span>Ratio Decidendi (Binding Legal Holding)</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
                        "{item.ratio}"
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Practical Impact for Litigants / Advocates */}
                  {item.practicalImpact && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 flex items-start gap-1.5">
                      <Info size={13} className="shrink-0 text-blue-500 mt-0.5" />
                      <p className="line-clamp-2">
                        <strong className="text-slate-700 dark:text-slate-300">Actionable Impact:</strong> {item.practicalImpact}
                      </p>
                    </div>
                  )}

                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {item.filename || 'SupremeCourt_Record.pdf'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCiteInChat(item, e)}
                      className="rounded-xl px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-[11px] font-bold text-blue-600 dark:text-blue-400 transition flex items-center gap-1"
                      title="Format and cite inside case consultation messages"
                    >
                      <MessageSquare size={12} />
                      <span>Cite in Chat</span>
                    </button>
                    
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="rounded-xl px-3.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <FileText size={12} />
                      <span>Legal Brief</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── JUDGMENT PREVIEW & BRIEF MODAL OVERLAY ── */}
      <AnimatePresence>
        {previewItem && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 text-left my-8 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="font-space text-sm font-black text-slate-900 dark:text-white truncate max-w-[400px]">
                      Supreme Court Precedent Record
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {previewItem.citation} • {previewItem.year}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPreviewItem(null)} 
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ruling Year</p>
                    <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">{previewItem.year}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction</p>
                    <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">Supreme Court</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bench Type</p>
                    <p className="mt-1 text-xs font-black text-purple-600 dark:text-purple-400 truncate">
                      {previewItem.benchType || 'Division Bench'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Domain</p>
                    <p className="mt-1 text-xs font-black text-blue-600 dark:text-blue-400 truncate">
                      {previewItem.specialization || previewItem.category}
                    </p>
                  </div>
                </div>

                {/* Case Caption */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Case Title & Parties</h4>
                  <p className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {previewItem.title}
                  </p>
                </div>

                {/* Presiding Bench / Coram */}
                {previewItem.bench && (
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presiding Coram (Justices)</h4>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-serif italic bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {previewItem.bench}
                    </p>
                  </div>
                )}

                {/* Applicable Statutory Sections */}
                {previewItem.statutes && previewItem.statutes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applicable Statutory Provisions</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.statutes.map((st, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/50 dark:border-blue-900/40"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ratio Decidendi */}
                {previewItem.ratio && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7E55] dark:text-[#D9C7A5]">
                      <Gavel size={14} />
                      <span>Ratio Decidendi (Binding Principle of Law)</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 font-serif italic text-xs leading-relaxed text-slate-800 dark:text-slate-100 shadow-xs">
                      "{previewItem.ratio}"
                    </div>
                  </div>
                )}

                {/* Practical Impact for Litigants & Advocates */}
                {previewItem.practicalImpact && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Shield size={12} className="text-emerald-500" />
                      <span>Actionable Guidance for Petitioners & Advocates</span>
                    </h4>
                    <p className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {previewItem.practicalImpact}
                    </p>
                  </div>
                )}

                {/* Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Judicial Summary</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 font-serif">
                    <p className="indent-4">{previewItem.summary}</p>
                    <p className="indent-4 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      This precedent is officially registered in the Supreme Court archive and is enforceable across all trial and appellate benches in India under Article 141. Advocates can quote this citation in bail petitions, writ applications, and civil suits.
                    </p>
                  </div>
                </div>

                {/* Judicial Outcome */}
                {previewItem.outcome && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 font-medium">Judicial Outcome / Order:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewItem.outcome}</span>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap justify-between items-center border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 gap-3">
                <button
                  onClick={(e) => handleCopyCitation(previewItem, e)}
                  className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copiedCitationId === previewItem.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedCitationId === previewItem.id ? 'Citation Copied' : 'Copy Citation'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleCiteInChat(previewItem, e)}
                    className="rounded-xl px-4 py-2 bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition shadow-sm"
                  >
                    <MessageSquare size={13} />
                    <span>Cite in Case Chat</span>
                  </button>

                  <button 
                    onClick={() => alert(`Precedent PDF record is verified and archived at:\n${previewItem.filename || 'SupremeCourt_Precedents.pdf'}\n\nUnder Article 141, this decision constitutes binding case law.`)}
                    className="rounded-xl px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-white transition"
                  >
                    <Download size={13} />
                    <span>Access Record</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JudgmentsSearch;
