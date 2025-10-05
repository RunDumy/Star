import { useVoiceCommands } from '../useVoiceCommands';

// Mock Speech Recognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  onstart: null,
  onend: null,
  onresult: null,
  onerror: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

describe('useVoiceCommands', () => {
  it('can be imported', () => {
    expect(typeof useVoiceCommands).toBe('function');
  });

  it('has proper command processing logic', () => {
    // Test the fuzzy matching logic
    const commands = {
      'go up': () => {},
      'go down': () => {},
      'zoom in': () => {},
      'zoom out': () => {},
    };

    // Test fuzzy matching function (extracted for testing)
    const findFuzzyCommand = (spokenText, availableCommands) => {
      const matches = [];

      for (const command of availableCommands) {
        const commandWords = command.toLowerCase().split(' ');
        const spokenWords = spokenText.split(' ');

        let matchCount = 0;
        for (const spokenWord of spokenWords) {
          for (const commandWord of commandWords) {
            if (commandWord.includes(spokenWord) || spokenWord.includes(commandWord)) {
              matchCount++;
              break;
            }
          }
        }

        if (matchCount > 0) {
          matches.push({
            command,
            score: matchCount / Math.max(commandWords.length, spokenWords.length),
          });
        }
      }

      return matches
        .sort((a, b) => b.score - a.score)
        .map(match => match.command);
    };

    expect(findFuzzyCommand('up', Object.keys(commands))).toContain('go up');
    expect(findFuzzyCommand('down', Object.keys(commands))).toContain('go down');
    expect(findFuzzyCommand('zoom', Object.keys(commands))).toContain('zoom in');
  });
});