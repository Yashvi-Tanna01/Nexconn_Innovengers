/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        antah: {
          ivory: '#FBFBF9',
          canvas: '#F8F9FA',
          white: '#FFFFFF',
          panel: 'rgba(255, 255, 255, 0.88)',
          'panel-subtle': 'rgba(248, 250, 252, 0.75)',
          sidebar: '#102B32',
          'sidebar-hover': '#173941',
          'territorial-bg': '#F5F6F4',
          'home-bg': '#F4F3EF',
          forest: '#286B56',
          'soft-amber': '#E7A65B',
          navy: '#0B132B',
          'navy-soft': '#1E293B',
          slate: '#475569',
          muted: '#64748B',
          subtle: '#94A3B8',
          border: '#E2E8F0',
          'border-light': '#F1F5F9',
          'border-active': '#CBD5E1',
          teal: {
            DEFAULT: '#0D9488',
            hover: '#0F766E',
            light: '#14B8A6',
            soft: '#CCFBF1',
            glow: 'rgba(13, 148, 136, 0.15)',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            hover: '#0891B2',
            light: '#38BDF8',
            soft: '#E0F2FE',
            glow: 'rgba(6, 182, 212, 0.15)',
          },
          amber: {
            DEFAULT: '#D97706',
            hover: '#B45309',
            light: '#F59E0B',
            soft: '#FEF3C7',
            champagne: '#D4AF37',
            glow: 'rgba(217, 119, 6, 0.12)',
          },
          emerald: {
            DEFAULT: '#059669',
            hover: '#047857',
            soft: '#D1FAE5',
          },
          rose: {
            DEFAULT: '#E11D48',
            hover: '#BE123C',
            soft: '#FFE4E6',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(11, 19, 43, 0.04)',
        'soft-sm': '0 2px 4px rgba(11, 19, 43, 0.05), 0 1px 2px rgba(11, 19, 43, 0.03)',
        'soft-md': '0 4px 12px rgba(11, 19, 43, 0.06), 0 1px 3px rgba(11, 19, 43, 0.04)',
        'soft-lg': '0 12px 28px rgba(11, 19, 43, 0.07), 0 2px 6px rgba(11, 19, 43, 0.04)',
        'soft-xl': '0 20px 40px rgba(11, 19, 43, 0.08), 0 4px 10px rgba(11, 19, 43, 0.03)',
        'teal-glow': '0 0 20px rgba(13, 148, 136, 0.25)',
        'amber-glow': '0 0 20px rgba(217, 119, 6, 0.2)',
      },
      borderRadius: {
        'panel': '14px',
        'subtle': '10px',
      },
    },
  },
  plugins: [],
}

