import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  baseX: number; // percentage
  baseY: number; // percentage
  size: number; // px
  color: string;
  depth: number; // 0.2 to 1.0 (determines parallax strength)
  duration: number; // s
  delay: number; // s
}

export const SignalParticlesOverlay: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const currentOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 18 delicate, organic particles positioned around the hero environment
  const particles: Particle[] = useMemo(() => {
    const palette = ['#087B56', '#54D8C4', '#A7E8D3', '#F5C77D'];
    return [
      { id: 1, baseX: 18, baseY: 16, size: 3.5, color: palette[1], depth: 0.35, duration: 8.5, delay: 0 },
      { id: 2, baseX: 28, baseY: 28, size: 2.5, color: palette[0], depth: 0.6, duration: 11, delay: 1.2 },
      { id: 3, baseX: 14, baseY: 42, size: 4.0, color: palette[3], depth: 0.25, duration: 9.2, delay: 0.5 },
      { id: 4, baseX: 82, baseY: 18, size: 3.0, color: palette[2], depth: 0.45, duration: 10.4, delay: 2.1 },
      { id: 5, baseX: 74, baseY: 32, size: 4.5, color: palette[1], depth: 0.8, duration: 7.8, delay: 0.8 },
      { id: 6, baseX: 88, baseY: 46, size: 2.5, color: palette[3], depth: 0.3, duration: 12, delay: 1.5 },
      { id: 7, baseX: 22, baseY: 65, size: 3.5, color: palette[0], depth: 0.5, duration: 9.8, delay: 3.0 },
      { id: 8, baseX: 78, baseY: 62, size: 3.0, color: palette[2], depth: 0.7, duration: 8.9, delay: 1.7 },
      { id: 9, baseX: 35, baseY: 14, size: 2.0, color: palette[1], depth: 0.2, duration: 11.5, delay: 2.4 },
      { id: 10, baseX: 65, baseY: 15, size: 2.5, color: palette[3], depth: 0.4, duration: 10.1, delay: 0.3 },
      { id: 11, baseX: 12, baseY: 24, size: 3.0, color: palette[2], depth: 0.65, duration: 9.5, delay: 1.9 },
      { id: 12, baseX: 85, baseY: 38, size: 3.5, color: palette[0], depth: 0.55, duration: 8.2, delay: 2.8 },
      { id: 13, baseX: 32, baseY: 75, size: 2.5, color: palette[1], depth: 0.3, duration: 10.8, delay: 0.9 },
      { id: 14, baseX: 68, baseY: 72, size: 4.0, color: palette[3], depth: 0.75, duration: 9.0, delay: 1.4 },
      { id: 15, baseX: 50, baseY: 8, size: 2.5, color: palette[2], depth: 0.4, duration: 11.2, delay: 3.3 },
      { id: 16, baseX: 16, baseY: 55, size: 3.0, color: palette[1], depth: 0.5, duration: 8.7, delay: 0.6 },
      { id: 17, baseX: 80, baseY: 52, size: 3.5, color: palette[0], depth: 0.6, duration: 10.5, delay: 2.2 },
      { id: 18, baseX: 52, baseY: 82, size: 2.5, color: palette[3], depth: 0.35, duration: 9.7, delay: 1.1 },
    ];
  }, []);

  // Smooth pointer parallax with lerp
  useEffect(() => {
    if (shouldReduceMotion) return;

    const handlePointerMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 40; // Max 40px offset
      const y = (e.clientY / innerHeight - 0.5) * 35;
      targetOffsetRef.current = { x, y };
    };

    const updateParallax = () => {
      // Lerp current towards target for smooth fluid inertia
      currentOffsetRef.current.x += (targetOffsetRef.current.x - currentOffsetRef.current.x) * 0.05;
      currentOffsetRef.current.y += (targetOffsetRef.current.y - currentOffsetRef.current.y) * 0.05;

      setPointerOffset({
        x: currentOffsetRef.current.x,
        y: currentOffsetRef.current.y,
      });

      animFrameRef.current = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    animFrameRef.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 w-full h-full"
      aria-hidden="true"
    >
      {particles.map((p) => {
        const parallaxX = pointerOffset.x * p.depth;
        const parallaxY = pointerOffset.y * p.depth;

        return (
          <div
            key={p.id}
            className="absolute rounded-full transition-transform will-change-transform animate-float-pulse"
            style={{
              left: `${p.baseX}%`,
              top: `${p.baseY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              opacity: 0.55,
              transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
});

export default SignalParticlesOverlay;

