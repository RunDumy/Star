import UniversalSpaceLayout from '@/components/UniversalSpaceLayout';
import ZodiacCompatibility from '../src/components/ZodiacCompatibility';

export default function ZodiacCompatibilityPage() {
  return (
    <UniversalSpaceLayout currentPage="Zodiac Arena">
      <ZodiacCompatibility />
    </UniversalSpaceLayout>
  );
}

export const metadata = {
  title: 'Zodiac Compatibility Calculator | Star',
  description: 'Discover your cosmic connection with zodiac compatibility insights',
};

