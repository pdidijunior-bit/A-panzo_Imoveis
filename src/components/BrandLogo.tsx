import React from 'react';

interface BrandLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  customLogoUrl,
  size = 'md',
  theme = 'light',
}) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-14 text-xl',
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="Aliança Imobiliária Logótipo"
          className={`${iconSizes[size]} object-contain rounded`}
        />
      ) : (
        <div
          className={`${iconSizes[size]} relative flex items-center justify-center`}
        >
          {/* Official Aliança Imobiliária Architectural Towers Emblem */}
          <svg
            viewBox="0 0 160 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Curved ground arc */}
            <path
              d="M 12 130 C 50 120, 110 120, 148 130 C 110 123, 50 123, 12 130 Z"
              fill={theme === 'dark' ? '#2DD4BF' : '#1E3A34'}
            />
            {/* Left green tower */}
            <polygon
              points="28,124 50,124 50,96 28,104"
              fill={theme === 'dark' ? '#2DD4BF' : '#1E3A34'}
            />
            {/* Center orange tower */}
            <path
              d="M 55 124 L 84 124 L 84 48 L 55 32 Z"
              fill="#EA7C1C"
            />
            {/* White house cutout with keyhole door inside center tower */}
            <path
              d="M 69.5 78 L 61.5 86.5 L 64 86.5 L 64 99.5 L 75 99.5 L 75 86.5 L 77.5 86.5 Z"
              fill="#FFFFFF"
            />
            {/* Keyhole circular cutout */}
            <circle cx="69.5" cy="92.5" r="2" fill="#EA7C1C" />
            <polygon points="68.2,93.5 70.8,93.5 71.4,98.5 67.6,98.5" fill="#EA7C1C" />

            {/* Right green tower */}
            <polygon
              points="89,124 116,124 116,62 89,48"
              fill={theme === 'dark' ? '#2DD4BF' : '#1E3A34'}
            />
          </svg>
        </div>
      )}

      <div className="flex flex-col leading-none">
        <span
          className={`font-brand-display tracking-widest font-extrabold uppercase ${
            theme === 'dark' ? 'text-amber-400' : 'text-slate-900'
          } ${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'}`}
        >
          Aliança
        </span>
        <span
          className={`text-[9px] font-bold tracking-[0.25em] uppercase mt-0.5 ${
            theme === 'dark' ? 'text-amber-200/90' : 'text-amber-600'
          }`}
        >
          Imobiliária
        </span>
      </div>
    </div>
  );
};
