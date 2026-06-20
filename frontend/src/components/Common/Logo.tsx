import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Form Builder brand mark — rounded square with a gradient ring,
 * dark navy fill, and bold "FM" initials.
 */
const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Form Builder logo"
  >
    <defs>
      <linearGradient id="fb-logo-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22D3EE" />
        <stop offset="50%" stopColor="#D946EF" />
        <stop offset="100%" stopColor="#FB923C" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#fb-logo-gradient)" />
    <rect x="5.5" y="5.5" width="53" height="53" rx="13" fill="#1E1B4B" />
    <text
      x="32"
      y="41"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="800"
      fontSize="22"
      fill="#FFFFFF"
    >
      FB
    </text>
  </svg>
);

export default Logo;