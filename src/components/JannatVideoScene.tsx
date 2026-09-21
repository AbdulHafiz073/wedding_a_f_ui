import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Language } from '../types';

interface JannatVideoSceneProps {
  isOpening: boolean;
  groomName: string;
  brideName: string;
  groomNameUr?: string;
  brideNameUr?: string;
  groomNameHi?: string;
  brideNameHi?: string;
  language?: Language;
  videoUrl?: string;
  coupleImageUrl?: string;
  coupleImages?: string[];
  onEnter: () => void;
}

export const JannatVideoScene: React.FC<JannatVideoSceneProps> = ({
  isOpening,
  groomName,
  brideName,
  groomNameUr,
  brideNameUr,
  groomNameHi,
  brideNameHi,
  language = 'en',
  coupleImageUrl,
  coupleImages,
  onEnter
}) => {
  const [zoomSettled, setZoomSettled] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Priority: If custom coupleImageUrl is set, it MUST be the primary gate reveal photo!
  const defaultPhotos = [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1623934820753-472496997f47?w=1000&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&auto=format&fit=crop&q=85'
  ];

  const photos = coupleImageUrl
    ? [coupleImageUrl, ...(coupleImages?.filter((img) => img !== coupleImageUrl) || [])]
    : coupleImages && coupleImages.length > 0
    ? coupleImages
    : defaultPhotos;

  useEffect(() => {
    if (isOpening) {
      // 1. Trigger dramatic cinematic zooming of couple portrait
      const zoomTimer = setTimeout(() => {
        setIsZooming(true);
      }, 80);

      // 2. Zooming runs smoothly, then reveals couple names & celebration button
      const settleTimer = setTimeout(() => {
        setZoomSettled(true);
      }, 2200);

      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(settleTimer);
      };
    } else {
      setIsZooming(false);
      setZoomSettled(false);
    }
  }, [isOpening]);

  // Next and Prev couple photo handlers
  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="absolute inset-0 overflow-hidden rounded-t-[152px] bg-[#0c1822]">
      
      {/* 1. Romantic Royal Couple Image Background (No rings - Pure couple portrait) */}
      <div className="relative w-full h-full will-change-transform flex items-center justify-center overflow-hidden">
        
        {/* Cinematic Zooming / Panning Couple Image */}
        {photos.map((photo, idx) => (
          <div
            key={photo + idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={photo}
              alt={`${groomName} weds ${brideName}`}
              className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                isZooming ? 'scale-110' : 'scale-100'
              }`}
              style={{ filter: 'brightness(0.92) contrast(1.05)' }}
            />
          </div>
        ))}

        {/* Ornate Inner Arch Gold Glow Frame */}
        <div className="absolute inset-1.5 rounded-t-[146px] border border-[#d4af37]/60 pointer-events-none shadow-[inset_0_0_25px_rgba(212,175,55,0.35)]" />

        {/* Ambient Heavenly Lighting & Vignette for Readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(255, 235, 170, 0.25) 0%, rgba(15, 30, 45, 0.5) 60%, rgba(5, 12, 18, 0.88) 100%)'
          }}
        />

        {/* Top-to-Bottom Gradient Overlay to make Text Crisp & Pristine */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85 pointer-events-none" />

        {/* Heavenly Light Beams */}
        <div
          className="absolute -top-10 inset-x-0 h-44 pointer-events-none opacity-40 animate-pulse mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, rgba(255,245,200,0.4) 0deg, transparent 25deg, rgba(255,230,160,0.5) 45deg, transparent 65deg, rgba(255,250,220,0.6) 90deg, transparent 115deg, rgba(255,230,160,0.5) 135deg, transparent 155deg, rgba(255,245,200,0.4) 180deg)',
            filter: 'blur(1.5px)'
          }}
        />

        {/* Floating Rose Petals & Golden Stardust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#fff] animate-ping [animation-duration:2.5s]" />
          <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-[#ffeaa7] shadow-[0_0_15px_#ffeaa7] animate-ping [animation-duration:3.2s]" />
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-[#f4e4a6] shadow-[0_0_12px_#f4e4a6] animate-ping [animation-duration:2.8s]" />

          {/* Floating Paradise Garden Rose Petals */}
          <div className="absolute top-10 left-10 w-3.5 h-3 rounded-[50%_0_50%_50%] bg-[#e74c3c]/85 shadow-sm animate-petal" />
          <div className="absolute top-24 right-12 w-3.5 h-3 rounded-[0_50%_50%_50%] bg-[#ff6b81]/85 shadow-sm animate-petal [animation-delay:1.5s]" />
          <div className="absolute top-44 left-1/2 w-2.5 h-2 rounded-[50%_50%_0_50%] bg-white/90 shadow-sm animate-petal [animation-delay:3s]" />
        </div>

        {/* Photo Gallery Switcher Arrows (if multiple photos) */}
        {photos.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-auto z-20">
            <button
              onClick={handlePrevPhoto}
              aria-label="Previous Couple Photo"
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-amber-200 backdrop-blur-xs border border-[#d4af37]/60 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              aria-label="Next Couple Photo"
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-amber-200 backdrop-blur-xs border border-[#d4af37]/60 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Photo Index Dots */}
        {photos.length > 1 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activeImageIndex
                    ? 'w-5 bg-[#f4e4a6] shadow-[0_0_8px_#f4e4a6]'
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Grand Reveal Overlay: Bismillah + Couple Names with 'weds' + Enter Celebration Button */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-between p-3 sm:p-4 text-center text-white z-30 transition-all duration-700 ease-out pointer-events-auto ${
          zoomSettled
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        {/* Top Divine Emblem & Bismillah */}
        <div className="mt-2.5 flex flex-col items-center shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/70 shadow-[0_0_18px_rgba(212,175,55,0.45)] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#f4e4a6] animate-pulse" />
            <span className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#ffeaa7] font-semibold ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
              {language === 'ur' ? 'شاہی تقریبِ نکاح' : language === 'hi' ? 'शाही निकाह समारोह' : 'Sacred Nikah Ceremony'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#f4e4a6] animate-pulse" />
          </div>

          <p className="font-arabic text-sm sm:text-base text-[#f4e4a6] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-wide">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>

        {/* Center: Grand Dulha & Dulhan Name Reveal with 'weds' (Instead of '&') */}
        <div className="my-auto flex flex-col items-center px-3 py-2.5 rounded-2xl bg-black/55 backdrop-blur-md border border-[#d4af37]/50 shadow-[0_8px_32px_rgba(0,0,0,0.75)] w-full max-w-[270px]">
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-6 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            <Heart className="w-4 h-4 text-[#ff4757] fill-[#ff4757] animate-heartbeat" />
            <span className="w-6 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          </div>

          {/* English Grand Script Names with 'weds' */}
          <h1 className="font-display text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#ffffff] to-[#d4af37] drop-shadow-[0_4px_16px_rgba(212,175,55,0.95)] tracking-wide leading-tight mb-0.5 font-bold">
            {groomName}
            <span className="block text-xl sm:text-2xl font-script text-[#f4e4a6] my-0.5 lowercase italic drop-shadow-[0_0_10px_rgba(244,228,166,0.9)] font-normal">
              weds
            </span>
            {brideName}
          </h1>

          {/* Urdu / Hindi Names if available */}
          {language === 'hi' && (groomNameHi || brideNameHi) ? (
            <h2 className="font-hindi text-base sm:text-lg text-[#f4e4a6] drop-shadow-md mt-0.5 font-bold">
              {groomNameHi || groomName} <span className="font-script lowercase text-white">weds</span> {brideNameHi || brideName}
            </h2>
          ) : (groomNameUr || brideNameUr) ? (
            <h2 className="font-urdu text-lg sm:text-xl text-[#f4e4a6] drop-shadow-md mt-0.5 font-bold">
              {groomNameUr} ❤️ {brideNameUr}
            </h2>
          ) : null}

          {/* Sacred Nikah Mubarak blessing */}
          <p className={`text-[10px] sm:text-xs tracking-wider text-amber-200/90 uppercase mt-1.5 font-medium ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {language === 'ur'
              ? 'بارک اللہ لکما وبارک علیکما'
              : language === 'hi'
              ? 'अल्लाह आप दोनों के रिश्ते में हमेशा बरकत और मोहब्बत अता फ़रमाए'
              : 'Together in Love & Blessed for Eternity'}
          </p>
        </div>

        {/* Bottom Interactive Button to Enter Celebration */}
        <div className="mb-2 w-full flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnter();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEnter();
            }}
            className="w-full max-w-[245px] px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f4e4a6] to-[#d4af37] text-[#1a3a4d] font-display font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(212,175,55,0.85)] hover:shadow-[0_6px_30px_rgba(212,175,55,1)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-2 border-white/80 ring-2 ring-[#d4af37]/50 touch-manipulation"
          >
            <span>
              {language === 'ur' ? 'تقریب میں داخل ہوں' : language === 'hi' ? 'समारोह में प्रवेश करें' : 'Enter Celebration'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#1a3a4d]" />
          </button>
          
          <span className={`text-[10px] text-[#f4e4a6]/95 tracking-widest uppercase ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
            {language === 'ur' ? 'دعوت نامہ دیکھنے کے لیے کلک کریں' : language === 'hi' ? 'विवाह निमंत्रण देखने के लिए क्लिक करें' : 'Click to view wedding invitation'}
          </span>
        </div>

      </div>

    </div>
  );
};

