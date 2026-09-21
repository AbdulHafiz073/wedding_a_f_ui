import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Images } from 'lucide-react';
import { Language } from '../types';
import { BaraatVideoPlayer } from './BaraatVideoPlayer';
import { WaveDivider } from './WaveDivider';
import { CeremonyGalleryModal } from './CeremonyGalleryModal';
import { getCeremonyPhotos } from '../utils/ceremonyGalleryStorage';

interface BaraatCeremonySectionProps {
  language: Language;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  locationEn?: string;
  locationUr?: string;
  locationHi?: string;
}

export const BaraatCeremonySection: React.FC<BaraatCeremonySectionProps> = ({
  language,
  videoUrl,
  onVideoChange,
  locationEn,
  locationUr,
  locationHi
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [photosCount, setPhotosCount] = useState<number>(() => getCeremonyPhotos('baraat').length);

  // Background canvas simulation of royal stardust, festive sparks & golden embers
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

    // 1. Royal Crimson & Gold Aura Puffs
    interface RoyalCloud {
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
      'rgba(254, 205, 211, ',
      'rgba(253, 164, 175, ',
      'rgba(254, 240, 138, ',
      'rgba(255, 228, 230, ',
      'rgba(251, 191, 36, '
    ];

    const clouds: RoyalCloud[] = Array.from({ length: 12 }, () => ({
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

    // 2. Festive Shehnai & Dhol Golden Sparks
    interface GoldSpark {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      alpha: number;
      decay: number;
    }

    const sparkColors = ['#e11d48', '#d4af37', '#f59e0b', '#fbbf24', '#ffffff', '#be123c'];
    const sparks: GoldSpark[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.5 + Math.random() * 2.5,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      speedY: -0.5 - Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.8,
      alpha: 0.4 + Math.random() * 0.6,
      decay: 0.003 + Math.random() * 0.005
    }));

    // 3. Falling Red Rose Petals for Groom's Welcome
    interface WelcomePetal {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      rotation: number;
      rotSpeed: number;
      swaySpeed: number;
      swayOffset: number;
    }

    const petalColors = ['#be123c', '#9f1239', '#e11d48', '#881337', '#f43f5e'];
    const petals: WelcomePetal[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 9,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      speedY: 1.0 + Math.random() * 1.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      swaySpeed: 1 + Math.random() * 2,
      swayOffset: Math.random() * Math.PI * 2
    }));

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Render Royal Clouds
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

      // Render Rising Sparks
      sparks.forEach((s) => {
        s.y += s.speedY;
        s.x += s.speedX;
        s.alpha -= s.decay;

        if (s.alpha <= 0.1 || s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
          s.alpha = 0.5 + Math.random() * 0.5;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      });

      // Render Welcome Rose Petals
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.8;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.75;

        // Curved petal
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      id="baraat-ceremony"
      className="relative w-full min-h-screen py-20 px-4 flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #ffffff 0%, #fff5f6 40%, #ffedf0 75%, #ffe4e6 100%)'
      }}
    >
      {/* 1. Interactive Royal Baraat Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 1B. Dramatic Royal Red & Crimson Glows in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-br from-[#fda4af]/30 via-[#fecdd3]/20 to-transparent blur-2xl" />
        <div className="absolute top-1/3 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-bl from-[#fecdd3]/25 via-[#ffe4e6]/15 to-transparent blur-2xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-gradient-to-t from-[#fecdd3]/20 via-[#fff1f2]/15 to-transparent blur-3xl" />
      </div>

      {/* 2. Top Decorative Royal Gold Tassels & Bells Garland */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-90 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center -mt-2 animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="w-0.5 h-6 sm:h-10 bg-rose-900/40" />
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#fecdd3] shadow-md border border-rose-500/30 flex items-center justify-center text-[11px]">
              👑
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Royal Baraat Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto bg-white/40 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-[0_12px_32px_rgba(190,18,60,0.08)] border border-white/80 text-center transition-all duration-300">
        
        {/* Top Header Row with Ceremony Badge on Left and Gallery Icon Button on Right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/15 border border-rose-400/30 text-rose-950 text-xs font-bold">
            <span>👑</span>
            <span>{language === 'ur' ? 'آمدِ بارات' : language === 'hi' ? 'शाही बारात' : 'Royal Baraat'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md border border-rose-300/70 bg-white/90 hover:bg-white text-rose-950"
            title={language === 'ur' ? 'بارات تصویری گیلری' : language === 'hi' ? 'बारात फोटो गैलरी' : 'Baraat Ceremony Photos'}
          >
            <Images className="w-3.5 h-3.5 text-rose-600" />
            <span className={language === 'hi' ? 'font-hindi' : ''}>
              {language === 'ur' ? 'گیلری' : language === 'hi' ? 'गैलरी' : 'Gallery'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-950 text-[10px] font-extrabold">
              {photosCount}
            </span>
          </button>
        </div>

        {/* Grand Title: Royal Baraat Procession */}
        <h2 className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-950 via-rose-800 to-amber-800 leading-tight mb-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] ${language === 'ur' ? 'font-urdu py-1' : language === 'hi' ? 'font-hindi font-bold' : 'font-display'}`}>
          {language === 'ur'
            ? 'روانگی و آمدِ بارات (شاہانہ استقبال)'
            : language === 'hi'
            ? 'बारात रवानगी व आगमन (शाही स्वागत)'
            : 'Royal Baraat Procession & Welcome'}
        </h2>

        {/* Subtitle / Poetic Blessing */}
        <p className={`text-xs sm:text-sm text-rose-950 font-bold max-w-md mx-auto leading-relaxed mb-2.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] ${language === 'hi' ? 'font-hindi' : ''}`}>
          {language === 'ur'
            ? 'ڈھول کی گونج، شہنائی کی مدھر دھنوں اور شاہانہ جلوس کے ساتھ دولہا کی بارات کی پرشکوہ روانگی و آمد پر تشریف لائیں!'
            : language === 'hi'
            ? 'ढोल-नगाड़ों की गूंज, शहनाई की मधुर धुन और दूल्हे की शाही बारात की भव्य रवानगी व स्वागत में आप सादर आमंत्रित हैं!'
            : 'The grand royal procession of the groom with shehnai melodies, joyful dhol beats, and warm flower shower welcome!'}
        </p>

        {/* Dedicated Baraat Video Player with Upload & Persistent Playback */}
        <BaraatVideoPlayer
          language={language}
          defaultVideoUrl={videoUrl || 'https://www.youtube.com/watch?v=4Zj85g7rTy8'}
          onVideoChange={onVideoChange}
        />

        {/* Date & Time and Location Key Highlights */}
        <div className="max-w-md mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {/* 1. Date & Time */}
          <div className="p-2.5 rounded-2xl bg-white/25 backdrop-blur-[2px] border border-white/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-rose-950 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'تاریخ و وقت' : language === 'hi' ? 'तारीख व समय' : 'Date & Time'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-rose-950 mt-0.5 truncate">
                {language === 'ur'
                  ? '۲۸ اکتوبر ۲۰۲۶'
                  : language === 'hi'
                  ? '28 अक्टूबर 2026'
                  : 'Oct 28, 2026'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-rose-950 font-bold mt-0.5">
                <Clock className="w-3 h-3 text-rose-700 shrink-0" />
                <span>
                  {language === 'ur'
                    ? 'شام ۵:۳۰ بجے'
                    : language === 'hi'
                    ? 'शाम 5:30 बजे'
                    : '5:30 PM'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Location (لوکیشن / स्थान) */}
          <div className="p-2.5 rounded-2xl bg-white/25 backdrop-blur-[2px] border border-white/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-rose-950 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'مقام (Location)' : language === 'hi' ? 'स्थान (Location)' : 'Location'}
              </span>
              <p className={`text-xs sm:text-sm font-extrabold text-rose-950 mt-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? (locationUr || 'برج العرب گرینڈ گیٹ، دبئی')
                  : language === 'hi'
                  ? (locationHi || 'बुर्ज अल अरब ग्रैंड गेट, दुबई')
                  : (locationEn || 'Burj Al Arab Grand Entrance, Dubai')}
              </p>
              <span className="inline-block text-[10px] text-rose-800 font-semibold mt-0.5">
                📍 {language === 'ur' ? 'دبئی، متحدہ عرب امارات' : language === 'hi' ? 'दुबई, यूएई' : 'Dubai, UAE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom organic wave transition into Nikah section */}
      <WaveDivider position="bottom" fillColor="#f7fdf9" variant="wave2" />

      {/* Dedicated Ceremony Photo Gallery Modal */}
      <CeremonyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        ceremonyId="baraat"
        language={language}
        onPhotosUpdated={(count) => setPhotosCount(count)}
      />
    </section>
  );
};
