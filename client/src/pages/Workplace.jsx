import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight, PlusCircle, ArrowRight, UserPlus, FileText, CheckCircle, Scale, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../contexts/AuthContext';

const Workplace = () => {
  const { user } = useContext(AuthContext);

  const instructions = [
    {
      step: 'Step 1',
      title: 'Create a Legal Aid Account',
      desc: 'Click on the "Register" button in the navigation header. Fill in your Legal Name, Email, Address, and verify your ID (Aadhaar or Government card). Note: Self-registration is active for Citizens; Lawyers must be added by a portal Admin.',
      icon: UserPlus,
      color: '#B69D74',
    },
    {
      step: 'Step 2',
      title: 'Enter Secure Citizen Workspace',
      desc: 'Sign in to the workspace portal. If you are an Applicant/User, you will land on the Applicant Dashboard. Lawyers and Admins land on their custom analytical command workspaces.',
      icon: Scale,
      color: '#1F2839',
    },
    {
      step: 'Step 3',
      title: 'Submit Legal Aid Case Dossier',
      desc: 'Go to the "Applications" tab on your sidebar. Click "New Application" and specify your case details. Drag and drop supporting proofs, address ids, and income statements directly into our secure cloud vault.',
      icon: FileText,
      color: '#2563EB',
    },
    {
      step: 'Step 4',
      title: 'Verify AI Counsel Recommendations',
      desc: 'Our recommendation engine scans the case details, matches the legal expertise required, and assigns the best partner defense advocate to represent you in court.',
      icon: CheckCircle,
      color: '#16A34A',
    },
    {
      step: 'Step 5',
      title: 'Join Virtual Chamber Hearings',
      desc: 'Upon scheduling approvals, view your court date in the "Calendar" tab. Click the virtual link to join remote chambers securely within your browser. Reminders will be dispatched via email 24 hours prior.',
      icon: Calendar,
      color: '#B69D74',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-12">
        {/* Cases telemetry summary */}
        <div className="card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl text-center space-y-5 shadow-sm">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-[#FAF8F3] text-[#B69D74] flex items-center justify-center border border-[#B69D74]/20 animate-pulse">
              <ShieldAlert size={28} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#1F2839] dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No Active Cases Registered
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              You are currently browsing the public workspace directory. Register or log in to file aid requests, lookup schedules, or communicate with assigned advocates.
            </p>
          </div>
          
          <div className="pt-2">
            {user ? (
              <Link to="/dashboard">
                <button className="btn-primary px-6 py-3 text-xs bg-[#1F2839] hover:bg-[#1a2230] text-white">
                  Enter Dashboard Workspace <ArrowRight size={14} className="ml-1" />
                </button>
              </Link>
            ) : (
              <div className="flex justify-center gap-3">
                <Link to="/register">
                  <button className="btn-primary px-6 py-3 text-xs bg-[#B69D74] hover:bg-[#a58c63] text-white shadow-lg shadow-[#B69D74]/15">
                    Register Citizen Account
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-secondary px-6 py-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border">
                    Login Portal
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Block */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F3FF] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#6D28D9]">
              Instructions Guide
            </span>
            <h2 className="text-2xl font-extrabold text-[#1F2839] dark:text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              How to Register & Use the Platform
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Follow these simple steps to onboarding and launching case trackers.
            </p>
          </div>

          <div className="space-y-4">
            {instructions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="flex gap-5 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/80" style={{ color: item.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: item.color }}>
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#1F2839] dark:text-white">{item.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workplace;
