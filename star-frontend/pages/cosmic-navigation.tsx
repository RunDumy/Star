import { CosmicNavigationScene } from '../src/components/cosmic/CosmicNavigationScene';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function CosmicNavigationTest() {
  return (
    <ErrorBoundary>
      <CosmicNavigationScene />
    </ErrorBoundary>
  );
}