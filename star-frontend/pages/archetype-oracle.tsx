'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface NumerologyData {
  number: number;
  calculation: string;
  meaning: {
    name: string;
    traits: string;
    strengths: string;
    challenges: string;
    vibration: string;
  };
  karmic_debt?: {
    reduces_to: number;
    lesson: string;
  };
}

interface TarotData {
  card: string;
  meaning: string;
  shadow: string;
}

interface PlanetaryData {
  planet: string;
  element: string;
  color: string;
  sound: string;
  geometry: string;
  karmic_ritual?: any;
}

interface PersonaData {
  numerology: NumerologyData;
  tarot: TarotData;
  planetary: PlanetaryData;
}

interface CosmicProfile {
  numerology: Record<string, NumerologyData>;
  tarot: Record<string, TarotData>;
  planetary: Record<string, PlanetaryData>;
  archetypal_persona: Record<string, string>;
  tailwind_classes?: Record<string, any>;
  emotional_resonance?: Record<string, any>;
  cosmic_ui?: Record<string, any>;
}

interface SymbolicSpread {
  spread: Record<string, { card: TarotData; interpretation: string }>;
  numerology_reference: NumerologyData;
}

interface ResonanceMap {
  [key: string]: PlanetaryData;
}

interface PersonalCycle {
  personal_year: {
    number: number;
    meaning: any;
    tarot: TarotData;
  };
  daily_vibration: {
    number: number;
    meaning: any;
    tarot: TarotData;
    message: string;
  };
}

interface KarmicInsights {
  karmic_insights: Array<{
    number: number;
    lesson: string;
    tarot: TarotData;
    ritual: string;
    message: string;
  }>;
  message?: string;
}

interface OracleData {
  cosmic_profile: CosmicProfile & { poetic_scrolls?: Record<string, string> };
  symbolic_spread: SymbolicSpread;
  resonance_map: ResonanceMap & { [key: string]: PlanetaryData & { number: number; poetic_description?: string } };
  cycle_tracker: PersonalCycle;
  karmic_insights: KarmicInsights;
  user_info: {
    full_name: string;
    birth_date: string;
    tradition?: string;
  };
}

