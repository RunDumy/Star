import React from 'react';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';

const CosmicExplore: React.FC = () => {
    return (
        <CosmicPageWrapper>
            <div className="page-content space-color">
                <div className="cosmic-container">
                    <h1 className="glitter-text cosmic-title">Cosmic Explorer</h1>
                    <div className="cosmic-content-panel">
                        <p className="space-color cosmic-description">
                            Venture beyond the known cosmos to discover hidden galaxies,
                            ancient star maps, and celestial phenomena waiting to be found.
                        </p>
                        <div className="cosmic-placeholder">
                            <div className="pulse-orb"></div>
                            <p className="space-glow">Charting the Unknown</p>
                            <p className="cosmic-subtitle">
                                Interactive cosmic exploration tools coming soon...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CosmicPageWrapper>
    );
};

export default CosmicExplore;