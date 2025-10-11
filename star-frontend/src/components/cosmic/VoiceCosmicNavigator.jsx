// platforms/star-app/src/components/cosmic/VoiceCosmicNavigator.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Settings } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Voice recognition hook

// Context
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';

// Data
import { ZODIAC_SYSTEMS } from '@/lib/zodiacSystems';

// Voice Command Definitions
const VOICE_COMMANDS = {
  // Navigation Commands
  'go to western': { action: 'navigate', target: 'WESTERN', category: 'navigation' },
  'go to chinese': { action: 'navigate', target: 'CHINESE', category: 'navigation' },
  'go to vedic': { action: 'navigate', target: 'VEDIC', category: 'navigation' },
  'show social hub': { action: 'navigate', target: 'social', category: 'navigation' },
  'show creation zone': { action: 'navigate', target: 'creation', category: 'navigation' },
  'show live stream': { action: 'navigate', target: 'streaming', category: 'navigation' },

  // Interaction Commands
  'explore mode': { action: 'mode', target: 'explore', category: 'interaction' },
  'social mode': { action: 'mode', target: 'social', category: 'interaction' },
  'create mode': { action: 'mode', target: 'create', category: 'interaction' },
  'collaborate mode': { action: 'mode', target: 'collaborate', category: 'interaction' },

  // Element Commands
  'select fire': { action: 'element', target: 'FIRE', category: 'selection' },
  'select water': { action: 'element', target: 'WATER', category: 'selection' },
  'select air': { action: 'element', target: 'AIR', category: 'selection' },
  'select earth': { action: 'element', target: 'EARTH', category: 'selection' },

  // UI Commands
  'show menu': { action: 'ui', target: 'show', category: 'interface' },
  'hide menu': { action: 'ui', target: 'hide', category: 'interface' },
  'expand interface': { action: 'ui', target: 'expand', category: 'interface' },
  'minimize interface': { action: 'ui', target: 'minimize', category: 'interface' },

  // Voice Commands
  'stop listening': { action: 'voice', target: 'stop', category: 'voice' },
  'start listening': { action: 'voice', target: 'start', category: 'voice' },

  // Theme Commands
  'dark theme': { action: 'theme', target: 'dark', category: 'appearance' },
  'light theme': { action: 'theme', target: 'light', category: 'appearance' },
  'cosmic theme': { action: 'theme', target: 'cosmic', category: 'appearance' },

  // Social Commands
  'find friends': { action: 'social', target: 'friends', category: 'social' },
  'join constellation': { action: 'social', target: 'constellation', category: 'social' },
  'start live stream': { action: 'social', target: 'livestream', category: 'social' }
};

