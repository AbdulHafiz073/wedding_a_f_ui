import React, { useMemo, useState, useEffect } from 'react';

interface DiwaliLightsProps {
  className?: string;
  gateWidth?: number; // Optional explicit gate width in pixels from parent
}

interface StringDrop {
  id: string;
  xPos: number; // pixel position from left
  totalHeight: number; // in pixels
  color: string;
  glowColor: string;
  animClass: string;
  bulbCount: number;
}

export const DiwaliLights: React.FC<DiwaliLightsProps> = ({
  className = '',
  gateWidth,
}) => {
  // Track window dimensions for dynamic responsive spacing
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Festive Diwali color palette (warm gold, festive amber, champagne gold, ruby red, fairy white, emerald)
  const bulbColors = useMemo(() => [
    { color: '#ffb703', glow: 'rgba(255, 183, 3, 0.9)' },    // Warm Golden
    { color: '#fb8500', glow: 'rgba(251, 133, 0, 0.9)' },    // Deep Amber Saffron
    { color: '#ffd166', glow: 'rgba(255, 209, 102, 0.9)' },  // Champagne Gold
    { color: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.85)' },  // Ruby Celebration Red
    { color: '#ffeaa7', glow: 'rgba(255, 234, 167, 0.95)' }, // Warm Fairy White
    { color: '#06d6a0', glow: 'rgba(6, 214, 160, 0.85)' },  // Festive Emerald Green
  ], []);

  // Calculate left and right hanging light strings, skipping the center gate area ("gate ko chord")
  const { leftStrings, rightStrings } = useMemo(() => {
    const W = windowSize.width;
    const H = windowSize.height;
    const isMobile = W < 640;
    const isTablet = W >= 640 && W < 1024;

    // Determine the width of the central gate to skip
    // If gateWidth is passed from parent, use it; otherwise estimate based on screen size
    let effectiveGateW = gateWidth;
    if (!effectiveGateW) {
      if (isMobile) {
        effectiveGateW = Math.min(W * 0.72, 310);
      } else if (isTablet) {
        effectiveGateW = Math.min(W * 0.55, 420);
      } else {
        effectiveGateW = Math.min(W * 0.44, 490);
      }
    }

    // Clearance margin around the gate so lights never collide with floral borders
    const clearancePadding = isMobile ? 12 : 28;
    const gateLeftBoundary = Math.max(36, (W - effectiveGateW) / 2 - clearancePadding);
    const gateRightBoundary = Math.min(W - 36, (W + effectiveGateW) / 2 + clearancePadding);

    // Staggered height multiplier (mobile screens get slightly shorter drops so they stay elegant)
    const heightMultiplier = isMobile ? Math.min(1, H / 750) * 0.75 : isTablet ? 0.9 : 1.0;

    // Up-and-down staggered height sequence ("upar neeche krke latkani hai")
    // Values range between ~70px and ~260px (dips low and pulls up rhythmically)
    const rawPatternLeft = [105, 210, 80, 255, 125, 195, 75, 235, 115, 175, 90];
    const rawPatternRight = [90, 175, 115, 235, 75, 195, 125, 255, 80, 210, 105];

    // Spacing between hanging strings (in px) - optimized to keep phone & laptop cool
    const spacing = isMobile ? 38 : isTablet ? 42 : 48;

    // 1. Generate Left Strings (from left edge to gateLeftBoundary)
    const leftList: StringDrop[] = [];
    const leftAvailableWidth = gateLeftBoundary - 10;
    const leftCount = Math.max(1, Math.floor(leftAvailableWidth / spacing));
    const leftActualSpacing = leftAvailableWidth / leftCount;

    for (let i = 0; i < leftCount; i++) {
      const x = 12 + i * leftActualSpacing;
      const baseH = rawPatternLeft[i % rawPatternLeft.length];
      const totalH = Math.round(baseH * heightMultiplier);
      const colorObj = bulbColors[i % bulbColors.length];
      const animClass = `animate-diwali-twinkle-${(i % 4) + 1}`;
      // Lightweight single or double bulb per string
      const bulbCount = totalH > 200 ? 2 : 1;

      leftList.push({
        id: `left-${i}`,
        xPos: x,
        totalHeight: totalH,
        color: colorObj.color,
        glowColor: colorObj.glow,
        animClass,
        bulbCount,
      });
    }

    // 2. Generate Right Strings (from gateRightBoundary to right edge)
    const rightList: StringDrop[] = [];
    const rightAvailableWidth = (W - 10) - gateRightBoundary;
    const rightCount = Math.max(1, Math.floor(rightAvailableWidth / spacing));
    const rightActualSpacing = rightAvailableWidth / rightCount;

    for (let i = 0; i < rightCount; i++) {
      const x = gateRightBoundary + (i + 0.5) * rightActualSpacing;
      const baseH = rawPatternRight[i % rawPatternRight.length];
      const totalH = Math.round(baseH * heightMultiplier);
      const colorObj = bulbColors[(i + 3) % bulbColors.length];
      const animClass = `animate-diwali-twinkle-${((i + 2) % 4) + 1}`;
      const bulbCount = totalH > 200 ? 2 : 1;

      rightList.push({
        id: `right-${i}`,
        xPos: x,
        totalHeight: totalH,
        color: colorObj.color,
        glowColor: colorObj.glow,
        animClass,
        bulbCount,
      });
    }

    return { leftStrings: leftList, rightStrings: rightList };
  }, [windowSize, gateWidth, bulbColors]);

  const allStrings = useMemo(() => [...leftStrings, ...rightStrings], [leftStrings, rightStrings]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 pointer-events-none select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* 1. Main Top Cable / Wire spanning across the ceiling with gentle festoon sag */}
      <svg
        className="w-full h-4 absolute top-0 left-0 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 1200 16"
      >
        {/* Soft wire shadow */}
        <path
          d="M 0,2 Q 50,7 100,2 Q 150,7 200,2 Q 250,7 300,2 Q 350,7 400,2 Q 450,7 500,2 Q 550,7 600,2 Q 650,7 700,2 Q 750,7 800,2 Q 850,7 900,2 Q 950,7 1000,2 Q 1050,7 1100,2 Q 1150,7 1200,2"
          fill="none"
          stroke="rgba(0, 0, 0, 0.35)"
          strokeWidth="2"
        />
        {/* Dark bronze/green insulated festive wire */}
        <path
          d="M 0,2 Q 50,7 100,2 Q 150,7 200,2 Q 250,7 300,2 Q 350,7 400,2 Q 450,7 500,2 Q 550,7 600,2 Q 650,7 700,2 Q 750,7 800,2 Q 850,7 900,2 Q 950,7 1000,2 Q 1050,7 1100,2 Q 1150,7 1200,2"
          fill="none"
          stroke="#163829"
          strokeWidth="1.8"
        />
      </svg>

      {/* 2. Hanging Vertical Strings on Both Sides (Gate center is completely skipped) */}
      <div className="relative w-full h-80 overflow-visible">
        {allStrings.map((str) => {
          // Compute intermediate bead positions if bulbCount > 1
          const intermediatePositions = [];
          if (str.bulbCount === 2) {
            intermediatePositions.push(str.totalHeight * 0.52);
          } else if (str.bulbCount === 3) {
            intermediatePositions.push(str.totalHeight * 0.36);
            intermediatePositions.push(str.totalHeight * 0.68);
          }

          return (
            <div
              key={str.id}
              className="absolute top-0 flex flex-col items-center"
              style={{
                left: `${str.xPos}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Vertical string wire dropping down */}
              <div
                className="w-[1.2px] bg-gradient-to-b from-[#163829] via-[#2d6a4f]/80 to-[#40916c]/90 relative"
                style={{ height: `${str.totalHeight}px` }}
              >
                {/* Intermediate Fairy Rice Beads along the hanging wire */}
                {intermediatePositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="absolute -left-[3.5px] -translate-y-1/2 flex items-center justify-center"
                    style={{ top: `${pos}px` }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${str.animClass}`}
                      style={{
                        backgroundColor: str.color,
                        boxShadow: `0 0 6px ${str.glowColor}, 0 0 12px ${str.glowColor}`,
                      }}
                    >
                      {/* Hot white filament center */}
                      <div className="w-0.5 h-0.5 rounded-full bg-white/95 mx-auto mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Brass/Dark Socket Cap */}
              <div className="w-2.5 h-1.5 bg-[#163829] rounded-t-xs -mt-[1px] shadow-xs" />

              {/* Main Terminal Diya / Pear-Shaped Glowing Light Bulb at the Bottom Tip */}
              <div
                className={`relative ${str.animClass}`}
                style={{
                  color: str.color,
                }}
              >
                {/* Wide soft radiant aura */}
                <div
                  className="absolute inset-0 rounded-full blur-[8px] opacity-85"
                  style={{
                    backgroundColor: str.glowColor,
                    transform: 'scale(2.4)',
                  }}
                />

                {/* Sparkling pear-shaped bulb */}
                <div
                  className="relative rounded-[50%_50%_45%_45%] border border-white/50 shadow-md transition-transform duration-300"
                  style={{
                    width: '10px',
                    height: '14px',
                    backgroundColor: str.color,
                    boxShadow: `0 0 10px ${str.glowColor}, 0 0 22px ${str.glowColor}`,
                  }}
                >
                  {/* Glowing white filament core */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/95 shadow-[0_0_5px_#fff]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Soft festive golden ambiance haze along top corners (left and right flanks) */}
      <div className="absolute top-0 left-0 w-1/3 h-24 bg-gradient-to-br from-[#ffb703]/15 via-[#fb8500]/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-24 bg-gradient-to-bl from-[#ffb703]/15 via-[#fb8500]/5 to-transparent pointer-events-none" />
    </div>
  );
};
