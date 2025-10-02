'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Starfield from '../../components/Starfield';
import CosmicButton from '../../components/CosmicButton';
import CosmicCard from '../../components/CosmicCard';
import { calculateBirthChart } from '../../lib/api';
import { BirthChartResponse } from '../../types/birth-chart';

export default function BirthChartCalculate() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Consulting the cosmos...');
  const [error, setError] = useState<string | null>(null);
  const [birthChartData, setBirthChartData] = useState<BirthChartResponse | null>(null);

  const messages = [
    'Consulting the cosmos...',
    'Aligning planetary positions...',
    'Reading cosmic signs...',
    'Interpreting celestial patterns...',
    'Weaving your astrological blueprint...',
  ];

  useEffect(() => {
    if (!router.query.date || !router.query.time || !router.query.location) return;

    const calculate = async () => {
      try {
        // Update UI with calculation steps
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = Math.min(prev + 10, 80); // Progress up to 80%
            // Change message throughout the process
            const messageIndex = Math.floor(newProgress / 25) % messages.length;
            setCurrentMessage(messages[messageIndex]);
            return newProgress;
          });
        }, 300);

        // Call the API
        const requestData = {
          birth_date: router.query.date as string,
          birth_time: router.query.time as string,
          location: decodeURIComponent(router.query.location as string),
        };

        const result = await calculateBirthChart(requestData);
        setBirthChartData(result);
        clearInterval(interval);

        // Final progress update
        setProgress(100);
        setCurrentMessage('Chart revealed!');

        // Redirect to reveal page with data in state
        setTimeout(() => {
          // Encode data as URL parameter or use session storage
          sessionStorage.setItem('birthChartData', JSON.stringify(result));
          router.push('/birth-chart/reveal');
        }, 1500);

      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to calculate birth chart');
        setProgress(0);
      }
    };

    calculate();
  }, [router.query.date, router.query.time, router.query.location, router]);

  return (
    <div className="min-h-screen bg-cosmic-gradient text-star-white">
      <Starfield />
      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <Loader2 className="w-24 h-24 text-cosmic-glow animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cosmic-gold animate-pulse-glow" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-star-white">Calculating Your Chart</h1>
              <p className="text-cosmic-gold text-lg">{currentMessage}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full bg-cosmic-purple/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cosmic-accent to-cosmic-glow transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-star-dim">{progress}% complete</p>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-star-dim">
              The stars are weaving your destiny's code
            </p>
            <p className="text-xs text-star-dim">
              Birth Date: {router.query.date?.toString().split('-').reverse().join('.')}
            </p>
            <p className="text-xs text-star-dim">
              Location: {router.query.location?.toString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
