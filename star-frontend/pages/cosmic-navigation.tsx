import { AdaptiveEnhancedCosmicScene } from '../src/components/cosmic/EnhancedCosmicScene';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function CosmicNavigationTest() {
  return (
    <ErrorBoundary>
      <AdaptiveEnhancedCosmicScene
        enableStarfield={true}
        enablePlanets={true}
        enableVolumetricDepth={true}
        enableDepthCues={true}
        enableDashboard={true}
      />
    </ErrorBoundary>
  );
}