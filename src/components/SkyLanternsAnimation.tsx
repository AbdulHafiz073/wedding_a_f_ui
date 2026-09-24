import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Heart, Flame } from 'lucide-react';
import { Language } from '../types';

interface SkyLanternsAnimationProps {
  className?: string;
  language?: Language;
  active?: boolean;
}

interface Lantern {
  x: number;
  y: number;
  size: number;
  speedY: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  targetOpacity: number;
  flickerSpeed: number;
  flickerOffset: number;
  layer: 'bg' | 'mid' | 'fg' | 'user';
  colorTone: 'peach' | 'rose' | 'amber' | 'gold' | 'pearl';
  isUserCreated?: boolean;
}

interface HangingLamp {
  xPercent: number; // percentage across width
  hangLengthPercent: number; // percentage down height
  size: number;
  colorTone: 'amber' | 'rose' | 'gold';
  swaySpeed: number;
  swayOffset: number;
  flickerOffset: number;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
}

interface FloatingPetal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  swaySpeed: number;
  swayOffset: number;
  color: string;
  opacity: number;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  emoji: string;
}

export const SkyLanternsAnimation: React.FC<SkyLanternsAnimationProps> = ({
  className = '',
  language = 'en',
  active = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lanternsRef = useRef<Lantern[]>([]);
  const embersRef = useRef<Ember[]>([]);
  const petalsRef = useRef<FloatingPetal[]>([]);
  const animFrameIdRef = useRef<number>(0);
  const [releasedCount, setReleasedCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Hanging royal lighting lamps suspended along background (optimized to 6 lamps for low thermal impact)
  const hangingLampsRef = useRef<HangingLamp[]>([
    { xPercent: 0.05, hangLengthPercent: 0.18, size: 26, colorTone: 'gold', swaySpeed: 0.8, swayOffset: 0.2, flickerOffset: 0.5 },
    { xPercent: 0.12, hangLengthPercent: 0.55, size: 30, colorTone: 'amber', swaySpeed: 0.65, swayOffset: 1.4, flickerOffset: 1.8 },
    { xPercent: 0.95, hangLengthPercent: 0.20, size: 26, colorTone: 'rose', swaySpeed: 0.75, swayOffset: 0.8, flickerOffset: 1.2 },
    { xPercent: 0.88, hangLengthPercent: 0.56, size: 30, colorTone: 'gold', swaySpeed: 0.65, swayOffset: 2.6, flickerOffset: 2.7 },
    { xPercent: 0.32, hangLengthPercent: 0.09, size: 22, colorTone: 'rose', swaySpeed: 0.9, swayOffset: 1.9, flickerOffset: 2.2 },
    { xPercent: 0.68, hangLengthPercent: 0.09, size: 22, colorTone: 'amber', swaySpeed: 0.9, swayOffset: 2.8, flickerOffset: 1.5 }
  ]);

  // Helper to create a single glowing pastel lantern
  const createLantern = useCallback((
    width: number,
    height: number,
    startAtBottom = false,
    layerOverride?: 'bg' | 'mid' | 'fg',
    initialX?: number,
    initialY?: number,
    isUser = false
  ): Lantern => {
    let layer: 'bg' | 'mid' | 'fg' | 'user';
    let size: number;
    let speedY: number;

    if (isUser) {
      layer = 'user';
      size = 38 + Math.random() * 22;
      speedY = 1.1 + Math.random() * 0.5;
    } else {
      const rand = Math.random();
      if (layerOverride) {
        layer = layerOverride;
      } else if (rand < 0.55) {
        layer = 'bg';
      } else if (rand < 0.85) {
        layer = 'mid';
      } else {
        layer = 'fg';
      }

      if (layer === 'bg') {
        size = 7 + Math.random() * 10;
        speedY = 0.28 + Math.random() * 0.35;
      } else if (layer === 'mid') {
        size = 17 + Math.random() * 17;
        speedY = 0.58 + Math.random() * 0.45;
      } else {
        size = 34 + Math.random() * 24;
        speedY = 0.88 + Math.random() * 0.55;
      }
    }

    const tones: Array<'peach' | 'rose' | 'amber' | 'gold' | 'pearl'> = ['peach', 'rose', 'amber', 'gold', 'pearl'];
    const colorTone = tones[Math.floor(Math.random() * tones.length)];

    const x = initialX !== undefined ? initialX : Math.random() * width;
    // When not starting strictly at bottom, distribute uniformly across the entire height of the background
    const y = initialY !== undefined
      ? initialY
      : startAtBottom
      ? height + size + Math.random() * 40
      : Math.random() * (height + 40);

    return {
      x,
      y,
      size,
      speedY,
      swayAmplitude: layer === 'bg' ? 0.3 + Math.random() * 0.5 : 0.8 + Math.random() * 1.5,
      swayFrequency: 0.015 + Math.random() * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * 0.08,
      tiltSpeed: 0.01 + Math.random() * 0.012,
      opacity: isUser ? 0.2 : layer === 'bg' ? 0.5 + Math.random() * 0.45 : 0.88 + Math.random() * 0.12,
      targetOpacity: layer === 'bg' ? 0.75 : 0.98,
      flickerSpeed: 0.04 + Math.random() * 0.07,
      flickerOffset: Math.random() * Math.PI * 2,
      layer,
      colorTone,
      isUserCreated: isUser
    };
  }, []);

  // Spawn celebratory user lantern on click/tap
  const releaseUserLantern = useCallback((clientX?: number, clientY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX !== undefined ? clientX - rect.left : canvas.width * 0.5 + (Math.random() - 0.5) * 140;
    const y = clientY !== undefined ? clientY - rect.top : canvas.height - 40;

    const newLantern = createLantern(canvas.width, canvas.height, false, undefined, x, y, true);
    lanternsRef.current.push(newLantern);

    // Burst of cute warm golden sparks around the released lantern
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.5;
      embersRef.current.push({
        x,
        y,
        size: 1.5 + Math.random() * 2.5,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1.2,
        alpha: 0.95,
        maxAlpha: 0.95,
        decay: 0.012 + Math.random() * 0.018,
        color: Math.random() > 0.4 ? '#f59e0b' : '#f43f5e'
      });
    }

    // Spawn cute floating emoji hearts
    const emojis = ['💖', '🌸', '✨', '💕', '🏮'];
    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [
      ...prev.slice(-14),
      {
        id: heartId,
        x: Math.max(20, Math.min(window.innerWidth - 40, x)),
        y: Math.max(40, y),
        size: 20 + Math.random() * 10,
        speedY: 1.5 + Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 1.5,
        opacity: 1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      }
    ]);

    setReleasedCount((c) => c + 1);
  }, [createLantern]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    // ResizeObserver ensures canvas ALWAYS accurately matches the full container height and width
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
          width = canvas.width = Math.ceil(w);
          height = canvas.height = Math.ceil(h);
        }
      }
    });
    resizeObserver.observe(container);

    // Optimized population of lanterns: silky smooth, highly atmospheric, and cool on phone hardware
    const targetCount = width < 768 ? 16 : 28;
    lanternsRef.current = [];
    for (let i = 0; i < targetCount; i++) {
      const initialY = (i / targetCount) * (height + 60) + (Math.random() - 0.5) * 40;
      lanternsRef.current.push(createLantern(width, height, false, undefined, undefined, initialY));
    }

    // Embers / Fairy Sparkles spread throughout height
    const emberCount = width < 768 ? 10 : 20;
    embersRef.current = [];
    for (let i = 0; i < emberCount; i++) {
      embersRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        speedY: 0.3 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.35 + Math.random() * 0.4,
        maxAlpha: 0.75,
        decay: 0.002 + Math.random() * 0.004,
        color: Math.random() > 0.5 ? '#f59e0b' : '#fb7185'
      });
    }

    // Floating blush rose petals across hero section
    const petalColors = ['#f472b6', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'];
    petalsRef.current = Array.from({ length: width < 768 ? 8 : 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5 + Math.random() * 6,
      speedY: 0.5 + Math.random() * 0.6,
      speedX: 0.15 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      swaySpeed: 0.8 + Math.random() * 1.4,
      swayOffset: Math.random() * Math.PI * 2,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: 0.5 + Math.random() * 0.3
    }));

    // Draw single realistic glowing sky lantern (Floating Lighting Lamp)
    const drawLantern = (l: Lantern, time: number) => {
      const flicker = 0.9 + Math.sin(time * l.flickerSpeed + l.flickerOffset) * 0.1;
      const swayX = Math.sin(time * l.swayFrequency + l.swayOffset) * l.swayAmplitude;
      const tiltAngle = Math.sin(time * l.tiltSpeed + l.swayOffset) * 0.07 + l.tilt;

      ctx.save();
      ctx.translate(l.x + swayX, l.y);
      ctx.rotate(tiltAngle);

      const w = l.size * 0.72;
      const h = l.size;
      const halfW = w / 2;
      const halfH = h / 2;

      // 1. Warm ethereal outer radial bloom / aura (Soft Honey Gold & Rose Glow)
      const auraRadius = Math.max(w * 2.2, 14);
      const auraGrad = ctx.createRadialGradient(0, halfH * 0.35, 2, 0, halfH * 0.35, auraRadius);
      auraGrad.addColorStop(0, `rgba(254, 215, 170, ${0.55 * l.opacity * flicker})`);
      auraGrad.addColorStop(0.4, `rgba(251, 146, 60, ${0.28 * l.opacity * flicker})`);
      auraGrad.addColorStop(0.75, `rgba(244, 114, 182, ${0.12 * l.opacity * flicker})`);
      auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, halfH * 0.35, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Lantern Body: Soft curved paper cylinder (tapered at bottom with bamboo rim)
      ctx.beginPath();
      const topCurve = h * 0.12;
      const bottomCurve = h * 0.08;
      const taper = w * 0.08;

      ctx.moveTo(-halfW, -halfH + topCurve);
      ctx.quadraticCurveTo(0, -halfH - topCurve * 0.6, halfW, -halfH + topCurve);
      ctx.lineTo(halfW - taper, halfH - bottomCurve);
      ctx.quadraticCurveTo(0, halfH + bottomCurve * 0.8, -halfW + taper, halfH - bottomCurve);
      ctx.closePath();

      // Body illumination gradient (Light luminous glowing rice-paper body)
      const bodyGrad = ctx.createLinearGradient(0, halfH, 0, -halfH);
      if (l.colorTone === 'rose') {
        bodyGrad.addColorStop(0, `rgba(255, 241, 242, ${0.98 * l.opacity})`);
        bodyGrad.addColorStop(0.3, `rgba(254, 205, 211, ${0.92 * l.opacity})`);
        bodyGrad.addColorStop(0.65, `rgba(251, 113, 133, ${0.85 * l.opacity})`);
        bodyGrad.addColorStop(1, `rgba(244, 63, 94, ${0.75 * l.opacity})`);
      } else if (l.colorTone === 'peach') {
        bodyGrad.addColorStop(0, `rgba(255, 250, 240, ${0.98 * l.opacity})`);
        bodyGrad.addColorStop(0.3, `rgba(254, 215, 170, ${0.94 * l.opacity})`);
        bodyGrad.addColorStop(0.65, `rgba(251, 146, 60, ${0.86 * l.opacity})`);
        bodyGrad.addColorStop(1, `rgba(234, 88, 12, ${0.72 * l.opacity})`);
      } else {
        bodyGrad.addColorStop(0, `rgba(255, 255, 230, ${0.98 * l.opacity})`);
        bodyGrad.addColorStop(0.3, `rgba(254, 240, 138, ${0.95 * l.opacity})`);
        bodyGrad.addColorStop(0.65, `rgba(250, 204, 21, ${0.88 * l.opacity})`);
        bodyGrad.addColorStop(1, `rgba(217, 119, 6, ${0.75 * l.opacity})`);
      }

      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Delicate golden bamboo framing rim
      if (l.layer !== 'bg') {
        ctx.strokeStyle = `rgba(180, 83, 9, ${0.45 * l.opacity})`;
        ctx.lineWidth = Math.max(0.7, l.size * 0.025);
        ctx.stroke();

        // Bottom bamboo ring
        ctx.beginPath();
        ctx.ellipse(0, halfH - bottomCurve * 0.4, halfW - taper + 1, bottomCurve * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(146, 64, 14, ${0.65 * l.opacity})`;
        ctx.lineWidth = Math.max(1, l.size * 0.035);
        ctx.stroke();

        // Top bamboo curve
        ctx.beginPath();
        ctx.ellipse(0, -halfH + topCurve * 0.6, halfW, topCurve * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 119, 6, ${0.35 * l.opacity})`;
        ctx.lineWidth = Math.max(0.6, l.size * 0.02);
        ctx.stroke();
      }

      // 3. Intense Inner Fire Core (Burning flame radiating warmth)
      const flameRadius = Math.max(w * 0.26, 2.5);
      const flameY = halfH - bottomCurve - flameRadius * 0.6;
      const flameGrad = ctx.createRadialGradient(0, flameY, 0, 0, flameY, flameRadius * 1.8);
      flameGrad.addColorStop(0, `rgba(255, 255, 255, ${1 * l.opacity * flicker})`);
      flameGrad.addColorStop(0.35, `rgba(254, 240, 138, ${0.95 * l.opacity * flicker})`);
      flameGrad.addColorStop(0.7, `rgba(245, 158, 11, ${0.75 * l.opacity * flicker})`);
      flameGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(0, flameY, flameRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw hanging royal decorative lighting lamps (झूमर / लैंप्स) suspended along sides & top
    const drawHangingLamps = (time: number) => {
      const lamps = hangingLampsRef.current;
      for (let i = 0; i < lamps.length; i++) {
        const hl = lamps[i];
        const lampX = hl.xPercent * width;
        const hangY = hl.hangLengthPercent * height;
        const sway = Math.sin(time * hl.swaySpeed + hl.swayOffset) * (hl.size * 0.18);
        const flicker = 0.88 + Math.sin(time * 3.5 + hl.flickerOffset) * 0.12;

        ctx.save();

        // 1. Slender golden chain/cord hanging down from top of section
        ctx.beginPath();
        ctx.moveTo(lampX, 0);
        ctx.quadraticCurveTo(lampX + sway * 0.5, hangY * 0.5, lampX + sway, hangY);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.translate(lampX + sway, hangY);

        const radius = hl.size;

        // 2. Luminous Ambient Glow Aura radiating across the background
        const lampAura = ctx.createRadialGradient(0, radius * 0.4, 2, 0, radius * 0.4, radius * 2.6);
        if (hl.colorTone === 'rose') {
          lampAura.addColorStop(0, `rgba(254, 205, 211, ${0.75 * flicker})`);
          lampAura.addColorStop(0.4, `rgba(244, 63, 94, ${0.28 * flicker})`);
          lampAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          lampAura.addColorStop(0, `rgba(254, 240, 138, ${0.8 * flicker})`);
          lampAura.addColorStop(0.4, `rgba(245, 158, 11, ${0.32 * flicker})`);
          lampAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = lampAura;
        ctx.beginPath();
        ctx.arc(0, radius * 0.4, radius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // 3. Ornate Brass Filigree Top Cap
        ctx.beginPath();
        ctx.moveTo(-radius * 0.35, 0);
        ctx.quadraticCurveTo(0, -radius * 0.35, radius * 0.35, 0);
        ctx.lineTo(-radius * 0.35, 0);
        ctx.fillStyle = 'rgba(180, 83, 9, 0.9)';
        ctx.fill();

        // 4. Teardrop/Lantern Glass Body
        ctx.beginPath();
        ctx.moveTo(-radius * 0.38, 0);
        ctx.quadraticCurveTo(-radius * 0.5, radius * 0.7, 0, radius * 1.15);
        ctx.quadraticCurveTo(radius * 0.5, radius * 0.7, radius * 0.38, 0);
        ctx.closePath();

        const glassGrad = ctx.createLinearGradient(0, 0, 0, radius * 1.15);
        if (hl.colorTone === 'rose') {
          glassGrad.addColorStop(0, 'rgba(255, 241, 242, 0.95)');
          glassGrad.addColorStop(0.4, 'rgba(254, 205, 211, 0.9)');
          glassGrad.addColorStop(0.8, 'rgba(251, 113, 133, 0.85)');
          glassGrad.addColorStop(1, 'rgba(244, 63, 94, 0.75)');
        } else {
          glassGrad.addColorStop(0, 'rgba(255, 255, 240, 0.98)');
          glassGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.92)');
          glassGrad.addColorStop(0.75, 'rgba(251, 191, 36, 0.88)');
          glassGrad.addColorStop(1, 'rgba(217, 119, 6, 0.75)');
        }
        ctx.fillStyle = glassGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 5. Burning Wick / Glowing Light Core
        ctx.beginPath();
        ctx.arc(0, radius * 0.45, radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * flicker})`;
        ctx.fill();

        // Bottom hanging crystal/bead
        ctx.beginPath();
        ctx.moveTo(0, radius * 1.15);
        ctx.lineTo(0, radius * 1.35);
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, radius * 1.38, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.restore();
      }
    };

    // Draw charming fairy string lights draped gracefully along multiple tiers of hero
    const drawFairyStringLights = (time: number) => {
      // Multiple tiers of fairy strings
      const tiers = [
        { yOffset: 0, sag: 28, segments: width < 768 ? 6 : 9 },
        { yOffset: 55, sag: 35, segments: width < 768 ? 5 : 8 }
      ];

      ctx.save();
      for (let tIdx = 0; tIdx < tiers.length; tIdx++) {
        const { yOffset, sag, segments } = tiers[tIdx];
        const segWidth = width / segments;
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
        ctx.lineWidth = 1;

        for (let s = 0; s < segments; s++) {
          const x1 = s * segWidth;
          const x2 = (s + 1) * segWidth;
          const cpX = (x1 + x2) / 2;
          const cpY = yOffset + sag + Math.sin(time * 0.8 + s + tIdx) * 2;

          ctx.beginPath();
          ctx.moveTo(x1, yOffset);
          ctx.quadraticCurveTo(cpX, cpY, x2, yOffset);
          ctx.stroke();

          for (let b = 1; b <= 3; b++) {
            const t = b / 4;
            const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2;
            const by = (1 - t) * (1 - t) * yOffset + 2 * (1 - t) * t * cpY + t * t * yOffset;

            const bulbFlicker = 0.85 + Math.sin(time * 3 + s * 3 + b + tIdx) * 0.15;
            const isGold = (s + b + tIdx) % 2 === 0;

            // Ultra-lightweight glowing fairy bulb (avoid expensive per-frame radial gradient allocations)
            ctx.fillStyle = isGold
              ? `rgba(251, 191, 36, ${0.45 * bulbFlicker})`
              : `rgba(244, 114, 182, ${0.45 * bulbFlicker})`;
            ctx.beginPath();
            ctx.arc(bx, by, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    };

    let startTime = performance.now();
    let lastFrameTime = performance.now();
    const targetFpsInterval = 1000 / 35; // 35 FPS cap - eliminates thermal throttling and excessive battery draw
    let isVisible = false;

    // Main animation loop
    const animate = (timestamp: number) => {
      if (!isVisible || !active) return;

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < targetFpsInterval) {
        animFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp - (elapsed % targetFpsInterval);

      const time = (timestamp - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      // 1. Dreamy Light Luminous Pastel Sunrise / Morning Sky Canvas across entire section
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#fffbf5');        // Soft morning cream / ivory
      skyGrad.addColorStop(0.3, '#fff1f2');      // Delicate blush rose
      skyGrad.addColorStop(0.65, '#fff7ed');     // Warm glowing sunrise peach
      skyGrad.addColorStop(0.9, '#ffedd5');      // Radiant honey apricot glow
      skyGrad.addColorStop(1, '#fef3c7');        // Golden sunlight horizon tone

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Warm radial sunburst glows (one upper, one mid-lower)
      const sunburstTop = ctx.createRadialGradient(width * 0.5, height * 0.25, 20, width * 0.5, height * 0.25, width * 0.7);
      sunburstTop.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
      sunburstTop.addColorStop(0.4, 'rgba(254, 215, 170, 0.15)');
      sunburstTop.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunburstTop;
      ctx.fillRect(0, 0, width, height);

      const sunburstBottom = ctx.createRadialGradient(width * 0.5, height * 0.75, 20, width * 0.5, height * 0.75, width * 0.7);
      sunburstBottom.addColorStop(0, 'rgba(254, 215, 170, 0.2)');
      sunburstBottom.addColorStop(0.5, 'rgba(254, 240, 138, 0.1)');
      sunburstBottom.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunburstBottom;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Embers / Golden Firefly Sparks across entire height
      for (let i = 0; i < embersRef.current.length; i++) {
        const e = embersRef.current[i];
        e.y -= e.speedY;
        e.x += e.speedX + Math.sin(time + i) * 0.3;
        e.alpha -= e.decay;

        if (e.y < -10 || e.alpha <= 0) {
          e.y = height + 10;
          e.x = Math.random() * width;
          e.alpha = 0.35 + Math.random() * 0.45;
          e.decay = 0.002 + Math.random() * 0.005;
        }

        ctx.fillStyle = e.color === '#f43f5e' ? `rgba(244, 63, 94, ${e.alpha})` : `rgba(245, 158, 11, ${e.alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Update & Draw all Sky Lanterns across entire section height & width
      const lanterns = lanternsRef.current;
      for (let i = 0; i < lanterns.length; i++) {
        const l = lanterns[i];
        l.y -= l.speedY;

        if (l.isUserCreated && l.opacity < l.targetOpacity) {
          l.opacity = Math.min(l.targetOpacity, l.opacity + 0.04);
        }

        // When floating off top, respawn at bottom so full continuous stream covers the whole section
        if (l.y < -l.size * 2) {
          if (l.isUserCreated) {
            lanterns.splice(i, 1);
            i--;
            continue;
          } else {
            l.y = height + l.size + Math.random() * 30;
            l.x = Math.random() * width;
          }
        }

        drawLantern(l, time);
      }

      // 4. Draw hanging decorative royal lighting lamps cascading down the entire background
      drawHangingLamps(time);

      // 5. Floating soft blush rose petals across hero
      const petals = petalsRef.current;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.6 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw multi-tier fairy string lights along upper canopy
      drawFairyStringLights(time);

      if (isVisible && active) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameIdRef.current);
      } else if (isVisible && active) {
        lastFrameTime = performance.now();
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && active && !wasVisible) {
          startTime = performance.now();
          lastFrameTime = performance.now();
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = requestAnimationFrame(animate);
        } else if (!isVisible) {
          cancelAnimationFrame(animFrameIdRef.current);
        }
      },
      { threshold: 0.05 }
    );

    if (canvas.parentElement) {
      intersectionObserver.observe(canvas.parentElement);
    } else {
      intersectionObserver.observe(canvas);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [active, createLantern]);

  // Handle pointer down on hero to release a lantern & cute heart
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    releaseUserLantern(e.clientX, e.clientY);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none cursor-pointer ${className}`}
      style={{ width: '100%', height: '100%' }}
      title={
        language === 'ur'
          ? 'دعا کا کاندیل اڑانے کے لیے ٹچ کریں'
          : language === 'hi'
          ? 'दुआ का कंदील उड़ाने के लिए कहीं भी टच करें'
          : 'Tap anywhere to release a cute wish lantern!'
      }
    >
      {/* HTML5 Canvas Rendering Full-Coverage Lighting Lamps & Luminous Sky */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating interactive cute emoji hearts spawned on click */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none z-20 animate-floatUpAndFade text-xl sm:text-2xl"
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            filter: 'drop-shadow(0 2px 8px rgba(244,63,94,0.35))'
          }}
        >
          {h.emoji}
        </div>
      ))}

      {/* Cute, Luminous Interactive Floating Badge: "Release a Wish Lantern / कंदील उड़ाएँ" */}
      <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            releaseUserLantern();
          }}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 hover:bg-white/95 backdrop-blur-md border border-rose-300/80 hover:border-rose-400 text-[#9d174d] text-xs font-display tracking-wider shadow-[0_4px_18px_rgba(244,114,182,0.25)] transition-all transform active:scale-95 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse group-hover:scale-110 transition-transform" />
          <span className={`font-bold text-[#831843] ${language === 'hi' ? 'font-hindi' : ''}`}>
            {language === 'ur'
              ? 'دعا کا کاندیل اڑائیں (ٹچ کریں)'
              : language === 'hi'
              ? 'दुआ का कंदील उड़ाएँ (टच करें)'
              : 'Release a Wish Lantern (Tap)'}
          </span>
          {releasedCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold border border-rose-200">
              +{releasedCount}
            </span>
          )}
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        </button>
      </div>
    </div>
  );
};
