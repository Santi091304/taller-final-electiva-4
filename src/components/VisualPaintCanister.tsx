import React from 'react';

interface VisualPaintCanisterProps {
  colorHex: string;
  colorName: string;
  productName: string;
  finish: string;
  sizeLabel: string;
}

export const VisualPaintCanister: React.FC<VisualPaintCanisterProps> = ({
  colorHex,
  colorName,
  productName,
  finish,
  sizeLabel,
}) => {
  return (
    <div className="relative w-full py-4 flex flex-col items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-b from-[#0a1122] via-[#0d172e] to-[#080d1a] border-b border-slate-800/80">
      
      {/* Dynamic Ambient Color Backlight */}
      <div 
        className="absolute w-36 h-36 rounded-full blur-2xl opacity-35 transition-all duration-500 pointer-events-none"
        style={{ backgroundColor: colorHex }}
      />

      {/* Interactive Canister SVG */}
      <div className="relative z-10 w-44 h-48 flex items-center justify-center transition-transform hover:scale-105 duration-300">
        <svg 
          viewBox="0 0 180 200" 
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs for gradients */}
          <defs>
            {/* Metallic handle */}
            <linearGradient id="metalHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Canister Body Metallic Gradient */}
            <linearGradient id="canBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="18%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Lid Rim Gradient */}
            <linearGradient id="lidRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="35%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Label Background */}
            <linearGradient id="labelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0e172a" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>

            {/* Specular Shine Arc */}
            <linearGradient id="swatchShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Wire Steel Carrying Handle (Arc) */}
          <path 
            d="M 28 55 C 28 10, 152 10, 152 55" 
            stroke="url(#metalHandle)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Handle Grip Wooden / Rubber detail */}
          <rect x="72" y="16" width="36" height="8" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Side Handle Pivot Rivets */}
          <circle cx="28" cy="55" r="4.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
          <circle cx="152" cy="55" r="4.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />

          {/* Canister Body Base */}
          <path 
            d="M 32 46 L 36 178 C 36 186, 42 192, 50 192 L 130 192 C 138 192, 144 186, 144 178 L 148 46 Z" 
            fill="url(#canBody)" 
            stroke="#1e293b" 
            strokeWidth="1.5" 
          />

          {/* Lower Base Ring */}
          <ellipse cx="90" cy="188" rx="52" ry="4" fill="url(#lidRim)" />

          {/* Canister Front Corporate Label Shield */}
          <rect x="42" y="60" width="96" height="114" rx="6" fill="url(#labelGrad)" stroke="#1e293b" strokeWidth="1" />

          {/* Top Label Brand "PINTUKO PRO" */}
          <g transform="translate(90, 75)">
            <text 
              textAnchor="middle" 
              fill="#ffffff" 
              fontSize="9" 
              fontWeight="900" 
              letterSpacing="0.8" 
              fontFamily="Outfit, sans-serif"
            >
              PINTUKO <tspan fill="#f59e0b">PRO</tspan>
            </text>
            <text 
              y="9" 
              textAnchor="middle" 
              fill="#94a3b8" 
              fontSize="5.5" 
              fontWeight="600" 
              letterSpacing="0.5" 
              fontFamily="system-ui, sans-serif"
            >
              FÓRMULA PROFESIONAL
            </text>
          </g>

          {/* Product Name Subline on Label */}
          <text 
            x="90" 
            y="98" 
            textAnchor="middle" 
            fill="#e2e8f0" 
            fontSize="7" 
            fontWeight="bold" 
            fontFamily="system-ui, sans-serif"
          >
            {productName.length > 20 ? productName.slice(0, 19) + '...' : productName}
          </text>

          {/* === THE CENTRAL COLOR WINDOW / INTERACTIVE LABEL CIRCLE === */}
          <g id="color-window" transform="translate(90, 130)">
            {/* Outer White / Chrome Ring */}
            <circle cx="0" cy="0" r="23" fill="#0f172a" stroke="url(#lidRim)" strokeWidth="2.5" />
            
            {/* Inner dynamic fill circle (Updates color in real time!) */}
            <circle 
              cx="0" 
              cy="0" 
              r="20" 
              fill={colorHex} 
              className="transition-colors duration-300"
            />

            {/* Specular glossy highlight arc over paint liquid */}
            <path 
              d="M -16 -8 C -16 -16, 16 -16, 16 -8 C 16 -2, -16 -2, -16 -8 Z" 
              fill="url(#swatchShine)" 
            />

            {/* Small Paint Droplet Accent */}
            <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.3" />
          </g>

          {/* Bottom Label Specs */}
          <g transform="translate(90, 165)">
            <text 
              textAnchor="middle" 
              fill="#cbd5e1" 
              fontSize="5.5" 
              fontWeight="bold" 
              fontFamily="system-ui, sans-serif"
            >
              ACABADO {finish.toUpperCase()}
            </text>
            <text 
              y="6.5" 
              textAnchor="middle" 
              fill="#f59e0b" 
              fontSize="5" 
              fontWeight="bold" 
              fontFamily="monospace"
            >
              {sizeLabel.toUpperCase()}
            </text>
          </g>

          {/* Top Lid Ring & Lip */}
          <ellipse cx="90" cy="46" rx="58" ry="7" fill="url(#lidRim)" stroke="#475569" strokeWidth="1" />
          <ellipse cx="90" cy="44" rx="55" ry="5.5" fill="#1e293b" />
          <ellipse cx="90" cy="43.5" rx="48" ry="4" fill="url(#lidRim)" />

          {/* Subtle Vertical Specular Cylinder Reflection Bar */}
          <rect x="52" y="46" width="6" height="136" fill="#ffffff" opacity="0.08" />
        </svg>
      </div>

      {/* Floating Canister Footnote */}
      <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/60 shadow-sm mt-1">
        <span 
          className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm transition-colors duration-300"
          style={{ backgroundColor: colorHex }}
        />
        <span className="text-[11px] font-semibold text-slate-300">
          Color en envase: <strong className="text-white font-bold">{colorName}</strong>
        </span>
      </div>

    </div>
  );
};
