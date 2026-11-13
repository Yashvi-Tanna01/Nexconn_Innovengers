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
    altPaths: ['/chat'],
  },
];

export const AndroidBottomNav: React.FC = React.memo(() => {
  const location = useLocation();
  const { navigateWithTransition } = useNavigationTransition();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Connect the Chat badge to real unread notification data
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) setUnreadCount(0);
        return;
      }
      try {
        const res = await apiRequest<Notification[]>(API_ENDPOINTS.notifications);
        if (isMounted && res.data && Array.isArray(res.data)) {
          const unread = res.data.filter((n) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch {
        // Non-blocking background sync
      }
    };

    void fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Listen for real-time notification / chat updates
  useEffect(() => {
    const handleUpdate = () => {
      const token = getAuthToken();
      if (!token) return;
      void apiRequest<Notification[]>(API_ENDPOINTS.notifications).then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setUnreadCount(res.data.filter((n) => !n.read).length);
        }
      });
    };
    window.addEventListener('antah-notifications-updated', handleUpdate);
    window.addEventListener('antah-chat-message', handleUpdate);
    return () => {
      window.removeEventListener('antah-notifications-updated', handleUpdate);
      window.removeEventListener('antah-chat-message', handleUpdate);
    };
  }, []);

  const isCurrentActive = (item: NavItem) => {
    const path = location.pathname;
    if (path === item.path) return true;
    if (item.altPaths && item.altPaths.includes(path)) return true;
    if (item.path !== '/' && item.path !== '/home' && path.startsWith(item.path)) return true;
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
      aria-label="ANTAH Bottom Navigation"
      className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-[1100] px-4 pointer-events-none select-none box-border flex justify-center items-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}
    >
      {/* Premium Floating Navigation Pill */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] h-[66px] bg-white/92 backdrop-blur-2xl rounded-full border border-white/90 shadow-[0_12px_36px_rgba(20,40,30,0.11),0_2px_8px_rgba(20,40,30,0.04)] flex items-center justify-between px-3 pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const active = isCurrentActive(item);

          // Elevated Central Action (Report Button)
          if (item.isCenterAction) {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="relative flex-1 flex flex-col items-center justify-center min-w-0 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17533E]/50 rounded-2xl group select-none"
                aria-label="Report New Incident"
                aria-current={active ? 'page' : undefined}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="relative flex flex-col items-center justify-center -translate-y-2.5"
                >
                  {/* Deep Emerald Circular Action Button */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-b from-[#0F3E2E] to-[#0A2E22] text-white shadow-[0_8px_24px_rgba(15,62,46,0.45)] ring-2 ring-[#56D6A8] ring-offset-2 ring-offset-white'
                        : 'bg-gradient-to-b from-[#185942] to-[#0F3E2E] text-white shadow-[0_6px_20px_rgba(20,75,55,0.35),0_2px_6px_rgba(20,75,55,0.2)] hover:shadow-[0_8px_26px_rgba(20,75,55,0.48)] ring-1 ring-[#56D6A8]/30 hover:ring-2 hover:ring-[#56D6A8]/60 border border-white/40'
                    }`}
                  >
                    <Plus size={24} strokeWidth={2.6} className="text-white drop-shadow-xs" />
                  </div>

                  {/* Centered Report Label */}
                  <span
                    className={`text-[11px] font-bold tracking-tight mt-1 transition-colors duration-200 font-sans text-center ${
                      active ? 'text-[#0F3E2E]' : 'text-[#185942]'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          }

          // Regular Navigation Items (Home, Explore, Chat)
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className="relative flex-1 flex flex-col items-center justify-center min-w-0 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17533E]/50 rounded-2xl group select-none"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="w-full flex flex-col items-center justify-center"
              >
                {/* Icon Container with Animated Mint Active Pill */}
                <div className="relative px-3.5 sm:px-4 py-1.5 rounded-full flex items-center justify-center">
                  {active && (
                    <motion.div
                      layoutId="activeBottomNavPill"
                      className="absolute inset-0 bg-[#E1F2EB] rounded-full border border-[#286B56]/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_8px_rgba(23,83,62,0.06)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}

                  {/* Clean SVG Icon */}
                  <span
                    className={`relative z-10 transition-colors duration-200 flex items-center justify-center ${
                      active
                        ? 'text-[#17533E]'
                        : 'text-[#7B8B84] group-hover:text-[#202827]'
                    }`}
                  >
                    {item.id === 'home' && <Home size={22} strokeWidth={1.85} />}
                    {item.id === 'explore' && <Compass size={22} strokeWidth={1.85} />}
                    {item.id === 'chat' && <MessageSquare size={22} strokeWidth={1.85} />}
                  </span>

                  {/* Chat Unread Notification Badge */}
                  {item.id === 'chat' && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute -top-1 -right-0.5 z-20 min-w-[16px] h-[16px] px-1 rounded-full bg-[#EA580C] text-white text-[9.5px] font-mono font-bold flex items-center justify-center border-2 border-white shadow-xs pointer-events-none"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </div>

                {/* Centered Navigation Label */}
                <span
                  className={`text-[11px] tracking-tight mt-0.5 transition-colors duration-200 font-sans truncate text-center select-none ${
                    active
                      ? 'font-bold text-[#17533E]'
                      : 'font-medium text-[#7B8B84] group-hover:text-[#202827]'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default AndroidBottomNav;
