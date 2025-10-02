'use client';

import { useState } from 'react';
import CosmicProfileGrid from '../components/CosmicProfileGrid';
import ResonanceMap from '../components/ResonanceMap';
import PoeticScroll from '../components/PoeticScroll';
import CosmicButton from '../components/CosmicButton';
import CosmicCard from '../components/CosmicCard';
import { calculateArchetypeOracle } from '../lib/api';
import { PublicOracleData } from '../types/archetype-oracle';

export default function PublicArchetypeOracle() {
  const [oracle, setOracle] = useState<PublicOracleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cosmic_profile');
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    tradition: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOracle(null);
    setLoading(true);
    try {
      const response = await calculateArchetypeOracle(formData);
      setOracle(response);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const onCardClick = (aspect: any) => {
    setActiveTab('aspect_detail');
    // Could store selected aspect for detail view
  };

  const tabs = [
    { id: 'cosmic_profile', label: 'Cosmic Profile' },
    { id: 'symbolic_spread', label: 'Symbolic Spread' },
    { id: 'resonance_map', label: 'Resonance Map' },
    { id: 'cycle_tracker', label: 'Cycle Tracker' },
    { id: 'karmic_insights', label: 'Karmic Insights' }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-300">
          Cosmic Archetype Oracle
        </h1>
        <h2 className="text-xl mb-8 text-center text-gray-300">
          Discover Your Archetypal Soul Blueprint
        </h2>

        {!oracle && (
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-lg border border-gray-500 mb-8 max-w-2xl mx-auto">
            <div className="mb-4">
              <label htmlFor="full_name" className="block text-lg mb-2 text-gray-200">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="birth_date" className="block text-lg mb-2 text-gray-200">Birth Date</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="tradition" className="block text-lg mb-2 text-gray-200">Esoteric Tradition</label>
              <select
                id="tradition"
                name="tradition"
                value={formData.tradition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Default (Universal)</option>
                <option value="Hermetic">Hermetic Wisdom</option>
                <option value="Kabbalistic">Kabbalistic Paths</option>
                <option value="Theosophical">Theosophical Light</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Revealing Oracle...' : 'Reveal Your Oracle'}
            </button>
          </form>
        )}

        {error && (
          <div className="text-center text-red-400 mb-8">
            Error: {error}
          </div>
        )}

        {oracle && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Components */}
            {activeTab === 'cosmic_profile' && oracle.cosmic_profile && (
              <CosmicProfileGrid
                profileData={oracle.cosmic_profile}
                onCardClick={onCardClick}
              />
            )}

            {activeTab === 'resonance_map' && oracle.resonance_map && oracle.cosmic_profile?.cosmic_ui && (
              <ResonanceMap
                resonanceMap={oracle.resonance_map}
                cosmicUI={oracle.cosmic_profile.cosmic_ui}
              />
            )}

            {/* Poetic Scrolls for all aspects */}
            {activeTab === 'cosmic_profile' && oracle.cosmic_profile && (
              <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-center text-starlight mb-8">Poetic Scrolls of Revelation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(oracle.cosmic_profile.poetic_scrolls).map(([aspect, scrollText], index) => (
                    <PoeticScroll
                      key={aspect}
                      text={scrollText}
                      cosmicUI={oracle.cosmic_profile?.cosmic_ui?.[aspect as keyof typeof oracle.cosmic_profile.cosmic_ui]}
                      delay={index * 200}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'symbolic_spread' && oracle.symbolic_spread && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-center text-starlight mb-8">Past • Present • Future</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {Object.entries(oracle.symbolic_spread.spread).map(([position, data]: [string, any], index) => (
                    <CosmicCard key={position} className="p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-4">
                          {position === 'past' ? '📜' : position === 'present' ? '✨' : '🔮'}
                        </div>
                        <h3 className="text-xl font-bold text-starlight mb-4 capitalize">
                          {position} Path
                        </h3>
                        {data.card && (
                          <div className="mb-4">
                            <div className="text-2xl font-bold text-cosmic-accent mb-2">
                              {data.card.card}
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{data.card.meaning}</p>
                            <p className="text-xs text-red-400 italic">Shadow: {data.card.shadow}</p>
                          </div>
                        )}
                        <div className="bg-cosmic-deep/50 p-4 rounded-lg">
                          <p className="text-sm text-gray-300 italic">"{data.interpretation}"</p>
                        </div>
                      </div>
                    </CosmicCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cycle_tracker' && oracle.cycle_tracker && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-center text-starlight mb-8">Personal Cycle Tracker</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Year */}
                  <CosmicCard className="p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-2xl font-bold text-starlight mb-4">Personal Year</h3>
                      <div className="text-6xl font-bold text-cosmic-accent mb-4">
                        {oracle.cycle_tracker.personal_year.number}
                      </div>
                      <p className="text-gray-300 mb-3">
                        {oracle.cycle_tracker.personal_year.meaning?.name || 'Universal Flow'}
                      </p>
                      {oracle.cycle_tracker.personal_year.tarot && (
                        <div className="bg-cosmic-deep/50 p-4 rounded-lg mt-4">
                          <p className="text-sm text-cosmic-glow font-semibold mb-2">
                            Tarot Guide: {oracle.cycle_tracker.personal_year.tarot.card}
                          </p>
                          <p className="text-xs text-gray-300">
                            {oracle.cycle_tracker.personal_year.tarot.meaning}
                          </p>
                        </div>
                      )}
                    </div>
                  </CosmicCard>

                  {/* Daily Vibration */}
                  <CosmicCard className="p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🌟</div>
                      <h3 className="text-2xl font-bold text-starlight mb-4">Daily Vibration</h3>
                      <div className="text-6xl font-bold text-cosmic-accent mb-4">
                        {oracle.cycle_tracker.daily_vibration.number}
                      </div>
                      <p className="text-cosmic-glow italic mb-3">
                        {oracle.cycle_tracker.daily_vibration.message}
                      </p>
                      {oracle.cycle_tracker.daily_vibration.tarot && (
                        <div className="bg-cosmic-deep/50 p-4 rounded-lg mt-4">
                          <p className="text-sm text-cosmic-glow font-semibold mb-2">
                            Today brings: {oracle.cycle_tracker.daily_vibration.tarot.card}
                          </p>
                          <p className="text-xs text-gray-300">
                            {oracle.cycle_tracker.daily_vibration.tarot.meaning}
                          </p>
                        </div>
                      )}
                    </div>
                  </CosmicCard>
                </div>
              </div>
            )}

            {activeTab === 'karmic_insights' && oracle.karmic_insights && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-center text-starlight mb-8">Karmic Insights</h2>
                {oracle.karmic_insights.karmic_insights.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {oracle.karmic_insights.karmic_insights.map((insight, index: number) => (
                      <CosmicCard key={index} className="p-6">
                        <div className="text-center">
                          <div className="text-4xl mb-4">🔥</div>
                          <h3 className="text-xl font-bold text-starlight mb-4">Karmic Lesson #{insight.number}</h3>
                          <p className="text-lg text-cosmic-accent font-semibold mb-3">{insight.lesson}</p>

                          {insight.tarot && (
                            <div className="bg-cosmic-deep/50 p-4 rounded-lg mb-4">
                              <p className="text-sm text-cosmic-glow font-semibold mb-2">
                                Tarot: {insight.tarot.card}
                              </p>
                              <p className="text-xs text-gray-300">{insight.tarot.meaning}</p>
                            </div>
                          )}

                          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-red-300 font-semibold mb-2">Karmic Ritual:</p>
                            <p className="text-xs text-gray-300">{insight.ritual}</p>
                          </div>

                          <div className="text-xs text-gray-400 italic">
                            "{insight.message}"
                          </div>
                        </div>
                      </CosmicCard>
                    ))}
                  </div>
                ) : (
                  <CosmicCard className="p-12 text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-2xl font-bold text-starlight mb-4">Clean Karmic Slate</h3>
                    <p className="text-gray-300">{oracle.karmic_insights.message}</p>
                  </CosmicCard>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
