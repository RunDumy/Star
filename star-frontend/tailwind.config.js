/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          deep: '#0a0a2e',
          purple: '#4a0e4e',
          blue: '#0f4c75',
          gold: '#ffb74d',
          accent: '#7c4dff',
          glow: '#00bcd4',
        },
        star: {
          white: '#ffffff',
          dim: '#9e9e9e',
        }
      },
      boxShadow: {
        'cosmic': '0 0 20px rgba(124, 77, 255, 0.3)',
        'cosmic-lg': '0 0 40px rgba(124, 77, 255, 0.5)',
        'gold': '0 0 15px rgba(255, 183, 77, 0.4)',
        'blue': '0 0 25px rgba(15, 76, 117, 0.4)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom, #0a0a2e, #4a0e4e)',
        'cosmic-radial': 'radial-gradient(circle at 50% 50%, #4a0e4e 0%, #0a0a2e 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { filter: 'brightness(1)', },
          '100%': { filter: 'brightness(1.2)', },
        },
      },
    },
  },
  plugins: [],
};
