import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Language } from '../types';

interface PhotoGalleryProps {
  language: Language;
  images: {
    url: string;
    captionEn: string;
    captionUr: string;
  }[];
  weddingDateStr: string;
  weddingTimeStr: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  language,
  images,
  weddingDateStr,
  weddingTimeStr
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<number | null>(null);

  const minSwipeDistance = 45;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (!isPaused && images.length > 1) {
      autoPlayRef.current = window.setInterval(nextSlide, 4500);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex, isPaused, images.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* "Our forever begins" title */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl sm:text-4xl text-[#1a3a4d] mb-1 ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi font-bold' : 'font-script'}`}>
          {language === 'ur'
            ? 'ہمارا ہمیشہ کا سفر شروع ہوتا ہے'
            : language === 'hi'
            ? 'हमेशा के लिए हमारा सफ़र'
            : 'Our forever begins'}
        </h2>
        <div className="w-16 h-[1px] bg-[#d4af37] mx-auto relative my-3">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f0f8ff] px-2 text-[#d4af37] text-xs">
            ❦
          </span>
        </div>
      </div>

      {/* Heart-outlined Date Circular Badge (Matching reference) */}
      <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full border-2 border-[#4a8bb5] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 shadow-[0_8px_30px_rgba(44,95,124,0.12)] mb-8 transition-transform hover:scale-105 duration-300">
        {/* Outer concentric gold ring */}
        <div className="absolute -inset-2.5 rounded-full border border-[#d4af37]/40 pointer-events-none" />
        <div className="absolute -inset-4 rounded-full border border-[#4a8bb5]/20 pointer-events-none" />

        <Heart className="w-4 h-4 text-[#e74c3c] fill-[#e74c3c] mb-1.5 animate-pulse" />
        <h4 className={`text-xs uppercase tracking-widest text-[#777] mb-1 ${language === 'hi' ? 'font-hindi' : 'font-display'}`}>
          {language === 'ur' ? 'دعوت نامہ' : language === 'hi' ? 'सादर आमंत्रण' : "You're Invited!"}
        </h4>
        <p className="font-display text-xl sm:text-2xl font-bold text-[#1a3a4d] leading-tight">
          {weddingDateStr}
        </p>
        <p className="text-xs font-body text-[#777] mt-1 tracking-wide">
          {weddingTimeStr}
        </p>
      </div>

      {/* Swipeable Photo Gallery Slider */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(26,58,77,0.15)] border-2 border-white/80 bg-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="min-w-full h-72 sm:h-80 relative group">
              <img
                src={img.url}
                alt={`Couple portrait ${idx + 1}`}
                className="w-full h-full object-cover select-none"
                loading="lazy"
              />
              {/* Subtle gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a4d]/80 via-transparent to-black/10" />

              {/* Caption */}
              <div className="absolute bottom-3 left-4 right-4 text-center">
                <p className={`text-white text-xs sm:text-sm drop-shadow-md ${language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-display italic'}`}>
                  {language === 'ur' ? img.captionUr : language === 'hi' ? (img.captionHi || img.captionEn) : img.captionEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Previous button */}
        <button
          onClick={prevSlide}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#1a3a4d] backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-90"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next button */}
        <button
          onClick={nextSlide}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#1a3a4d] backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-90"
          aria-label="Next photo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Gallery Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx
                ? 'w-6 h-2 bg-[#2c5f7c]'
                : 'w-2 h-2 bg-[#2c5f7c]/30 hover:bg-[#2c5f7c]/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
