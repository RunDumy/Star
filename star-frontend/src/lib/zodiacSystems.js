// platforms/star-app/src/lib/zodiacSystems.js
// Comprehensive Zodiac Systems for Enhanced STAR Platform
// Supporting 36 zodiac signs across 3 complete systems

export const ZODIAC_SYSTEMS = {
  WESTERN: {
    name: 'Western Astrology',
    signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    elements: {
      Fire: ['Aries', 'Leo', 'Sagittarius'],
      Earth: ['Taurus', 'Virgo', 'Capricorn'],
      Air: ['Gemini', 'Libra', 'Aquarius'],
      Water: ['Cancer', 'Scorpio', 'Pisces']
    },
    qualities: {
      Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
      Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
      Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
    }
  },
  CHINESE: {
    name: 'Chinese Zodiac',
    signs: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    elements: {
      Wood: ['Tiger', 'Rabbit'],
      Fire: ['Snake', 'Horse'],
      Earth: ['Ox', 'Dragon', 'Goat', 'Dog'],
      Metal: ['Monkey', 'Rooster'],
      Water: ['Rat', 'Pig']
    },
    qualities: {
      Yin: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Snake', 'Pig'],
      Yang: ['Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Dragon']
    }
  },
  VEDIC: {
    name: 'Vedic Astrology',
    signs: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'],
    elements: {
      Fire: ['Mesha', 'Simha', 'Dhanus'],
      Earth: ['Vrishabha', 'Kanya', 'Makara'],
      Air: ['Mithuna', 'Tula', 'Kumbha'],
      Water: ['Karka', 'Vrishchika', 'Meena']
    },
    qualities: {
      Movable: ['Mesha', 'Karka', 'Tula', 'Makara'],
      Fixed: ['Vrishabha', 'Simha', 'Vrishchika', 'Kumbha'],
      Dual: ['Mithuna', 'Kanya', 'Dhanus', 'Meena']
    }
  },
  MAYAN: {
    name: 'Mayan Astrology',
    signs: ['Crocodile', 'Wind', 'Jaguar', 'Road', 'Serpent', 'Death', 'Deer', 'Rabbit', 'Water', 'Dog', 'Monkey', 'Reed', 'Jaguar', 'Eagle', 'Vulture', 'Earth', 'Storm', 'Sun', 'Night', 'Seed'],
    elements: {
      Fire: ['Serpent', 'Death', 'Sun'],
      Earth: ['Crocodile', 'Deer', 'Earth'],
      Air: ['Wind', 'Rabbit', 'Storm'],
      Water: ['Water', 'Dog', 'Night']
    },
    qualities: {
      Creative: ['Crocodile', 'Wind', 'Jaguar', 'Road'],
      Receptive: ['Serpent', 'Death', 'Deer', 'Rabbit'],
      Transformative: ['Water', 'Dog', 'Monkey', 'Reed'],
      Enlightened: ['Jaguar', 'Eagle', 'Vulture', 'Earth', 'Storm', 'Sun', 'Night', 'Seed']
    }
  },
  AZTEC: {
    name: 'Aztec Astrology',
    signs: ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer', 'Rabbit', 'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle', 'Vulture', 'Movement', 'Flint', 'Storm', 'Sun'],
    elements: {
      Fire: ['Serpent', 'Death', 'Jaguar', 'Eagle', 'Sun'],
      Earth: ['Crocodile', 'House', 'Deer', 'Dog', 'Grass'],
      Air: ['Wind', 'Rabbit', 'Monkey', 'Vulture', 'Storm'],
      Water: ['Water', 'Lizard', 'Reed', 'Movement', 'Flint']
    },
    qualities: {
      Primal: ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent'],
      Transformative: ['Death', 'Deer', 'Rabbit', 'Water', 'Dog'],
      Creative: ['Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle'],
      Transcendent: ['Vulture', 'Movement', 'Flint', 'Storm', 'Sun']
    }
  }
};

