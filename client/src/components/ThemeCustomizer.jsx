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
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm font-sans space-y-5">
      <div className="flex items-center gap-2.5 border-b border-slate-150 dark:border-slate-800 pb-4">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-space text-base font-bold text-slate-900 dark:text-white">Portal Design & Accessibility Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize accent colors, background themes, contrast mode, and accessibility helpers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Visual Theme Controls */}
        <div className="space-y-5">
          {/* Accent Color picker */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accent Color Theme</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => changeAccent(color.id)}
                  title={color.name}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-white transition ${
                    selectedColor === color.id
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] shadow-md'
                      : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.id && <Check size={16} className="text-white shrink-0" />}
                  <span className="truncate text-[11px]">{color.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Mesh settings */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Canvas Background Style</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mesh', label: 'Gradient Mesh' },
                { id: 'grid', label: 'Grid Dots' },
                { id: 'clean', label: 'Frosted Glass' }
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => changeBg(bg.id)}
                  className={`rounded-xl py-2 px-3 text-center text-xs font-bold transition ${
                    selectedBg === bg.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Accessibility Desk */}
        <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-150 dark:border-slate-800 pt-5 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4.5 w-4.5 text-indigo-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accessibility Desk</p>
          </div>

          <div className="space-y-3.5">
            {/* Screen reader */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                {screenReader ? <Volume2 size={16} className="text-emerald-500 shrink-0" /> : <VolumeX size={16} className="text-slate-400 shrink-0" />}
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Text-To-Speech Reader</span>
                  <p className="text-[10px] text-slate-400">Speaks hovered elements aloud</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setScreenReader(!screenReader);
                  speakText(screenReader ? 'Screen reader disabled' : 'Screen reader enabled. Hover over items to speak.');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${screenReader ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${screenReader ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Contrast */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <Shield size={16} className={contrast ? 'text-indigo-500 shrink-0' : 'text-slate-400 shrink-0'} />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">High Contrast Mode</span>
                  <p className="text-[10px] text-slate-400">Enhanced visual borders & text clarity</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setContrast(!contrast);
                  speakText(contrast ? 'Contrast mode standard' : 'High contrast active');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${contrast ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${contrast ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Motion */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <Activity size={16} className={reducedMotion ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reduce Motion Animations</span>
                  <p className="text-[10px] text-slate-400">Disables non-essential motion transitions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReducedMotion(!reducedMotion);
                  speakText(reducedMotion ? 'Motion normal' : 'Animations reduced');
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${reducedMotion ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${reducedMotion ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Text scaling */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <Type size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Text Scaling</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', label: 'Normal (100%)' },
                  { id: 'large', label: 'Large (115%)' },
                  { id: 'huge', label: 'Huge (130%)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFontSize(opt.id);
                      speakText(`Font size set to ${opt.label}`);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${fontSize === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient indicator */}
      <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-100 dark:border-slate-850">
        <Sparkles size={14} className="text-blue-500 shrink-0" />
        <span>Mouse tracking ambient lighting glow updates automatically based on selected accent color theme!</span>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
