# 🏅 STAR Badge Manifest Schema

## Overview
The STAR Badge System creates a mythic progression system where users unlock cosmic achievements based on their zodiac journey, social interactions, and mystical discoveries. Each badge represents a spiritual milestone in their cosmic evolution.

## Badge Manifest Structure

```typescript
interface BadgeManifest {
  metadata: BadgeMetadata;
  unlock_conditions: UnlockConditions;
  visual: BadgeVisual;
  effects: BadgeEffects;
  rarity: BadgeRarity;
  zodiac_requirements?: ZodiacRequirements;
}

interface BadgeMetadata {
  id: string; // e.g., "aries_fire_master", "lunar_eclipse_witness"
  name: string; // Display name
  description: string; // Mystical description
  category: BadgeCategory;
  tradition?: ZodiacTradition; // 'western' | 'chinese' | 'vedic' | 'mayan' | 'galactic'
  created_at: string; // ISO timestamp
  updated_at: string;
  version: number;
}

interface UnlockConditions {
  type: 'milestone' | 'combo' | 'temporal' | 'social' | 'mystical';
  conditions: UnlockCondition[];
  logic_operator: 'AND' | 'OR'; // For multiple conditions
  cooldown_hours?: number; // Some badges have time restrictions
}

interface UnlockCondition {
  condition_type: string;
  target_value: number | string | boolean;
  current_progress?: number;
  description: string;
}

interface BadgeVisual {
  icon_url: string;
  background_gradient: [string, string]; // Two-color gradient
  border_style: BorderStyle;
  glow_effect?: GlowEffect;
  sigil_pattern?: SigilPattern; // Custom sigil for mystical badges
  animation?: AnimationConfig;
}

interface BadgeEffects {
  cosmic_influence: CosmicInfluence;
  social_modifiers: SocialModifiers;
  ui_enhancements: UIEnhancements;
}
```

## Badge Categories

### 🔥 Elemental Mastery Badges
- **Fire Element Master**: Master all fire signs (Aries, Leo, Sagittarius)
- **Earth Element Sage**: Deep earth sign understanding
- **Air Element Prophet**: Air sign communication mastery  
- **Water Element Oracle**: Emotional water sign depths

### 🌟 Zodiac System Completion Badges
- **Western Constellation**: Complete Western zodiac journey
- **Dragon Path Walker**: Complete Chinese zodiac cycle
- **Vedic Star Mapper**: Complete Vedic zodiac understanding
- **Mayan Time Keeper**: Complete Mayan calendar badges
- **Galactic Tone Master**: Complete all 13 Galactic Tones

### 🎴 Tarot & Mystical Badges
- **Tarot Adept**: Complete multiple tarot readings
- **Sigil Crafter**: Generate unique personal sigils
- **Numerology Sage**: Master life path understanding
- **Birth Chart Astronomer**: Deep natal chart analysis

### 👥 Social Cosmic Badges  
- **Constellation Builder**: Create collaborative star patterns
- **Harmonic Resonance**: Achieve high compatibility scores
- **Cosmic Influencer**: Inspire multiple zodiac traditions
- **Stellar Community**: Build cross-zodiac friendships

### 🌙 Temporal & Planetary Badges
- **Eclipse Witness**: Active during eclipse events
- **Mercury Retrograde Survivor**: Navigate challenging periods
- **Full Moon Mystic**: Engage during full moon phases
- **Planetary Hour Guardian**: Master planetary timing

## Rarity System

```typescript
enum BadgeRarity {
  COMMON = 'common',        // 60% unlock rate - Basic achievements
  RARE = 'rare',           // 25% unlock rate - Moderate challenges  
  EPIC = 'epic',           // 10% unlock rate - Significant milestones
  LEGENDARY = 'legendary', // 4% unlock rate - Extraordinary feats
  MYTHIC = 'mythic'        // 1% unlock rate - Once-in-a-lifetime events
}
```

### Rarity Visual Effects
- **Common**: Soft glow, basic gradients
- **Rare**: Pulsing animation, dual-color gradients
- **Epic**: Particle effects, three-color gradients  
- **Legendary**: Cosmic swirls, aurora effects
- **Mythic**: Reality-bending effects, constellation patterns

## Example Badge Definitions

