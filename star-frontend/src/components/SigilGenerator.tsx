import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';
import { useSpring, animated, useTransition } from '@react-spring/web';
import Konva from 'konva';
import axios from 'axios';
import { usePlanetaryHour } from '../hooks/usePlanetaryHour';

interface Point {
  x: number;
  y: number;
}

interface SigilData {
  points: Point[];
  strokes: number[][];
  color: string;
  element: string;
  zodiac_sign: string;
  hour_planet: string;
  curve_factor: number;
}

interface SigilGeneratorProps {
  userId: number;
  zodiacSign: string;
  onSigilGenerated?: (data: SigilData) => void;
  tarotCard?: string;
}

// Zodiac element mapping for dynamic animations
const ZODIAC_ELEMENTS = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces']
} as const;

// Element-based animation configurations
const ELEMENT_ANIMATIONS = {
  Fire: {
    fadeIn: { duration: 800, config: { tension: 200, friction: 20 } },
    scale: { duration: 1200, config: { tension: 150, friction: 25 } },
    rotate: { duration: 1500, config: { tension: 120, friction: 15 } },
    glow: { intensity: 20, pulsateDuration: 2000 }
  },
  Earth: {
    fadeIn: { duration: 1200, config: { tension: 120, friction: 25 } },
    scale: { duration: 1400, config: { tension: 100, friction: 20 } },
    rotate: { duration: 1800, config: { tension: 80, friction: 18 } },
    glow: { intensity: 15, pulsateDuration: 3000 }
  },
  Air: {
    fadeIn: { duration: 1000, config: { tension: 180, friction: 22 } },
    scale: { duration: 1300, config: { tension: 140, friction: 18 } },
    rotate: { duration: 1600, config: { tension: 110, friction: 16 } },
    glow: { intensity: 18, pulsateDuration: 2500 }
  },
  Water: {
    fadeIn: { duration: 1400, config: { tension: 100, friction: 28 } },
    scale: { duration: 1600, config: { tension: 90, friction: 22 } },
    rotate: { duration: 2000, config: { tension: 70, friction: 20 } },
    glow: { intensity: 25, pulsateDuration: 4000 }
  }
} as const;

