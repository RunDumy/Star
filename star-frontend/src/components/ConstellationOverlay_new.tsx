'use client';

interface ConstellationOverlayProps {
  zodiacSign: string;
  element: string;
  className?: string;
}

const CONSTELLATION_PATTERNS: { [key: string]: { stars: Array<{ x: number; y: number; size: number }> } } = {
  'Aries': {
    stars: [
      { x: 20, y: 20, size: 2 },
      { x: 50, y: 30, size: 1.5 },
      { x: 80, y: 25, size: 2.5 },
      { x: 35, y: 60, size: 1 },
      { x: 65, y: 70, size: 1.5 }
    ]
  },
  'Taurus': {
    stars: [
      { x: 25, y: 25, size: 2 },
      { x: 45, y: 35, size: 1.5 },
      { x: 65, y: 30, size: 2 },
      { x: 85, y: 45, size: 1 },
      { x: 55, y: 65, size: 1.5 },
      { x: 75, y: 75, size: 1 }
    ]
  },
  'Gemini': {
    stars: [
      { x: 15, y: 30, size: 1.5 },
      { x: 35, y: 25, size: 2 },
      { x: 55, y: 35, size: 1.5 },
      { x: 75, y: 30, size: 2 },
      { x: 25, y: 65, size: 1 },
      { x: 45, y: 70, size: 1.5 },
      { x: 65, y: 65, size: 1 }
    ]
  },
  'Cancer': {
    stars: [
      { x: 30, y: 20, size: 1.5 },
      { x: 50, y: 25, size: 2 },
      { x: 70, y: 20, size: 1.5 },
      { x: 40, y: 45, size: 1 },
      { x: 60, y: 45, size: 1 },
      { x: 50, y: 65, size: 1.5 }
    ]
  },
  'Leo': {
    stars: [
      { x: 20, y: 25, size: 1.5 },
      { x: 40, y: 20, size: 2.5 },
      { x: 60, y: 25, size: 2 },
      { x: 80, y: 30, size: 1.5 },
      { x: 35, y: 50, size: 1 },
      { x: 65, y: 55, size: 1 },
      { x: 50, y: 75, size: 1.5 }
    ]
  },
  'Virgo': {
    stars: [
      { x: 25, y: 20, size: 1.5 },
      { x: 45, y: 25, size: 2 },
      { x: 65, y: 20, size: 1.5 },
      { x: 85, y: 35, size: 1 },
      { x: 35, y: 50, size: 1.5 },
      { x: 55, y: 55, size: 1 },
      { x: 75, y: 60, size: 1.5 },
      { x: 50, y: 80, size: 1 }
    ]
  },
  'Libra': {
    stars: [
      { x: 30, y: 25, size: 1.5 },
      { x: 50, y: 20, size: 2 },
      { x: 70, y: 25, size: 1.5 },
      { x: 40, y: 45, size: 1 },
      { x: 60, y: 45, size: 1 },
      { x: 25, y: 65, size: 1.5 },
      { x: 75, y: 65, size: 1.5 }
    ]
  },
  'Scorpio': {
    stars: [
      { x: 20, y: 25, size: 1.5 },
      { x: 35, y: 20, size: 2 },
      { x: 50, y: 25, size: 1.5 },
      { x: 65, y: 30, size: 2 },
      { x: 80, y: 35, size: 1 },
      { x: 45, y: 55, size: 1.5 },
      { x: 60, y: 70, size: 1 }
    ]
  },
  'Sagittarius': {
    stars: [
      { x: 15, y: 30, size: 1.5 },
      { x: 30, y: 25, size: 2 },
      { x: 45, y: 20, size: 2.5 },
      { x: 60, y: 25, size: 2 },
      { x: 75, y: 30, size: 1.5 },
      { x: 50, y: 50, size: 1 },
      { x: 65, y: 65, size: 1.5 },
      { x: 80, y: 80, size: 1 }
    ]
  },
  'Capricorn': {
    stars: [
      { x: 25, y: 20, size: 1.5 },
      { x: 45, y: 25, size: 2 },
      { x: 65, y: 20, size: 1.5 },
      { x: 40, y: 45, size: 1 },
      { x: 60, y: 45, size: 1 },
      { x: 50, y: 65, size: 1.5 },
      { x: 35, y: 80, size: 1 },
      { x: 65, y: 80, size: 1 }
    ]
  },
  'Aquarius': {
    stars: [
      { x: 20, y: 25, size: 1.5 },
      { x: 40, y: 20, size: 2 },
      { x: 60, y: 25, size: 1.5 },
      { x: 80, y: 30, size: 2 },
      { x: 35, y: 50, size: 1 },
      { x: 65, y: 55, size: 1 },
      { x: 50, y: 75, size: 1.5 }
    ]
  },
  'Pisces': {
    stars: [
      { x: 25, y: 25, size: 1.5 },
      { x: 45, y: 20, size: 2 },
      { x: 65, y: 25, size: 1.5 },
      { x: 35, y: 45, size: 1 },
      { x: 55, y: 45, size: 1 },
      { x: 75, y: 50, size: 1.5 },
      { x: 50, y: 70, size: 1 }
    ]
  }
};

export default function ConstellationOverlay({ zodiacSign, element, className = '' }: ConstellationOverlayProps) {
  const pattern = CONSTELLATION_PATTERNS[zodiacSign] || CONSTELLATION_PATTERNS.Aries;

  const starColor = element === 'Fire' ? '#ff6b35' :
                   element === 'Earth' ? '#4ade80' :
                   element === 'Air' ? '#60a5fa' :
                   element === 'Water' ? '#06b6d4' : '#fbbf24';

  const getElementSymbol = (element: string) => {
    switch (element) {
      case 'Fire': return '🔥';
      case 'Earth': return '🌍';
      case 'Air': return '💨';
      case 'Water': return '💧';
      default: return '✨';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`constellation-glow-${zodiacSign}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={starColor} stopOpacity="0.8" />
            <stop offset="70%" stopColor={starColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={starColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines between stars */}
        <g stroke={starColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none">
          {pattern.stars.map((star, index) => {
            if (index < pattern.stars.length - 1) {
              const nextStar = pattern.stars[index + 1];
              return (
                <line
                  key={`line-${index}`}
                  x1={star.x}
                  y1={star.y}
                  x2={nextStar.x}
                  y2={nextStar.y}
                />
              );
            }
            return null;
          })}
        </g>

        {/* Stars */}
        {pattern.stars.map((star, index) => (
          <g key={`star-${index}`}>
            {/* Glow effect */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 2}
              fill={`url(#constellation-glow-${zodiacSign})`}
              opacity="0.6"
            />
            {/* Star */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={starColor}
              opacity="0.9"
            />
            {/* Twinkle effect */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 0.5}
              fill="#ffffff"
              opacity="0.7"
            />
          </g>
        ))}

        {/* Element symbol */}
        <text
          x="50"
          y="90"
          textAnchor="middle"
          fontSize="8"
          fill={starColor}
          opacity="0.5"
          fontFamily="serif"
        >
          {getElementSymbol(element)}
        </text>
      </svg>
    </div>
  );
}