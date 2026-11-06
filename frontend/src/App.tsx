import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoadingProvider } from './context/LoadingContext';
import { AppStartupLoader, GlobalLoadingOverlay } from './components/loading';
import { NetworkBanner } from './components/common/NetworkBanner';
import { HomePage } from './components/home/HomePage';
import { AndroidAppShell } from './components/layout/AndroidAppShell';
import { NavigationTransitionProvider, RouteReadySentinel } from './components/navigation/transition';
import { pageVariants, reducedPageVariants } from './theme/motion';

// Code-split secondary pages for fast initial bundle execution
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const SignalPatternsPage = lazy(() => import('./pages/SignalPatternsPage'));
const CoordinatorPage = lazy(() => import('./pages/CoordinatorPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

// Lightweight suspense fallback with zero layout shift
const PageFallback = () => <div className="w-full min-h-[60vh] bg-transparent" aria-hidden="true" />;

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedPageVariants : pageVariants;

  return (
    <AndroidAppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex-1 flex flex-col"
        >
          <Routes location={location}>
            <Route path="/" element={<RouteReadySentinel path="/home"><HomePage /></RouteReadySentinel>} />
            <Route path="/home" element={<RouteReadySentinel path="/home"><HomePage /></RouteReadySentinel>} />
            <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/explorer"><DashboardPage /></RouteReadySentinel></Suspense>} />
            <Route path="/explorer" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/explorer"><ExplorerPage /></RouteReadySentinel></Suspense>} />
            <Route path="/report" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/report"><ReportPage /></RouteReadySentinel></Suspense>} />
            <Route path="/patterns" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/patterns"><SignalPatternsPage /></RouteReadySentinel></Suspense>} />
            <Route path="/coordinator" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/patterns"><CoordinatorPage /></RouteReadySentinel></Suspense>} />
            <Route path="/messages" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/messages"><MessagesPage /></RouteReadySentinel></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/auth"><AuthPage /></RouteReadySentinel></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/login"><AuthPage /></RouteReadySentinel></Suspense>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AndroidAppShell>
  );
}

export function App() {
  return (
    <LoadingProvider>
      {/* 
        PRESERVED INVARIANT:
        The ~8.8s 5-phase ThreeUI-inspired startup animation remains 100% untouched.
      */}
      <AppStartupLoader />
      <GlobalLoadingOverlay />
      <BrowserRouter>
        <NavigationTransitionProvider>
          <ScrollToTop />
          <NetworkBanner />
          <MainLayout />
        </NavigationTransitionProvider>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
