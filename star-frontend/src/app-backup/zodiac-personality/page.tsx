import { Metadata } from 'next';
import ZodiacPersonalityProfiles from '../../components/ZodiacPersonalityProfiles';

export const metadata: Metadata = {
  title: 'Zodiac Personality Profiles | STAR',
  description: 'Discover detailed personality profiles for all zodiac signs. Explore cosmic traits, strengths, weaknesses, compatibility, and career insights based on astrological elements.',
  keywords: 'zodiac, astrology, personality, horoscope, cosmic, elements, fire, earth, air, water',
  openGraph: {
    title: 'Zodiac Personality Profiles | STAR',
    description: 'Unlock the secrets of your cosmic blueprint with detailed zodiac personality profiles.',
    type: 'website',
  },
};

export default function ZodiacPersonalityPage() {
  return <ZodiacPersonalityProfiles />;
}