/**
 * Chinese Zodiac Actions and Utilities
 * Contains animation configurations for all 12 Chinese zodiac animals
 * Each action includes scale, position, rotation, emissive intensity, duration, onRest state, and particle effects
 */
export const CHINESE_ZODIAC_ANIMATIONS = {
  // Rat (Resourceful, Intelligent, Adaptable)
  Squeak: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Nibble: { scale: [1.2, 1.2, 1.2], position: [0, 0, 0.3], emissiveIntensity: 0.5, duration: 150, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1, direction: 'none' } },
  Scamper: { position: [0.4, 0, 0.5], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'forward' } },
  Gather: { scale: [1.25, 1.25, 1.25], rotation: [0, Math.PI / 4, 0], emissiveIntensity: 0.6, duration: 400, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Ox (Reliable, Strong, Determined)
  Moo: { scale: [1.4, 1.4, 1.4], position: [0, 0.1, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Plow: { position: [0, -0.4, 0.2], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'down' } },
  Tread: { position: [0.5, 0, 0.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Carry: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Tiger (Brave, Confident, Competitive)
  Roar: { scale: [1.6, 1.6, 1.6], position: [0, 0.3, 0], emissiveIntensity: 0.7, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 30, speed: 3, direction: 'out' } },
  Pounce: { position: [0, 0, 1.2], scale: [1.3, 1.3, 1.3], emissiveIntensity: 0.6, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'forward' } },
  Stalk: { position: [0.6, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 500, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Claim: { scale: [1.4, 1.4, 1.4], rotation: [0, Math.PI / 4, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Rabbit (Gentle, Quiet, Elegant)
  Hop: { position: [0, 0.5, 0], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 2, direction: 'top' } },
  Bound: { position: [0, 0, 0.7], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Burrow: { position: [0, -0.4, 0], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'down' } },
  Nuzzle: { scale: [1.3, 1.3, 1.3], position: [0, 0.1, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 18, speed: 1.5, direction: 'none' } },

  // Dragon (Confident, Intelligent, Enthusiastic)
  Bellow: { scale: [1.5, 1.5, 1.5], position: [0, 0.3, 0], emissiveIntensity: 0.7, duration: 350, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 30, speed: 3, direction: 'out' } },
  Soar: { position: [0, 0.6, 0], scale: [1.3, 1.3, 1.3], emissiveIntensity: 0.6, duration: 400, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'top' } },
  Circle: { rotation: [0, Math.PI / 2, 0], position: [0.4, 0, 0.4], emissiveIntensity: 0.5, duration: 600, onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Guard: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Snake (Enigmatic, Intelligent, Wise)
  Hiss: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Coil: { rotation: [0, Math.PI / 6, 0], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { rotation: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'none' } },
  Slither: { position: [0.5, 0, 0.5], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 450, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Shed: { scale: [1.4, 1.4, 1.4], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 350, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Horse (Animated, Active, Energetic)
  Neigh: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Gallop: { position: [0, 0, 0.8], scale: [1.3, 1.3, 1.3], emissiveIntensity: 0.6, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'forward' } },
  Trot: { position: [0.5, 0, 0.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Prance: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 4, 0], emissiveIntensity: 0.6, duration: 350, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 22, speed: 2.5, direction: 'out' } },

  // Goat (Calm, Gentle, Sympathetic)
  Bleat: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 2, direction: 'top' } },
  Graze: { position: [0, -0.3, 0.2], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'down' } },
  Climb: { position: [0, 0.5, 0], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Provide: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Monkey (Sharp, Smart, Curious)
  Chatter: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Swing: { position: [0.4, 0.4, 0], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Play: { rotation: [0, Math.PI / 3, 0], position: [0.3, 0, 0.3], emissiveIntensity: 0.5, duration: 400, onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Discover: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Rooster (Observant, Hardworking, Courageous)
  Crow: { scale: [1.5, 1.5, 1.5], position: [0, 0.3, 0], emissiveIntensity: 0.7, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },
  Peck: { position: [0, 0, 0.4], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 2, direction: 'forward' } },
  Strut: { position: [0.5, 0, 0.2], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Announce: { scale: [1.4, 1.4, 1.4], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Dog (Loyal, Honest, Conservative)
  Bark: { scale: [1.4, 1.4, 1.4], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Fetch: { position: [0, 0, 0.6], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Guard: { position: [0.4, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Protect: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Pig (Compassionate, Generous, Diligent)
  Oink: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 2, direction: 'top' } },
  Root: { position: [0, -0.3, 0.3], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'down' } },
  Trot: { position: [0.4, 0, 0.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Feast: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },
};

// Chinese Zodiac Actions (mapping zodiac signs to their characteristic actions)
export const CHINESE_ZODIAC_ACTIONS = {
  'Rat': { comment: 'Squeak', like: 'Nibble', follow: 'Scamper', share: 'Gather' },
  'Ox': { comment: 'Moo', like: 'Plow', follow: 'Tread', share: 'Carry' },
  'Tiger': { comment: 'Roar', like: 'Pounce', follow: 'Stalk', share: 'Claim' },
  'Rabbit': { comment: 'Hop', like: 'Bound', follow: 'Burrow', share: 'Nuzzle' },
  'Dragon': { comment: 'Bellow', like: 'Soar', follow: 'Circle', share: 'Guard' },
  'Snake': { comment: 'Hiss', like: 'Coil', follow: 'Slither', share: 'Shed' },
  'Horse': { comment: 'Neigh', like: 'Gallop', follow: 'Trot', share: 'Prance' },
  'Goat': { comment: 'Bleat', like: 'Graze', follow: 'Climb', share: 'Provide' },
  'Monkey': { comment: 'Chatter', like: 'Swing', follow: 'Play', share: 'Discover' },
  'Rooster': { comment: 'Crow', like: 'Peck', follow: 'Strut', share: 'Announce' },
  'Dog': { comment: 'Bark', like: 'Fetch', follow: 'Guard', share: 'Protect' },
  'Pig': { comment: 'Oink', like: 'Root', follow: 'Trot', share: 'Feast' }
};

// Western Zodiac Actions and Animations
export const WESTERN_ZODIAC_ACTIONS = {
  'Aries': { comment: 'Charge', like: 'Spark', follow: 'Lead', share: 'Ignite' },
  'Taurus': { comment: 'Graze', like: 'Root', follow: 'Tread', share: 'Sustain' },
  'Gemini': { comment: 'Chatter', like: 'Flit', follow: 'Connect', share: 'Spread' },
  'Cancer': { comment: 'Nurture', like: 'Embrace', follow: 'Guide', share: 'Shelter' },
  'Leo': { comment: 'Roar', like: 'Shine', follow: 'Strut', share: 'Inspire' },
  'Virgo': { comment: 'Analyze', like: 'Tidy', follow: 'Serve', share: 'Refine' },
  'Libra': { comment: 'Balance', like: 'Harmonize', follow: 'Align', share: 'Share' },
  'Scorpio': { comment: 'Probe', like: 'Sting', follow: 'Hunt', share: 'Transform' },
  'Sagittarius': { comment: 'Quest', like: 'Aim', follow: 'Explore', share: 'Inspire' },
  'Capricorn': { comment: 'Plan', like: 'Climb', follow: 'Build', share: 'Achieve' },
  'Aquarius': { comment: 'Innovate', like: 'Spark', follow: 'Rebel', share: 'Enlighten' },
  'Pisces': { comment: 'Dream', like: 'Flow', follow: 'Drift', share: 'Connect' }
};

// Vedic Zodiac Actions
export const VEDIC_ZODIAC_ACTIONS = {
  'Ashwini': { comment: 'DASH', like: 'NURTURE', follow: 'GUIDE', share: 'BLESS' },
  'Bharani': { comment: 'SURRENDER', like: 'SACRED', follow: 'SERVE', share: 'OFFER' },
  'Krittika': { comment: 'PURIFY', like: 'HONE', follow: 'CUT', share: 'CONSECRATE' },
  'Rohini': { comment: 'BLOOM', like: 'NURTURE', follow: 'CHERISH', share: 'ILLUMINATE' },
  'Mrigashira': { comment: 'SEARCH', like: 'QUEST', follow: 'SEEK', share: 'DISCOVER' },
  'Ardra': { comment: 'DRIVE', like: 'RAIN', follow: 'STIR', share: 'CASCADE' },
  'Punarvasu': { comment: 'RENEW', like: 'REVIVE', follow: 'REJUVENATE', share: 'REFRESH' },
  'Pushya': { comment: 'NOURISH', like: 'SUSTAIN', follow: 'PROTECT', share: 'FERTILIZE' },
  'Ashlesha': { comment: 'COIL', like: 'ENTRANCE', follow: 'ENTWINE', share: 'MYSTIFY' },
  'Magha': { comment: 'RADIATE', like: 'ROYAL', follow: 'COMMAND', share: 'BESTOW' },
  'Purva Phalguni': { comment: 'SHINE', like: 'RELAX', follow: 'COMFORT', share: 'BRIGHTEN' },
  'Uttara Phalguni': { comment: 'BALANCE', like: 'ALIGN', follow: 'HARMONIZE', share: 'STABILIZE' },
  'Hasta': { comment: 'WEAVE', like: 'GRASP', follow: 'ACCESS', share: 'REACH' },
  'Chitra': { comment: 'CREATE', like: 'DESIGN', follow: 'ART', share: 'BEAUTIFY' },
  'Swati': { comment: 'WIND', like: 'FLOW', follow: 'FREE', share: 'GENTLE' },
  'Vishakha': { comment: 'FOCUS', like: 'SEPARATE', follow: 'CLARIFY', share: 'BRANCH' },
  'Anuradha': { comment: 'DEVOTE', like: 'SERVE', follow: 'ALIGN', share: 'FULFILL' },
  'Jyeshtha': { comment: 'KNOW', like: 'ELDER', follow: 'SENIOR', share: 'WISE' },
  'Mula': { comment: 'ROOT', like: 'GROUND', follow: 'FOUNDATION', share: 'ESSENCE' },
  'Purva Ashadha': { comment: 'HORSE', like: 'TRIUMPH', follow: 'VICTOR', share: 'PREVAIL' },
  'Uttara Ashadha': { comment: 'CONQUER', like: 'WIN', follow: 'ACHIEVE', share: 'MASTER' },
  'Shravana': { comment: 'HEAR', like: 'LISTEN', follow: 'ATTUNE', share: 'RESONATE' },
  'Dhanishta': { comment: 'MUSIC', like: 'RHYTHM', follow: 'DRUM', share: 'CELEBRATE' },
  'Shatabhisha': { comment: 'STAR', like: 'TWINKLE', follow: 'HEAL', share: 'REMEDY' },
  'Purva Bhadrapada': { comment: 'MOON', like: 'WATER', follow: 'FOOT', share: 'PATH' },
  'Uttara Bhadrapada': { comment: 'LIGHT', like: 'BURN', follow: 'AUSPICIOUS', share: 'DIVINE' },
  'Revati': { comment: 'WEALTH', like: 'PROSPER', follow: 'GUIDE', share: 'FISH' },
  'Mesha': { comment: 'IGNITE', like: 'CHARGE', follow: 'LEAD', share: 'RAM' },
  'Vrishabha': { comment: 'ROOT', like: 'HOLD', follow: 'STEADY', share: 'BULL' },
  'Mithuna': { comment: 'LINK', like: 'CONNECT', follow: 'MERGE', share: 'TWIN' },
  'Karka': { comment: 'CRAB', like: 'DELTA', follow: 'ARC', share: 'CANCER' },
  'Simha': { comment: 'LION', like: 'ROAR', follow: 'KING', share: 'LEO' },
  'Kanya': { comment: 'SEED', like: 'VIRGIN', follow: 'ROOT', share: 'HARVEST' },
  'Tula': { comment: 'SCALE', like: 'BALANCE', follow: 'WEIGH', share: 'LIBER' },
  'Vrishchika': { comment: 'STING', like: 'TAIL', follow: 'SCORP', share: 'LATITUDE' },
  'Dhanu': { comment: 'AIM', like: 'BOW', follow: 'CENTER', share: 'SAGI' },
  'Makara': { comment: 'SEA', like: 'GOAT', follow: 'MOUNT', share: 'CAPRICORN' },
  'Kumbha': { comment: 'POT', like: 'URNA', follow: 'POUR', share: 'AQUARIUS' },
  'Meena': { comment: 'FISH', like: 'WATER', follow: 'SANKHA', share: 'PISCES' }
};

// Mayan Zodiac Actions (Tzolkin Day Signs)
export const MAYAN_ZODIAC_ACTIONS = {
  'Imix': { comment: 'PRIMORDIAL', like: 'ENDER', follow: 'DRAGON', share: 'SEA' },
  'Ik': { comment: 'SPIRIT', like: 'WIND', follow: 'BREATH', share: 'WORD' },
  'Akbal': { comment: 'NIGHT', like: 'DARK', follow: 'HOUSE', share: 'SURPRISE' },
  'Kan': { comment: 'YELLOW', like: 'SEED', follow: 'MAIZE', share: 'SUNFLOWER' },
  'Chicchan': { comment: 'COSMIC', like: 'FORCE', follow: 'HEART', share: 'SERPENT' },
  'Cimi': { comment: 'DEATH', like: 'TRANSIT', follow: 'DEATH', share: 'CHANGE' },
  'Manik': { comment: 'GIFT', like: 'HAND', follow: 'RECEIVE', share: 'GRASP' },
  'Lamat': { comment: 'STAR', like: 'VENUS', follow: 'RADIANT', share: 'BEAUTY' },
  'Muluc': { comment: 'MOON', like: 'WATER', follow: 'OFFERING', share: 'JAGUAR' },
  'Oc': { comment: 'DOG', like: 'LOYAL', follow: 'GUIDE', share: 'HEART' },
  'Chuen': { comment: 'ART', like: 'MONKEY', follow: 'CREATE', share: 'SEED' },
  'Eb': { comment: 'ROAD', like: 'GRASS', follow: 'GREEN', share: 'TOBACCO' },
  'Ben': { comment: 'MAIZE', like: 'REED', follow: 'STALK', share: 'GROWTH' },
  'Ix': { comment: 'SPIRIT', like: 'JAGUAR', follow: 'WILD', share: 'MAGIC' },
  'Men': { comment: 'EAGLE', like: 'VISION', follow: 'HIGH', share: 'CONQUER' },
  'Cib': { comment: 'WISDOM', like: 'CANDLE', follow: 'WAX', share: 'REMEMBER' },
  'Caban': { comment: 'EARTH', like: 'WORLD', follow: 'TREMOR', share: 'LIGHTNING' },
  'Etznab': { comment: 'SACRED', like: 'KNIFE', follow: 'CUT', share: 'MIRROR' },
  'Cauac': { comment: 'STORM', like: 'RAIN', follow: 'CLEANSE', share: 'FIRE' },
  'Ahau': { comment: 'SUN', like: 'LIGHT', follow: 'LORD', share: 'ENLIGHTEN' }
};

// Aztec Zodiac Actions (Tonalpohualli Day Signs)
export const AZTEC_ZODIAC_ACTIONS = {
  'Cipactli': { comment: 'CROC', like: 'WATER', follow: 'PRIME', share: 'SEA' },
  'Ehecatl': { comment: 'WIND', like: 'BLOW', follow: 'MOVE', share: 'BREATH' },
  'Calli': { comment: 'HOUSE', like: 'HOME', follow: 'SHELTER', share: 'BUILD' },
  'Cuetzpalin': { comment: 'LIZARD', like: 'REGENERATE', follow: 'CHANGE', share: 'REVIVE' },
  'Coatl': { comment: 'SNAKE', like: 'WISE', follow: 'MYTHIC', share: 'SERIES' },
  'Miquiztli': { comment: 'DEATH', like: 'SKULL', follow: 'PASS', share: 'END' },
  'Mazatl': { comment: 'DEER', like: 'GRACEFUL', follow: 'SACRED', share: 'FOOD' },
  'Tochtli': { comment: 'RABBIT', like: 'MOON', follow: 'FERTILITY', share: 'DRINK' },
  'Atl': { comment: 'WATER', like: 'FLOW', follow: 'CLEANSE', share: 'LIFE' },
  'Itzcuintli': { comment: 'DOG', like: 'LOYAL', follow: 'TRIUMPH', share: 'FAITHFUL' },
  'Ozomatli': { comment: 'MONKEY', like: 'PLAY', follow: 'ART', share: 'CRAFT' },
  'Malinalli': { comment: 'GRASS', like: 'TWIST', follow: 'BEND', share: 'KNOT' },
  'Acatl': { comment: 'REED', like: 'STRAIGHT', follow: 'RIGID', share: 'BURDEN' },
  'Ocelotl': { comment: 'JAGUAR', like: 'STRENGTH', follow: 'WAR', share: 'NIGHT' },
  'Cuauhtli': { comment: 'EAGLE', like: 'SKY', follow: 'VISION', share: 'FREEDOM' },
  'Cozcacuauhtli': { comment: 'BUZZARD', like: 'SACRIFICE', follow: 'RITUAL', share: 'HEAVEN' },
  'Ollin': { comment: 'MOVEMENT', like: 'EARTHQUAKE', follow: 'CHANGE', share: 'RUBBER' },
  'Tecpatl': { comment: 'SILEX', like: 'SACRIFICE', follow: 'SHOOT', share: 'CUT' },
  'Quiahuitl': { comment: 'RAIN', like: 'STORM', follow: 'WASH', share: 'FERTILITY' },
  'Xochitl': { comment: 'FLOWER', like: 'BEAUTY', follow: 'ART', share: 'BLOOM' }
};

export const WESTERN_ZODIAC_ANIMATIONS = {
  // Aries (March 21–April 19) - Brave, Energetic, Competitive
  Charge: { scale: [1.5, 1.5, 1.5], position: [0, 0, 1], emissiveIntensity: 0.7, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 30, speed: 3, direction: 'forward' } },
  Spark: { scale: [1.3, 1.3, 1.3], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Lead: { position: [0.5, 0, 0.5], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'forward' } },
  Ignite: { scale: [1.4, 1.4, 1.4], rotation: [0, Math.PI / 4, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },

  // Taurus (April 20–May 20) - Reliable, Patient, Practical
  Graze: { scale: [1.3, 1.3, 1.3], position: [0, -0.3, 0.2], emissiveIntensity: 0.5, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1.5, direction: 'down' } },
  Root: { scale: [1.2, 1.2, 1.2], position: [0, -0.2, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1, direction: 'none' } },
  Tread: { position: [0.4, 0, 0.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Sustain: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Gemini (May 21–June 20) - Adaptable, Communicative, Witty
  Chatter: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Flit: { position: [0.3, 0.3, 0.3], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Connect: { rotation: [0, Math.PI / 6, 0], position: [0.4, 0, 0.4], emissiveIntensity: 0.5, duration: 350, onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Spread: { scale: [1.4, 1.4, 1.4], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Cancer (June 21–July 22) - Intuitive, Emotional, Protective
  Nurture: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Embrace: { scale: [1.2, 1.2, 1.2], position: [0, 0, 0.3], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1, direction: 'none' } },
  Guide: { position: [0.4, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Shelter: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Leo (July 23–August 22) - Creative, Generous, Warm-hearted
  Roar: { scale: [1.6, 1.6, 1.6], position: [0, 0.3, 0], emissiveIntensity: 0.7, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 30, speed: 3, direction: 'out' } },
  Shine: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },
  Strut: { position: [0.5, 0, 0.3], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Inspire: { scale: [1.5, 1.5, 1.5], rotation: [0, Math.PI / 4, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },

  // Virgo (August 23–September 22) - Analytical, Practical, Hardworking
  Analyze: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Tidy: { scale: [1.2, 1.2, 1.2], position: [0, 0, 0.2], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1, direction: 'none' } },
  Serve: { position: [0.4, 0, 0.3], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Refine: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Libra (September 23–October 22) - Diplomatic, Fair-minded, Social
  Balance: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Harmonize: { scale: [1.2, 1.2, 1.2], position: [0, 0.2, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 1, direction: 'none' } },
  Align: { position: [0.4, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 350, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Share: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },

  // Scorpio (October 23–November 21) - Resourceful, Brave, Passionate
  Probe: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Sting: { position: [0, 0, 0.5], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.6, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 15, speed: 2, direction: 'forward' } },
  Hunt: { position: [0.5, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Transform: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },

  // Sagittarius (November 22–December 21) - Optimistic, Freedom-loving, Honest
  Quest: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
  Aim: { position: [0, 0, 0.6], scale: [1.3, 1.3, 1.3], emissiveIntensity: 0.5, duration: 200, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Explore: { position: [0.5, 0, 0.5], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Inspire: { scale: [1.4, 1.4, 1.4], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 2, direction: 'out' } },

  // Capricorn (December 22–January 19) - Responsible, Disciplined, Self-controlled
  Plan: { scale: [1.3, 1.3, 1.3], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Climb: { position: [0, 0.5, 0], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Build: { position: [0.4, 0, 0.3], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Achieve: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },

  // Aquarius (January 20–February 18) - Progressive, Original, Independent
  Innovate: { scale: [1.4, 1.4, 1.4], rotation: [0, Math.PI / 8, 0], emissiveIntensity: 0.6, duration: 250, onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },
  Rebel: { position: [0.5, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'forward' } },
  Enlighten: { scale: [1.4, 1.4, 1.4], position: [0, 0.3, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 25, speed: 3, direction: 'out' } },
  Spark: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.5, duration: 200, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },

  // Pisces (February 19–March 20) - Compassionate, Artistic, Intuitive
  Dream: { scale: [1.3, 1.3, 1.3], position: [0, 0.3, 0], emissiveIntensity: 0.5, duration: 250, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'top' } },
  Flow: { position: [0.3, 0, 0.3], scale: [1.2, 1.2, 1.2], emissiveIntensity: 0.5, duration: 300, onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Drift: { position: [0.4, 0, 0.4], rotation: [0, Math.PI / 6, 0], emissiveIntensity: 0.5, duration: 400, onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'none' } },
  Connect: { scale: [1.3, 1.3, 1.3], position: [0, 0.2, 0], emissiveIntensity: 0.6, duration: 300, onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 }, particles: { count: 20, speed: 2, direction: 'out' } },
};

// Combined Zodiac Actions (Chinese + Western + Vedic + Mayan + Aztec)
export const ZODIAC_ACTIONS = {
  ...CHINESE_ZODIAC_ACTIONS,
  ...WESTERN_ZODIAC_ACTIONS,
  ...VEDIC_ZODIAC_ACTIONS,
  ...MAYAN_ZODIAC_ACTIONS,
  ...AZTEC_ZODIAC_ACTIONS,
};

// Combined Zodiac Animations (Chinese + Western)
export const ZODIAC_ANIMATIONS = {
  ...CHINESE_ZODIAC_ANIMATIONS,
  ...WESTERN_ZODIAC_ANIMATIONS,
};

/**
 * Zodiac color mapping for avatars
 * @param {string} zodiacSign - The zodiac sign to get color for
 * @returns {string} Hex color code for the zodiac sign
 */
export const getZodiacColor = (zodiacSign) => {
  const colorMap = {
    // Chinese Zodiac Colors
    'Rat': '#8B4513',      // Saddle Brown
    'Ox': '#228B22',       // Forest Green
    'Tiger': '#FF4500',    // Orange Red
    'Rabbit': '#FFB6C1',   // Light Pink
    'Dragon': '#FFD700',   // Gold
    'Snake': '#32CD32',    // Lime Green
    'Horse': '#FF6347',    // Tomato
    'Goat': '#F0E68C',     // Khaki
    'Monkey': '#DAA520',   // Golden Rod
    'Rooster': '#DC143C',  // Crimson
    'Dog': '#8B4513',      // Saddle Brown
    'Pig': '#FF69B4',      // Hot Pink

    // Western Zodiac Colors
    'Aries': '#FF4500',    // Orange Red (Mars - fire)
    'Taurus': '#228B22',   // Forest Green (Venus - earth)
    'Gemini': '#FFD700',   // Gold (Mercury - air)
    'Cancer': '#87CEEB',   // Sky Blue (Moon - water)
    'Leo': '#FFD700',      // Gold (Sun - fire)
    'Virgo': '#32CD32',    // Lime Green (Mercury - earth)
    'Libra': '#FFB6C1',    // Light Pink (Venus - air)
    'Scorpio': '#DC143C',  // Crimson (Mars/Pluto - water)
    'Sagittarius': '#FF6347', // Tomato (Jupiter - fire)
    'Capricorn': '#8B4513', // Saddle Brown (Saturn - earth)
    'Aquarius': '#87CEEB', // Sky Blue (Uranus/Saturn - air)
    'Pisces': '#FF69B4',   // Hot Pink (Neptune/Jupiter - water)
  };
  return colorMap[zodiacSign] || '#4a90e2'; // Default to blue if not found
};

/**
 * Get zodiac actions by sign
 * @param {string} zodiacSign - The zodiac sign name
 * @returns {Object|null} Object containing comment, like, follow, share actions or null if not found
 */
export const getZodiacActions = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return null;
  return ZODIAC_ACTIONS[zodiacSign] || null;
};

/**
 * Get zodiac animation by action name
 * @param {string} actionName - The action name to get animation for
 * @returns {Object|null} Animation configuration object or null if not found
 */
export const getZodiacAnimation = (actionName) => {
  if (!actionName || typeof actionName !== 'string') return null;
  return ZODIAC_ANIMATIONS[actionName] || null;
};

/**
 * Check if a zodiac sign belongs to specific zodiac systems
 * @param {string} zodiacSign - The zodiac sign to check
 * @returns {boolean} True if it belongs to the specified system
 */
export const isChineseZodiac = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return false;
  const chineseSigns = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  return chineseSigns.includes(zodiacSign);
};

export const isWesternZodiac = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return false;
  const westernSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return westernSigns.includes(zodiacSign);
};

export const isVedicZodiac = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return false;
  const vedicSigns = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati', 'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  return vedicSigns.includes(zodiacSign);
};

export const isMayanZodiac = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return false;
  const mayanSigns = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat', 'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau'];
  return mayanSigns.includes(zodiacSign);
};

export const isAztecZodiac = (zodiacSign) => {
  if (!zodiacSign || typeof zodiacSign !== 'string') return false;
  const aztecSigns = ['Cipactli', 'Ehecatl', 'Calli', 'Cuetzpalin', 'Coatl', 'Miquiztli', 'Mazatl', 'Tochtli', 'Atl', 'Itzcuintli', 'Ozomatli', 'Malinalli', 'Acatl', 'Ocelotl', 'Cuauhtli', 'Cozcacuauhtli', 'Ollin', 'Tecpatl', 'Quiahuitl', 'Xochitl'];
  return aztecSigns.includes(zodiacSign);
};

/**
 * Get the zodiac type (Chinese or Western)
 * @param {string} zodiacSign - The zodiac sign to check
 * @returns {string|null} 'chinese', 'western', or null if invalid
 */
export const getZodiacType = (zodiacSign) => {
  if (isChineseZodiac(zodiacSign)) return 'chinese';
  if (isWesternZodiac(zodiacSign)) return 'western';
  return null;
};

/**
 * Get all available zodiac signs
 * @returns {Object} Object with chinese and western arrays of zodiac signs
 */
export const getAllZodiacSigns = () => {
  return {
    chinese: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    western: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  };
};

/**
 * Get a random zodiac action for a given zodiac sign
 * @param {string} zodiacSign - The zodiac sign
 * @returns {string|null} Random action name or null if sign not found
 */
export const getRandomZodiacAction = (zodiacSign) => {
  const actions = getZodiacActions(zodiacSign);
  if (!actions) return null;

  const actionTypes = Object.values(actions);
  return actionTypes[Math.floor(Math.random() * actionTypes.length)];
};

/**
 * Get zodiac actions by type (comment, like, follow, share)
 * @param {string} zodiacSign - The zodiac sign
 * @param {string} actionType - Type of action ('comment', 'like', 'follow', 'share')
 * @returns {string|null} Action name or null if not found
 */
export const getZodiacActionByType = (zodiacSign, actionType) => {
  const actions = getZodiacActions(zodiacSign);
  if (!actions || !actionType) return null;

  return actions[actionType] || null;
};

/**
 * Check if an action name exists in the animations
 * @param {string} actionName - The action name to check
 * @returns {boolean} True if action exists, false otherwise
 */
export const hasZodiacAnimation = (actionName) => {
  return Boolean(getZodiacAnimation(actionName));
};

/**
 * Get all available action names for animations
 * @returns {string[]} Array of all available action names
 */
export const getAllActionNames = () => {
  return Object.keys(ZODIAC_ANIMATIONS);
};

/**
 * Action color mapping based on zodiac sign
 * @param {string} zodiacSign - The zodiac sign
 * @param {string} action - The action name
 * @returns {string} Color hex code
 */
export const getActionColor = (zodiacSign, action) => {
  if (!zodiacSign || !action) return '#4a90e2'; // Default color

  const baseColor = getZodiacColor(zodiacSign);
  // Check combined animations for intensity
  const actionIntensity = ZODIAC_ANIMATIONS[action]?.emissiveIntensity || 0.5;
  // Brighten color based on action intensity (could be enhanced with intensity calculation)
  return baseColor;
};

/**
 * COMPLETE ZODIAC ACTION SYSTEM - STAR Platform Multi-Cultural Social Interactions
 *
 * Complete Coverage Across 5 Ancient Traditions:
 * ==============================================================================
 * - Chinese: 12 signs (48 action mappings) - Animals: Rat, Ox, Tiger, etc.
 * - Western: 12 signs (48 action mappings) - Constellations: Aries, Taurus, etc.
 * - Vedic: 39 signs (156 action mappings) - Nakshatras & Rashis
 * - Mayan: 20 signs (80 action mappings) - Tzolkin Days: Imix, Ik, Akbal, etc.
 * - Aztec: 20 signs (80 action mappings) - Tonalpohualli: Cipactli, Ehecatl, etc.
 *
 * Total: 91 signs × 4 actions = 364 frontend actions + 48 backend trigger phrases
 *
 * Key Features:
 * - Cultural authenticity per tradition (Sanskrit, Nahuatl, etc.)
 * - Dynamic user preference switching between systems
 * - 3D interactive social interactions with cosmic animations
 */

/**
 * Default export object containing all main zodiac utilities
 */
export default {
  // Data objects - expanded for multi-system support
  CHINESE_ZODIAC_ANIMATIONS,
  CHINESE_ZODIAC_ACTIONS,
  WESTERN_ZODIAC_ACTIONS,
  WESTERN_ZODIAC_ANIMATIONS,
  VEDIC_ZODIAC_ACTIONS,
  MAYAN_ZODIAC_ACTIONS,
  AZTEC_ZODIAC_ACTIONS,
  ZODIAC_ACTIONS,
  ZODIAC_ANIMATIONS,

  // Utility functions
  getZodiacActions,
  getZodiacAnimation,
  getZodiacColor,
  getActionColor,
  getRandomZodiacAction,
  getZodiacActionByType,
  hasZodiacAnimation,
  getAllActionNames,

  // Type checking functions - enhanced for multi-system
  isChineseZodiac,
  isWesternZodiac,
  getZodiacType,
  getAllZodiacSigns,
};
