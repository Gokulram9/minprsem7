import { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCheck, Shield, ChevronRight, ChevronLeft, UploadCloud, 
  Trash2, Sparkles, Check, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { AuthContext } from '../contexts/AuthContext';

const steps = [
  { id: 1, name: 'Identity' },
  { id: 2, name: 'Address' },
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
    phone: '',
    role: 'Applicant',
    address: '',
    city: '',
    zip: '',
    idType: 'Aadhaar Card',
    idNumber: '',
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      return formData.name && formData.email && formData.phone;
    }
    if (currentStep === 2) {
      return formData.address && formData.city && formData.zip;
    }
    if (currentStep === 3) {
      return formData.idNumber && uploadedFile;
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage calculation
  const progressPercent = useMemo(() => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  }, [currentStep]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[24px] glass-card"
        >
          
          {/* STEP INDICATOR HEADER */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-8 dark:border-slate-800 dark:bg-slate-900/30">
            
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-blue-600 dark:text-blue-400">Lexora Registration</p>
                <h1 className="font-space text-2xl font-bold tracking-tight mt-1">Create legal aid account</h1>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {/* Stepper circles */}
            <div className="mt-8 flex items-center justify-between relative">
              
              {/* Stepper background progress bar line */}
              <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-800 -z-10" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 transition-all duration-300 -z-10" 
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
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : active 
                          ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50 dark:bg-slate-950 dark:ring-blue-950/40' 
                          : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      {completed ? <Check size={14} /> : step.id}
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
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
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1: Onboarding Credentials</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Legal Name</label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        placeholder="Johnathan Doe"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Registration Role</label>
                      <input 
                        type="text"
                        value="Applicant (Citizen Legal Seeker)"
                        disabled
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-450 outline-none dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
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
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Contact</label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleTextChange}
                        placeholder="+1 (555) 012-3456"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 2: Geographical Demographics</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Street Address</label>
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
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City</label>
                      <Input 
                        name="city"
                        value={formData.city}
                        onChange={handleTextChange}
                        placeholder="New Delhi"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Postal Zip Code</label>
                      <Input 
                        name="zip"
                        value={formData.zip}
                        onChange={handleTextChange}
                        placeholder="110001"
                        className="rounded-2xl bg-white/70 dark:bg-slate-900/50"
                        required
                      />
                    </div>
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
                    <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900 text-xs">
                      <div>
                        <p className="text-slate-400">Full Name</p>
                        <p className="font-semibold mt-1 text-slate-900 dark:text-white">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Role Request</p>
                        <p className="font-semibold mt-1 text-slate-900 dark:text-white">{formData.role}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Email Address</p>
                        <p className="font-semibold mt-1 text-slate-900 dark:text-white">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">ID proof</p>
                        <p className="font-semibold mt-1 text-slate-900 dark:text-white">{uploadedFile || 'None'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Shield size={14} className="text-blue-500" /> Terms of Legal Declaration
                    </span>
                    <p className="mt-1 leading-relaxed">
                      I declare that all details submitted correspond to my certified legal identity. I agree to register on Lexora systems and participate in scheduled hearings under court rules.
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
                    className="rounded-xl flex items-center gap-1 h-10 px-5"
                  >
                    Next <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="rounded-xl flex items-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-500"
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
