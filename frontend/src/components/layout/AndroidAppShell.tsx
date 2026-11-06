import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AndroidTopBar } from '../navigation/AndroidTopBar';
import { AndroidBottomNav } from '../navigation/AndroidBottomNav';

interface AndroidAppShellProps {
  children: React.ReactNode;
}

export const AndroidAppShell: React.FC<AndroidAppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Android Hardware / Gesture Back Button Handling
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Allow default history travel or back to home
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#202827] flex flex-col antialiased selection:bg-[#17533E]/20 selection:text-[#17533E] overflow-x-hidden w-full">
      {/* 1. Top Android Application Bar (Active for internal telemetry routes; omitted on Home to match reference) */}
      {!isHomePage && <AndroidTopBar />}

      {/* 2. Main Responsive Viewport with Safe-Area Padding */}
      <main className={`flex-1 w-full max-w-7xl mx-auto ${isHomePage ? 'px-2 sm:px-4 lg:px-6' : 'px-3 sm:px-6 lg:px-8'} pb-[calc(5.5rem+env(safe-area-inset-bottom,16px))] min-w-0 box-border overflow-x-hidden`}>
        {children}
      </main>

      {/* 3. Bottom Native Navigation Bar */}
      <AndroidBottomNav />
    </div>
  );
};

export default AndroidAppShell;
