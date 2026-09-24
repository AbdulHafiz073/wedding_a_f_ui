import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Moon, Stars, Volume2, VolumeX, RotateCcw, Images, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';
import { RukhsatiVideoPlayer } from './RukhsatiVideoPlayer';
import { WaveDivider } from './WaveDivider';
import { CeremonyGalleryModal } from './CeremonyGalleryModal';
import { getCeremonyPhotos } from '../utils/ceremonyGalleryStorage';

interface RukhsatiCeremonySectionProps {
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

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  flicker: boolean;
}

interface SkyLantern {
  id: number;
  x: number;
  y: number;
  speedY: number;
  swaySpeed: number;
  swayOffset: number;
  size: number;
  alpha: number;
}

export const RukhsatiCeremonySection: React.FC<RukhsatiCeremonySectionProps> = ({
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
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // States for the grand fireworks and beautiful post-fireworks scene
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasAutoTriggered, setHasAutoTriggered] = useState<boolean>(false);
  const [isFireworksActive, setIsFireworksActive] = useState<boolean>(true);
  const [sceneRevealed, setSceneRevealed] = useState<boolean>(false);
  const [extraLanternsCount, setExtraLanternsCount] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [photosCount, setPhotosCount] = useState<number>(() => getCeremonyPhotos('rukhsati').length);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.ceremonyId === 'rukhsati' && typeof e.detail?.count === 'number') {
        setPhotosCount(e.detail.count);
      }
    };
    window.addEventListener('ceremonyPhotosUpdated', handleUpdate);
    return () => window.removeEventListener('ceremonyPhotosUpdated', handleUpdate);
  }, []);

  // Sound generator for realistic firework thump & crackle using Web Audio API
  const playFireworkSound = useCallback((pitch = 1, force = false) => {
    if (isMuted && !force) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Deep thump / boom
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130 * pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.35);

      oscGain.gain.setValueAtTime(0.18, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);

      // 2. Sparkle crackle noise
      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850 * pitch, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.26);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.27);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.28);
    } catch {
      // Audio context restricted before direct user action; safely continue
    }
  }, [isMuted]);

  // Launch a new batch of grand fireworks in the entire background
  const triggerGrandFireworks = useCallback(() => {
    setIsFireworksActive(true);
    // After 7 seconds of glorious fireworks, reveal the serene, starlit scene
    setTimeout(() => {
      setSceneRevealed(true);
      // Climax celebratory burst of rose and gold
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#fbbf24', '#fbcfe8', '#ffffff', '#ec4899']
      });
    }, 7000);
  }, []);

  // IntersectionObserver: Auto-trigger fireworks when user scrolls to Rukhsati Ceremony section
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasAutoTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAutoTriggered) {
          setHasAutoTriggered(true);
          triggerGrandFireworks();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasAutoTriggered, triggerGrandFireworks]);

  // Master Background Canvas: Runs Mist Clouds, Floating Pearls, Falling Rose Petals, Fireworks & Wish Lanterns
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 850);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Soft Rose-Pearl Mist Clouds (Existing Animation Preserved)
    interface PearlCloud {
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
      'rgba(252, 231, 243, ',
      'rgba(251, 207, 232, ',
      'rgba(255, 241, 242, ',
      'rgba(254, 242, 242, ',
      'rgba(253, 230, 138, '
    ];

    const clouds: PearlCloud[] = Array.from({ length: 12 }, () => ({
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

    // 2. Glowing White Pearls & Tears of Joy (Existing Animation Preserved)
    interface FloatingPearl {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedY: number;
    }

    const pearls: FloatingPearl[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 2 + Math.random() * 3,
      alpha: 0.35 + Math.random() * 0.4,
      speedY: -0.3 - Math.random() * 0.5
    }));

    // 3. Falling Blush Pink & White Rose Petals (Existing Animation Preserved)
    interface SoftPetal {
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

    const petalColors = ['#f472b6', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'];
    const petals: SoftPetal[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 7,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      speedY: 0.8 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      swaySpeed: 1 + Math.random() * 1.6,
      swayOffset: Math.random() * Math.PI * 2
    }));

    // 4. Grand Fireworks Engine (Across the entire background)
    const fireworksPalette = [
      '#f43f5e', // deep rose
      '#fbbf24', // sparkling gold
      '#f59e0b', // warm amber
      '#ec4899', // bridal fuchsia
      '#a855f7', // royal violet
      '#10b981', // emerald green
      '#38bdf8', // sky blue
      '#ffffff'  // pure white sparkle
    ];

    let rockets: Rocket[] = [];
    let fireworkParticles: FireworkParticle[] = [];
    let burstsTriggered = 0;
    const maxBurstsPerWave = 16;

    const spawnRocket = (customX?: number, customTargetY?: number) => {
      const startX = customX !== undefined ? customX : width * 0.08 + Math.random() * (width * 0.84);
      const targetY = customTargetY !== undefined ? customTargetY : height * 0.12 + Math.random() * (height * 0.45);
      const color = fireworksPalette[Math.floor(Math.random() * fireworksPalette.length)];
      const speed = 7.5 + Math.random() * 3.5;

      rockets.push({
        x: startX,
        y: height,
        targetY,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -speed,
        color,
        trail: []
      });
    };

    const explodeRocket = (x: number, y: number, color: string) => {
      burstsTriggered++;
      playFireworkSound(0.85 + Math.random() * 0.4);

      // Starburst sparks
      const count = 55 + Math.floor(Math.random() * 35);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
        const speed = 1.8 + Math.random() * 5.2;
        fireworkParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.25 ? color : '#fef08a',
          alpha: 1,
          decay: 0.014 + Math.random() * 0.018,
          size: 2 + Math.random() * 2.2,
          flicker: Math.random() > 0.4
        });
      }

      // Secondary glitter burst
      if (Math.random() > 0.45) {
        setTimeout(() => {
          for (let j = 0; j < 20; j++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 2.8;
            fireworkParticles.push({
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: '#ffffff',
              alpha: 0.95,
              decay: 0.02 + Math.random() * 0.02,
              size: 1.5,
              flicker: true
            });
          }
        }, 120);
      }
    };

    // 5. Floating Sky Wish Lanterns for the serene night scene
    const skyLanterns: SkyLantern[] = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x: width * 0.1 + Math.random() * (width * 0.8),
      y: height * 0.4 + Math.random() * (height * 0.7),
      speedY: 0.35 + Math.random() * 0.45,
      swaySpeed: 1 + Math.random() * 1.5,
      swayOffset: Math.random() * Math.PI * 2,
      size: 18 + Math.random() * 10,
      alpha: 0.6 + Math.random() * 0.35
    }));

    let isVisible = false;
    let rocketInterval: NodeJS.Timeout | null = null;

    const startRocketInterval = () => {
      if (rocketInterval) clearInterval(rocketInterval);
      spawnRocket();
      rocketInterval = setInterval(() => {
        if (burstsTriggered < maxBurstsPerWave) {
          spawnRocket();
          if (burstsTriggered > 3 && Math.random() > 0.35) {
            setTimeout(() => spawnRocket(), 160);
          }
        }
      }, 420);
    };

    const stopRocketInterval = () => {
      if (rocketInterval) {
        clearInterval(rocketInterval);
        rocketInterval = null;
      }
    };

    let time = 0;
    let lastFrameTime = performance.now();
    const targetFpsInterval = 1000 / 35; // 35 FPS cap

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

      // 1. Draw Mist Clouds (Existing Atmosphere)
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

      // 2. Draw Floating Pearls (Existing Atmosphere)
      pearls.forEach((p) => {
        p.y += p.speedY;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Draw Wish Lanterns Floating into the Night Sky (Scene Atmosphere)
      skyLanterns.forEach((l) => {
        l.y -= l.speedY;
        l.x += Math.sin(time * l.swaySpeed + l.swayOffset) * 0.4;
        if (l.y < -40) {
          l.y = height + 30;
          l.x = width * 0.1 + Math.random() * (width * 0.8);
        }

        ctx.save();
        ctx.globalAlpha = l.alpha;
        // Warm glowing lantern body
        const lanternGrad = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.size * 1.3);
        lanternGrad.addColorStop(0, '#fef08a');
        lanternGrad.addColorStop(0.5, '#f59e0b');
        lanternGrad.addColorStop(1, '#b45309');

        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fillStyle = lanternGrad;
        ctx.beginPath();
        ctx.roundRect(l.x - l.size / 2, l.y, l.size, l.size * 1.3, [4, 4, 2, 2]);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(l.x, l.y + l.size * 0.75, l.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. Update & Draw Fireworks Rockets (Background Patake)
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 7) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;

        // Spark trail
        ctx.beginPath();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.4 * (t / r.trail.length);
          ctx.globalAlpha = (t / r.trail.length) * 0.85;
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Rocket head spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Detonation condition
        if (r.y <= r.targetY || r.vy >= 0) {
          explodeRocket(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // 5. Update & Draw Exploding Firework Particles
      for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        const p = fireworkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.065; // gravity
        p.vx *= 0.98;  // air drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          fireworkParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.flicker && Math.random() > 0.4 ? p.alpha * 0.5 : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw Falling Rose Petals (Existing Atmosphere)
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
        ctx.globalAlpha = 0.78;

        // Petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRocketInterval();
        cancelAnimationFrame(animId);
      } else if (isVisible) {
        lastFrameTime = performance.now();
        startRocketInterval();
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
          startRocketInterval();
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(render);
        } else if (!isVisible) {
          stopRocketInterval();
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
      stopRocketInterval();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [playFireworkSound, isFireworksActive]);

  // Trigger interactive petal shower
  const showerPetals = () => {
    confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0.4 },
      shapes: ['circle'],
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#fecdd3']
    });
  };

  // Trigger floating sky lantern
  const sendExtraLantern = () => {
    setExtraLanternsCount((c) => c + 1);
  };

  return (
    <section
      id="rukhsati-ceremony"
      ref={sectionRef}
      className="relative w-full min-h-screen py-20 px-4 flex flex-col items-center justify-center overflow-hidden cursor-default select-none transition-colors duration-1000"
      style={{
        background: sceneRevealed
          ? 'radial-gradient(ellipse at 50% 25%, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 58%, #d8b4fe 85%, #c084fc 100%)'
          : 'radial-gradient(ellipse at 50% 25%, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 58%, #f472b6 85%, #ec4899 100%)'
      }}
    >
      {/* 1. MASTER BACKGROUND CANVAS (Mist + Pearls + Falling Petals + Grand Background Fireworks) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 2. THE KHOOBSURAT SEEN (Beautiful Starlit Sky & Moon Atmosphere in Background) */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${
          sceneRevealed ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Glowing Golden Crescent Moon in the High Sky */}
        <div className="absolute top-6 right-8 sm:right-16 flex items-center gap-2 text-amber-200/90 animate-pulse">
          <Moon className="w-8 h-8 sm:w-10 sm:h-10 fill-amber-300/30 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Twinkling Constellations across Background Sky */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping"
            style={{
              top: `${(i * 19) % 85}%`,
              left: `${(i * 23) % 95}%`,
              animationDuration: `${1.8 + (i % 3)}s`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.35 + ((i % 4) * 0.18)
            }}
          />
        ))}

        {/* Ambient Warm Golden-Pink Twilight Nebulae */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-rose-600/25 via-amber-400/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-gradient-to-t from-pink-600/30 via-rose-500/15 to-transparent blur-3xl" />
      </div>

      {/* Extra floating sky lanterns launched by user click */}
      {Array.from({ length: extraLanternsCount }).map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-10 animate-floatUpAndFade"
          style={{
            left: `${15 + (i * 17) % 70}%`,
            bottom: '20px'
          }}
        >
          <div className="w-7 h-9 rounded-t-md rounded-b-sm bg-gradient-to-t from-amber-500 via-amber-300 to-yellow-100 shadow-[0_0_18px_#fbbf24] flex items-center justify-center text-[10px]">
            ✨
          </div>
        </div>
      ))}

      {/* 3. Top Floating Celebration Toolbar (Fireworks control, sound, lanterns, petals) */}
      <div className="absolute top-3 right-3 sm:right-6 z-30 flex items-center gap-2">
        {/* Launch / Replay Fireworks across the entire background */}
        <button
          type="button"
          onClick={triggerGrandFireworks}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md border bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white border-amber-300/40"
          title="Launch Fireworks across background"
        >
          <span>🎆</span>
          <span className={language === 'hi' ? 'font-hindi' : ''}>
            {language === 'ur' ? 'پٹاخے پھوڑیں' : language === 'hi' ? 'पटाखे फोड़ें' : 'Fireworks'}
          </span>
        </button>

        {/* Wish Lantern Button */}
        <button
          type="button"
          onClick={sendExtraLantern}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md border bg-amber-500/80 hover:bg-amber-600 text-gray-950 border-yellow-200/50"
          title="Send a sky wish lantern"
        >
          <span>🏮</span>
          <span className={language === 'hi' ? 'font-hindi' : ''}>
            {language === 'ur' ? 'لالٹین' : language === 'hi' ? 'लालटेन' : 'Lantern'}
          </span>
        </button>

        {/* Rose Petals Button */}
        <button
          type="button"
          onClick={showerPetals}
          className="p-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md border bg-white/20 hover:bg-white/30 text-rose-200 border-white/30"
          title="Shower rose petals"
        >
          🌸
        </button>

        {/* Firecracker Sound Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (!nextMuted) {
              playFireworkSound(1, true);
            }
          }}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md border ${
            isMuted
              ? 'bg-black/30 text-white/70 hover:bg-black/40 border-white/20'
              : 'bg-amber-500/90 text-gray-950 hover:bg-amber-400 border-amber-300'
          }`}
          title={isMuted ? 'Unmute firecracker sounds' : 'Mute firecracker sounds'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4. Top Decorative Pearl Strings & Sacred Doves Garland */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none z-10 opacity-90 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center -mt-2 animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
            <div className={`w-0.5 h-6 sm:h-10 ${sceneRevealed ? 'bg-purple-800/30' : 'bg-pink-800/30'}`} />
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#db2777] via-[#f472b6] to-[#fce7f3] shadow-md border border-pink-400/30 flex items-center justify-center text-[11px]">
              🕊️
            </div>
          </div>
        ))}
      </div>

      {/* 5. Main Emotional Rukhsati Card with Video & Details */}
      <div
        className={`relative z-10 max-w-lg w-full mx-auto rounded-3xl p-4 sm:p-6 text-center transition-all duration-700 ${
          sceneRevealed
            ? 'bg-purple-50/90 backdrop-blur-md border-2 border-purple-300/80 shadow-[0_16px_40px_rgba(168,85,247,0.18)] text-purple-950'
            : 'bg-pink-50/90 backdrop-blur-md border-2 border-pink-300/80 shadow-[0_16px_40px_rgba(219,39,119,0.18)] text-pink-950'
        }`}
      >
        {/* Top Header Row with Ceremony Badge on Left and Gallery Icon Button on Right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            sceneRevealed
              ? 'bg-purple-600/20 border-purple-400/50 text-purple-950'
              : 'bg-pink-600/20 border-pink-400/50 text-pink-950'
          }`}>
            <span>🕊️</span>
            <span>{language === 'ur' ? 'پروقار رخصتی' : language === 'hi' ? 'भावुक रुखसती' : 'Rukhsati Ritual'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md border bg-white/95 hover:bg-white ${
              sceneRevealed
                ? 'border-purple-300 text-purple-950'
                : 'border-pink-300 text-pink-950'
            }`}
            title={language === 'ur' ? 'رخصتی تصویری گیلری' : language === 'hi' ? 'रुखसती फोटो गैलरी' : 'Rukhsati Ceremony Photos'}
          >
            <Images className={`w-3.5 h-3.5 ${sceneRevealed ? 'text-purple-600' : 'text-pink-600'}`} />
            <span className={language === 'hi' ? 'font-hindi' : ''}>
              {language === 'ur' ? 'گیلری' : language === 'hi' ? 'गैलरी' : 'Gallery'}
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              sceneRevealed ? 'bg-purple-100 text-purple-950' : 'bg-pink-100 text-pink-950'
            }`}>
              {photosCount}
            </span>
          </button>
        </div>

        {/* Sacred Arabic Calligraphy in the Beautiful Scene */}
        {sceneRevealed && (
          <div className="mb-2 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-700/10 border border-purple-300/40 text-purple-900 text-[11px] font-semibold mb-1">
              <Stars className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {language === 'ur' ? 'دعاؤں کا سحر انگیز منظر' : language === 'hi' ? 'दुआओं का हसीन मंजर' : 'Enchanting Blessed Night'}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-serif text-purple-950 tracking-wider leading-relaxed font-semibold">
              بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
            </h4>
          </div>
        )}

        {/* Grand Title: Emotional Rukhsati */}
        <h2
          className={`text-3xl sm:text-4xl font-extrabold leading-tight mb-1 ${
            sceneRevealed
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-950 via-rose-900 to-amber-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-950 via-rose-800 to-pink-700 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]'
          } ${language === 'ur' ? 'font-urdu py-1' : language === 'hi' ? 'font-hindi font-bold' : 'font-display'}`}
        >
          {language === 'ur'
            ? 'سایۂ قرآن میں پروقار رخصتی'
            : language === 'hi'
            ? 'भावुक रुखसती (सया-ए-क़ुरआन विदाई)'
            : 'Emotional Rukhsati & Blessed Departure'}
        </h2>

        {/* Subtitle / Poetic Blessing */}
        <p
          className={`text-xs sm:text-sm font-bold max-w-md mx-auto leading-relaxed mb-2.5 ${
            sceneRevealed ? 'text-purple-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]' : 'text-pink-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]'
          } ${language === 'hi' ? 'font-hindi' : ''}`}
        >
          {language === 'ur'
            ? 'آنکھوں میں نم اور لبوں پر دعائیں، سایۂ کلامِ الٰہی میں نئی بابرکت زندگی کی طرف پہلا قدم۔ بارک اللہ لکما!'
            : language === 'hi'
            ? 'नम आंखों में स्नेह और लबों पर दुआएं, कलाम-ए-इलाही के साए में नए जीवन की मंगल शुरुआत।'
            : 'A tender, heartfelt farewell under the shade of the Holy Quran, beginning a new blessed chapter of unconditional love.'}
        </p>

        {/* Dedicated Rukhsati Video Player with Upload & Persistent Playback */}
        <RukhsatiVideoPlayer
          language={language}
          defaultVideoUrl={videoUrl || 'https://www.youtube.com/watch?v=Xxh-lsUBifk'}
          onVideoChange={onVideoChange}
        />

        {/* Romantic Carriage / Bride Departure Silhouette Touch in Beautiful Scene */}
        {sceneRevealed && (
          <div className="my-2 py-2 px-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center gap-3 animate-fadeIn">
            <div className="text-2xl sm:text-3xl animate-floatSlow">🚗</div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Abdul Qadir &amp; Fozia
              </span>
              <p className="text-[11px] text-pink-100 font-medium">
                {language === 'ur'
                  ? 'ستاروں کے جھرمٹ اور دعاؤں کے سائے میں سفرِ محبت'
                  : language === 'hi'
                  ? 'तारों की छांव और दुआओं के साए में नया सफर'
                  : 'Beginning eternal love under starlit blessings'}
              </p>
            </div>
            <div className="text-2xl sm:text-3xl">👩‍❤️‍👨</div>
          </div>
        )}

        {/* Date & Time and Location Key Highlights */}
        <div className="max-w-md mx-auto mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {/* 1. Date & Time */}
          <div
            className={`p-2.5 rounded-2xl border shadow-2xs flex items-center gap-2.5 ${
              sceneRevealed
                ? 'bg-white/80 backdrop-blur-xs border-purple-200/90 text-purple-950'
                : 'bg-white/75 backdrop-blur-xs border-pink-200/90 text-pink-950'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${
              sceneRevealed ? 'bg-purple-700' : 'bg-pink-600'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${
                  sceneRevealed ? 'text-purple-900' : 'text-pink-900'
                } ${language === 'hi' ? 'font-hindi' : ''}`}
              >
                {language === 'ur' ? 'تاریخ و وقت' : language === 'hi' ? 'तारीख व समय' : 'Date & Time'}
              </span>
              <p className="text-xs sm:text-sm font-extrabold mt-0.5 truncate">
                {language === 'ur'
                  ? (dateUr || '۲۸ اکتوبر ۲۰۲۶')
                  : language === 'hi'
                  ? (dateHi || '28 अक्टूबर 2026')
                  : (dateEn || 'Oct 28, 2026')}
              </p>
              <div
                className={`flex items-center gap-1 text-[11px] font-bold mt-0.5 ${
                  sceneRevealed ? 'text-purple-800' : 'text-pink-800'
                }`}
              >
                <Clock className={`w-3 h-3 shrink-0 ${sceneRevealed ? 'text-purple-600' : 'text-pink-600'}`} />
                <span>
                  {language === 'ur'
                    ? (timeUr || 'رات ۹:۰۰ بجے')
                    : language === 'hi'
                    ? (timeHi || 'रात 9:00 बजे')
                    : (timeEn || '9:00 PM')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Location (لوکیشن / स्थान) */}
          <div
            className={`p-2.5 rounded-2xl border shadow-2xs flex items-start gap-2.5 ${
              sceneRevealed
                ? 'bg-white/80 backdrop-blur-xs border-purple-200/90 text-purple-950'
                : 'bg-white/75 backdrop-blur-xs border-pink-200/90 text-pink-950'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
              sceneRevealed ? 'bg-purple-800' : 'bg-pink-700'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${
                  sceneRevealed ? 'text-purple-900' : 'text-pink-900'
                } ${language === 'hi' ? 'font-hindi' : ''}`}
              >
                {language === 'ur' ? 'مقام (Location)' : language === 'hi' ? 'स्थान (Location)' : 'Location'}
              </span>
              <p className={`text-xs sm:text-sm font-extrabold mt-0.5 leading-tight ${language === 'hi' ? 'font-hindi' : ''}`}>
                {language === 'ur'
                  ? (locationUr || 'برج العرب پورٹیکو اینڈ لابی لاؤنج')
                  : language === 'hi'
                  ? (locationHi || 'बुर्ज अल अरब पोर्टिको एंड लॉबी लाउंज')
                  : (locationEn || 'Burj Al Arab Portico & Lobby Lounge')}
              </p>
              <p
                className={`text-[10px] font-medium mt-0.5 leading-snug ${
                  sceneRevealed ? 'text-purple-900/80' : 'text-pink-950/80'
                }`}
              >
                {language === 'ur'
                  ? (addressUr || 'پرنسپل رائل کنکورس، دبئی، متحدہ عرب امارات')
                  : language === 'hi'
                  ? (addressHi || 'प्रिंसिपल रॉयल कॉन्कोर्स, दुबई, यूएई')
                  : (addressEn || 'Principal Royal Concourse, Dubai, UAE')}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all active:scale-95 shadow-2xs ${
                    sceneRevealed
                      ? 'bg-purple-200/90 text-purple-950 hover:bg-purple-300'
                      : 'bg-pink-200/90 text-pink-950 hover:bg-pink-300'
                  }`}
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

      {/* Bottom organic wave transition into Timeline section */}
      <WaveDivider position="bottom" fillColor="#f0f8ff" variant="wave1" />

      {/* Dedicated Ceremony Photo Gallery Modal */}
      <CeremonyGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        ceremonyId="rukhsati"
        language={language}
        onPhotosUpdated={setPhotosCount}
      />
    </section>
  );
};
