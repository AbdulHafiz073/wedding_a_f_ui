import React, { useEffect, useRef } from 'react';

interface PetalOrLeaf {
  x: number;
  y: number;
  size: number;
  type: 'red_petal' | 'pink_petal' | 'dark_petal' | 'rose_leaf' | 'gold_dust';
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmount: number;
  swayOffset: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  opacity: number;
  curl: number;
}

interface RoseLeavesRainProps {
  className?: string;
  count?: number;
  interactive?: boolean;
}

export const RoseLeavesRain: React.FC<RoseLeavesRainProps> = ({
  className = '',
  count = 55,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width && entry.contentRect.height) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const types: PetalOrLeaf['type'][] = [
      'red_petal',
      'red_petal',
      'pink_petal',
      'dark_petal',
      'rose_leaf',
      'rose_leaf',
      'gold_dust'
    ];

    const createParticle = (initialY?: number): PetalOrLeaf => {
      const type = types[Math.floor(Math.random() * types.length)];
      const isLeaf = type === 'rose_leaf';
      const isDust = type === 'gold_dust';

      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        size: isDust
          ? Math.random() * 2.5 + 1.5
          : isLeaf
          ? Math.random() * 12 + 14
          : Math.random() * 14 + 12,
        type,
        speedY: isDust ? Math.random() * 0.6 + 0.4 : isLeaf ? Math.random() * 1.1 + 0.8 : Math.random() * 1.3 + 0.9,
        speedX: (Math.random() - 0.5) * 0.6,
        swaySpeed: Math.random() * 0.02 + 0.015,
        swayAmount: isDust ? Math.random() * 0.8 + 0.5 : Math.random() * 2.2 + 1.2,
        swayOffset: Math.random() * Math.PI * 2,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.035,
        rotSpeedY: (Math.random() - 0.5) * 0.035,
        rotSpeedZ: (Math.random() - 0.5) * 0.025,
        opacity: isDust ? Math.random() * 0.5 + 0.3 : Math.random() * 0.35 + 0.65,
        curl: Math.random() * 0.3 + 0.85
      };
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const actualCount = isMobile ? Math.min(count, 22) : Math.min(count, 45);
    const particles: PetalOrLeaf[] = [];
    for (let i = 0; i < actualCount; i++) {
      particles.push(createParticle());
    }

    // Draw realistic Rose Petal
    const drawPetal = (
      p: PetalOrLeaf,
      scaleX: number,
      scaleY: number,
      color1: string,
      color2: string,
      colorEdge: string
    ) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotZ);
      ctx.scale(scaleX, scaleY);

      ctx.beginPath();
      // Natural organic heart/teardrop curved petal shape
      ctx.moveTo(0, -p.size * 0.9);
      ctx.bezierCurveTo(
        p.size * 0.85, -p.size * 0.85,
        p.size * 0.95, p.size * 0.4,
        0, p.size * 0.95
      );
      ctx.bezierCurveTo(
        -p.size * 0.95, p.size * 0.4,
        -p.size * 0.85, -p.size * 0.85,
        0, -p.size * 0.9
      );
      ctx.closePath();

      // Rich gradient
      const grad = ctx.createRadialGradient(0, -p.size * 0.2, p.size * 0.1, 0, 0, p.size);
      grad.addColorStop(0, color1);
      grad.addColorStop(0.7, color2);
      grad.addColorStop(1, colorEdge);

      ctx.fillStyle = grad;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // Petal center gentle crease / highlight
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.65);
      ctx.quadraticCurveTo(p.size * 0.1, 0, 0, p.size * 0.7);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    // Draw realistic Green Rose Leaf
    const drawLeaf = (p: PetalOrLeaf, scaleX: number, scaleY: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotZ);
      ctx.scale(scaleX, scaleY);

      ctx.shadowColor = 'rgba(20, 50, 25, 0.12)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;

      // Elliptical pointed rose leaf
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.1);
      // Right serrated lobe
      ctx.bezierCurveTo(
        p.size * 0.75, -p.size * 0.5,
        p.size * 0.7, p.size * 0.5,
        0, p.size * 1.05
      );
      // Left serrated lobe
      ctx.bezierCurveTo(
        -p.size * 0.7, p.size * 0.5,
        -p.size * 0.75, -p.size * 0.5,
        0, -p.size * 1.1
      );
      ctx.closePath();

      // Lush emerald & forest rose leaf gradient
      const leafGrad = ctx.createLinearGradient(0, -p.size, 0, p.size);
      leafGrad.addColorStop(0, '#5a9e67');
      leafGrad.addColorStop(0.5, '#2e7d42');
      leafGrad.addColorStop(1, '#1b5e29');

      ctx.fillStyle = leafGrad;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // Central Leaf Vein (Primary Rib)
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.95);
      ctx.lineTo(0, p.size * 0.9);
      ctx.strokeStyle = 'rgba(180, 230, 190, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Side Veins (Secondary Ribs)
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(180, 230, 190, 0.35)';
      for (let v = -0.5; v <= 0.5; v += 0.3) {
        const vy = v * p.size;
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.lineTo(p.size * 0.45, vy - p.size * 0.2);
        ctx.moveTo(0, vy);
        ctx.lineTo(-p.size * 0.45, vy - p.size * 0.2);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw Golden Stardust speckle
    const drawDust = (p: PetalOrLeaf) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(235, 185, 75, ' + p.opacity + ')';
      ctx.fill();
      ctx.restore();
    };

    let time = 0;
    let lastFrameTime = performance.now();
    const targetFpsInterval = 1000 / 35; // 35 FPS cap

    const render = (timestamp: number) => {
      if (!isVisible) return;

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < targetFpsInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = timestamp - (elapsed % targetFpsInterval);

      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics: Swaying with sinusoidal wind
        p.swayOffset += p.swaySpeed;
        const windSway = Math.sin(p.swayOffset) * p.swayAmount;
        p.x += p.speedX + windSway * 0.6;
        p.y += p.speedY;

        // 3D rotation steps
        p.rotX += p.rotSpeedX;
        p.rotY += p.rotSpeedY;
        p.rotZ += p.rotSpeedZ;

        // 3D projected scale ratios
        const scaleX = Math.cos(p.rotX) * p.curl;
        const scaleY = Math.sin(p.rotY);

        // Render based on type
        if (p.type === 'red_petal') {
          drawPetal(p, scaleX, scaleY, '#ff4757', '#c02737', '#7b0818');
        } else if (p.type === 'pink_petal') {
          drawPetal(p, scaleX, scaleY, '#ff9ebb', '#e84393', '#b31e59');
        } else if (p.type === 'dark_petal') {
          drawPetal(p, scaleX, scaleY, '#d63031', '#961524', '#590611');
        } else if (p.type === 'rose_leaf') {
          drawLeaf(p, scaleX, scaleY);
        } else if (p.type === 'gold_dust') {
          drawDust(p);
        }

        // Loop / Wrap around when reaching bottom
        if (p.y > height + 30) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x < -40) p.x = width + 30;
        if (p.x > width + 40) p.x = -30;
      }

      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    let isVisible = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (isVisible) {
        lastFrameTime = performance.now();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          lastFrameTime = performance.now();
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(render);
        } else if (!isVisible) {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05, rootMargin: '60px' }
    );

    if (canvas.parentElement) {
      intersectionObserver.observe(canvas.parentElement);
    } else {
      intersectionObserver.observe(canvas);
    }

    // Optional click handler to shower petals
    const handleCanvasClick = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Add a burst of 6 petals at click position
      for (let k = 0; k < 6; k++) {
        const fresh = createParticle(clickY + (Math.random() - 0.5) * 40);
        fresh.x = clickX + (Math.random() - 0.5) * 60;
        fresh.speedY = Math.random() * 2 + 1;
        fresh.speedX = (Math.random() - 0.5) * 2;
        particles.push(fresh);
        if (particles.length > actualCount + 12) {
          particles.shift();
        }
      }
    };

    if (interactive) {
      canvas.addEventListener('click', handleCanvasClick);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (interactive) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [count, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
      style={{ display: 'block' }}
    />
  );
};
