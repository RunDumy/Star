// Tonalpohualli Calculator for Aztec Day Signs and Galactic Tones
// Based on the traditional 260-day Aztec sacred calendar
import { getDailyToneMessage, getGalacticTone, getToneCompatibility } from './zodiacSystems';

/**
 * Calculate Aztec Day Sign and Sacred Number based on birthdate using the Tonalpohualli calendar.
 * 
 * @param {Date} birthDate - The birth date
 * @returns {Object} Aztec sign information including day sign and sacred number
 */
export function calculateAztecSign(birthDate) {
    // Aztec Day Signs in correct order (20 signs)
    const daySigns = [
        'Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer',
        'Rabbit', 'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar',
        'Eagle', 'Vulture', 'Movement', 'Flint', 'Storm', 'Sun'
    ];
    
    // Base correlation date (GMT correlation constant)
    // This is based on the most commonly used correlation
    const baseDate = new Date(1970, 0, 1); // Unix epoch as reference
    const baseTonalpohualli = 0; // Adjust based on correlation
    
    // Calculate days since base date
    const daysSinceBase = Math.floor((birthDate - baseDate) / (1000 * 60 * 60 * 24));
    
    // Calculate position in 260-day Tonalpohualli cycle
    const tonalpohalliPosition = (daysSinceBase + baseTonalpohualli) % 260;
    
    // Calculate day sign (0-19) and sacred number (1-13)
    const daySignIndex = tonalpohalliPosition % 20;
    const sacredNumber = (tonalpohalliPosition % 13) + 1;
    
    const daySign = daySigns[daySignIndex];
    
    return {
        daySign: daySign,
        sacredNumber: sacredNumber,
        tonalpohalliPosition: tonalpohalliPosition,
        description: `${sacredNumber} ${daySign}`
    };
}

/**
 * Get the element associated with an Aztec day sign.
 * @param {string} daySign - The Aztec day sign
 * @returns {string} The element
 */
export function getAztecElement(daySign) {
    const elements = {
        'Crocodile': 'Earth', 'Wind': 'Air', 'House': 'Earth', 'Lizard': 'Water',
        'Serpent': 'Fire', 'Death': 'Fire', 'Deer': 'Earth', 'Rabbit': 'Air',
        'Water': 'Water', 'Dog': 'Earth', 'Monkey': 'Air', 'Grass': 'Earth',
        'Reed': 'Water', 'Jaguar': 'Fire', 'Eagle': 'Fire', 'Vulture': 'Air',
        'Movement': 'Water', 'Flint': 'Water', 'Storm': 'Air', 'Sun': 'Fire'
    };
    return elements[daySign] || 'Earth';
}

/**
 * Get the personality traits for an Aztec day sign.
 * @param {string} daySign - The Aztec day sign
 * @returns {string} The traits
 */
export function getAztecTraits(daySign) {
    const traits = {
        'Crocodile': 'Primal, nurturing; creative chaos',
        'Wind': 'Communicative, visionary; restless intellect',
        'House': 'Protective, communal; family-oriented',
        'Lizard': 'Agile, resilient; adaptable survivor',
        'Serpent': 'Transformative, wise; passionate healer',
        'Death': 'Rebirth, transitional; philosophical',
        'Deer': 'Graceful, resilient; humanitarian',
        'Rabbit': 'Harmonious, creative; intuitive artist',
        'Water': 'Emotional, purifying; empathic flow',
        'Dog': 'Loyal, guiding; protective leader',
        'Monkey': 'Playful, inventive; trickster artist',
        'Grass': 'Flexible, grounded; resilient grower',
        'Reed': 'Resilient, visionary; skywalker',
        'Jaguar': 'Powerful, intuitive; warrior shaman',
        'Eagle': 'Visionary, free; soaring achiever',
        'Vulture': 'Wise, liberating; forgiving sage',
        'Movement': 'Dynamic, transformative; change-maker',
        'Flint': 'Obsidian-sharp, decisive; cutter of truth',
        'Storm': 'Revealing, purifying; thunderous renewal',
        'Sun': 'Enlightening, radiant; solar creator'
    };
    return traits[daySign] || 'Mysterious, ancient, powerful';
}

/**
 * Get the quality category for an Aztec day sign.
 * @param {string} daySign - The Aztec day sign
 * @returns {string} The quality
 */
