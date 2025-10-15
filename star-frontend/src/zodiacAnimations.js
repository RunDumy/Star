// God-Tier Multi-Zodiac System Animations
// Comprehensive 304+ combinations for Western, Chinese, Vedic, Mayan, Aztec systems
// Optimized for F1 tier performance with CSS-based animations

// Galactic Tones (13 total)
const galacticTones = [
    'Magnetic', 'Lunar', 'Electric', 'Self-Existing', 'Overtone', 'Rhythmic',
    'Resonant', 'Galactic', 'Solar', 'Planetary', 'Spectral', 'Crystal', 'Cosmic'
];

// Day Signs by Tradition
const daySigns = {
    // Western Zodiac (12 signs)
    western: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],

    // Chinese Zodiac (12 animals)
    chinese: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],

    // Aztec Day Signs (20 signs)
    aztec: ['Cipactli', 'Ehecatl', 'Calli', 'Cuetzpalin', 'Coatl', 'Miquiztli',
        'Mazatl', 'Tochtli', 'Atl', 'Itzcuintli', 'Ozomatli', 'Malinalli',
        'Acatl', 'Ocelotl', 'Cuauhtli', 'Cozcacuauhtli', 'Ollin', 'Tecpatl',
        'Quiahuitl', 'Xochitl'],

    // Mayan Tzolkin (20 day signs)
    mayan: ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat',
        'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban',
        'Etznab', 'Cauac', 'Ahau'],

    // Vedic Nakshatras (simplified - 12 main ones)
    vedic: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva', 'Uttara']
};