// Zodiac Actions for each system and sign
export const ZODIAC_ACTIONS = {
  WESTERN: {
    Aries: { comment: 'Charge', like: 'Spark', follow: 'Lead', share: 'Ignite' },
    Taurus: { comment: 'Graze', like: 'Root', follow: 'Tread', share: 'Sustain' },
    Gemini: { comment: 'Chatter', like: 'Flit', follow: 'Connect', share: 'Spread' },
    Cancer: { comment: 'Nurture', like: 'Embrace', follow: 'Guide', share: 'Shelter' },
    Leo: { comment: 'Roar', like: 'Shine', follow: 'Strut', share: 'Inspire' },
    Virgo: { comment: 'Analyze', like: 'Tidy', follow: 'Serve', share: 'Refine' },
    Libra: { comment: 'Balance', like: 'Harmonize', follow: 'Align', share: 'Share' },
    Scorpio: { comment: 'Probe', like: 'Sting', follow: 'Hunt', share: 'Transform' },
    Sagittarius: { comment: 'Quest', like: 'Aim', follow: 'Explore', share: 'Inspire' },
    Capricorn: { comment: 'Plan', like: 'Climb', follow: 'Build', share: 'Achieve' },
    Aquarius: { comment: 'Innovate', like: 'Rebel', follow: 'Enlighten', share: 'Spark' },
    Pisces: { comment: 'Dream', like: 'Flow', follow: 'Drift', share: 'Connect' }
  },
  CHINESE: {
    Rat: { comment: 'Squeak', like: 'Nibble', follow: 'Scamper', share: 'Gather' },
    Ox: { comment: 'Moo', like: 'Plow', follow: 'Tread', share: 'Carry' },
    Tiger: { comment: 'Roar', like: 'Pounce', follow: 'Stalk', share: 'Claim' },
    Rabbit: { comment: 'Hop', like: 'Bound', follow: 'Burrow', share: 'Nuzzle' },
    Dragon: { comment: 'Bellow', like: 'Soar', follow: 'Circle', share: 'Guard' },
    Snake: { comment: 'Hiss', like: 'Coil', follow: 'Slither', share: 'Shed' },
    Horse: { comment: 'Neigh', like: 'Gallop', follow: 'Trot', share: 'Prance' },
    Goat: { comment: 'Bleat', like: 'Graze', follow: 'Climb', share: 'Provide' },
    Monkey: { comment: 'Chatter', like: 'Swing', follow: 'Play', share: 'Discover' },
    Rooster: { comment: 'Crow', like: 'Peck', follow: 'Strut', share: 'Announce' },
    Dog: { comment: 'Bark', like: 'Fetch', follow: 'Guard', share: 'Protect' },
    Pig: { comment: 'Oink', like: 'Root', follow: 'Trot', share: 'Feast' }
  },
  VEDIC: {
    Mesha: { comment: 'Rush', like: 'Conquer', follow: 'Pioneer', share: 'Energize' },
    Vrishabha: { comment: 'Cherish', like: 'Build', follow: 'Endure', share: 'Nourish' },
    Mithuna: { comment: 'Communicate', like: 'Adapt', follow: 'Network', share: 'Inform' },
    Karka: { comment: 'Protect', like: 'Nurture', follow: 'Shelter', share: 'Heal' },
    Simha: { comment: 'Command', like: 'Radiate', follow: 'Lead', share: 'Inspire' },
    Kanya: { comment: 'Analyze', like: 'Perfect', follow: 'Serve', share: 'Purify' },
    Tula: { comment: 'Balance', like: 'Harmonize', follow: 'Mediate', share: 'Unite' },
    Vrishchika: { comment: 'Probe', like: 'Transform', follow: 'Investigate', share: 'Regenerate' },
    Dhanus: { comment: 'Explore', like: 'Expand', follow: 'Philosophize', share: 'Enlighten' },
    Makara: { comment: 'Structure', like: 'Achieve', follow: 'Organize', share: 'Sustain' },
    Kumbha: { comment: 'Innovate', like: 'Revolutionize', follow: 'Humanize', share: 'Liberate' },
    Meena: { comment: 'Dream', like: 'Intuit', follow: 'Dissolve', share: 'Transcend' }
  },
  MAYAN: {
    Crocodile: { comment: 'Nurture', like: 'Embrace', follow: 'Protect', share: 'Create' },
    Wind: { comment: 'Whisper', like: 'Breathe', follow: 'Guide', share: 'Inspire' },
    Jaguar: { comment: 'Prowl', like: 'Strike', follow: 'Hunt', share: 'Guard' },
    Road: { comment: 'Journey', like: 'Connect', follow: 'Link', share: 'Weave' },
    Serpent: { comment: 'Transform', like: 'Heal', follow: 'Wisdom', share: 'Renew' },
    Death: { comment: 'Release', like: 'Rebirth', follow: 'Transition', share: 'Liberate' },
    Deer: { comment: 'Grace', like: 'Resilient', follow: 'Humanitarian', share: 'Serve' },
    Rabbit: { comment: 'Harmony', like: 'Creative', follow: 'Star-seed', share: 'Harmonize' },
    Water: { comment: 'Purify', like: 'Empath', follow: 'Intuitive', share: 'Heal' },
    Dog: { comment: 'Loyal', like: 'Guide', follow: 'Protect', share: 'Lead' },
    Monkey: { comment: 'Playful', like: 'Invent', follow: 'Artistic', share: 'Trickster' },
    Reed: { comment: 'Resilient', like: 'Visionary', follow: 'Explore', share: 'Teach' },
    Eagle: { comment: 'Soar', like: 'Visionary', follow: 'Free', share: 'Achieve' },
    Vulture: { comment: 'Wise', like: 'Warrior', follow: 'Liberate', share: 'Forgive' },
    Earth: { comment: 'Navigate', like: 'Harmonious', follow: 'Steward', share: 'Earth' },
    Storm: { comment: 'Reveal', like: 'Sword', follow: 'Truth', share: 'Mirror' },
    Sun: { comment: 'Enlighten', like: 'Solar', follow: 'Radiant', share: 'Create' },
    Night: { comment: 'Ennoble', like: 'Solar Lord', follow: 'Wise', share: 'Rule' },
    Seed: { comment: 'Awaken', like: 'Target', follow: 'Group', share: 'Realize' }
  },
  AZTEC: {
    Crocodile: { comment: 'Nurture', like: 'Embrace', follow: 'Protect', share: 'Create' },
    Wind: { comment: 'Whisper', like: 'Breathe', follow: 'Guide', share: 'Inspire' },
    House: { comment: 'Shelter', like: 'Build', follow: 'Gather', share: 'Harmonize' },
    Lizard: { comment: 'Adapt', like: 'Climb', follow: 'Survive', share: 'Renew' },
    Serpent: { comment: 'Transform', like: 'Heal', follow: 'Wisdom', share: 'Renew' },
    Death: { comment: 'Release', like: 'Rebirth', follow: 'Transition', share: 'Liberate' },
    Deer: { comment: 'Grace', like: 'Leap', follow: 'Humanitarian', share: 'Serve' },
    Rabbit: { comment: 'Harmony', like: 'Bound', follow: 'Multiply', share: 'Fertility' },
    Water: { comment: 'Flow', like: 'Cleanse', follow: 'Nourish', share: 'Refresh' },
    Dog: { comment: 'Loyal', like: 'Guard', follow: 'Protect', share: 'Guide' },
    Monkey: { comment: 'Play', like: 'Swing', follow: 'Entertain', share: 'Amuse' },
    Grass: { comment: 'Grow', like: 'Bend', follow: 'Endure', share: 'Sustain' },
    Reed: { comment: 'Conduct', like: 'Channel', follow: 'Navigate', share: 'Connect' },
    Jaguar: { comment: 'Prowl', like: 'Strike', follow: 'Hunt', share: 'Rule' },
    Eagle: { comment: 'Soar', like: 'Dive', follow: 'Scout', share: 'Achieve' },
    Vulture: { comment: 'Circle', like: 'Cleanse', follow: 'Purify', share: 'Renew' },
    Movement: { comment: 'Shift', like: 'Dance', follow: 'Change', share: 'Transform' },
    Flint: { comment: 'Cut', like: 'Sharp', follow: 'Decisive', share: 'Truth' },
    Storm: { comment: 'Thunder', like: 'Lightning', follow: 'Cleanse', share: 'Renew' },
    Sun: { comment: 'Shine', like: 'Radiate', follow: 'Illuminate', share: 'Life' }
  }
};