export function getAztecQuality(daySign) {
    const qualities = {
        'Primal': ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent'],
        'Transformative': ['Death', 'Deer', 'Rabbit', 'Water', 'Dog'],
        'Creative': ['Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle'],
        'Transcendent': ['Vulture', 'Movement', 'Flint', 'Storm', 'Sun']
    };
    
    for (const [quality, signs] of Object.entries(qualities)) {
        if (signs.includes(daySign)) return quality;
    }
    return 'Primal';
}

/**
 * Get the sacred number meanings in Aztec numerology using Galactic Tones.
 * @param {number} sacredNumber - The sacred number (1-13)
 * @returns {Object} Number meaning and energy
 */
export function getSacredNumberMeaning(sacredNumber) {
    const galacticTone = getGalacticTone(sacredNumber);
    return {
        name: galacticTone.name,
        energy: galacticTone.energy,
        meaning: galacticTone.meaning,
        qualities: galacticTone.qualities,
        challenges: galacticTone.challenges,
        color: galacticTone.color,
        symbol: galacticTone.symbol
    };
}

/**
 * Get enhanced Galactic Tone information for a sacred number.
 * @param {number} toneNumber - The Galactic Tone number (1-13)
 * @returns {Object} Complete Galactic Tone data
 */
export function getGalacticToneInfo(toneNumber) {
    const tone = getGalacticTone(toneNumber);
    return {
        ...tone,
        dailyMessage: getDailyToneMessage(toneNumber),
        toneNumber: toneNumber
    };
}

/**
 * Get complete Aztec sign information for a birth date.
 * @param {Date} birthDate - The birth date
 * @returns {Object} Complete Aztec sign information
 */
export function getCompleteAztecSign(birthDate) {
    const signInfo = calculateAztecSign(birthDate);
    const numberMeaning = getSacredNumberMeaning(signInfo.sacredNumber);
    const galacticToneInfo = getGalacticToneInfo(signInfo.sacredNumber);
    
    return {
        ...signInfo,
        element: getAztecElement(signInfo.daySign),
        traits: getAztecTraits(signInfo.daySign),
        quality: getAztecQuality(signInfo.daySign),
        numberMeaning: numberMeaning,
        galacticTone: galacticToneInfo,
        fullDescription: `${signInfo.description} - ${numberMeaning.name} ${signInfo.daySign}`,
        cosmicSignature: `${galacticToneInfo.symbol} ${numberMeaning.name} ${signInfo.daySign}`,
        toneColor: galacticToneInfo.color,
        avatarEffects: galacticToneInfo.avatarEffect,
        particleEffects: galacticToneInfo.particleEffect
    };
}

/**
 * Get Aztec + Galactic Tone compatibility between two complete sign profiles.
 * @param {Object} profile1 - First complete Aztec sign profile
 * @param {Object} profile2 - Second complete Aztec sign profile
 * @returns {Object} Enhanced compatibility information
 */
export function getEnhancedAztecCompatibility(profile1, profile2) {
    const signCompatibility = getAztecCompatibility(profile1.daySign, profile2.daySign);
    const toneCompatibility = getToneCompatibility(profile1.sacredNumber, profile2.sacredNumber);
    
    // Calculate overall compatibility score
    const compatibilityWeights = {
        'High': 3,
        'Medium': 2,
        'Low': 1
    };
    
    const signScore = compatibilityWeights[signCompatibility.elementCompatibility] + 
                     compatibilityWeights[signCompatibility.qualityCompatibility];
    const toneScore = compatibilityWeights[toneCompatibility.level];
    const totalScore = (signScore + toneScore) / 3;
    
    let overallLevel = 'Low';
    if (totalScore >= 2.5) overallLevel = 'High';
    else if (totalScore >= 1.8) overallLevel = 'Medium';
    
    return {
        daySignCompatibility: signCompatibility,
        galacticToneCompatibility: toneCompatibility,
        overallCompatibility: {
            level: overallLevel,
            score: totalScore,
            description: `${profile1.cosmicSignature} and ${profile2.cosmicSignature} compatibility`,
            strengths: [
                signCompatibility.elementCompatibility === 'High' ? 'Strong elemental harmony' : null,
                signCompatibility.qualityCompatibility === 'High' ? 'Aligned life qualities' : null,
                toneCompatibility.compatible ? 'Synchronized galactic tones' : null
            ].filter(Boolean),
            challenges: [
                signCompatibility.elementCompatibility === 'Low' ? 'Contrasting elemental energies' : null,
                signCompatibility.qualityCompatibility === 'Low' ? 'Different life approaches' : null,
                !toneCompatibility.compatible ? 'Divergent tone energies' : null
            ].filter(Boolean)
        }
    };
}

