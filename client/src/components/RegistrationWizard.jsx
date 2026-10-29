import { useState, useContext, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  ArrowRight, ArrowLeft, Upload, CheckCircle, X, Trash2,
  FileText, AlertCircle, Scale, Search, UserCheck, Shield,
  Award, Star, Briefcase, MapPin, Check
} from 'lucide-react';
import { CASE_CATALOG, QUICK_CASE_CHIPS } from '../pages/ApplicantDashboard';

const STEPS = [
  { id: 1, title: 'Applicant Info', icon: '👤' },
  { id: 2, title: 'Case Details',   icon: '📋' },
  { id: 3, title: 'Opponent',       icon: '⚔️' },
  { id: 4, title: 'Court & Venue',  icon: '🏛️' },
  { id: 5, title: 'Legal Counsel',  icon: '⚖️' },
  { id: 6, title: 'Documents',      icon: '📎' },
  { id: 7, title: 'Review',         icon: '✅' },
];

const LAWYER_SPECIALIZATION_FILTERS = [
  'All',
  'Civil',
  'Criminal',
  'Family',
  'Property',
  'Consumer',
  'Labour',
  'Cyber Crime',
];

const RegistrationWizard = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [selectedCasePreset, setSelectedCasePreset] = useState('');

  // Lawyers state for Step 5
  const [lawyers, setLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [lawyerSearch, setLawyerSearch] = useState('');
  const [lawyerSpecializationFilter, setLawyerSpecializationFilter] = useState('All');

  // Fetch verified advocates on wizard mount
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoadingLawyers(true);
        const res = await axios.get('/lawyers');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (list.length > 0) {
          setLawyers(list);
        } else {
          // Fallback to users with role Lawyer
          const uRes = await axios.get('/users?role=Lawyer');
          const uList = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
          setLawyers(uList);
        }
      } catch (err) {
        console.warn('Could not load lawyers list:', err.message);
      } finally {
        setLoadingLawyers(false);
      }
    };
    fetchLawyers();
  }, []);

  const handleSelectCasePreset = (chosenTitle) => {
    setSelectedCasePreset(chosenTitle);
    if (!chosenTitle || chosenTitle === 'custom') return;

    let found = null;
    for (const group of CASE_CATALOG) {
      const match = group.cases.find(c => c.title === chosenTitle);
      if (match) {
        found = match;
        break;
      }
    }

    if (found) {
      let mappedCat = 'Civil';
      if (found.category.includes('Family')) mappedCat = 'Family';
      else if (found.category.includes('Criminal')) mappedCat = 'Criminal';
      else if (found.category.includes('Property')) mappedCat = 'Property';
      else if (found.category.includes('Consumer')) mappedCat = 'Consumer';
      else if (found.category.includes('Labour')) mappedCat = 'Labour';
      else if (found.category.includes('Cyber')) mappedCat = 'Cyber Crime';

      setForm(prev => ({
        ...prev,
        caseTitle: found.title,
        caseType: mappedCat,
        caseDescription: (!prev.caseDescription.trim() || prev.caseDescription.length < 20) ? found.desc : prev.caseDescription
      }));
      setLawyerSpecializationFilter(mappedCat);
    }
  };

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.location || user?.city || 'Theni',
    district: user?.district || 'Theni',
    state: user?.state || 'Tamil Nadu',
    language: 'Tamil',

    caseTitle: '',
    caseType: 'Civil',
    caseDescription: '',
    incidentDate: '',
    incidentLocation: 'Theni',
    urgency: 'Medium',
    currentLegalStatus: '',
    previousReferenceNumber: '',

    opponentName: '',
    opponentType: 'Individual',
    opponentAddress: '',
    opponentContact: '',
    opponentExistingLawyer: '',

    courtState: user?.state || 'Tamil Nadu',
    courtDistrict: user?.district || 'Theni',
    courtCity: user?.location || 'Theni',
    courtTier: 'District Court',
    courtName: user?.district ? `${user.district} District Court` : 'District Court, Theni',
    courtRegistration: 'Combined Court Complex, Theni',
    courtChangeReason: '',

    // Chosen Advocate / Legal Counsel
    chosenLawyer: '',
    chosenLawyerName: '',
    chosenLawyerDetails: null,

    documents: [],
  });

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleDistrictChange = (district) => {
    setForm(prev => {
      let derivedCourt = prev.courtName;
      if (prev.courtTier === 'District Court') {
        derivedCourt = district.trim() ? `${district.trim()} District Court` : '';
      } else if (prev.courtTier === 'High Court') {
        derivedCourt = district.trim() ? `${district.trim()} High Court` : `${prev.courtState || 'State'} High Court`;
      } else if (prev.courtTier === 'Supreme Court') {
        derivedCourt = 'Supreme Court of India';
      }
      return {
        ...prev,
        courtDistrict: district,
        courtCity: prev.courtCity || district,
        courtName: derivedCourt
      };
    });
  };

  const handleTierSelect = (tier) => {
    setForm(prev => {
      let derivedCourt = '';
      const dist = prev.courtDistrict.trim();
      const state = prev.courtState.trim();
      if (tier === 'District Court') {
        derivedCourt = dist ? `${dist} District Court` : 'District Court';
      } else if (tier === 'High Court') {
        derivedCourt = (state || dist) ? `${state || dist} High Court` : 'State High Court';
      } else if (tier === 'Supreme Court') {
        derivedCourt = 'Supreme Court of India';
      }
      return {
        ...prev,
        courtTier: tier,
        courtName: derivedCourt
      };
    });
  };

  const handleNext = () => {
    if (step === 4 && form.courtTier !== 'District Court' && !form.courtChangeReason.trim()) {
      setError('Please provide a legal justification for requesting High Court or Supreme Court elevation.');
      return;
    }
    setError('');
    setStep(s => s + 1);
  };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const handleSelectLawyer = (lawyer) => {
    const rawId = lawyer.userId?._id || lawyer.userId || lawyer._id;
    const name = lawyer.fullName || lawyer.name || lawyer.userId?.name || 'Advocate';
    
    // Toggle selection
    if (form.chosenLawyer === rawId) {
      setForm(prev => ({
        ...prev,
        chosenLawyer: '',
        chosenLawyerName: '',
        chosenLawyerDetails: null
      }));
    } else {
      setForm(prev => ({
        ...prev,
        chosenLawyer: rawId,
        chosenLawyerName: name,
        chosenLawyerDetails: lawyer
      }));
    }
  };

  const handleClearLawyerSelection = () => {
    setForm(prev => ({
      ...prev,
      chosenLawyer: '',
      chosenLawyerName: '',
      chosenLawyerDetails: null
    }));
  };

  const buildPayload = (status) => ({
    caseTitle: (form.caseTitle || '').trim() || `${form.caseType || 'Civil'} Legal Aid Petition`,
    caseType: form.caseType || 'Civil',
    description: (form.caseDescription || '').trim() || `${form.caseType || 'Civil'} legal matter filed through portal.`,
    incidentDate: form.incidentDate || undefined,
    incidentLocation: form.incidentLocation || form.city || 'Theni',
    currentLegalStatus: form.currentLegalStatus || 'Initial Filing',
    previousReferenceNumber: form.previousReferenceNumber || undefined,
    urgency: form.urgency || 'Medium',
    courtChangeReason: form.courtChangeReason || '',
    chosenLawyer: form.chosenLawyer || undefined,
    representationStatus: form.chosenLawyer ? 'Requested' : 'None',
    requestDate: form.chosenLawyer ? new Date() : undefined,
    opponent: {
      name: form.opponentName || 'Pending Opponent Filing',
      type: form.opponentType || 'Individual',
      address: form.opponentAddress || '',
      contact: form.opponentContact || '',
      existingLawyer: form.opponentExistingLawyer || '',
    },
    courtDetails: {
      state: form.courtState || 'Tamil Nadu',
      district: form.courtDistrict || 'Theni',
      city: form.courtCity || 'Theni',
      courtTier: form.courtTier || 'District Court',
      courtName: form.courtName || (form.courtDistrict ? `${form.courtDistrict} ${form.courtTier}` : 'District Court, Theni'),
      registration: form.courtRegistration || 'Combined Court Complex, Theni',
    },
    court: form.courtName || (form.courtDistrict ? `${form.courtDistrict} ${form.courtTier}` : 'District Court, Theni'),
    location: form.courtCity || form.courtDistrict || 'Theni, Tamil Nadu',
    status: form.chosenLawyer ? 'PendingLawyerAcceptance' : status,
  });

  const persistDraft = async () => {
    if (draftId) {
      const resp = await axios.put(`/applications/${draftId}`, buildPayload('Draft'));
      return resp.data._id;
    } else {
      const resp = await axios.post('/applications', buildPayload('Draft'));
      setDraftId(resp.data._id);
      return resp.data._id;
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    try {
      await persistDraft();
      setSuccess('Draft saved! You can continue later from your dashboard.');
      setTimeout(() => { setSuccess(''); onClose(); }, 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again to save drafts.');
        localStorage.removeItem('legalAidToken');
        localStorage.removeItem('legalAidUser');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
        return;
      }
      setError('Could not save draft: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      let appId = draftId;
      if (!appId) {
        appId = await persistDraft();
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('application', appId);
      formData.append('category', 'Evidence');

      const resp = await axios.post('/documents', formData);

      setForm(prev => ({
        ...prev,
        documents: [...prev.documents, {
          id: resp.data._id,
          name: resp.data.originalName,
          size: resp.data.size,
          status: 'Pending Verification',
        }]
      }));
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveDoc = (docId) => {
    setForm(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId)
    }));
  };

  const handleSubmit = async () => {
    if (!form.caseTitle || !form.caseTitle.trim()) { setError('Please provide a Case Title.'); return; }
    if (!form.caseDescription || !form.caseDescription.trim()) { setError('Please provide a detailed case description.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const targetStatus = form.chosenLawyer ? 'PendingLawyerAcceptance' : 'Submitted';
      let savedResp;
      if (draftId) {
        savedResp = await axios.put(`/applications/${draftId}`, buildPayload(targetStatus));
      } else {
        savedResp = await axios.post('/applications', buildPayload(targetStatus));
      }
      const generatedRef = savedResp?.data?.caseId || savedResp?.data?._id || 'Registered';
      
      if (form.chosenLawyer) {
        setSuccess(`Case submitted successfully! Representation request sent to ${form.chosenLawyerName || 'Counsel'}. Upon advocate acceptance, it will be forwarded to Court Staff for hearing scheduling.`);
      } else {
        setSuccess(`Application submitted successfully! Case Reference CNR: ${generatedRef}`);
      }

      setTimeout(() => { onSuccess(); }, 2200);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired or user context was reset. Please log in to submit your case.');
        localStorage.removeItem('legalAidToken');
        localStorage.removeItem('legalAidUser');
        setTimeout(() => { window.location.href = '/login'; }, 2200);
        return;
      }
      const errDetail = err.response?.data?.message || err.message || 'Submission failed. Please verify required fields and server availability.';
      setError('Submission failed: ' + errDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter lawyers by search query and category
  const filteredLawyers = lawyers.filter(l => {
    const name = (l.fullName || l.name || l.userId?.name || '').toLowerCase();
    const bar = (l.barRegistrationNumber || '').toLowerCase();
    const dist = (l.district || l.location || '').toLowerCase();
    const specs = (l.specializations || l.practiceAreas || []).map(s => String(s).toLowerCase()).join(' ');
    const bio = (l.bio || '').toLowerCase();

    const q = lawyerSearch.toLowerCase();
    const matchesSearch = !q || name.includes(q) || bar.includes(q) || dist.includes(q) || specs.includes(q) || bio.includes(q);

    if (!matchesSearch) return false;

    if (lawyerSpecializationFilter === 'All') return true;

    const cat = lawyerSpecializationFilter.toLowerCase();
    return specs.includes(cat) || (l.specialization && l.specialization.toLowerCase().includes(cat));
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-3xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale size={20} className="text-blue-600" />
              Case Registration & Counsel Wizard
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of {STEPS.length} — {STEPS[step - 1].title}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1 mb-6">
          {STEPS.map(s => (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.id ? 'bg-emerald-500 text-white' :
                step === s.id ? 'bg-blue-600 text-white ring-2 ring-blue-200 dark:ring-blue-900' :
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > s.id ? <CheckCircle size={14} /> : s.id}
              </div>
              <span className={`text-[9px] font-bold hidden sm:block ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              {error}
              {error.includes('log in') && (
                <div className="mt-2">
                  <a href="/login" className="inline-block px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition">
                    Go to Login Page
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            ✅ {success}
          </div>
        )}

        {/* ── STEP 1: Applicant Info ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                <input value={form.fullName} onChange={e => f('fullName', e.target.value)} className="form-input" placeholder="As per official ID" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => f('email', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                <input value={form.phone} onChange={e => f('phone', e.target.value)} className="form-input" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Language</label>
                <select value={form.language} onChange={e => f('language', e.target.value)} className="form-input">
                  <option>Tamil</option><option>English</option><option>Malayalam</option><option>Hindi</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
                <input value={form.address} onChange={e => f('address', e.target.value)} className="form-input" placeholder="Street / Door No / Locality" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City / Taluk</label>
                <input value={form.city} onChange={e => f('city', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
                <input value={form.district} onChange={e => f('district', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Case Details ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick Case Type Selector Bar */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Scale size={13} className="text-blue-600" />
                  Select Your Case Type <span className="text-blue-600 dark:text-blue-400 font-normal">(Click any type to auto-fill)</span>
                </label>
                {form.caseTitle && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Category: {form.caseType}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {QUICK_CASE_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSelectCasePreset(chip.title)}
                    className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      form.caseTitle === chip.title || selectedCasePreset === chip.title
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Choose from All Types of Cases *
                </label>
                <select
                  value={selectedCasePreset || (CASE_CATALOG.some(g => g.cases.some(c => c.title === form.caseTitle)) ? form.caseTitle : 'custom')}
                  onChange={e => handleSelectCasePreset(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="">-- Choose from catalog ({CASE_CATALOG.reduce((a, g) => a + g.cases.length, 0)} options) --</option>
                  {CASE_CATALOG.map(group => (
                    <optgroup key={group.group} label={`── ${group.group} ──`}>
                      {group.cases.map(c => (
                        <option key={c.title} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">✏️ Other / Custom Case Title</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Case Title *</label>
                <input 
                  value={form.caseTitle} 
                  onChange={e => {
                    f('caseTitle', e.target.value);
                    setSelectedCasePreset('custom');
                  }} 
                  className="form-input" 
                  placeholder="e.g. Mutual Consent Divorce Petition or Agricultural Land Boundary Dispute" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Case Category *</label>
                <select 
                  value={form.caseType} 
                  onChange={e => {
                    f('caseType', e.target.value);
                    setLawyerSpecializationFilter(e.target.value);
                  }} 
                  className="form-input"
                >
                  <option>Civil</option><option>Criminal</option><option>Family</option>
                  <option>Property</option><option>Consumer</option><option>Labour</option>
                  <option>Cyber Crime</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Urgency Level</label>
                <select value={form.urgency} onChange={e => f('urgency', e.target.value)} className="form-input">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Detailed Description *</label>
                <textarea rows="4" value={form.caseDescription} onChange={e => f('caseDescription', e.target.value)} className="form-input resize-none" placeholder="Describe the dispute in detail — events, dates, parties involved, relief sought..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incident Date</label>
                <input type="date" value={form.incidentDate} onChange={e => f('incidentDate', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incident Location</label>
                <input value={form.incidentLocation} onChange={e => f('incidentLocation', e.target.value)} className="form-input" placeholder="City, district, taluk" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Legal Status</label>
                <input value={form.currentLegalStatus} onChange={e => f('currentLegalStatus', e.target.value)} className="form-input" placeholder="e.g. Police complaint registered / Pre-litigation" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Previous Reference No.</label>
                <input value={form.previousReferenceNumber} onChange={e => f('previousReferenceNumber', e.target.value)} className="form-input" placeholder="FIR or petition reference if existing" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Opponent ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400">Provide opponent party information. Fields are optional but facilitate judicial summons preparation.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Name</label>
                <input value={form.opponentName} onChange={e => f('opponentName', e.target.value)} className="form-input" placeholder="Full name of respondent / opposing party" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Type</label>
                <select value={form.opponentType} onChange={e => f('opponentType', e.target.value)} className="form-input">
                  <option>Individual</option><option>Company</option><option>Government Body</option><option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Address</label>
                <input value={form.opponentAddress} onChange={e => f('opponentAddress', e.target.value)} className="form-input" placeholder="Residential or commercial address" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact</label>
                <input value={form.opponentContact} onChange={e => f('opponentContact', e.target.value)} className="form-input" placeholder="Phone or email" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent's Existing Lawyer</label>
                <input value={form.opponentExistingLawyer} onChange={e => f('opponentExistingLawyer', e.target.value)} className="form-input" placeholder="Advocate name if known" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Court & Venue ── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Court Routing & Jurisdiction Selection</p>
              <p className="text-xs text-slate-400">Enter your district to automatically route to your local District Court, or elevate your filing to High Court or Supreme Court.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Court Jurisdiction Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: 'District Court', icon: '🏛️', desc: 'Local trial jurisdiction' },
                  { tier: 'High Court', icon: '⚖️', desc: 'Appellate & State bench' },
                  { tier: 'Supreme Court', icon: '👑', desc: 'Apex constitutional court' }
                ].map(({ tier, icon, desc }) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierSelect(tier)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      form.courtTier === tier
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 shadow-sm ring-1 ring-purple-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="text-base mb-1">{icon}</div>
                    <p className={`text-xs font-bold ${form.courtTier === tier ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {tier}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District (Auto-routes Court)</label>
                <input
                  value={form.courtDistrict}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Theni, Madurai, Chennai..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                <input
                  value={form.courtState}
                  onChange={e => {
                    const st = e.target.value;
                    f('courtState', st);
                    if (form.courtTier === 'High Court' && !form.courtDistrict) {
                      f('courtName', `${st} High Court`);
                    }
                  }}
                  className="form-input"
                  placeholder="e.g. Tamil Nadu"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City / Municipal Ward</label>
                <input value={form.courtCity} onChange={e => f('courtCity', e.target.value)} className="form-input" placeholder="e.g. Combined Court Complex, Theni" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Court Venue</label>
                <input
                  value={form.courtName}
                  onChange={e => f('courtName', e.target.value)}
                  className="form-input font-medium"
                  placeholder="e.g. Combined Court Complex, Theni"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Existing Court Case Registration No.</label>
                <input value={form.courtRegistration} onChange={e => f('courtRegistration', e.target.value)} className="form-input" placeholder="Leave blank if not yet registered" />
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <div>
                  <p className="font-bold text-purple-900 dark:text-purple-300">
                    Proposed Court: {form.courtName || (form.courtDistrict ? `${form.courtDistrict} ${form.courtTier}` : 'Pending District Entry')}
                  </p>
                  <p className="text-[10px] text-purple-700/80 dark:text-purple-400">
                    Tier: <span className="font-bold">{form.courtTier}</span> {form.courtDistrict ? `• Local District: ${form.courtDistrict}` : ''}
                  </p>
                </div>
              </div>
              <span className="badge badge-purple text-[9px] uppercase font-bold shrink-0">Auto-Routed</span>
            </div>

            {form.courtTier !== 'District Court' && (
              <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2 text-xs animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-base text-amber-600 mt-0.5">⚠️</span>
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Higher Court Jurisdiction Notice ({form.courtTier})
                    </p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed mt-0.5">
                      Direct filing requires valid appellate or constitutional grounds. The transfer will be confirmed upon Administrative Review.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    Legal Reason for Higher Court Elevation *
                  </label>
                  <textarea
                    value={form.courtChangeReason}
                    onChange={e => f('courtChangeReason', e.target.value)}
                    placeholder="Provide specific legal grounds (e.g. Constitutional writ petition under Article 226, appeal against trial court decree)..."
                    rows={2}
                    className="form-input text-xs w-full resize-none border-amber-300 dark:border-amber-800 focus:border-amber-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Select Legal Counsel (Advocate) ── */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 rounded-2xl flex items-start gap-3">
              <Scale size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Select Your Legal Aid Advocate (Multi-Tier Sequential Workflow)
                </h5>
                <p className="text-[11px] text-blue-700/90 dark:text-blue-300/90 leading-relaxed mt-0.5">
                  1. Your case will be sent directly to the selected Advocate.<br />
                  2. Upon review and acceptance by the Advocate, it automatically forwards to <strong>Court Staff</strong>.<br />
                  3. Court Staff reviews, confirms docket admission, and schedules your hearing date and courtroom.
                </p>
              </div>
            </div>

            {/* Option to Auto-Assign vs Select Counsel */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleClearLawyerSelection}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  !form.chosenLawyer
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">🏛️</span>
                    {!form.chosenLawyer && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <h6 className="text-xs font-bold text-slate-900 dark:text-white">Auto-Assign Panel Lawyer</h6>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Court administration assigns the best matching verified legal aid counsel.
                  </p>
                </div>
              </button>

              <div
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  form.chosenLawyer
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">⚖️</span>
                    {form.chosenLawyer && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={11} /> Selected
                      </span>
                    )}
                  </div>
                  <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {form.chosenLawyer ? form.chosenLawyerName : 'Pick Specific Advocate'}
                  </h6>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {form.chosenLawyer
                      ? 'Case will be forwarded directly to this advocate for acceptance.'
                      : 'Select any advocate below from the legal aid panel.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={lawyerSearch}
                    onChange={e => setLawyerSearch(e.target.value)}
                    placeholder="Search advocate by name, bar registration, or practice area..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                  {lawyerSearch && (
                    <button
                      type="button"
                      onClick={() => setLawyerSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Specialization Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Specialization:</span>
                {LAWYER_SPECIALIZATION_FILTERS.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setLawyerSpecializationFilter(spec)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      lawyerSpecializationFilter === spec
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Lawyer Cards List */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {loadingLawyers ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading verified advocates from Legal Aid Panel...</p>
                </div>
              ) : filteredLawyers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Briefcase size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No advocates matched your search</p>
                  <p className="text-[10px]">Try clearing filters or choose "Auto-Assign Panel Lawyer".</p>
                  <button
                    type="button"
                    onClick={() => { setLawyerSearch(''); setLawyerSpecializationFilter('All'); }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                filteredLawyers.map(l => {
                  const rawId = l.userId?._id || l.userId || l._id;
                  const name = l.fullName || l.name || l.userId?.name || 'Advocate';
                  const isSelected = form.chosenLawyer === rawId;
                  const specs = l.specializations || l.practiceAreas || (l.specialization ? [l.specialization] : ['Civil', 'General']);
                  const exp = l.experience || l.experienceYears || 10;
                  const rating = l.rating || 4.9;
                  const successRate = l.successRate || 95;
                  const bar = l.barRegistrationNumber || l.barNumber || 'Bar Council Reg. Verified';
                  const dist = l.district || l.location || 'Theni District Court';

                  return (
                    <div
                      key={l._id}
                      onClick={() => handleSelectLawyer(l)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500 shadow-sm'
                          : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {name}
                            </h6>
                            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {bar}
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Free Legal Aid Panel
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Briefcase size={11} className="text-slate-400" />
                              {exp} Years Experience
                            </span>
                            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              {rating} ({successRate}% success)
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" />
                              {dist}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {specs.slice(0, 3).map((sp, idx) => (
                              <span key={idx} className="text-[9px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check size={13} /> Selected Counsel
                            </>
                          ) : (
                            'Select Advocate'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── STEP 6: Documents ── */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              Upload supporting documents: ID, police reports, income proof, evidence, affidavits, etc.
              Files are securely stored and verified by Court Staff during docket review.
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleDocumentUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-sm font-bold cursor-pointer"
            >
              <Upload size={22} className="mb-1" />
              {isUploading ? 'Uploading...' : 'Click to Upload Document'}
              <span className="text-[10px] font-normal mt-1">PDF, JPG, PNG, DOC — Max 10MB</span>
            </button>
            <div className="space-y-2 mt-2">
              {form.documents.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-3">No documents attached yet. You can submit without documents and upload them later.</p>
              )}
              {form.documents.map((doc) => (
                <div key={doc.id || doc.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{doc.name}</p>
                      {doc.size && <p className="text-[10px] text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">{doc.status}</span>
                    <button type="button" onClick={() => handleRemoveDoc(doc.id)} className="text-slate-300 hover:text-red-500 transition cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 7: Review & Submit ── */}
        {step === 7 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Case Title</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.caseTitle || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Category</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.caseType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Urgency</p>
                  <p className={`font-bold ${form.urgency === 'High' ? 'text-red-500' : form.urgency === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{form.urgency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Court & Tier</p>
                  <p className="font-bold text-purple-700 dark:text-purple-300">{form.courtName || `${form.courtTier}`}</p>
                  <span className="badge badge-purple text-[8px] uppercase mt-0.5">{form.courtTier}</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">District</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.courtDistrict || 'District Court'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Opponent</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.opponentName || 'Not specified'}</p>
                </div>

                {/* Selected Legal Counsel Card */}
                <div className="col-span-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">
                    Requested Legal Aid Counsel
                  </p>
                  {form.chosenLawyer ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Scale size={14} className="text-blue-600" />
                          {form.chosenLawyerName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Workflow: Request sent to Advocate → Advocate Accepts → Court Staff Confirms Docket & Schedules Hearing
                        </p>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                        Pending Advocate Acceptance
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Auto-Assign Panel Lawyer
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Court Registry administration will assign an appropriate advocate from the legal aid roster.
                        </p>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        Registry Panel Allocation
                      </span>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Description</p>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-3">{form.caseDescription || '—'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <FileText size={12} className="text-blue-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">{form.documents.length} Document(s) attached</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              ⚠️ By submitting, you confirm all provided information is truthful and accurate to the best of your knowledge.
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-xs font-bold text-blue-600 hover:underline transition cursor-pointer"
          >
            💾 Save as Draft
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn-secondary text-xs font-bold px-4 flex items-center gap-1 cursor-pointer">
                <ArrowLeft size={13} /> Back
              </button>
            )}
            {step < 7 ? (
              <button type="button" onClick={handleNext} className="btn-primary text-xs font-bold px-5 flex items-center gap-1 cursor-pointer">
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-xs font-bold px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-60 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <CheckCircle size={14} />
                {isSubmitting ? 'Submitting Petition...' : form.chosenLawyer ? 'Submit to Advocate for Approval' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistrationWizard;