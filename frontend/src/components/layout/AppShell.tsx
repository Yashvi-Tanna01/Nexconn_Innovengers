import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  FileText,
  Layers,
  ShieldAlert,
  MessageSquare,
  Search,
  Filter,
  Download,
  Bell,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { ATLAS_DISTRICTS, ATLAS_SIGNALS } from '../atlas/types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Instant Search Results (Memoized)
  const matchingSignals = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ATLAS_SIGNALS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.locationName.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery]);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-territorial-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    {
      title: 'Executive Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      badge: 'LIVE',
    },
    {
      title: 'Territorial Atlas',
      path: '/explorer',
      icon: <Compass size={18} />,
    },
    {
      title: 'Citizen Reports',
      path: '/report',
      icon: <FileText size={18} />,
      badge: '6',
    },
    {
      title: 'Candidate Patterns',
      path: '/patterns',
      icon: <Layers size={18} />,
      badge: '1 AI',
      badgeColor: 'bg-amber-400 text-stone-900',
    },
    {
      title: 'Coordinator Hub',
      path: '/coordinator',
      icon: <ShieldAlert size={18} />,
    },
    {
      title: 'Incident Chat (Nexconn)',
      path: '/messages',
      icon: <MessageSquare size={18} />,
      badge: '2',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      exportTimestamp: new Date().toISOString(),
      district: selectedDistrict,
      timeWindow: selectedTimeRange,
      status: 'VERIFIED_OPERATIONAL',
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `antah_territorial_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#F5F6F4] flex flex-col lg:flex-row antialiased text-[#1D2A2A]">
      {/* ============================================================== */}
      {/* 1. PERSISTENT DARK SIDEBAR (Reference 2: #102B32 & #173941)    */}
      {/* ============================================================== */}
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#102B32] text-stone-200 border-r border-[#173941] sticky top-0 h-screen select-none z-30 shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#173941] flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 group focus:outline-none">
            {/* V-shaped Emerald Signal Monogram (Reference 2) */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#23765D] via-[#14B8A6] to-[#38BDF8] flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base tracking-wider text-white">
                ANTAH
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6F7B78] -mt-0.5">
                Territorial Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items (Reference 2) */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#173941] text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-[#173941]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? 'text-[#14B8A6]' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      item.badgeColor || (active ? 'bg-[#23765D] text-white' : 'bg-white/10 text-stone-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400">
              EXPLORATION & MODES
            </span>
          </div>

          <Link
            to="/home"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-[#173941]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-amber-400" />
              <span>3D Signal Orb View</span>
            </div>
            <ExternalLink size={12} className="text-stone-400" />
          </Link>
        </div>

        {/* Sidebar Footer: Territorial Status & Operator Profile */}
        <div className="p-3 border-t border-[#173941] space-y-3">
          {/* Territory Telemetry Card */}
          <div className="p-2.5 rounded-xl bg-[#173941]/60 border border-[#173941] text-[11px]">
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span className="font-mono uppercase text-[9px] tracking-wider text-stone-400">
                TERRITORIO ACTIVO
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="font-semibold text-white">Región Bangalore Este</div>
            <div className="text-[10px] text-stone-400">4 Cuadrantes • 6 Nodos</div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center text-stone-900 font-bold text-xs">
                R
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Raj</span>
                <span className="text-[10px] text-stone-400">Administrador Ops</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#102B32]/70 backdrop-blur-sm"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-72 bg-[#102B32] text-stone-200 h-full flex flex-col shadow-2xl z-10"
            >
              <div className="p-5 border-b border-[#173941] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#23765D] to-[#38BDF8] flex items-center justify-center text-white font-bold text-xs">
                    V
                  </div>
                  <span className="font-bold text-white tracking-wider">ANTAH</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive(item.path) ? 'bg-[#173941] text-white font-bold' : 'text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                  </Link>
                ))}

                <div className="pt-4 px-2">
                  <Link
                    to="/home"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-amber-300 bg-white/5 rounded-xl"
                  >
                    <Sparkles size={14} />
                    <span>3D Signal Orb View</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 2. MAIN OPERATIONS AREA & TOP WHITE TOOLBAR (Reference 2)     */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top White Operations Toolbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8E4] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          {/* Left: Mobile hamburger + Global Search Input with ⌘K */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#1D2A2A] hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>

            {/* Search Input (Reference 2: 'Buscar en VITA... ⌘K') */}
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7B78] pointer-events-none"
              />
              <input
                id="global-territorial-search"
                type="text"
                placeholder="Search signals, districts, clusters in ANTAH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#23765D]/30 focus:border-[#23765D] transition-all text-[#1D2A2A] placeholder-[#6F7B78]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-600 font-semibold pointer-events-none">
                ⌘K
              </span>

              {/* Floating Instant Search Results Dropdown */}
              {isSearchFocused && matchingSignals.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2.5 z-50 text-xs">
                  <div className="text-[10px] font-mono tracking-wider text-stone-400 px-2 pb-1.5 uppercase font-semibold">
                    Matching Signals ({matchingSignals.length})
                  </div>
                  <div className="space-y-1">
                    {matchingSignals.map((sig) => (
                      <button
                        key={sig.id}
                        onMouseDown={() => {
                          navigate(`/explorer?signal=${sig.id}`);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#23765D] bg-teal-50 px-1.5 py-0.5 rounded">
                            {sig.id}
                          </span>
                          <span className="font-semibold text-stone-900 line-clamp-1">
                            {sig.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {sig.neighborhood.split(',')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center-Right Filters & Actions (Reference 2) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* District Dropdown Selector */}
            <div className="hidden md:flex items-center">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-[#1D2A2A] font-medium focus:outline-none focus:ring-1 focus:ring-[#23765D]"
              >
                <option value="ALL">Región Bangalore Este (All)</option>
                {ATLAS_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Window Filter */}
            <div className="hidden sm:flex items-center">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-[#1D2A2A] font-medium focus:outline-none focus:ring-1 focus:ring-[#23765D]"
              >
                <option value="24h">12 - 26 May 2026</option>
                <option value="today">Today (Live Telemetry)</option>
                <option value="7d">Past 7 Days</option>
                <option value="30d">Past 30 Days</option>
              </select>
            </div>

            {/* Export Button (Reference 2: 'Exportar') */}
            <button
              onClick={handleExport}
              title="Export operational telemetry JSON"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#1D2A2A] bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              <Download size={14} className="text-[#6F7B78]" />
              <span>Exportar</span>
            </button>

            {/* Notifications Bell (Reference 2: Notification bell with badge 3) */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-[#1D2A2A] hover:bg-stone-100 border border-stone-200/80 transition-colors"
                aria-label="View notifications"
              >
                <Bell size={17} className="text-[#6F7B78]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notification Popup Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <span className="font-semibold text-stone-900">Live Incident Alerts</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">3 ACTIVE</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/70">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-[11px]">
                        <AlertTriangle size={13} className="text-amber-600" />
                        <span>CLUSTER-409 AI Match (94%)</span>
                      </div>
                      <p className="text-[10px] text-amber-800 mt-0.5">
                        Water main seepage correlated with culvert overflow in Sector 3.
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="font-semibold text-stone-900 text-[11px]">
                        Asphalt Sinkhole Verified
                      </div>
                      <p className="text-[10px] text-stone-600 mt-0.5">
                        Indiranagar 100ft Rd repair crew en route.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action: New Report */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#23765D] hover:bg-[#1b5d49] text-white shadow-xs transition-colors"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Nuevo Reporte</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;

