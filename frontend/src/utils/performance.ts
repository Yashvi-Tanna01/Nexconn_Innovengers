import { useState, useEffect, useRef } from 'react';

export type PerformanceTier = 'high' | 'balanced' | 'performance';

export interface PerformanceSettings {
  tier: PerformanceTier;
  fps: number;
  dpr: number;
  enableShadows: boolean;
  enableComplexMaterials: boolean;
  maxVehicles: number;
  maxBuildingDensity: number;
  isTabVisible: boolean;
}

// Global performance state singleton to prevent multiple frame measurement loops
class PerformanceEngine {
  private static instance: PerformanceEngine;
  private currentTier: PerformanceTier = 'high';
  private fps: number = 60;
  private isTabVisible: boolean = true;
  private listeners: Set<(settings: PerformanceSettings) => void> = new Set();
  private rafId: number | null = null;
  private frameTimes: number[] = [];
  private lastTime: number = performance.now();
  private isMobile: boolean = false;
  private lowFpsCounter: number = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      // Default baseline by device capability
      const cores = navigator.hardwareConcurrency || 4;
      const mem = (navigator as any).deviceMemory || 4;
      if (this.isMobile || cores <= 4 || mem <= 4) {
        this.currentTier = 'balanced';
      }

      // Page visibility listener (immediately pauses loops when tab is hidden)
      document.addEventListener('visibilitychange', () => {
        this.isTabVisible = !document.hidden;
        this.notify();
      });

      this.startMonitoring();
    }
  }

  public static getInstance(): PerformanceEngine {
    if (!PerformanceEngine.instance) {
      PerformanceEngine.instance = new PerformanceEngine();
    }
    return PerformanceEngine.instance;
  }

  private startMonitoring() {
    let frameCount = 0;
    let windowStartTime = performance.now();

    const loop = (now: number) => {
      frameCount++;
      const elapsed = now - windowStartTime;

      if (elapsed >= 1000) {
        this.fps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        windowStartTime = now;

        // Dynamic quality adaptation with hysteresis (requires 3 consecutive seconds of low FPS)
        if (this.fps < 38 && this.isTabVisible) {
          this.lowFpsCounter++;
          if (this.lowFpsCounter >= 3) {
            if (this.currentTier === 'high') {
              this.currentTier = 'balanced';
              this.notify();
            } else if (this.currentTier === 'balanced') {
              this.currentTier = 'performance';
              this.notify();
            }
            this.lowFpsCounter = 0;
          }
        } else if (this.fps >= 55) {
          this.lowFpsCounter = Math.max(0, this.lowFpsCounter - 1);
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  public getSettings(): PerformanceSettings {
    const isPerf = this.currentTier === 'performance';
    const isBal = this.currentTier === 'balanced';

    // DPR clamped carefully: high DPI mobile screens (>2.0) are clamped to 1.15
    const targetDpr = this.isMobile
      ? isPerf
        ? 1.0
        : 1.15
      : isPerf
      ? 1.0
      : isBal
      ? 1.25
      : Math.min(window.devicePixelRatio || 1.5, 1.5);

    return {
      tier: this.currentTier,
      fps: this.fps,
      dpr: targetDpr,
      enableShadows: this.currentTier === 'high',
      enableComplexMaterials: this.currentTier !== 'performance',
      maxVehicles: isPerf ? 4 : isBal ? 6 : 9,
      maxBuildingDensity: isPerf ? 36 : isBal ? 52 : 72,
      isTabVisible: this.isTabVisible,
    };
  }

  public subscribe(listener: (settings: PerformanceSettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSettings());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const settings = this.getSettings();
    this.listeners.forEach((listener) => listener(settings));
  }
}

export const usePerformanceSettings = (): PerformanceSettings => {
  const [settings, setSettings] = useState<PerformanceSettings>(() =>
    PerformanceEngine.getInstance().getSettings()
  );

  useEffect(() => {
    return PerformanceEngine.getInstance().subscribe(setSettings);
  }, []);

  return settings;
};

