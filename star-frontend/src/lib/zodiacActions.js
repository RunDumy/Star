// Chinese Zodiac Actions and Utilities
export const CHINESE_ZODIAC_ACTIONS = {
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

// Combined Zodiac Animations (Chinese + Western)
export const ZODIAC_ANIMATIONS = {
  ...CHINESE_ZODIAC_ANIMATIONS,
  ...WESTERN_ZODIAC_ANIMATIONS,
};

// Zodiac color mapping for avatars
const getZodiacColor = (zodiacSign) => {
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

// Action color mapping based on zodiac sign
export const getActionColor = (zodiacSign, action) => {
  const baseColor = getZodiacColor(zodiacSign);
  // Check combined animations for intensity
  const actionIntensity = ZODIAC_ANIMATIONS[action]?.emissiveIntensity || 0.5;
  // Brighten color based on action intensity
  return baseColor; // For now, use base color - could enhance with intensity calculation
};