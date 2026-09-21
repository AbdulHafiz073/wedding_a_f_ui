import React from 'react';

// ============================================================================
// 1. RICH SVG FLORAL COMPONENTS (NO EXTERNAL PHOTO IMAGES)
// ============================================================================

interface FlowerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rotation?: number;
  withLeaves?: boolean;
}

/**
 * Royal Blooming Velvet Rose SVG with layered petals, gradients & highlights
 */
export const RoyalRose: React.FC<FlowerProps & { variant?: 'deepRed' | 'crimson' | 'blush' | 'coral' }> = ({
  size = 'md',
  className = '',
  rotation = 0,
  withLeaves = true,
  variant = 'deepRed'
}) => {
  const pixelSizes = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 54,
    xl: 68
  }[size];

  const palettes = {
    deepRed: {
      outer: '#800020',
      mid: '#b71540',
      inner: '#e55039',
      core: '#ff3838',
      shadow: '#4d0013'
    },
    crimson: {
      outer: '#990000',
      mid: '#cc0000',
      inner: '#ff1a1a',
      core: '#ff4d4d',
      shadow: '#660000'
    },
    blush: {
      outer: '#a3485e',
      mid: '#d9534f',
      inner: '#f08080',
      core: '#ffb6c1',
      shadow: '#5e1e2d'
    },
    coral: {
      outer: '#b33939',
      mid: '#cd6155',
      inner: '#f1948a',
      core: '#f5b7b1',
      shadow: '#641e16'
    }
  }[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        width: `${pixelSizes}px`,
        height: `${pixelSizes}px`
      }}
    >
      {/* Auspicious Green Rose Leaves */}
      {withLeaves && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-[-25%] w-[150%] h-[150%] pointer-events-none"
          aria-hidden="true"
        >
          <path
            d="M 20,25 C 10,40 12,65 32,60 C 35,45 28,30 20,25 Z"
            fill="url(#roseLeafGrad)"
            stroke="#145a32"
            strokeWidth="0.8"
          />
          <path
            d="M 80,28 C 90,42 88,68 68,62 C 65,47 72,32 80,28 Z"
            fill="url(#roseLeafGrad)"
            stroke="#145a32"
            strokeWidth="0.8"
          />
          <defs>
            <linearGradient id="roseLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27ae60" />
              <stop offset="60%" stopColor="#1e8449" />
              <stop offset="100%" stopColor="#145a32" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Layered Blooming Rose SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-110"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`roseGrad-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palettes.core} />
            <stop offset="45%" stopColor={palettes.inner} />
            <stop offset="75%" stopColor={palettes.mid} />
            <stop offset="100%" stopColor={palettes.outer} />
          </radialGradient>
        </defs>

        {/* Outer Tier Petals */}
        <circle cx="50" cy="50" r="48" fill={palettes.shadow} opacity="0.5" />
        <ellipse cx="50" cy="22" rx="22" ry="18" fill={`url(#roseGrad-${variant})`} />
        <ellipse cx="76" cy="38" rx="20" ry="19" fill={`url(#roseGrad-${variant})`} />
        <ellipse cx="70" cy="72" rx="21" ry="18" fill={`url(#roseGrad-${variant})`} />
        <ellipse cx="32" cy="76" rx="22" ry="18" fill={`url(#roseGrad-${variant})`} />
        <ellipse cx="22" cy="40" rx="19" ry="20" fill={`url(#roseGrad-${variant})`} />

        {/* Middle Tier Petals */}
        <ellipse cx="50" cy="30" rx="17" ry="15" fill={palettes.inner} />
        <ellipse cx="68" cy="48" rx="16" ry="15" fill={palettes.mid} />
        <ellipse cx="56" cy="66" rx="16" ry="15" fill={palettes.inner} />
        <ellipse cx="36" cy="60" rx="16" ry="15" fill={palettes.mid} />
        <ellipse cx="34" cy="40" rx="15" ry="15" fill={palettes.inner} />

        {/* Inner Spiral Bud */}
        <ellipse cx="50" cy="50" rx="13" ry="13" fill={palettes.core} />
        <path
          d="M 44,46 C 45,40 55,40 56,46 C 57,52 45,56 48,60"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="50" cy="50" r="3" fill="#ffeaa7" />
      </svg>
    </div>
  );
};

/**
 * Traditional Indian Wedding & Diwali Marigold (Genda Phool)
 */
