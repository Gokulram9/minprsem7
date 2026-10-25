import { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  UserCheck, Shield, ChevronRight, ChevronLeft, UploadCloud, 
  Trash2, Sparkles, Check, CheckCircle2, RefreshCw, Scale 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { AuthContext } from '../contexts/AuthContext';
import InteractiveCanvasBackground from '../components/InteractiveCanvasBackground';


const steps = [
  { id: 1, name: 'Identity' },
  { id: 2, name: 'Address & District' },
  { id: 3, name: 'Verification' },
  { id: 4, name: 'Preview' }
];

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Multi-step States
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Applicant',
    address: '',
    city: 'Theni',
    district: 'Theni',
    state: 'Tamil Nadu',
    zip: '625531',
    specialization: 'Civil Litigation',
    barRegistrationNumber: '',
    courtLevel: 'District Court',
    idType: 'Aadhaar Card',
    idNumber: '',
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form field changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mock File Drag/Drop
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handlePicUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Validation before changing step
  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.name && formData.email && formData.phone && formData.password;
    }
    if (currentStep === 2) {
      return formData.address && formData.city && formData.district && formData.state;
    }
    if (currentStep === 3) {
      return formData.idNumber;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      alert('Please fill out all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role || 'Applicant',
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        location: formData.district || formData.city,
        specialization: formData.role === 'Lawyer' ? formData.specialization : undefined,
        barRegistrationNumber: formData.role === 'Lawyer' ? formData.barRegistrationNumber : undefined,
        courtLevel: formData.role === 'Lawyer' ? formData.courtLevel : undefined,
      };

      const res = await axios.post('/auth/register', payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Registration failed');
      alert(`Registration Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage calculation
  const progressPercent = useMemo(() => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  }, [currentStep]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden">
      <InteractiveCanvasBackground density={50} maxDistance={120} speed={0.5} interactive={true} />
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[24px] glass-card"
        >
          
          {/* STEP INDICATOR HEADER */}
          <div className="border-b border-slate-100 bg-[#FAF9F5]/70 p-8 dark:border-slate-800 dark:bg-[#202A3B]/40">
            
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B69B72]">Seven Seas Portal</p>
                <h1 className="font-space text-2xl font-bold tracking-tight mt-1">Create legal aid account</h1>
              </div>
              <span className="rounded-full bg-[#B69B72]/15 px-3 py-1 text-xs font-bold text-[#B69B72] dark:bg-[#B69B72]/25 dark:text-[#D9C7A5]">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {/* Stepper circles */}
            <div className="mt-8 flex items-center justify-between relative">
              
              {/* Stepper background progress bar line */}
              <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-800 -z-10" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-[#B69B72] transition-all duration-300 -z-10" 
                style={{ width: `${progressPercent}%` }}
              />

              {steps.map((step) => {
                const active = currentStep >= step.id;
                const completed = currentStep > step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <div 
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold border transition duration-300 ${
                        completed 
                          ? 'bg-[#202A3B] border-[#B69B72] text-[#B69B72]' 
                          : active 
                          ? 'bg-white border-[#B69B72] text-[#202A3B] ring-4 ring-[#B69B72]/20 dark:bg-[#1B2332] dark:text-[#D9C7A5]' 
                          : 'bg-white border-slate-200 text-slate-400 dark:bg-[#1B2332] dark:border-slate-800'
                      }`}
                    >
                      {completed ? <Check size={14} /> : step.id}
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? 'text-[#202A3B] dark:text-white font-semibold' : 'text-slate-400'}`}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* REGISTRATION STEP CONTENT */}
          <div className="p-8 sm:p-10 relative">
            
            {/* SUCCESS TRIGGER REDIRECT */}
            {success && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
                <h2 className="font-space text-xl font-bold mt-4">Account Provisioned</h2>
                <p className="text-xs text-slate-400 mt-1">Configuring role permissions & launching workspace...</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">

              {/* STEP 1: PERSONAL DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in-up">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1: Onboarding Credentials & Role</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Registration Role *</label>
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleTextChange}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <option value="Applicant">Applicant (Citizen Legal Seeker)</option>
                        <option value="Lawyer">Lawyer (Advocate / Legal Counsel)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Legal Name *</label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        placeholder={formData.role === 'Lawyer' ? 'Adv. Rajesh Verma' : 'Johnathan Doe'}
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address *</label>
                      <Input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleTextChange}
                        placeholder="john@example.com"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password *</label>
                      <Input 
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleTextChange}
                        placeholder="Min. 8 characters"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Contact *</label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleTextChange}
                        placeholder="+91 98765 43210"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                  </div>

                  {formData.role === 'Lawyer' && (
                    <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl grid gap-3 sm:grid-cols-3 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Bar Council Reg. No. *</label>
                        <input
                          name="barRegistrationNumber"
                          value={formData.barRegistrationNumber}
                          onChange={handleTextChange}
                          placeholder="e.g. BAR-DL-10928"
                          className="form-input text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Specialization</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleTextChange}
                          className="form-input text-xs"
                        >
                          <option value="Civil Litigation">Civil Litigation</option>
                          <option value="Criminal Defense">Criminal Defense</option>
                          <option value="Family & Matrimonial">Family & Matrimonial</option>
                          <option value="Property & Real Estate">Property & Real Estate</option>
                          <option value="Corporate & Commercial">Corporate & Commercial</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Practice Court Tier</label>
                        <select
                          name="courtLevel"
                          value={formData.courtLevel}
                          onChange={handleTextChange}
                          className="form-input text-xs"
                        >
                          <option value="District Court">District Court</option>
                          <option value="High Court">High Court</option>
                          <option value="Supreme Court">Supreme Court</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ADDRESS & DISTRICT ALLOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 2: Geographical Demographics & Jurisdiction</p>
                    <p className="text-xs text-slate-500 mt-0.5">Your registered district determines the default local court allocation for case filings.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Street Address *</label>
                    <Input 
                      name="address"
                      value={formData.address}
                      onChange={handleTextChange}
                      placeholder="120 Legal Plaza Dr Suite B"
                      className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">District (Local Jurisdiction) *</label>
                      <Input 
                        name="district"
                        value={formData.district}
                        onChange={handleTextChange}
                        placeholder="e.g. Chennai, Bangalore, Colombo, Mumbai"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">State / Province *</label>
                      <Input 
                        name="state"
                        value={formData.state}
                        onChange={handleTextChange}
                        placeholder="e.g. Tamil Nadu, Karnataka, Western Province"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City / Municipality *</label>
                      <Input 
                        name="city"
                        value={formData.city}
                        onChange={handleTextChange}
                        placeholder="e.g. Chennai / Metro"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Postal / Zip Code</label>
                      <Input 
                        name="zip"
                        value={formData.zip}
                        onChange={handleTextChange}
                        placeholder="600001"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  {/* Dynamic Court Allocation Card */}
                  <div className="p-3.5 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl text-xs space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Scale size={16} /> Default Trial Court Allocation
                      </span>
                      <span className="badge badge-purple text-[9px] uppercase font-bold">Auto-Routed</span>
                    </div>
                    <p className="text-purple-800 dark:text-purple-300 text-xs font-semibold mt-1">
                      🏛️ {formData.district ? `${formData.district} District Court` : 'Local District Court (enter district above)'}
                    </p>
                    <p className="text-[10px] text-purple-600/80 dark:text-purple-400">
                      Tier: <strong>District Court</strong> {formData.state ? `· State: ${formData.state}` : ''} · Court dockets and legal aid will automatically route to this venue.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: IDENTITY & DOCUMENT UPLOAD */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in-up">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 3: Verification Credentials</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Identity Document Type</label>
                      <select 
                        name="idType"
                        value={formData.idType}
                        onChange={handleTextChange}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Driver License">Driver's License</option>
                        <option value="Passport">Passport</option>
                        <option value="Bar Association ID">Bar Association ID</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Document ID Number</label>
                      <Input 
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleTextChange}
                        placeholder="ID-9281-3847"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Drag-Drop Vault Simulation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Upload Identity Proof</label>
                    <div className="rounded-[1.75rem] border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 transition relative">
                      <input 
                        type="file" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="mx-auto h-10 w-10 text-slate-400 animate-pulse" />
                      <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {uploadedFile ? `Attached: ${uploadedFile}` : 'Drag and drop identity PDF or click to browse'}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">Accepted formats: PDF, PNG, JPG up to 10MB.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PREVIEW & PIC UPLOAD */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in-up">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 4: Profile Preview & Submission</p>
                  
                  <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                    {/* Profile Picture Upload preview */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                        {profilePic ? (
                          <img src={profilePic} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">Pic</div>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          onChange={handlePicUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer h-8 w-full"
                        />
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">
                          Upload Photo
                        </span>
                      </div>
                    </div>

                    {/* Summary list */}
                    <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900 text-xs">
                      <div>
                        <p className="text-slate-400">Full Name</p>
                        <p className="font-semibold mt-0.5 text-slate-900 dark:text-white">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Role</p>
                        <p className="font-semibold mt-0.5 text-blue-600 dark:text-blue-400">{formData.role}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Email Address</p>
                        <p className="font-semibold mt-0.5 text-slate-900 dark:text-white">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Registered District & State</p>
                        <p className="font-semibold mt-0.5 text-slate-900 dark:text-white">{formData.district}, {formData.state}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Allocated Default Court</p>
                        <p className="font-semibold mt-0.5 text-purple-700 dark:text-purple-300">
                          🏛️ {formData.district ? `${formData.district} District Court` : 'District Court'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">ID proof</p>
                        <p className="font-semibold mt-0.5 text-slate-900 dark:text-white">{uploadedFile || formData.idNumber || 'Recorded'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Shield size={14} className="text-blue-500" /> Terms of Legal Declaration
                    </span>
                    <p className="mt-1 leading-relaxed">
                      I declare that all details submitted correspond to my certified legal identity. My district details will establish my primary court allocation under procedural law.
                    </p>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-6 dark:border-slate-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < steps.length ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    className="btn-gold rounded-xl flex items-center gap-1 h-10 px-5 text-white"
                  >
                    Next <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="btn-gold rounded-xl flex items-center gap-2 h-10 px-6 text-white"
                  >
                    {loading && <RefreshCw size={14} className="animate-spin" />}
                    Complete Registration
                  </Button>
                )}
              </div>

            </form>
          </div>

        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
