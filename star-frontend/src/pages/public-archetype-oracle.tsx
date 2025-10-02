'use client';

import { useState } from 'react';
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

interface OracleData {
  cosmic_profile: any;
  symbolic_spread: any;
  resonance_map: any;
  cycle_tracker: any;
  karmic_insights: any;
  user_info: {
    full_name: string;
    birth_date: string;
    tradition: string;
  };
}

export default function PublicArchetypeOracle() {
  const [oracle, setOracle] = useState<OracleData | null>(null);
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
      const response = await axios.post(`${API_URL}/archetype-oracle/calculate`, formData);
      setOracle(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResonanceChartData = () => {
    if (!oracle?.resonance_map) return null;

    const dataValues = Object.values(oracle.resonance_map).map((item: any) => item.number || 0);

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

            {/* Similar tab content as in archetype-oracle.tsx */}
            {activeTab === 'cosmic_profile' && oracle.cosmic_profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(oracle.cosmic_profile.numerology).map(([key, data]: [string, any]) => (
                  <div key={key} className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl shadow-lg border border-purple-500">
                    <h3 className="text-xl font-semibold mb-2 text-purple-200">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">
                        {oracle.cosmic_profile.archetypal_persona[key]}
                      </div>
                      <div className="text-sm text-gray-300">Number: {data.number}</div>
                    </div>
                    {oracle.cosmic_profile.poetic_scrolls?.[key] && (
                      <div className="mb-4 p-3 bg-purple-800/30 rounded-lg italic text-pink-300 border-l-4 border-pink-500">
                        <strong>Poetic Scroll:</strong> {oracle.cosmic_profile.poetic_scrolls[key]}
                      </div>
                    )}
                    {oracle.cosmic_profile.tarot[key] && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-purple-200">Tarot Arcana</h4>
                        <p className="text-sm text-gray-300">{oracle.cosmic_profile.tarot[key].card}</p>
                        <p className="text-xs text-green-400 mt-1">{oracle.cosmic_profile.tarot[key].meaning}</p>
                        <p className="text-xs text-red-400 mt-1">Shadow: {oracle.cosmic_profile.tarot[key].shadow}</p>
                      </div>
                    )}
                    {oracle.cosmic_profile.planetary[key] && (
                      <div>
                        <h4 className="text-lg font-semibold text-purple-200">Cosmic Correspondences</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Planet: <span className="text-blue-400">{oracle.cosmic_profile.planetary[key].planet}</span></div>
                          <div>Element: <span className="text-orange-400">{oracle.cosmic_profile.planetary[key].element}</span></div>
                          <div>Color: <span className="text-pink-400">{oracle.cosmic_profile.planetary[key].color}</span></div>
                          <div>Sound: <span className="text-green-400">{oracle.cosmic_profile.planetary[key].sound}</span></div>
                          <div>Geometry: <span className="text-teal-400">{oracle.cosmic_profile.planetary[key].geometry}</span></div>
                        </div>
                      </div>
                    )}
                    {data.karmic_debt && (
                      <div className="mt-4 p-3 bg-red-900/30 rounded-lg border-l-4 border-red-500">
                        <div className="text-red-300 font-semibold">Karmic Debt</div>
                        <div className="text-sm text-gray-300">{data.karmic_debt.lesson}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'symbolic_spread' && oracle.symbolic_spread && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(oracle.symbolic_spread.spread).map(([position, data]: [string, any]) => (
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

            {activeTab === 'resonance_map' && oracle.resonance_map && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-500">
                  <h3 className="text-xl font-semibold mb-6 text-center text-gray-200">Cosmic Resonance Map</h3>
                  <div className="h-96 w-full max-w-2xl mx-auto">
                    {getResonanceChartData() && <Radar data={getResonanceChartData()!} options={chartOptions} />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(oracle.resonance_map).map(([key, data]: [string, any]) => (
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

            {activeTab === 'cycle_tracker' && oracle.cycle_tracker && (
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

            {activeTab === 'karmic_insights' && oracle.karmic_insights && (
              <div className="space-y-6">
                {oracle.karmic_insights.karmic_insights.length > 0 ? (
                  oracle.karmic_insights.karmic_insights.map((insight: any, index: number) => (
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
          </>
        )}
      </div>
    </div>
  );
}
