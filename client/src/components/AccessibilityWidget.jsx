import { useState, useEffect } from 'react';
import { Eye, HelpCircle, Volume2, VolumeX, Type, Shield, Sparkles, X, Activity } from 'lucide-react';

const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'huge'
  const [screenReader, setScreenReader] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState(null);

  // Toggle contrast mode
  useEffect(() => {
    document.documentElement.classList.toggle('accessibility-high-contrast', contrast);
  }, [contrast]);

  // Toggle reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle('accessibility-reduced-motion', reducedMotion);
  }, [reducedMotion]);

  // Toggle font sizes
  useEffect(() => {
    document.documentElement.classList.remove('text-size-large', 'text-size-huge');
    if (fontSize === 'large') {
      document.documentElement.classList.add('text-size-large');
    } else if (fontSize === 'huge') {
      document.documentElement.classList.add('text-size-huge');
    }
  }, [fontSize]);

  // Text-To-Speech hover reader logic
  useEffect(() => {
    if (!screenReader) {
      window.speechSynthesis.cancel();
      return;
    }

    const handleHover = (e) => {
      const target = e.target;
      const text = target.innerText || target.placeholder || target.alt;
      if (text && text.length < 120 && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    };

    document.addEventListener('mouseover', handleHover);
    return () => {
      document.removeEventListener('mouseover', handleHover);
      window.speechSynthesis.cancel();
    };
  }, [screenReader]);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[999] select-none font-sans">
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setOpen(!open);
          speakText(open ? 'Accessibility panel closed' : 'Accessibility options opened');
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
        }}
        title="Accessibility Tools Assistant"
      >
        {open ? <X size={20} className="text-white" /> : <Eye size={20} className="text-white animate-pulse" />}
      </button>

      {/* Main Glassmorphic Panel */}
      {open && (
        <div className="absolute bottom-16 left-0 w-80 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white leading-none">Accessibility Desk</h3>
                <p className="text-[10px] text-slate-400 mt-1">Enhancing readability & navigation</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Control: Screen Reader / Speech Synthesizer */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {screenReader ? <Volume2 size={16} className="text-emerald-500 animate-bounce" /> : <VolumeX size={16} className="text-slate-400" />}
                <div>
                  <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">Audio Screen Reader</p>
                  <p className="text-[9.5px] text-slate-400">Hover over any text to speak it</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setScreenReader(!screenReader);
                  speakText(screenReader ? 'Screen reader turned off' : 'Screen reader active. Hover over elements.');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${screenReader ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${screenReader ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Control: Contrast Adjustment */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Shield size={16} className={contrast ? 'text-indigo-500' : 'text-slate-400'} />
                <div>
                  <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">High Contrast Mode</p>
                  <p className="text-[9.5px] text-slate-400">Pure colors for high accessibility</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setContrast(!contrast);
                  speakText(contrast ? 'High contrast disabled' : 'High contrast active');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${contrast ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${contrast ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Control: Reduce Motion */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Activity size={16} className={reducedMotion ? 'text-amber-500' : 'text-slate-400'} />
                <div>
                  <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">Reduce Motion</p>
                  <p className="text-[9.5px] text-slate-400">Disable heavy site animations</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReducedMotion(!reducedMotion);
                  speakText(reducedMotion ? 'Animations restored' : 'Animations disabled');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${reducedMotion ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${reducedMotion ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Control: Font Scaler */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2.5">
                <Type size={16} className="text-blue-500" />
                <div>
                  <p className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">Font Text Scaling</p>
                  <p className="text-[9.5px] text-slate-400">Increase global layout font scale</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'large', label: 'Large' },
                  { id: 'huge', label: 'Huge' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFontSize(opt.id);
                      speakText(`Font scale set to ${opt.label}`);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${fontSize === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 p-3 border border-blue-100/40 dark:border-blue-950/40 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">WCAG Compliant Mode</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;
