export const zodiacAnimations = {
  default: {
    animation: 'gentleFloat',
    duration: '2s',
    easing: 'ease-in-out',
    colors: ['#ff4444', '#ff6644']
  }
};

export const getCosmicAnimation = (signature) => zodiacAnimations[signature] || zodiacAnimations.default;

// Compatibility exports for existing components
export const getToneEnhancedAnimation = (signature) => getCosmicAnimation(signature);
export const ALL_ZODIAC_ANIMATIONS = zodiacAnimations;