/**
 * Calculate today's Tonalpohualli energy based on current date.
 * @returns {Object} Today's Aztec cosmic energy
 */
export function getTodaysTonalpohalliEnergy() {
    const today = new Date();
    const todaysSign = getCompleteAztecSign(today);
    
    return {
        ...todaysSign,
        dailyReading: `Today's Energy: ${todaysSign.cosmicSignature}`,
        guidance: todaysSign.galacticTone.dailyMessage,
        elementalInfluence: `${todaysSign.element} element brings ${getElementalGuidance(todaysSign.element)}`,
        qualityInfluence: `${todaysSign.quality} quality encourages ${getQualityGuidance(todaysSign.quality)}`
    };
}

/**
 * Get elemental guidance for daily readings.
 * @param {string} element - The element
 * @returns {string} Guidance message
 */
function getElementalGuidance(element) {
    const guidance = {
        'Fire': 'passion, creativity, and dynamic action',
        'Earth': 'grounding, stability, and practical manifestation',
        'Air': 'communication, mental clarity, and inspired movement',
        'Water': 'emotional flow, intuition, and deep healing'
    };
    return guidance[element] || 'cosmic balance and harmony';
}

/**
 * Get quality guidance for daily readings.
 * @param {string} quality - The quality
 * @returns {string} Guidance message
 */
function getQualityGuidance(quality) {
    const guidance = {
        'Primal': 'foundational beginnings and raw creative power',
        'Transformative': 'deep change and spiritual evolution',
        'Creative': 'artistic expression and innovative solutions',
        'Transcendent': 'higher wisdom and cosmic understanding'
    };
    return guidance[quality] || 'spiritual growth and personal development';
}

/**
 * Get Aztec compatibility between two signs.
 * @param {string} sign1 - First Aztec day sign
 * @param {string} sign2 - Second Aztec day sign
 * @returns {Object} Compatibility information
 */
export function getAztecCompatibility(sign1, sign2) {
    const element1 = getAztecElement(sign1);
    const element2 = getAztecElement(sign2);
    const quality1 = getAztecQuality(sign1);
    const quality2 = getAztecQuality(sign2);
    
    // Element compatibility
    const elementCompatibility = {
        'Fire-Air': 'High', 'Air-Fire': 'High',
        'Fire-Fire': 'High', 'Air-Air': 'High',
        'Water-Earth': 'High', 'Earth-Water': 'High',
        'Water-Water': 'High', 'Earth-Earth': 'High',
        'Fire-Water': 'Medium', 'Water-Fire': 'Medium',
        'Air-Earth': 'Medium', 'Earth-Air': 'Medium',
        'Fire-Earth': 'Low', 'Earth-Fire': 'Low',
        'Air-Water': 'Low', 'Water-Air': 'Low'
    };
    
    // Quality compatibility
    const qualityCompatibility = {
        'Primal-Creative': 'High', 'Creative-Primal': 'High',
        'Transformative-Transcendent': 'High', 'Transcendent-Transformative': 'High',
        'Primal-Transformative': 'Medium', 'Transformative-Primal': 'Medium',
        'Creative-Transcendent': 'Medium', 'Transcendent-Creative': 'Medium',
        'Primal-Transcendent': 'Low', 'Transcendent-Primal': 'Low',
        'Transformative-Creative': 'Low', 'Creative-Transformative': 'Low'
    };
    
    const elemKey = `${element1}-${element2}`;
    const qualKey = `${quality1}-${quality2}`;
    
    return {
        elementCompatibility: elementCompatibility[elemKey] || 'Medium',
        qualityCompatibility: qualityCompatibility[qualKey] || 'Medium',
        signs: [sign1, sign2],
        elements: [element1, element2],
        qualities: [quality1, quality2]
    };
}