import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { NavDestination, TRANSITION_CONFIGS } from './types';
import { NavTransitionOverlay } from './NavTransitionOverlay';

export interface NavigationTransitionContextValue {
  isTransitioning: boolean;
  activeDestination: NavDestination | null;
  navigateWithTransition: (path: string, explicitDestination?: NavDestination) => void;
  reportDestinationReady: (mountedPath: string) => void;
  cancelTransition: () => void;
}

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | undefined>(undefined);

export function resolveDestinationFromPath(path: string): NavDestination {
  const cleanPath = path.split('?')[0].split('#')[0];
  switch (cleanPath) {
    case '/':
    case '/home':
      return 'home';
    case '/explorer':
    case '/dashboard':
      return 'explore';
    case '/report':
      return 'report';
    case '/patterns':
    case '/coordinator':
      return 'patterns';
    case '/messages':
      return 'chat';
    default:
      return 'home';
  }
}

export function isSameRoute(currentPath: string, targetPath: string): boolean {
  const current = currentPath.split('?')[0].split('#')[0];
  const target = targetPath.split('?')[0].split('#')[0];
  if (current === target) return true;
  if ((current === '/' || current === '/home') && (target === '/' || target === '/home')) return true;
  if ((current === '/explorer' || current === '/dashboard') && (target === '/explorer' || target === '/dashboard')) return true;
  if ((current === '/patterns' || current === '/coordinator') && (target === '/patterns' || target === '/coordinator')) return true;
  return false;
}

interface ProviderProps {
  children: React.ReactNode;
}

export const NavigationTransitionProvider: React.FC<ProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [activeDestination, setActiveDestination] = useState<NavDestination | null>(null);

  const startTimeRef = useRef<number>(0);
  const pendingPathRef = useRef<string | null>(null);
  const isReadyRef = useRef<boolean>(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const completeTransition = useCallback(() => {
    clearTimers();
    setIsTransitioning(false);
    setActiveDestination(null);
    pendingPathRef.current = null;
    isReadyRef.current = false;
  }, [clearTimers]);

  const cancelTransition = useCallback(() => {
    completeTransition();
  }, [completeTransition]);

  // Report that the destination route component has genuinely mounted and rendered
  const reportDestinationReady = useCallback(
    (mountedPath: string) => {
      // Only process if a transition is actively pending
      if (!pendingPathRef.current) return;

      if (isSameRoute(mountedPath, pendingPathRef.current)) {
        isReadyRef.current = true;
        const elapsed = performance.now() - startTimeRef.current;
        const destination = activeDestination || resolveDestinationFromPath(mountedPath);
        const minDuration = TRANSITION_CONFIGS[destination]?.minimumDisplayDuration || 1500;

        // finalDuration = Math.max(actualLoadingDuration, minimumDisplayDuration)
        if (elapsed >= minDuration) {
          // Destination is ready AND minimum duration has elapsed: dismiss immediately
          completeTransition();
        } else {
          // Destination is ready, but keep the animation playing for the remaining minimum duration
          const remainingDelay = minDuration - elapsed;
          if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
          }
          dismissTimerRef.current = setTimeout(() => {
            completeTransition();
          }, remainingDelay);
        }
      }
    },
    [activeDestination, completeTransition]
  );

  const navigateWithTransition = useCallback(
    (targetPath: string, explicitDestination?: NavDestination) => {
      // 1. Guard against clicking the already active destination
      if (isSameRoute(location.pathname, targetPath)) {
        return;
      }

      // 2. Prevent duplicate navigation requests while transition is in-flight
      if (isTransitioning) {
        return;
      }

      // 3. If user prefers reduced motion, navigate immediately without 3D sequence
      if (shouldReduceMotion) {
        navigate(targetPath);
        return;
      }

      clearTimers();

      const destination = explicitDestination || resolveDestinationFromPath(targetPath);
      const minDuration = TRANSITION_CONFIGS[destination]?.minimumDisplayDuration || 1500;

      startTimeRef.current = performance.now();
      pendingPathRef.current = targetPath;
      isReadyRef.current = false;
      setActiveDestination(destination);
      setIsTransitioning(true);

      // 4. Start destination navigation in React Router
      navigate(targetPath);

      // 5. Initial minimum duration timer:
      // When minimum display duration expires, check if destination is already mounted
      dismissTimerRef.current = setTimeout(() => {
        if (isReadyRef.current) {
          // Destination is ready, smoothly finish transition
          completeTransition();
        }
        // If not ready yet, reportDestinationReady will trigger completeTransition() once it mounts!
      }, minDuration);

      // 6. Hard safety ceiling (8 seconds) so user is NEVER permanently locked out on errors
      safetyTimerRef.current = setTimeout(() => {
        console.warn('[NavTransition] Safety ceiling triggered. Dismissing transition.');
        completeTransition();
      }, 8000);
    },
    [location.pathname, isTransitioning, shouldReduceMotion, navigate, clearTimers, completeTransition]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <NavigationTransitionContext.Provider
      value={{
        isTransitioning,
        activeDestination,
        navigateWithTransition,
        reportDestinationReady,
        cancelTransition,
      }}
    >
      {children}
      {/* Floating Glassmorphism Portal Transition Modal */}
      <NavTransitionOverlay
        isVisible={isTransitioning}
        destination={activeDestination}
      />
    </NavigationTransitionContext.Provider>
  );
};

export const useNavigationTransition = (): NavigationTransitionContextValue => {
  const context = useContext(NavigationTransitionContext);
  if (!context) {
    throw new Error('useNavigationTransition must be used within a NavigationTransitionProvider');
  }
  return context;
};

export interface RouteReadySentinelProps {
  children: React.ReactNode;
  path?: string;
}

/**
 * RouteReadySentinel signals when a destination component (and its lazy chunk)
 * has genuinely completed mounting, allowing NavigationTransitionProvider to calculate:
 * finalDuration = Math.max(actualLoadingDuration, minimumDisplayDuration)
 */
export const RouteReadySentinel: React.FC<RouteReadySentinelProps> = ({ children, path }) => {
  const { reportDestinationReady } = useNavigationTransition();
  const location = useLocation();

  useEffect(() => {
    const targetPath = path || location.pathname;
    reportDestinationReady(targetPath);
  }, [path, location.pathname, reportDestinationReady]);

  return <>{children}</>;
};

export default NavigationTransitionProvider;