export default function ArchetypeOracle() {
  const [oracle, setOracle] = useState<OracleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cosmic_profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [tradition, setTradition] = useState<string>('');

  useEffect(() => {
    const fetchOracle = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to view your archetype oracle');
        }
        const response = await axios.get(`${API_URL}/archetype-oracle`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setOracle(response.data);
        setTradition(response.data.user_info?.tradition || '');
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOracle();
  }, []);

  const handleTraditionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTradition = e.target.value;
    setTradition(newTradition);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/user/settings`, { tradition: newTradition }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Refetch oracle with new tradition
      const response = await axios.get(`${API_URL}/archetype-oracle`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setOracle(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResonanceChartData = () => {
    if (!oracle?.resonance_map) return null;

    const dataValues = [
      oracle.cosmic_profile.numerology.life_path?.number || 0,
      oracle.cosmic_profile.numerology.destiny?.number || 0,
      oracle.cosmic_profile.numerology.soul_urge?.number || 0,
      oracle.cosmic_profile.numerology.personality?.number || 0,
      oracle.cosmic_profile.numerology.birth_day?.number || 0,
    ];

    return {
      labels: ['Life Path', 'Destiny', 'Soul Urge', 'Personality', 'Birth Day'],
      datasets: [
        {
          label: 'Numerical Values',
          data: dataValues,
          backgroundColor: 'rgba(75, 0, 130, 0.2)',
          borderColor: '#4B0082',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4B0082',
          pointRadius: 5,
        },
      ],
    };
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: '#ffffff' },
        grid: { color: '#4B0082' },
        pointLabels: { color: '#ffffff' },
        ticks: { color: '#ffffff', backdropColor: 'transparent' }
      }
    },
    plugins: {
      legend: { labels: { color: '#ffffff' } },
      title: { display: true, text: 'Cosmic Resonance Map', color: '#ffffff' }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading your cosmic archetype...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

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
          Your Archetype Oracle
        </h1>
        <h2 className="text-xl mb-8 text-center text-gray-300">
          Welcome, {oracle?.user_info?.full_name || 'Seeker of Cosmic Wisdom'}
        </h2>

        <div className="mb-8 text-center">
          <label htmlFor="tradition" className="block text-lg mb-4 text-gray-200">
            Eso.teric Tradition:
          </label>
          <select
            id="tradition"
            value={tradition}
            onChange={handleTraditionChange}
            className="px-6 py-3 bg-purple-900 text-white border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Default (Universal)</option>
            <option value="Hermetic">Hermetic Wisdom</option>
            <option value="Kabbalistic">Kabbalistic Paths</option>
            <option value="Theosophical">Theosophical Light</option>
          </select>
        </div>

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

        {activeTab === 'cosmic_profile' && oracle?.cosmic_profile && (
          <div className="space-y-8">
            {/* Cosmic Navigation */}
            <div className="flex justify-center">
              <div dangerouslySetInnerHTML={{
                __html: '<nav class="bg-cosmic-deep border border-cosmic-glow/20 rounded-lg p-2"><div class="flex space-x-2 justify-center"><button class="bg-cosmic-glow text-cosmic-deep px-4 py-2 rounded-lg transition animate-pulse-slow">🔥 ♋ Life Path</button><button class="text-star-white hover:bg-cosmic-purple/10 px-4 py-2 rounded-lg transition animate-pulse-slow">✨ Destiny</button><button class="text-star-white hover:bg-cosmic-purple/10 px-4 py-2 rounded-lg transition animate-pulse-slow">💫 Soul Urge</button><button class="text-star-white hover:bg-cosmic-purple/10 px-4 py-2 rounded-lg transition animate-pulse-slow">🌟 Personality</button><button class="text-star-white hover:bg-cosmic-purple/10 px-4 py-2 rounded-lg transition animate-pulse-slow">🌙 Birth Day</button></div></nav>'
              }} />
            </div>

            {/* Archetype Cards with Cosmic UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(oracle.cosmic_profile.numerology).map(([key, data]) => {
                const aspect = key;
                const tailwindClasses = oracle.cosmic_profile.tailwind_classes?.[aspect] || {};
                const emotional = oracle.cosmic_profile.emotional_resonance?.[aspect] || {};
                const uiData = oracle.cosmic_profile.cosmic_ui?.[aspect] || {};

                return (
                  <div key={key} className={`${tailwindClasses.card_bg || 'bg-void border border-yellow-400'} rounded-xl p-6 shadow-lg ${tailwindClasses.glow_effect || 'shadow-yellow-400/50'}`}>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-void text-2xl">✦</span>
                      </div>
                      <h3 className={`${tailwindClasses.text_color || 'text-starlight'} text-xl font-bold mb-2`}>
                        {oracle.cosmic_profile.archetypal_persona[key]}
                      </h3>
                      <p className={`${tailwindClasses.accent_color || 'text-yellow-400'} mb-4`}>
                        {oracle.cosmic_profile.poetic_scrolls?.[key]}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Number:</span>
                          <span className="text-yellow-400">{data.number}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Emotional Frequency:</span>
                          <span className="text-yellow-400">{emotional.frequency || 'Activating'}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Resonance:</span>
                          <span className="text-yellow-400">{emotional.resonance_strength || 80}%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {oracle.cosmic_profile.tarot[key] && (
                          <div className="text-xs">
                            <p className="text-green-400">{oracle.cosmic_profile.tarot[key].card}</p>
                            <p className="text-red-400">Shadow: {oracle.cosmic_profile.tarot[key].shadow}</p>
                          </div>
                        )}
                        {oracle.cosmic_profile.planetary[key] && (
                          <div className="text-xs">
                            <span className="text-blue-400">{oracle.cosmic_profile.planetary[key].planet}</span>
                            <span className="text-gray-400"> • </span>
                            <span className="text-orange-400">{oracle.cosmic_profile.planetary[key].element}</span>
                          </div>
                        )}
                      </div>

                      {data.karmic_debt && (
                        <div className="mt-4 p-3 bg-red-900/30 rounded-lg border-l-4 border-red-500">
                          <div className="text-red-300 font-semibold text-sm">Karmic Debt</div>
                          <div className="text-xs text-gray-300">{data.karmic_debt.lesson}</div>
                        </div>
                      )}

                      <button className={`${tailwindClasses.button_classes || 'bg-yellow-400 text-void hover:bg-yellow-300'} px-4 py-2 rounded-lg font-bold mt-4 transition transform hover:scale-105 text-sm`}>
                        Explore {aspect.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Harmony Suggestions */}
            {oracle.cosmic_profile.emotional_resonance && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(oracle.cosmic_profile.emotional_resonance).map(([aspect, emotional]: [string, any]) => (
                  <div key={aspect} className="bg-gradient-to-br from-purple-900 to-blue-900 p-4 rounded-lg border border-purple-500">
                    <h4 className="text-purple-200 font-semibold mb-2 capitalize">
                      {aspect.replace('_', ' ')} Harmony
                    </h4>
                    <p className="text-gray-300 text-sm">{emotional.harmony_suggestion}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {emotional.primary_emotions?.map((emotion: string, i: number) => (
                        <span key={i} className="bg-purple-600 text-xs px-2 py-1 rounded-full">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'symbolic_spread' && oracle?.symbolic_spread && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(oracle.symbolic_spread.spread).map(([position, data]) => (
              <div key={position} className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-xl shadow-lg border border-blue-500">
                <h3 className="text-xl font-semibold mb-4 text-blue-200 capitalize">
                  {position}
                </h3>
                {data.card && (
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">{data.card.card}</div>
                    <p className="text-sm text-gray-300 mb-2">{data.card.meaning}</p>
                    <p className="text-xs text-red-400">Shadow: {data.card.shadow}</p>
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  <strong>Interpretation:</strong> {data.interpretation}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resonance_map' && oracle?.resonance_map && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-500">
              <h3 className="text-xl font-semibold mb-6 text-center text-gray-200">Cosmic Resonance Map</h3>
              <div className="h-96 w-full max-w-2xl mx-auto">
                {getResonanceChartData() && <Radar data={getResonanceChartData()!} options={chartOptions} />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(oracle.resonance_map).map(([key, data]) => (
                <div key={key} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg border border-gray-500">
                  <h4 className="text-lg font-semibold mb-3 text-gray-200">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Planet:</span>
                      <span className="text-blue-400">{data.planet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Element:</span>
                      <span className="text-orange-400">{data.element}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Color:</span>
                      <span className="text-pink-400">{data.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sound:</span>
                      <span className="text-green-400">{data.sound}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Geometry:</span>
                      <span className="text-teal-400">{data.geometry}</span>
                    </div>
                    {data.poetic_description && (
                      <div className="mt-3 p-2 bg-purple-900/20 rounded border border-purple-500 italic text-pink-300">
                        <div className="text-xs text-purple-200 font-semibold">Poetic Flow:</div>
                        <div className="text-xs text-gray-300">{data.poetic_description}</div>
                      </div>
                    )}
                    {data.karmic_ritual && (
                      <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-500">
                        <div className="text-red-300 font-semibold text-xs">Karmic Ritual</div>
                        <div className="text-xs text-gray-300">{data.karmic_ritual.ritual}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cycle_tracker' && oracle?.cycle_tracker && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-900 to-emerald-900 p-6 rounded-xl shadow-lg border border-green-500">
              <h3 className="text-xl font-semibold mb-4 text-green-200">Personal Year</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{oracle.cycle_tracker.personal_year.number}</div>
                  <div className="text-sm text-gray-300 mb-3">{oracle.cycle_tracker.personal_year.meaning?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-300">{oracle.cycle_tracker.personal_year.meaning?.vibration || 'Unknown vibration'}</div>
                </div>
                {oracle.cycle_tracker.personal_year.tarot && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-200 mb-2">Tarot Guide</h4>
                    <div className="text-lg text-yellow-400 mb-1">{oracle.cycle_tracker.personal_year.tarot.card}</div>
                    <div className="text-sm text-gray-300">{oracle.cycle_tracker.personal_year.tarot.meaning}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-xl shadow-lg border border-purple-500">
              <h3 className="text-xl font-semibold mb-4 text-purple-200">Daily Vibration</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-2">{oracle.cycle_tracker.daily_vibration.number}</div>
                <div className="text-lg text-gray-300 mb-4">{oracle.cycle_tracker.daily_vibration.message}</div>
                {oracle.cycle_tracker.daily_vibration.tarot && (
                  <div className="bg-purple-800/30 p-4 rounded-lg">
                    <div className="text-xl text-yellow-400 mb-2">{oracle.cycle_tracker.daily_vibration.tarot.card}</div>
                    <div className="text-sm text-gray-300">{oracle.cycle_tracker.daily_vibration.tarot.meaning}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'karmic_insights' && oracle?.karmic_insights && (
          <div className="space-y-6">
            {oracle.karmic_insights.karmic_insights.length > 0 ? (
              oracle.karmic_insights.karmic_insights.map((insight, index) => (
                <div key={index} className="bg-gradient-to-br from-red-900 to-pink-900 p-6 rounded-xl shadow-lg border border-red-500">
                  <h3 className="text-xl font-semibold mb-4 text-red-200">Karmic Insight {index + 1}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-yellow-400 mb-2">#{insight.number}</div>
                      <div className="text-lg font-semibold text-red-300 mb-2">{insight.lesson}</div>
                      <div className="text-sm text-gray-300 p-3 bg-red-800/20 rounded">
                        <strong>Ritual:</strong> {insight.ritual}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-200 mb-2">Tarot Guidance</h4>
                      {insight.tarot && (
                        <>
                          <div className="text-xl text-yellow-400 mb-2">{insight.tarot.card}</div>
                          <div className="text-sm text-gray-300 mb-2">{insight.tarot.meaning}</div>
                        </>
                      )}
                      <div className="text-sm text-gray-300 italic">"{insight.message}"</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gradient-to-br from-green-900 to-teal-900 p-8 rounded-xl shadow-lg border border-green-500 text-center">
                <div className="text-2xl text-green-400 mb-4">✨ Clean Slate ✨</div>
                <div className="text-lg text-gray-200">{oracle.karmic_insights.message}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

