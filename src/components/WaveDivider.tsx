import React from 'react';

interface WaveDividerProps {
  position?: 'top' | 'bottom';
  fillColor: string;
  variant?: 'wave1' | 'wave2' | 'wave3' | 'gentle';
  className?: string;
  secondaryOpacity?: number;
  flipX?: boolean;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  position = 'bottom',
  fillColor,
  variant = 'wave1',
  className = '',
  secondaryOpacity = 0.35,
  flipX = false
}) => {
  const isTop = position === 'top';

  // Distinct elegant organic wave paths for variation across sections
  const renderPath = () => {
    switch (variant) {
      case 'wave2':
        return (
          <>
            {/* Layered soft background wave */}
            <path
              d="M0,25 C150,60 350,5 500,45 C650,85 850,20 1000,55 C1150,90 1320,30 1440,50 L1440,120 L0,120 Z"
              fill="currentColor"
              fillOpacity={secondaryOpacity}
            />
            {/* Primary foreground wave */}
            <path
              d="M0,55 C180,10 320,80 520,35 C720,-10 880,70 1080,30 C1250,-5 1360,60 1440,40 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </>
        );

      case 'wave3':
        return (
          <>
            {/* Layered soft background wave */}
            <path
              d="M0,40 C240,85 480,15 720,55 C960,95 1200,25 1440,65 L1440,120 L0,120 Z"
              fill="currentColor"
              fillOpacity={secondaryOpacity}
            />
            {/* Primary foreground wave */}
            <path
              d="M0,70 C220,20 460,90 700,45 C940,0 1180,75 1440,35 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </>
        );

      case 'gentle':
        return (
          <>
            {/* Layered soft background wave */}
            <path
              d="M0,30 Q360,75 720,35 T1440,30 L1440,120 L0,120 Z"
              fill="currentColor"
              fillOpacity={secondaryOpacity}
            />
            {/* Primary foreground wave */}
            <path
              d="M0,50 Q360,10 720,50 T1440,45 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </>
        );

      case 'wave1':
      default:
        return (
          <>
            {/* Layered soft background wave */}
            <path
              d="M0,32 C120,65 260,20 420,55 C580,90 740,40 900,70 C1060,100 1260,35 1440,60 L1440,120 L0,120 Z"
              fill="currentColor"
              fillOpacity={secondaryOpacity}
            />
            {/* Primary foreground wave */}
            <path
              d="M0,68 C160,25 320,85 480,45 C640,5 820,80 1000,40 C1180,0 1320,70 1440,48 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </>
        );
    }
  };

  return (
    <div
      className={`absolute inset-x-0 w-full overflow-hidden leading-none pointer-events-none select-none z-20 ${
        isTop ? '-top-[1px]' : '-bottom-[1px]'
      } ${className}`}
      style={{ color: fillColor }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="relative block w-full h-8 sm:h-14 md:h-18 lg:h-20 drop-shadow-xs"
        style={{
          transform: `${isTop ? 'rotate(180deg)' : ''} ${flipX ? 'scaleX(-1)' : ''}`.trim() || undefined
        }}
      >
        {renderPath()}
      </svg>
    </div>
  );
};
