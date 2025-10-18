<!-- Copilot / AI agent instructions for the Star repository -->

# STAR Platform - AI Agent Instructions

## Overview

STAR is a zodiac-themed social platform with Next.js + TypeScript frontend (`star-frontend/`) and Flask backend (`star-backend/star_backend_flask/`) using Supabase Database. Core features include interactive tarot readings, 3D collaborative cosmos, live streaming via AgoraRTC, and real-time social features with multi-zodiac theming (91+ signs across 5 traditions, 364+ actions, 304 animations).

## Architecture

- **Frontend (`star-frontend/`)**: Next.js 14 + React 18 + TypeScript. Routes in `pages/`, components in `src/components/`, hooks in `src/hooks/`, utilities in `src/lib/`. API calls to `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).
- **Backend (`star-backend/star_backend_flask/`)**: Flask 3.0 app with Supabase Database. Main app in `app.py`, API blueprints in `api_blueprint.py` (`/api/v1/*`), analytics in `analytics_api.py`, auth in `star_auth.py` (`@token_required`), DB helper in `cosmos_db.py` (`SupabaseDBHelper` class).
- **Data Flow**: Frontend calls `/api/v1/*` endpoints; backend queries Supabase tables (users, posts, chats, etc.), returns JSON.
- **Real-time**: SocketIO for chat/notifications, AgoraRTC for live streaming.
- **Why**: Monorepo for dependency management; Flask for stability; Supabase for global distribution; Docker for consistency; AgoraRTC for real-time.

## Critical Architecture Patterns

### Dual Frontend Structure
- **Pages**: `star-frontend/pages/` - Next.js routing (main UI pages like `cosmic-feed.tsx`, `tarot-reading.tsx`)
- **Components**: `star-frontend/src/components/` - Reusable React components organized by feature (cosmic/, zodiac/, collaborative/)
- **3D Engine**: `star-frontend/src/EnhancedStarCosmos.jsx` - Main 3D environment using React Three Fiber
- **Contexts**: `star-frontend/src/contexts/` - React contexts for state management (AuthContext, etc.)

### Backend Data Layer
- **Blueprint Pattern**: API endpoints organized in `api_blueprint.py` and `analytics_api.py` blueprints
- **Single DB Helper**: All Supabase operations MUST use `SupabaseDBHelper` class from `cosmos_db.py`
- **Table Pattern**: Pre-defined Supabase tables (users, posts, profiles, chats, follows, etc.) - use `supabase.table(name)`
- **API Structure**: All endpoints in blueprints under `/api/v1/*` prefix - use `@token_required` decorator for auth

## File Placement

- **Frontend**: Configs (`next.config.mjs`, `package.json`, `tsconfig.json`, `jest.config.cjs`) in `star-frontend/`.
- **Backend**: Core files (`app.py`, `api_blueprint.py`, `analytics_api.py`, `star_auth.py`, `cosmos_db.py`) in `star-backend/star_backend_flask/`. DB schema in root `supabase_schema.sql`.
- **Docker**: `docker-compose.yml` for local dev with backend (5000), frontend (3000).
- **Environment**: `.env` files in backend directory, `.env.local` in frontend directory.

## Developer Workflows

- **Docker Setup (Required)**: Run `docker-compose up --build` to start services with health checks.
- **Backend Setup (Without Docker)**: `cd star-backend/star_backend_flask; pip install -r ../../requirements.txt; python app.py`.
- **Frontend Setup (Without Docker)**: `cd star-frontend; npm install; npm run dev`.
- **Testing**: Backend: `cd star-backend/star_backend_flask; python -m pytest ../tests/ -v`; Frontend: `cd star-frontend; npm test`.
- **AgoraRTC Testing**: Use `/agora-test` page with Docker + valid credentials.
- **Database**: Schema auto-created via `supabase_schema.sql`; use Supabase dashboard for management.

## Conventions

### Authentication Flow
- **Supabase Auth**: JWT tokens managed by Supabase Auth service. Token in `Authorization: Bearer <token>` header
- **Frontend Auth**: Use AuthContext from `src/contexts/AuthContext.tsx` - stores token in localStorage
- **Backend Auth**: `@token_required` decorator validates JWT and injects `current_user` parameter
- **API Setup**: Axios interceptor auto-adds auth headers from localStorage

### API & Database Patterns
- **Frontend**: TypeScript strict mode. API calls via `axios` to `NEXT_PUBLIC_API_URL`. 3D: `@react-three/fiber` and `@react-three/drei`. Live streaming: `agora-rtc-sdk-ng`.
- **Backend**: All database operations through Supabase client. Use `supabase.table(name)` pattern.
- **Testing**: Backend: `pytest` in `star-backend/tests/`; Frontend: `Jest` in `star-frontend/__tests__/`
- **File Naming**: snake_case for Python (e.g., `cosmos_db.py`), camelCase for TypeScript (e.g., `useAuth.ts`).
- **Zodiac Actions**: Use zodiac utilities from `src/utils/zodiacUtils.ts` for sign-specific behaviors.

## Integration Points
- **Supabase Database**: Config via `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Tables: users, profiles, posts, chats, follows, likes, comments, notifications, streams. Use Supabase client for all operations.
- **AgoraRTC**: App ID and cert in env vars. For live streaming in `/collaborative-cosmos` and `/agora-test`. Requires valid credentials for functionality.
- **SocketIO**: Real-time chat and notifications via Flask-SocketIO. Rooms for collaborative features.
- **Spotify**: Integration for cosmic playlists (env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`).
- **IPGeolocation**: Location-aware astrological insights (env var: `IPGEOLOCATION_API_KEY`).

### Frontend Testing (`jest.config.cjs`, `jest.setup.ts`)
- **Mocks**: Three.js, React Three Fiber, Konva.js, SpeechRecognition API all pre-configured
- **Test Structure**: Use `@testing-library/react` - tests in `src/**/__tests__/*.test.tsx`
- **3D Components**: Mock `@react-three/fiber` useFrame, useThree hooks
- **Context Testing**: Mock AuthContext and other React contexts

### Backend Testing (`conftest.py`, `test/api.test.py`)
- **Auth Testing**: Use `@token_required` decorator tests with mock tokens
- **API Mocking**: External APIs (Spotify, IPGeolocation) mocked with controlled responses
- **Database Testing**: Mock Supabase client for unit tests

## Gotchas

- **Supabase Migration**: Recently migrated from Azure Cosmos DB - use `SupabaseDBHelper` instead of CosmosDBHelper. No Redis caching layer.
- **3D Cosmos**: React Three Fiber needs proper canvas setup in `/collaborative-cosmos`. Use `@react-three/drei` for controls.
- **Component Organization**: All components now in `star-frontend/src/components/` - no more duplicate directories.
- **Backend Paths**: Use main `star-backend/star_backend_flask/` only - ignore any `/temp_deploy/` directories.
- **Environment Variables**: Backend uses `.env` in `star-backend/star_backend_flask/`, frontend uses `.env.local` in `star-frontend/`.

## Error Handling Patterns

### Backend Error Responses
- **Logging**: All errors logged with `logging.error(f"Context: {e}")`
- **Rate Limiting**: Login endpoints use `@limiter.limit("50/hour")` decorators
- **Validation**: Request validation in API blueprints

### Frontend Error Boundaries
- **API Failures**: Axios interceptors handle auth errors and network issues
- **3D Errors**: Graceful fallback when WebGL not supported
- **Auth Expiry**: Auto-logout and redirect to login on 401 responses

## Performance Considerations

### Database Optimization
- **Supabase Queries**: Use proper indexing and RLS policies
- **Batch Operations**: Group related DB operations to reduce round trips
- **Real-time**: Leverage Supabase real-time subscriptions where possible

### 3D Engine Performance
- **LOD System**: Level of Detail for mobile optimization in `EnhancedStarCosmos.jsx`
- **Coordinate Bounds**: 3D space limited to X: -15→+15, Y: -15→+12, Z: -12→+10
- **Frame Rate**: Use `useFrame` sparingly, prefer React state for UI updates

## Checklist for Contributions

- Move frontend configs to `star-frontend/`.
- Move backend files to `star-backend/star_backend_flask/`.
- Use Supabase client for DB ops (e.g., `supabase.table(name)`).
- Run backend tests: `cd star-backend/star_backend_flask; python -m pytest ../tests/ -v`.
- Run frontend tests: `cd star-frontend; npm test`.
- Test AgoraRTC with Docker and valid credentials.
- Verify with Docker compose.
- Check `app.log` for errors.
- Update API blueprints in `api_blueprint.py` for new features.
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
│   └── tarot-reading.tsx      # Tarot system
├── src/components/
│   ├── cosmic/
│   │   ├── PlanetaryNav.tsx      # 3D planetary navigation
│   │   ├── CosmicProfile.tsx     # Profile components
│   │   ├── SocialFeed.tsx        # Feed interactions
│   │   └── TarotDraw.tsx         # Tarot reading component
│   ├── zodiac/
│   │   ├── ZodiacCompatibility.tsx
│   │   └── ZodiacDashboard.tsx
│   └── collaborative/
│       └── CommunityHub.tsx
├── src/lib/
│   └── AuthContext.tsx        # Authentication context

star-backend/star_backend_flask/
├── app.py                    # Main Flask application
├── api_blueprint.py          # API endpoints (/api/v1/*)
├── analytics_api.py          # Analytics endpoints
├── cosmos_db.py              # Supabase DB helper
├── star_auth.py              # Authentication utilities
└── database_utils.py         # Database helper functions
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

**Implementation:** `star-frontend/src/components/cosmic/CosmicProfile.tsx` + Supabase `profiles` table

### 🪐 Immersive 3D Cosmos
A 3D environment with planetary navigation, multi-layer parallax starfields, and zodiac avatars with animated traits.

**Implementation:** `star-frontend/src/components/cosmic/PlanetaryNav.tsx` + `@react-three/fiber`

### 📱 Social Feed & Ritual Actions
Infinite scroll feed with tarot draws, badge unlocks, ritual reflections, and zodiac-specific interactions (e.g., Scorpio's "Sting" comment).

**Implementation:** `star-frontend/pages/cosmic-feed.tsx` + `/api/v1/social-actions`

### 🔮 Tarot Reading System
Drag-and-drop tarot spreads with AI interpretations influenced by zodiac and numerology.

**Implementation:** `star-frontend/src/components/cosmic/TarotDraw.tsx` + Konva.js canvas

### 📡 Live Streaming & Community
AgoraRTC streaming with zodiac avatar effects and element-based chat rooms (Fire, Water, Air, Earth).

**Implementation:** `star-frontend/src/components/collaborative/CommunityHub.tsx` + Socket.IO

## Technical Stack Details

### Frontend Dependencies
```json
{
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.122.0",
  "agora-rtc-sdk-ng": "^4.22.2",
  "axios": "^1.12.2",
  "framer-motion": "^12.23.22",
  "konva": "^10.0.2",
  "react-konva": "^18.2.14",
  "next": "^14.2.15",
  "react": "^18.3.1",
  "zustand": "^4.5.4"
}
```

### Backend Dependencies
```python
# Key packages in requirements.txt
flask==3.0.0
supabase==2.7.1
flask-socketio==5.3.0
python-socketio==5.8.0
python-engineio==4.7.1
httpx==0.26.0
psycopg2-binary==2.9.7
spotipy==2.23.0
pytest==7.4.0
```

### Environment Variables
```bash
# Frontend (.env.local in star-frontend/)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend (.env in star-backend/star_backend_flask/)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SECRET_KEY=your-very-secure-random-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
IPGEOLOCATION_API_KEY=your-ipgeolocation-key
```

## Database Schema

### Supabase Tables
- **users**: Authentication and basic user data (managed by Supabase Auth)
- **profiles**: Zodiac profiles, numerology, badges, archetype data
- **posts**: Social feed content
- **chats**: Real-time messaging
- **follows**: User relationships
- **likes**: Post interactions
- **comments**: Post comments
- **notifications**: User notifications
- **streams**: Live streaming sessions
- **tarot_draws**: Reading history and interpretations
- **social_actions**: Likes, comments, zodiac reactions

## API Endpoints Reference

### Core Endpoints
- `POST /api/v1/zodiac-calculator` - Multi-system zodiac calculation (5 traditions)
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
- `GET /api/v1/notifications` - User notifications

### Authentication
All protected endpoints require JWT from Supabase Auth:
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
def create_cosmic_profile(current_user) -> Dict[str, Any]:
    """Create or update user's cosmic profile."""
    try:
        # Endpoint logic with Supabase
        result = supabase.table('profiles').insert(profile_data).execute()
        return jsonify({'success': True, 'profile': result.data[0]})
    except Exception as e:
        logging.error(f"Profile creation failed: {e}")
        return jsonify({'error': str(e)}), 500
```

## Development Debugging

### Common Issues & Solutions

**Issue**: 3D components not rendering
**Solution**: Check WebGL support and Three.js canvas setup in `EnhancedStarCosmos.jsx`

**Issue**: Supabase connection fails
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in environment variables

**Issue**: AgoraRTC not working
**Solution**: Ensure valid `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`

**Issue**: Authentication failing
**Solution**: Check JWT token format and Supabase Auth configuration

### Logging
```python
# Backend logging setup
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In route handlers
logger.error(f"Error context: {e}")
```

```typescript
// Frontend debugging
console.log('[STAR]', 'Debug info here');
// Use browser dev tools for React components
```

## Implementation Status & Roadmap

### ✅ Completed Features
- Multi-zodiac calculation (Western, Chinese, Vedic, Mayan, Galactic)
- 3D cosmos with planetary navigation
- Tarot reading with drag-and-drop
- Badge customization system
- Real-time chat and streaming
- Vercel + Render + Supabase deployment pipeline
- Comprehensive testing suite (Jest + PyTest)

### 🟡 In Progress
- Infinite scroll social feed
- Enhanced numerology integration
- Community matching algorithms

### 📋 Planned Features
- Advanced tarot spreads (Celtic Cross, Zodiac Wheel)
- Sigil generation based on zodiac + archetype combinations
- Ritual quest system with achievement progression
- Mobile app (React Native)

## Security & Privacy

### Data Protection
- JWT tokens with Supabase Auth
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
- Supabase query optimization
- Connection pooling
- Rate limiting on API endpoints

## Deployment

- **Frontend**: Vercel for static hosting. Configure `NEXT_PUBLIC_API_URL`.
- **Backend**: Render for container hosting. Use `render.yaml` for config.
- **Database**: Supabase with tables auto-created via `supabase_schema.sql`.
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Vercel Analytics + Supabase Dashboard
- **Docker**: Local development with `docker-compose.yml`


### Frontend Testing (`jest.config.cjs`, `jest.setup.ts`)
- **Mocks**: Three.js, React Three Fiber, Konva.js, SpeechRecognition API all pre-configured
- **Test Structure**: Use `@testing-library/react` - tests in `src/**/__tests__/*.test.tsx`
- **3D Components**: Mock `@react-three/fiber` useFrame, useThree hooks
- **Context Testing**: Mock `AuthContext`, `CosmicThemeContext`, `CollaborationContext`

### Backend Testing (`conftest.py`, `test/api.test.py`)
- **Auth Testing**: Use `mock_token` fixture and `@token_required` decorator tests
- **API Mocking**: External APIs (Spotify, IPGeolocation) mocked with controlled responses

## Gotchas

- **Migration**: From Azure Cosmos DB to Supabase - use `SupabaseDBHelper` instead of CosmosDBHelper. No Redis caching layer.
- **3D Cosmos**: React Three Fiber needs proper canvas setup in `/collaborative-cosmos`. Use `@react-three/drei` for controls.
- **Duplicate Directories**: Both `star-frontend/components/` AND `star-frontend/src/components/` exist - prefer `src/components/`
- **Backend Paths**: Multiple copies in `/temp_deploy/` directories - use main `star-backend/star_backend_flask/` only

## Error Handling Patterns

### Backend Error Responses
- **Logging**: All errors logged to `app.log` with `logging.error(f"Context: {e}")`
- **Rate Limiting**: Login endpoints use `@limiter.limit("50/hour")` decorators
- **Validation**: Marshmallow schemas for request validation

### Frontend Error Boundaries
- **API Failures**: Axios interceptors handle auth errors and network issues
- **3D Errors**: Graceful fallback when WebGL not supported
- **Auth Expiry**: Auto-logout and redirect to login on 401 responses

## Performance Considerations

### Database Optimization
- **Table Queries**: Use proper indexing in Supabase queries
- **Batch Operations**: Group related DB operations to reduce round trips
- **Caching Strategy**: No Redis - rely on Supabase RLS and frontend state management

### 3D Engine Performance
- **LOD System**: Level of Detail for mobile optimization in `EnhancedStarCosmos.jsx`
- **Coordinate Bounds**: 3D space limited to X: -15→+15, Y: -15→+12, Z: -12→+10
- **Frame Rate**: Use `useFrame` sparingly, prefer React state for UI updates

## Checklist for Contributions

- Move frontend configs to `star-frontend/`.
- Move backend files to `star-backend/star_backend_flask/`.
- Use `SupabaseDBHelper` for DB ops (e.g., `helper.table(name)`).
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

**Implementation:** `star-frontend/components/cosmic/CommunityHub.tsx` + Socket.IO

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
  "supabase": "^1.0.0"
}
```

### Backend Dependencies
```python
# Key packages in requirements.txt
flask==3.0.0
supabase==2.3.0
flask-socketio==5.3.0
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
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_cert
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
IPGEOLOCATION_API_KEY=your_ip_key
```

## Database Schema

### Supabase Tables
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
All protected endpoints require JWT from Supabase Auth:
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
**Solution**: Check JWT token format and Supabase Auth configuration

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
- Vercel + Fly.io deployment pipeline

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

- **Backend**: Fly.io with Python runtime. Use `FLY_DEPLOYMENT_GUIDE.md`.
- **Frontend**: Vercel for static hosting. Configure `NEXT_PUBLIC_API_URL`.
- **Database**: Supabase with tables auto-created by `SupabaseDBHelper`.
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Application Insights for error tracking
- **No Azure**: Deployment is Vercel + Fly.io + Supabase only as of latest migration.