import { useRouter } from 'next/router';
import { useState } from 'react';
import CosmicButton from '../src/components/CosmicButton';
import CosmicCard from '../src/components/CosmicCard';
import LoadingSpinner from '../src/components/LoadingSpinner';
import MentorOverlay from '../src/components/MentorOverlay';
import PoeticScroll from '../src/components/PoeticScroll';
import TarotCard from '../src/components/TarotCard';
import { api } from '../src/lib/api';

interface OracleExperience {
  cosmic_profile?: any;
  archetype_synthesis?: any;
  resonance_tracking?: any;
  cycle_tracking?: any;
  mentor_interaction?: any;
  emotional_processing?: any;
}

interface MentorResponse {
  mentor_persona: {
    name: string;
    archetypal_alignment: string;
  };
  mood_state: string;
  response_content: string;
  voice_features: any;
  recommended_actions: string[];
}

export default function OccultOracleAI() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [oracleExperience, setOracleExperience] = useState<OracleExperience | null>(null);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [userInput, setUserInput] = useState('');
  const [userEmotion, setUserEmotion] = useState('');
  const [showMentorResponse, setShowMentorResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const generateOracleExperience = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.post('/api/v1/occult-oracle/experience', {
        user_input: userInput || undefined,
        emotion: userEmotion || undefined
      });

      setOracleExperience(response.data.oracle_experience);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate oracle experience');
    } finally {
      setIsLoading(false);
    }
  };

  const consultMentor = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.post('/api/v1/occult-oracle/mentor', {
        user_input: userInput
      });

      setMentorResponse(response.data.mentor_response);
      setShowMentorResponse(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to consult mentor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmotionProcessing = async () => {
    if (!userEmotion.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.post('/api/v1/occult-oracle/emotional-os', {
        emotion: userEmotion,
        consent: true
      });

      // Update the experience with emotional processing
      setOracleExperience(prev => ({
        ...prev,
        emotional_processing: response.data.emotional_processing
      }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process emotion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResponse = () => {
    if (!mentorResponse?.voice_features) return;

    // Web Speech API implementation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(mentorResponse.response_content);

      // Set voice characteristics
      utterance.rate = mentorResponse.voice_features.pace === 'measured' ? 0.8 : 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 0.8;

      // Add some effects for different moods
      if (mentorResponse.mood_state === 'mysterious') {
        utterance.rate = 0.7;
        utterance.pitch = 0.8;
      } else if (mentorResponse.mood_state === 'empowering') {
        utterance.rate = 1.1;
        utterance.volume = 0.9;
      }

      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-dark text-starlight p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-cosmic-glow bg-clip-text text-transparent mb-4">
            Occult Oracle AI
          </h1>
          <p className="text-xl text-star-white/70">
            Your sentient archetype synthesizer - blending astrology, tarot, numerology, and adaptive intelligence
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Section */}
        <CosmicCard className="mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="user-input" className="block text-sm font-medium text-starlight mb-2">
                Seek Guidance (Optional)
              </label>
              <textarea
                id="user-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="What wisdom do you seek from the cosmic intelligence?"
                className="w-full bg-void border border-cosmic-glow/20 rounded-lg p-3 text-starlight placeholder-star-white/40 focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="user-emotion" className="block text-sm font-medium text-starlight mb-2">
                Current Emotion (Optional)
              </label>
              <input
                id="user-emotion"
                type="text"
                value={userEmotion}
                onChange={(e) => setUserEmotion(e.target.value)}
                placeholder="How are you feeling right now?"
                className="w-full bg-void border border-cosmic-glow/20 rounded-lg p-3 text-starlight placeholder-star-white/40 focus:border-cosmic-pink focus:ring-1 focus:ring-cosmic-pink"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <CosmicButton
                onClick={generateOracleExperience}
                disabled={isLoading}
                className="flex-1 min-w-[200px]"
              >
                {isLoading ? <LoadingSpinner /> : '⚡ Generate Oracle Experience'}
              </CosmicButton>

              {userInput && (
                <CosmicButton
                  onClick={consultMentor}
                  disabled={isLoading}
                  variant="secondary"
                >
                  👨‍🏫 Consult Mentor
                </CosmicButton>
              )}

              {userEmotion && (
                <CosmicButton
                  onClick={handleEmotionProcessing}
                  disabled={isLoading}
                  variant="blue"
                >
                  💝 Process Emotion
                </CosmicButton>
              )}
            </div>
          </div>
        </CosmicCard>

        {/* Mentor Response Overlay */}
        {showMentorResponse && mentorResponse && (
          <MentorOverlay
            mentor={mentorResponse.mentor_persona}
            response={mentorResponse.response_content}
            mood={mentorResponse.mood_state}
            actions={mentorResponse.recommended_actions}
            voiceFeatures={mentorResponse.voice_features}
            onVoicePlay={handleVoiceResponse}
            onClose={() => setShowMentorResponse(false)}
          />
        )}

        {/* Results Tabs */}
        {oracleExperience && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 border-b border-cosmic-glow/20">
              {[
                { key: 'profile', label: '🌟 Cosmic Profile', icon: '✨' },
                { key: 'synthesis', label: '🔮 Archetype Synthesis', icon: '♦️' },
                { key: 'resonance', label: '🌊 Resonance Tracking', icon: '🌊' },
                { key: 'cycles', label: '🌀 Cycle Tracking', icon: '🌀' },
                { key: 'emotion', label: '💝 Emotional Processing', icon: '💝' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-t-lg transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-cosmic-glow text-cosmic-deep border-b-2 border-cosmic-blue'
                      : 'text-star-white/70 hover:text-starlight hover:bg-cosmic-glow/10'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {oracleExperience && (
          <div className="space-y-6">
            {activeTab === 'profile' && oracleExperience.cosmic_profile && (
              <div id="cosmic-profile">
                <h3 className="text-2xl font-bold text-cosmic-blue mb-4">🌟 Your Cosmic Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(oracleExperience.cosmic_profile.numerology || {}).map(([key, data]: [string, any]) => (
                    <CosmicCard key={key}>
                      <h4 className="text-lg font-semibold text-cosmic-purple mb-2 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="space-y-2">
                        <p className="text-starlight">
                          <span className="text-cosmic-pink">Number:</span> {data.number}
                        </p>
                        {oracleExperience.cosmic_profile.tarot?.[key] && (
                          <p className="text-starlight">
                            <span className="text-cosmic-blue">Tarot:</span> {oracleExperience.cosmic_profile.tarot[key].card}
                          </p>
                        )}
                        {oracleExperience.cosmic_profile.planetary?.[key] && (
                          <p className="text-starlight">
                            <span className="text-cosmic-glow">Planet:</span> {oracleExperience.cosmic_profile.planetary[key].planet}
                          </p>
                        )}
                      </div>
                    </CosmicCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'synthesis' && oracleExperience.archetype_synthesis && (
              <div id="archetype-synthesis">
                <h3 className="text-2xl font-bold text-cosmic-purple mb-4">🔮 Archetype Synthesis</h3>
                <CosmicCard>
                  <h4 className="text-xl font-semibold text-cosmic-glow mb-4">
                    {oracleExperience.archetype_synthesis.integrated_persona?.name || 'Synthesizing Archetypes...'}
                  </h4>
                  <p className="text-starlight mb-4">
                    {oracleExperience.archetype_synthesis.integrated_persona?.description}
                  </p>
                  {oracleExperience.archetype_synthesis.integrated_persona?.components && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {oracleExperience.archetype_synthesis.integrated_persona.components.map((component: string, index: number) => (
                        <div key={`${component}-${index}`} className="bg-cosmic-glow/10 rounded-lg p-2 text-center text-starlight">
                          {component}
                        </div>
                      ))}
                    </div>
                  )}
                  <PoeticScroll
                    content={oracleExperience.archetype_synthesis.poetic_scrolls || {}}
                  />
                </CosmicCard>
              </div>
            )}

            {activeTab === 'resonance' && oracleExperience.resonance_tracking && (
              <div id="resonance-tracking">
                <h3 className="text-2xl font-bold text-cosmic-blue mb-4">🌊 Resonance Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CosmicCard>
                    <h4 className="text-lg font-semibold text-cosmic-glow mb-3">Daily Frequency</h4>
                    <div className="space-y-2">
                      <p className="text-starlight">
                        <span className="text-cosmic-pink">Number:</span> {oracleExperience.resonance_tracking.daily_frequency?.number}
                      </p>
                      <p className="text-starlight">
                        <span className="text-cosmic-blue">Name:</span> {oracleExperience.resonance_tracking.daily_frequency?.name}
                      </p>
                      <p className="text-starlight text-sm">
                        {oracleExperience.resonance_tracking.daily_frequency?.description}
                      </p>
                    </div>
                  </CosmicCard>

                  <CosmicCard>
                    <h4 className="text-lg font-semibold text-cosmic-pink mb-3">Emotional Tendencies</h4>
                    <div className="space-y-2 text-starlight">
                      <p>🌟 Harmony Practices</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {oracleExperience.resonance_tracking.harmony_practices?.map((practice: string, index: number) => (
                          <li key={`${practice}-${index}`}>{practice}</li>
                        ))}
                      </ul>
                    </div>
                  </CosmicCard>
                </div>
              </div>
            )}

            {activeTab === 'cycles' && oracleExperience.cycle_tracking && (
              <div id="cycle-tracking">
                <h3 className="text-2xl font-bold text-cosmic-purple mb-4">🌀 Cycle Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CosmicCard>
                    <h4 className="text-lg font-semibold text-cosmic-blue mb-3">Personal Year</h4>
                    <div className="space-y-2">
                      <p className="text-starlight">
                        <span className="text-cosmic-glow">Number:</span> {oracleExperience.cycle_tracking.personal_year?.number}
                      </p>
                      <p className="text-starlight text-sm">
                        {oracleExperience.cycle_tracking.personal_year?.tarot?.meaning}
                      </p>
                    </div>
                  </CosmicCard>

                  <CosmicCard>
                    <h4 className="text-lg font-semibold text-cosmic-pink mb-3">Daily Vibration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TarotCard
                          card={oracleExperience.cycle_tracking.daily_vibration?.tarot}
                          size="sm"
                        />
                        <div>
                          <p className="text-starlight font-semibold">
                            {oracleExperience.cycle_tracking.daily_vibration?.tarot?.card}
                          </p>
                          <p className="text-star-white/70 text-sm">
                            {oracleExperience.cycle_tracking.daily_vibration?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CosmicCard>
                </div>
              </div>
            )}

            {activeTab === 'emotion' && oracleExperience.emotional_processing && (
              <div id="emotional-processing">
                <h3 className="text-2xl font-bold text-cosmic-pink mb-4">💝 Emotional Processing</h3>
                <CosmicCard>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-cosmic-glow mb-2">
                        Analysis: {oracleExperience.emotional_processing.emotional_analysis?.sentiment_type?.toUpperCase()}
                      </h4>
                      <p className="text-starlight mb-2">
                        Detected emotion pattern with {oracleExperience.emotional_processing.emotional_analysis?.valence} valence
                        and {oracleExperience.emotional_processing.emotional_analysis?.arousal} arousal.
                      </p>
                      {oracleExperience.emotional_processing.emotional_analysis?.keywords_found && (
                        <p className="text-star-white/70 text-sm">
                          Keywords: {oracleExperience.emotional_processing.emotional_analysis.keywords_found.join(', ')}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-cosmic-blue mb-2">Emotional Response</h4>
                      <p className="text-starlight whitespace-pre-line">
                        {oracleExperience.emotional_processing.response_content}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-cosmic-purple mb-2">Supportive Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {oracleExperience.emotional_processing.supportive_resources?.map((resource: string, index: number) => (
                          <div key={`${resource}-${index}`} className="bg-cosmic-glow/10 rounded-lg p-3 text-starlight">
                            {resource}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CosmicCard>
              </div>
            )}
          </div>
        )}

        {!oracleExperience && !isLoading && (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">🔮</div>
            <h3 className="text-2xl font-bold text-starlight mb-2">
              Begin Your Occult Oracle Journey
            </h3>
            <p className="text-star-white/70 mb-6">
              Enter your thoughts and emotions to receive personalized cosmic guidance from our sentient archetype synthesizer.
            </p>
            <CosmicButton onClick={generateOracleExperience} size="lg">
              🌟 Start Oracle Experience
            </CosmicButton>
          </div>
        )}
      </div>
    </div>
  );
}

