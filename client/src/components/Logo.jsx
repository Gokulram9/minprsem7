import React from 'react';

const Logo = ({ className = "h-5 w-5 text-[#B69D74]", strokeWidth = 1.8 }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Wave 1 */}
      <path d="M 3,19.5 Q 7.5,18 12,19.5 Q 16.5,21 21,19.5" />
      {/* Wave 2 */}
      <path d="M 5,21.5 Q 8.5,20.5 12,21.5 Q 15.5,22.5 19,21.5" opacity="0.6" />
      
      {/* Scale Stand Pillar */}
      <line x1="12" y1="5.5" x2="12" y2="18.5" />
      <path d="M 10,5.5 H 14" />
      <path d="M 9.5,18.5 H 14.5" />
      
      {/* Scale Beam */}
      <path d="M 6,9 C 9,8 15,8 18,9" />
      
      {/* Left Hangers & Pan */}
      <line x1="6" y1="9" x2="4" y2="13.5" />
      <line x1="6" y1="9" x2="8" y2="13.5" />
      <path d="M 3.5,13.5 H 8.5" />
      <path d="M 3.5,13.5 C 3.5,15.5 8.5,15.5 8.5,13.5" />
      
      {/* Right Hangers & Pan */}
      <line x1="18" y1="9" x2="16" y2="13.5" />
      <line x1="18" y1="9" x2="20" y2="13.5" />
      <path d="M 15.5,13.5 H 20.5" />
      <path d="M 15.5,13.5 C 15.5,15.5 20.5,15.5 20.5,13.5" />
    </svg>
  );
};

export default Logo;