// 13 Galactic Tones for Mayan and Aztec astrology systems
export const GALACTIC_TONES = {
  1: {
    name: 'Magnetic',
    symbol: '•',
    meaning: 'Unity, Initiation',
    energy: 'The spark of creation, setting intentions and attracting purpose. Begins the cycle with raw potential.',
    qualities: 'Bold, focused, magnetic. Drives individuals to initiate projects or inspire others.',
    challenges: 'Over-enthusiasm, impulsiveness',
    avatarEffect: {
      emissiveIntensity: 0.7,
      duration: 200,
      scale: [1.5, 1.5, 1.5],
      animation: 'pulsing_glow'
    },
    particleEffect: {
      count: 25,
      speed: 2,
      direction: 'out',
      pattern: 'radial_burst'
    },
    color: '#FFFFFF', // Bright white
    actionModifier: {
      scale: 1.5,
      intensity: 1.2,
      effect: 'quick_scale_up'
    }
  },
  2: {
    name: 'Lunar',
    symbol: '••',
    meaning: 'Polarity, Duality',
    energy: 'Balances opposites (light/dark, self/other). Challenges individuals to find harmony within conflict.',
    qualities: 'Stabilizing, introspective. Encourages adaptability but can lead to indecision.',
    challenges: 'Indecision, inner conflict',
    avatarEffect: {
      emissiveIntensity: 0.5,
      duration: 300,
      position: [0, 0.2, 0],
      animation: 'gentle_oscillation'
    },
    particleEffect: {
      count: 15,
      speed: 1.5,
      direction: 'left_right',
      pattern: 'dual_streams'
    },
    color: '#C0C0C0', // Silver-gray
    actionModifier: {
      scale: 1.1,
      intensity: 0.9,
      effect: 'subtle_wobble'
    }
  },
  3: {
    name: 'Electric',
    symbol: '•••',
    meaning: 'Activation, Service',
    energy: 'Energizes and bonds, activating creative expression. Fuels dynamic action and teamwork.',
    qualities: 'Vibrant, catalytic. Sparks enthusiasm but may scatter energy.',
    challenges: 'Energy scattering, over-stimulation',
    avatarEffect: {
      emissiveIntensity: 0.8,
      duration: 150,
      scale: [1.4, 1.4, 1.4],
      animation: 'electric_burst'
    },
    particleEffect: {
      count: 20,
      speed: 3,
      direction: 'random',
      pattern: 'electric_sparks'
    },
    color: '#00B7EB', // Electric blue
    actionModifier: {
      scale: 1.3,
      intensity: 1.4,
      effect: 'jittery_motion'
    }
  },
  4: {
    name: 'Self-Existing',
    symbol: '••••',
    meaning: 'Form, Definition',
    energy: 'Grounds energy into structure and stability. Defines boundaries and gives shape to intentions.',
    qualities: 'Stable, methodical. Promotes discipline but can be rigid.',
    challenges: 'Rigidity, over-structure',
    avatarEffect: {
      emissiveIntensity: 0.5,
      duration: 250,
      scale: [1.3, 1.3, 1.3],
      animation: 'solidify_effect'
    },
    particleEffect: {
      count: 15,
      speed: 1,
      direction: 'none',
      pattern: 'grid_formation'
    },
    color: '#4CAF50', // Earthy green
    actionModifier: {
      scale: 1.2,
      intensity: 0.8,
      effect: 'static_positioning'
    }
  },
  5: {
    name: 'Overtone',
    symbol: '•••••',
    meaning: 'Empowerment, Radiance',
    energy: 'Commands and amplifies energy, radiating influence. Centers the cycle with confidence.',
    qualities: 'Empowering, radiant. Boosts leadership but risks arrogance.',
    challenges: 'Arrogance, over-dominance',
    avatarEffect: {
      emissiveIntensity: 0.8,
      duration: 200,
      scale: [1.6, 1.6, 1.6],
      animation: 'radiant_pulse'
    },
    particleEffect: {
      count: 20,
      speed: 2,
      direction: 'out',
      pattern: 'radiating_rings'
    },
    color: '#FFD700', // Golden yellow
    actionModifier: {
      scale: 1.6,
      intensity: 1.3,
      effect: 'glow_intensity_boost'
    }
  },
  6: {
    name: 'Rhythmic',
    symbol: '••••••',
    meaning: 'Balance, Flow',
    energy: 'Organizes energy into rhythm and equality. Promotes flow and natural cycles.',
    qualities: 'Balanced, fluid. Encourages harmony but may resist change.',
    challenges: 'Resistance to change, complacency',
    avatarEffect: {
      emissiveIntensity: 0.6,
      duration: 400,
      rotation: [0, Math.PI/8, 0],
      animation: 'smooth_sway'
    },
    particleEffect: {
      count: 20,
      speed: 2,
      direction: 'forward',
      pattern: 'wave_motion'
    },
    color: '#40E0D0', // Turquoise
    actionModifier: {
      scale: 1.25,
      intensity: 1.0,
      effect: 'flowing_motion'
    }
  },
  7: {
    name: 'Resonant',
    symbol: '•••••••',
    meaning: 'Inspiration, Attunement',
    energy: 'Channels divine inspiration, aligning with higher purpose. Central tone of spiritual connection.',
    qualities: 'Mystical, intuitive. Enhances insight but can be overly idealistic.',
    challenges: 'Over-idealism, detachment from reality',
    avatarEffect: {
      emissiveIntensity: 0.9,
      duration: 300,
      position: [0, 0.3, 0],
      animation: 'vibrating_resonance'
    },
    particleEffect: {
      count: 25,
      speed: 2,
      direction: 'up',
      pattern: 'swirling_vortex'
    },
    color: '#800080', // Violet
    actionModifier: {
      scale: 1.4,
      intensity: 1.5,
      effect: 'ethereal_shimmer'
    }
  },
  8: {
    name: 'Galactic',
    symbol: '••••••••',
    meaning: 'Integrity, Harmony',
    energy: 'Aligns actions with universal harmony and ethics. Models truth and balance.',
    qualities: 'Harmonious, ethical. Promotes fairness but may judge harshly.',
    challenges: 'Harsh judgment, perfectionism',
    avatarEffect: {
      emissiveIntensity: 0.7,
      duration: 250,
      scale: [1.3, 1.3, 1.3],
      animation: 'symmetrical_expansion'
    },
    particleEffect: {
      count: 20,
      speed: 1.5,
      direction: 'none',
      pattern: 'circular_orbits'
    },
    color: '#4B0082', // Indigo
    actionModifier: {
      scale: 1.3,
      intensity: 1.1,
      effect: 'smooth_transitions'
    }
  },
  9: {
    name: 'Solar',
    symbol: '•••••••••',
    meaning: 'Intention, Realization',
    energy: 'Pulses intention outward, manifesting goals. Amplifies ambition and vision.',
    qualities: 'Ambitious, radiant. Drives manifestation but risks overreaching.',
    challenges: 'Overreaching, burnout',
    avatarEffect: {
      emissiveIntensity: 0.9,
      duration: 200,
      scale: [1.7, 1.7, 1.7],
      animation: 'solar_flare'
    },
    particleEffect: {
      count: 30,
      speed: 3,
      direction: 'out',
      pattern: 'solar_bursts'
    },
    color: '#FFA500', // Bright orange
    actionModifier: {
      scale: 1.6,
      intensity: 1.4,
      effect: 'scale_boost'
    }
  },
  10: {
    name: 'Planetary',
    symbol: '••••••••••',
    meaning: 'Manifestation, Perfection',
    energy: 'Produces tangible results, perfecting intentions. Grounds spiritual into material.',
    qualities: 'Productive, grounded. Achieves goals but may focus too much on outcomes.',
    challenges: 'Over-focus on results, materialism',
    avatarEffect: {
      emissiveIntensity: 0.6,
      duration: 300,
      position: [0, -0.2, 0],
      animation: 'grounding_effect'
    },
    particleEffect: {
      count: 20,
      speed: 2,
      direction: 'down',
      pattern: 'falling_particles'
    },
    color: '#8B0000', // Deep red
    actionModifier: {
      scale: 1.35,
      intensity: 1.2,
      effect: 'weighty_feel'
    }
  },
  11: {
    name: 'Spectral',
    symbol: '•••••••••••',
    meaning: 'Liberation, Dissolution',
    energy: 'Releases old patterns, freeing energy for change. Embraces transformation.',
    qualities: 'Liberating, chaotic. Promotes freedom but can be destabilizing.',
    challenges: 'Instability, chaos',
    avatarEffect: {
      emissiveIntensity: 0.6,
      duration: 200,
      scale: [1.2, 1.2, 1.2],
      animation: 'dissolving_flicker'
    },
    particleEffect: {
      count: 25,
      speed: 3,
      direction: 'random',
      pattern: 'scattered_particles'
    },
    color: '#ADD8E6', // Pale blue
    actionModifier: {
      scale: 1.2,
      intensity: 0.9,
      effect: 'erratic_motion'
    }
  },
  12: {
    name: 'Crystal',
    symbol: '••••••••••••',
    meaning: 'Cooperation, Clarity',
    energy: 'Universalizes energy, fostering collaboration and clarity. Connects communities.',
    qualities: 'Cooperative, clear. Enhances teamwork but may over-compromise.',
    challenges: 'Over-compromise, loss of individuality',
    avatarEffect: {
      emissiveIntensity: 0.8,
      duration: 250,
      scale: [1.3, 1.3, 1.3],
      animation: 'crystal_lattice_glow'
    },
    particleEffect: {
      count: 20,
      speed: 1.5,
      direction: 'none',
      pattern: 'geometric_patterns'
    },
    color: '#F5F5F5', // Clear white
    actionModifier: {
      scale: 1.3,
      intensity: 1.1,
      effect: 'synchronized_actions'
    }
  },
  13: {
    name: 'Cosmic',
    symbol: '•••••••••••••',
    meaning: 'Transcendence, Presence',
    energy: 'Completes the cycle, transcending limitations. Embodies universal connection.',
    qualities: 'Transcendent, wise. Elevates perspective but may feel detached.',
    challenges: 'Detachment, otherworldliness',
    avatarEffect: {
      emissiveIntensity: 1.0,
      duration: 400,
      rotation: [0, Math.PI/4, 0],
      animation: 'cosmic_spiral'
    },
    particleEffect: {
      count: 30,
      speed: 2,
      direction: 'up',
      pattern: 'spiral_galaxy'
    },
    color: '#4A2C6B', // Cosmic purple
    actionModifier: {
      scale: 1.7,
      intensity: 1.6,
      effect: 'expansive_slow_motion'
    }
  }
};

