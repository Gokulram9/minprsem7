import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "h-6 w-6", showText = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex items-center gap-2.5 select-none group cursor-pointer transform transition-transform duration-300 hover:scale-105"
    >
      <div className={`relative ${className} shrink-0`}>
        {/* Glow halo */}
        <div className="absolute inset-0 bg-violet-600/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
          {/* Base pillar */}
          <path d="M 50,20 L 50,80" stroke="url(#logoGrad)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 33,80 H 67" stroke="url(#logoGrad)" strokeWidth="4.5" strokeLinecap="round" />
          
          {/* Main beam representing scales */}
          <path d="M 22,35 H 78" stroke="url(#logoGrad)" strokeWidth="4.5" strokeLinecap="round" className="origin-center group-hover:rotate-[6deg] transition-transform duration-500 ease-out" />
          
          {/* Circuit nodes (AI circuit connection dots) */}
          <circle cx="50" cy="20" r="5" fill="#AEA668" />
          <circle cx="22" cy="35" r="4.5" fill="#8B5CF6" />
          <circle cx="78" cy="35" r="4.5" fill="#8B5CF6" />
          
          {/* Hangers and Scale Pans */}
          <path d="M 22,35 L 14,56 M 22,35 L 30,56" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 10,56 H 34 C 34,67 10,67 10,56 Z" fill="url(#panGrad)" stroke="url(#logoGrad)" strokeWidth="2" />
          
          <path d="M 78,35 L 70,56 M 78,35 L 86,56" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 66,56 H 90 C 90,67 66,67 66,56 Z" fill="url(#panGrad)" stroke="url(#logoGrad)" strokeWidth="2" />

          {/* Glowing central indicator */}
          <circle cx="50" cy="42" r="5.5" fill="#00E5FF" className="animate-pulse" />

          {/* Gradients definitions */}
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
            <linearGradient id="panGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 229, 255, 0.05)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span 
          className="text-sm font-black tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#AEA668] to-white/70"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          LEXORA AI
        </span>
      )}
    </motion.div>
  );
};

export default Logo;
