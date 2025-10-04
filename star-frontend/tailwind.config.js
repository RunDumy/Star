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
          light: '#b0b0b0',
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
        'twinkle': 'twinkle 2s infinite',
        'orbit': 'orbit 2s infinite linear',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { opacity: '0.25' },
          '100%': { opacity: '0.5' },
        },
        'twinkle': {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        'orbit': {
          '0%': { transform: 'translate(-50%, -50%) translateX(0) translateY(0)' },
          '25%': { transform: 'translate(-50%, -50%) translateX(20px) translateY(10px)' },
          '50%': { transform: 'translate(-50%, -50%) translateX(0) translateY(20px)' },
          '75%': { transform: 'translate(-50%, -50%) translateX(-20px) translateY(10px)' },
          '100%': { transform: 'translate(-50%, -50%) translateX(0) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
