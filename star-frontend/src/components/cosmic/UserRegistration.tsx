// star-frontend/src/components/cosmic/UserRegistration.tsx
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface CosmicProfile {
  id: string;
  birthDate: string;
  tone: number;
  daySign: string;
  signature: string;
  zodiacSystem: string;
  westernZodiac?: string;
  chineseZodiac?: string;
}

const GALACTIC_TONES = {
  1: { name: 'Magnetic', description: 'Initiates with purpose and attraction', color: '#ff4d4d' },
  2: { name: 'Lunar', description: 'Embraces polarity and challenge', color: '#4d4dff' },
  3: { name: 'Electric', description: 'Activates with dynamic energy', color: '#4dff4d' },
  4: { name: 'Self-Existing', description: 'Defines with form and structure', color: '#ffcc4d' },
  5: { name: 'Overtone', description: 'Empowers with radiant command', color: '#ff4dcc' },
  6: { name: 'Rhythmic', description: 'Balances with equality and rhythm', color: '#4dffff' },
  7: { name: 'Resonant', description: 'Attunes with universal harmony', color: '#cc4dff' },
  8: { name: 'Galactic', description: 'Aligns with integrity and truth', color: '#4dccff' },
  9: { name: 'Solar', description: 'Pulses with intention and realization', color: '#ff994d' },
  10: { name: 'Planetary', description: 'Manifests with perfection', color: '#994dff' },
  11: { name: 'Spectral', description: 'Liberates with dissolution', color: '#ff4d99' },
  12: { name: 'Crystal', description: 'Universalizes with cooperation', color: '#4d99ff' },
  13: { name: 'Cosmic', description: 'Transcends with universal connection', color: '#ffffff' }
};

const DAY_SIGNS = [
  'Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer', 'Rabbit',
  'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle', 'Vulture',
  'Earthquake', 'Flint', 'Rain', 'Flower'
];

interface UserRegistrationProps {
  onProfileCreated: (profile: CosmicProfile) => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState({
    userId: '',
    birthDate: '',
    zodiacSystem: 'Aztec',
    email: '',
    username: ''
  });
  const [calculatedProfile, setCalculatedProfile] = useState<CosmicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const calculateCosmicSignature = (birthDate: string) => {
    const date = new Date(birthDate);
    const dayNumber = Math.floor(date.getTime() / (1000 * 60 * 60 * 24)) + 2440587.5;

    const tone = (Math.floor(dayNumber) % 13) + 1;
    const daySignIndex = Math.floor(dayNumber) % 20;
    const daySign = DAY_SIGNS[daySignIndex];

    return { tone, daySign, signature: `${tone}-${daySign}` };
  };

  const handleBirthDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, birthDate: date }));

    if (date) {
      const { tone, daySign, signature } = calculateCosmicSignature(date);
      setCalculatedProfile({
        id: formData.username,
        birthDate: date,
        tone,
        daySign,
        signature,
        zodiacSystem: formData.zodiacSystem
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedProfile) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/v1/register', {
        ...formData,
        ...calculatedProfile
      });

      onProfileCreated(response.data.profile);
      setStep(3); // Success step
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getToneAnimation = (tone: number) => {
    const animations = {
      1: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } },
      2: { opacity: [0.7, 1, 0.7], transition: { repeat: Infinity, duration: 2 } },
      3: { rotate: [0, 360], transition: { repeat: Infinity, duration: 3 } },
      7: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
      13: { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 4 } }
    };
    return animations[tone as keyof typeof animations] || animations[1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 text-white max-w-2xl w-full border border-purple-500/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Create Your Cosmic Profile
          </h1>
          <p className="text-purple-300">Discover your place in the cosmic order</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value, userId: e.target.value }))}
                      className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Zodiac System
                  </label>
                  <select
                    value={formData.zodiacSystem}
                    onChange={(e) => setFormData(prev => ({ ...prev, zodiacSystem: e.target.value }))}
                    className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                  >
                    <option value="Aztec">Aztec Tonalpohualli (Sacred Calendar)</option>
                    <option value="Western">Western Zodiac</option>
                    <option value="Chinese">Chinese Zodiac</option>
                    <option value="Vedic">Vedic Astrology</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  disabled={!formData.birthDate || !formData.username || !formData.email}
                >
                  Calculate Cosmic Signature
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && calculatedProfile && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Your Cosmic Signature</h2>

              <motion.div
                className="mb-8 p-6 bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-2xl border border-purple-400/30"
                animate={getToneAnimation(calculatedProfile.tone)}
              >
                <div className="text-6xl font-bold mb-4" style={{ color: GALACTIC_TONES[calculatedProfile.tone as keyof typeof GALACTIC_TONES]?.color }}>
                  {calculatedProfile.signature}
                </div>
                <div className="text-xl mb-2">
                  Galactic Tone {calculatedProfile.tone}: {GALACTIC_TONES[calculatedProfile.tone as keyof typeof GALACTIC_TONES]?.name}
                </div>
                <div className="text-lg text-purple-300 mb-4">
                  Day Sign: {calculatedProfile.daySign}
                </div>
                <p className="text-sm text-purple-200">
                  {GALACTIC_TONES[calculatedProfile.tone as keyof typeof GALACTIC_TONES]?.description}
                </p>
              </motion.div>

              <div className="bg-indigo-900/30 p-4 rounded-lg mb-6">
                <p className="text-sm text-indigo-200">
                  This sacred signature connects you to the cosmic rhythms of the Tzolk'in,
                  the 260-day sacred calendar of the Maya and Aztec civilizations.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 p-3 rounded-lg mb-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-purple-800 p-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold mb-4">Welcome to the STAR Platform!</h2>
              <p className="text-purple-300 mb-6">
                Your cosmic profile has been created. You can now explore tarot readings,
                connect with other cosmic beings, and discover your galactic destiny.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Enter the Cosmos
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-xs text-purple-400">
          <p>Honoring the sacred wisdom of Mayan and Aztec cosmic traditions</p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRegistration;