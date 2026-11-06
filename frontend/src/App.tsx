import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoadingProvider } from './context/LoadingContext';
import { AppStartupLoader, GlobalLoadingOverlay } from './components/loading';
import { NetworkBanner } from './components/common/NetworkBanner';
import { HomePage } from './components/home/HomePage';
import { AndroidAppShell } from './components/layout/AndroidAppShell';
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
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
            <Route path="/explorer" element={<Suspense fallback={<PageFallback />}><ExplorerPage /></Suspense>} />
            <Route path="/report" element={<Suspense fallback={<PageFallback />}><ReportPage /></Suspense>} />
            <Route path="/patterns" element={<Suspense fallback={<PageFallback />}><SignalPatternsPage /></Suspense>} />
            <Route path="/coordinator" element={<Suspense fallback={<PageFallback />}><CoordinatorPage /></Suspense>} />
            <Route path="/messages" element={<Suspense fallback={<PageFallback />}><MessagesPage /></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<PageFallback />}><AuthPage /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageFallback />}><AuthPage /></Suspense>} />
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
        <ScrollToTop />
        <NetworkBanner />
        <MainLayout />
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
