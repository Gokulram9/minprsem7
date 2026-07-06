import { useState, useEffect, useMemo } from 'react';
import { Search, Scale, Calendar, Shield, ArrowUpRight, FileText, Download, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';

const SPECIALIZATIONS = ['All', 'Constitutional & Criminal', 'Family Law', 'Property & Civil', 'Corporate & Financial', 'Civil Law'];

const JudgmentsSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Generate year options from 1950 to 2024
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
      
      const response = await axios.get('/api/judgments', { params });
      setJudgments(response.data.judgments || []);
      setSourceInfo(response.data.source || 'database');
    } catch (error) {
      console.error('Failed to query judgments database:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run search when parameters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJudgments();
    }, 300); // Debounce queries
    return () => clearTimeout(delayDebounce);
  }, [query, selectedSpec, selectedYear]);

  return (
    <div className="space-y-8 pb-12 text-slate-800 dark:text-slate-100">
      
      {/* ── HEADER CARD ── */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[24px] glass-card p-8 shadow-xl relative overflow-hidden"
      >
        {/* Glow details */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              <Sparkles size={11} className="text-[#B69D74]" />
              <span>Supreme Court Judgments Database</span>
            </div>
            <h1 className="font-space text-3xl font-black mt-3 tracking-tight">Indian Precedents Archive</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Browse, search and filter over 70 years (1950–2024) of verified Supreme Court of India judgments.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Connected ({sourceInfo === 'fallback' ? 'Preview Mode' : 'Indexed SQL'})</span>
            </span>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          
          {/* Main search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case title, parties, judgments content keywords..."
              className="w-full rounded-full border border-slate-200 bg-white/50 py-3 pl-12 pr-4 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            />
          </div>

          {/* Year selector */}
          <div className="relative w-full md:w-[160px]">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full appearance-none rounded-full border border-slate-200 bg-white/50 py-3 pl-11 pr-8 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</div>
          </div>

        </div>

        {/* ── SPECIALIZATION FILTER TABS ── */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition duration-200 ${
                selectedSpec === spec
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

      </motion.div>

      {/* ── SEARCH RESULTS GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[12px] text-slate-400 font-medium">
            Found <span className="font-bold text-slate-800 dark:text-white">{judgments.length}</span> records
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Searching precedent records database...</p>
          </div>
        ) : judgments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[24px] glass-card p-12 text-center"
          >
            <Scale size={40} className="mx-auto text-slate-400/50 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No judgments found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try refining your search keyword or selecting a different year group.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {judgments.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
                whileHover={{ y: -3 }}
                className="rounded-[20px] glass-card p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition duration-300 text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-400">
                      {item.year}
                    </span>
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      {item.specialization}
                    </span>
                  </div>
                  
                  <h3 className="font-space text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">
                    {item.filename}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="rounded-lg px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <FileText size={11} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── JUDGMENT PREVIEW MODAL OVERLAY ── */}
      <AnimatePresence>
        {previewItem && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Scale className="text-blue-500" size={18} />
                  <div>
                    <h3 className="font-space text-xs font-bold text-slate-900 dark:text-white truncate max-w-[300px]">Case Record Detail</h3>
                    <p className="text-[10px] text-slate-400">Supreme Court of India</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPreviewItem(null)} 
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Meta details */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ruling Year</p>
                    <p className="mt-1 text-xs font-black text-slate-850 dark:text-white">{previewItem.year}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction</p>
                    <p className="mt-1 text-xs font-black text-slate-850 dark:text-white">Supreme Court</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Legal Spec</p>
                    <p className="mt-1 text-xs font-black text-blue-500">{previewItem.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Case Title</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-normal">{previewItem.title}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary</h4>
                  <div className="p-4 bg-blue-50/20 rounded-xl border border-blue-100/40 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 font-serif">
                    <p className="indent-4">{previewItem.summary}</p>
                    <p className="indent-4">This record represents an officially archived Supreme Court of India precedent. Users can audit index matching scores, schedule consultations with matched advocates, and reference document logs directly inside the Seven Seas scheduling portal.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resource Path</h4>
                  <p className="text-[10px] font-mono text-slate-400 break-all p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                    {previewItem.filepath}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                <span className="text-[9px] text-slate-400">
                  File name: {previewItem.filename}
                </span>
                <button 
                  onClick={() => alert(`Precedent PDF is cached locally at:\n${previewItem.filepath}`)}
                  className="rounded-lg px-4 py-2 bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition"
                >
                  <Download size={12} />
                  <span>Access PDF</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JudgmentsSearch;
