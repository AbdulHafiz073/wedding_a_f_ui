import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WaterRippleEffectProps {
  className?: string;
  enableInteraction?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  strength: number;
}

export const WaterRippleEffect: React.FC<WaterRippleEffectProps> = ({
  className = '',
  enableInteraction = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastInteractionTimeRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Orthographic Camera for Full-Screen Quad
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // 2. WebGL Renderer with High Performance
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    // 3. Max ripples supported by shader
    const MAX_RIPPLES = 24;
    const rippleData = new Float32Array(MAX_RIPPLES * 4);

    // Helper to add a new ripple
    const addRipple = (normX: number, normY: number, strength = 1.0) => {
      const now = performance.now() * 0.001;
      ripplesRef.current.push({
        x: normX,
        y: 1.0 - normY, // Invert Y for GLSL coordinate system (0,0 is bottom-left)
        startTime: now,
        strength: Math.min(2.5, Math.max(0.4, strength))
      });

      // Keep only recent active ripples
      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.shift();
      }
    };

    // Seed 2 initial calm welcoming ripples
    addRipple(0.5, 0.45, 1.4);
    setTimeout(() => addRipple(0.35, 0.55, 1.0), 400);
    setTimeout(() => addRipple(0.65, 0.4, 1.2), 900);

    // 4. Custom Water Ripple Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec4 u_ripples[24];
      uniform int u_ripple_count;

      varying vec2 vUv;

      // Calculate compound water height at UV
      float getWaterHeight(vec2 uv) {
        float h = 0.0;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2(uv.x * aspect, uv.y);

        // A. Subtle serene ambient fluid swell (breathing ocean motion)
        h += sin(uv.x * 10.0 + u_time * 0.9) * cos(uv.y * 8.0 + u_time * 0.7) * 0.012;
        h += sin((uv.x + uv.y) * 14.0 - u_time * 1.2) * 0.009;
        h += cos(length(uv - vec2(0.5, 0.45)) * 12.0 - u_time * 0.7) * 0.01;

        // B. Dynamic propagating water ripples
        for (int i = 0; i < 24; i++) {
          if (i >= u_ripple_count) break;
          vec4 rip = u_ripples[i];
          float age = u_time - rip.z;
          if (age <= 0.0 || age > 4.5) continue;

          vec2 ripPos = vec2(rip.x * aspect, rip.y);
          float dist = length(p - ripPos);

          // Wave propagation parameters
          float speed = 0.36; // Wave expansion speed
          float waveRadius = age * speed;
          float distDiff = dist - waveRadius;

          // Wave envelope width expands slightly as ripple ages
          float waveWidth = 0.12 + age * 0.04;
          if (abs(distDiff) < waveWidth) {
            // Decay over time and radial distance
            float decay = exp(-age * 1.05) / (1.0 + dist * 2.8);
            // Smooth cosine-shaped wave crest & trough
            float envelope = smoothstep(waveWidth, 0.0, abs(distDiff));
            float wave = sin(distDiff * 48.0) * envelope * rip.w * decay;
            h += wave * 0.09;
          }
        }
        return h;
      }

      void main() {
        vec2 uv = vUv;

        // Surface normal via central differences
        float eps = 0.003;
        float hL = getWaterHeight(uv - vec2(eps, 0.0));
        float hR = getWaterHeight(uv + vec2(eps, 0.0));
        float hD = getWaterHeight(uv - vec2(0.0, eps));
        float hU = getWaterHeight(uv + vec2(0.0, eps));
        float hCenter = getWaterHeight(uv);

        vec3 normal = normalize(vec3((hL - hR) / (2.0 * eps), (hD - hU) / (2.0 * eps), 1.0));

        // Refracted background UV coordinates
        vec2 refractedUv = uv + normal.xy * 0.055;

        // Deep Royal Islamic Color Palette
        vec3 deepNavy = vec3(0.024, 0.082, 0.145);      // #061525 (Abyssal Navy)
        vec3 midOcean = vec3(0.055, 0.185, 0.295);      // #0e2f4b (Majestic Royal Blue)
        vec3 tealLagoon = vec3(0.06, 0.38, 0.44);       // #0f6170 (Crystalline Teal Depth)
        vec3 emeraldGlint = vec3(0.08, 0.52, 0.42);     // #14856b (Noorani Emerald Glimmer)

        // Radial depth gradient centered around couple names
        float centerDist = length(refractedUv - vec2(0.5, 0.42));
        vec3 waterBase = mix(midOcean, deepNavy, smoothstep(0.12, 0.85, centerDist));
        waterBase = mix(waterBase, tealLagoon, hCenter * 2.2);

        // Submerged caustic shimmer pattern moving with the water
        float c1 = sin(refractedUv.x * 32.0 + u_time * 0.8) * sin(refractedUv.y * 32.0 + u_time * 0.6);
        float c2 = cos((refractedUv.x + refractedUv.y) * 40.0 - u_time * 1.0);
        float caustic = pow(clamp(c1 + c2, 0.0, 1.0), 3.5) * 0.22;
        vec3 causticColor = mix(vec3(0.2, 0.7, 0.85), vec3(0.95, 0.82, 0.4), 0.3) * caustic;

        // Lighting Vectors
        vec3 sunLight = normalize(vec3(0.45, 0.75, 0.55));    // Celestial warm gold key light
        vec3 moonLight = normalize(vec3(-0.4, -0.5, 0.6));   // Cool silver-blue ambient fill light
        vec3 eyeDir = vec3(0.0, 0.0, 1.0);

        // Specular 1: Warm Golden Celestial Sparkle (Chandelier / Sunlight Reflection)
        vec3 halfSun = normalize(sunLight + eyeDir);
        float specSun = pow(max(0.0, dot(normal, halfSun)), 38.0);
        float specSunGlitter = pow(max(0.0, dot(normal, halfSun)), 160.0);
        vec3 goldSpec = vec3(1.0, 0.84, 0.42) * specSun * 1.7 + vec3(1.0, 0.98, 0.92) * specSunGlitter * 3.2;

        // Specular 2: Soft Silver-Blue Starlight Reflection
        vec3 halfMoon = normalize(moonLight + eyeDir);
        float specMoon = pow(max(0.0, dot(normal, halfMoon)), 22.0);
        vec3 blueSpec = vec3(0.5, 0.8, 1.0) * specMoon * 0.6;

        // Wave slope highlights (crisp liquid wave edges)
        float slope = length(normal.xy);
        vec3 crestGlint = vec3(1.0, 0.9, 0.65) * pow(slope * 4.2, 3.2) * 0.35;

        // Realistic Fresnel Effect (Water edge reflectivity)
        float fresnel = pow(1.0 - max(0.0, dot(normal, eyeDir)), 3.2);
        vec3 fresnelColor = mix(vec3(0.1, 0.45, 0.65), vec3(0.9, 0.8, 0.5), 0.3) * fresnel * 0.7;

        // Composite Final Water Surface Color
        vec3 finalColor = waterBase + causticColor + goldSpec + blueSpec + crestGlint + fresnelColor;

        // Vignette around edges
        float vignette = smoothstep(1.3, 0.45, length(uv - vec2(0.5, 0.5)));
        finalColor *= mix(0.78, 1.0, vignette);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const planeGeo = new THREE.PlaneGeometry(2, 2);
    const planeMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 },
        u_ripples: { value: rippleData },
        u_ripple_count: { value: 0 }
      },
      depthWrite: false,
      depthTest: false
    });

    const waterMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(waterMesh);

    // 5. Floating Water Elements (Subtle Jasmine Petals & Golden Sparkles)
    const petalsCanvas = document.createElement('canvas');
    petalsCanvas.width = 64;
    petalsCanvas.height = 64;
    const pCtx = petalsCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#ffffff';
      pCtx.beginPath();
      pCtx.ellipse(32, 32, 24, 13, Math.PI / 4, 0, Math.PI * 2);
      pCtx.fill();
      // Petal vein
      pCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      pCtx.lineWidth = 1.5;
      pCtx.beginPath();
      pCtx.moveTo(14, 14);
      pCtx.lineTo(50, 50);
      pCtx.stroke();
    }
    const petalTexture = new THREE.CanvasTexture(petalsCanvas);

    // Floating Jasmine & Rose Petals on Water
    const petalCount = 20;
    const petalGeometry = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalScales = new Float32Array(petalCount);
    const petalColors = new Float32Array(petalCount * 3);

    interface FloatingPetal {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      angle: number;
      vAngle: number;
    }

    const floatingPetals: FloatingPetal[] = [];
    for (let i = 0; i < petalCount; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      petalPositions[i * 3] = x;
      petalPositions[i * 3 + 1] = y;
      petalPositions[i * 3 + 2] = 0.01; // Slightly above water

      const isRose = Math.random() > 0.6;
      if (isRose) {
        petalColors[i * 3] = 0.9;
        petalColors[i * 3 + 1] = 0.2;
        petalColors[i * 3 + 2] = 0.3;
      } else {
        // Jasmine white
        petalColors[i * 3] = 0.98;
        petalColors[i * 3 + 1] = 0.98;
        petalColors[i * 3 + 2] = 0.92;
      }

      floatingPetals.push({
        x,
        y,
        size: 0.05 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0003 - Math.random() * 0.0005,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.01
      });
    }

    petalGeometry.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    petalGeometry.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

    const petalMaterial = new THREE.PointsMaterial({
      size: 0.08,
      map: petalTexture,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      depthWrite: false
    });

    const petalPoints = new THREE.Points(petalGeometry, petalMaterial);
    scene.add(petalPoints);

    // 6. Automatic Ambient Raindrops (creates natural tranquil ripples periodically)
    let autoDropTimer: number;
    const scheduleNextDrop = () => {
      const delay = 1400 + Math.random() * 1800; // Drop every ~1.4 - 3.2s
      autoDropTimer = window.setTimeout(() => {
        // Random location in central viewing area
        const rx = 0.15 + Math.random() * 0.7;
        const ry = 0.15 + Math.random() * 0.7;
        const rStrength = 0.7 + Math.random() * 0.8;
        addRipple(rx, ry, rStrength);
        scheduleNextDrop();
      }, delay);
    };
    scheduleNextDrop();

    // 7. Interactive Pointer Listeners (Mouse move, Touch, Click)
    const handlePointerInteraction = (clientX: number, clientY: number, strength = 1.0, force = false) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width;
      const normY = (clientY - rect.top) / rect.height;

      if (normX < 0 || normX > 1 || normY < 0 || normY > 1) return;

      const now = performance.now();
      const dx = normX - lastPosRef.current.x;
      const dy = normY - lastPosRef.current.y;
      const distMoved = Math.sqrt(dx * dx + dy * dy);

      // Throttle mouse movement to avoid saturating ripple buffer
      if (force || now - lastInteractionTimeRef.current > 70 || distMoved > 0.04) {
        lastInteractionTimeRef.current = now;
        lastPosRef.current = { x: normX, y: normY };
        addRipple(normX, normY, strength);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!enableInteraction) return;
      handlePointerInteraction(e.clientX, e.clientY, 0.7, false);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!enableInteraction) return;
      handlePointerInteraction(e.clientX, e.clientY, 1.8, true);
    };

    // Attach to window or parent section so interaction feels instant everywhere in hero
    const heroSection = document.getElementById('hero') || container;
    heroSection.addEventListener('pointermove', onPointerMove as EventListener, { passive: true });
    heroSection.addEventListener('pointerdown', onPointerDown as EventListener, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      planeMat.uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Main Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Filter expired ripples and upload to shader
      const validRipples = ripplesRef.current.filter(
        (r) => elapsedTime - r.startTime < 4.5
      );
      ripplesRef.current = validRipples;

      // Pack active ripples into Float32Array
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (i < validRipples.length) {
          const r = validRipples[i];
          rippleData[i * 4] = r.x;
          rippleData[i * 4 + 1] = r.y;
          rippleData[i * 4 + 2] = r.startTime;
          rippleData[i * 4 + 3] = r.strength;
        } else {
          rippleData[i * 4] = 0;
          rippleData[i * 4 + 1] = 0;
          rippleData[i * 4 + 2] = -999;
          rippleData[i * 4 + 3] = 0;
        }
      }

      planeMat.uniforms.u_time.value = elapsedTime;
      planeMat.uniforms.u_ripple_count.value = validRipples.length;

      // Slowly drift floating petals with water current
      const posAttr = petalGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < petalCount; i++) {
        const p = floatingPetals[i];
        p.x += p.vx + Math.sin(elapsedTime * 0.8 + i) * 0.0003;
        p.y += p.vy;

        // Wrap around screen boundaries
        if (p.y < -1.1) p.y = 1.1;
        if (p.x < -1.1) p.x = 1.1;
        if (p.x > 1.1) p.x = -1.1;

        posAttr.setXY(i, p.x, p.y);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(autoDropTimer);
      heroSection.removeEventListener('pointermove', onPointerMove as EventListener);
      heroSection.removeEventListener('pointerdown', onPointerDown as EventListener);
      cancelAnimationFrame(animId);

      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      petalGeometry.dispose();
      petalMaterial.dispose();
      petalTexture.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [enableInteraction]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
