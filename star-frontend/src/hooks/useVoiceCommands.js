import { useCallback, useEffect, useRef, useState } from 'react';

export const useVoiceCommands = (options = {}) => {
  const {
    continuous = true,
    interimResults = false,
    lang = 'en-US',
    commands = {},
    onCommandRecognized,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);

  const recognitionRef = useRef(null);
  const commandHistoryRef = useRef([]);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          processCommand(finalTranscript.trim().toLowerCase());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (onError) {
          onError(event.error);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang, onError]);

  // Process recognized commands
  const processCommand = useCallback((spokenText) => {
    const normalizedText = spokenText.trim().toLowerCase();

    // Try exact match first
    const exactMatch = findExactCommand(normalizedText);
    if (exactMatch) {
      executeCommand(exactMatch.command, normalizedText, 1);
      return;
    }

    // Try fuzzy match
    const fuzzyMatches = findFuzzyCommand(normalizedText, Object.keys(commands));
    if (fuzzyMatches.length > 0) {
      executeCommand(fuzzyMatches[0], normalizedText, 0.8);
    }
  }, [commands, onCommandRecognized]);

  // Find exact command match
  const findExactCommand = useCallback((spokenText) => {
    for (const [command] of Object.entries(commands)) {
      if (spokenText.includes(command.toLowerCase())) {
        return { command };
      }
    }
    return null;
  }, [commands]);

  // Execute a recognized command
  const executeCommand = useCallback((command, transcript, confidence) => {
    const commandData = {
      command,
      transcript,
      timestamp: Date.now(),
      confidence,
      fuzzy: confidence < 1,
    };

    setLastCommand(commandData);
    commandHistoryRef.current.push(commandData);

    // Keep only last 10 commands
    if (commandHistoryRef.current.length > 10) {
      commandHistoryRef.current.shift();
    }

    if (onCommandRecognized) {
      onCommandRecognized(commandData);
    }

    const action = commands[command];
    if (typeof action === 'function') {
      action(commandData);
    }
  }, [commands, onCommandRecognized]);

  // Simple fuzzy matching for voice commands
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

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        if (onError) {
          onError('Failed to start recognition');
        }
      }
    }
  }, [isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Get command history
  const getCommandHistory = useCallback(() => {
    return [...commandHistoryRef.current];
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    clearTranscript,
    getCommandHistory,
  };
};