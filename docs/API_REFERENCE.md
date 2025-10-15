# 🌌 STAR Platform API Reference

## Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: `https://star-app-backend.azurewebsites.net`

## Authentication

All protected endpoints require a JWT token from Azure AD B2C:

```http
Authorization: Bearer {jwt_token}
```

## Core Endpoints

### 🧭 Zodiac & Profile

#### Calculate Zodiac Signs

```http
POST /api/v1/zodiac-calculator
Content-Type: application/json

{
  "birthdate": "1990-10-15",
  "birthtime": "14:30",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**

```json
{
  "western_sign": "libra",
  "chinese_sign": "horse",
  "vedic_sign": "virgo",
  "mayan_sign": "ahau",
  "galactic_tone": 7,
  "life_path_number": 8,
  "elemental_balance": {
    "fire": 25,
    "water": 0,
    "air": 50,
    "earth": 25
  }
}
```

#### Cosmic Profile Management

```http
GET /api/v1/cosmic-profile/{user_id}
POST /api/v1/cosmic-profile
PUT /api/v1/cosmic-profile/{user_id}

{
  "user_id": "user123",
  "zodiacSigns": {
    "western": "libra",
    "chinese": "horse",
    "vedic": "virgo",
    "mayan": "ahau",
    "galacticTone": 7
  },
  "numerology": {
    "lifePathNumber": 8
  },
  "elementalBalance": {
    "fire": 25,
    "water": 0,
    "air": 50,
    "earth": 25
  },
  "archetypalTraits": ["Diplomatic", "Transformative"],
  "compatibilityMatrix": { "aries": 0.7, "scorpio": 0.9 },
  "badges": [],
  "ritualTag": "Integration",
  "archetype": "Mystic",
  "lastPlanet": "Profile (Venus)"
}
```

### 🔮 Tarot System

#### Enhanced Tarot Draw

```http
POST /api/v1/tarot/enhanced-draw
Content-Type: application/json

{
  "user_id": "user123",
  "draw_type": "daily",
  "zodiac": "scorpio",
  "galactic_tone": 8,
  "question": "What energy should I focus on today?"
}
```

**Response:**

```json
{
  "cards": [
    {
      "name": "The Tower",
      "position": "past",
      "meaning": "Sudden change and revelation",
      "reversed": false,
      "zodiac_influence": "Amplified for Scorpio - transformation energy"
    }
  ],
  "interpretation": "A transformative shift is unfolding...",
  "energy_flow": [],
  "ritual_suggestions": ["Meditate on change", "Journal your insights"]
}
```

### 🏆 Badge System

#### Badge Position Management

```http
GET /api/v1/profile/badges/{user_id}
POST /api/v1/profile/badges

{
  "user_id": "user123",
  "badge_positions": [
    {
      "id": "scorpio_epic",
      "x": 100,
      "y": 150,
      "src": "/assets/badges/scorpio_epic.png",
      "zIndex": 5,
      "category": "zodiac"
    }
  ],
  "zodiac": "scorpio",
  "ritual_tag": "Integration",
  "archetype": "Mystic",
  "last_planet": "Profile (Venus)"
}
```

### 📱 Social Actions

#### Zodiac-Themed Interactions

```http
POST /api/v1/social-actions
Content-Type: application/json

{
  "user_id": "user123",
  "action_type": "sting",
  "target_post_id": "post456",
  "zodiac_sign": "scorpio",
  "particle_effect": "dark_purple_trail"
}
```

### 📊 Analytics & Insights

#### Log User Action

```http
POST /api/v1/analytics/event
Content-Type: application/json

{
  "user_id": "user123",
  "event_type": "tarot_draw",
  "data": {
    "draw_type": "daily",
    "cards_drawn": 3,
    "zodiac": "scorpio"
  }
}
```

### 📡 Mood Sharing

```http
POST /api/v1/mood/share
Content-Type: application/json

{
  "user_id": "user123",
  "mood": "Resonant",
  "zodiac": "scorpio",
  "timestamp": "2025-10-14T09:57:00Z"
}
```

## Response Codes

| Code | Meaning                 |
|------|-------------------------|
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request            |
| 401  | Unauthorized           |
| 403  | Forbidden              |
| 404  | Not Found              |
| 500  | Internal Server Error  |

## Rate Limits

- **Free Tier**: 1000 requests/hour per user
- **Premium**: 10,000 requests/hour per user

## WebSocket Events (SocketIO)

```javascript
// Connect to cosmic chat
socket.emit('join_element_room', {
  user_id: 'user123',
  element: 'water',
  zodiac: 'scorpio'
});

// Zodiac-themed reactions
socket.emit('zodiac_reaction', {
  post_id: 'post456',
  reaction_type: 'sting',
  particle_effect: true
});
```

---

*Complete API documentation for mythic social platform* ✨