'use client';

import { useEffect, useState } from 'react';
import StarBackground from '../components/StarBackground';
import { fetchZodiacNumbers } from '../lib/api';

type ZodiacInfo = {
  element?: string;
  traits?: string;
};

type NumbersResponse = {
  western: { number: number; sign: string; info: ZodiacInfo };
  chinese: { number: number; sign: string; info: any };
  vedic: { number: number; sign: string; info: ZodiacInfo };
  generated_at: string;
};

export default function Zodiac() {
  const [data, setData] = useState<NumbersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchZodiacNumbers()
      .then(setData)
      .catch(() => setError('Failed to fetch zodiac numbers'));
  }, []);

  return (
    <StarBackground>
      <div className="relative z-10 mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-3xl font-bold">Your Cosmic Numbers</h1>
        {error && <p className="text-red-300">{error}</p>}
        {!data && !error && <p>Loading...</p>}
        {data && (
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold">Western: {data.western.sign} ({data.western.number})</h3>
              <p className="text-sm text-gray-200">
                Element: {data.western.info?.element} — Traits: {data.western.info?.traits}
              </p>
            </section>
            <section>
              <h3 className="text-xl font-semibold">Chinese: {data.chinese.sign} ({data.chinese.number})</h3>
              <p className="text-sm text-gray-200">
                Element: {data.chinese.info?.element} — Traits: {data.chinese.info?.traits}
              </p>
            </section>
            <section>
              <h3 className="text-xl font-semibold">Vedic: {data.vedic.sign} ({data.vedic.number})</h3>
              <p className="text-sm text-gray-200">
                Element: {data.vedic.info?.element} — Traits: {data.vedic.info?.traits}
              </p>
            </section>
            <p className="text-xs text-gray-400">
              Generated at: {new Date(data.generated_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </StarBackground>
  );
}
