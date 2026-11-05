import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoadingProvider } from './context/LoadingContext';
import { AppStartupLoader, GlobalLoadingOverlay } from './components/loading';
import { NetworkBanner } from './components/common/NetworkBanner';
import { HomePage } from './components/home/HomePage';
import { AndroidAppShell } from './components/layout/AndroidAppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { ReportPage } from './pages/ReportPage';
import { SignalPatternsPage } from './pages/SignalPatternsPage';
import { CoordinatorPage } from './pages/CoordinatorPage';
import { MessagesPage } from './pages/MessagesPage';
import { AuthPage } from './pages/AuthPage';
import { pageVariants, reducedPageVariants } from './theme/motion';

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/patterns" element={<SignalPatternsPage />} />
            <Route path="/coordinator" element={<CoordinatorPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
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
