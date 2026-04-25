/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#f5f0e8',
          100: '#ede5d5',
          200: '#d4c8aa',
          300: '#b5a07a',
          400: '#96785a',
          500: '#6b5535',
          600: '#4a3520',
          700: '#2d1f10',
          800: '#1a1008',
          850: '#130e06',
          900: '#0e0c0a',
          950: '#070504',
        },
        gold: {
          200: '#f5e0a0',
          300: '#f0d080',
          400: '#e8c048',
          500: '#d4a020',
          600: '#b88010',
          700: '#8a5c08',
        },
        forest: {
          400: '#5cb87a',
          500: '#3d9e5f',
          600: '#2d7a48',
        },
        crimson: {
          400: '#e07070',
          500: '#c84040',
          600: '#a02828',
        },
        sapphire: {
          400: '#60a0e0',
          500: '#3d7dc8',
        },
        violet: {
          400: '#b080e0',
          500: '#8855c0',
        },
        teal: {
          400: '#40c0b0',
          500: '#1a9e90',
        },
        amber: {
          400: '#e09040',
          500: '#c07020',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-in-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'scale-in':  'scaleIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' },                              '100%': { opacity: '1' } },
        slideUp:  { '0%': { transform: 'translateY(8px)', opacity: '0' },'100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:  { '0%': { transform: 'scale(0.96)', opacity: '0' },    '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseDot: { '0%,100%': { opacity: '1' },                         '50%':  { opacity: '0.4' } },
      },
      backgroundImage: {
        'dot-grid-dark':  'radial-gradient(circle, #2a2420 1px, transparent 1px)',
        'dot-grid-light': 'radial-gradient(circle, #c8bea8 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '28px 28px',
      },
    },
  },
  plugins: [],
}
