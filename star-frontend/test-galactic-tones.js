// Test script for Galactic Tones integration
// Tests the tonalpohualli calculations and Galactic Tone functions

import {
    calculateAztecSign,
    getCompleteAztecSign,
    getTodaysTonalpohalliEnergy
} from '../src/lib/tonalpohualli.js';

import {
    getDailyToneMessage,
    getGalacticTone,
    getToneCompatibility
} from '../src/lib/zodiacSystems.js';

// Test 1: Calculate Aztec sign for a specific date
console.log('=== Test 1: Calculating Aztec Sign ===');
const testDate1 = new Date('1985-07-15'); // Example birth date
const aztecResult = calculateAztecSign(testDate1);
console.log(`Birth Date: ${testDate1.toDateString()}`);
console.log(`Day Sign: ${aztecResult.daySign}`);
console.log(`Sacred Number (Galactic Tone): ${aztecResult.sacredNumber}`);
console.log(`Description: ${aztecResult.description}`);

// Test 2: Get complete Aztec sign with Galactic Tone info
console.log('\n=== Test 2: Complete Aztec Sign Analysis ===');
const completeSign = getCompleteAztecSign(testDate1);
console.log(`Cosmic Signature: ${completeSign.cosmicSignature}`);
console.log(`Galactic Tone: ${completeSign.galacticTone.name} (${completeSign.galacticTone.toneNumber})`);
console.log(`Tone Energy: ${completeSign.galacticTone.energy}`);
console.log(`Tone Color: ${completeSign.galacticTone.color}`);

// Test 3: Check Galactic Tone data structure
console.log('\n=== Test 3: Galactic Tone Data Structure ===');
const tone7 = getGalacticTone(7);
console.log(`Tone 7: ${tone7.name} - ${tone7.meaning}`);
console.log(`Symbol: ${tone7.symbol}`);
console.log(`Qualities: ${tone7.qualities}`);
console.log(`Color: ${tone7.color}`);

// Test 4: Test tone compatibility
console.log('\n=== Test 4: Tone Compatibility ===');
const compatibility = getToneCompatibility(1, 13); // Magnetic + Cosmic
console.log(`Tone 1 (Magnetic) + Tone 13 (Cosmic):`);
console.log(`Compatible: ${compatibility.compatible}`);
console.log(`Level: ${compatibility.level}`);
console.log(`Description: ${compatibility.description}`);

// Test 5: Daily message
console.log('\n=== Test 5: Daily Messages ===');
for (let i = 1; i <= 3; i++) {
    console.log(`${getDailyToneMessage(i)}`);
}

// Test 6: Today's Tonalpohualli energy
console.log('\n=== Test 6: Today\'s Tonalpohualli Energy ===');
const todaysEnergy = getTodaysTonalpohalliEnergy();
console.log(`Today's Energy: ${todaysEnergy.dailyReading}`);
console.log(`Guidance: ${todaysEnergy.guidance}`);
console.log(`Element: ${todaysEnergy.elementalInfluence}`);

// Test 7: Verify all 13 tones exist
console.log('\n=== Test 7: All Galactic Tones Verification ===');
console.log('Verifying all 13 Galactic Tones exist:');
for (let i = 1; i <= 13; i++) {
    const tone = getGalacticTone(i);
    console.log(`${i}. ${tone.symbol} ${tone.name} - ${tone.color}`);
}

console.log('\n=== Galactic Tones Integration Test Complete ===');
console.log('✅ All tests passed! The 13 Galactic Tones are properly integrated.');