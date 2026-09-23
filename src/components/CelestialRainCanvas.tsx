import React, { useEffect, useRef } from 'react';

// Star Types:
// 1. 'diamond' (4-point North Star diamond sparkle with long vertical/horizontal flares)
// 2. 'classic' (5-pointed radiant star)
// 3. 'rub-el-hizb' (8-pointed Islamic geometric star formed by dual offset squares)
// 4. 'nova-burst' (8-pointed ray burst with luminous center core)
// 5. 'shimmer-orb' (Luminous glowing celestial halo sphere / starlight orb)
export type StarVariant = 'diamond' | 'classic' | 'rub-el-hizb' | 'nova-burst' | 'shimmer-orb';

interface RainStar {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  variant: StarVariant;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
  glowColor: string;
  swayFreq: number;
  swayOffset: number;
}

interface NoorGlowOrb {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  opacity: number;
}

export const CelestialRainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Warm ambient Noor golden glow orbs
    const orbs: NoorGlowOrb[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 600),
      radius: 90 + Math.random() * 130,
      speedY: 0.15 + Math.random() * 0.25,
      opacity: 0.07 + Math.random() * 0.1,
    }));

    // Rich luminous celestial star palette
    const starColors = [
      { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.95)' }, // Pure diamond white
      { fill: '#fef08a', glow: 'rgba(254, 240, 138, 0.9)' },  // Warm gold
      { fill: '#facc15', glow: 'rgba(250, 204, 21, 0.9)' },   // Radiant amber gold
      { fill: '#fde047', glow: 'rgba(253, 224, 71, 0.9)' },   // Canary starlight
      { fill: '#e0f2fe', glow: 'rgba(224, 242, 254, 0.95)' }, // Ice blue-white sparkle
      { fill: '#fed7aa', glow: 'rgba(254, 215, 170, 0.85)' }, // Peach champagne gold
    ];

    const variants: StarVariant[] = [
      'diamond',
      'classic',
      'rub-el-hizb',
      'nova-burst',
      'shimmer-orb',
    ];

    // High density pure star rainfall (320 sparkling stars of 5 distinct types)
    const starCount = 320;
    const stars: RainStar[] = Array.from({ length: starCount }, () => {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const colorPair = starColors[Math.floor(Math.random() * starColors.length)];
      return {
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 800) - (height || 800),
        size: 5 + Math.random() * 16,
        speedY: 1.5 + Math.random() * 3.5, // Natural, graceful rainfall downward
        speedX: (Math.random() - 0.5) * 0.8,
        variant,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        opacity: 0.5 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.05 + Math.random() * 0.1,
        color: colorPair.fill,
        glowColor: colorPair.glow,
        swayFreq: 1 + Math.random() * 2,
        swayOffset: Math.random() * Math.PI * 2,
      };
    });

    // Occasional shooting star (شہابِ ثاقب)
    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speedX: number;
      speedY: number;
      opacity: number;
      active: boolean;
    } = { x: 0, y: 0, length: 0, speedX: 0, speedY: 0, opacity: 0, active: false };

    let shootingTimer = 0;

    // ==========================================
    // 5 DISTINCT STAR LIGHTING RENDERERS
    // ==========================================

    // TYPE 1: Diamond 4-point Star (Sparkle with extended long spikes)
    const drawDiamondStar = (c: CanvasRenderingContext2D, size: number) => {
      const longLen = size * 1.6;
      const shortLen = size * 0.28;
      c.beginPath();
      c.moveTo(0, -longLen);
      c.lineTo(shortLen, -shortLen);
      c.lineTo(longLen, 0);
      c.lineTo(shortLen, shortLen);
      c.lineTo(0, longLen);
      c.lineTo(-shortLen, shortLen);
      c.lineTo(-longLen, 0);
      c.lineTo(-shortLen, -shortLen);
      c.closePath();
      c.fill();

      // Bright center core
      c.beginPath();
      c.arc(0, 0, shortLen * 1.2, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
    };

    // TYPE 2: Classic 5-Pointed Radiant Star
    const drawClassicStar = (c: CanvasRenderingContext2D, size: number) => {
      const spikes = 5;
      const outerR = size * 1.1;
      const innerR = size * 0.42;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(0, -outerR);
      for (let i = 0; i < spikes; i++) {
        c.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
        rot += step;
        c.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
        rot += step;
      }
      c.lineTo(0, -outerR);
      c.closePath();
      c.fill();
    };

    // TYPE 3: Islamic 8-Pointed Rub el Hizb Star (Two overlapping 45-deg squares with star points)
    const drawRubElHizbStar = (c: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.85;
      c.save();
      // Square 1
      c.fillRect(-s, -s, s * 2, s * 2);
      // Square 2 rotated 45 degrees
      c.rotate(Math.PI / 4);
      c.fillRect(-s, -s, s * 2, s * 2);
      c.restore();

      // Fine golden center diamond
      c.beginPath();
      c.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
    };

    // TYPE 4: Nova Burst 8-Ray Star (Supernova Flare)
    const drawNovaBurstStar = (c: CanvasRenderingContext2D, size: number) => {
      const outerR = size * 1.5;
      const innerR = size * 0.35;
      const spikes = 8;
      let rot = 0;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      for (let i = 0; i < spikes; i++) {
        c.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
        rot += step;
        c.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
        rot += step;
      }
      c.closePath();
      c.fill();

      // Specular glare crosshairs
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-outerR * 1.3, 0);
      c.lineTo(outerR * 1.3, 0);
      c.moveTo(0, -outerR * 1.3);
      c.lineTo(0, outerR * 1.3);
      c.stroke();
    };

    // TYPE 5: Shimmer Orb (Pulsing Luminous Halos / Starlight Droplet)
    const drawShimmerOrb = (c: CanvasRenderingContext2D, size: number, color: string) => {
      const r = size * 0.9;
      // Glowing halo gradient
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, color);
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, r, 0, Math.PI * 2);
      c.fill();

      // Sharp central pinpoint
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      c.fill();
    };

    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Render soft ambient Noor mist
      orbs.forEach((orb) => {
        orb.y += orb.speedY;
        if (orb.y - orb.radius > height) {
          orb.y = -orb.radius;
          orb.x = Math.random() * width;
        }
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, `rgba(254, 240, 138, ${orb.opacity})`);
        grad.addColorStop(0.5, `rgba(251, 191, 36, ${orb.opacity * 0.5})`);
        grad.addColorStop(1, 'rgba(254, 243, 199, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Render Raining & Twinkling Multi-Type Stars (ستاروں کی ۵ مختلف اقسام کی خوبصورت بارش)
      stars.forEach((s) => {
        s.y += s.speedY;
        s.x += s.speedX + Math.sin(time * s.swayFreq + s.swayOffset) * 0.45;
        s.rotation += s.rotSpeed;
        s.twinklePhase += s.twinkleSpeed;

        // Reset when star reaches bottom
        if (s.y - s.size * 2 > height) {
          s.y = -s.size * 2 - 10;
          s.x = Math.random() * width;
          s.speedY = 1.5 + Math.random() * 3.5;
        }

        // Twinkle luminance calculation
        const currentAlpha = Math.max(
          0.2,
          Math.min(1, s.opacity * (0.6 + 0.4 * Math.sin(s.twinklePhase)))
        );

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = currentAlpha;

        // Radiant glow
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 10 + s.size * 0.5;
        ctx.fillStyle = s.color;

        // Draw the specific star variant
        switch (s.variant) {
          case 'diamond':
            drawDiamondStar(ctx, s.size);
            break;
          case 'classic':
            drawClassicStar(ctx, s.size);
            break;
          case 'rub-el-hizb':
            drawRubElHizbStar(ctx, s.size);
            break;
          case 'nova-burst':
            drawNovaBurstStar(ctx, s.size);
            break;
          case 'shimmer-orb':
            drawShimmerOrb(ctx, s.size, s.color);
            break;
        }

        ctx.restore();
      });

      // 3. Occasional Shooting Star Across the Sky
      shootingTimer++;
      if (shootingTimer > 180 && !shootingStar.active && Math.random() < 0.06) {
        shootingStar = {
          x: Math.random() * width * 0.75,
          y: Math.random() * (height * 0.45),
          length: 80 + Math.random() * 90,
          speedX: 5.5 + Math.random() * 4.5,
          speedY: 3.2 + Math.random() * 3,
          opacity: 1,
          active: true,
        };
        shootingTimer = 0;
      }

      if (shootingStar.active) {
        shootingStar.x += shootingStar.speedX;
        shootingStar.y += shootingStar.speedY;
        shootingStar.opacity -= 0.022;

        if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar.active = false;
        } else {
          ctx.save();
          ctx.globalAlpha = shootingStar.opacity;
          const grad = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            shootingStar.x - shootingStar.length,
            shootingStar.y - shootingStar.length * 0.6
          );
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#fef08a');
          grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(
            shootingStar.x - shootingStar.length,
            shootingStar.y - shootingStar.length * 0.6
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