const SigilGenerator = forwardRef<HTMLDivElement, SigilGeneratorProps>(({
  userId,
  zodiacSign,
  onSigilGenerated,
  tarotCard
}, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [sigilData, setSigilData] = useState<SigilData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hourPlanet, getCurrentPlanetaryHour } = usePlanetaryHour();

  const animatedProps = useSpring({
    opacity: isGenerating ? 1 : 0.8,
    scale: isGenerating ? 1.05 : 1,
    config: { duration: 1000 }
  });

  useEffect(() => {
    getCurrentPlanetaryHour();
  }, [getCurrentPlanetaryHour]);

  // Get element from zodiac sign
  const getElementFromSign = useMemo(() => {
    const sign = zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1).toLowerCase();
    for (const [element, signs] of Object.entries(ZODIAC_ELEMENTS)) {
      if (signs.some(s => s.toLowerCase() === sign.toLowerCase())) {
        return element;
      }
    }
    return 'Fire'; // Default fallback
  }, [zodiacSign]);

  // Get element-specific animation config
  const elementConfig = useMemo(() => {
    const element = getElementFromSign;
    return ELEMENT_ANIMATIONS[element as keyof typeof ELEMENT_ANIMATIONS] || ELEMENT_ANIMATIONS.Fire;
  }, [getElementFromSign]);

  // Staged useTransition animations for sigil generation
  const transitions = useTransition(sigilData, {
    from: { opacity: 0, scale: 0.8, rotate: -10 },
    enter: [
      { opacity: 0.4, scale: 0.9, rotate: -5, config: elementConfig.fadeIn.config },
      { opacity: 0.7, scale: 0.95, rotate: 0, config: elementConfig.scale.config },
      { opacity: 1, scale: 1, rotate: 2, config: elementConfig.rotate.config }
    ],
    leave: { opacity: 0, scale: 0.9, rotate: 10 },
    config: { duration: 1000 }
  });

  // Glow effect state
  const [currentGlow, setCurrentGlow] = useState<number>(elementConfig.glow.intensity);

  // Glow effect animation using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    let startTime: number;

    const animateGlow = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Create sine wave oscillation for glow intensity
      const progress = (elapsed % elementConfig.glow.pulsateDuration) / elementConfig.glow.pulsateDuration;
      const glowMultiplier = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2);

      setCurrentGlow(elementConfig.glow.intensity * glowMultiplier);

      animationId = requestAnimationFrame(animateGlow);
    };

    animationId = requestAnimationFrame(animateGlow);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [elementConfig.glow.intensity, elementConfig.glow.pulsateDuration]);

  const generateSigil = async () => {
    if (!userId) {
      setError('User ID required for sigil generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/sigil/generate', {
        user_id: userId,
        zodiac_sign: zodiacSign,
        planetary_data: { hour_planet: hourPlanet },
        tarot_card: tarotCard
      });

      const data = response.data.sigil;
      setSigilData(data);

      if (onSigilGenerated) {
        onSigilGenerated(data);
      }
    } catch (err) {
      console.error('Sigil generation error:', err);
      setError('Failed to generate sigil');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSigil = () => {
    if (!stageRef.current) return;

    try {
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      const uri = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png'
      });

      const link = document.createElement('a');
      link.href = uri;
      link.download = `sigil-${zodiacSign}-${hourPlanet}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download sigil');
    }
  };

  const renderSigil = () => {
    if (!sigilData) return null;

    const centerX = 150;
    const centerY = 200;

    return transitions((style, item) =>
      item ? (
        <animated.div
          className="sigil-canvas-container"
          style={{
            opacity: style.opacity,
            transform: style.scale.to(s => `scale(${s}) rotate(${style.rotate}deg)`),
          }}
        >
          <Stage
            width={300}
            height={400}
            ref={stageRef}
            aria-label={`Sigil for ${zodiacSign} with ${sigilData.element} element`}
          >
            <Layer>
              {/* Background gradient */}
              <Rect
                x={0}
                y={0}
                width={300}
                height={400}
                fillLinearGradientStartPoint={{ x: 150, y: 0 }}
                fillLinearGradientEndPoint={{ x: 150, y: 400 }}
                fillLinearGradientColorStops={[
                  0, sigilData.color + '20',
                  0.3, sigilData.color + '40',
                  0.7, sigilData.color + '60',
                  1, sigilData.color + '80'
                ]}
              />

              {/* Render sigil paths with glow effect */}
              {sigilData.strokes.map((stroke, strokeIndex) => {
                const strokePoints: number[] = [];
                stroke.forEach(pointIndex => {
                  const point = sigilData.points[pointIndex];
                  strokePoints.push(point.x, point.y);
                });

                return (
                  <Line
                    key={strokeIndex}
                    points={strokePoints}
                    stroke={sigilData.color}
                    strokeWidth={strokeIndex === 0 ? 3 : 2}
                    lineCap="round"
                    lineJoin="round"
                    shadowColor={sigilData.color}
                    shadowBlur={currentGlow * 2}
                    shadowOffset={{ x: 0, y: 0 }}
                  />
                );
              })}

              {/* Center element indicator with glow */}
              <Circle
                x={centerX}
                y={centerY}
                radius={5}
                fill={sigilData.color}
                opacity={0.8}
                shadowColor={sigilData.color}
                shadowBlur={currentGlow}
                shadowOffset={{ x: 0, y: 0 }}
              />

              {/* Element symbol with glow */}
              <Text
                x={centerX - 10}
                y={centerY - 30}
                text={sigilData.element.charAt(0)}
                fontSize={20}
                fontFamily="serif"
                fill={sigilData.color}
                align="center"
                shadowColor={sigilData.color}
                shadowBlur={currentGlow * 0.5}
                shadowOffset={{ x: 0, y: 0 }}
              />
            </Layer>
          </Stage>

          <div className="sigil-info mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Element: <span className="font-semibold text-gray-800">{sigilData.element}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Planetary Hour: <span className="font-semibold text-gray-800">{sigilData.hour_planet}</span>
            </p>
            {sigilData.curve_factor > 1.0 && (
              <p className="text-sm text-gray-600">
                Harmony Level: <span className="font-semibold text-green-600">
                  {(sigilData.curve_factor - 1.0) * 100 + 100}%
                </span>
              </p>
            )}
          </div>
        </animated.div>
      ) : null
    );
  };

  return (
    <animated.div
      style={animatedProps}
      className="sigil-generator p-6 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg shadow-lg"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Cosmic Sigil Generator
        </h3>
        <p className="text-gray-600">
          Generate personalized sigils based on your zodiac sign and current planetary hour
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
        <button
          onClick={generateSigil}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300"
          aria-label={isGenerating ? "Generating sigil..." : "Generate new sigil"}
        >
          {isGenerating ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            "Generate Sigil"
          )}
        </button>

        {sigilData && (
          <button
            onClick={downloadSigil}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
            aria-label="Download sigil as PNG image"
          >
            Download PNG
          </button>
        )}
      </div>

      <div className="flex justify-center">
        {isGenerating ? (
          <div className="animate-pulse">
            <div className="w-64 h-80 bg-gray-300 rounded-lg"></div>
          </div>
        ) : (
          renderSigil()
        )}
      </div>

      {!sigilData && !isGenerating && (
        <div className="text-center mt-6">
          <p className="text-gray-500 italic">
            Click "Generate Sigil" to create your personalized celestial glyph
          </p>
        </div>
      )}
    </animated.div>
  );
});
SigilGenerator.displayName = 'SigilGenerator';

export default SigilGenerator;
