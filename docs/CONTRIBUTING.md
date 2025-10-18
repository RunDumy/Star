# 🌌 Contributing to STAR Platform

Welcome to the STAR Platform! We're building a cosmic social experience that blends astrology, AI, and real-time social features. This guide will help you contribute effectively to our Vercel + Render + Supabase stack.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.10+** and **pip**
- **GitHub account** with SSH keys configured
- **Supabase account** (free tier available)
- **Render account** (free tier available)
- **Vercel account** (free tier available)

### Local Development Setup

1. **Clone and Setup**

   ```bash
   git clone https://github.com/RunDumy/Star.git
   cd Star
   ```

2. **Environment Configuration**

   ```bash
   # Copy environment template
   cp .env.template .env

   # Edit .env with your API keys:
   # - Supabase URL and keys
   # - AgoraRTC app ID
   # - Spotify credentials (optional)
   # - IPGeolocation key (optional)
   ```

3. **Database Setup**

   ```bash
   # Verify Supabase schema
   python check_supabase_tables.py
   ```

4. **Docker Development** (Recommended)

   ```bash
   # Start all services
   docker-compose up --build

   # Access points:
   # Frontend: http://localhost:3000
   # Backend: http://localhost:5000
   ```

5. **Manual Development** (Alternative)

   ```bash
   # Backend
   cd star-backend/star_backend_flask
   pip install -r ../requirements.txt
   python app.py

   # Frontend (new terminal)
   cd star-frontend
   npm install
   npm run dev
   ```

## 🏗️ Development Workflow

### 1. Choose Your Quest

- **Bug Fixes**: Check [Issues](../../issues) labeled `bug`
- **Features**: Look for `enhancement` or `feature-request` labels
- **Documentation**: `documentation` labeled issues
- **Cosmic Features**: Astrology, tarot, 3D cosmos related

### 2. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-cosmic-enhancement

# Or for bug fixes
git checkout -b fix/zodiac-calculation-bug
```

### 3. Development Guidelines

#### **Frontend (Next.js + TypeScript)**

- Use **TypeScript strict mode** - no `any` types
- Follow **React hooks patterns** - custom hooks in `/hooks`
- **Component structure**: `/components/[feature]/[Component].tsx`
- **Styling**: Tailwind CSS with consistent design tokens
- **3D Features**: Use `@react-three/fiber` and `@react-three/drei`
- **Testing**: Jest + React Testing Library, 85% coverage minimum

#### **Backend (Flask + Python)**

- **Type hints** required for all functions
- **Error handling** with proper logging
- **API responses** follow JSON:API specification
- **Database operations** use Supabase Python client
- **Testing**: pytest with comprehensive coverage

#### **Database (Supabase)**

- **RLS policies** required for all tables
- **Indexes** for performance-critical queries
- **Migrations** through SQL files (no direct schema changes)
- **Real-time** features use Supabase subscriptions

### 4. Testing Requirements

#### **Frontend Testing**

```bash
cd star-frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

#### **Backend Testing**

```bash
cd star-backend
python -m pytest tests/ -v  # Run all tests
python -m pytest tests/ -k "test_name"  # Specific test
```

#### **Integration Testing**

```bash
# Test with Docker
docker-compose -f docker-compose.test.yml up --build
```

### 5. Code Quality Standards

#### **TypeScript/React**

```typescript
// ✅ Good: Strict typing
interface CosmicProfile {
  id: string;
  userId: string;
  zodiacSigns: ZodiacData;
  archetype: Archetype;
}

// ✅ Good: Custom hooks
const useCosmicProfile = (userId: string) => {
  const [profile, setProfile] = useState<CosmicProfile | null>(null);
  // ... hook logic
  return { profile, loading, error };
};

// ❌ Bad: Any types
const handleData = (data: any) => { ... }
```

#### **Python/Flask**

```python
# ✅ Good: Type hints
from typing import Dict, List, Optional

@app.route('/api/v1/cosmic-profile', methods=['POST'])
@token_required
def create_cosmic_profile() -> Dict[str, Any]:
    """Create or update user's cosmic profile."""
    try:
        # Implementation
        return jsonify(profile)
    except Exception as e:
        logging.error(f"Profile creation failed: {e}")
        return jsonify({'error': str(e)}), 500
```

### 6. Commit Standards

#### **Commit Message Format**

```
type(scope): description

[optional body]

[optional footer]
```

#### **Types**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

#### **Examples**

```bash
feat(tarot): add celtic cross spread layout
fix(zodiac): correct libra compatibility calculation
docs(readme): update deployment instructions
test(auth): add JWT token validation tests
```

### 7. Pull Request Process

#### **Before Submitting**