// Element color mappings for visual consistency
export const ELEMENT_COLORS = {
  Fire: {
    primary: '#ff4444',
    secondary: '#ff6b6b',
    tertiary: '#ff8888',
    emissive: '#ff2222'
  },
  Earth: {
    primary: '#8B4513',
    secondary: '#A0522D',
    tertiary: '#CD853F',
    emissive: '#654321'
  },
  Air: {
    primary: '#87CEEB',
    secondary: '#B0E0E6',
    tertiary: '#E0FFFF',
    emissive: '#4682B4'
  },
  Water: {
    primary: '#4361ee',
    secondary: '#4a90e2',
    tertiary: '#5ba0f2',
    emissive: '#1e40af'
  },
  Wood: {
    primary: '#228B22',
    secondary: '#32CD32',
    tertiary: '#90EE90',
    emissive: '#006400'
  },
  Metal: {
    primary: '#C0C0C0',
    secondary: '#D3D3D3',
    tertiary: '#F5F5F5',
    emissive: '#808080'
  }
};

// System-specific color themes
export const SYSTEM_THEMES = {
  WESTERN: {
    primary: '#4a90e2',
    secondary: '#4361ee',
    accent: '#ff6b6b',
    background: '#000011'
  },
  CHINESE: {
    primary: '#4ecdc4',
    secondary: '#45b7aa',
    accent: '#ffe66d',
    background: '#001122'
  },
  VEDIC: {
    primary: '#ffe66d',
    secondary: '#ffd93d',
    accent: '#ff6b6b',
    background: '#110011'
  }
};

