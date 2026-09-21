import React from 'react';
import { SkyLanternsAnimation } from './SkyLanternsAnimation';
import { Language } from '../types';

interface HeroVideoBackgroundProps {
  videoUrl?: string;
  className?: string;
  language?: Language;
}

export const HeroVideoBackground: React.FC<HeroVideoBackgroundProps> = ({
  className = '',
  language = 'en'
}) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden select-none z-0 ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 1. Magnificent Glowing Sky Lanterns Animation (Rising sea of warm amber lanterns, sparks & night sky) */}
      <div className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }}>
        <SkyLanternsAnimation language={language} />
      </div>

      {/* 2. Atmospheric Luminous Rose-Peach & Warm Amber Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(254, 215, 170, 0.22) 0%, rgba(252, 231, 243, 0.18) 40%, transparent 75%)'
        }}
      />

      {/* 3. Soft luminous top edge feathering */}
      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

      {/* 4. Subtle, sheer bottom feathering so lighting lamps are 100% visible across the entire background */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#f5f0e8]/40 to-transparent pointer-events-none" />
    </div>
  );
};
