import React, { useState, useEffect } from 'react';
import { weddingAudio } from '../utils/audioSynth';
import { Sparkles, Heart } from 'lucide-react';
import { FloralGateDecoration } from './FloralGateDecoration';
import { JannatVideoScene } from './JannatVideoScene';
import { DiwaliLights } from './DiwaliLights';
import { Language } from '../types';

interface DoorIntroProps {
  onDoorOpened: () => void;
  isOpen: boolean;
  onAudioStart?: () => void;
  groomName: string;
  brideName: string;
  groomNameUr?: string;
  brideNameUr?: string;
  groomNameHi?: string;
  brideNameHi?: string;
  groomImageUrl?: string;
  brideImageUrl?: string;
  language?: Language;
  jannatVideoUrl?: string;
  coupleImageUrl?: string;
  coupleImages?: string[];
}

export const DoorIntro: React.FC<DoorIntroProps> = ({
  onDoorOpened,
  isOpen,
  onAudioStart,
  groomName,
  brideName,
  groomNameUr,
  brideNameUr,
  groomNameHi,
  brideNameHi,
  groomImageUrl,
  brideImageUrl,
  language = 'en',
  jannatVideoUrl,
  coupleImageUrl,
  coupleImages
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [viewportScale, setViewportScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Gate design dimensions:
      // Inner door is 300px wide x 480px high.
      // Total floral decorated bounding box is ~340w x 520h.
      const gateTotalW = 340;
      const gateTotalH = 520;

      // Minimal reserved space for header & footer:
      const isMobile = w < 640;
      const headerFooterSpace = isMobile ? 44 : 52;
      
      // On mobile view, side portrait images are hidden, so door can take full available width.
      // On tablet and window view, reserve generous horizontal space so the swaying hanging frames breathe comfortably:
      const sideReservation = isMobile ? 12 : w < 1024 ? 260 : 360;
      const availableW = Math.max(120, w - sideReservation);
      const availableH = Math.max(160, h - headerFooterSpace);

      const scaleW = availableW / gateTotalW;
      const scaleH = availableH / gateTotalH;

      // Fit inside viewport while expanding height from bottom to top
      const bestScale = Math.min(scaleW, scaleH);
      const clampedScale = Math.max(0.42, Math.min(2.4, bestScale));

      setViewportScale(clampedScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, []);

  const handleOpen = () => {
    if (isOpening || isComplete) return;
    setIsOpening(true);

    // Start lovely ambient wedding melody
    weddingAudio.start();
    if (onAudioStart) onAudioStart();
  };

  const handleEnterCelebration = () => {
    setIsComplete(true);
    setTimeout(() => {
      onDoorOpened();
    }, 600);
  };

  if (isOpen && isComplete) {
    return null;
  }

  return (
    <div
      id="intro-overlay"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-1 py-1 sm:px-3 sm:py-1.5 overflow-hidden transition-all duration-1000 touch-none overscroll-none select-none ${
        isComplete ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B8E0F0 100%)'
      }}
      onWheel={(e) => {
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Diwali Fairy Lights along the Top Window Edge (hanging staggered on left & right sides, skipping gate & portrait boxes) */}
      <DiwaliLights gateWidth={(320 + (viewportScale < 0.9 ? 120 : 250)) * viewportScale} />

      {/* Decorative floral clusters & petals in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left floral cluster */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-radial from-[#e74c3c]/30 via-[#c0392b]/20 to-transparent blur-md" />
        <div className="absolute top-6 left-6 w-10 h-10 rounded-[50%_0_50%_50%] bg-[#e74c3c]/85 rotate-45 shadow-sm shadow-red-500/30" />
        <div className="absolute top-16 left-16 w-8 h-8 rounded-[50%_0_50%_50%] bg-[#c0392b]/80 rotate-12 shadow-sm" />
        <div className="absolute top-8 left-28 w-9 h-9 rounded-[50%_0_50%_50%] bg-[#e74c3c]/75 rotate-75 shadow-sm" />
        <div className="absolute top-24 left-8 w-7 h-7 rounded-[50%_0_50%_50%] bg-[#d63031]/80 rotate-30 shadow-sm" />

        {/* Top right floral cluster */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-radial from-[#e74c3c]/30 via-[#c0392b]/20 to-transparent blur-md" />
        <div className="absolute top-6 right-8 w-11 h-11 rounded-[50%_0_50%_50%] bg-[#c0392b]/85 -rotate-45 shadow-sm shadow-red-500/30" />
        <div className="absolute top-18 right-16 w-8 h-8 rounded-[50%_0_50%_50%] bg-[#e74c3c]/80 -rotate-20 shadow-sm" />
        <div className="absolute top-10 right-28 w-9 h-9 rounded-[50%_0_50%_50%] bg-[#d63031]/75 -rotate-60 shadow-sm" />
        <div className="absolute top-26 right-8 w-8 h-8 rounded-[50%_0_50%_50%] bg-[#e74c3c]/80 -rotate-35 shadow-sm" />

        {/* Soft floating golden lights */}
        <div className="absolute top-1/4 left-1/5 w-3 h-3 rounded-full bg-[#d4af37]/40 blur-[1px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-[#d4af37]/30 blur-[1px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-[#d4af37]/40 blur-[1px] animate-pulse" />
      </div>

      {/* 1. Header: Sleek Compact Tag Above Gate */}
      <header className="shrink-0 text-center z-20 px-2 pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-xs">
          <Heart className="w-2.5 h-2.5 text-[#e74c3c] fill-[#e74c3c] animate-pulse" />
          <span className={`text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#1a3a4d] font-bold ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {groomName} <span className="font-script lowercase text-xs sm:text-sm text-[#b89125] font-normal mx-0.5">weds</span> {brideName}
          </span>
        </div>
      </header>

      {/* 2. Center Door Stage: Dynamically Auto-Scaled to fit full height */}
      <div className="flex-1 w-full flex items-center justify-center relative my-auto overflow-visible py-0">
        <div
          style={{
            width: `${300 * viewportScale}px`,
            height: `${480 * viewportScale}px`,
          }}
          className="relative flex items-center justify-center shrink-0 transition-all duration-150"
        >
          {/* Groom Royal Portrait Hanging by Rope (Left of Gate - Tablet & Window View ONLY) */}
          <div
            id="window-groom-box"
            className={`absolute right-[calc(100%+28px)] sm:right-[calc(100%+40px)] md:right-[calc(100%+60px)] lg:right-[calc(100%+80px)] xl:right-[calc(100%+104px)] top-1/2 -translate-y-1/2 z-30 transition-all duration-700 pointer-events-auto select-none hidden sm:flex flex-col items-center ${
              isOpening ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {/* Swaying Assembly - Pendulum swing from top rope anchor */}
            <div className="animate-rope-sway-left origin-top flex flex-col items-center drop-shadow-[0_12px_24px_rgba(26,58,77,0.3)]">
              {/* 1. Top Wall Hook / Brass Peg (दीवार की सुनहरी खूंटी) */}
              <div className="relative flex flex-col items-center z-20">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ffd166] via-[#d4af37] to-[#8c6d23] border border-[#5c430e] shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3d2c08] shadow-inner" />
                </div>
              </div>

              {/* 2. Main Vertical Hanging Braided Rope (सुनहरी लटकी रस्सी) */}
              <div className="w-1.5 h-10 md:h-14 lg:h-18 bg-gradient-to-b from-[#8c6d23] via-[#ffd166] to-[#b89125] shadow-xs relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(70,40,10,0.45)_2px,rgba(70,40,10,0.45)_4px)]" />
              </div>

              {/* 3. Golden Knotted Bead + Triangular Suspension Cords */}
              <div className="relative flex flex-col items-center z-20 -mt-0.5 w-full">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ffeaa7] via-[#ffd166] to-[#b89125] border border-[#7a5a15] shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#4a3407]" />
                </div>
                {/* Suspension cord lines leading to left and right corners of frame */}
                <svg className="w-24 sm:w-28 md:w-32 h-6 -mt-1 text-[#d4af37]" viewBox="0 0 100 24" fill="none">
                  <line x1="50" y1="2" x2="10" y2="23" stroke="#8c6d23" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="90" y2="23" stroke="#8c6d23" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="10" y2="23" stroke="#ffd166" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="90" y2="23" stroke="#ffd166" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="10" cy="23" r="3" fill="#ffd166" stroke="#8c6d23" strokeWidth="1" />
                  <circle cx="90" cy="23" r="3" fill="#ffd166" stroke="#8c6d23" strokeWidth="1" />
                </svg>
              </div>

              {/* 4. The Hanging Royal Frame */}
              <div className="relative flex flex-col items-center p-1.5 sm:p-2 md:p-2.5 rounded-t-[32px] sm:rounded-t-[42px] md:rounded-t-[50px] rounded-b-xl sm:rounded-b-2xl bg-gradient-to-b from-[#faf7f2]/95 via-[#f5ede0]/95 to-[#e8decb]/95 backdrop-blur-md border-2 border-[#d4af37] shadow-[0_8px_20px_rgba(26,58,77,0.2),0_0_14px_rgba(212,175,55,0.22)] w-[96px] sm:w-[114px] md:w-[138px] lg:w-[166px]">
                {/* Top Royal Tag */}
                <div className="mb-1 sm:mb-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-[#1a3a4d] to-[#2c5f7c] text-[#f4e4a6] shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#ffd166]" />
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {language === 'ur' ? 'دُولہا' : language === 'hi' ? 'दूल्हा' : 'GROOM'}
                  </span>
                </div>

                {/* Portrait Photo Container with Arch Frame */}
                <div className="relative w-full aspect-[3/4] rounded-t-[24px] sm:rounded-t-[34px] md:rounded-t-[42px] rounded-b-md sm:rounded-b-lg overflow-hidden border border-[#d4af37]/70 shadow-inner bg-[#1a3a4d]/10">
                  <img
                    src={groomImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85'}
                    alt={groomName}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Groom Name Label */}
                <div className="mt-1 sm:mt-1.5 text-center w-full px-0.5">
                  <h3 className={`text-[10px] sm:text-[12px] md:text-[13px] lg:text-[14px] font-bold text-[#1a3a4d] leading-tight truncate ${
                    language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-serif'
                  }`}>
                    {groomNameUr && language === 'ur' ? groomNameUr : groomNameHi && language === 'hi' ? groomNameHi : groomName}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-[#8c6d23] font-medium tracking-wide mt-0.5">
                    {language === 'ur' ? 'مبارک باد' : language === 'hi' ? 'शुभकामनाएं' : 'Mubarak Baad'}
                  </p>
                </div>

                {/* Ornate Gold Corner Pins */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-xs" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-xs" />
              </div>

              {/* 5. Bottom Golden Royal Tassel (झूमर / लटकन) */}
              <div className="flex flex-col items-center -mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#ffd166] to-[#b89125] border border-[#8c6d23] shadow-xs" />
                <div className="w-0.5 h-2.5 bg-[#b89125]" />
                <div className="w-3.5 h-5 rounded-b-full bg-gradient-to-b from-[#ffd166] via-[#d4af37] to-[#8c6d23] shadow-xs flex flex-col items-center justify-end pb-0.5">
                  <div className="w-2 h-1 bg-[#4a3407]/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Bride Royal Portrait Hanging by Rope (Right of Gate - Tablet & Window View ONLY) */}
          <div
            id="window-bride-box"
            className={`absolute left-[calc(100%+28px)] sm:left-[calc(100%+40px)] md:left-[calc(100%+60px)] lg:left-[calc(100%+80px)] xl:left-[calc(100%+104px)] top-1/2 -translate-y-1/2 z-30 transition-all duration-700 pointer-events-auto select-none hidden sm:flex flex-col items-center ${
              isOpening ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            {/* Swaying Assembly - Pendulum swing from top rope anchor */}
            <div className="animate-rope-sway-right origin-top flex flex-col items-center drop-shadow-[0_12px_24px_rgba(26,58,77,0.3)]">
              {/* 1. Top Wall Hook / Brass Peg (दीवार की सुनहरी खूंटी) */}
              <div className="relative flex flex-col items-center z-20">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ffd166] via-[#d4af37] to-[#8c6d23] border border-[#5c430e] shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3d2c08] shadow-inner" />
                </div>
              </div>

              {/* 2. Main Vertical Hanging Braided Rope (सुनहरी लटकी रस्सी) */}
              <div className="w-1.5 h-10 md:h-14 lg:h-18 bg-gradient-to-b from-[#8c6d23] via-[#ffd166] to-[#b89125] shadow-xs relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(70,40,10,0.45)_2px,rgba(70,40,10,0.45)_4px)]" />
              </div>

              {/* 3. Golden Knotted Bead + Triangular Suspension Cords */}
              <div className="relative flex flex-col items-center z-20 -mt-0.5 w-full">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ffeaa7] via-[#ffd166] to-[#b89125] border border-[#7a5a15] shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#4a3407]" />
                </div>
                {/* Suspension cord lines leading to left and right corners of frame */}
                <svg className="w-24 sm:w-28 md:w-32 h-6 -mt-1 text-[#d4af37]" viewBox="0 0 100 24" fill="none">
                  <line x1="50" y1="2" x2="10" y2="23" stroke="#8c6d23" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="90" y2="23" stroke="#8c6d23" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="10" y2="23" stroke="#ffd166" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="50" y1="2" x2="90" y2="23" stroke="#ffd166" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="10" cy="23" r="3" fill="#ffd166" stroke="#8c6d23" strokeWidth="1" />
                  <circle cx="90" cy="23" r="3" fill="#ffd166" stroke="#8c6d23" strokeWidth="1" />
                </svg>
              </div>

              {/* 4. The Hanging Royal Frame */}
              <div className="relative flex flex-col items-center p-1.5 sm:p-2 md:p-2.5 rounded-t-[32px] sm:rounded-t-[42px] md:rounded-t-[50px] rounded-b-xl sm:rounded-b-2xl bg-gradient-to-b from-[#faf7f2]/95 via-[#f5ede0]/95 to-[#e8decb]/95 backdrop-blur-md border-2 border-[#d4af37] shadow-[0_8px_20px_rgba(26,58,77,0.2),0_0_14px_rgba(212,175,55,0.22)] w-[96px] sm:w-[114px] md:w-[138px] lg:w-[166px]">
                {/* Top Royal Tag */}
                <div className="mb-1 sm:mb-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7a1e28] to-[#a82d3b] text-[#fbe3b5] shadow-xs flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-[#ff4d6d] fill-[#ff4d6d]" />
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {language === 'ur' ? 'دُلہن' : language === 'hi' ? 'दुल्हन' : 'BRIDE'}
                  </span>
                </div>

                {/* Portrait Photo Container with Arch Frame */}
                <div className="relative w-full aspect-[3/4] rounded-t-[24px] sm:rounded-t-[34px] md:rounded-t-[42px] rounded-b-md sm:rounded-b-lg overflow-hidden border border-[#d4af37]/70 shadow-inner bg-[#7a1e28]/10">
                  <img
                    src={brideImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85'}
                    alt={brideName}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Bride Name Label */}
                <div className="mt-1 sm:mt-1.5 text-center w-full px-0.5">
                  <h3 className={`text-[10px] sm:text-[12px] md:text-[13px] lg:text-[14px] font-bold text-[#1a3a4d] leading-tight truncate ${
                    language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-serif'
                  }`}>
                    {brideNameUr && language === 'ur' ? brideNameUr : brideNameHi && language === 'hi' ? brideNameHi : brideName}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-[#8c6d23] font-medium tracking-wide mt-0.5">
                    {language === 'ur' ? 'ماشاءاللہ' : language === 'hi' ? 'माशाअल्लाह' : 'MashAllah'}
                  </p>
                </div>

                {/* Ornate Gold Corner Pins */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-xs" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-xs" />
              </div>

              {/* 5. Bottom Golden Royal Tassel (झूमर / लटकन) */}
              <div className="flex flex-col items-center -mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#ffd166] to-[#b89125] border border-[#8c6d23] shadow-xs" />
                <div className="w-0.5 h-2.5 bg-[#b89125]" />
                <div className="w-3.5 h-5 rounded-b-full bg-gradient-to-b from-[#ffd166] via-[#d4af37] to-[#8c6d23] shadow-xs flex flex-col items-center justify-end pb-0.5">
                  <div className="w-2 h-1 bg-[#4a3407]/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>


          <div
            style={{
              transform: `scale(${viewportScale})`,
              transformOrigin: 'center center',
              width: '300px',
              height: '480px',
            }}
            className="absolute flex items-center justify-center will-change-transform select-none"
          >
            {/* 3D Door Arch Scene */}
            <div
              id="doorScene"
              onClick={!isOpening ? handleOpen : undefined}
              onTouchEnd={(e) => {
                if (!isOpening) {
                  e.preventDefault();
                  handleOpen();
                }
              }}
              className={`relative w-[300px] h-[480px] select-none perspective-1200 z-20 transition-transform duration-300 touch-manipulation ${
                !isOpening ? 'cursor-pointer group hover:scale-[1.01] active:scale-[0.98]' : 'cursor-default'
              }`}
              role="button"
              tabIndex={0}
              aria-label="Open wedding invitation door"
              onKeyDown={(e) => {
                if (!isOpening && (e.key === 'Enter' || e.key === ' ')) handleOpen();
              }}
            >
            {/* Real Flower Garlands Decorating the Gate from All Four Sides */}
            <FloralGateDecoration />

            {/* Outer Frame with Arched Top */}
            <div className="relative w-full h-full rounded-t-[160px] p-2 bg-gradient-to-br from-[#faf7f2] via-[#e8e0d5] to-[#d6cbbe] shadow-[0_25px_60px_rgba(26,58,77,0.35),0_0_20px_rgba(212,175,55,0.25)] border-2 border-[#d4af37]/40">
              
              {/* Inner Arched Chamber with Reveal Layer Behind Doors */}
              <div className="relative w-full h-full rounded-t-[152px] overflow-hidden bg-gradient-to-b from-[#102431] to-[#1a3a4d] preserve-3d shadow-inner">
                
                {/* Interior Reveal: Romantic Couple Image with Zooming & Couple Name Reveal */}
                <JannatVideoScene
                  isOpening={isOpening}
                  groomName={groomName}
                  brideName={brideName}
                  groomNameUr={groomNameUr}
                  brideNameUr={brideNameUr}
                  groomNameHi={groomNameHi}
                  brideNameHi={brideNameHi}
                  language={language}
                  videoUrl={jannatVideoUrl}
                  coupleImageUrl={coupleImageUrl}
                  coupleImages={coupleImages}
                  onEnter={handleEnterCelebration}
                />

                {/* Left Door Panel */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-tl-[152px] preserve-3d transition-transform duration-[1600ms] ease-[cubic-bezier(0.4,0,0.2,1)] origin-left border-r border-[#1a3a4d]/40 shadow-2xl ${
                    isOpening ? 'door-open-left' : 'rotate-y-0'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #1f4f6c 0%, #2c5f7c 50%, #1a3a4d 100%)'
                  }}
                >
                  {/* Outer panel molding frame */}
                  <div className="absolute inset-2.5 rounded-tl-[140px] border-2 border-white/25 pointer-events-none" />
                  {/* Inner panel molding frame */}
                  <div className="absolute inset-5 rounded-tl-[128px] border border-[#d4af37]/50 pointer-events-none" />
                  {/* Ornate lower panel grid */}
                  <div className="absolute bottom-8 left-4 right-3 h-28 border border-white/20 rounded bg-white/[0.03]" />
                  
                  {/* Left Door Handle */}
                  <div className="absolute top-[54%] right-3.5 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#b89125] via-[#f4e4a6] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.8)] border border-[#fff]/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1a3a4d]" />
                    </div>
                  </div>
                </div>

                {/* Right Door Panel */}
                <div
                  className={`absolute top-0 bottom-0 right-0 w-1/2 rounded-tr-[152px] preserve-3d transition-transform duration-[1600ms] ease-[cubic-bezier(0.4,0,0.2,1)] origin-right border-l border-[#1a3a4d]/40 shadow-2xl ${
                    isOpening ? 'door-open-right' : 'rotate-y-0'
                  }`}
                  style={{
                    background: 'linear-gradient(225deg, #1f4f6c 0%, #2c5f7c 50%, #1a3a4d 100%)'
                  }}
                >
                  {/* Outer panel molding frame */}
                  <div className="absolute inset-2.5 rounded-tr-[140px] border-2 border-white/25 pointer-events-none" />
                  {/* Inner panel molding frame */}
                  <div className="absolute inset-5 rounded-tr-[128px] border border-[#d4af37]/50 pointer-events-none" />
                  {/* Ornate lower panel grid */}
                  <div className="absolute bottom-8 left-3 right-4 h-28 border border-white/20 rounded bg-white/[0.03]" />

                  {/* Right Door Handle */}
                  <div className="absolute top-[54%] left-3.5 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#b89125] via-[#f4e4a6] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.8)] border border-[#fff]/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1a3a4d]" />
                    </div>
                  </div>
                </div>

                {/* Center Door Text Overlay */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 pointer-events-none px-4 transition-all duration-700 ${
                    isOpening ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="mb-2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-[#d4af37]/40 shadow-lg">
                    <Sparkles className="w-5 h-5 text-[#f4e4a6]" />
                  </div>
                  {/* Top flourish decorative wings */}
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#f4e4a6]/80" />
                    <span className="text-[#f4e4a6] text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold drop-shadow">
                      ✦ Royal Invitation ✦
                    </span>
                    <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#f4e4a6]/80" />
                  </div>

                  {/* Main Calligraphic Designed "You're Invited" */}
                  <div className="relative py-1 px-4 my-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent blur-sm rounded-full pointer-events-none" />

                    <h1
                      className={`relative text-4xl sm:text-5xl md:text-6xl tracking-wide select-none ${
                        language === 'ur'
                          ? 'font-urdu text-[#fffef0] leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]'
                          : language === 'hi'
                          ? 'font-hindi font-extrabold text-[#fffef0] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]'
                          : 'font-script text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fff8dc] to-[#f4e4a6] drop-shadow-[0_4px_16px_rgba(212,175,55,0.7)]'
                      }`}
                    >
                      {language === 'ur' ? 'آپ صمیمِ قلب سے مدعو ہیں' : language === 'hi' ? 'सादर आमंत्रण' : "You're Invited"}
                    </h1>
                  </div>
                  <div className="mt-2.5 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#f4e4a6]/40 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
                      <span className="w-3.5 h-3.5 rounded-full border border-[#f4e4a6] flex items-center justify-center animate-tapPulse shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4e4a6]" />
                      </span>
                      <span
                        className={`text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold text-[#f4e4a6] drop-shadow ${
                          language === 'hi' ? 'font-hindi' : 'font-display'
                        }`}
                      >
                        {language === 'ur' ? 'کھولنے کے لیے گیٹ کو چھوئیں' : language === 'hi' ? 'खोलने के लिए गेट छुएं' : 'Tap Door to Enter'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 3. Footer: Helper Caption at Bottom */}
      <footer className="shrink-0 text-center z-10 py-0.5 px-3 max-w-md">
        <p className={`text-[10px] sm:text-[11px] tracking-wider uppercase text-[#1a3a4d]/80 font-medium ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
          {!isOpening
            ? (language === 'ur'
                ? 'تقریب کا دروازہ کھولنے کے لیے گیٹ پر ٹیپ کریں'
                : language === 'hi'
                ? 'समारोह का द्वार खोलने के लिए गेट पर टैप करें'
                : 'Click or tap the door to open the royal gate')
            : (language === 'ur'
                ? 'دعوت نامہ دیکھنے کے لیے "تقریب میں داخل ہوں" پر کلک کریں'
                : language === 'hi'
                ? 'विवाह निमंत्रण देखने के लिए "समारोह में प्रवेश करें" पर क्लिक करें'
                : 'Click "Enter Celebration" on the video to view invitation')}
        </p>
      </footer>
    </div>
  );
};

