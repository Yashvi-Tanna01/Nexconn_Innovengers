import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoadingProvider } from './context/LoadingContext';
import { AppStartupLoader, GlobalLoadingOverlay } from './components/loading';
import { NetworkBanner } from './components/common/NetworkBanner';
import { API_ENDPOINTS, apiRequest, getAuthToken, User } from './config/api';
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
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Lightweight suspense fallback with zero layout shift
const PageFallback = () => <div className="w-full min-h-[60vh] bg-transparent" aria-hidden="true" />;

function AccessDenied() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-bold text-[#202827]">Access denied</h1>
      <p className="mt-2 text-sm text-[#737C78]">Your account does not have permission to open this area.</p>
      <a href="/home" className="mt-5 rounded-xl bg-[#286B56] px-4 py-2 text-sm font-semibold text-white">
        Return home
      </a>
    </div>
  );
}

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const location = useLocation();
  const roleKey = roles?.join('|') || '';
  const [state, setState] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'forbidden'>('checking');

  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    if (!token) {
      setState('unauthenticated');
      return () => { active = false; };
    }

    void apiRequest<User>(API_ENDPOINTS.authMe).then((result) => {
      if (!active) return;
      if (!result.data) {
        setState(result.status === 403 ? 'forbidden' : 'unauthenticated');
        return;
      }
      setState(roles && !roles.includes(result.data.role) ? 'forbidden' : 'authenticated');
    });

    return () => { active = false; };
  }, [roleKey]);

  if (state === 'checking') return <PageFallback />;
  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (state === 'forbidden') return <AccessDenied />;
  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'public' | 'authenticated'>('checking');

  useEffect(() => {
    let active = true;
    if (!getAuthToken()) {
      setState('public');
    } else {
      void apiRequest<User>(API_ENDPOINTS.authMe).then((result) => {
        if (active) setState(result.data ? 'authenticated' : 'public');
      });
    }

    return () => { active = false; };
  }, []);

  if (state === 'checking') return <PageFallback />;
  return state === 'authenticated' ? <Navigate to="/home" replace /> : <>{children}</>;
}

function RoleDashboard() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<User>(API_ENDPOINTS.authMe).then((result) => {
      if (result.data) setRole(result.data.role);
    });
  }, []);

  if (!role) return <PageFallback />;
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'coordinator') {
    return <CoordinatorPage />;
  }
  if (role === 'responder') {
    return <DashboardPage />;
  }
  return <DashboardPage />;
}

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
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedPageVariants : pageVariants;

  useEffect(() => {
    const handleExpiredSession = () => {
      navigate('/login', { replace: true, state: { from: location.pathname, message: 'Your session has expired. Please sign in again.' } });
    };
    window.addEventListener('antah-auth-expired', handleExpiredSession);
    return () => window.removeEventListener('antah-auth-expired', handleExpiredSession);
  }, [location.pathname, navigate]);

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
            <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><RequireAuth><RouteReadySentinel path="/explorer"><RoleDashboard /></RouteReadySentinel></RequireAuth></Suspense>} />
            <Route path="/admin/dashboard" element={<Suspense fallback={<PageFallback />}><RequireAuth roles={['admin']}><RouteReadySentinel path="/admin/dashboard"><AdminDashboardPage /></RouteReadySentinel></RequireAuth></Suspense>} />
            <Route path="/resident/dashboard" element={<Suspense fallback={<PageFallback />}><RequireAuth roles={['reporter']}><DashboardPage /></RequireAuth></Suspense>} />
            <Route path="/coordinator/dashboard" element={<Suspense fallback={<PageFallback />}><RequireAuth roles={['coordinator']}><CoordinatorPage /></RequireAuth></Suspense>} />
            <Route path="/responder/dashboard" element={<Suspense fallback={<PageFallback />}><RequireAuth roles={['responder']}><DashboardPage /></RequireAuth></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageFallback />}><RequireAuth><ProfilePage /></RequireAuth></Suspense>} />
            <Route path="/explorer" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/explorer"><ExplorerPage /></RouteReadySentinel></Suspense>} />
            <Route path="/report" element={<Suspense fallback={<PageFallback />}><RequireAuth><RouteReadySentinel path="/report"><ReportPage /></RouteReadySentinel></RequireAuth></Suspense>} />
            <Route path="/patterns" element={<Suspense fallback={<PageFallback />}><RouteReadySentinel path="/patterns"><SignalPatternsPage /></RouteReadySentinel></Suspense>} />
            <Route path="/coordinator" element={<Suspense fallback={<PageFallback />}><RequireAuth roles={['coordinator', 'admin']}><RouteReadySentinel path="/patterns"><CoordinatorPage /></RouteReadySentinel></RequireAuth></Suspense>} />
            <Route path="/messages" element={<Suspense fallback={<PageFallback />}><RequireAuth><RouteReadySentinel path="/messages"><MessagesPage /></RouteReadySentinel></RequireAuth></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<PageFallback />}><PublicAuthRoute><RouteReadySentinel path="/auth"><AuthPage /></RouteReadySentinel></PublicAuthRoute></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageFallback />}><PublicAuthRoute><RouteReadySentinel path="/login"><AuthPage /></RouteReadySentinel></PublicAuthRoute></Suspense>} />
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
