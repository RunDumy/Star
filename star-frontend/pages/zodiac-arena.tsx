import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import UniversalSpaceLayout from '../src/components/UniversalSpaceLayout';

const ZodiacArenaMobile = dynamic(() => import('../src/components/game/ZodiacArenaMobile'), {
    ssr: false,
    loading: () => <div className="arena-loading">Loading Zodiac Arena...</div>
});

export default function ZodiacArenaPage() {
    useEffect(() => {
        const checkMobile = () => {
            // Mobile detection logic if needed
        };

        checkMobile();
        globalThis.addEventListener('resize', checkMobile);

        return () => globalThis.removeEventListener('resize', checkMobile);
    }, []);

    // Use mobile version for now
    return (
        <UniversalSpaceLayout>
            <ZodiacArenaMobile />
        </UniversalSpaceLayout>
    );
}
