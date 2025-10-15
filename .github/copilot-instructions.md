<!-- Copilot / AI agent instructions for the Star repository -->

# STAR Platform - AI Agent Instructions

## Overview

STAR is a zodiac-themed social platform with Next.js + TypeScript frontend (`star-frontend/`) and Flask backend (`star-backend/star_backend_flask/`) using Azure Cosmos DB. Core features include interactive tarot readings, 3D collaborative cosmos, live streaming via AgoraRTC, and real-time social features with multi-zodiac theming (76+ signs, 13 galactic tones, 304 animations).

## Architecture

- **Frontend (`star-frontend/`)**: Next.js 15 + React 18 + TypeScript. Routes in `pages/`, components in `components/`, hooks in `hooks/`, utilities in `lib/`. API calls to `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).
- **Backend (`star-backend/star_backend_flask/`)**: Flask app with Azure Cosmos DB. Main app in `app.py`, v1 API in `api.py` (`/api/v1/*`), auth in `star_auth.py` (`@token_required`), DB helper in `cosmos_db.py` (`CosmosDBHelper` class).
- **Data Flow**: Frontend calls `/api/v1/*` endpoints; backend queries Cosmos DB containers (users, posts, chats, etc.), returns JSON.
- **Real-time**: SocketIO for chat/notifications, AgoraRTC for live streaming.
- **Why**: Monorepo for dependency management; Flask for stability; Cosmos DB for global distribution; Docker for consistency; AgoraRTC for real-time.

## Critical Architecture Patterns

### Dual Frontend Structure
- **Pages**: `star-frontend/pages/` - Next.js routing (main UI pages like `cosmic-feed.tsx`, `tarot-reading.tsx`)  
- **Components**: `star-frontend/src/components/` - Reusable React components
- **3D Engine**: `star-frontend/src/EnhancedStarCosmos.jsx` - Main 3D environment using React Three Fiber
- **API Integration**: Always use `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:5000`

### Backend Data Layer
- **Single DB Helper**: All Cosmos DB operations MUST use `CosmosDBHelper` class from `cosmos_db.py`
- **Container Pattern**: Pre-defined containers (`users`, `posts`, `chats`, `profiles`, `zodiac_dna`, etc.) - use `helper.get_container(name)`
- **API Structure**: All endpoints in `api.py` under `/api/v1/*` prefix - use `@token_required` decorator for auth
- **No Redis**: System runs with `NO_REDIS=true` - use CosmosDB for all persistence

## File Placement

- **Frontend**: Configs (`next.config.mjs`, `package.json`, `tsconfig.json`, `jest.config.cjs`) in `star-frontend/`.
- **Backend**: Core files (`app.py`, `api.py`, `star_auth.py`, `cosmos_db.py`) in `star-backend/star_backend_flask/`. DB migrations in `star-backend/database/`.
- **Docker**: `docker-compose.yml` for local dev with backend (5000), frontend (3000).

## Developer Workflows

- **Docker Setup (Required)**: Run `docker-compose up --build` to start services.
- **Backend Setup (Without Docker)**: `cd star-backend/star_backend_flask; pip install -r ../requirements.txt; python app.py`.
- **Frontend Setup (Without Docker)**: `cd star-frontend; npm install; npm run dev`.
- **Testing**: Backend: `cd star-backend; python -m pytest tests/ -v`; Frontend: `cd star-frontend; npm test`.
- **Debugging**: Backend logs to `app.log`; Frontend use Next.js dev tools.
- **AgoraRTC Testing**: Use `/agora-test` page with Docker + valid credentials.

## Conventions

### Authentication Flow
- **JWT Tokens**: 24-hour expiry for login, 7-day for registration. Token in `Authorization: Bearer <token>` header
- **Frontend Auth**: Use `AuthContext` from `src/lib/AuthContext.tsx` - stores token in localStorage
- **Backend Auth**: `@token_required` decorator validates JWT and injects `g.current_user`
- **API Setup**: Axios interceptor auto-adds auth headers from localStorage

### API & Database Patterns
- **Backend**: API endpoints in `api.py` use `/api/v1/*` (e.g., `/api/v1/posts`, `/api/v1/tarot-pull`). Use `@token_required` from `star_auth.py` for protected routes. Cosmos DB: Use `CosmosDBHelper` methods (e.g., `get_cosmos_helper().query_items()`). Log to `app.log` with `logging`. Env vars: `COSMOS_DB_CONNECTION_STRING`, `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`.
- **Frontend**: TypeScript strict mode. API calls via `axios` to `NEXT_PUBLIC_API_URL`. 3D: `@react-three/fiber` and `@react-three/drei`. Live streaming: `agora-rtc-sdk-ng` and `agora-react-uikit`.
- **Testing**: Backend: `star-backend/tests/test_*.py` (pytest); Frontend: `star-frontend/__tests__/*.test.tsx` (Jest).
- **File Naming**: snake_case for Python (e.g., `cosmos_db.py`), camelCase for TypeScript (e.g., `useAuth.ts`).
- **Zodiac Actions**: Use `ZODIAC_ACTIONS` dict from `api.py` for sign-specific behaviors (e.g., Aries: 'Charge', 'Spark', 'Lead', 'Ignite').

## Integration Points

- **Azure Cosmos DB**: Config via `COSMOS_DB_CONNECTION_STRING`. Containers: users, posts, chats, follows, likes, comments, profiles, notifications, streams. Use `CosmosDBHelper` for all operations.
- **AgoraRTC**: App ID and cert in env vars. For live streaming in `/collaborative-cosmos` and `/agora-test`. Requires valid credentials for functionality.
- **SocketIO**: Real-time chat and notifications via Flask-SocketIO. Rooms for collaborative features.
- **Spotify**: Integration for cosmic playlists (env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`). AI-curated based on elemental energies.
- **IPGeolocation**: Location-aware astrological insights (env var: `IPGEOLOCATION_API_KEY`).

## Testing Patterns

### Frontend Testing (`jest.config.cjs`, `jest.setup.ts`)
- **Mocks**: Three.js, React Three Fiber, Konva.js, SpeechRecognition API all pre-configured
- **Test Structure**: Use `@testing-library/react` - tests in `src/**/__tests__/*.test.tsx`
- **3D Components**: Mock `@react-three/fiber` useFrame, useThree hooks
- **Context Testing**: Mock `AuthContext`, `CosmicThemeContext`, `CollaborationContext`

### Backend Testing (`conftest.py`, `test/api.test.py`)
- **Fixtures**: Auto-mocked Cosmos DB containers return test data via `mock_cosmos_db` fixture
- **Auth Testing**: Use `mock_token` fixture and `@token_required` decorator tests
- **API Mocking**: External APIs (Spotify, IPGeolocation) mocked with controlled responses

## Gotchas

- **Migration**: From Supabase to Cosmos DB - use `CosmosDBHelper` instead of Supabase clients. No Redis caching layer.
- **Live Streaming**: AgoraRTC requires valid `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`. Test with Docker compose.
- **3D Cosmos**: React Three Fiber needs proper canvas setup in `/collaborative-cosmos`. Use `@react-three/drei` for controls.
- **Env Vars**: Required for Azure, AgoraRTC, Spotify - check `.env.example`. Never commit `.env` files.
- **Large Files**: Exclude `*.zip`, `*.tar.gz`, etc. in `.gitignore`.
- **Multi-Zodiac**: Support 76+ signs across Chinese/Western/Vedic traditions. Use `ZODIAC_ACTIONS` for themed interactions.
- **Tarot System**: Drag-and-drop with Konva.js canvases. Energy flows calculated server-side in `/api/v1/tarot/calculate-energy-flow`.
- **Duplicate Directories**: Both `star-frontend/components/` AND `star-frontend/src/components/` exist - prefer `src/components/`
- **Backend Paths**: Multiple copies in `/temp_deploy/` directories - use main `star-backend/star_backend_flask/` only

## Error Handling Patterns

### Backend Error Responses
- **Standard Format**: `{'error': 'message'}` with appropriate HTTP status codes  
- **Logging**: All errors logged to `app.log` with `logging.error(f"Context: {e}")`
- **Rate Limiting**: Login endpoints use `@limiter.limit("50/hour")` decorators
- **Validation**: Marshmallow schemas for request validation

### Frontend Error Boundaries
- **API Failures**: Axios interceptors handle auth errors and network issues
- **3D Errors**: Graceful fallback when WebGL not supported
- **Auth Expiry**: Auto-logout and redirect to login on 401 responses

## Performance Considerations

### Database Optimization
- **Container Queries**: Use partition keys properly in Cosmos DB queries
- **Batch Operations**: Group related DB operations to reduce round trips
- **Caching Strategy**: No Redis - rely on Cosmos DB TTL and frontend state management

### 3D Engine Performance
- **LOD System**: Level of Detail for mobile optimization in `EnhancedStarCosmos.jsx`
- **Coordinate Bounds**: 3D space limited to X: -15→+15, Y: -15→+12, Z: -12→+10
- **Frame Rate**: Use `useFrame` sparingly, prefer React state for UI updates

## Checklist for Contributions

- Move frontend configs to `star-frontend/`.
- Move backend files to `star-backend/star_backend_flask/`.
- Use `CosmosDBHelper` for DB ops (e.g., `helper.query_items(query, params)`).
- Run backend tests: `cd star-backend; python -m pytest tests/ -v`.
- Run frontend tests: `cd star-frontend; npm test`.
- Test AgoraRTC with Docker and valid credentials.
- Verify with Docker compose.
- Check `app.log` for errors.
- Update API endpoints in `api.py` for new features.
- Use `@token_required` decorator for protected routes.
- Follow multi-zodiac theming in UI components.
- Test tarot drag-and-drop with Konva.js integration.

## Key File Structure

```
star-frontend/
├── pages/
│   ├── register.tsx           # Zodiac discovery flow
│   ├── cosmic-profile-enhanced.tsx  # Profile management
│   ├── cosmic-feed.tsx       # Social feed
│   └── tarot-reader.tsx      # Tarot system
├── components/cosmic/
│   ├── PlanetaryNav.tsx      # 3D planetary navigation
│   ├── CosmicProfile.tsx     # Profile components
│   ├── SocialFeed.tsx        # Feed interactions
│   └── TarotDraw.tsx         # Tarot reading component
├── public/assets/
│   ├── profile-schema.json   # Profile JSON schema
│   └── badge-schema.json    # Badge JSON schema

star-backend/star_backend_flask/
├── app.py                    # Main Flask application
├── api.py                   # API endpoints (/api/v1/*)
├── cosmos_db.py             # Cosmos DB helper
├── numerology.py            # Numerology calculations
└── zodiac_calculator.py     # Multi-system zodiac logic
```

## Core User Experience Journey

### ✨ Registration & Zodiac Discovery - The Cosmic Awakening Ritual
Users experience a mythic initiation process that feels like destiny, not just registration. The sign-up flows through 4 phases of cosmic discovery and archetypal alignment.

**Implementation:** `star-frontend/pages/register.tsx` + multiple `/api/v1/*` endpoints

#### 🌌 **STAR Sign-Up Ritual Flow**

**Phase 1: Cosmic Initiation**
1. **Birthdate Entry**: Glowing input field with starfield background triggers zodiac discovery across 5 systems via `/api/v1/zodiac-calculator`
2. **Zodiac Reveal Ceremony**: Animated glyphs reveal Western, Chinese, Vedic, Mayan, Galactic Tone with elemental overlays and audio cues

**Phase 2: Archetypal Alignment** 
3. **Archetype Selector**: Choose from Seeker, Guardian, Rebel, Mystic with visual auras and mentor overlay previews via `/api/v1/archetype`
4. **Sigil & Badge Preview**: Display suggested sigils based on zodiac + archetype combination via `/api/v1/sigils`

**Phase 3: Profile Customization**
5. **Bio & Profile Picture**: Drag-and-drop layout editor with elemental auras via `/api/v1/profile/customization`
6. **Daily Soundtrack**: Choose elemental playlist or sync Spotify via `/api/v1/profile/soundtrack`

**Phase 4: Social Resonance Setup**
7. **Top Follows & Interests**: Suggested mentors based on zodiac compatibility
8. **Account Credentials**: Email, password, JWT token via `/api/v1/auth/register`
9. **Cosmic Entry**: Transition into `EnhancedStarCosmos.jsx` with zodiac avatar and welcome message

### 🧬 Cosmic Profile Generation
Generates a comprehensive profile with archetypal analysis, compatibility insights, Life Path Number, and badge customization.

**Implementation:** `star-frontend/components/cosmic/CosmicProfile.tsx` + Cosmos DB `profiles` container

### 🪐 Immersive 3D Cosmos
A 3D environment with planetary navigation, multi-layer parallax starfields, and zodiac avatars with animated traits.

**Implementation:** `star-frontend/components/cosmic/PlanetaryNav.tsx` + `@react-three/fiber`

### 📱 Social Feed & Ritual Actions
Infinite scroll feed with tarot draws, badge unlocks, ritual reflections, and zodiac-specific interactions (e.g., Scorpio's "Sting" comment).

**Implementation:** `star-frontend/pages/cosmic-feed.tsx` + `/api/v1/social-actions`

### 🔮 Tarot Reading System
Drag-and-drop tarot spreads with AI interpretations influenced by zodiac and numerology.

**Implementation:** `star-frontend/components/cosmic/TarotDraw.tsx` + Konva.js canvas

### 📡 Live Streaming & Community
AgoraRTC streaming with zodiac avatar effects and element-based chat rooms (Fire, Water, Air, Earth).

**Implementation:** `star-frontend/components/cosmic/CommunityHub.tsx` + Azure Web PubSub

## Technical Stack Details

### Frontend Dependencies
```json
{
  "@react-three/fiber": "^8.0.0",
  "@react-three/drei": "^9.0.0",
  "konva": "^9.0.0",
  "react-konva": "^18.0.0",
  "framer-motion": "^10.0.0",
  "agora-rtc-sdk-ng": "^4.0.0",
  "agora-react-uikit": "^1.0.0",
  "axios": "^1.0.0",
  "@azure/msal-browser": "^3.0.0"
}
```

### Backend Dependencies
```python
# Key packages in requirements.txt
flask==3.0.0
azure-cosmos==4.5.0
flask-socketio==5.3.0
azure-identity==1.15.0
marshmallow==3.20.0
pytest==7.4.0
spotipy==2.23.0  # Spotify API integration
pytz==2023.3     # Timezone calculations for zodiac
ephem==4.1.4     # Astronomical calculations for Vedic astrology
```

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id

# Backend (.env)
COSMOS_DB_CONNECTION_STRING=your_cosmos_connection
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_cert
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
IPGEOLOCATION_API_KEY=your_ip_key
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage  # For sigil/badge assets
```

## Database Schema

### Cosmos DB Containers
- **users**: Authentication and basic user data
- **profiles**: Zodiac profiles, numerology, badges, archetype data
- **archetypes**: Archetype definitions, mentor prompts, ritual suggestions
- **sigils**: Zodiac + archetype sigil combinations and metadata
- **posts**: Social feed content
- **chats**: Real-time messaging
- **tarot_draws**: Reading history and interpretations
- **social_actions**: Likes, comments, zodiac reactions
- **streams**: Live streaming sessions
- **notifications**: User notifications
- **follows**: User relationships
- **onboarding_sessions**: Track ritual completion and flow state

### Sample Profile Document
```json
{
  "id": "user_12345",
  "userId": "auth_user_12345",
  "zodiacSigns": {
    "western": "scorpio",
    "chinese": "horse",
    "vedic": "libra",
    "mayan": "ahau",
    "galacticTone": 7
  },
  "numerology": {
    "lifePathNumber": 8,
    "personalYear": 3
  },
  "archetype": {
    "primary": "mystic",
    "secondary": "seeker",
    "mentor": "the_wise_serpent",
    "ritualPreferences": ["tarot", "meditation", "shadow_work"]
  },
  "sigils": [
    {
      "id": "scorpio_mystic_transformation",
      "zodiacBase": "scorpio",
      "archetypeModifier": "mystic",
      "selected": true
    }
  ],
  "badges": [
    {
      "id": "scorpio_master",
      "x": 100,
      "y": 200,
      "category": "zodiac"
    }
  ],
  "soundtrack": {
    "elementalPlaylist": "water_depths",
    "spotifyConnected": true,
    "currentMood": "introspective"
  },
  "onboardingComplete": true,
  "ritualPhase": "archetypal_integration",
  "lastPlanet": "Profile (Venus)"
}
```

## API Endpoints Reference

### Core Endpoints
- `POST /api/v1/zodiac-calculator` - Multi-system zodiac calculation (5 systems)
- `POST /api/v1/archetype` - Archetypal alignment and selection
- `POST /api/v1/sigils` - Sigil and badge suggestions based on zodiac + archetype
- `POST /api/v1/profile/customization` - Drag-and-drop profile layout editor
- `POST /api/v1/profile/soundtrack` - Elemental playlists and Spotify sync
- `POST /api/v1/auth/register` - Mythic account creation with JWT tokens
- `GET/POST /api/v1/cosmic-profile` - Profile management
- `POST /api/v1/tarot/enhanced-draw` - Tarot readings
- `GET/POST /api/v1/profile/badges` - Badge positioning
- `POST /api/v1/social-actions` - Zodiac-themed interactions
- `POST /api/v1/mood/share` - Mood updates
- `GET /api/v1/feed` - Social feed with pagination

### Authentication
All protected endpoints require JWT from Azure AD B2C:
```http
Authorization: Bearer {jwt_token}
```

## Code Quality Standards

### TypeScript Guidelines
```typescript
// Use strict typing
interface CosmicProfile {
  id: string;
  userId: string;
  zodiacSigns: ZodiacSigns;
  numerology: Numerology;
  badges: Badge[];
}

// Prefer functional components with hooks
const CosmicProfile: React.FC<CosmicProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<CosmicProfile | null>(null);
  // Component logic
};
```

### Python Guidelines
```python
# Use type hints
from typing import Dict, List, Optional

@app.route('/api/v1/cosmic-profile', methods=['POST'])
@token_required
def create_cosmic_profile() -> Dict[str, Any]:
    """Create or update user's cosmic profile."""
    try:
        # Endpoint logic
        return jsonify(profile)
    except Exception as e:
        logging.error(f"Profile creation failed: {e}")
        return jsonify({'error': str(e)}), 500
```

## Development Debugging

### Common Issues & Solutions

**Issue**: 3D components not rendering
**Solution**: Check WebGL support and Three.js canvas setup

**Issue**: Cosmos DB connection fails
**Solution**: Verify `COSMOS_DB_CONNECTION_STRING` and container names

**Issue**: AgoraRTC not working
**Solution**: Ensure valid `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`

**Issue**: Authentication failing
**Solution**: Check JWT token format and Azure AD B2C configuration

### Logging
```python
# Backend logging setup
import logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

```typescript
// Frontend debugging
console.log('[STAR]', 'Debug info here');
// Use browser dev tools for React components
```

## Implementation Status & Roadmap

### ✅ Completed Features
- Multi-zodiac calculation (Western, Chinese, Galactic)
- 3D cosmos with planetary navigation
- Tarot reading with drag-and-drop
- Badge customization system
- Real-time chat and streaming
- Azure deployment pipeline

### 🟡 In Progress
- Infinite scroll social feed
- 304 zodiac-specific social actions
- Enhanced numerology integration
- Community matching algorithms

### 📋 Planned Features
- Vedic/Mayan zodiac integration
- Archetypal mentor system with dynamic prompts
- Advanced tarot spreads (Celtic Cross, Zodiac Wheel)
- Sigil generation based on zodiac + archetype combinations
- Elemental soundtrack curation with Spotify API
- Ritual quest system with achievement progression
- Predictive astrology engine
- Mobile app (React Native)

## Security & Privacy

### Data Protection
- JWT tokens with 24-hour expiry
- No sensitive data in localStorage
- HTTPS required for production
- Input validation on all endpoints

### Privacy Controls
- User data anonymization options
- GDPR compliance features
- Opt-out mechanisms for data collection
- Secure deletion of user accounts

## Performance Optimization

### Frontend Performance
- Lazy loading for 3D components
- Image optimization for badges/avatars
- Code splitting for route-based chunks
- Service worker for offline capabilities

### Backend Performance
- Cosmos DB query optimization
- Connection pooling
- Rate limiting on API endpoints
- Caching strategies without Redis

## Deployment

- **Backend**: Azure App Service with Python runtime. Use `AZURE_DEPLOYMENT_GUIDE.md`.
- **Frontend**: Static hosting (Azure Static Web Apps, Netlify, etc.). Configure `NEXT_PUBLIC_API_URL`.
- **Database**: Azure Cosmos DB with containers auto-created by `CosmosDBHelper`.
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Azure Application Insights for error tracking
- **No Vercel/Render**: Deployment is Azure-only as of latest migration.