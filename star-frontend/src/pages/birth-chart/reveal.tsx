'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Sun, Moon, Star, Home, Sparkles } from 'lucide-react';
import Starfield from '../../components/Starfield';
import CosmicCard from '../../components/CosmicCard';
import CosmicButton from '../../components/CosmicButton';
import MentorOverlay from '../../components/MentorOverlay';
import { BirthChartResponse, BirthChartData, BirthChartPlanet } from '../../types/birth-chart';

const planetSymbols = {
  sun: Sun,
  moon: Moon,
  ascendant: Star,
};

const zodiacColors = {
  Aries: 'text-red-400',
  Taurus: 'text-green-400',
  Gemini: 'text-yellow-400',
  Cancer: 'text-blue-400',
  Leo: 'text-orange-400',
  Virgo: 'text-amber-400',
  Libra: 'text-pink-400',
  Scorpio: 'text-purple-400',
  Sagittarius: 'text-indigo-400',
  Capricorn: 'text-teal-400',
  Aquarius: 'text-cyan-400',
  Pisces: 'text-violet-400',
};

export default function BirthChartReveal() {
  const router = useRouter();
  const [birthChart, setBirthChart] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from session storage
    const data = sessionStorage.getItem('birthChartData');
    if (data) {
      try {
        const parsed: BirthChartResponse = JSON.parse(data);
        setBirthChart(parsed.birth_chart);
      } catch (error) {
        console.error('Failed to parse birth chart data:', error);
      }
    }
    setLoading(false);
  }, []);

  const BackButton = () => (
    <CosmicButton
      onClick={() => router.push('/birth-chart/input')}
      variant="secondary"
      className="flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      New Chart
    </CosmicButton>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient text-star-white">
        <Starfield />
        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Star className="w-12 h-12 text-cosmic-glow animate-spin mx-auto mb-4" />
            <p className="text-star-white">Loading your cosmic blueprint...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!birthChart) {
    return (
      <div className="min-h-screen bg-cosmic-gradient text-star-white">
        <Starfield />
        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <CosmicCard glow className="text-center max-w-md">
            <Home className="w-12 h-12 text-cosmic-glow mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Chart Not Found</h1>
            <p className="text-star-dim mb-4">
              Your birth chart is not available. Please calculate a new one.
            </p>
            <BackButton />
          </CosmicCard>
        </div>
      </div>
    );
  }

  const PlanetIcon = ({ planet, size = "w-8 h-8" }: { planet: keyof typeof planetSymbols, size?: string }) => {
    const IconComponent = planetSymbols[planet];
    return <IconComponent className={`${size} text-cosmic-gold`} />;
  };

  const PlanetCard = ({ planetName, planet }: { planetName: string, planet: BirthChartPlanet }) => (
    <CosmicCard className="p-4 text-center">
      <div className="flex flex-col items-center space-y-3">
        <PlanetIcon planet={planetName as keyof typeof planetSymbols} />
        <div>
          <h3 className="font-bold text-star-white capitalize">{planetName}</h3>
          <div className="space-y-1 text-sm">
            <p className={`font-semibold ${zodiacColors[planet.sign as keyof typeof zodiacColors] || 'text-cosmic-gold'}`}>
              {planet.sign}
            </p>
            <p className="text-star-dim">House {planet.house}</p>
            <p className="text-xs text-star-dim">
              {planet.position.toFixed(1)}°
            </p>
          </div>
        </div>
      </div>
    </CosmicCard>
  );

  const HouseCard = ({ houseNumber, cusp }: { houseNumber: number, cusp: number }) => {
    const houseNames = [
      'Self', 'Values', 'Communication', 'Home', 'Children', 'Health',
      'Partnership', 'Transformation', 'Philosophy', 'Career', 'Friends', 'Spirituality'
    ];

    return (
      <div className="text-center p-2">
        <div className="w-12 h-12 mx-auto bg-cosmic-purple/30 rounded-full flex items-center justify-center mb-2">
          <span className="text-sm font-bold text-cosmic-gold">{houseNumber}</span>
        </div>
        <div className="text-xs">
          <p className="text-star-white font-semibold">{houseNames[houseNumber - 1]}</p>
          <p className="text-star-dim">{cusp.toFixed(1)}°</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient text-star-white">
      <Starfield />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <BackButton />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-star-white mb-2">Your Cosmic Blueprint</h1>
            <p className="text-cosmic-gold">Revealed by the stars</p>
          </div>
          <div className="w-24" /> {/* Spacer for balance */}
        </div>

        {/* Planetary Positions */}
        <CosmicCard glow className="mb-8">
          <div className="text-center mb-6">
            <Sparkles className="w-8 h-8 text-cosmic-glow mx-auto mb-2" />
            <h2 className="text-xl font-bold text-star-white">Planetary Positions</h2>
            <p className="text-star-dim text-sm">Your celestial influences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanetCard planetName="sun" planet={birthChart.sun} />
            <PlanetCard planetName="moon" planet={birthChart.moon} />
            <PlanetCard planetName="ascendant" planet={birthChart.ascendant} />
          </div>
        </CosmicCard>

        {/* House Cusps */}
        <CosmicCard glow>
          <div className="text-center mb-6">
            <Home className="w-8 h-8 text-cosmic-glow mx-auto mb-2" />
            <h2 className="text-xl font-bold text-star-white">House Cusps</h2>
            <p className="text-star-dim text-sm">The foundation of your life areas</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4">
            {birthChart.houses.map((cusp, index) => (
              <HouseCard key={index} houseNumber={index + 1} cusp={cusp} />
            ))}
          </div>
        </CosmicCard>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <CosmicCard className="inline-block">
            <div className="text-star-dim text-sm">
              <p>Chart calculated at: {new Date(birthChart.calculated_at).toLocaleString()}</p>
              <p className="mt-2">Save this moment - your cosmic blueprint never changes</p>
            </div>
          </CosmicCard>
        </div>
      </div>

      {/* Mentor Overlay appears after 15 seconds to offer wisdom */}
      <MentorOverlay isVisible={false} />
    </div>
  );
}
