// Cosmic Navigation System - Usage Examples and Documentation

/*
## 🌌 STAR Cosmic Navigation System

This system provides immersive 3D planetary navigation with universal cosmic backgrounds.

### Components Created:

1. **universal-space.css** - CSS-based cosmic backgrounds with multi-layer starfields
2. **UniversalPlanetNavigation.tsx** - Main 3D planetary navigation component
3. **EnhancedPlanetButton.tsx** - Individual 3D planet component with animations
4. **UniversalCosmicScene.tsx** - 3D scene wrapper with lighting and starfields
5. **CosmicPageWrapper.tsx** - Page wrapper for consistent cosmic theming

### Planetary Configuration:

The system includes 6 planets positioned in 3D space:
- FEED: Cosmic Feed (center-top, golden)
- CHAT: Quick Chat (right-middle, turquoise)
- PROFILE: Your Profile (center, blue)
- EXPLORE: Cosmic Discovery (right-bottom, pink)
- CREATE: Create Content (left-bottom, green)
- REFLECTION: Daily Reflection (back-bottom, purple)

### Usage Examples:

#### 1. Basic page with cosmic background
```tsx
import { CosmicPageWrapper } from '../components/CosmicPageWrapper';

export default function MyPage() {
    return (
        <CosmicPageWrapper>
            <div className="p-8">
                <h1 className="text-white text-2xl">My Cosmic Page</h1>
                <p className="text-white/80">This page has the universal cosmic background.</p>
            </div>
        </CosmicPageWrapper>
    );
}
```

#### 2. Page with planetary navigation
```tsx
import { CosmicPageWrapperWithNavigation } from '../components/CosmicPageWrapper';

export default function NavigationPage() {
    const handlePlanetSelect = (route: string, label: string) => {
        console.log(`Navigating to ${label} (${route})`);
    };

    return (
        <CosmicPageWrapperWithNavigation
            navigationProps={{
                onPlanetSelect: handlePlanetSelect,
                showLabels: true
            }}
        >
            <div className="p-8">
                <h1 className="text-white text-2xl">Navigation Enabled Page</h1>
                <p className="text-white/80">Click the planets in the top-right to navigate!</p>
            </div>
        </CosmicPageWrapperWithNavigation>
    );
}
```

#### 3. Using individual components
```tsx
import { UniversalCosmicScene } from '../components/UniversalCosmicScene';
import { EnhancedPlanetButton } from '../components/EnhancedPlanetButton';

export default function CustomScenePage() {
    return (
        <div className="w-full h-screen">
            <UniversalCosmicScene
                cameraPosition={[0, 0, 15]}
                starCount={10000}
                showStars={true}
            >
                <EnhancedPlanetButton
                    position={[-5, 2, 0]}
                    size={1.5}
                    color="#FFD700"
                    glowColor="#FFA500"
                    icon="🌟"
                    label="Custom Planet"
                    onClick={() => console.log('Planet clicked!')}
                />
            </UniversalCosmicScene>
        </div>
    );
}
```

#### 4. Full navigation system
```tsx
import { UniversalPlanetNavigation } from '../components/UniversalPlanetNavigation';

export default function FullNavigationPage() {
    return (
        <div className="w-full h-screen bg-black">
            <UniversalPlanetNavigation
                currentRoute="/current-page"
                onPlanetSelect={(route, label) => {
                    console.log(`Selected: ${label} -> ${route}`);
                }}
                showLabels={true}
            />
        </div>
    );
}
```

### Features:

- **3D Planetary Navigation**: Six planets in custom 3D positions with smooth animations
- **Depth Perception**: Multi-layer lighting, fog effects, and atmospheric scattering
- **Interactive Planets**: Click planets to navigate, with selection and current route indicators
- **Cosmic Backgrounds**: Universal black void with parallax starfield layers
- **Responsive Design**: Works on different screen sizes with orbit controls
- **Performance Optimized**: Efficient rendering with proper Three.js optimizations

### Technical Details:

- **Three.js Integration**: Uses @react-three/fiber and @react-three/drei
- **TypeScript Support**: Full type safety with custom JSX element declarations
- **Animation System**: Smooth transitions and hover effects using useFrame
- **Lighting System**: Multiple light sources for realistic cosmic atmosphere
- **Starfield Generation**: Procedural star generation with color variation and depth

### Integration Notes:

1. Import the CSS file in your main app or layout: `import './universal-space.css'`
2. Use CosmicPageWrapper for consistent theming across pages
3. The navigation system uses Next.js router for seamless page transitions
4. All components are designed to work with SSR and client-side rendering

This system transforms the STAR platform into an immersive cosmic experience! ✨
*/