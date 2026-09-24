import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Images, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { MehndiVideoPlayer } from './MehndiVideoPlayer';
import { WaveDivider } from './WaveDivider';
import { CeremonyGalleryModal } from './CeremonyGalleryModal';
import { getCeremonyPhotos } from '../utils/ceremonyGalleryStorage';

interface MehndiCeremonySectionProps {
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

export const MehndiCeremonySection: React.FC<MehndiCeremonySectionProps> = ({
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
  const [photosCount, setPhotosCount] = useState<number>(() => getCeremonyPhotos('mehndi').length);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.ceremonyId === 'mehndi' && typeof e.detail?.count === 'number') {
        setPhotosCount(e.detail.count);
      }
    };
    window.addEventListener('ceremonyPhotosUpdated', handleUpdate);
    return () => window.removeEventListener('ceremonyPhotosUpdated', handleUpdate);
  }, []);

  // Background canvas simulation of gentle swirling henna leaves, golden pollen & soft green aura
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

    // 1. Soft Henna Mist Clouds
    interface HennaCloud {
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

    const cloudColors = [
      'rgba(167, 243, 208, ',
      'rgba(110, 231, 183, ',
      'rgba(209, 250, 229, ',
      'rgba(253, 230, 138, ',
      'rgba(187, 247, 208, '
    ];

    const clouds: HennaCloud[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 130,
      color: cloudColors[Math.floor(Math.random() * cloudColors.length)],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -0.2 - Math.random() * 0.4,
      opacity: Math.random() * 0.3,
      maxOpacity: 0.25 + Math.random() * 0.25,
      growing: Math.random() > 0.5
    }));

    // 2. Swirling Henna Leaves (Patte) & Green-Gold Sparkles
    interface HennaLeaf {
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
    const leafColors = ['#059669', '#10b981', '#34d399', '#047857', '#d97706', '#f59e0b'];
    const leaves: HennaLeaf[] = Array.from({ length: isMobile ? 16 : 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 10,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      speedY: 0.9 + Math.random() * 1.5,
      speedX: (Math.random() - 0.5) * 0.7,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      swaySpeed: 1 + Math.random() * 2,
      swayOffset: Math.random() * Math.PI * 2
    }));

    // 3. Golden Henna Shimmer Streaks
    interface ShimmerPollen {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedY: number;
      color: string;
    }

    const pollenColors = ['#10b981', '#fbbf24', '#fde68a', '#34d399', '#ffffff'];
    const pollens: ShimmerPollen[] = Array.from({ length: isMobile ? 18 : 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      speedY: 0.4 + Math.random() * 0.8,
      color: pollenColors[Math.floor(Math.random() * pollenColors.length)]
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

      // Render Henna Mist Clouds
      clouds.forEach((c) => {
        c.x += c.speedX;
        c.y += c.speedY;

        if (c.growing) {
          c.opacity += 0.002;
          if (c.opacity >= c.maxOpacity) c.growing = false;
        } else {
          c.opacity -= 0.002;
          if (c.opacity <= 0.05) c.growing = true;
        }

        if (c.y < -c.radius) c.y = height + c.radius;
        if (c.x < -c.radius) c.x = width + c.radius;
        if (c.x > width + c.radius) c.x = -c.radius;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        grad.addColorStop(0, `${c.color}${c.opacity})`);
        grad.addColorStop(0.6, `${c.color}${c.opacity * 0.4})`);
        grad.addColorStop(1, `${c.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Pollen Sparks
      pollens.forEach((p) => {
        p.y += p.speedY;
        if (p.y > height) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Falling Henna Leaves
      leaves.forEach((l) => {
        l.y += l.speedY;
        l.x += Math.sin(time * l.swaySpeed + l.swayOffset) * 0.9;
        l.rotation += l.rotSpeed;

        if (l.y > height + 20) {
          l.y = -20;
          l.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.fillStyle = l.color;
        ctx.globalAlpha = 0.75;

        // Leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -l.size);
        ctx.quadraticCurveTo(l.size * 0.7, 0, 0, l.size);
        ctx.quadraticCurveTo(-l.size * 0.7, 0, 0, -l.size);
        ctx.fill();

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
      id="mehndi-ceremony"
      className="relative w-full min-h-screen py-20 px-4 flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 58%, #86efac 85%, #4ade80 100%)'
      }}
    >
      {/* 1. Interactive Henna Mist & Leaves Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 1B. Dramatic Mehndi Splatters in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -right-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-bl from-[#a7f3d0]/35 via-[#d1fae5]/25 to-transparent blur-2xl" />
        <div className="absolute top-1/3 -left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-[#6ee7b7]/25 via-[#a7f3d0]/20 to-transparent blur-2xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-gradient-to-t from-[#a7f3d0]/25 via-[#d1fae5]/20 to-transparent blur-3xl" />
      </div>

      {/* 2. Top Decorative Mango Leaves & Henna Garland (Aam Ke Patte Toran) */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-90 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center -mt-2 animate-pulse" style={{ animationDelay: `${i * 130}ms` }}>
            <div className="w-0.5 h-6 sm:h-10 bg-emerald-800/40" />
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#059669] via-[#10b981] to-[#a7f3d0] shadow-md border border-emerald-500/30 flex items-center justify-center text-[11px]">
              🍃
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Festive Mehndi Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto bg-emerald-50/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-[0_16px_40px_rgba(5,150,105,0.18)] border-2 border-emerald-300/80 text-center transition-all duration-300">
        
        {/* Top Header Row with Ceremony Badge on Left and Gallery Icon Button on Right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-400/50 text-emerald-950 text-xs font-bold">
            <span>🍃</span>
            <span>{language === 'ur' ? 'جشنِ حنا' : language === 'hi' ? 'मेहंदी उत्सव' : 'Jashn-e-Hina'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md border border-emerald-300 bg-white/95 hover:bg-white text-emerald-950"
            title={language === 'ur' ? 'مہندی تصویری گیلری' : language === 'hi' ? 'मेहंदी फोटो गैलरी' : 'Mehndi Ceremony Photos'}
          >
            <Images className="w-3.5 h-3.5 text-emerald-600" />
            <span className={language === 'hi' ? 'font-hindi' : ''}>
              {language === 'ur' ? 'گیلری' : language === 'hi' ? 'गैलरी' : 'Gallery'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">
              {photosCount}
            </span>
          </button>
        </div>

        {/* Grand Title: Mehndi Ceremony (Jashn-e-Hina) */}
        <h2 className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 leading-tight mb-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] ${language === 'ur' ? 'font-urdu py-1' : language === 'hi' ? 'font-hindi font-bold' : 'font-display'}`}>
          {language === 'ur'
            ? 'مہندی کی تقریب (جشنِ حنا)'
            : language === 'hi'
            ? 'मेहंदी सेरेमनी (जश्न-ए-हिना)'
            : 'Mehndi Ceremony (Jashn-e-Hina)'}
        </h2>

        {/* Subtitle / Poetic Henna Blessing */}
        <p className={`text-xs sm:text-sm text-emerald-950 font-bold max-w-md mx-auto leading-relaxed mb-2.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] ${language === 'hi' ? 'font-hindi' : ''}`}>
          {language === 'ur'
            ? 'حنائی خوشبوؤں، سرور بھرے نغموں، ڈھولک کی تھاپ اور محبت کے گہرے رنگوں میں سجتی ایک یادگار شام!'
            : language === 'hi'
            ? 'हाथों में रचती हिना की खुशबू, ढोलक की मधुर थाप और सुहाने गीतों के संग एक यादगार शाम में आप सादर आमंत्रित हैं!'
            : 'An enchanting evening of intricate henna patterns, folk songs, dholak rhythms, and joyful family celebration!'}
        </p>

        {/* Dedicated Mehndi Ceremony Video Player with Upload & Persistent Playback */}
        <MehndiVideoPlayer
          language={language}
          defaultVideoUrl={videoUrl || 'https://www.youtube.com/watch?v=hqros5XFBYA'}
          onVideoChange={onVideoChange}
        />

        {/* Date & Time and Location Key Highlights */}
        <div className="max-w-md mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {/* 1. Date & Time */}
          <div className="p-2.5 rounded-2xl bg-white/75 backdrop-blur-xs border border-emerald-200/90 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'تاریخ و وقت' : language === 'hi' ? 'तारीख व समय' : 'Date & Time'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5 truncate">
                {language === 'ur'
                  ? (dateUr || '۲۷ اکتوبر ۲۰۲۶')
                  : language === 'hi'
                  ? (dateHi || '27 अक्टूबर 2026')
                  : (dateEn || 'Oct 27, 2026')}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-900 font-bold mt-0.5">
                <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>
                  {language === 'ur'
                    ? (timeUr || 'شام ۷:۰۰ بجے')
                    : language === 'hi'
                    ? (timeHi || 'शाम 7:00 बजे')
                    : (timeEn || '7:00 PM')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Location (لوکیشن / स्थान) */}
          <div className="p-2.5 rounded-2xl bg-white/75 backdrop-blur-xs border border-emerald-200/90 shadow-2xs flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'مقام (Location)' : language === 'hi' ? 'स्थान (Location)' : 'Location'}
              </span>
              <p className={`text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? (locationUr || 'دی پام گارڈن اینڈ کورٹ یارڈ')
                  : language === 'hi'
                  ? (locationHi || 'द पाम गार्डन एंड कोर्टयार्ड')
                  : (locationEn || 'The Palm Garden & Courtyard')}
              </p>
              <p className="text-[10px] text-emerald-900/80 font-medium mt-0.5 leading-snug">
                {language === 'ur'
                  ? (addressUr || 'جمیرہ بیچ روڈ، دبئی، متحدہ عرب امارات')
                  : language === 'hi'
                  ? (addressHi || 'जुमेराह बीच रोड, दुबई, यूएई')
                  : (addressEn || 'Jumeirah Beach Road, Dubai, UAE')}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-950 bg-emerald-200/90 hover:bg-emerald-300 px-2 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs"
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

      {/* Bottom organic wave transition into Baraat section */}
      <WaveDivider position="bottom" fillColor="#fff1f2" variant="wave1" />

      {/* Dedicated Ceremony Photo Gallery Modal */}
      <CeremonyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        ceremonyId="mehndi"
        language={language}
        onPhotosUpdated={(count) => setPhotosCount(count)}
      />
    </section>
  );
};
