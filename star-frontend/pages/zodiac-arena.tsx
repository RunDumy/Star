import { useEffect, useState } from 'react';
import ZodiacArenaEnhanced from '../src/components/game/ZodiacArenaEnhanced';
import ZodiacArenaMobile from '../src/components/game/ZodiacArenaMobile';
import ZodiacArenaSimple from '../src/components/game/ZodiacArenaSimple';

export default function ZodiacArenaPage(): JSX.Element {
    const [isMobile, setIsMobile] = useState(false);
    const [useEnhanced, setUseEnhanced] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
            const isSmallScreen = window.innerWidth <= 768;
            const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            setIsMobile(isMobileDevice || (isSmallScreen && hasTouchScreen));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Use enhanced version if available, fallback to original versions
    if (useEnhanced) {
        return <ZodiacArenaEnhanced />;
    }

    return isMobile ? <ZodiacArenaMobile /> : <ZodiacArenaSimple />;
}