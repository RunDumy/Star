import React from 'react';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';

const CosmicChat: React.FC = () => {
    return (
        <CosmicPageWrapper>
            <div className="page-content space-color">
                <div className="cosmic-container">
                    <h1 className="glitter-text cosmic-title">Star Chat</h1>
                    <div className="cosmic-content-panel">
                        <p className="space-color cosmic-description">
                            Connect with fellow space travelers across the cosmic void.
                            Share your celestial journey with souls who understand the stars.
                        </p>
                        <div className="cosmic-placeholder">
                            <div className="pulse-orb"></div>
                            <p className="space-glow">Coming Soon</p>
                            <p className="cosmic-subtitle">
                                Real-time cosmic conversations await...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CosmicPageWrapper>
    );
};

export default CosmicChat;