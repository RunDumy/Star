import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface CosmicPageWrapperProps {
    children: React.ReactNode;
    showNavigation?: boolean;
    navigationProps?: {
        currentRoute?: string;
        onPlanetSelect?: (route: string, label: string) => void;
        showLabels?: boolean;
    };
    cosmicBackground?: boolean;
    className?: string;
}

export const CosmicPageWrapper: React.FC<CosmicPageWrapperProps> = ({
    children,
    showNavigation = false,
    navigationProps,
    cosmicBackground = true,
    className = ''
}) => {
    const router = useRouter();

    useEffect(() => {
        // Apply universal cosmic background to body when component mounts
        if (cosmicBackground) {
            document.body.classList.add('universal-black-void');
        }

        // Cleanup on unmount
        return () => {
            if (cosmicBackground) {
                document.body.classList.remove('universal-black-void');
            }
        };
    }, [cosmicBackground]);

    return (
        <div className={`cosmic-page-wrapper ${className}`}>
            {/* Universal cosmic background layers */}
            {cosmicBackground && (
                <>
                    {/* Base cosmic void */}
                    <div className="universal-black-void fixed inset-0 pointer-events-none z-0" />

                    {/* Multi-layer starfield parallax */}
                    <div className="starfield-far fixed inset-0 pointer-events-none z-0" />
                    <div className="starfield-mid fixed inset-0 pointer-events-none z-0" />
                    <div className="starfield-near fixed inset-0 pointer-events-none z-0" />

                    {/* Cosmic nebula effects */}
                    <div className="cosmic-nebula fixed inset-0 pointer-events-none z-0" />
                </>
            )}

            {/* Main content */}
            <div className="relative z-10 min-h-screen">
                {children}
            </div>

            {/* Optional planetary navigation overlay */}
            {showNavigation && (
                <div className="fixed inset-0 pointer-events-none z-20">
                    <div className="absolute top-4 right-4 w-96 h-96 pointer-events-auto">
                        {/* Import UniversalPlanetNavigation dynamically to avoid SSR issues */}
                        <DynamicUniversalNavigation
                            currentRoute={navigationProps?.currentRoute || router.pathname}
                            onPlanetSelect={navigationProps?.onPlanetSelect}
                            showLabels={navigationProps?.showLabels}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Dynamic import to avoid SSR issues with Three.js
const DynamicUniversalNavigation = React.lazy(() =>
    import('./UniversalPlanetNavigation').then(module => ({
        default: module.UniversalPlanetNavigation
    }))
);

// Loading fallback for navigation
const NavigationFallback = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading cosmic navigation...</div>
    </div>
);

// Wrapper component with error boundary
export const CosmicPageWrapperWithNavigation: React.FC<Omit<CosmicPageWrapperProps, 'showNavigation'>> = (props) => {
    return (
        <CosmicPageWrapper {...props} showNavigation={true} />
    );
};

export default CosmicPageWrapper;