// Helper functions for zodiac operations
export const getElementForSign = (system, sign) => {
  for (const [element, signs] of Object.entries(ZODIAC_SYSTEMS[system].elements)) {
    if (signs.includes(sign)) return element;
  }
  return 'Fire';
};

export const getQualityForSign = (system, sign) => {
  for (const [quality, signs] of Object.entries(ZODIAC_SYSTEMS[system].qualities)) {
    if (signs.includes(sign)) return quality;
  }
  return 'Cardinal';
};

export const getSystemForSign = (sign) => {
  for (const [system, data] of Object.entries(ZODIAC_SYSTEMS)) {
    if (data.signs.includes(sign)) return system;
  }
  return 'WESTERN';
};

export const getActionsForSign = (system, sign) => {
  return ZODIAC_ACTIONS[system][sign] || {};
};

export const getAllSignsForElement = (element) => {
  const signs = [];
  Object.values(ZODIAC_SYSTEMS).forEach(system => {
    if (system.elements[element]) {
      signs.push(...system.elements[element]);
    }
  });
  return signs;
};

export const getCompatibleSigns = (system, sign) => {
  const element = getElementForSign(system, sign);
  const quality = getQualityForSign(system, sign);

  return ZODIAC_SYSTEMS[system].signs.filter(s =>
    getElementForSign(system, s) === element ||
    getQualityForSign(system, s) === quality
  );
};

