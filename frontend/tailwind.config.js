/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#fdf8f0',
          100: '#f9edd8',
          200: '#f2d9ac',
          300: '#e8be76',
          400: '#dc9d44',
          500: '#cc8125',
          600: '#b3661b',
          700: '#944e19',
          800: '#793f1b',
          900: '#643519',
        },
        leaf: {
          50:  '#f0faf0',
          100: '#d9f2d9',
          200: '#b2e5b3',
          300: '#7cce7e',
          400: '#4ab34d',
          500: '#2d9631',
          600: '#1f7a24',
          700: '#1a6120',
          800: '#184d1e',
          900: '#15401b',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'field-gradient': 'linear-gradient(135deg, #1a6120 0%, #2d9631 40%, #4ab34d 100%)',
        'earth-gradient': 'linear-gradient(135deg, #643519 0%, #944e19 50%, #cc8125 100%)',
        'dawn-gradient': 'linear-gradient(180deg, #78350f 0%, #d97706 40%, #fbbf24 100%)',
      },
      boxShadow: {
        'leaf': '0 4px 24px -4px rgba(45,150,49,0.25)',
        'soil': '0 4px 24px -4px rgba(147,79,25,0.25)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
}
