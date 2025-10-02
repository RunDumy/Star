'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Starfield from '../../components/Starfield';
import CosmicCard from '../../components/CosmicCard';
import CosmicButton from '../../components/CosmicButton';

export default function BirthChartInput() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (birthDate && birthTime && birthLocation) {
      // In a real app, you'd save this data and proceed to calculation
      router.push(`/birth-chart/calculate?date=${birthDate}&time=${birthTime}&location=${encodeURIComponent(birthLocation)}`);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient text-star-white">
      <Starfield />
      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-star-white mb-2">Your Cosmic Blueprint</h1>
            <p className="text-cosmic-gold">Enter your birth details to reveal your astral map</p>
          </div>

          <CosmicCard glow>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-star-dim mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cosmic-deep border border-cosmic-purple rounded-lg text-star-white focus:border-cosmic-glow focus:ring-1 focus:ring-cosmic-glow"
                  required
                  title="Select your birth date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-star-dim mb-2">
                  Birth Time
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-3 py-2 bg-cosmic-deep border border-cosmic-purple rounded-lg text-star-white focus:border-cosmic-glow focus:ring-1 focus:ring-cosmic-glow"
                  required
                  title="Select your birth time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-star-dim mb-2">
                  Birth Location
                </label>
                <input
                  type="text"
                  value={birthLocation}
                  onChange={(e) => setBirthLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 bg-cosmic-deep border border-cosmic-purple rounded-lg text-star-white focus:border-cosmic-glow focus:ring-1 focus:ring-cosmic-glow"
                  required
                />
              </div>

              <CosmicButton onClick={handleSubmit} className="w-full" variant="gold">
                Calculate My Birth Chart
              </CosmicButton>
            </form>
          </CosmicCard>

          <p className="text-center text-star-dim text-sm">
            Your birth details are kept sacred and private
          </p>
        </div>
      </div>
    </div>
  );
}
