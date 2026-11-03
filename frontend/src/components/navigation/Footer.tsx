import React from 'react';
import { Link } from 'react-router-dom';
import { AntahLogo } from '../brand/AntahLogo';
import { BRAND, REPORT_CATEGORIES, ReportCategory } from '../../theme/tokens';
import { ShieldAlert, ArrowUpRight, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-antah-border text-antah-slate pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-antah-border-light">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <AntahLogo size="lg" showSubtitle={true} />
            <p className="text-xs text-antah-muted max-w-md leading-relaxed mt-2">
              "{BRAND.tagline}"
            </p>
            <p className="text-xs text-antah-slate max-w-md leading-relaxed">
              {BRAND.mission}
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-antah-teal">
              <Sparkles size={12} className="text-antah-amber" />
              <span>Nexconn Build Challenge 2026 Innovation</span>
            </div>
          </div>

          {/* Infrastructure Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-antah-navy mb-3">
              Civic Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((key) => (
                <li key={key}>
                  <Link
                    to={`/explorer?category=${key}`}
                    className="hover:text-antah-teal transition-colors flex items-center justify-between group"
                  >
                    <span>{REPORT_CATEGORIES[key].label}</span>
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-antah-teal" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-antah-navy mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explorer" className="hover:text-antah-teal transition-colors">
                  Network Explorer
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-antah-teal transition-colors">
                  Submit an Observation
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-antah-teal transition-colors">
                  Resident Dashboard
                </Link>
              </li>
              <li>
                <Link to="/coordinator" className="hover:text-antah-teal transition-colors">
                  Coordinator Hub
                </Link>
              </li>
              <li>
                <Link to="/design-system" className="hover:text-antah-teal transition-colors">
                  Design System Showcase
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-antah-muted">
          <div className="flex items-center gap-2">
            <ShieldAlert size={13} className="text-antah-amber flex-shrink-0" />
            <span>
              Ethical AI Policy: Algorithmic signal correlations are hypotheses requiring human verification, not automated emergency alerts.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>© 2026 ANTAH Core Team</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

