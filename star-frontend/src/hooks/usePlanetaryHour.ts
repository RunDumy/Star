import { useState, useCallback } from 'react';
import axios from 'axios';

interface PlanetaryHourData {
  day_planet: string;
  hour_planet: string;
  timestamp: string;
  resonance: string;
}

export const usePlanetaryHour = () => {
  const [hourPlanet, setHourPlanet] = useState<string>('Moon');
  const [dayPlanet, setDayPlanet] = useState<string>('Sun');
  const [resonance, setResonance] = useState<string>('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPlanetaryHour = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use current location or defaults
      const latitude = 40.7128; // NYC latitude as default
      const longitude = -74.006; // NYC longitude as default

      const response = await axios.post('/api/v1/planetary/hour', {
        user_id: 1, // This should come from current user context
        longitude,
        latitude
      });

      const data: PlanetaryHourData = response.data;
      setDayPlanet(data.day_planet);
      setHourPlanet(data.hour_planet);
      setResonance(data.resonance);
    } catch (err) {
      console.error('Failed to get planetary hour:', err);
      setError('Failed to get current planetary hour');
      // Keep default values
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    hourPlanet,
    dayPlanet,
    resonance,
    loading,
    error,
    getCurrentPlanetaryHour
  };
};