// Animation configuration helpers
// Galactic Tone helper functions
export const getGalacticTone = (toneNumber) => {
  return GALACTIC_TONES[toneNumber] || GALACTIC_TONES[1];
};

export const getToneModifierForAction = (toneNumber, actionType) => {
  const tone = getGalacticTone(toneNumber);
  const baseAction = {
    comment: { scale: [1.2, 1.2, 1.2], duration: 250 },
    like: { scale: [1.15, 1.15, 1.15], duration: 200 },
    follow: { position: [0, 0, 0.5], duration: 350 },
    share: { rotation: [0, Math.PI / 4, 0], duration: 400 }
  };

  const base = baseAction[actionType] || baseAction.comment;
  
  return {
    ...base,
    ...tone.avatarEffect,
    scale: base.scale?.map(s => s * tone.actionModifier.scale) || [tone.actionModifier.scale, tone.actionModifier.scale, tone.actionModifier.scale],
    emissiveIntensity: tone.avatarEffect.emissiveIntensity * tone.actionModifier.intensity,
    particles: tone.particleEffect,
    toneColor: tone.color,
    effect: tone.actionModifier.effect
  };
};

export const getToneCompatibility = (tone1, tone2) => {
  const compatiblePairs = [
    [1, 5], [1, 9], [1, 13], // Magnetic pairs well with empowerment tones
    [2, 6], [2, 8], [2, 12], // Lunar pairs with balance tones
    [3, 7], [3, 11], [3, 9], // Electric pairs with transformation tones
    [4, 8], [4, 10], [4, 12], // Self-existing pairs with manifestation tones
    [5, 9], [5, 13], [5, 1],  // Overtone pairs with radiant tones
    [6, 10], [6, 12], [6, 2], // Rhythmic pairs with grounding tones
    [7, 11], [7, 13], [7, 3], // Resonant pairs with liberation tones
    [8, 12], [8, 4], [8, 2],  // Galactic pairs with cooperation tones
    [9, 13], [9, 1], [9, 5],  // Solar pairs with transcendent tones
    [10, 4], [10, 6], [10, 8], // Planetary pairs with structure tones
    [11, 7], [11, 3], [11, 13], // Spectral pairs with inspiration tones
    [12, 8], [12, 2], [12, 6], // Crystal pairs with harmony tones
    [13, 1], [13, 5], [13, 9]  // Cosmic pairs with initiation tones
  ];

  const isCompatible = compatiblePairs.some(pair => 
    (pair[0] === tone1 && pair[1] === tone2) || 
    (pair[0] === tone2 && pair[1] === tone1)
  );

  const tone1Data = getGalacticTone(tone1);
  const tone2Data = getGalacticTone(tone2);

  let compatibilityLevel;
  if (isCompatible) {
    compatibilityLevel = 'High';
  } else if (Math.abs(tone1 - tone2) <= 3) {
    compatibilityLevel = 'Medium';
  } else {
    compatibilityLevel = 'Low';
  }

  return {
    compatible: isCompatible,
    level: compatibilityLevel,
    description: isCompatible ? 
      `${tone1Data.name} and ${tone2Data.name} create powerful synergy` :
      `${tone1Data.name} and ${tone2Data.name} offer complementary energies`,
    combinedEffect: isCompatible ?
      `Enhanced ${tone1Data.meaning.split(',')[0]} with ${tone2Data.meaning.split(',')[0]}` :
      `Balanced blend of ${tone1Data.name} and ${tone2Data.name} energies`
  };
};

