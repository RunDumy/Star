/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { AuthGuard } from './AuthGuard';

const TarotCard3D = ({ cardName }: { cardName: string }) => {
  return (
    <div className="w-[200px] h-[300px] bg-[#4B0082] flex items-center justify-center text-white">
      {cardName}
    </div>
  );
};

export function MatchmakingInner(): any {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [connections, setConnections] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const [zodiacFilter, setZodiacFilter] = useState<string>('')
  const [tab, setTab] = useState<'suggestions' | 'connections' | 'horoscopes'>('suggestions')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<any>(null)
  const [tarotCard, setTarotCard] = useState<any>(null);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [userMood, setUserMood] = useState<{ mood: string; intensity: number } | null>(null);
  const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const q = zodiacFilter ? `?zodiac=${encodeURIComponent(zodiacFilter)}` : ''
      const res = await api.get('/api/v1/matchmaking/suggestions' + q);
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      console.error('Failed to load suggestions', e);
    } finally {
      setLoading(false);
    }
  }, [zodiacFilter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSuggestions();
    fetchConnections();
    fetchUserMood();
  }, [fetchSuggestions]);

  async function fetchUserMood() {
    try {
      const res = await api.get('/api/v1/mood');
      setUserMood(res.data);
    } catch (e) {
      console.error('Failed to load user mood', e);
    }
  }

  async function fetchConnections() {
    try {
      const res = await api.get('/api/v1/matchmaking/connections');
      setConnections(res.data || { sent: [], received: [] });
    } catch (e) {
      console.error('Failed to load connections', e);
    }
  }

  async function respondToConnection(action: 'accept' | 'reject', connectionId: number) {
    try {
      await api.post('/api/v1/matchmaking/connection', { action, connection_id: connectionId });
      setModalOpen(false)
      setSelectedConnection(null)
      fetchConnections()
    } catch (e) {
      console.error('Failed to respond to connection', e);
      alert('Failed to respond to connection');
    }
  }

  async function sendRequest(targetId: number) {
    try {
      const res = await api.post('/api/v1/matchmaking/connection', { target_id: targetId });
      alert(res.data.message || 'Request sent');
      fetchConnections();
    } catch (e) {
      console.error('Failed to send request', e);
      alert('Failed to send request');
    }
  }

  async function rejectSuggestion(targetId: number) {
    try {
      // if there is an existing pending connection, reject it; otherwise create a rejected record
      await api.post('/api/v1/matchmaking/connection', { target_id: targetId, action: 'request' });
      // find connection and reject
      const conRes = await api.get('/api/v1/matchmaking/connections');
      const sent = conRes.data.sent || []
      const match = sent.find((s: any) => s.other_id === targetId)
      if (match) {
        await api.post('/api/v1/matchmaking/connection', { action: 'reject', connection_id: match.id })
      }
      fetchConnections();
    } catch (e) {
      console.error('Failed to reject suggestion', e);
    }
  }

  const handleTarotPull = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/v1/tarot/pull');
      if (response.data.success) {
        setTarotCard(response.data.card);
        setIsTarotModalOpen(true);
        fetchSuggestions(); // Refresh with tarot boost
      } else {
        alert(response.data.error || "Failed to draw a cosmic card");
      }
    } catch (error) {
      console.error("Unable to connect to the cosmos", error);
      alert("Unable to connect to the cosmos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Matchmaking</h1>
      {userMood && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold">Your Current Mood</h2>
          <p className="text-gray-300">Mood: {userMood.mood} (Intensity: {userMood.intensity.toFixed(2)})</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('suggestions')} className={`px-3 py-2 rounded ${tab === 'suggestions' ? 'bg-purple-600' : 'bg-gray-700'}`}>Suggestions</button>
        <button onClick={() => setTab('connections')} className={`px-3 py-2 rounded ${tab === 'connections' ? 'bg-purple-600' : 'bg-gray-700'}`}>Connections</button>
        <button onClick={() => setTab('horoscopes')} className={`px-3 py-2 rounded ${tab === 'horoscopes' ? 'bg-purple-600' : 'bg-gray-700'}`}>Horoscopes</button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'suggestions' && (
          <motion.div key="suggestions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <h2 className="text-xl font-semibold">Suggestions</h2>
            <div className="mt-2 flex items-center gap-3">
              <label htmlFor="zodiac-filter" className="text-sm">Filter by zodiac:</label>
              <select id="zodiac-filter" value={zodiacFilter} onChange={(e) => setZodiacFilter(e.target.value)} className="bg-gray-700 p-2 rounded text-sm">
                <option value="">All</option>
                {ZODIAC_SIGNS.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <button className="ml-2 px-3 py-1 bg-indigo-600 rounded" onClick={() => fetchSuggestions()}>Apply</button>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleTarotPull}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Drawing...' : 'Draw Your Cosmic Card'}
              </button>
            </div>
            {loading && <p>Loading...</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {suggestions.map((s) => (
                <motion.div layout key={s.id} className="p-4 rounded bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{s.username}</div>
                      <div className="text-gray-400 text-sm">{s.zodiac_sign}</div>
                    </div>
                    <div className="text-sm text-yellow-300">{s.compatibility_score ? `${s.compatibility_score}%` : '—'}</div>
                  </div>
                  {s.bio && <div className="text-gray-300 text-sm mt-2">{s.bio}</div>}
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded" onClick={() => sendRequest(s.id)} disabled={s.has_connection}>Connect</button>
                    <button className="px-3 py-1 bg-red-600 rounded" onClick={() => rejectSuggestion(s.id)}>Reject</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'connections' && (
          <motion.div key="connections" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <h2 className="text-xl font-semibold">Connections</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg">Sent</h3>
                <ul>
                  {connections.sent.map((c: any) => (
                    <li key={c.id} className="py-2 border-b border-gray-700">{c.other_username} — {c.status}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg">Received</h3>
                <ul>
                  {connections.received.map((c: any) => (
                    <li key={c.id} className="py-2 border-b border-gray-700 flex justify-between items-center">
                      <div>{c.other_username} — {c.status}</div>
                      {c.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedConnection(c); setModalOpen(true); }} className="px-3 py-1 bg-green-600 rounded">Respond</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'horoscopes' && (
          <motion.div key="horoscopes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <h2 className="text-xl font-semibold">Pair Horoscopes</h2>
            <div className="mt-4 text-gray-300">When two connections are accepted their pair horoscope appears here. (Coming soon)</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accept/Reject modal for incoming requests */}
      <AnimatePresence>
        {modalOpen && selectedConnection && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-navy-900 p-6 rounded-lg w-11/12 max-w-md" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h3 className="text-xl font-semibold mb-2">Connection Request</h3>
              <p className="text-gray-300 mb-4">{selectedConnection.other_username} has sent you a connection request.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { respondToConnection('reject', selectedConnection.id); }} className="px-3 py-2 bg-red-600 rounded">Reject</button>
                <button onClick={() => { respondToConnection('accept', selectedConnection.id); }} className="px-3 py-2 bg-green-600 rounded">Accept</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tarot Modal */}
      {isTarotModalOpen && tarotCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">Your Cosmic Guidance</h2>
            <div className="flex justify-center mb-4">
              <TarotCard3D cardName={tarotCard.card_name} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{tarotCard.card_name}</h3>
            <p className="text-gray-700 mb-4">{tarotCard.interpretation}</p>
            <div className="flex justify-between">
              <button
                onClick={() => setIsTarotModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: `My Cosmic Card: ${tarotCard.card_name}`,
                    text: tarotCard.interpretation,
                  });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Matchmaking(): any {
  return (
    <AuthGuard>
      <MatchmakingInner />
    </AuthGuard>
  );
}