export const MarigoldFlower: React.FC<FlowerProps & { colorTone?: 'saffron' | 'yellow' | 'orange' }> = ({
  size = 'md',
  className = '',
  rotation = 0,
  colorTone = 'saffron'
}) => {
  const pixelSizes = {
    xs: 22,
    sm: 30,
    md: 38,
    lg: 48,
    xl: 60
  }[size];

  const colors = {
    saffron: { outer: '#d35400', mid: '#e67e22', inner: '#f39c12', core: '#f1c40f' },
    yellow: { outer: '#f39c12', mid: '#f1c40f', inner: '#f9e79f', core: '#fff' },
    orange: { outer: '#b93a00', mid: '#d35400', inner: '#e67e22', core: '#f39c12' }
  }[colorTone];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        width: `${pixelSizes}px`,
        height: `${pixelSizes}px`
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-110"
        aria-hidden="true"
      >
        {/* Layer 1: Outer Ruffled Petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="18"
            rx="12"
            ry="16"
            fill={colors.outer}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Layer 2: Mid Saffron Petals */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="26"
            rx="10"
            ry="14"
            fill={colors.mid}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Layer 3: Inner Bright Petals */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="35"
            rx="8"
            ry="11"
            fill={colors.inner}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Dense central pollen core */}
        <circle cx="50" cy="50" r="14" fill={colors.core} />
        <circle cx="50" cy="50" r="9" fill={colors.outer} opacity="0.6" />
        <circle cx="50" cy="50" r="4" fill="#fff" opacity="0.9" />
      </svg>
    </div>
  );
};

/**
 * Fragrant White Jasmine / Mogra Floret (चमेली / मोगरा)
 */
export const JasmineFloret: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = ''
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
        {/* Calyx */}
        <circle cx="20" cy="20" r="6" fill="#27ae60" />
        {/* 5 White Petals */}
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="20"
            cy="8"
            rx="5"
            ry="8"
            fill="#ffffff"
            transform={`rotate(${angle} 20 20)`}
          />
        ))}
        {/* Golden pistil */}
        <circle cx="20" cy="20" r="3.5" fill="#f1c40f" />
      </svg>
    </div>
  );
};

/**
 * Hanging Traditional Toran Tassel with Golden Jhumka Bell
 */
const ToranTassel: React.FC<{ length?: 'short' | 'medium' | 'long'; delay?: string }> = ({
  length = 'medium',
  delay = '0s'
}) => {
  return (
    <div
      className="flex flex-col items-center animate-toran-sway origin-top pointer-events-none"
      style={{ animationDelay: delay }}
    >
      {/* Thread */}
      <div className="w-[1.5px] h-3 bg-[#b8860b]" />
      {/* Jasmine floret */}
      <JasmineFloret size={14} />
      {/* Saffron marigold bead */}
      <MarigoldFlower size="xs" colorTone="saffron" />
      {length !== 'short' && (
        <>
          <div className="w-[1.5px] h-2 bg-[#b8860b]" />
          <JasmineFloret size={12} />
        </>
      )}
      {length === 'long' && (
        <>
          <MarigoldFlower size="xs" colorTone="yellow" />
          <div className="w-[1.5px] h-2 bg-[#b8860b]" />
        </>
      )}
      {/* Golden Jhumka / Bell at tip */}
      <div className="mt-0.5 flex flex-col items-center">
        <div className="w-3.5 h-3.5 rounded-t-full bg-gradient-to-b from-[#f9e79f] via-[#d4af37] to-[#996515] border border-amber-200 shadow-sm flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#f1c40f] -mt-0.5 shadow-xs" />
      </div>
    </div>
  );
};

// ============================================================================
// 2. DIWALI LIGHTS INTEGRATED ON THE GATE ARCH & SIDES
// ============================================================================

