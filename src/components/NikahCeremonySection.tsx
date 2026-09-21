import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Images } from 'lucide-react';
import { Language } from '../types';
import { NikahVideoPlayer } from './NikahVideoPlayer';
import { WaveDivider } from './WaveDivider';
import { CeremonyGalleryModal } from './CeremonyGalleryModal';
import { getCeremonyPhotos } from '../utils/ceremonyGalleryStorage';

interface NikahCeremonySectionProps {
  language: Language;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  locationEn?: string;
  locationUr?: string;
  locationHi?: string;
}

export const NikahCeremonySection: React.FC<NikahCeremonySectionProps> = ({
  language,
  videoUrl,
  onVideoChange,
  locationEn,
  locationUr,
  locationHi
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [photosCount, setPhotosCount] = useState<number>(() => getCeremonyPhotos('nikah').length);

  // Continuous background canvas simulation of Noor rain & falling white jasmine/rose petals
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

    // 1. Noor Cloud Puffs
    interface NoorCloud {
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

    const noorColors = [
      'rgba(209, 250, 229, ',
      'rgba(167, 243, 208, ',
      'rgba(254, 243, 199, ',
      'rgba(236, 253, 245, ',
      'rgba(255, 255, 255, '
    ];

    const clouds: NoorCloud[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 140,
      color: noorColors[Math.floor(Math.random() * noorColors.length)],
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: -0.2 - Math.random() * 0.5,
      opacity: Math.random() * 0.35,
      maxOpacity: 0.3 + Math.random() * 0.3,
      growing: Math.random() > 0.5
    }));

    // 2. Swirling White Rose & Jasmine Petals
    interface WhitePetal {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      swaySpeed: number;
      swayOffset: number;
      rotation: number;
      rotSpeed: number;
    }

    const petalColors = [
      'rgba(255, 255, 255, 0.9)',
      'rgba(254, 249, 195, 0.85)',
      'rgba(240, 253, 244, 0.9)',
      'rgba(255, 241, 242, 0.85)',
      'rgba(255, 255, 255, 0.95)'
    ];

    const petals: WhitePetal[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 8,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      speedY: 0.8 + Math.random() * 1.5,
      swaySpeed: 0.015 + Math.random() * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04
    }));

    // 3. Golden Noor Rain Streaks
    interface NoorRainDrop {
      x: number;
      y: number;
      length: number;
      speedY: number;
      opacity: number;
      thickness: number;
      color: string;
    }

    const rainColors = ['#10b981', '#34d399', '#6ee7b7', '#d4af37', '#fde047', '#ffffff'];
    const rainDrops: NoorRainDrop[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 15 + Math.random() * 28,
      speedY: 4.0 + Math.random() * 5.0,
      opacity: 0.45 + Math.random() * 0.45,
      thickness: 1.4 + Math.random() * 1.6,
      color: rainColors[Math.floor(Math.random() * rainColors.length)]
    }));

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // A. Render Soft Noor Clouds
      clouds.forEach((cloud) => {
        cloud.x += cloud.speedX;
        cloud.y += cloud.speedY;

        if (cloud.growing) {
          cloud.opacity += 0.003;
          if (cloud.opacity >= cloud.maxOpacity) cloud.growing = false;
        } else {
          cloud.opacity -= 0.003;
          if (cloud.opacity <= 0.04) cloud.growing = true;
        }

        if (cloud.y + cloud.radius < 0) {
          cloud.y = height + cloud.radius;
          cloud.x = Math.random() * width;
        }
        if (cloud.x - cloud.radius > width) cloud.x = -cloud.radius;
        if (cloud.x + cloud.radius < 0) cloud.x = width + cloud.radius;

        const grad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        grad.addColorStop(0, `${cloud.color}${cloud.opacity})`);
        grad.addColorStop(0.5, `${cloud.color}${cloud.opacity * 0.5})`);
        grad.addColorStop(1, `${cloud.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Render Golden Noor Rain Drops
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

      // C. Render Floating White Jasmine / Rose Petals
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
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.8, 0);
        ctx.lineTo(p.size * 0.8, 0);
        ctx.stroke();

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
      id="nikah-ceremony"
      className="relative w-full min-h-screen py-20 px-4 flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f7fdf9 40%, #ecfdf5 75%, #d1fae5 100%)'
      }}
    >
      {/* 1. Interactive Noor Clouds & Falling Jasmine Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 2. Top Islamic Festive Fairy Lights String */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-75">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse"
            style={{
              animationDelay: `${(i % 5) * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* 3. Floating Hanging Lanterns */}
      <div className="absolute top-0 left-6 sm:left-12 pointer-events-none z-10 hidden sm:block">
        <div className="w-[1.5px] h-20 bg-gradient-to-b from-emerald-600/60 to-emerald-400 mx-auto" />
        <div className="w-8 h-10 rounded-b-xl border border-emerald-500/70 bg-white/40 backdrop-blur-xs flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.4)]">
          <span className="text-sm animate-pulse">🏮</span>
        </div>
      </div>
      <div className="absolute top-0 right-6 sm:right-12 pointer-events-none z-10 hidden sm:block">
        <div className="w-[1.5px] h-24 bg-gradient-to-b from-emerald-600/60 to-emerald-400 mx-auto" />
        <div className="w-8 h-10 rounded-b-xl border border-emerald-500/70 bg-white/40 backdrop-blur-xs flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.4)]">
          <span className="text-sm animate-pulse">🏮</span>
        </div>
      </div>

      {/* Background Floating Decorative Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white/80 backdrop-blur-xs shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"
            style={{
              top: `${(idx * 8.5) % 95}%`,
              left: `${(idx * 17) % 94}%`,
              width: `${10 + (idx % 4) * 4}px`,
              height: `${7 + (idx % 3) * 3}px`,
              opacity: 0.35 + (idx % 5) * 0.12,
              animationDuration: `${2.5 + (idx % 4)}s`
            }}
          />
        ))}
      </div>

      {/* 4. Main Festive Nikah Card (Crystal Glass) */}
      <div className="relative z-10 max-w-lg w-full mx-auto bg-white/40 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-[0_12px_32px_rgba(16,185,129,0.08)] border border-white/80 text-center transition-all duration-300">
        
        {/* Top Header Row with Ceremony Badge on Left and Gallery Icon Button on Right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/15 border border-teal-400/30 text-teal-950 text-xs font-bold">
            <span>💍</span>
            <span>{language === 'ur' ? 'بابرکت نکاح' : language === 'hi' ? 'मुबारक निकाह' : 'Sacred Nikaah'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md border border-teal-300/70 bg-white/90 hover:bg-white text-teal-950"
            title={language === 'ur' ? 'نکاح تصویری گیلری' : language === 'hi' ? 'निकाह फोटो गैलरी' : 'Nikaah Ceremony Photos'}
          >
            <Images className="w-3.5 h-3.5 text-teal-600" />
            <span className={language === 'hi' ? 'font-hindi' : ''}>
              {language === 'ur' ? 'گیلری' : language === 'hi' ? 'गैलरी' : 'Gallery'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-950 text-[10px] font-extrabold">
              {photosCount}
            </span>
          </button>
        </div>

        {/* Grand Title: Nikaah Ceremony */}
        <h2 className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-800 leading-tight mb-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] ${language === 'ur' ? 'font-urdu py-1' : language === 'hi' ? 'font-hindi font-bold' : 'font-display'}`}>
          {language === 'ur'
            ? 'تقریبِ بابرکت نکاح'
            : language === 'hi'
            ? 'मुबारक निकाह समारोह'
            : 'Sacred Nikaah Ceremony'}
        </h2>

        {/* Subtitle / Poetic Nikah Blessing */}
        <p className={`text-xs sm:text-sm text-emerald-950 font-bold max-w-md mx-auto leading-relaxed mb-2.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] ${language === 'hi' ? 'font-hindi' : ''}`}>
          {language === 'ur'
            ? 'دو روحوں کا ایک پاکیزہ رشتہ، محبت اور رحمت کی دعاؤں کے سنگ تشریف لائیں!'
            : language === 'hi'
            ? 'दो रूहों का एक पाकीज़ा रिश्ता, मोहब्बत और रहमत की दुआओं के संग तशरीफ़ लाएं!'
            : "A sacred union of two souls bound in love, faith, and eternal blessings under Allah's grace."}
        </p>

        {/* Dedicated Nikah Video Player (Frosted Glass Box with Low Opacity) */}
        <NikahVideoPlayer
          language={language}
          defaultVideoUrl={videoUrl || 'https://www.youtube.com/watch?v=MINL6ki1lWU'}
          onVideoChange={onVideoChange}
        />

        {/* Date & Time and Location Key Highlights */}
        <div className="max-w-md mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {/* 1. Date & Time */}
          <div className="p-2.5 rounded-2xl bg-white/25 backdrop-blur-[2px] border border-white/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'تاریخ و وقت' : language === 'hi' ? 'तारीख व समय' : 'Date & Time'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5 truncate">
                {language === 'ur'
                  ? '۲۸ اکتوبر ۲۰۲۶ (بدھ)'
                  : language === 'hi'
                  ? '28 अक्टूबर 2026 (बुधवार)'
                  : 'Oct 28, 2026 (Wed)'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-900 font-bold mt-0.5">
                <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>
                  {language === 'ur'
                    ? 'شام ۶:۰۰ بجے'
                    : language === 'hi'
                    ? 'शाम 6:00 बजे'
                    : '6:00 PM'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Location (لوکیشن / स्थान) */}
          <div className="p-2.5 rounded-2xl bg-white/25 backdrop-blur-[2px] border border-white/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-900 block ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur' ? 'مقام (Location)' : language === 'hi' ? 'स्थान (Location)' : 'Location'}
              </span>
              <p className={`text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? (locationUr || 'برج العرب گرینڈ بال روم، دبئی')
                  : language === 'hi'
                  ? (locationHi || 'बुर्ज अल अरब ग्रैंड बॉलरूम, दुबई')
                  : (locationEn || 'Burj Al Arab Grand Ballroom, Dubai')}
              </p>
              <span className="inline-block text-[10px] text-emerald-800 font-semibold mt-0.5">
                📍 {language === 'ur' ? 'دبئی، متحدہ عرب امارات' : language === 'hi' ? 'दुबई, यूएई' : 'Dubai, UAE'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom organic wave transition into Rukhsati section */}
      <WaveDivider position="bottom" fillColor="#fdf4f8" variant="wave3" />

      {/* Dedicated Ceremony Photo Gallery Modal */}
      <CeremonyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        ceremonyId="nikah"
        language={language}
        onPhotosUpdated={(count) => setPhotosCount(count)}
      />
    </section>
  );
};