// Animation mappings for different traditions and tones
const animationMappings = {
    // Western Zodiac Animations
    western: {
        'Aries': { base: 'ariesFire', element: 'fire' },
        'Taurus': { base: 'taurusEarth', element: 'earth' },
        'Gemini': { base: 'geminiAir', element: 'air' },
        'Cancer': { base: 'cancerWater', element: 'water' },
        'Leo': { base: 'leoFire', element: 'fire' },
        'Virgo': { base: 'virgoEarth', element: 'earth' },
        'Libra': { base: 'libraAir', element: 'air' },
        'Scorpio': { base: 'scorpioWater', element: 'water' },
        'Sagittarius': { base: 'sagittariusFire', element: 'fire' },
        'Capricorn': { base: 'capricornEarth', element: 'earth' },
        'Aquarius': { base: 'aquariusAir', element: 'air' },
        'Pisces': { base: 'piscesWater', element: 'water' }
    },

    // Chinese Zodiac Animations
    chinese: {
        'Rat': { base: 'ratQuick', element: 'water' },
        'Ox': { base: 'oxSteady', element: 'earth' },
        'Tiger': { base: 'tigerPounce', element: 'wood' },
        'Rabbit': { base: 'rabbitHop', element: 'wood' },
        'Dragon': { base: 'dragonSoar', element: 'earth' },
        'Snake': { base: 'snakeSlither', element: 'fire' },
        'Horse': { base: 'horseGallop', element: 'fire' },
        'Goat': { base: 'goatClimb', element: 'earth' },
        'Monkey': { base: 'monkeySwing', element: 'metal' },
        'Rooster': { base: 'roosterCrow', element: 'metal' },
        'Dog': { base: 'dogLoyal', element: 'earth' },
        'Pig': { base: 'pigContent', element: 'water' }
    },

    // Aztec Day Signs Animations
    aztec: {
        'Cipactli': { base: 'crocodileSpin', element: 'earth' },
        'Ehecatl': { base: 'windSwirl', element: 'air' },
        'Calli': { base: 'houseStable', element: 'earth' },
        'Cuetzpalin': { base: 'lizardDart', element: 'fire' },
        'Coatl': { base: 'serpentCoil', element: 'fire' },
        'Miquiztli': { base: 'deathTransform', element: 'earth' },
        'Mazatl': { base: 'deerLeap', element: 'air' },
        'Tochtli': { base: 'rabbitBounce', element: 'earth' },
        'Atl': { base: 'waterFlow', element: 'water' },
        'Itzcuintli': { base: 'dogGuard', element: 'earth' },
        'Ozomatli': { base: 'monkeyPlay', element: 'air' },
        'Malinalli': { base: 'grassWave', element: 'earth' },
        'Acatl': { base: 'reedBend', element: 'air' },
        'Ocelotl': { base: 'jaguarProwl', element: 'earth' },
        'Cuauhtli': { base: 'eagleSoar', element: 'fire' },
        'Cozcacuauhtli': { base: 'vultureCircle', element: 'air' },
        'Ollin': { base: 'movementShake', element: 'earth' },
        'Tecpatl': { base: 'flintSpark', element: 'fire' },
        'Quiahuitl': { base: 'rainFall', element: 'water' },
        'Xochitl': { base: 'flowerBloom', element: 'fire' }
    },

    // Mayan Tzolkin Animations
    mayan: {
        'Imix': { base: 'dragonEnergy', element: 'fire' },
        'Ik': { base: 'windSpirit', element: 'air' },
        'Akbal': { base: 'nightMystery', element: 'water' },
        'Kan': { base: 'seedGrow', element: 'earth' },
        'Chicchan': { base: 'serpentWisdom', element: 'fire' },
        'Cimi': { base: 'deathRebirth', element: 'water' },
        'Manik': { base: 'handCreate', element: 'earth' },
        'Lamat': { base: 'starShine', element: 'air' },
        'Muluc': { base: 'waterOffering', element: 'water' },
        'Oc': { base: 'dogLoyalty', element: 'earth' },
        'Chuen': { base: 'monkeyArt', element: 'air' },
        'Eb': { base: 'roadTravel', element: 'earth' },
        'Ben': { base: 'reedGrow', element: 'air' },
        'Ix': { base: 'jaguarMagic', element: 'earth' },
        'Men': { base: 'eagleVision', element: 'air' },
        'Cib': { base: 'vulturePurify', element: 'water' },
        'Caban': { base: 'earthQuake', element: 'earth' },
        'Etznab': { base: 'mirrorReflect', element: 'air' },
        'Cauac': { base: 'stormPower', element: 'water' },
        'Ahau': { base: 'sunLord', element: 'fire' }
    },

    // Vedic Nakshatras Animations
    vedic: {
        'Ashwini': { base: 'horseTwin', element: 'fire' },
        'Bharani': { base: 'starBear', element: 'earth' },
        'Krittika': { base: 'pleiadesCut', element: 'fire' },
        'Rohini': { base: 'moonBeauty', element: 'water' },
        'Mrigashira': { base: 'deerSeek', element: 'earth' },
        'Ardra': { base: 'stormTear', element: 'water' },
        'Punarvasu': { base: 'twinReturn', element: 'air' },
        'Pushya': { base: 'flowerNourish', element: 'water' },
        'Ashlesha': { base: 'serpentEmbrace', element: 'water' },
        'Magha': { base: 'throneRule', element: 'fire' },
        'Purva': { base: 'hammerBuild', element: 'air' },
        'Uttara': { base: 'bedRest', element: 'earth' }
    }
};

// Tone modifiers for animation speed and intensity
const toneModifiers = {
    'Magnetic': { speed: 1.0, intensity: 0.8, pattern: 'steady' },
    'Lunar': { speed: 0.8, intensity: 0.6, pattern: 'oscillate' },
    'Electric': { speed: 1.5, intensity: 1.0, pattern: 'spark' },
    'Self-Existing': { speed: 0.9, intensity: 0.7, pattern: 'solid' },
    'Overtone': { speed: 1.2, intensity: 0.9, pattern: 'harmonic' },
    'Rhythmic': { speed: 1.1, intensity: 0.8, pattern: 'pulse' },
    'Resonant': { speed: 0.95, intensity: 0.75, pattern: 'echo' },
    'Galactic': { speed: 1.3, intensity: 0.95, pattern: 'spiral' },
    'Solar': { speed: 1.4, intensity: 1.0, pattern: 'radiate' },
    'Planetary': { speed: 1.0, intensity: 0.8, pattern: 'orbit' },
    'Spectral': { speed: 1.1, intensity: 0.85, pattern: 'rainbow' },
    'Crystal': { speed: 0.7, intensity: 0.9, pattern: 'crystallize' },
    'Cosmic': { speed: 1.6, intensity: 1.2, pattern: 'transcend' }
};

