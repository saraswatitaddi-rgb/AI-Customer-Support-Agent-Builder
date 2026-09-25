import React from 'react';
import { cn } from '../../lib/utils';

/**
 * AuroraBeam Component (React Bits Pro Inspired)
 * "A sweeping aurora beam built from layered sheets of light"
 *
 * Renders multiple flowing, organic sheets of luminous colored light that
 * sweep across the background, creating a state-of-the-art cinematic ambient effect.
 */
export const AuroraBeam = ({
  children,
  className,
  contentClassName,
  intensity = 'medium',
  beamColor = 'default',
  showGrid = true,
  beamAngle = '-32deg',
  fullPage = false,
  asBackground = false,
}) => {
  // Opacity multiplier based on intensity
  const intensityMap = {
    subtle: 'opacity-40',
    medium: 'opacity-70',
    vibrant: 'opacity-95',
  };

  // Preset color gradients for the layered light sheets
  const colorThemes = {
    default: {
      sheet1: 'from-indigo-600/50 via-purple-600/40 to-cyan-500/20',
      sheet2: 'from-cyan-400/40 via-teal-400/30 to-blue-600/20',
      sheet3: 'from-purple-500/50 via-pink-500/30 to-indigo-700/20',
      core: 'from-indigo-300/80 via-cyan-200/90 to-purple-400/60',
      highlight: 'from-emerald-400/30 via-cyan-300/40 to-transparent',
      ambient: 'rgba(79, 70, 229, 0.15)',
    },
    emerald: {
      sheet1: 'from-emerald-600/50 via-teal-600/40 to-cyan-500/25',
      sheet2: 'from-teal-400/40 via-emerald-400/35 to-green-600/20',
      sheet3: 'from-cyan-500/50 via-emerald-500/30 to-blue-700/20',
      core: 'from-emerald-200/90 via-teal-100/95 to-cyan-300/70',
      highlight: 'from-teal-300/40 via-emerald-200/40 to-transparent',
      ambient: 'rgba(16, 185, 129, 0.15)',
    },
    cosmic: {
      sheet1: 'from-purple-600/60 via-pink-600/40 to-indigo-500/30',
      sheet2: 'from-fuchsia-400/40 via-purple-400/35 to-blue-600/25',
      sheet3: 'from-indigo-500/50 via-violet-500/35 to-pink-700/20',
      core: 'from-pink-200/90 via-purple-100/95 to-indigo-300/70',
      highlight: 'from-violet-300/40 via-fuchsia-200/40 to-transparent',
      ambient: 'rgba(168, 85, 247, 0.15)',
    },
  };

  const theme = colorThemes[beamColor] || colorThemes.default;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fullPage ? 'min-h-screen w-full' : '',
        className
      )}
    >
      {/* Aurora Beam Container (Layered Sheets of Light) */}
      <div
        className={cn(
          'pointer-events-none select-none absolute inset-0 z-0 overflow-hidden',
          intensityMap[intensity] || intensityMap.medium
        )}
        style={{
          maskImage:
            'radial-gradient(ellipse 90% 75% at 50% 15%, black 25%, rgba(0,0,0,0.7) 60%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 75% at 50% 15%, black 25%, rgba(0,0,0,0.7) 60%, transparent 100%)',
        }}
      >
        {/* Ambient Top Glow Dome */}
        <div
          className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: theme.ambient }}
        />

        {/* Optional Subtle Tech Grid / Coordinate Mesh */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* ═══ LAYER 1: Deep Ethereal Aurora Base Sheet ═══ */}
        <div
          className={cn(
            'absolute -top-[35%] -left-[20%] w-[140%] h-[170%] rounded-[48%]',
            'bg-gradient-to-tr',
            theme.sheet1,
            'filter blur-[70px] mix-blend-screen animate-aurora-1'
          )}
          style={{ transformOrigin: 'center center' }}
        />

        {/* ═══ LAYER 2: Sweeping Cyan/Teal Ribbon Sheet ═══ */}
        <div
          className={cn(
            'absolute -top-[30%] -right-[15%] w-[130%] h-[160%] rounded-[42%]',
            'bg-gradient-to-br',
            theme.sheet2,
            'filter blur-[55px] mix-blend-screen animate-aurora-2'
          )}
          style={{ transformOrigin: 'top right' }}
        />

        {/* ═══ LAYER 3: Radiant Violet/Fuchsia Undulating Fold ═══ */}
        <div
          className={cn(
            'absolute -top-[20%] left-[10%] w-[90%] h-[140%] rounded-[45%]',
            'bg-gradient-to-r',
            theme.sheet3,
            'filter blur-[45px] mix-blend-screen animate-aurora-3'
          )}
          style={{ transformOrigin: 'center left' }}
        />

        {/* ═══ LAYER 4: High-Luminescence Center Beam Core (The Filament) ═══ */}
        <div
          className={cn(
            'absolute -top-[10%] left-[25%] w-[55%] h-[110%] rounded-[50%]',
            'bg-gradient-to-b',
            theme.core,
            'filter blur-[35px] mix-blend-screen animate-aurora-core'
          )}
        />

        {/* ═══ LAYER 5: Sweeping Ethereal Crown Highlight ═══ */}
        <div
          className={cn(
            'absolute top-[5%] left-[20%] w-[65%] h-[40%] rounded-[100%]',
            'bg-gradient-to-r',
            theme.highlight,
            'filter blur-[28px] mix-blend-screen opacity-70'
          )}
        />

        {/* Bottom Horizon Fog Fade into Dark Background */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#090d16] via-[#090d16]/75 to-transparent pointer-events-none" />
      </div>

      {/* Content Placed Over Aurora Beam */}
      {children && (
        <div className={cn('relative z-10', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AuroraBeam;
