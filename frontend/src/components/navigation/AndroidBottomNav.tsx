import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  Plus,
  PlusCircle,
  Layers,
  MessageSquare,
  Compass,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  altPaths?: string[];
  isCenterAction?: boolean;
  badge?: string;
  icon: React.ReactNode;
}

export const AndroidBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      path: '/home',
      altPaths: ['/'],
      icon: <Home size={20} />,
    },
    {
      id: 'explore',
      label: 'Explore',
      path: '/explorer',
      altPaths: ['/dashboard'],
      icon: <Compass size={20} />,
    },
    {
      id: 'report',
      label: 'Report',
      path: '/report',
      altPaths: [],
      isCenterAction: true,
      icon: <Plus size={22} strokeWidth={2.5} />,
    },
    {
      id: 'patterns',
      label: 'Patterns',
      path: '/patterns',
      altPaths: ['/coordinator'],
      badge: '1',
      icon: <Layers size={20} />,
    },
    {
      id: 'chat',
      label: 'Chat',
      path: '/messages',
      altPaths: [],
      badge: '2',
      icon: <MessageSquare size={20} />,
    },
  ];

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (location.pathname === item.path) return true;
    if (item.altPaths && item.altPaths.includes(location.pathname)) return true;
    if (item.path !== '/' && item.path !== '/home' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  return (
    <nav
      role="navigation"
      aria-label="Android Bottom Navigation"
      className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none select-none box-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="w-full max-w-md sm:max-w-xl mx-auto h-16 bg-white/95 backdrop-blur-2xl rounded-full border border-white/80 shadow-[0_10px_35px_rgba(20,30,25,0.08)] flex items-center justify-around px-3 pointer-events-auto">
        {navItems.map((item) => {
          const active = isCurrentActive(item);

          if (item.isCenterAction) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17533E] active:scale-95 transition-transform shrink-0"
                aria-label="Report New Anomaly"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(23,83,62,0.35)] -translate-y-2 transition-all ${
                    active
                      ? 'bg-[#0f3e2e] text-white ring-2 ring-[#E1F2EB]'
                      : 'bg-[#17533E] text-white hover:bg-[#124231] ring-1 ring-white/60'
                  }`}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-[#17533E] -mt-1 font-sans">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex-1 flex flex-col items-center justify-center min-w-[52px] min-h-[46px] py-1 px-1 rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17533E] active:scale-95 ${
                active ? 'text-[#17533E]' : 'text-[#7B8B84] hover:text-[#1E2925]'
              }`}
            >
              {/* Active Indicator Pill */}
              <div
                className={`relative px-3.5 py-1.5 rounded-full transition-all flex items-center justify-center ${
                  active ? 'bg-[#E1F2EB] text-[#17533E]' : 'text-[#7B8B84]'
                }`}
              >
                {item.icon}

                {/* Badge indicator */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-mono font-bold flex items-center justify-center text-white shadow-xs ${
                      item.id === 'patterns' ? 'bg-[#E11D48]' : 'bg-[#EA580C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors font-sans truncate max-w-full text-center ${
                  active ? 'font-bold text-[#17533E]' : 'text-[#7B8B84]'
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
};

export default AndroidBottomNav;
