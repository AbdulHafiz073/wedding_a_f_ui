import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Images, MapPin, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { HaldiVideoPlayer } from './HaldiVideoPlayer';
import { WaveDivider } from './WaveDivider';
import { CeremonyGalleryModal } from './CeremonyGalleryModal';
import { getCeremonyPhotos } from '../utils/ceremonyGalleryStorage';

interface HaldiCeremonySectionProps {
  language: Language;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  locationEn?: string;
  locationUr?: string;
  locationHi?: string;
  addressEn?: string;
  addressUr?: string;
  addressHi?: string;
  dateEn?: string;
  dateUr?: string;
  dateHi?: string;
  timeEn?: string;
  timeUr?: string;
  timeHi?: string;
  mapUrl?: string;
}

export const HaldiCeremonySection: React.FC<HaldiCeremonySectionProps> = ({
  language,
  videoUrl,
  onVideoChange,
  locationEn,
  locationUr,
  locationHi,
  addressEn,
  addressUr,
  addressHi,
  dateEn,
  dateUr,
  dateHi,
  timeEn,
  timeUr,
  timeHi,
  mapUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [photosCount, setPhotosCount] = useState<number>(() => getCeremonyPhotos('haldi').length);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.ceremonyId === 'haldi' && typeof e.detail?.count === 'number') {
        setPhotosCount(e.detail.count);
      }
    };
    window.addEventListener('ceremonyPhotosUpdated', handleUpdate);
    return () => window.removeEventListener('ceremonyPhotosUpdated', handleUpdate);
  }, []);

  // Continuous background canvas simulation of Haldi powder clouds & swirling marigold petals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Turmeric Powder Cloud Puffs
    interface PowderCloud {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      opacity: number;
      maxOpacity: number;
      growing: boolean;
    }

    const powderColors = [
      'rgba(241, 196, 15, ',
      'rgba(243, 156, 18, ',
      'rgba(255, 211, 42, ',
      'rgba(251, 197, 49, ',
      'rgba(255, 220, 90, '
    ];

    const clouds: PowderCloud[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 140,
      color: powderColors[Math.floor(Math.random() * powderColors.length)],
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: -0.2 - Math.random() * 0.5,
      opacity: Math.random() * 0.35,
      maxOpacity: 0.3 + Math.random() * 0.3,
      growing: Math.random() > 0.5
    }));

    // 2. Swirling Marigold Flower Petals
    interface MarigoldPetal {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      swaySpeed: number;
      swayOffset: number;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const petalColors = ['#f1c40f', '#f39c12', '#ffa801', '#ffc048', '#ff9f1a', '#e67e22'];
    const petals: MarigoldPetal[] = Array.from({ length: isMobile ? 18 : 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 8 + Math.random() * 12,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      speedY: 1.0 + Math.random() * 1.8,
      speedX: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      swaySpeed: 1 + Math.random() * 2,
      swayOffset: Math.random() * Math.PI * 2
    }));

    // 3. Golden Haldi Rain Streaks (हल्दी की बारिश)
    interface HaldiRainDrop {
      x: number;
      y: number;
      length: number;
      speedY: number;
      opacity: number;
      thickness: number;
      color: string;
    }

    const rainColors = ['#f59e0b', '#fbbf24', '#fde047', '#eab308', '#d97706'];
    const rainDrops: HaldiRainDrop[] = Array.from({ length: isMobile ? 25 : 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 15 + Math.random() * 28,
      speedY: 4.0 + Math.random() * 5.0,
      opacity: 0.45 + Math.random() * 0.45,
      thickness: 1.4 + Math.random() * 1.6,
      color: rainColors[Math.floor(Math.random() * rainColors.length)]
    }));

    let time = 0;
    let lastFrameTime = performance.now();
    const targetFpsInterval = 1000 / 35; // 35 FPS cap
    let isVisible = false;

    const render = (timestamp: number) => {
      if (!isVisible) return;

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < targetFpsInterval) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = timestamp - (elapsed % targetFpsInterval);

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // A. Render Billowing Turmeric Powder Clouds (Haldi Holi smoke)
      clouds.forEach((cloud) => {
        cloud.x += cloud.speedX;
        cloud.y += cloud.speedY;

        if (cloud.growing) {
          cloud.opacity += 0.003;
          if (cloud.opacity >= cloud.maxOpacity) cloud.growing = false;
        } else {
          cloud.opacity -= 0.003;
          if (cloud.opacity <= 0.05) cloud.growing = true;
        }

        if (cloud.y < -cloud.radius) {
          cloud.y = height + cloud.radius;
          cloud.x = Math.random() * width;
        }
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;

        const grad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        grad.addColorStop(0, `${cloud.color}${cloud.opacity})`);
        grad.addColorStop(0.5, `${cloud.color}${cloud.opacity * 0.6})`);
        grad.addColorStop(1, `${cloud.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Render Golden Haldi Rain Drops
      rainDrops.forEach((drop) => {
        drop.y += drop.speedY;
        if (drop.y > height + 30) {
          drop.y = -30;
          drop.x = Math.random() * width;
        }

        ctx.strokeStyle = drop.color;
        ctx.lineWidth = drop.thickness;
        ctx.globalAlpha = drop.opacity;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      });

      // C. Render Floating Marigold Petals
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.9;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Curled petal shape
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Petal central texture vein
        ctx.strokeStyle = 'rgba(180, 100, 10, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.8, 0);
        ctx.lineTo(p.size * 0.8, 0);
        ctx.stroke();

        ctx.restore();
      });

      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (isVisible) {
        lastFrameTime = performance.now();
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          lastFrameTime = performance.now();
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(render);
        } else if (!isVisible) {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05, rootMargin: '60px' }
    );

    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    } else {
      observer.observe(canvas);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      id="haldi-ceremony"
      className="relative w-full min-h-screen py-20 px-4 flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #fffdf0 0%, #fef9c3 25%, #fef08a 58%, #fde047 85%, #facc15 100%)'
      }}
    >
      {/* 1. Interactive Haldi Powder Clouds & Falling Marigold Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 1B. Dramatic Haldi Holi Color Splashes in the Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Left Haldi Powder Burst Splatter */}
        <div className="absolute -top-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-br from-[#fef08a]/40 via-[#fde047]/25 to-transparent blur-2xl animate-haldi-puff" />
        
        {/* Top-Right Saffron & Turmeric Splash */}
        <div className="absolute top-10 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-bl from-[#fde68a]/35 via-[#fef08a]/20 to-transparent blur-2xl animate-haldi-splash" />
        
        {/* Bottom-Center Warm Gold Haldi Holi Glow */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-gradient-to-t from-[#fef08a]/30 via-[#fef9c3]/20 to-transparent blur-3xl" />

        {/* Floating Haldi Gulal Powder Splatters (SVG shapes) */}
        <svg className="absolute top-1/4 left-6 w-28 h-28 text-amber-300/25 animate-haldi-splash hidden sm:block" viewBox="0 0 100 100" fill="currentColor">
          <path d="M48,15 Q55,2 65,18 Q75,4 72,25 Q88,28 78,42 Q92,54 75,62 Q82,78 65,74 Q58,88 45,78 Q30,90 28,72 Q12,74 20,58 Q4,48 20,38 Q10,22 30,26 Q35,8 48,15 Z" />
        </svg>

        <svg className="absolute bottom-1/4 right-8 w-32 h-32 text-yellow-400/20 animate-haldi-puff hidden sm:block" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,12 Q65,5 70,22 Q85,15 80,32 Q95,45 80,58 Q88,75 70,75 Q62,92 48,82 Q32,95 28,78 Q10,80 18,60 Q2,45 18,35 Q12,18 32,22 Q38,5 50,12 Z" />
        </svg>
      </div>

      {/* 2. Top Decorative Marigold Garland (Genda Phool Toran) */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-90 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center -mt-2 animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="w-0.5 h-6 sm:h-10 bg-amber-800/40" />
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#f39c12] via-[#f1c40f] to-[#fffa65] shadow-md border border-amber-500/30 flex items-center justify-center text-[10px]">
              🌼
            </div>
          </div>
        ))}
      </div>

      {/* 4. Main Festive Haldi Card (Luminous Golden Glass) */}
      <div className="relative z-10 max-w-lg w-full mx-auto bg-amber-50/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-[0_16px_40px_rgba(217,119,6,0.18)] border-2 border-amber-300/80 text-center transition-all duration-300">
        
        {/* Top Header Row with Ceremony Badge on Left and Gallery Icon Button on Right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-900 text-xs font-bold">
            <span>🌼</span>
            <span>{language === 'ur' ? 'ہلدی و گلاب' : language === 'hi' ? 'हल्दी उत्सव' : 'Haldi Ritual'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md border border-amber-300/70 bg-white/90 hover:bg-white text-amber-900"
            title={language === 'ur' ? 'ہلدی تصویری گیلری' : language === 'hi' ? 'हल्दी फोटो गैलरी' : 'Haldi Ceremony Photos'}
          >
            <Images className="w-3.5 h-3.5 text-amber-600" />
            <span className={language === 'hi' ? 'font-hindi' : ''}>
              {language === 'ur' ? 'گیلری' : language === 'hi' ? 'गैलरी' : 'Gallery'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
              {photosCount}
            </span>
          </button>
        </div>

        {/* Grand Title: Haldi Ceremony & Haldi Holi */}
        <h2 className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-amber-700 to-yellow-700 leading-tight mb-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] ${language === 'ur' ? 'font-urdu py-1' : language === 'hi' ? 'font-hindi font-bold' : 'font-display'}`}>
          {language === 'ur'
            ? 'ہلدی کی تقریب و ہلدی ہولی'
            : language === 'hi'
            ? 'हल्दी सेरेमनी (हल्दी होली)'
            : 'Haldi Ceremony'}
        </h2>

        {/* Subtitle / Poetic Haldi Blessing */}
        <p className={`text-xs sm:text-sm text-amber-950 font-bold max-w-md mx-auto leading-relaxed mb-2.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] ${language === 'hi' ? 'font-hindi' : ''}`}>
          {language === 'ur'
            ? 'شادی کی مسرتوں میں رنگ بھرنے کے لیے پیلی ہلدی، تازہ گیندا کے پھول اور خوشیوں بھری ہلدی ہولی کے سنگ تشریف لائیں!'
            : language === 'hi'
            ? 'शादी की खुशियों में रंग भरने के लिए पीली हल्दी, गेंदे के फूलों और हंसी-खुशी से सजी "हल्दी होली" में आप सादर आमंत्रित हैं!'
            : 'Join us for an evening drenched in joyful golden turmeric, vibrant marigold petals, music, and playful Haldi Holi celebration!'}
        </p>

        {/* Dedicated Haldi Ceremony Video Player with Upload & Persistent Playback */}
        <HaldiVideoPlayer
          language={language}
          defaultVideoUrl={videoUrl || 'https://www.youtube.com/watch?v=5CgPPDnyxyk'}
          onVideoChange={onVideoChange}
        />

        {/* Date & Time and Location Key Highlights */}
        <div className="max-w-md mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {/* 1. Date & Time */}
          <div className="p-2.5 rounded-2xl bg-white/75 backdrop-blur-xs border border-amber-200/90 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-amber-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'تاریخ و وقت' : language === 'hi' ? 'तारीख व समय' : 'Date & Time'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-amber-950 mt-0.5 truncate">
                {language === 'ur'
                  ? (dateUr || '۲۶ اکتوبر ۲۰۲۶')
                  : language === 'hi'
                  ? (dateHi || '26 अक्टूबर 2026')
                  : (dateEn || 'Oct 26, 2026')}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-amber-900 font-bold mt-0.5">
                <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                <span>
                  {language === 'ur'
                    ? (timeUr || 'شام ۶:۳۰ بجے')
                    : language === 'hi'
                    ? (timeHi || 'शाम 6:30 बजे')
                    : (timeEn || '6:30 PM')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Location (لوکیشن / स्थान) */}
          <div className="p-2.5 rounded-2xl bg-white/75 backdrop-blur-xs border border-amber-200/90 shadow-2xs flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-amber-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'مقام (Location)' : language === 'hi' ? 'स्थान (Location)' : 'Location'}
              </span>
              <p className={`text-xs sm:text-sm font-extrabold text-amber-950 mt-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? (locationUr || 'شاہی بلاسم گارڈنز (ہلدی لان)')
                  : language === 'hi'
                  ? (locationHi || 'रॉयल ब्लॉसम गार्डन्स (हल्दी लॉन)')
                  : (locationEn || 'Royal Blossom Gardens (Haldi Lawn)')}
              </p>
              <p className="text-[10px] text-amber-900/80 font-medium mt-0.5 leading-snug">
                {language === 'ur'
                  ? (addressUr || 'العویر روڈ، دبئی، متحدہ عرب امارات')
                  : language === 'hi'
                  ? (addressHi || 'अल अवीर रोड, दुबई, यूएई')
                  : (addressEn || 'Al Awir Road, Dubai, UAE')}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-950 bg-amber-300/80 hover:bg-amber-400 px-2 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs"
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>
                    {language === 'ur' ? 'گوگل میپ پر دیکھیں' : language === 'hi' ? 'गूगल मैप पर देखें' : 'View on Map'}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom organic wave transition into Mehndi section */}
      <WaveDivider position="bottom" fillColor="#f0fdf4" variant="wave3" />

      {/* Dedicated Ceremony Photo Gallery Modal */}
      <CeremonyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        ceremonyId="haldi"
        language={language}
        onPhotosUpdated={(count) => setPhotosCount(count)}
      />
    </section>
  );
};
