import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Wedding3DSceneProps {
  className?: string;
  variant?: 'hero' | 'door-reveal';
  showRings?: boolean;
}

export const Wedding3DScene: React.FC<Wedding3DSceneProps> = ({
  className = '',
  variant = 'hero',
  showRings = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, variant === 'door-reveal' ? 9 : 8);

    // 2. WebGL Renderer with High Performance & Anti-Aliasing
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    // 3. Lighting Setup for Majestic Golden Reflections
    const ambientLight = new THREE.AmbientLight(0xfff3d6, 1.4);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xffe699, 3.2);
    goldKeyLight.position.set(5, 8, 7);
    scene.add(goldKeyLight);

    const warmFillLight = new THREE.DirectionalLight(0xff9955, 1.8);
    warmFillLight.position.set(-6, -4, 4);
    scene.add(warmFillLight);

    const blueBackLight = new THREE.DirectionalLight(0x88ccff, 1.6);
    blueBackLight.position.set(0, -6, -5);
    scene.add(blueBackLight);

    // Orbiting sparkle light point
    const sparkleLight = new THREE.PointLight(0xffffff, 4, 15);
    sparkleLight.position.set(0, 2, 4);
    scene.add(sparkleLight);

    // 4. Main 3D Wedding Motif: Interlocked Golden Wedding Rings
    const ringsGroup = new THREE.Group();

    if (showRings) {
      // Luxurious Gold Material
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5c542,
        metalness: 0.94,
        roughness: 0.14,
        envMapIntensity: 1.5,
      });

      const whiteGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffeedd,
        metalness: 0.95,
        roughness: 0.12,
      });

      // Ring 1 (Groom's Classic Royal Band)
      const groomRingGeo = new THREE.TorusGeometry(1.6, 0.22, 32, 64);
      const groomRing = new THREE.Mesh(groomRingGeo, goldMaterial);
      groomRing.position.set(-0.7, 0.1, -0.2);
      groomRing.rotation.set(Math.PI / 3, Math.PI / 6, 0);
      ringsGroup.add(groomRing);

      // Ring 2 (Bride's Ornate Diamond Solitaire Band)
      const brideRingGeo = new THREE.TorusGeometry(1.4, 0.18, 32, 64);
      const brideRing = new THREE.Mesh(brideRingGeo, whiteGoldMaterial);
      brideRing.position.set(0.7, -0.1, 0.2);
      brideRing.rotation.set(Math.PI / 4, -Math.PI / 4, Math.PI / 8);
      ringsGroup.add(brideRing);

      // Solitaire Crown Mount
      const mountGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.35, 8);
      const mount = new THREE.Mesh(mountGeo, goldMaterial);
      mount.position.set(0, 1.45, 0);
      brideRing.add(mount);

      // Sparkling Faceted 3D Diamond
      const diamondGeo = new THREE.OctahedronGeometry(0.38, 0);
      const diamondMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.02,
        transmission: 0.88,
        ior: 2.4,
        transparent: true,
        opacity: 0.95,
        reflectivity: 0.95,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMaterial);
      diamond.position.set(0, 0.22, 0);
      diamond.rotation.y = Math.PI / 4;
      mount.add(diamond);

      // Subtle celestial halo ring
      const haloGeo = new THREE.RingGeometry(2.4, 2.45, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      ringsGroup.add(halo);

      // Secondary decorative halo
      const halo2Geo = new THREE.RingGeometry(2.8, 2.83, 64);
      const halo2Mat = new THREE.MeshBasicMaterial({
        color: 0xffeaa7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const halo2 = new THREE.Mesh(halo2Geo, halo2Mat);
      halo2.rotation.y = Math.PI / 3;
      ringsGroup.add(halo2);

      // Adjust group position depending on variant
      if (variant === 'hero') {
        ringsGroup.position.set(0, 0.3, 0);
        ringsGroup.scale.set(1.05, 1.05, 1.05);
      } else {
        ringsGroup.position.set(0, 0.2, 0);
        ringsGroup.scale.set(0.9, 0.9, 0.9);
      }

      scene.add(ringsGroup);
    }

    // 5. 3D Floating Rose Petals (Curved realistic petals falling & spinning)
    const petalsCount = variant === 'hero' ? 45 : 30;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.2, 0.3, 0.35, 0.8, 0, 1.1);
    petalShape.bezierCurveTo(-0.35, 0.8, -0.2, 0.3, 0, 0);

    const petalGeometry = new THREE.ShapeGeometry(petalShape, 12);

    // Deep crimson and velvety pink materials for rose petals
    const petalMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0xc01525,
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xe63946,
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xd90429,
        roughness: 0.45,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xff758f,
        roughness: 0.3,
        metalness: 0.08,
        side: THREE.DoubleSide,
      }),
    ];

    interface PetalData {
      mesh: THREE.Mesh;
      speedY: number;
      speedX: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      swayOffset: number;
      swaySpeed: number;
    }

    const petals: PetalData[] = [];
    const petalGroup = new THREE.Group();

    for (let i = 0; i < petalsCount; i++) {
      const mat = petalMaterials[i % petalMaterials.length];
      const mesh = new THREE.Mesh(petalGeometry, mat);

      const scale = 0.28 + Math.random() * 0.25;
      mesh.scale.set(scale, scale, scale);

      mesh.position.set(
        (Math.random() - 0.5) * 14,
        Math.random() * 14 - 7,
        (Math.random() - 0.5) * 8
      );

      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      petalGroup.add(mesh);
      petals.push({
        mesh,
        speedY: 0.015 + Math.random() * 0.025,
        speedX: (Math.random() - 0.5) * 0.008,
        rotSpeedX: 0.01 + Math.random() * 0.02,
        rotSpeedY: 0.01 + Math.random() * 0.02,
        rotSpeedZ: 0.008 + Math.random() * 0.015,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 1 + Math.random() * 2,
      });
    }
    scene.add(petalGroup);

    // 6. Shimmering Golden Dust Particles in 3D Space
    const particlesCount = variant === 'hero' ? 220 : 140;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Gold & Warm Ivory Sparkles
      const isGold = Math.random() > 0.3;
      particleColors[i * 3] = isGold ? 1.0 : 0.98;
      particleColors[i * 3 + 1] = isGold ? 0.84 : 0.95;
      particleColors[i * 3 + 2] = isGold ? 0.35 : 0.85;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle texture (soft radial glow dot)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 220, 120, 0.8)');
      grad.addColorStop(0.8, 'rgba(212, 175, 55, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Mouse / Gyro Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX * 1.5;
      camera.position.y = mouseY * 1.2;
      camera.lookAt(0, 0, 0);

      // Rotate 3D Wedding Rings with Elegant Dual Wobble
      if (showRings) {
        ringsGroup.rotation.y = elapsedTime * 0.35 + mouseX * 0.5;
        ringsGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15 + mouseY * 0.4;
        ringsGroup.rotation.z = Math.cos(elapsedTime * 0.3) * 0.08;
        ringsGroup.position.y = (variant === 'hero' ? 0.3 : 0.2) + Math.sin(elapsedTime * 0.8) * 0.12;

        // Sparkle light orbiting the diamond
        sparkleLight.position.x = Math.sin(elapsedTime * 1.5) * 3;
        sparkleLight.position.y = Math.cos(elapsedTime * 1.2) * 2 + 1;
        sparkleLight.position.z = Math.sin(elapsedTime * 2) * 2 + 3;
      }

      // Animate Falling Rose Petals
      petals.forEach((petal) => {
        petal.mesh.position.y -= petal.speedY;
        petal.mesh.position.x += Math.sin(elapsedTime * petal.swaySpeed + petal.swayOffset) * 0.008;

        petal.mesh.rotation.x += petal.rotSpeedX;
        petal.mesh.rotation.y += petal.rotSpeedY;
        petal.mesh.rotation.z += petal.rotSpeedZ;

        // Reset petal if fallen below screen
        if (petal.mesh.position.y < -7) {
          petal.mesh.position.y = 7;
          petal.mesh.position.x = (Math.random() - 0.5) * 14;
        }
      });

      // Animate Golden Dust Particles
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = Math.sin(elapsedTime * 0.04) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer for exact 100% width & 100% height
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      particleTexture.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      petalGeometry.dispose();
      petalMaterials.forEach((m) => m.dispose());
    };
  }, [variant, showRings]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
