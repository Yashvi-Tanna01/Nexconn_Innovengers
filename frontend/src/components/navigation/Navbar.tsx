import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AntahLogo } from '../brand/AntahLogo';
import { Button } from '../common/Button';
import { useLoading } from '../../context/LoadingContext';
import {
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { replayStartupAnimation } = useLoading();

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'City Explorer', path: '/explorer', icon: <Compass size={15} /> },
    { name: 'Resident Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
    { name: 'Coordinator Hub', path: '/coordinator', icon: <ShieldAlert size={15} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top,0.75rem)] pb-2 pointer-events-none">
      <div className="max-w-7xl mx-auto">
        <div className="pointer-events-auto backdrop-blur-xl bg-white/85 border border-white/80 rounded-2xl px-3.5 sm:px-6 h-16 shadow-[0_8px_30px_rgba(11,19,43,0.06)] flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center group transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-antah-teal/40 rounded-lg min-h-[44px]"
          >
            <AntahLogo size="md" showSubtitle={true} />
          </Link>

          {/* Desktop Navigation Links with Fluid Sliding Pill Indicator */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100/70 border border-slate-200/50 relative">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-150 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-antah-teal/50 ${
                    active
                      ? 'text-antah-navy font-bold'
                      : 'text-antah-slate hover:text-antah-navy'
                  }`}
                >
                  {/* Fluid Gliding Active Pill */}
                  {active && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : 'activeNavIndicator'}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute inset-0 bg-white rounded-lg shadow-soft-xs border border-slate-200/80 -z-10"
                    />
                  )}

                  {link.icon && (
                    <span className={active ? 'text-antah-teal' : 'text-antah-muted'}>
                      {link.icon}
                    </span>
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Area & Live Telemetry */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={replayStartupAnimation}
              title="Replay cinematic startup intro"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[11px] font-mono text-antah-slate hover:text-antah-navy transition-colors focus:outline-none focus:ring-1 focus:ring-antah-teal"
            >
              <Sparkles size={11} className="text-antah-amber" />
              <span>Replay Intro</span>
            </button>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-mono text-antah-slate">
              <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
              <span>CIVIC GRID: ONLINE</span>
            </div>

            <Link to="/report">
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle size={15} />}
                className="shadow-soft-xs font-bold"
              >
                Report an Issue
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/report">
              <Button variant="primary" size="sm" icon={<PlusCircle size={14} />} className="min-h-[40px]">
                Report
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-antah-slate hover:text-antah-navy hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-antah-teal/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer with Smooth AnimatePresence */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto lg:hidden mt-2 p-4 rounded-2xl backdrop-blur-2xl bg-white/95 border border-white/80 shadow-soft-xl space-y-2 pb-6"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-antah-border text-xs font-mono text-antah-slate mb-3">
                <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
                <span>SPATIAL DIGITAL TWIN ACTIVE</span>
              </div>

              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                      active
                        ? 'bg-antah-teal/10 text-antah-teal font-bold border border-antah-teal/20'
                        : 'text-antah-slate hover:text-antah-navy hover:bg-slate-50'
                    }`}
                  >
                    {link.icon && <span>{link.icon}</span>}
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-100">
                <Link to="/report" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center font-bold min-h-[48px]" icon={<PlusCircle size={16} />}>
                    Report an Issue
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
