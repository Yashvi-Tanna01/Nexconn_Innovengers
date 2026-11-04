import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoadingProvider } from './context/LoadingContext';
import { AppStartupLoader, GlobalLoadingOverlay } from './components/loading';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { NetworkBanner } from './components/common/NetworkBanner';
import { LandingPage } from './pages/LandingPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoordinatorPage } from './pages/CoordinatorPage';
import { pageVariants, reducedPageVariants } from './theme/motion';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedPageVariants : pageVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 flex flex-col w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/coordinator" element={<CoordinatorPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <LoadingProvider>
      <AppStartupLoader />
      <GlobalLoadingOverlay />
      <BrowserRouter>
        <ScrollToTop />
        <NetworkBanner />
        <div className="min-h-screen flex flex-col bg-antah-ivory text-antah-navy selection:bg-antah-teal/20 selection:text-antah-teal-hover">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
