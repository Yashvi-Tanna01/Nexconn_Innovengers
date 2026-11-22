import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigationTransition } from './transition';
import { AntahLogo } from '../brand/AntahLogo';
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Sparkles,
  ChevronRight,
  User,
} from 'lucide-react';
import { ATLAS_CANDIDATE_CLUSTERS } from '../atlas/types';
import { API_ENDPOINTS, apiRequest, logout, User as AuthUser } from '../../config/api';

export const AndroidTopBar: React.FC = () => {
  const location = useLocation();
  const { navigateWithTransition } = useNavigationTransition();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    void apiRequest<AuthUser>(API_ENDPOINTS.authMe).then((result) => setUser(result.data || null));
  }, [location.pathname]);
  const initials = user?.full_name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Dynamic screen title based on current path
  const getScreenMeta = () => {
    switch (location.pathname) {
      case '/':
      case '/home':
        return { title: 'ANTAH', subtitle: 'Signals Network' };
      case '/dashboard':
        return { title: 'Observatory', subtitle: 'Executive Telemetry' };
      case '/explorer':
        return { title: 'Territorial Map', subtitle: 'Bangalore East Core' };
      case '/report':
        return { title: 'Report Issue', subtitle: 'Community Telemetry' };
      case '/patterns':
        return { title: 'Candidate Patterns', subtitle: 'AI Spatial Clustering' };
      case '/coordinator':
        return { title: 'Coordinator Hub', subtitle: 'Verification Desk' };
      case '/messages':
        return { title: 'Incident Chat', subtitle: 'Nexconn 2026 Channel' };
      default:
        return { title: 'ANTAH', subtitle: 'Civic Intelligence' };
    }
  };

  const meta = getScreenMeta();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EBE7DF]/80 px-3 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top,8px)] pb-2 transition-all w-full box-border">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-13 min-w-0">
        {/* Left: Brand Identity */}
        <Link
          to="/home"
          onClick={(e) => {
            e.preventDefault();
            navigateWithTransition('/home', 'home');
          }}
          className="flex items-center gap-2.5 group focus:outline-none min-w-0"
        >
          <AntahLogo size="sm" showSubtitle={false} />
          <div className="flex flex-col min-w-0 border-l border-stone-200/80 pl-2.5">
            <span className="font-bold text-sm tracking-wide text-[#202827] font-sans truncate">
              {meta.title}
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#737C78] uppercase -mt-0.5 truncate">
              {meta.subtitle}
            </span>
          </div>
        </Link>

        {/* Right Controls: Mesh Status, Notifications & Profile Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Status indicator */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E1F0E8] border border-[#286B56]/20 text-[10px] font-mono text-[#286B56] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#286B56] animate-pulse" />
            <span>CIVIC GRID: ONLINE</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="p-2 rounded-xl bg-white border border-[#E3E8E4] text-[#202827] hover:bg-stone-50 active:scale-95 transition-all relative min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="View notifications"
            >
              <Bell size={16} className="text-[#737C78]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9534F] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notification Drawer Popup */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-72 sm:w-72 bg-white rounded-2xl shadow-xl border border-[#E3E8E4] p-3.5 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                  <span className="font-bold text-[#202827]">Incident Alerts</span>
                  <span className="text-[10px] font-mono text-[#286B56] font-bold">3 ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/patterns"
                    onClick={() => setNotificationsOpen(false)}
                    className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 block hover:bg-amber-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                      <AlertTriangle size={13} className="text-amber-600" />
                      <span>CLUSTER-409 AI Match (94%)</span>
                    </div>
                    <p className="text-[10px] text-amber-800 mt-0.5">
                      Water main seepage linked with culvert surcharge in Sector 3.
                    </p>
                  </Link>

                  <Link
                    to="/explorer"
                    onClick={() => setNotificationsOpen(false)}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 block hover:bg-stone-100 transition-colors"
                  >
                    <div className="font-bold text-[#202827] text-[11px]">
                      Asphalt Depression Verified
                    </div>
                    <p className="text-[10px] text-stone-600 mt-0.5">
                      100 Feet Rd repair crew assigned.
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#286B56] to-[#E7A65B] flex items-center justify-center text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
              aria-label="User Account"
            >
              {initials}
            </button>

            {/* Profile Drawer Popup */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-64 sm:w-64 bg-white rounded-2xl shadow-xl border border-[#E3E8E4] p-3.5 z-50 text-xs">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-9 h-9 rounded-xl bg-[#286B56] text-white flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                  <div>
                    <div className="font-bold text-[#202827]">{user?.full_name || 'Account'}</div>
                    <div className="text-[10px] text-[#737C78]">{user?.email || 'Loading account…'} • {user?.role || 'user'}</div>
                  </div>
                </div>

                <div className="pt-2.5 space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 text-stone-800"
                  >
                    <span>Observatory Overview</span>
                    <ChevronRight size={13} className="text-stone-400" />
                  </Link>
                  <Link
                    to="/coordinator"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 text-stone-800"
                  >
                    <span>Verification Workspace</span>
                    <ChevronRight size={13} className="text-stone-400" />
                  </Link>
                  <Link
                    to="/messages"
                    onClick={(e) => {
                      e.preventDefault();
                      setProfileOpen(false);
                      navigateWithTransition('/messages', 'chat');
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 text-stone-800"
                  >
                    <span>Nexconn Incident Room</span>
                    <ChevronRight size={13} className="text-stone-400" />
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 text-stone-800"
                  >
                    <span>Profile</span>
                    <ChevronRight size={13} className="text-stone-400" />
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      void logout().then(() => navigateWithTransition('/login', 'profile'));
                    }}
                    className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-red-50 text-red-700"
                  >
                    <span>Log out</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AndroidTopBar;
