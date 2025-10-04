import { Metadata } from 'next';
import DailyHoroscopes from '../../components/DailyHoroscopes';

export const metadata: Metadata = {
  title: 'Daily Horoscopes | Star Platform',
  description: 'Discover what the stars have in store for you today with personalized daily horoscopes for all zodiac signs.',
  keywords: 'horoscopes, zodiac, astrology, daily predictions, cosmic guidance, star signs',
  openGraph: {
    title: 'Daily Horoscopes | Star Platform',
    description: 'Get your personalized daily horoscope and cosmic guidance for today.',
    type: 'website',
  },
};

export default function DailyHoroscopesPage() {
  return <DailyHoroscopes />;
}