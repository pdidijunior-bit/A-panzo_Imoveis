import React from 'react';

interface BrandLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  customLogoUrl,
  size = 'md',
  theme = 'light',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="A.PANZO - Comércio & Prestação de Serviços, LDA (Imobiliária)"
          className={`${iconSizes[size]} object-contain`}
        />
      ) : (
        <div className={`${iconSizes[size]} relative flex items-center justify-center shrink-0`}>
          {/* Official A.PANZO 3D Architectural Monogram Vector (AP + Skyline + Houses + Dynamic Arc) */}
          <svg
            viewBox="0 0 200 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            <defs>
              {/* Vibrant 3D Royal Blue Gradients based on A.PANZO brand */}
              <linearGradient id="apRoyalPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E73CE" />
                <stop offset="50%" stopColor="#0052A5" />
                <stop offset="100%" stopColor="#003366" />
              </linearGradient>
              <linearGradient id="apLightShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#0052A5" />
              </linearGradient>
              <linearGradient id="apTowerGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#003366" />
              </linearGradient>
              <linearGradient id="apArcGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#003366" />
                <stop offset="40%" stopColor="#0052A5" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <filter id="apDropShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.35" floodColor="#001F3F" />
              </filter>
            </defs>

            {/* Background Towers / Modern High-Rise Skyline */}
            <g filter="url(#apDropShadow)">
              {/* Left Tower */}
              <polygon points="58,105 70,102 70,30 58,38" fill="url(#apLightShine)" />
              <polygon points="70,102 80,100 80,22 70,30" fill="url(#apRoyalPrimary)" />
              {/* Vertical Glass Windows Left Tower */}
              <line x1="64" y1="42" x2="64" y2="100" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />
              <line x1="75" y1="32" x2="75" y2="98" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />

              {/* Center Tower (Tallest) */}
              <polygon points="80,100 95,97 95,10 80,22" fill="url(#apTowerGlass)" />
              <polygon points="95,97 108,95 108,20 95,10" fill="url(#apRoyalPrimary)" />
              {/* Vertical Glass Strips Center */}
              <line x1="88" y1="25" x2="88" y2="96" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
              <line x1="102" y1="24" x2="102" y2="94" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />

              {/* Right Tower */}
              <polygon points="108,95 120,93 120,35 108,20" fill="url(#apLightShine)" />
              <polygon points="120,93 128,92 128,45 120,35" fill="url(#apRoyalPrimary)" />
              <line x1="114" y1="36" x2="114" y2="92" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />
            </g>

            {/* Front Gabled Residential Houses with Blue Roofs & White Walls */}
            <g filter="url(#apDropShadow)">
              {/* House 1 (Left) */}
              <polygon points="25,125 58,95 90,125 78,125 78,145 35,145 35,125" fill="#FFFFFF" stroke="#0052A5" strokeWidth="2.5" />
              {/* Left Roof 3D */}
              <path d="M 22 126 L 58 92 L 94 126 L 86 126 L 58 100 L 29 126 Z" fill="url(#apRoyalPrimary)" />
              {/* Window grid Left House */}
              <rect x="46" y="115" width="10" height="10" rx="1" fill="#FFFFFF" stroke="#0052A5" strokeWidth="1.5" />
              <line x1="51" y1="115" x2="51" y2="125" stroke="#0052A5" strokeWidth="1" />
              <line x1="46" y1="120" x2="56" y2="120" stroke="#0052A5" strokeWidth="1" />

              {/* House 2 (Right) */}
              <polygon points="75,128 105,98 135,128 126,128 126,145 84,145 84,128" fill="#FFFFFF" stroke="#0052A5" strokeWidth="2.5" />
              {/* Right Roof 3D */}
              <path d="M 72 129 L 105 95 L 138 129 L 130 129 L 105 104 L 79 129 Z" fill="url(#apRoyalPrimary)" />
              {/* Window grid Right House */}
              <rect x="98" y="116" width="10" height="10" rx="1" fill="#FFFFFF" stroke="#0052A5" strokeWidth="1.5" />
              <line x1="103" y1="116" x2="103" y2="126" stroke="#0052A5" strokeWidth="1" />
              <line x1="98" y1="121" x2="108" y2="121" stroke="#0052A5" strokeWidth="1" />

              {/* Mini Door Gable */}
              <path d="M 68 145 L 80 133 L 92 145 Z" fill="url(#apLightShine)" />
              <rect x="76" y="137" width="8" height="8" rx="0.5" fill="#FFFFFF" stroke="#0052A5" strokeWidth="1" />
            </g>

            {/* Prominent 3D AP Monogram Letters on Right/Front */}
            <g filter="url(#apDropShadow)">
              {/* Letter 'A' (integrated bold geometric 3D bar) */}
              <path
                d="M 125 145 L 140 75 L 155 75 L 170 145 L 154 145 L 151 130 L 138 130 L 135 145 Z M 141 116 L 148 116 L 145 92 Z"
                fill="url(#apRoyalPrimary)"
              />
              {/* Letter 'P' 3D */}
              <path
                d="M 162 75 L 186 75 C 196 75, 202 82, 202 94 C 202 106, 196 113, 185 113 L 173 113 L 173 145 L 162 145 Z M 173 87 L 173 101 L 184 101 C 189 101, 191 97, 191 94 C 191 91, 189 87, 184 87 Z"
                fill="url(#apLightShine)"
              />
            </g>

            {/* Elegant Encircling Dynamic Orbit Arc */}
            <path
              d="M 12 120 C 5 80, 28 55, 62 48 C 45 60, 28 85, 36 122 C 45 152, 85 162, 140 135 C 158 126, 172 110, 182 92 C 168 118, 142 142, 102 148 C 50 156, 20 145, 12 120 Z"
              fill="url(#apArcGlow)"
            />
          </svg>
        </div>
      )}

      {/* Official Typography from Logo */}
      <div className="flex flex-col leading-tight">
        {/* Brand Name "A.PANZO" */}
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-wider font-sans uppercase ${
              theme === 'dark' ? 'text-white' : 'text-[#0052A5]'
            } ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'}`}
          >
            A.PANZO
          </span>
          <span
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
              theme === 'dark'
                ? 'bg-blue-900/60 text-blue-200 border border-blue-400/30'
                : 'bg-[#0052A5] text-white'
            }`}
          >
            Imobiliária
          </span>
        </div>

        {/* Official Subtitle */}
        {showSubtitle && (
          <span
            className={`text-[8.5px] font-bold tracking-tight uppercase leading-none mt-0.5 ${
              theme === 'dark' ? 'text-slate-300' : 'text-[#003366]'
            }`}
          >
            Comércio & Prestação de Serviços, LDA
          </span>
        )}
      </div>
    </div>
  );
};