// Enhanced Voice Cosmic Navigator Component
export const VoiceCosmicNavigator = ({
  onVoiceActive,
  onCommand,
  onNavigation,
  onModeChange,
  onElementSelect,
  onUIChange,
  onThemeChange
}) => {
  const { theme } = useCosmicTheme();
  const { currentUser } = useCollaboration();

  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    sensitivity: 0.5,
    language: 'en-US',
    continuous: true,
    feedback: true
  });

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = voiceSettings.continuous;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onVoiceActive?.(true);
        initializeAudioAnalysis();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onVoiceActive?.(false);
        stopAudioAnalysis();
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        processVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
        onVoiceActive?.(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioAnalysis();
    };
  }, [voiceSettings]);

  // Initialize audio analysis for voice level visualization
  const initializeAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const analyzeAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVoiceLevel(average / 255);

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
    } catch (error) {
      console.error('Audio analysis initialization failed:', error);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  // Process voice commands
  const processVoiceCommand = useCallback(async (transcript) => {
    setIsProcessing(true);
    setLastCommand(transcript);

    // Add to command history
    setCommandHistory(prev => [transcript, ...prev.slice(0, 9)]);

    // Find matching command
    const command = findMatchingCommand(transcript);
    if (command) {
      await executeCommand(command);
      if (voiceSettings.feedback) {
        speakFeedback(`Executing: ${command.action} ${command.target}`);
      }
    } else {
      if (voiceSettings.feedback) {
        speakFeedback('Command not recognized');
      }
    }

    setIsProcessing(false);
  }, [voiceSettings.feedback]);

  // Find matching voice command
  const findMatchingCommand = useCallback((transcript) => {
    // Exact matches first
    if (VOICE_COMMANDS[transcript]) {
      return VOICE_COMMANDS[transcript];
    }

    // Fuzzy matching
    for (const [command, config] of Object.entries(VOICE_COMMANDS)) {
      if (transcript.includes(command) || command.includes(transcript)) {
        return config;
      }
    }

    // Keyword matching for zodiac signs
    for (const [system, data] of Object.entries(ZODIAC_SYSTEMS)) {
      if (transcript.includes(system.toLowerCase())) {
        return { action: 'navigate', target: system, category: 'navigation' };
      }
      for (const sign of data.signs) {
        if (transcript.includes(sign.toLowerCase())) {
          return { action: 'navigate', target: `${system}_${sign}`, category: 'navigation' };
        }
      }
    }

    return null;
  }, []);

  // Execute voice command
  const executeCommand = useCallback(async (command) => {
    switch (command.action) {
      case 'navigate':
        onNavigation?.(command.target);
        break;
      case 'mode':
        onModeChange?.(command.target);
        break;
      case 'element':
        onElementSelect?.(command.target);
        break;
      case 'ui':
        onUIChange?.(command.target);
        break;
      case 'theme':
        onThemeChange?.(command.target);
        break;
      case 'voice':
        if (command.target === 'start') startListening();
        else if (command.target === 'stop') stopListening();
        break;
      case 'social':
        // Handle social commands
        break;
      default:
        onCommand?.(command);
    }
  }, [onNavigation, onModeChange, onElementSelect, onUIChange, onThemeChange, onCommand]);

  // Text-to-speech feedback
  const speakFeedback = useCallback((text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 0.7;
      utterance.rate = 1.2;
      utterance.pitch = 1;

      // Use a cosmic-themed voice if available
      const voices = speechSynthesis.getVoices();
      const cosmicVoice = voices.find(voice =>
        voice.name.includes('Female') || voice.name.includes('Zira')
      );
      if (cosmicVoice) {
        utterance.voice = cosmicVoice;
      }

      speechSynthesis.speak(utterance);
    }
  }, []);

  // Voice control functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Update voice settings
  const updateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
    if (recognitionRef.current) {
      recognitionRef.current.continuous = newSettings.continuous ?? prev.continuous;
      recognitionRef.current.lang = newSettings.language ?? prev.language;
    }
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Main Voice Control Button */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          className={`w-16 h-16 rounded-full backdrop-blur-md border-2 transition-all duration-300 ${
            isListening
              ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/50'
              : 'bg-black/20 border-white/20 hover:border-white/40'
          }`}
          onClick={isListening ? stopListening : startListening}
          animate={isListening ? {
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.8)',
              '0 0 20px rgba(168, 85, 247, 0.4)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isListening ? (
            <Mic className="w-6 h-6 text-purple-300 mx-auto" />
          ) : (
            <MicOff className="w-6 h-6 text-white/60 mx-auto" />
          )}
        </motion.button>

        {/* Voice Level Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute -inset-2 rounded-full border-2 border-purple-500/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1 + voiceLevel * 0.3,
                opacity: 0.3 + voiceLevel * 0.7
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Processing Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-2 h-2 bg-purple-300 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Voice Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute bottom-20 left-0 bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/10 min-w-64"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <VoiceSettingsPanel
              settings={voiceSettings}
              onUpdate={updateVoiceSettings}
              onClose={() => setShowSettings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Button */}
      <motion.button
        className="absolute -top-2 -right-2 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
        onClick={() => setShowSettings(!showSettings)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings className="w-4 h-4 text-white/60" />
      </motion.button>

      {/* Command History Tooltip */}
      <AnimatePresence>
        {commandHistory.length > 0 && (
          <motion.div
            className="absolute bottom-20 right-0 bg-black/30 backdrop-blur-md rounded-lg p-3 border border-white/10 max-w-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="text-white text-sm font-medium mb-2">Recent Commands</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {commandHistory.slice(0, 5).map((cmd, index) => (
                <div key={index} className="text-white/60 text-xs truncate">
                  {cmd}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Command Display */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            className="absolute top-0 left-20 bg-black/30 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-white/60 text-xs">Last: "{lastCommand}"</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Voice Settings Panel Component
const VoiceSettingsPanel = ({ settings, onUpdate, onClose }) => {
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(tempSettings);
    onClose();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Voice Settings</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Sensitivity */}
        <div>
          <label className="text-white/80 text-sm block mb-2">Sensitivity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={tempSettings.sensitivity}
            onChange={(e) => setTempSettings(prev => ({
              ...prev,
              sensitivity: parseFloat(e.target.value)
            }))}
            className="w-full"
          />
          <div className="text-white/60 text-xs mt-1">{tempSettings.sensitivity}</div>
        </div>

        {/* Language */}
        <div>
          <label className="text-white/80 text-sm block mb-2">Language</label>
          <select
            value={tempSettings.language}
            onChange={(e) => setTempSettings(prev => ({
              ...prev,
              language: e.target.value
            }))}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>

        {/* Continuous Listening */}
        <div className="flex items-center justify-between">
          <label className="text-white/80 text-sm">Continuous Listening</label>
          <button
            onClick={() => setTempSettings(prev => ({
              ...prev,
              continuous: !prev.continuous
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              tempSettings.continuous ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full"
              animate={{ x: tempSettings.continuous ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Voice Feedback */}
        <div className="flex items-center justify-between">
          <label className="text-white/80 text-sm">Voice Feedback</label>
          <button
            onClick={() => setTempSettings(prev => ({
              ...prev,
              feedback: !prev.feedback
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              tempSettings.feedback ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full"
              animate={{ x: tempSettings.feedback ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Settings
        </motion.button>
      </div>
    </div>
  );
};

export default VoiceCosmicNavigator;