export const getDailyToneMessage = (toneNumber) => {
  const tone = getGalacticTone(toneNumber);
  const messages = {
    1: `Today's Tone ${toneNumber}: ${tone.name}. Initiate new beginnings and set powerful intentions!`,
    2: `Today's Tone ${toneNumber}: ${tone.name}. Find balance in duality and embrace cooperation!`,
    3: `Today's Tone ${toneNumber}: ${tone.name}. Activate your creative bonds and serve others!`,
    4: `Today's Tone ${toneNumber}: ${tone.name}. Ground your energy into solid structures!`,
    5: `Today's Tone ${toneNumber}: ${tone.name}. Command your power and radiate confidence!`,
    6: `Today's Tone ${toneNumber}: ${tone.name}. Flow with natural rhythms and organize harmony!`,
    7: `Today's Tone ${toneNumber}: ${tone.name}. Channel inspiration and attune to higher wisdom!`,
    8: `Today's Tone ${toneNumber}: ${tone.name}. Model integrity and harmonize with universal ethics!`,
    9: `Today's Tone ${toneNumber}: ${tone.name}. Pulse your intentions outward and manifest your vision!`,
    10: `Today's Tone ${toneNumber}: ${tone.name}. Perfect your manifestations and produce tangible results!`,
    11: `Today's Tone ${toneNumber}: ${tone.name}. Release old patterns and embrace liberating transformation!`,
    12: `Today's Tone ${toneNumber}: ${tone.name}. Cooperate with others and universalize clarity!`,
    13: `Today's Tone ${toneNumber}: ${tone.name}. Transcend limitations and embody cosmic presence!`
  };
  return messages[toneNumber] || `Today's Tone ${toneNumber}: ${tone.name}. ${tone.energy}`;
};

