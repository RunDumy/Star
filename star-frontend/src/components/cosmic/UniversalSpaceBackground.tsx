import React, { useEffect } from 'react';

interface UniversalSpaceBackgroundProps {
    intensity?: 'minimal' | 'normal' | 'dense';
    enableAnimation?: boolean;
    className?: string;
}

const UniversalSpaceBackground: React.FC<UniversalSpaceBackgroundProps> = ({
    intensity = 'normal',
    enableAnimation = true,
    className = ''
}) => {
    useEffect(() => {
        const container = document.querySelector('.universal-space-void') as HTMLElement;
        if (!container) return;

        container.innerHTML = '';

        const createStars = (count: number, layerClass: string, sizeRange: [number, number]) => {
            for (let i = 0; i < count; i++) {
                const star = document.createElement('div');
                star.className = `star ${layerClass}`;

                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';

                const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
                star.style.width = size + 'px';
                star.style.height = size + 'px';

                star.style.animationDelay = Math.random() * 8 + 's';

                container.appendChild(star);
            }
        };

        const createCosmicDust = (count: number) => {
            for (let i = 0; i < count; i++) {
                const dust = document.createElement('div');
                dust.className = 'cosmic-dust-particle';

                dust.style.left = Math.random() * 100 + '%';
                dust.style.top = Math.random() * 100 + '%';
                dust.style.animationDelay = Math.random() * 20 + 's';
                dust.style.animationDuration = (15 + Math.random() * 10) + 's';

                container.appendChild(dust);
            }
        };

        const createNebulaEffects = () => {
            const nebula = document.createElement('div');
            nebula.className = 'nebula-effect';
            nebula.style.background = 'radial-gradient(ellipse at 50% 50%, rgba(147, 112, 219, 0.1) 0%, rgba(72, 61, 139, 0.05) 50%, transparent 80%)';
            container.appendChild(nebula);
        };

        const intensityConfig = {
            minimal: { stars: 50, dust: 10, nebulae: 1 },
            normal: { stars: 150, dust: 30, nebulae: 2 },
            dense: { stars: 300, dust: 80, nebulae: 4 }
        };

        const config = intensityConfig[intensity];

        createStars(Math.floor(config.stars * 0.6), 'star-layer-1', [1, 2]);
        createStars(Math.floor(config.stars * 0.3), 'star-layer-2', [1.5, 3]);
        createStars(Math.floor(config.stars * 0.1), 'star-layer-3', [2, 4]);

        createCosmicDust(config.dust);

        for (let i = 0; i < config.nebulae; i++) {
            createNebulaEffects();
        }

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [intensity]);

    return (
        <div
            className={`universal-space-void ${className}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%, #000000 100%)',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none'
            }}
        />
    );
};

export default UniversalSpaceBackground;