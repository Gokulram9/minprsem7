import { useState, useEffect } from 'react';
import {
  Settings, Check, Palette, Sparkles, Eye, Volume2,
  VolumeX, Type, Shield, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = [
  { id: 'trust', name: 'Traditional Trust', value: '#0B3C5D', glowClass: 'shadow-blue-900/20', bgGradient: 'from-[#0B3C5D] to-[#C5A059]' },
  { id: 'gold', name: 'Antique Gold', value: '#C5A059', glowClass: 'shadow-yellow-600/20', bgGradient: 'from-[#C5A059] to-[#0B3C5D]' },
  { id: 'sky', name: 'Slate Sky', value: '#3b82f6', glowClass: 'shadow-blue-500/20', bgGradient: 'from-blue-600 to-indigo-600' },
  { id: 'emerald', name: 'Justice Emerald', value: '#10b981', glowClass: 'shadow-emerald-500/20', bgGradient: 'from-emerald-600 to-teal-700' },
];

const ThemeCustomizer = () => {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('trust');
  const [selectedBg, setSelectedBg] = useState('mesh'); // mesh, clean, grid

  // Accessibility States
  const [contrast, setContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'huge'
  const [screenReader, setScreenReader] = useState(false);

  // Load customizations
  useEffect(() => {
    const savedColor = localStorage.getItem('lexoraAccentColor') || 'trust';
    const savedBg = localStorage.getItem('lexoraBgStyle') || 'mesh';
    setSelectedColor(savedColor);
    setSelectedBg(savedBg);

    // Apply accent custom property
    const activeColor = colors.find(c => c.id === savedColor) || colors[0];
    document.documentElement.style.setProperty('--color-brand-primary', activeColor.value);

    // Apply background styles directly to body
    document.body.className = `bg-layout-${savedBg}`;
  }, []);

  const changeAccent = (colorId) => {
    setSelectedColor(colorId);
    localStorage.setItem('lexoraAccentColor', colorId);
    const activeColor = colors.find(c => c.id === colorId) || colors[0];
    document.documentElement.style.setProperty('--color-brand-primary', activeColor.value);

    // Trigger accent update event for visual elements
    window.dispatchEvent(new CustomEvent('accent-changed', { detail: colorId }));
  };

  const changeBg = (bgStyle) => {
    setSelectedBg(bgStyle);
    localStorage.setItem('lexoraBgStyle', bgStyle);
    document.body.className = `bg-layout-${bgStyle}`;
    window.dispatchEvent(new CustomEvent('bg-changed', { detail: bgStyle }));
  };

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
      window.speechSynthesis?.cancel();
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
      window.speechSynthesis?.cancel();
    };
  }, [screenReader]);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          speakText(open ? 'Settings closed' : 'Settings customizer opened');
        }}
        title="Customize portal design and accessibility settings"
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.15)] ring-1 ring-slate-100 hover:bg-slate-50 transition duration-300 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
      >
        <Settings className={`h-5 w-5 text-slate-600 dark:text-slate-300 ${open ? 'rotate-90 transition duration-300' : 'transition duration-300'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-80 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Design & Accessibility</h3>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 text-left">
              Customize portal colors, canvas backgrounds, and access helper configurations.
            </p>

            {/* Accent Color picker */}
            <div className="mt-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">Accent Hue</p>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => changeAccent(color.id)}
                    title={color.name}
                    className={`flex h-10 w-full items-center justify-center rounded-xl transition ${
                      selectedColor === color.id
                        ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.id && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Mesh settings */}
            <div className="mt-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">Canvas Base Layout</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mesh', label: 'Gradient' },
                  { id: 'grid', label: 'Grid Dot' },
                  { id: 'clean', label: 'Frosted' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => changeBg(bg.id)}
                    className={`rounded-lg py-1.5 text-center text-[10px] font-bold transition ${
                      selectedBg === bg.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

            {/* Accessibility Header */}
            <div className="flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-indigo-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accessibility Desk</p>
            </div>

            {/* Accessibility controls */}
            <div className="mt-4 space-y-3.5">
              {/* Screen reader */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {screenReader ? <Volume2 size={14} className="text-emerald-500" /> : <VolumeX size={14} className="text-slate-400" />}
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">Screen Reader</span>
                </div>
                <button
                  onClick={() => {
                    setScreenReader(!screenReader);
                    speakText(screenReader ? 'Screen reader disabled' : 'Screen reader enabled. Hover over items to speak.');
                  }}
                  className={`w-9 h-4.5 rounded-full relative transition-colors ${screenReader ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${screenReader ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={14} className={contrast ? 'text-indigo-500' : 'text-slate-400'} />
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">High Contrast</span>
                </div>
                <button
                  onClick={() => {
                    setContrast(!contrast);
                    speakText(contrast ? 'Contrast mode standard' : 'High contrast active');
                  }}
                  className={`w-9 h-4.5 rounded-full relative transition-colors ${contrast ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${contrast ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} className={reducedMotion ? 'text-amber-500' : 'text-slate-400'} />
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">Reduce Motion</span>
                </div>
                <button
                  onClick={() => {
                    setReducedMotion(!reducedMotion);
                    speakText(reducedMotion ? 'Motion normal' : 'Animations reduced');
                  }}
                  className={`w-9 h-4.5 rounded-full relative transition-colors ${reducedMotion ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${reducedMotion ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Text scaling */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-blue-500" />
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">Text Scaling</span>
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
                        speakText(`Font size set to ${opt.label}`);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all ${fontSize === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ambient indicator */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[9px] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <Sparkles size={13} className="text-blue-500 shrink-0" />
              <span>Mouse tracking ambient lighting glow matches selected color theme!</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeCustomizer;
