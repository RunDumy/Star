import dynamic from 'next/dynamic';

const ZodiacArenaMobile = dynamic(() => import('../src/components/game/ZodiacArenaMobile'), { ssr: false });

export default function ZodiacArenaMobilePage() {
    return <ZodiacArenaMobile />;
}