import React, { useId } from 'react';
import { useApp } from '../../context/AppContext';

interface ModernTechBackgroundProps {
  intensity?: 'subtle' | 'vibrant';
  variant?: 'cyber_grid' | 'neural_network' | 'quantum_matrix';
}

export const ModernTechBackground: React.FC<ModernTechBackgroundProps> = ({
  intensity = 'subtle',
}) => {
  const patternId = useId();
  const { effectiveTheme } = useApp();
  const isDark = effectiveTheme === 'black';

  const opacity = intensity === 'vibrant' 
    ? (isDark ? 'opacity-90' : 'opacity-85') 
    : (isDark ? 'opacity-65' : 'opacity-45');

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-350 ease-in-out ${
        isDark ? 'bg-[#070B14]' : 'bg-[#F8FAFD]'
      }`}
      aria-hidden="true"
    >
      {/* 1. Luminous Ambient Gradient Orbs */}
      {isDark ? (
        <>
          <div
            className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#00E5FF]/18 via-[#2563EB]/20 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#7C3AED]/20 via-[#00E5FF]/14 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-t from-[#00E5FF]/15 via-[#10B981]/12 to-transparent blur-3xl" />
        </>
      ) : (
        <>
          <div
            className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#2684FF]/12 via-[#22C7E8]/10 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#8B5CF6]/10 via-[#2684FF]/8 to-transparent blur-3xl animate-pulse"
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-t from-[#22C7E8]/12 via-[#22C55E]/6 to-transparent blur-3xl" />
        </>
      )}

      {/* 2. Precision Cybernetic Isometric Tech Grid Pattern */}
      <svg
        className={`absolute inset-0 w-full h-full ${opacity} transition-opacity duration-700`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Grid Tile */}
          <pattern id={`tech-grid-${patternId}`} width="48" height="48" patternUnits="userSpaceOnUse">
            {/* Fine grid lines */}
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke={isDark ? '#00E5FF' : '#2684FF'}
              strokeWidth="0.6"
              strokeOpacity={isDark ? '0.22' : '0.18'}
            />
            {/* Tech crosshairs at intersections */}
            <circle
              cx="0"
              cy="0"
              r="1.5"
              fill={isDark ? '#00E5FF' : '#2684FF'}
              fillOpacity={isDark ? '0.6' : '0.35'}
            />
            <circle
              cx="48"
              cy="48"
              r="1"
              fill={isDark ? '#38BDF8' : '#22C7E8'}
              fillOpacity={isDark ? '0.7' : '0.4'}
            />
          </pattern>

          {/* Dot Matrix overlay */}
          <pattern id={`dot-matrix-${patternId}`} width="96" height="96" patternUnits="userSpaceOnUse">
            <circle
              cx="24"
              cy="24"
              r="1.2"
              fill={isDark ? '#00E5FF' : '#2684FF'}
              fillOpacity={isDark ? '0.45' : '0.25'}
            />
            <circle
              cx="72"
              cy="72"
              r="1.2"
              fill={isDark ? '#A855F7' : '#8B5CF6'}
              fillOpacity={isDark ? '0.4' : '0.2'}
            />
            <path
              d="M 40 48 L 56 48 M 48 40 L 48 56"
              stroke={isDark ? '#00E5FF' : '#22C7E8'}
              strokeWidth="0.8"
              strokeOpacity={isDark ? '0.35' : '0.2'}
            />
          </pattern>

          {/* Subtle Glow filter */}
          <filter id={`tech-glow-${patternId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isDark ? '3.5' : '2.5'} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fill with grid pattern */}
        <rect width="100%" height="100%" fill={`url(#tech-grid-${patternId})`} />
        <rect width="100%" height="100%" fill={`url(#dot-matrix-${patternId})`} />

        {/* Animated Cyber Circuit Traces & Digital Waves */}
        <g
          stroke={isDark ? '#00E5FF' : '#2684FF'}
          strokeWidth="1.2"
          fill="none"
          strokeOpacity={isDark ? '0.45' : '0.32'}
          filter={isDark ? `url(#tech-glow-${patternId})` : undefined}
        >
          {/* Top Left Circuit Highway */}
          <path d="M -50,120 L 180,120 L 240,180 L 460,180 L 520,120 L 750,120" strokeDasharray="6 8" />
          <circle cx="240" cy="180" r="3.5" fill={isDark ? '#00E5FF' : '#22C7E8'} fillOpacity={isDark ? '0.9' : '0.7'} />
          <circle cx="520" cy="120" r="4" fill={isDark ? '#38BDF8' : '#2684FF'} fillOpacity={isDark ? '0.9' : '0.6'} />

          {/* Center-Right High-Tech Diagonal Bus */}
          <path d="M 850,40 L 980,170 L 1200,170 L 1260,230 L 1450,230" strokeOpacity={isDark ? '0.4' : '0.28'} />
          <rect
            x="1195"
            y="165"
            width="10"
            height="10"
            rx="2"
            fill={isDark ? '#00E5FF' : '#2684FF'}
            fillOpacity={isDark ? '0.5' : '0.3'}
            stroke={isDark ? '#00E5FF' : '#2684FF'}
          />

          {/* Bottom Left AI Data Ribbon */}
          <path
            d="M 100,750 L 320,750 L 400,670 L 680,670 L 740,730 L 1050,730"
            strokeDasharray="12 6"
            strokeOpacity={isDark ? '0.38' : '0.25'}
            stroke={isDark ? '#38BDF8' : '#22C7E8'}
          />
          <circle cx="400" cy="670" r="3" fill={isDark ? '#34D399' : '#22C55E'} fillOpacity={isDark ? '0.8' : '0.6'} />
          <circle cx="740" cy="730" r="4" fill={isDark ? '#C084FC' : '#8B5CF6'} fillOpacity={isDark ? '0.8' : '0.5'} />
        </g>

        {/* Glowing Geometric Hexagons & Futuristic Nodes */}
        <g fill="none" stroke={isDark ? '#00E5FF' : '#2684FF'} strokeOpacity={isDark ? '0.35' : '0.22'} strokeWidth="1">
          {/* Hex 1 */}
          <polygon points="120,380 150,362 180,380 180,415 150,433 120,415" />
          <circle cx="150" cy="397" r="2.5" fill={isDark ? '#00E5FF' : '#2684FF'} fillOpacity={isDark ? '0.7' : '0.4'} />

          {/* Hex 2 */}
          <polygon
            points="1280,460 1315,440 1350,460 1350,500 1315,520 1280,500"
            stroke={isDark ? '#38BDF8' : '#22C7E8'}
            strokeOpacity={isDark ? '0.45' : '0.3'}
          />
          <circle cx="1315" cy="480" r="3" fill={isDark ? '#38BDF8' : '#22C7E8'} fillOpacity={isDark ? '0.8' : '0.5'} />

          {/* Hex 3 */}
          <polygon
            points="780,180 805,165 830,180 830,210 805,225 780,210"
            stroke={isDark ? '#C084FC' : '#8B5CF6'}
            strokeOpacity={isDark ? '0.35' : '0.2'}
          />
        </g>
      </svg>

      {/* 3. Floating Modern Tech & Educational Math/Code Badges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Code Bracket Tag */}
        <div
          className={`absolute top-[18%] left-[7%] hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm text-xs font-mono transition-colors ${
            isDark
              ? 'bg-[#0B132B]/80 border border-[#00E5FF]/40 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]'
              : 'bg-white/70 border border-[#2684FF]/25 text-[#2684FF] opacity-65'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDark ? 'bg-[#00E5FF]' : 'bg-[#2684FF]'}`} />
          &lt;THCS_MyHoa_2026_Tech /&gt;
        </div>

        {/* Binary Stream Tag */}
        <div
          className={`absolute top-[48%] left-[3%] hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md backdrop-blur-sm text-[10px] font-mono transition-colors ${
            isDark
              ? 'bg-[#0B132B]/75 border border-[#38BDF8]/35 text-[#38BDF8]'
              : 'bg-white/60 border border-[#22C7E8]/20 text-[#0284C7] opacity-50'
          }`}
        >
          <span>01001101 01011001</span>
        </div>

        {/* AI & Cloud Node Tag */}
        <div
          className={`absolute top-[28%] right-[5%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm text-xs font-medium transition-colors ${
            isDark
              ? 'bg-[#0B132B]/85 border border-[#A855F7]/40 text-[#C084FC] shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              : 'bg-white/75 border border-[#8B5CF6]/25 text-[#7C3AED] opacity-70'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C084FC]' : 'bg-[#8B5CF6]'}`} />
          <span>Hệ tri thức số · AI Education</span>
        </div>

        {/* Quantum / Tech Badge */}
        <div
          className={`absolute bottom-[22%] right-[8%] hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-sm text-[11px] font-mono transition-colors ${
            isDark
              ? 'bg-[#0B132B]/80 border border-[#34D399]/40 text-[#34D399]'
              : 'bg-white/60 border border-[#22C55E]/25 text-[#15803D] opacity-65'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#34D399]' : 'bg-[#22C55E]'}`} />
          <span>Status: 100% Online · EdTech 4.0</span>
        </div>
      </div>
    </div>
  );
};