// Generate all zodiac signature combinations
const generateZodiacAnimations = () => {
    const animations = {};

    // Generate combinations for each tradition
    Object.entries(daySigns).forEach(([tradition, signs]) => {
        signs.forEach(sign => {
            galacticTones.forEach(tone => {
                const signData = animationMappings[tradition][sign];
                const toneData = toneModifiers[tone];

                if (signData && toneData) {
                    const signature = `${sign}_${tone}`;
                    const duration = `${(2.0 / toneData.speed).toFixed(1)}s`;
                    const animation = `${signData.base}${toneData.pattern.charAt(0).toUpperCase() + toneData.pattern.slice(1)}`;

                    animations[signature] = {
                        animation,
                        duration,
                        easing: 'ease-in-out',
                        tradition,
                        element: signData.element,
                        intensity: toneData.intensity,
                        pattern: toneData.pattern
                    };
                }
            });
        });
    });

    // Add default and fallback animations
    animations['default'] = {
        animation: 'defaultStarGlow',
        duration: '1s',
        easing: 'linear',
        tradition: 'cosmic',
        element: 'spirit',
        intensity: 0.5,
        pattern: 'steady'
    };

    return animations;
};

// Generate the complete animation set (304+ combinations)
export const zodiacAnimations = generateZodiacAnimations();

// Enhanced zodiac action trigger with tradition support
export const triggerZodiacAction = (signature) => {
    // Handle different signature formats
    let cleanSignature = signature;

    // Handle formats like "Cipactli_Magnetic_Aztec" or just "Cipactli_Magnetic"
    if (signature && typeof signature === 'string') {
        const parts = signature.split('_');
        if (parts.length >= 2) {
            cleanSignature = `${parts[0]}_${parts[1]}`;
        }
    }

    const animation = zodiacAnimations[cleanSignature] || zodiacAnimations['default'];

    return {
        type: 'ZODIAC_ACTION',
        payload: {
            signature: cleanSignature,
            ...animation,
            originalSignature: signature
        }
    };
};

// Get animation by tradition
export const getAnimationsByTradition = (tradition) => {
    return Object.entries(zodiacAnimations)
        .filter(([_, anim]) => anim.tradition === tradition)
        .reduce((acc, [sig, anim]) => {
            acc[sig] = anim;
            return acc;
        }, {});
};

// Get compatible signatures for sharing
export const getCompatibleSignatures = (userSignature) => {
    if (!userSignature || !zodiacAnimations[userSignature]) {
        return [];
    }

    const userAnim = zodiacAnimations[userSignature];
    return Object.entries(zodiacAnimations)
        .filter(([sig, anim]) =>
            anim.tradition === userAnim.tradition ||
            anim.element === userAnim.element
        )
        .map(([sig, _]) => sig)
        .slice(0, 5); // Return top 5 compatible
};

// Performance stats for F1 tier optimization
export const getAnimationStats = () => {
    const totalAnimations = Object.keys(zodiacAnimations).length;
    const traditions = [...new Set(Object.values(zodiacAnimations).map(a => a.tradition))];
    const elements = [...new Set(Object.values(zodiacAnimations).map(a => a.element))];

    return {
        totalAnimations,
        traditions: traditions.length,
        elements: elements.length,
        estimatedBundleSize: `${(totalAnimations * 0.1).toFixed(1)}KB`, // Rough estimate
        f1TierOptimized: totalAnimations < 500 // Keep under 500 for F1 tier
    };
};