- ✅ All tests pass
- ✅ Code follows style guidelines
- ✅ Documentation updated
- ✅ No console.log statements
- ✅ Environment variables documented

#### **PR Template**

```markdown
## 🌌 Cosmic Enhancement

### Description
Brief description of the cosmic improvement

### Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security enhancement

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility tested

### Screenshots (if applicable)
<!-- Add screenshots of UI changes -->

### Checklist
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for review
```

## 🎯 Architecture Guidelines

### **Frontend Architecture**

```text
star-frontend/
├── components/          # Reusable React components
│   ├── cosmic/         # Astrology/zodiac components
│   ├── ui/            # Generic UI components
│   └── layout/        # Layout components
├── pages/             # Next.js pages/routes
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── styles/            # Global styles and Tailwind config
└── __tests__/         # Test files
```

### **Backend Architecture**

```text
star-backend/
├── star_backend_flask/
│   ├── app.py         # Main Flask application
│   ├── api.py         # API endpoints
│   ├── cosmos_db.py   # Database operations
│   ├── star_auth.py   # Authentication
│   └── zodiac_calculator.py  # Astrology logic
└── tests/             # Backend tests
```

### **Database Design**

- **Users table**: Core user data
- **Profiles table**: Extended user profiles with zodiac data
- **Posts table**: Social media content
- **RLS policies**: Row-level security on all tables
- **Indexes**: Optimized for common queries

## 🔒 Security Guidelines

### **Environment Variables**

- Never commit `.env` files
- Use different values for dev/staging/production
- Rotate API keys regularly
- Document all required environment variables

### **Authentication**

- JWT tokens with appropriate expiration
- Supabase Auth for user management
- Secure password policies
- Rate limiting on sensitive endpoints

### **Data Protection**

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚀 Deployment

### **Automatic Deployment**

```bash
# Push to main triggers deployment
git add .
git commit -m "feat: add cosmic enhancement"
git push origin main
```

### **Manual Deployment**

```bash
# Frontend (Vercel)
cd star-frontend
vercel --prod

# Backend (Render)
# Use Render dashboard or CLI
render deploy
```

## 🧪 Testing Strategy

### **Unit Tests**

- Component logic and utilities
- API endpoint validation
- Business logic functions

### **Integration Tests**

- API to database communication
- Frontend to backend interaction
- Third-party API integrations

### **End-to-End Tests**

- User journey testing
- Critical path validation
- Cross-browser compatibility

## 📊 Performance Guidelines

### **Frontend**

- Bundle size < 500KB
- First paint < 2 seconds
- 60fps animations
- Mobile-first responsive design

### **Backend**

- API response time < 500ms
- Database queries optimized
- Caching for frequently accessed data
- Horizontal scaling ready

## 🎨 Design System

### **Color Palette**

- Cosmic backgrounds: Deep space gradients
- Zodiac colors: Elemental color schemes
- UI elements: Consistent spacing and typography

### **Typography**

- Headers: Cosmic-themed fonts
- Body: Readable sans-serif
- Special elements: Astrological symbols

### **Components**

- Consistent spacing using Tailwind
- Accessible color contrast
- Touch-friendly mobile elements

## 🌟 Cosmic Coding Standards

### **Naming Conventions**

- **Components**: PascalCase (`CosmicProfile.tsx`)
- **Functions**: camelCase (`calculateZodiacSign`)
- **Files**: kebab-case (`cosmic-profile.tsx`)
- **Constants**: SCREAMING_SNAKE_CASE (`ZODIAC_SIGNS`)

### **Code Comments**

```typescript
/**
 * Calculates user's zodiac sign based on birth date
 * @param birthDate - User's birth date in ISO format
 * @returns Primary zodiac sign with additional cosmic data
 */
const calculateZodiacSign = (birthDate: string): ZodiacResult => {
  // Implementation with detailed comments
};
```

## 🆘 Getting Help

### **Issues and Questions**

- **Bug reports**: Use issue templates
- **Feature requests**: Describe user impact
- **Questions**: Check documentation first, then ask in discussions

### **Code Review Process**

- At least 1 reviewer required
- Automated tests must pass
- Code style checks pass
- Documentation updated

## 🌌 Recognition

Contributors who make significant cosmic enhancements may receive:

- **Stardust Points**: Recognition in contributor leaderboard
- **Cosmic Badges**: Special zodiac-themed badges
- **Mentor Status**: Ability to review PRs and guide new contributors

---

**Ready to contribute to the cosmic revolution?** 🌟

Your contributions help build the future of social astrology. Every line of code brings us closer to understanding our place in the cosmos!

**Questions?** Open an issue or join our cosmic community discussions.
 
 