const GateArchDiwaliLights: React.FC = () => {
  // Coordinated positions around the rounded gate arch (top curve + left & right pillars)
  const archLights = [
    // Top Arch Curve
    { left: '10%', top: '22px', color: '#ffb703', anim: 'animate-diwali-twinkle-1' },
    { left: '20%', top: '10px', color: '#fb8500', anim: 'animate-diwali-twinkle-2' },
    { left: '32%', top: '3px', color: '#ffd166', anim: 'animate-diwali-twinkle-3' },
    { left: '44%', top: '-2px', color: '#ff4d6d', anim: 'animate-diwali-twinkle-4' },
    { left: '56%', top: '-2px', color: '#ffeaa7', anim: 'animate-diwali-twinkle-1' },
    { left: '68%', top: '3px', color: '#06d6a0', anim: 'animate-diwali-twinkle-2' },
    { left: '80%', top: '10px', color: '#ffb703', anim: 'animate-diwali-twinkle-3' },
    { left: '90%', top: '22px', color: '#fb8500', anim: 'animate-diwali-twinkle-4' },

    // Left Pillar Vertical String
    { left: '-18px', top: '70px', color: '#ffd166', anim: 'animate-diwali-twinkle-2' },
    { left: '-22px', top: '140px', color: '#ff4d6d', anim: 'animate-diwali-twinkle-3' },
    { left: '-18px', top: '220px', color: '#ffb703', anim: 'animate-diwali-twinkle-1' },
    { left: '-22px', top: '300px', color: '#06d6a0', anim: 'animate-diwali-twinkle-4' },
    { left: '-18px', top: '380px', color: '#fb8500', anim: 'animate-diwali-twinkle-2' },

    // Right Pillar Vertical String
    { right: '-18px', top: '70px', color: '#06d6a0', anim: 'animate-diwali-twinkle-3' },
    { right: '-22px', top: '140px', color: '#ffb703', anim: 'animate-diwali-twinkle-1' },
    { right: '-18px', top: '220px', color: '#ff4d6d', anim: 'animate-diwali-twinkle-4' },
    { right: '-22px', top: '300px', color: '#ffd166', anim: 'animate-diwali-twinkle-2' },
    { right: '-18px', top: '380px', color: '#ffeaa7', anim: 'animate-diwali-twinkle-3' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-30" aria-hidden="true">
      {archLights.map((bulb, idx) => (
        <div
          key={idx}
          className={`absolute flex items-center justify-center ${bulb.anim}`}
          style={{
            left: bulb.left,
            right: bulb.right,
            top: bulb.top,
            color: bulb.color
          }}
        >
          {/* Radiant Aura */}
          <div
            className="absolute w-6 h-6 rounded-full blur-[4px] opacity-75"
            style={{ backgroundColor: bulb.color }}
          />
          {/* Micro Diwali Diya Bulb */}
          <div
            className="relative w-2.5 h-3 rounded-[50%_50%_45%_45%] border border-white/60 shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: bulb.color }}
          >
            <div className="w-1 h-1 rounded-full bg-white mx-auto mt-0.5 shadow-[0_0_2px_#fff]" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 3. MAIN FLORAL GATE DECORATION EXPORT
// ============================================================================

export const FloralGateDecoration: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible select-none">
      
      {/* 0. Diwali Fairy Lights Woven through Gate Garlands */}
      <GateArchDiwaliLights />

      {/* ========================================================================= */}
      {/* 1. TOP ARCH: GRAND WEDDING TORAN & FLOWER CROWN */}
      {/* ========================================================================= */}
      <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 w-[340px] sm:w-[380px] flex flex-col items-center z-30">
        
        {/* Background Foliage Band for rich realistic depth */}
        <div className="absolute inset-x-2 top-2 h-16 sm:h-20 bg-gradient-to-b from-[#1b5e20]/45 via-[#2e7d32]/25 to-transparent rounded-t-[190px] blur-[3px]" />

        {/* Top Arch Centerpiece: Majestic Crown of Blooming Roses & Marigolds */}
        <div className="relative flex items-center justify-center gap-0.5 sm:gap-1 px-2 pt-1 pb-2">
          
          {/* Left Curve Flowers */}
          <MarigoldFlower size="sm" colorTone="yellow" rotation={-40} className="-translate-y-1" />
          <RoyalRose size="sm" variant="crimson" rotation={-30} className="-translate-y-2.5" />
          <MarigoldFlower size="md" colorTone="saffron" rotation={-15} className="-translate-y-4" />
          <RoyalRose size="lg" variant="deepRed" rotation={-10} className="-translate-y-6" />

          {/* Apex Center Royal Crown Blossom with breathing animation */}
          <div className="relative -translate-y-7 sm:-translate-y-8 z-20 flex flex-col items-center">
            <div className="animate-flower-breathe">
              <RoyalRose
                size="xl"
                variant="deepRed"
                rotation={0}
                className="scale-105 filter drop-shadow-[0_8px_20px_rgba(180,0,0,0.6)]"
              />
            </div>
            
            {/* Crown Jewel Golden Noor Ornament on Apex */}
            <div className="absolute -top-2.5 w-4 h-4 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#fff] to-[#f4e4a6] shadow-[0_0_14px_rgba(212,175,55,1)] border border-white flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-[#b89125]" />
            </div>

            {/* Jasmine cluster beneath apex */}
            <div className="flex items-center gap-1 -mt-1">
              <JasmineFloret size={15} />
              <JasmineFloret size={17} />
              <JasmineFloret size={15} />
            </div>
          </div>

          {/* Right Curve Flowers */}
          <RoyalRose size="lg" variant="blush" rotation={10} className="-translate-y-6" />
          <MarigoldFlower size="md" colorTone="saffron" rotation={15} className="-translate-y-4" />
          <RoyalRose size="sm" variant="coral" rotation={30} className="-translate-y-2.5" />
          <MarigoldFlower size="sm" colorTone="yellow" rotation={40} className="-translate-y-1" />
        </div>

        {/* Traditional Hanging Toran Tassels swaying gently */}
        <div className="w-full flex justify-between px-5 -mt-3 sm:-mt-4">
          <ToranTassel length="long" delay="0s" />
          <ToranTassel length="medium" delay="0.8s" />
          <ToranTassel length="short" delay="1.5s" />
          <ToranTassel length="short" delay="0.4s" />
          <ToranTassel length="medium" delay="1.2s" />
          <ToranTassel length="long" delay="0.6s" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEFT SIDE: FULL VERTICAL PILLAR FLORAL GARLAND */}
      {/* ========================================================================= */}
      <div className="absolute -left-6 sm:-left-8 top-12 bottom-12 w-12 sm:w-14 flex flex-col justify-between items-center z-20">
        {/* Top-Left Corner Spray */}
        <div className="relative -ml-2 -mt-1">
          <RoyalRose size="lg" variant="deepRed" rotation={-25} />
          <MarigoldFlower size="xs" colorTone="yellow" className="absolute -top-1 -right-1" />
        </div>

        {/* Tier 1 Saffron Marigold */}
        <div className="relative -ml-1">
          <MarigoldFlower size="md" colorTone="saffron" rotation={15} />
          <JasmineFloret size={13} className="absolute -top-1 -left-2" />
        </div>

        {/* Tier 2 Crimson Rose */}
        <div className="relative -ml-2">
          <RoyalRose size="lg" variant="crimson" rotation={-15} />
        </div>

        {/* Tier 3 Yellow Marigold */}
        <div className="relative -ml-1">
          <MarigoldFlower size="md" colorTone="yellow" rotation={25} />
          <JasmineFloret size={14} className="absolute -bottom-1 -right-1" />
        </div>

        {/* Tier 4 Blush Rose */}
        <div className="relative -ml-2">
          <RoyalRose size="md" variant="blush" rotation={-10} />
        </div>

        {/* Tier 5 Lower Pillar Saffron Marigold & Rose */}
        <div className="relative -ml-1">
          <RoyalRose size="lg" variant="deepRed" rotation={20} />
          <MarigoldFlower size="xs" colorTone="saffron" className="absolute -bottom-1 -left-1" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT SIDE: FULL VERTICAL PILLAR FLORAL GARLAND */}
      {/* ========================================================================= */}
      <div className="absolute -right-6 sm:-right-8 top-12 bottom-12 w-12 sm:w-14 flex flex-col justify-between items-center z-20">
        {/* Top-Right Corner Spray */}
        <div className="relative -mr-2 -mt-1">
          <RoyalRose size="lg" variant="deepRed" rotation={25} />
          <MarigoldFlower size="xs" colorTone="yellow" className="absolute -top-1 -left-1" />
        </div>

        {/* Tier 1 Saffron Marigold */}
        <div className="relative -mr-1">
          <MarigoldFlower size="md" colorTone="saffron" rotation={-15} />
          <JasmineFloret size={13} className="absolute -top-1 -right-2" />
        </div>

        {/* Tier 2 Blush Rose */}
        <div className="relative -mr-2">
          <RoyalRose size="lg" variant="blush" rotation={15} />
        </div>

        {/* Tier 3 Yellow Marigold */}
        <div className="relative -mr-1">
          <MarigoldFlower size="md" colorTone="yellow" rotation={-25} />
          <JasmineFloret size={14} className="absolute -bottom-1 -left-1" />
        </div>

        {/* Tier 4 Crimson Rose */}
        <div className="relative -mr-2">
          <RoyalRose size="md" variant="crimson" rotation={10} />
        </div>

        {/* Tier 5 Lower Pillar Deep Red Rose */}
        <div className="relative -mr-1">
          <RoyalRose size="lg" variant="deepRed" rotation={-20} />
          <MarigoldFlower size="xs" colorTone="saffron" className="absolute -bottom-1 -right-1" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM THRESHOLD: PEDESTAL FLORAL URNS & MARIGOLD PETAL BED */}
      {/* ========================================================================= */}
      <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[330px] sm:w-[380px] z-20 flex items-center justify-between px-1 pointer-events-none">
        {/* Bottom-Left Lavish Floral Urn Cluster */}
        <div className="relative -ml-3 flex items-center">
          <RoyalRose size="xl" variant="deepRed" rotation={-15} />
          <MarigoldFlower size="md" colorTone="saffron" rotation={35} className="-ml-3 -mt-2" />
          <MarigoldFlower size="sm" colorTone="yellow" rotation={-40} className="-ml-2 mt-3" />
        </div>

        {/* Center Threshold Flower Garland & Petals Bed */}
        <div className="relative flex-1 flex flex-col items-center justify-center mx-1">
          {/* Row of fresh blooming flowers spanning the threshold */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <MarigoldFlower size="xs" colorTone="yellow" />
            <RoyalRose size="sm" variant="crimson" withLeaves={false} />
            <MarigoldFlower size="sm" colorTone="saffron" />
            <RoyalRose size="md" variant="deepRed" withLeaves={false} />
            <MarigoldFlower size="sm" colorTone="saffron" />
            <RoyalRose size="sm" variant="blush" withLeaves={false} />
            <MarigoldFlower size="xs" colorTone="yellow" />
          </div>

          {/* Scattered velvety red & saffron petals on the ground */}
          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-2 rounded-[50%_0_50%_50%] bg-[#c0392b] rotate-45 shadow-xs" />
            <span className="w-2.5 h-1.5 rounded-[50%_0_50%_50%] bg-[#f39c12] -rotate-30 shadow-xs" />
            <span className="w-3.5 h-2 rounded-[0_50%_50%_50%] bg-[#962d22] rotate-12 shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-[#f1c40f] rotate-60 shadow-xs" />
            <span className="w-2.5 h-1.5 rounded-[50%_0_50%_50%] bg-[#e74c3c] -rotate-45 shadow-xs" />
          </div>
        </div>

        {/* Bottom-Right Lavish Floral Urn Cluster */}
        <div className="relative -mr-3 flex items-center">
          <MarigoldFlower size="sm" colorTone="yellow" rotation={-35} className="-mr-2 mt-3" />
          <MarigoldFlower size="md" colorTone="saffron" rotation={-25} className="-mr-3 -mt-2" />
          <RoyalRose size="xl" variant="deepRed" rotation={15} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GENTLE DRIFTING VELVET ROSE & MARIGOLD PETALS AROUND THE GATE */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-6 left-1/6 w-3.5 h-3 rounded-[50%_0_50%_50%] bg-gradient-to-br from-[#e74c3c] to-[#c0392b] shadow-xs animate-petal opacity-85"
          style={{ animationDuration: '7s', animationDelay: '0s' }}
        />
        <div
          className="absolute -top-6 left-1/3 w-3 h-2.5 rounded-[50%_0_50%_50%] bg-gradient-to-br from-[#f39c12] to-[#d35400] shadow-xs animate-petal opacity-80"
          style={{ animationDuration: '9s', animationDelay: '2.5s' }}
        />
        <div
          className="absolute -top-6 right-1/4 w-3.5 h-3 rounded-[0_50%_50%_50%] bg-gradient-to-br from-[#e74c3c] to-[#962d22] shadow-xs animate-petal opacity-85"
          style={{ animationDuration: '8s', animationDelay: '1.2s' }}
        />
        <div
          className="absolute -top-6 right-1/10 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#f1c40f] to-[#f39c12] shadow-xs animate-petal opacity-75"
          style={{ animationDuration: '10s', animationDelay: '4s' }}
        />
        <div
          className="absolute -top-6 left-1/12 w-3 h-2.5 rounded-[50%_0_50%_50%] bg-gradient-to-br from-[#c0392b] to-[#78281f] shadow-xs animate-petal opacity-80"
          style={{ animationDuration: '8.5s', animationDelay: '3.1s' }}
        />
      </div>

    </div>
  );
};
