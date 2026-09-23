import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Calendar, Heart, MapPin, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, WeddingData } from '../types';

interface ScratchRevealCardProps {
  language: Language;
  data: WeddingData;
  groomName: string;
  brideName: string;
  weddingDateStr: string;
}

export const ScratchRevealCard: React.FC<ScratchRevealCardProps> = ({
  language,
  data,
  groomName,
  brideName,
  weddingDateStr,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  // Play soft celebratory chime using Web Audio API
  const playChimeSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Pentatonic sweet notes: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Trigger grand celebratory confetti
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 55,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#d4af37', '#f59e0b', '#fbbf24', '#f43f5e', '#ffffff', '#e0e7ff'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }
  }, []);

  // Draw royal circular gold scratch foil onto canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;

    // Reset composite operation to draw fresh circular foil
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    // 1. Clip path strictly to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // 2. Rich radial golden gradient foil
    const radGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, r);
    radGrad.addColorStop(0, '#fffbeb'); // luminous highlight center
    radGrad.addColorStop(0.2, '#fde047'); // yellow-300
    radGrad.addColorStop(0.45, '#eab308'); // yellow-500
    radGrad.addColorStop(0.75, '#ca8a04'); // yellow-600
    radGrad.addColorStop(0.92, '#a16207'); // yellow-700
    radGrad.addColorStop(1, '#713f12'); // deep royal rim
    ctx.fillStyle = radGrad;
    ctx.fill();

    // 3. Stamped concentric rings like a minted royal medallion
    const rings = [r - 6, r - 14, r - 26, r - 38, 70, 52];
    rings.forEach((ringR, idx) => {
      if (ringR <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.65)' : 'rgba(113, 63, 18, 0.4)';
      ctx.lineWidth = idx === 0 ? 2.5 : 1.2;
      ctx.stroke();
    });

    // 4. Islamic 8-Pointed Stars (Rub el Hizb) & Pearls along the perimeter
    const numDots = 24;
    const dotRadius = r - 20;
    for (let i = 0; i < numDots; i++) {
      const angle = (i * 2 * Math.PI) / numDots;
      const dx = cx + Math.cos(angle) * dotRadius;
      const dy = cy + Math.sin(angle) * dotRadius;
      if (i % 2 === 0) {
        // Islamic 8-pointed star (two intersecting squares rotated 45 deg)
        ctx.save();
        ctx.translate(dx, dy);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.restore();
      } else {
        // Luminous pearl dot
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.fill();
      }
    }

    // Top Islamic Bismillah arc inscription on the golden foil
    ctx.font = 'bold 12px "Amiri", "Scheherazade New", serif, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', cx, cy - r + 46);

    // 5. Center Islamic Crescent Moon & Star Medallion
    // Decorative 16-petal scalloped rosette around center circle
    const numRosettePetals = 16;
    const rosetteR = 64;
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < numRosettePetals; i++) {
      const angle = (i * 2 * Math.PI) / numRosettePetals;
      const px = cx + Math.cos(angle) * rosetteR;
      const py = cy + Math.sin(angle) * rosetteR;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.fill();
      ctx.stroke();
    }

    // Center deep royal medallion disc
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88, 28, 13, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Inner fine gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 6. Draw Crisp Vector Islamic Crescent Moon & 5-Pointed Star (Hilal & Star)
    ctx.save();
    ctx.translate(cx, cy - 23);
    ctx.scale(1.25, 1.25);
    ctx.translate(-12, -12);

    // Glowing golden Crescent Moon
    ctx.shadowColor = 'rgba(254, 240, 138, 0.95)';
    ctx.shadowBlur = 10;
    const moonGrad = ctx.createLinearGradient(4, 2, 20, 22);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.35, '#fef08a');
    moonGrad.addColorStop(0.7, '#facc15');
    moonGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = moonGrad;

    const crescent = new Path2D(
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.31 0 4.43-.79 6.13-2.11C12.39 19.34 8 14.7 8 9.5c0-2.88 1.34-5.45 3.44-7.14C11.13 2.13 11.56 2 12 2z'
    );
    ctx.fill(crescent);

    // Shining Five-pointed Star inside the crescent
    const star = new Path2D(
      'M19 2.5l1.2 2.8 3 .4-2.3 2.1.6 3.1-2.5-1.5-2.5 1.5.6-3.1-2.3-2.1 3-.4z'
    );
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fill(star);
    ctx.restore();

    // Center Islamic Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bismillah label
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('بِسْمِ اللَّهِ', cx, cy - 2);

    // English text
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCRATCH HERE', cx, cy + 12);

    // Urdu text
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('یہاں کھرچیں • بابرکت نکاح', cx, cy + 28);

    // Bottom subtle hint arc text / label inside circle
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#fef3c7';
    const hint =
      language === 'ur'
        ? '✦ چاند ستارہ کھرچ کر دعوت نامہ کھولیں ✦'
        : language === 'hi'
        ? '✦ चाँद-सितारा खुरचें और निमंत्रण देखें ✦'
        : '✦ Scratch Crescent & Star to Reveal Invitation ✦';
    ctx.fillText(hint, cx, cy + 95);

    ctx.restore();

    setIsRevealed(false);
    setScratchProgress(0);
    setHasPlayedChime(false);
  }, [language]);

  // Set up canvas on mount and window resize
  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isRevealed) {
        initCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, isRevealed]);

  // Calculate scratched area percentage within the circle
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      const cx = w / 2;
      const cy = h / 2;
      const r = (Math.min(w, h) / 2) * 0.95; // sample within inner 95% of circle
      const rSq = r * r;

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const step = 14; // sample step

      let transparentPixels = 0;
      let totalCircleSamples = 0;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy <= rSq) {
            totalCircleSamples++;
            const idx = (y * w + x) * 4 + 3; // alpha channel
            if (data[idx] < 128) {
              transparentPixels++;
            }
          }
        }
      }

      if (totalCircleSamples > 0) {
        const percent = Math.min(100, Math.round((transparentPixels / totalCircleSamples) * 100));
        setScratchProgress(percent);

        // Once user scratches > 38%, fully reveal with celebration!
        if (percent >= 38 && !isRevealed) {
          setIsRevealed(true);
          triggerCelebration();
          if (!hasPlayedChime) {
            playChimeSound();
            setHasPlayedChime(true);
          }
        }
      }
    } catch {
      // Safe fallback if canvas read error
    }
  }, [isRevealed, hasPlayedChime, playChimeSound, triggerCelebration]);

  // Scratch action at (clientX, clientY)
  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || isRevealed) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setCursorPos({ x, y });

      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      // Scratch brush radius ~30px
      ctx.arc(x * dpr, y * dpr, 32 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Feathered soft edge
      ctx.beginPath();
      ctx.arc(x * dpr, y * dpr, 42 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
      ctx.restore();

      checkScratchPercentage();
    },
    [isRevealed, checkScratchPercentage]
  );

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isScratching) {
      scratchAt(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      setIsScratching(true);
      const touch = e.touches[0];
      scratchAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      scratchAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
    setCursorPos(null);
  };

  // Instant full reveal handler
  const handleInstantReveal = () => {
    setIsRevealed(true);
    setScratchProgress(100);
    triggerCelebration();
    playChimeSound();
  };

  // Reset / Re-scratch handler
  const handleReset = () => {
    setIsRevealed(false);
    setScratchProgress(0);
    setHasPlayedChime(false);
    setTimeout(() => {
      initCanvas();
    }, 50);
  };

  const venueDisplayName =
    language === 'ur'
      ? data.venueNameUr
      : language === 'hi'
      ? data.venueNameHi || data.venueNameEn
      : data.venueNameEn;

  const venueCityDisplayName =
    language === 'ur'
      ? data.venueCityUr
      : language === 'hi'
      ? data.venueCityHi || data.venueCityEn
      : data.venueCityEn;

  const weddingTimeDisplayName =
    language === 'ur'
      ? data.weddingTimeUr || 'بدھ • شام ۶:۰۰ بجے'
      : language === 'hi'
      ? data.weddingTimeHi || 'बुधवार • शाम 6:00 बजे'
      : data.weddingTimeEn || 'Wednesday • 6:00 PM';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-[#d4af37]/40 shadow-xs mb-2">
          <span className="text-sm">🌙</span>
          <span
            className={`text-xs sm:text-sm font-bold text-[#b89125] uppercase tracking-wider ${
              language === 'ur' ? 'font-urdu' : language === 'hi' ? 'font-hindi' : 'font-display'
            }`}
          >
            {language === 'ur'
              ? 'بابرکت اسلامی نکاح سکریچ کارڈ'
              : language === 'hi'
              ? 'मुबारक निकाह स्क्रैच कार्ड'
              : 'Blessed Islamic Nikah Scratch Card'}
          </span>
          <span className="text-sm">✨</span>
        </div>

        <h3
          className={`text-2xl sm:text-3xl font-extrabold text-[#1a3a4d] ${
            language === 'ur' ? 'font-urdu leading-loose' : language === 'hi' ? 'font-hindi' : 'font-display'
          }`}
        >
          {language === 'ur'
            ? 'بابرکت چاند ستارہ کھرچ کر دعوت نامہ کھولیں'
            : language === 'hi'
            ? 'मुबारक चाँद-सितारा खुरचें और निमंत्रण पत्र देखें'
            : 'Scratch the Blessed Crescent & Star to Reveal Invitation'}
        </h3>

        <p
          className={`text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1 ${
            language === 'hi' ? 'font-hindi' : ''
          }`}
        >
          {language === 'ur'
            ? 'انگلی یا چاند ستارے سے گولڈن دائرے کو کھرچیں اور نکاح کی بابرکت تاریخ و خصوصی دعوت نامہ حاصل کریں!'
            : language === 'hi'
            ? 'उंगली या चाँद-सितारे से गोल्डन घेरे को खुरचें और पवित्र निकाह का निमंत्रण देखें!'
            : 'Scratch inside the golden circle with your finger or crescent coin to reveal the blessed wedding invitation!'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* CIRCULAR SCRATCH INVITATION CARD (ROUND MEDALLION) */}
      {/* ========================================================================= */}
      <div className="relative mx-auto flex items-center justify-center py-2">
        {/* Outer Glowing Decorative Ring */}
        <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[410px] md:h-[410px] rounded-full p-2.5 sm:p-3 bg-gradient-to-tr from-[#92600b] via-[#f7d070] to-[#b8860b] shadow-[0_15px_45px_rgba(212,175,55,0.3)]">
          {/* Inner Golden Rim Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 sm:border-3 border-amber-200/90 shadow-inner bg-gradient-to-b from-[#fffefc] via-[#fdfaf3] to-[#fbf5e6] select-none">
            {/* ========================================================================= */}
            {/* UNDERNEATH LAYER: THE GUEST INVITATION & WEDDING DATE */}
            {/* ========================================================================= */}
            <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center px-6 sm:px-8 py-3 relative bg-gradient-to-b from-[#fffdfa] via-[#fcf8f0] to-[#fbf2e3]">
              {/* Islamic delicate circular borders */}
              <div className="absolute inset-0 rounded-full border border-amber-400/40 m-2.5 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 m-4 pointer-events-none" />

              {/* 1. Islamic Crescent & Star Emblem with Bismillah */}
              <div className="flex flex-col items-center justify-center mb-0.5">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="text-base select-none">🌙</span>
                  <span className="text-[10px] text-amber-500">✦</span>
                  <span className="text-base select-none">⭐</span>
                </div>
                <p className="font-arabic text-xs sm:text-sm font-bold text-amber-900 leading-tight mt-0.5 drop-shadow-xs">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>

              {/* 2. Sacred Sunnah Blessing & Invitation Tag */}
              <div className="mb-0.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#996515] flex items-center justify-center gap-1">
                  <span>✦</span>
                  <span>
                    {language === 'ur'
                      ? 'عقدِ مسنون • آپ صمیمِ قلب سے مدعو ہیں'
                      : language === 'hi'
                      ? 'सुन्नत निकाह • आप सादर आमंत्रित हैं'
                      : "SACRED NIKAH • YOU'RE CORDIALLY INVITED"}
                  </span>
                  <span>✦</span>
                </span>
              </div>

              {/* 3. Couple Names */}
              <h4 className="text-lg sm:text-2xl font-extrabold text-[#1a3a4d] tracking-wide font-display leading-tight mb-0.5">
                {groomName} <span className="text-[#d4af37]">&amp;</span> {brideName}
              </h4>

              {/* 4. Auspicious Nikah Muhurat & Date Badge */}
              <div className="my-1 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300/80 shadow-xs flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-[#1a3a4d] font-display">
                  {weddingDateStr}
                </span>
              </div>

              {/* 5. Wedding Time */}
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 mb-0.5">
                {weddingTimeDisplayName}
              </p>

              {/* 6. Sacred Nikah Du'a */}
              <p className="font-arabic text-[10px] sm:text-xs text-emerald-800 font-semibold leading-tight max-w-[260px] mx-auto mb-1">
                بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
              </p>

              {/* 7. Venue & Seal */}
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-gray-600 mb-1">
                <MapPin className="w-2.5 h-2.5 text-[#2c5f7c] shrink-0" />
                <span className="font-semibold truncate max-w-[210px] sm:max-w-[250px]">
                  {venueDisplayName} • {venueCityDisplayName}
                </span>
              </div>

              {/* 8. Verified Unlocked Badge */}
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>
                  {language === 'ur'
                    ? '🌙 مبارک دعوت نامہ تصدیق شدہ'
                    : language === 'hi'
                    ? '🌙 पवित्र निमंत्रण अनलॉक'
                    : '🌙 Sacred Invitation Unlocked'}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CIRCULAR CANVAS FOIL LAYER (SCRATCHABLE) */}
            {/* ========================================================================= */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                  setIsHovering(false);
                  setIsScratching(false);
                  setCursorPos(null);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none z-20 rounded-full transition-opacity duration-300"
                style={{
                  touchAction: 'none',
                }}
              />
            )}

            {/* Islamic Crescent Moon & Star Interactive Scratch Cursor */}
            {!isRevealed && cursorPos && isHovering && (
              <div
                className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                style={{
                  left: `${cursorPos.x}px`,
                  top: `${cursorPos.y}px`,
                }}
              >
                {/* Shiny 3D Golden Islamic Crescent & Star Badge */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-800 via-amber-400 to-yellow-200 border-2 border-amber-100 shadow-[0_0_20px_rgba(234,179,8,0.85)] flex items-center justify-center animate-pulse">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-950 drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.31 0 4.43-.79 6.13-2.11C12.39 19.34 8 14.7 8 9.5c0-2.88 1.34-5.45 3.44-7.14C11.13 2.13 11.56 2 12 2z" />
                      <polygon points="19,3 20.2,6.5 24,6.8 21,9.2 22,13 18.8,10.8 15.6,13 16.6,9.2 13.6,6.8 17.4,6.5" fill="#ffffff" />
                    </svg>
                  </div>
                  {/* Specular shine glint */}
                  <div className="absolute top-1 left-2 w-3 h-1.5 rounded-full bg-white/90 transform -rotate-45" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scratch Progress & Controls Bar */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 max-w-md mx-auto">
        {/* Progress Meter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            {language === 'ur' ? 'سکریچ کی پیش رفت:' : language === 'hi' ? 'खुरचने की प्रगति:' : 'Scratch Progress:'}
          </span>
          <div className="w-28 sm:w-32 h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${scratchProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-800 min-w-[2.2rem]">
            {scratchProgress}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {!isRevealed ? (
            <button
              type="button"
              onClick={handleInstantReveal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89125] hover:from-[#e5c158] hover:to-[#cfa735] text-[#0f172a] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'ur'
                  ? 'فوری کھولیں (Reveal All)'
                  : language === 'hi'
                  ? 'तुरंत खोलें (Instant Reveal)'
                  : 'Instant Reveal'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'ur'
                  ? 'دوبارہ کھرچیں (Scratch Again)'
                  : language === 'hi'
                  ? 'पुनः खुरचें (Scratch Again)'
                  : 'Scratch Again'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
