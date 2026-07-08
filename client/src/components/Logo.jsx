import React from 'react';
import ladyJusticeImg from '../assets/lady-justice.png';

const Logo = ({ className = "h-5 w-5", strokeWidth }) => {
  return (
    <img 
      src={ladyJusticeImg} 
      alt="Seven Seas Logo" 
      className={`${className} object-cover rounded-full`}
    />
  );
};

export default Logo;
