import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AntahLogo } from '../brand/AntahLogo';
import { Button } from '../common/Button';
import {
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  Palette,
  Menu,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Network Explorer', path: '/explorer', icon: <Compass size={15} /> },
    { name: 'Resident Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
    { name: 'Coordinator Hub', path: '/coordinator', icon: <ShieldAlert size={15} /> },
    { name: 'Design System', path: '/design-system', icon: <Palette size={15} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-antah-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.01]">
            <AntahLogo size="md" showSubtitle={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                    active
                      ? 'bg-antah-teal/10 text-antah-teal font-bold shadow-soft-xs border border-antah-teal/20'
                      : 'text-antah-slate hover:text-antah-navy hover:bg-slate-100/70'
                  }`}
                >
                  {link.icon && <span className={active ? 'text-antah-teal' : 'text-antah-muted'}>{link.icon}</span>}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Area & Signal Telemetry */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/80 border border-antah-border text-[11px] font-mono text-antah-slate">
              <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
              <span>NETWORK STATUS: ONLINE</span>
            </div>

            <Link to="/report">
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle size={15} />}
                className="shadow-soft-xs"
              >
                Report an Observation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/report">
              <Button variant="primary" size="sm" icon={<PlusCircle size={14} />}>
                Report
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-antah-slate hover:text-antah-navy hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-antah-border bg-white px-4 pt-3 pb-6 space-y-2 shadow-soft-lg">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-antah-border text-xs font-mono text-antah-slate mb-3">
            <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
            <span>CIVIC INTELLIGENCE ACTIVE</span>
          </div>

          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-antah-teal/10 text-antah-teal font-semibold border border-antah-teal/20'
                    : 'text-antah-slate hover:text-antah-navy hover:bg-slate-50'
                }`}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-antah-border">
            <Link to="/report" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center" icon={<PlusCircle size={16} />}>
                Report an Observation
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

