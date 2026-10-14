"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface HeroGlassSceneProps {
  className?: string;
}

/**
 * 3D Hero Glass Scene
 * Real-time Three.js scene featuring floating, optical glass panels and film frames
 * with soft studio lighting and cursor parallax. Lazy-loads with smooth fallback.
 */
export function HeroGlassScene({ className = "" }: HeroGlassSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check for mobile or low-power or reduced-motion
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isMobile || prefersReducedMotion) {
        setIsSupported(false);
        return;
      }
    }

    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090b, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setIsSupported(false);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLightLime = new THREE.DirectionalLight(0xd8fd38, 2.2);
    dirLightLime.position.set(5, 6, 4);
    scene.add(dirLightLime);

    const dirLightCoral = new THREE.DirectionalLight(0xff6842, 1.8);
    dirLightCoral.position.set(-6, -4, 3);
    scene.add(dirLightCoral);

    const pointLightIce = new THREE.PointLight(0x38f2c7, 1.5, 12);
    pointLightIce.position.set(0, 2, 2);
    scene.add(pointLightIce);

    // 3. Glass Materials & Floating Plates
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a2128,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.88,
      thickness: 1.2,
      ior: 1.52,
      reflectivity: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.92,
    });

    const limeEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8fd38,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xd8fd38,
      emissiveIntensity: 0.25,
    });

    const coralEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6842,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xff6842,
      emissiveIntensity: 0.2,
    });

    // Group for orbiting panels
    const group = new THREE.Group();
    scene.add(group);

    // Create 5 floating glass plates with rounded aspect
    const plates: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number; z: number }; initialY: number }[] = [];
    const plateGeom = new THREE.BoxGeometry(2.2, 1.35, 0.08);

    const plateConfigs = [
      { pos: [-1.8, 0.4, 0.8], rot: [0.15, 0.4, -0.05], mat: glassMaterial, edgeMat: limeEdgeMaterial },
      { pos: [1.9, -0.2, 0.5], rot: [-0.1, -0.35, 0.1], mat: glassMaterial, edgeMat: coralEdgeMaterial },
      { pos: [0.1, 1.2, -0.6], rot: [0.2, 0.1, 0.08], mat: glassMaterial, edgeMat: limeEdgeMaterial },
      { pos: [-0.6, -1.3, -0.3], rot: [-0.15, -0.2, -0.1], mat: glassMaterial, edgeMat: coralEdgeMaterial },
      { pos: [2.2, 1.5, -1.2], rot: [0.3, -0.5, 0.15], mat: glassMaterial, edgeMat: limeEdgeMaterial },
    ];

    plateConfigs.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(plateGeom, cfg.mat);
      mesh.position.set(cfg.pos[0]!, cfg.pos[1]!, cfg.pos[2]!);
      mesh.rotation.set(cfg.rot[0]!, cfg.rot[1]!, cfg.rot[2]!);
      group.add(mesh);

      // Add a fine decorative wireframe edge or border line
      const edges = new THREE.EdgesGeometry(plateGeom);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0xd8fd38 : 0xff6842,
          transparent: true,
          opacity: 0.35,
        })
      );
      mesh.add(line);

      plates.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.003,
          y: (Math.random() - 0.5) * 0.004,
          z: (Math.random() - 0.5) * 0.002,
        },
        initialY: cfg.pos[1]!,
      });
    });

    // 4. Cursor tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetMouseX = (e.clientX / innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      group.rotation.y = currentMouseX * 0.35;
      group.rotation.x = currentMouseY * 0.25;

      plates.forEach((p, i) => {
        p.mesh.rotation.x += p.rotSpeed.x;
        p.mesh.rotation.y += p.rotSpeed.y;
        p.mesh.position.y = p.initialY + Math.sin(elapsedTime * 0.8 + i) * 0.08;
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    // 6. Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      plateGeom.dispose();
      glassMaterial.dispose();
      limeEdgeMaterial.dispose();
      coralEdgeMaterial.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[420px] select-none ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isReady && isSupported ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Fallback & Poster State */}
      {(!isReady || !isSupported) && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-lg aspect-video rounded-3xl glass-regular p-8 flex flex-col justify-between border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                OPTICAL DAG MATRIX
              </span>
              <span className="text-xs text-content-muted font-mono">01 // REPRODUCIBLE</span>
            </div>
            <div>
              <h3 className="text-2xl font-light text-white tracking-tight">
                Generative Studio <span className="font-serif italic font-normal text-white">Behind Glass</span>
              </h3>
              <p className="text-xs text-content-muted mt-2">
                Deterministic ComfyUI graph handovers with character-consistent LoRA checkpoints.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
