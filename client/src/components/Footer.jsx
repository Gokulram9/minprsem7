import { Link } from 'react-router-dom';
import { Mail, Shield, Check, Github, Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="relative border-t border-slate-200 bg-white/70 text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/70">
      
      {/* Decorative ambient glowing blob */}
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-600/5" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
          
          {/* Logo & Intro */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0f2044] via-blue-700 to-[#1e3a5f] text-white font-space font-bold shadow-md text-lg">
                ⚓
              </div>
              <div className="flex flex-col">
                <span className="font-space text-base font-bold tracking-tight text-slate-900 dark:text-white">Seven Seas</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Justice System</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Role-based court case scheduling portal connecting citizens, lawyers, and administrators for transparent justice.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={idx} 
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-4">
            <h3 className="font-space text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Platform</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to="/find-lawyers" className="transition hover:text-blue-600 dark:hover:text-blue-400">Find Attorneys</Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition hover:text-blue-600 dark:hover:text-blue-400">Client Workspace</Link>
              </li>
              <li>
                <Link to="/dashboard/track" className="transition hover:text-blue-600 dark:hover:text-blue-400">Case Timelines</Link>
              </li>
              <li>
                <Link to="/dashboard/documents" className="transition hover:text-blue-600 dark:hover:text-blue-400">Document Vault</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Resources Links */}
          <div className="space-y-4">
            <h3 className="font-space text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Resources</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#faq" className="transition hover:text-blue-600 dark:hover:text-blue-400">Eligibility FAQ</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600 dark:hover:text-blue-400">User Guides</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600 dark:hover:text-blue-400">Security Audit</a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Action */}
          <div className="space-y-4">
            <h3 className="font-space text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Newsletter Update</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive updates regarding civil scheduling rules, court directives, and AI legal assistant updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lexora.gov"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md transition hover:bg-blue-500"
              >
                {subscribed ? <Check size={16} /> : <Mail size={16} />}
              </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <Shield size={12} className="text-emerald-500" />
              <span>Lexora implements zero-knowledge document encryption.</span>
            </div>
          </div>

        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 dark:border-slate-800 md:flex-row text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Lexora Systems Inc. Powered by AI Legal Intelligence.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-500">Security Profile</a>
            <a href="#" className="hover:text-blue-500">Terms of Use</a>
            <a href="#" className="hover:text-blue-500">Accessibility Statement</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
