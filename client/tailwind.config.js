/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#202A3B',
          accent: '#B69B72',
          navy: '#202A3B',
          gold: '#B69B72',
          'gold-light': '#D9C7A5',
          'gold-dark': '#9A7E55',
          ivory: '#F5F5EF',
          cream: '#F5F5EF',
          white: '#FFFFFF',
          lavender: '#EDE9FE',
          'lavender-light': '#F5F3FF',
          'lavender-dark': '#DDD6FE',
          'lavender-text': '#5B21B6',
          'navy-dark': '#171F2D',
          'navy-light': '#2D3A50',
          'cream-dark': '#EBEBE2',
          emerald: '#10b981',
          rose: '#f43f5e',
          violet: '#7c3aed',
          amber: '#f59e0b',
        },
      },
      boxShadow: {
        soft: '0 24px 80px -40px rgba(31,40,57,0.12)',
        subtle: '0 2px 8px -2px rgba(31,40,57,0.06)',
        card: '0 4px 16px -4px rgba(31,40,57,0.08)',
        elevated: '0 12px 32px -8px rgba(31,40,57,0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Outfit', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
