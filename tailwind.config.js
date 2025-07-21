/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Arial', 'Helvetica', 'sans-serif'],
        'serif': ['Gloock', 'Georgia', 'serif'],
        'display': ['Gloock', 'serif'],
      },
      colors: {
        reggae: {
          green: '#228B22',
          yellow: '#FFD700',
          red: '#DC143C',
          dark: '#1a1a1a',
          light: '#f8f9fa'
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      animation: {
        'slide-infinite': 'slide-infinite 30s linear infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'parallax': 'parallax 20s ease-in-out infinite',
      },
      keyframes: {
        'slide-infinite': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'parallax': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      backgroundImage: {
        'reggae-gradient': 'linear-gradient(135deg, #228B22 0%, #FFD700 50%, #DC143C 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(34,139,34,0.9) 0%, rgba(255,215,0,0.8) 50%, rgba(220,20,60,0.9) 100%)',
      }
    },
  },
  plugins: [],
}