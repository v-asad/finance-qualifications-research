/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF', 100: '#DCE8FF', 200: '#BFD4FF', 300: '#93B5FD', 400: '#5F8DF9',
          500: '#3A6CF4', 600: '#2463EB', 700: '#1D4ED8', 800: '#1B3FA8', 900: '#1A3684', 950: '#0F1F4D',
        },
        sky: { 300: '#7DD3FC', 400: '#38BDF8', 500: '#0EA5E9' },
        ink: { DEFAULT: '#0B1B3F', soft: '#33415C', mute: '#64748B' },
        night: { 900: '#070D1A', 850: '#0A1222', 800: '#0E1830', 700: '#15223F', 600: '#1E2E52', 500: '#2B3D66' },
        gold: { 300: '#FCD97A', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
        ok: { 50: '#ECFDF3', 100: '#D1FADF', 500: '#16A34A', 600: '#15803D', 700: '#166534' },
        bad: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#DC2626', 600: '#B91C1C', 700: '#991B1B' },
      },
      fontFamily: {
        display: ['ui-rounded', '"SF Pro Rounded"', 'system-ui', '-apple-system', '"Segoe UI"', 'Nunito', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,27,63,.06), 0 4px 16px rgba(11,27,63,.06)',
        pop: '0 10px 40px rgba(11,27,63,.18)',
      },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(1)', opacity: '.55' }, '100%': { transform: 'scale(1.45)', opacity: '0' } },
        rise: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        sheetIn: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.08)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s ease-out infinite',
        rise: 'rise .28s ease-out both',
        sheetIn: 'sheetIn .26s cubic-bezier(.2,.9,.3,1) both',
        fadeIn: 'fadeIn .2s ease-out both',
        pop: 'pop .35s ease-out both',
        shake: 'shake .35s ease-in-out',
        bob: 'bob 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
