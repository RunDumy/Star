// Tzolkin Calculator for Mayan Day Signs
// Based on the traditional 260-day Mayan sacred calendar

/**
 * Calculate Mayan Day Sign based on birthdate using the Tzolkin calendar.
 * 
 * @param {Date} birthDate - The birth date
 * @returns {Object} Mayan sign information including day sign and number
 */
export function calculateMayanSign(birthDate) {
    // Mayan Day Signs in correct order
    const daySigns = [
        'Crocodile', 'Wind', 'Jaguar', 'Road', 'Serpent', 'Death', 'Deer',
        'Rabbit', 'Water', 'Dog', 'Monkey', 'Reed', 'Jaguar', 'Eagle',
        'Vulture', 'Earth', 'Storm', 'Sun', 'Night', 'Seed'
    ];
    
    // Base correlation date (most commonly used GMT correlation)
    // This is August 11, 3114 BCE in the proleptic Gregorian calendar
    // which corresponds to 0.0.0.0.0 4 Ahau 8 Cumku in the Mayan calendar
    const baseDate = new Date(1970, 0, 1); // Unix epoch as reference
    const baseTzolkinDay = 0; // Adjust based on correlation
    
    // Calculate days since base date
    const daysSinceBase = Math.floor((birthDate - baseDate) / (1000 * 60 * 60 * 24));
    
    // Calculate position in 260-day Tzolkin cycle
    const tzolkinPosition = (daysSinceBase + baseTzolkinDay) % 260;
    
    // Calculate day sign (0-19) and day number (1-13)
    const daySignIndex = tzolkinPosition % 20;
    const dayNumber = (tzolkinPosition % 13) + 1;
    
    const daySign = daySigns[daySignIndex];
    
    return {
        daySign: daySign,
        dayNumber: dayNumber,
        tzolkinPosition: tzolkinPosition,
        description: `${dayNumber} ${daySign}`
    };
}

/**
 * Get the element associated with a Mayan day sign.
 * @param {string} daySign - The Mayan day sign
 * @returns {string} The element
 */
export function getMayanElement(daySign) {
    const elements = {
        'Crocodile': 'Earth', 'Wind': 'Air', 'Jaguar': 'Fire', 'Road': 'Earth',
        'Serpent': 'Fire', 'Death': 'Fire', 'Deer': 'Earth', 'Rabbit': 'Air',
        'Water': 'Water', 'Dog': 'Earth', 'Monkey': 'Air', 'Reed': 'Earth',
        'Eagle': 'Fire', 'Vulture': 'Air', 'Earth': 'Earth', 'Storm': 'Air',
        'Sun': 'Fire', 'Night': 'Water', 'Seed': 'Earth'
    };
    return elements[daySign] || 'Earth';
}

/**
 * Get the personality traits for a Mayan day sign.
 * @param {string} daySign - The Mayan day sign
 * @returns {string} The traits
 */
export function getMayanTraits(daySign) {
    const traits = {
        'Crocodile': 'Nurturing, protective, creative',
        'Wind': 'Inspiring, communicative, ethereal',
        'Jaguar': 'Powerful, magical, shamanic',
        'Road': 'Connecting, linking, weaving',
        'Serpent': 'Transformative, healing, wise',
        'Death': 'Liberating, transitional, rebirth',
        'Deer': 'Graceful, resilient, humanitarian',
        'Rabbit': 'Harmonious, creative, star-seed',
        'Water': 'Purifying, empathic, intuitive',
        'Dog': 'Loyal, guiding, protective',
        'Monkey': 'Playful, inventive, trickster',
        'Reed': 'Resilient, visionary, exploratory',
        'Eagle': 'Soaring, visionary, achieving',
        'Vulture': 'Wise, liberating, forgiving',
        'Earth': 'Harmonious, stewardship, navigating',
        'Storm': 'Revealing, truth-seeking, mirroring',
        'Sun': 'Enlightening, solar, radiant',
        'Night': 'Ennobling, wise, ruling',
        'Seed': 'Awakening, targeting, realizing'
    };
    return traits[daySign] || 'Mysterious, ancient, wise';
}

/**
 * Get complete Mayan sign information for a birth date.
 * @param {Date} birthDate - The birth date
 * @returns {Object} Complete Mayan sign information
 */
export function getCompleteMayanSign(birthDate) {
    const signInfo = calculateMayanSign(birthDate);
    return {
        ...signInfo,
        element: getMayanElement(signInfo.daySign),
        traits: getMayanTraits(signInfo.daySign)
    };
}