import { useState } from 'react';
import { 
  Mail, Shield, Calendar, QrCode, ArrowLeft, Send, CheckCircle, Smartphone 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/button';

const EmailSimulator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('hearing'); // hearing, counsel, upload
  const [simulatedSend, setSimulatedSend] = useState(false);

  const handleSendSim = () => {
    setSimulatedSend(true);
    setTimeout(() => setSimulatedSend(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        
        {/* BACK NAVIGATION */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* CONTAINER */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.8fr]">
          
          {/* LEFT SIDE: CONTROLLER */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/45 p-6 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/40">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-blue-600 dark:text-blue-400">Lexora Mail Studio</p>
              <h2 className="font-space text-2xl font-bold mt-1 tracking-tight">Notification Templates</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Lexora auto-sends premium HTML templates on docket changes. Switch templates below to review designs.
              </p>

              {/* Template selector triggers */}
              <div className="mt-6 space-y-2">
                {[
                  { id: 'hearing', label: 'Hearing Confirmation Alert' },
                  { id: 'counsel', label: 'Advocate Assigned Notice' },
                  { id: 'upload', label: 'Vault Upload Approval' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`w-full rounded-2xl py-3.5 text-center text-xs font-bold transition border ${
                      selectedTemplate === tpl.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25' 
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {/* Send Simulator Trigger */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={handleSendSim} 
                  disabled={simulatedSend}
                  className="w-full rounded-2xl h-11 flex items-center justify-center gap-2"
                >
                  {simulatedSend ? (
                    <>
                      <CheckCircle size={16} /> Dispatched Simulation Email
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Simulation Email
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: BEAUTIFUL SIMULATED EMAIL PREVIEW */}
          <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/40 p-8 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/40 relative">
            
            {/* Subject bar info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 text-xs text-slate-500 dark:border-slate-800">
              <div className="space-y-1">
                <p><strong>From:</strong> Lexora Notifications &lt;no-reply@lexora.gov&gt;</p>
                <p><strong>Subject:</strong> {
                  selectedTemplate === 'hearing' 
                    ? 'Lexora • Courtroom Hearing Confirmation - Docket #3842-DL' 
                    : selectedTemplate === 'counsel' 
                    ? 'Lexora • Assigned Legal Counsel Match Notification' 
                    : 'Lexora • Secure Vault Document Upload Approved'
                }</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-900 uppercase">HTML Layout</span>
            </div>

            {/* SIMULATED HTML EMAIL CONTAINER ACCENT */}
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-100 bg-white p-8 shadow-md text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              
              {/* Email Logo Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-space font-bold text-xs">L</div>
                  <span className="font-space text-sm font-bold tracking-tight text-slate-900 dark:text-white">LEXORA</span>
                </div>
                <span className="text-[9px] text-slate-400">CIVIL DOCKET SUITE</span>
              </div>

              {/* Email Content Dynamic mapping */}
              {selectedTemplate === 'hearing' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Court Case Hearing Confirmed</h3>
                  <p>Dear Lexora Applicant,</p>
                  <p>
                    Your legal scheduling request for docket **#3842-DL** has been processed and assigned a physical courtroom slot at the District Court.
                  </p>
                  
                  {/* Calendar schedule grid */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 grid grid-cols-2 gap-4 my-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</p>
                      <p className="font-bold mt-0.5 text-slate-900 dark:text-white">July 12, 2026 at 11:30 AM</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Court Allocation</p>
                      <p className="font-bold mt-0.5 text-slate-900 dark:text-white">District Courtroom C</p>
                    </div>
                  </div>

                  {/* QR Code and action details */}
                  <div className="flex items-center gap-6 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                    <QrCode size={48} className="text-slate-800 dark:text-white shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-[11px]">Docket Pass QR Code</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Scan this code at the courtroom check-in tablet to auto-register your arrival state.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'counsel' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Legal Counsel Assigned</h3>
                  <p>Dear Lexora Applicant,</p>
                  <p>
                    Your eligibility criteria has been validated. The Lexora AI matching matrix has assigned a primary advocate counselor to your docket.
                  </p>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex items-center gap-4 my-4">
                    <img 
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80" 
                      alt="Aisha Verma" 
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-[11px]">Aisha Verma</h4>
                      <p className="text-[10px] text-slate-400">Senior Family Counsel • 12 Yrs Exp • 96% Match</p>
                    </div>
                  </div>
                  
                  <p>We recommend you coordinate slots inside your client portal dashboard immediately.</p>
                </div>
              )}

              {selectedTemplate === 'upload' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Secure Vault Upload Complete</h3>
                  <p>Dear Lexora Client,</p>
                  <p>
                    A new file upload has passed malware scanning and has been successfully added to your secure zero-knowledge vault:
                  </p>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 my-4 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Application form.pdf</p>
                    <p className="text-[10px] text-slate-400">Size: 2.4 MB • Status: AUDITED & SHA-256 SIGNED</p>
                  </div>

                  <p>This file is now available for docket case review and counsel litigation preparations.</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 text-center">
                <a 
                  href="http://localhost:5173/dashboard" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
                >
                  Access Client Dashboard
                </a>
              </div>

              {/* Email Footer */}
              <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 dark:border-slate-800">
                <p>Lexora Systems Inc. • 120 Legal Plaza Dr Suite B, New Delhi.</p>
                <p className="mt-1">Secure transactional notification. Clean styling configured for accessibility guidelines.</p>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default EmailSimulator;
