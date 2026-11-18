import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigationTransition, NavDestination } from './transition';
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { API_ENDPOINTS, apiRequest, getAuthToken, Notification } from '../../config/api';

interface NavItem {
  id: 'home' | 'explore' | 'report' | 'chat';
  label: string;
  path: string;
  altPaths?: string[];
  isCenterAction?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    altPaths: ['/'],
  },
  {
    id: 'explore',
    label: 'Explore',
    path: '/explorer',
    altPaths: ['/dashboard'],
  },
  {
    id: 'report',
    label: 'Report',
    path: '/report',
    altPaths: [],
    isCenterAction: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    path: '/messages',
    altPaths: [],
  },
];

export const AndroidBottomNav: React.FC = React.memo(() => {
  const location = useLocation();
  const { navigateWithTransition } = useNavigationTransition();
  const [unreadCount, setUnreadCount] = useState<number>(2);

  // Fetch real unread notification / chat count if authenticated
  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    if (!token) return;

    void apiRequest<Notification[]>(API_ENDPOINTS.notifications).then((result) => {
      if (!active) return;
      if (result.data) {
        const unread = result.data.filter((n) => !n.read).length;
        setUnreadCount(unread > 0 ? unread : 2);
      }
    });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const isCurrentActive = (item: NavItem) => {
    if (location.pathname === item.path) return true;
    if (item.altPaths && item.altPaths.includes(location.pathname)) return true;
    if (item.path !== '/' && item.path !== '/home' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (isCurrentActive(item)) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    navigateWithTransition(item.path, item.id as NavDestination);
  };

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-[1100] px-3 sm:px-4 pointer-events-none select-none box-border flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="w-full max-w-[390px] sm:max-w-[430px] h-[66px] bg-white/95 backdrop-blur-xl rounded-full border border-white/80 shadow-[0_10px_35px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] grid grid-cols-4 items-center px-1.5 pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const active = isCurrentActive(item);

          // 1. Center Elevated Report Action Button
          if (item.isCenterAction) {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="flex flex-col items-center justify-center py-1 group focus:outline-none active:scale-95 transition-transform"
                aria-label="Report New Anomaly"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_5px_18px_rgba(22,78,61,0.35)] -translate-y-2.5 transition-all duration-200 ${
                    active
                      ? 'bg-[#0F392C] text-white ring-2 ring-[#E5F3EB] ring-offset-2 ring-offset-white'
                      : 'bg-[#164E3D] text-white hover:bg-[#124234] hover:shadow-[0_6px_22px_rgba(22,78,61,0.45)]'
                  }`}
                >
                  <Plus size={24} strokeWidth={2.6} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#164E3D] -mt-1 font-sans tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          // 2. Standard Navigation Destinations (Home, Explore, Chat)
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className="flex flex-col items-center justify-center py-1 group focus:outline-none active:scale-95 transition-transform"
            >
              {/* Icon Container with active Mint-Green Capsule Pill */}
              <div className="relative w-14 h-8 flex items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="activeBottomNavMintPill"
                    className="absolute inset-0 bg-[#E5F3EB] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    active ? 'text-[#164E3D]' : 'text-[#62776E] group-hover:text-[#164E3D]'
                  }`}
                >
                  {item.id === 'home' && <Home size={22} strokeWidth={active ? 2.1 : 1.8} />}
                  {item.id === 'explore' && <Compass size={22} strokeWidth={active ? 2.1 : 1.8} />}
                  {item.id === 'chat' && <MessageSquare size={22} strokeWidth={active ? 2.1 : 1.8} />}
                </span>

                {/* Orange Chat Notification Badge */}
                {item.id === 'chat' && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} unread messages`}
                    className="absolute top-0 right-2 z-20 min-w-[16px] h-4 px-1 rounded-full bg-[#EA580C] text-[10px] font-bold text-white flex items-center justify-center leading-none shadow-xs pointer-events-none"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Destination Label */}
              <span
                className={`text-[11px] tracking-tight mt-0.5 transition-colors font-sans truncate text-center ${
                  active ? 'font-bold text-[#164E3D]' : 'font-medium text-[#62776E] group-hover:text-[#164E3D]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default AndroidBottomNav;