### Fire Element Master (Epic)
```json
{
  "metadata": {
    "id": "fire_element_master",
    "name": "🔥 Fire Element Master",
    "description": "You have unlocked the secrets of cosmic fire - passion, creation, and transformation flow through your digital essence.",
    "category": "elemental_mastery",
    "tradition": "western"
  },
  "unlock_conditions": {
    "type": "combo",
    "logic_operator": "AND",
    "conditions": [
      {
        "condition_type": "posts_by_sign",
        "target_value": 10,
        "description": "Create 10 posts as Aries, Leo, OR Sagittarius"
      },
      {
        "condition_type": "fire_sign_interactions", 
        "target_value": 50,
        "description": "50+ interactions with fire sign users"
      },
      {
        "condition_type": "tarot_fire_cards",
        "target_value": 3,
        "description": "Draw 3+ fire-themed tarot cards"
      }
    ]
  },
  "visual": {
    "icon_url": "/badges/fire-master.png",
    "background_gradient": ["#ff4757", "#ff6b3d"],
    "border_style": {
      "type": "flame_border",
      "width": 3,
      "color": "#ff8c42"
    },
    "glow_effect": {
      "intensity": 0.8,
      "color": "#ff4757",
      "pulse_speed": 2000
    },
    "animation": {
      "type": "flame_flicker",
      "duration": 3000,
      "loop": true
    }
  },
  "effects": {
    "cosmic_influence": {
      "fire_energy_boost": 1.25,
      "passion_multiplier": 1.15
    },
    "social_modifiers": {
      "fire_sign_compatibility": 1.2,
      "leadership_presence": 1.1
    },
    "ui_enhancements": {
      "profile_flame_border": true,
      "fire_particle_trail": true
    }
  }
}
```

### Eclipse Witness (Legendary) 
```json
{
  "metadata": {
    "id": "eclipse_witness_2024",
    "name": "🌑 Eclipse Witness",
    "description": "During the cosmic dance of shadow and light, you stood present as celestial bodies aligned. The universe has marked your soul.",
    "category": "temporal_mystical"
  },
  "unlock_conditions": {
    "type": "temporal",
    "logic_operator": "AND",
    "conditions": [
      {
        "condition_type": "active_during_eclipse",
        "target_value": true,
        "description": "Be active on STAR during solar/lunar eclipse"
      },
      {
        "condition_type": "eclipse_meditation_post",
        "target_value": 1,
        "description": "Share eclipse reflection or meditation"
      }
    ]
  },
  "visual": {
    "background_gradient": ["#1a1a2e", "#16213e"],
    "glow_effect": {
      "intensity": 1.0,
      "color": "#silver",
      "type": "eclipse_corona"
    },
    "animation": {
      "type": "eclipse_shadow_dance",
      "duration": 8000
    }
  },
  "effects": {
    "cosmic_influence": {
      "shadow_work_mastery": 2.0,
      "transformation_catalyst": 1.5
    },
    "ui_enhancements": {
      "eclipse_crown_effect": true,
      "shadow_light_aura": true
    }
  }
}
```

## Badge Fusion System (Future Enhancement)

### Life Path Badge Fusion
Users can combine related badges to create more powerful "Fused Badges":

```typescript
interface FusedBadge {
  component_badges: string[]; // IDs of badges being fused
  fusion_result: BadgeManifest;
  fusion_requirements: {
    minimum_component_rarity: BadgeRarity;
    zodiac_harmony_required: boolean;
    cosmic_timing?: PlanetaryAlignment;
  };
}
```

### Example Fusion: Cosmic Trinity Master
Fusing Fire + Water + Air Element Masters creates the ultimate "**Cosmic Trinity Master**" badge with reality-altering UI effects.

## Storage & Implementation

### Cosmos DB Container: `badge_manifests`
```typescript
interface BadgeManifestDocument {
  id: string; // Badge ID
  partition_key: string; // Badge category for efficient queries
  manifest: BadgeManifest;
  active: boolean;
  created_by: string; // System or admin ID
  tags: string[]; // For search and filtering
}
```

### User Badge Progress: `user_badges`
```typescript
interface UserBadgeDocument {
  id: string; // user_id + badge_id combination
  partition_key: string; // user_id for efficient user queries
  user_id: string;
  badge_id: string;
  status: 'locked' | 'in_progress' | 'unlocked' | 'equipped';
  progress: UnlockCondition[]; // Current progress on each condition
  unlocked_at?: string; // ISO timestamp when unlocked
  equipped: boolean; // Whether badge is currently displayed
  display_order: number; // Order in badge showcase
}
```

## API Endpoints

```
GET  /api/v1/badges/manifest           # All available badges
GET  /api/v1/badges/user/:id          # User's badges and progress  
POST /api/v1/badges/check-unlock      # Check if user unlocked new badges
PUT  /api/v1/badges/equip/:badge_id   # Equip/unequip badge for display
GET  /api/v1/badges/leaderboard       # Rarity-based leaderboard
POST /api/v1/badges/fusion            # Attempt badge fusion (future)
```

This badge manifest schema creates a rich, mystical progression system that honors the cosmic depth of STAR while providing clear gamification mechanics that encourage exploration across all zodiac traditions.