export const getAnimationConfig = (system, element, actionType) => {
  const baseConfigs = {
    comment: { scale: [1.2, 1.2, 1.2], duration: 250 },
    like: { scale: [1.15, 1.15, 1.15], duration: 200 },
    follow: { position: [0, 0, 0.5], duration: 350 },
    share: { rotation: [0, Math.PI / 4, 0], duration: 400 }
  };

  const elementModifiers = {
    Fire: { intensity: 1.2, speed: 1.3 },
    Earth: { intensity: 0.8, speed: 0.7 },
    Air: { intensity: 1.0, speed: 1.1 },
    Water: { intensity: 0.9, speed: 0.8 },
    Wood: { intensity: 1.1, speed: 0.9 },
    Metal: { intensity: 0.95, speed: 0.85 }
  };

  const systemModifiers = {
    WESTERN: { scale: 1.0, duration: 1.0 },
    CHINESE: { scale: 1.1, duration: 1.2 },
    VEDIC: { scale: 0.9, duration: 0.8 }
  };

  const base = baseConfigs[actionType];
  const elementMod = elementModifiers[element];
  const systemMod = systemModifiers[system];

  return {
    ...base,
    scale: base.scale.map(s => s * systemMod.scale),
    duration: base.duration * systemMod.duration,
    intensity: elementMod.intensity,
    speed: elementMod.speed
  };
};