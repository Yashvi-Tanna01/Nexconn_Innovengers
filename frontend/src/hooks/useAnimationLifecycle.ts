import { useState, useEffect, useRef, useCallback } from 'react';

export interface AnimationStage<TPhase extends string = string> {
  phase: TPhase;
  durationMs: number;
  label?: string;
  statusMessage?: string;
}

export interface UseAnimationLifecycleOptions<TPhase extends string = string> {
  stages: AnimationStage<TPhase>[];
  autoStart?: boolean;
  onPhaseChange?: (phase: TPhase, index: number) => void;
  onComplete?: () => void;
  loop?: boolean;
}

export interface AnimationLifecycleController<TPhase extends string = string> {
  phase: TPhase;
  phaseIndex: number;
  currentStage: AnimationStage<TPhase>;
  progress: number; // 0.0 to 1.0 overall progress
  stageProgress: number; // 0.0 to 1.0 within current stage
  isPlaying: boolean;
  isComplete: boolean;
  cycleId: number; // Increments on every start/restart to force fresh DOM keying
  start: () => void;
  restart: () => void;
  skip: () => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * useAnimationLifecycle:
 * A production-grade, reusable animation lifecycle controller.
 * 
 * Supports:
 * - Starting, restarting, pausing, resuming, skipping, and cancelling multi-phase animations
 * - Staged sequential execution with exact cumulative progress calculations
 * - Clean cleanup on component unmount (no memory leaks or dangling frame loops)
 * - Cycle IDs (`cycleId`) that increment on restart so Framer Motion / SVG components can key-refresh
 * - Prevents duplicate animation loops through single-source RAF/timer synchronization
 */
export function useAnimationLifecycle<TPhase extends string = string>({
  stages,
  autoStart = true,
  onPhaseChange,
  onComplete,
  loop = false,
}: UseAnimationLifecycleOptions<TPhase>): AnimationLifecycleController<TPhase> {
  if (!stages || stages.length === 0) {
    throw new Error('useAnimationLifecycle requires at least one stage');
  }

  const [cycleId, setCycleId] = useState<number>(1);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoStart);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageProgress, setStageProgress] = useState<number>(0);

  // Total sequence duration in ms
  const totalDurationMs = stages.reduce((acc, s) => acc + s.durationMs, 0);

  // Cumulative start times for each stage
  const stageStarts = useRef<number[]>([]);
  stageStarts.current = stages.reduce<number[]>((acc, s, idx) => {
    if (idx === 0) {
      acc.push(0);
    } else {
      acc.push(acc[idx - 1] + stages[idx - 1].durationMs);
    }
    return acc;
  }, []);

  // Tracking refs to manage RAF and time without triggering re-render storms
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cleanup helper
  const cancelLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Main tick function running on requestAnimationFrame
  const tick = useCallback(
    (now: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }

      const elapsed = Math.max(0, now - startTimeRef.current);

      if (elapsed >= totalDurationMs) {
        setProgress(1);
        setStageProgress(1);
        setPhaseIndex(stages.length - 1);
        setIsComplete(true);
        cancelLoop();

        if (onCompleteRef.current) {
          onCompleteRef.current();
        }

        if (loop) {
          startTimeRef.current = now;
          setCycleId((prev) => prev + 1);
          setIsComplete(false);
          setProgress(0);
          setStageProgress(0);
          setPhaseIndex(0);
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          setIsPlaying(false);
        }
        return;
      }

      // Calculate overall progress (0.0 to 1.0)
      const overallProg = totalDurationMs > 0 ? Math.min(1, elapsed / totalDurationMs) : 1;
      setProgress(overallProg);

      // Determine current stage index based on elapsed time
      let currentIdx = 0;
      for (let i = 0; i < stages.length; i++) {
        const start = stageStarts.current[i];
        const end = start + stages[i].durationMs;
        if (elapsed >= start && elapsed < end) {
          currentIdx = i;
          break;
        }
        if (i === stages.length - 1 && elapsed >= end) {
          currentIdx = i;
        }
      }

      setPhaseIndex((prevIdx) => {
        if (prevIdx !== currentIdx) {
          if (onPhaseChangeRef.current) {
            onPhaseChangeRef.current(stages[currentIdx].phase, currentIdx);
          }
        }
        return currentIdx;
      });

      // Calculate progress within current stage (0.0 to 1.0)
      const stageStart = stageStarts.current[currentIdx];
      const stageDuration = stages[currentIdx].durationMs;
      const stageElapsed = elapsed - stageStart;
      const stageProg = stageDuration > 0 ? Math.min(1, Math.max(0, stageElapsed / stageDuration)) : 1;
      setStageProgress(stageProg);

      // Schedule next tick
      if (isPlayingRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    },
    [totalDurationMs, stages, loop, cancelLoop]
  );

  // Start playback
  const start = useCallback(() => {
    cancelLoop();
    startTimeRef.current = null;
    pausedAtRef.current = null;
    setIsPlaying(true);
    setIsComplete(false);
    setProgress(0);
    setStageProgress(0);
    setPhaseIndex(0);
    if (onPhaseChangeRef.current) {
      onPhaseChangeRef.current(stages[0].phase, 0);
    }
    rafIdRef.current = requestAnimationFrame(tick);
  }, [cancelLoop, stages, tick]);

  // Restart from beginning with new cycle ID
  const restart = useCallback(() => {
    cancelLoop();
    setCycleId((prev) => prev + 1);
    start();
  }, [cancelLoop, start]);

  // Skip straight to completion
  const skip = useCallback(() => {
    cancelLoop();
    setProgress(1);
    setStageProgress(1);
    setPhaseIndex(stages.length - 1);
    setIsPlaying(false);
    setIsComplete(true);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [cancelLoop, stages.length]);

  // Cancel playback without firing completion
  const cancel = useCallback(() => {
    cancelLoop();
    setIsPlaying(false);
    startTimeRef.current = null;
    pausedAtRef.current = null;
  }, [cancelLoop]);

  // Pause playback
  const pause = useCallback(() => {
    if (!isPlayingRef.current) return;
    cancelLoop();
    setIsPlaying(false);
    pausedAtRef.current = performance.now();
  }, [cancelLoop]);

  // Resume playback from paused timestamp
  const resume = useCallback(() => {
    if (isPlayingRef.current || isComplete) return;
    if (pausedAtRef.current !== null && startTimeRef.current !== null) {
      const pauseDuration = performance.now() - pausedAtRef.current;
      startTimeRef.current += pauseDuration;
      pausedAtRef.current = null;
    }
    setIsPlaying(true);
    rafIdRef.current = requestAnimationFrame(tick);
  }, [isComplete, tick]);

  // Initial autoStart effect & cleanup on unmount
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      cancelLoop();
    };
  }, [autoStart, cycleId, start, cancelLoop]);

  const currentStage = stages[phaseIndex] || stages[0];

  return {
    phase: currentStage.phase,
    phaseIndex,
    currentStage,
    progress,
    stageProgress,
    isPlaying,
    isComplete,
    cycleId,
    start,
    restart,
    skip,
    cancel,
    pause,
    resume,
  };
}

