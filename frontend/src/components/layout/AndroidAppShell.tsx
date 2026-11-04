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

  // Android Hardware / Gesture Back Button Handling
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Allow default history travel or back to home
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#202827] flex flex-col antialiased selection:bg-[#286B56]/20 selection:text-[#286B56]">
      {/* 1. Top Android Application Bar */}
      <AndroidTopBar />

      {/* 2. Main Responsive Viewport with Safe-Area Padding */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-[calc(5rem+env(safe-area-inset-bottom,16px))] min-w-0 box-border">
        {children}
      </main>

      {/* 3. Bottom Native Navigation Bar */}
      <AndroidBottomNav />
    </div>
  );
};

export default AndroidAppShell;

