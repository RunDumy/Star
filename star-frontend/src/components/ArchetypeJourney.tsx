'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Eye, Star } from 'lucide-react';
import SigilGenerator from './SigilGenerator';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ArchetypeJourneyProps {
  userId: number;
  zodiacSign?: string;
  tarotCard?: string;
  planetaryHour?: string;
  className?: string;
}

interface Prompt {
  id: number;
  prompt: string;
  archetype: string;
  life_path: number;
  destiny: number;
  zodiac_sign?: string;
  tarot_card?: string;
  planetary_hour?: string;
  created_at?: string;
  response_count?: number;
}

const ArchetypeJourney: React.FC<ArchetypeJourneyProps> = ({
  userId,
  zodiacSign = 'Libra',
  tarotCard = 'The Lovers',
  planetaryHour = 'Venus',
  className = ''
}) => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isLimitedTime, setIsLimitedTime] = useState(false);
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  // Fetch prompt on component mount
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data } = await axios.post<{
          prompt: string;
          archetype: string;
          life_path: number;
          destiny: number;
        }>(
          `${API_URL}/api/v1/prompt/generate`,
          {
            user_id: userId,
            zodiac_sign: zodiacSign,
            tarot_card: tarotCard,
            planetary_data: { hour_planet: planetaryHour },
            birthdate: '1990-05-15', // Default for demo
            full_name: 'Jane Doe'    // Default for demo
          }
        );

        setPrompt({
          id: Date.now(),
          prompt: data.prompt,
          archetype: data.archetype,
          life_path: data.life_path,
          destiny: data.destiny,
          zodiac_sign: zodiacSign,
          tarot_card: tarotCard,
          planetary_hour: planetaryHour,
          created_at: new Date().toISOString(),
          response_count: 0
        });

        // Randomly make it a limited-time prompt (FOMO feature)
        setIsLimitedTime(Math.random() > 0.7);
      } catch (err: any) {
        console.error('Prompt fetch failed:', err);
        setError(err.response?.data?.error || 'Failed to load cosmic prompt');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [userId, zodiacSign, tarotCard, planetaryHour]);

  // Handle response submission
  const handleResponse = async () => {
    if (!response.trim() || !prompt) return;

    try {
      setIsLoading(true);
      setError(null);

      await axios.post(`${API_URL}/api/v1/prompt/respond`, {
        user_id: userId,
        prompt_id: prompt.id,
        response: response.trim()
      });

      setHasResponded(true);
      setResponse('');

      // Show success message (could be a toast notification)
      alert('Response shared to the cosmic community! 🌟');

    } catch (err: any) {
      console.error('Response submission failed:', err);
      setError(err.response?.data?.error || 'Failed to share response');
    } finally {
      setIsLoading(false);
    }
  };

  // Load responses for this prompt
  const loadResponses = async () => {
    if (!prompt) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/v1/prompt/${prompt.id}/responses`);
      setResponses(data.responses || []);
    } catch (err) {
      console.error('Failed to load responses:', err);
    }
  };

  // Handle key press for textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleResponse();
    }
  };

  if (isLoading && !prompt) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !prompt) {
    return (
      <div className={className}>
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className={`archetype-journey bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-6 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {prompt?.archetype || 'Mystic'} Archetype Journey
          </h3>
        </div>
        {prompt && (
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <span className="capitalize">{zodiacSign}</span>
            <span>•</span>
            <span>{planetaryHour} Hour</span>
          </div>
        )}
      </div>

      {/* Prompt Content */}
      {prompt ? (
        <div className="space-y-4">
          {/* The Prompt */}
          <div className="bg-gray-800/60 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-lg italic text-gray-200 leading-relaxed mb-2">
                  {isLimitedTime && (
                    <span className="text-pink-500 font-bold">[Venus Hour Challenge] </span>
                  )}
                  {prompt.prompt}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="capitalize bg-purple-700/40 px-2 py-1 rounded">
                    {prompt.archetype}
                  </span>
                  {prompt.response_count !== undefined && (
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{prompt.response_count} responses</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sigil Integration */}
          <div className="bg-gray-900/40 border border-indigo-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-300 mb-3">Your Cosmic Sigil</h4>
            <div className="flex justify-center">
              <SigilGenerator
                userId={userId}
                zodiacSign={zodiacSign}
                tarotCard={tarotCard}
              />
            </div>
          </div>

          {/* Response Section */}
          {!hasResponded ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-200">
                Share your cosmic wisdom:
              </label>
              <textarea
                className="w-full p-3 bg-gray-800/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What does this prompt reveal about your cosmic journey?..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {response.length}/500 characters
                </span>
                <button
                  onClick={handleResponse}
                  disabled={!response.trim() || isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Sharing...' : 'Share Response'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-300">
                <Star className="w-5 h-5" />
                <span className="font-medium">Response Shared!</span>
              </div>
              <p className="text-green-200 text-sm mt-1">
                Your wisdom has been sent to the cosmic community. 🌟
              </p>
            </div>
          )}

          {/* Community Responses */}
          {prompt.response_count && prompt.response_count > 0 && (
            <div className="border-t border-purple-500/30 pt-4">
              <button
                onClick={() => {
                  setShowAllResponses(!showAllResponses);
                  if (!showAllResponses && responses.length === 0) {
                    loadResponses();
                  }
                }}
                className="flex items-center space-x-2 text-purple-300 hover:text-purple-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>
                  {showAllResponses ? 'Hide' : 'View'} Community Wisdom
                  {prompt.response_count > 0 && ` (${prompt.response_count} responses)`}
                </span>
              </button>

              {showAllResponses && responses.length > 0 && (
                <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                  {responses.map((resp: any, index: number) => (
                    <div key={index} className="bg-gray-800/40 border border-gray-600/30 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-purple-300">{resp.author}</span>
                        <span className="text-sm text-gray-400 capitalize">{resp.zodiac_sign}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(resp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm italic">"{resp.response}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-3">
              <ErrorMessage message={error} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-400">Loading your cosmic prompt...</p>
        </div>
      )}

      {/* Planetary Context Footer */}
      <div className="border-t border-purple-500/30 mt-6 pt-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <span>Current Energy:</span>
          <span className="capitalize bg-indigo-700/40 px-2 py-1 rounded">
            {planetaryHour} Hour
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArchetypeJourney;
