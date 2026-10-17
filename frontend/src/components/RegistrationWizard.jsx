import { useState, useContext, useRef } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, X, Trash2, FileText, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Applicant Info', icon: '👤' },
  { id: 2, title: 'Case Details',   icon: '📋' },
  { id: 3, title: 'Opponent',       icon: '⚔️' },
  { id: 4, title: 'Court & Venue',  icon: '🏛️' },
  { id: 5, title: 'Documents',      icon: '📎' },
  { id: 6, title: 'Review',         icon: '✅' },
];

const RegistrationWizard = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(null); // ID of saved draft
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    state: '',
    language: 'English',

    caseTitle: '',
    caseType: 'Civil',
    caseDescription: '',
    incidentDate: '',
    incidentLocation: '',
    urgency: 'Medium',
    currentLegalStatus: '',
    previousReferenceNumber: '',

    opponentName: '',
    opponentType: 'Individual',
    opponentAddress: '',
    opponentContact: '',
    opponentExistingLawyer: '',

    courtState: '',
    courtDistrict: '',
    courtCity: '',
    courtName: '',
    courtRegistration: '',

    documents: [], // { name, size, status, id? }
  });

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const handleNext = () => { setError(''); setStep(s => s + 1); };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const buildPayload = (status) => ({
    caseTitle: form.caseTitle || `${form.caseType} Case`,
    caseType: form.caseType,
    description: form.caseDescription || `${form.caseType} legal matter`,
    incidentDate: form.incidentDate || undefined,
    incidentLocation: form.incidentLocation,
    currentLegalStatus: form.currentLegalStatus,
    previousReferenceNumber: form.previousReferenceNumber,
    urgency: form.urgency,
    opponent: {
      name: form.opponentName,
      type: form.opponentType,
      address: form.opponentAddress,
      contact: form.opponentContact,
      existingLawyer: form.opponentExistingLawyer,
    },
    courtDetails: {
      state: form.courtState,
      district: form.courtDistrict,
      city: form.courtCity,
      courtName: form.courtName,
      registration: form.courtRegistration,
    },
    status,
  });

  // Save current data as draft on server
  const persistDraft = async () => {
    try {
      if (draftId) {
        const resp = await axios.put(`/applications/${draftId}`, buildPayload('Draft'));
        return resp.data._id;
      } else {
        const resp = await axios.post('/applications', buildPayload('Draft'));
        setDraftId(resp.data._id);
        return resp.data._id;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    try {
      await persistDraft();
      setSuccess('Draft saved! You can continue later from your dashboard.');
      setTimeout(() => { setSuccess(''); onClose(); }, 2000);
    } catch (err) {
      setError('Could not save draft: ' + (err.response?.data?.message || err.message));
    }
  };

  // Upload a real document file
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      // First ensure we have a draft to attach to
      let appId = draftId;
      if (!appId) {
        appId = await persistDraft();
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('application', appId);
      formData.append('category', 'Evidence');

      const resp = await axios.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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
    if (!form.caseTitle) { setError('Please provide a Case Title.'); return; }
    if (!form.caseDescription) { setError('Please provide a case description.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      if (draftId) {
        await axios.put(`/applications/${draftId}`, buildPayload('Submitted'));
      } else {
        await axios.post('/applications', buildPayload('Submitted'));
      }
      setSuccess('Application submitted successfully! Your Case ID will appear in your dashboard.');
      setTimeout(() => { onSuccess(); }, 2000);
    } catch (err) {
      setError('Submission failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Case Registration Wizard</h4>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of {STEPS.length} — {STEPS[step - 1].title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
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
            {error}
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
                <input value={form.fullName} onChange={e => f('fullName', e.target.value)} className="form-input" placeholder="As per ID" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => f('email', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                <input value={form.phone} onChange={e => f('phone', e.target.value)} className="form-input" placeholder="+94 77 000 0000" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Language</label>
                <select value={form.language} onChange={e => f('language', e.target.value)} className="form-input">
                  <option>English</option><option>Sinhala</option><option>Tamil</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address</label>
                <input value={form.address} onChange={e => f('address', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Case Title *</label>
                <input value={form.caseTitle} onChange={e => f('caseTitle', e.target.value)} className="form-input" placeholder="e.g. Land Boundary Dispute – Village Road" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Case Category *</label>
                <select value={form.caseType} onChange={e => f('caseType', e.target.value)} className="form-input">
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
                <textarea rows="4" value={form.caseDescription} onChange={e => f('caseDescription', e.target.value)} className="form-input resize-none" placeholder="Describe the dispute in detail — events, dates, parties involved..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incident Date</label>
                <input type="date" value={form.incidentDate} onChange={e => f('incidentDate', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incident Location</label>
                <input value={form.incidentLocation} onChange={e => f('incidentLocation', e.target.value)} className="form-input" placeholder="City, district" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Legal Status</label>
                <input value={form.currentLegalStatus} onChange={e => f('currentLegalStatus', e.target.value)} className="form-input" placeholder="e.g. Police complaint filed" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Previous Reference No.</label>
                <input value={form.previousReferenceNumber} onChange={e => f('previousReferenceNumber', e.target.value)} className="form-input" placeholder="If existing" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Opponent ── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400">Provide opponent information to the best of your knowledge. Fields are optional but improve AI matching.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Name</label>
                <input value={form.opponentName} onChange={e => f('opponentName', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Type</label>
                <select value={form.opponentType} onChange={e => f('opponentType', e.target.value)} className="form-input">
                  <option>Individual</option><option>Company</option><option>Government Body</option><option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent Address</label>
                <input value={form.opponentAddress} onChange={e => f('opponentAddress', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact</label>
                <input value={form.opponentContact} onChange={e => f('opponentContact', e.target.value)} className="form-input" placeholder="Phone / email" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opponent's Lawyer</label>
                <input value={form.opponentExistingLawyer} onChange={e => f('opponentExistingLawyer', e.target.value)} className="form-input" placeholder="Name if known" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Court & Venue ── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400">Help us route your case to the correct court and match local lawyers.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Province / State</label>
                <input value={form.courtState} onChange={e => f('courtState', e.target.value)} className="form-input" placeholder="e.g. Western Province" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
                <input value={form.courtDistrict} onChange={e => f('courtDistrict', e.target.value)} className="form-input" placeholder="e.g. Colombo" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                <input value={form.courtCity} onChange={e => f('courtCity', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Court Name</label>
                <input value={form.courtName} onChange={e => f('courtName', e.target.value)} className="form-input" placeholder="e.g. Colombo District Court" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Existing Court Case Registration No.</label>
                <input value={form.courtRegistration} onChange={e => f('courtRegistration', e.target.value)} className="form-input" placeholder="Leave blank if not yet registered" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Documents ── */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              Upload supporting documents: ID, police reports, income proof, evidence, affidavits, etc.
              Files are securely stored and pending admin verification.
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleDocumentUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-sm font-bold"
            >
              <Upload size={22} className="mb-1" />
              {isUploading ? 'Uploading...' : 'Click to Upload Document'}
              <span className="text-[10px] font-normal mt-1">PDF, JPG, PNG, DOC — Max 10MB</span>
            </button>
            <div className="space-y-2 mt-2">
              {form.documents.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-3">No documents attached yet. You can submit without documents and add them later.</p>
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
                    <button type="button" onClick={() => handleRemoveDoc(doc.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 6: Review & Submit ── */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
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
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Court</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.courtName || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Opponent</p>
                  <p className="font-bold text-slate-800 dark:text-white">{form.opponentName || 'Not specified'}</p>
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
            className="text-xs font-bold text-blue-600 hover:underline transition"
          >
            💾 Save as Draft
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn-secondary text-xs font-bold px-4 flex items-center gap-1">
                <ArrowLeft size={13} /> Back
              </button>
            )}
            {step < 6 ? (
              <button type="button" onClick={handleNext} className="btn-primary text-xs font-bold px-5 flex items-center gap-1">
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-xs font-bold px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-60"
              >
                <CheckCircle size={14} />
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;
