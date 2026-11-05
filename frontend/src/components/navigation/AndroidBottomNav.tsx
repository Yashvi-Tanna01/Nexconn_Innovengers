import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
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
      icon: <PlusCircle size={22} />,
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E3E8E4] shadow-[0_-4px_24px_rgba(32,40,39,0.06)] pb-[env(safe-area-inset-bottom,0px)] transition-all select-none box-border"
    >
      <div className="w-full max-w-md md:max-w-xl mx-auto flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          const active = isCurrentActive(item);

          if (item.isCenterAction) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286B56] active:scale-95 transition-transform shrink-0"
                aria-label="Report New Anomaly"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                    active
                      ? 'bg-[#1b4e3e] text-white ring-2 ring-[#E1F0E8]'
                      : 'bg-[#286B56] text-white hover:bg-[#1f5645] ring-1 ring-white'
                  }`}
                >
                  <PlusCircle size={22} strokeWidth={2.4} />
                </div>
                <span className="text-[10px] font-bold text-[#286B56] mt-0.5 font-sans">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex-1 flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286B56] active:scale-95 ${
                active ? 'text-[#286B56]' : 'text-[#737C78] hover:text-[#202827]'
              }`}
            >
              {/* Active Indicator Pill */}
              <div
                className={`relative px-3.5 py-1 rounded-full transition-all flex items-center justify-center ${
                  active ? 'bg-[#E1F0E8] text-[#286B56]' : 'text-[#737C78]'
                }`}
              >
                {item.icon}

                {/* Badge indicator */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                      item.id === 'patterns' ? 'bg-[#D9534F]' : 'bg-[#E7A65B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors font-sans truncate max-w-full text-center ${
                  active ? 'font-bold text-[#286B56]' : 'text-[#737C78]'
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
