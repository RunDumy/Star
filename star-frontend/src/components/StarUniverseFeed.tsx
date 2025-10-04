'use client';

import axios from 'axios';
import { Bookmark, Filter, Heart, MessageCircle, Share2, Sparkles, Star } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { fetchGlobalFeed as apiFetchGlobalFeed } from '../lib/api';
import { FeedItem } from '../types/feed';
import ArchetypeJourney from './ArchetypeJourney';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SigilGenerator from './SigilGenerator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Zodiac signs and their elements
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];

const ZODIAC_ELEMENTS: { [key: string]: string } = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

// Get element color classes
const getElementClasses = (element: string) => {
  switch (element) {
    case 'Fire': return 'bg-red-900/50 text-red-300';
    case 'Earth': return 'bg-green-900/50 text-green-300';
    case 'Air': return 'bg-blue-900/50 text-blue-300';
    case 'Water': return 'bg-cyan-900/50 text-cyan-300';
    default: return 'bg-gray-900/50 text-gray-300';
  }
};

interface StarUniverseFeedProps {
  className?: string;
  currentUserId?: string | number;
}

interface FilterState {
  zodiacSigns: string[];
  elements: string[];
  contentTypes: string[];
}

const StarUniverseFeed: React.FC<StarUniverseFeedProps> = ({
  className = '',
  currentUserId
}) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    zodiacSigns: [],
    elements: [],
    contentTypes: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [planetaryContext, setPlanetaryContext] = useState<{
    current_hour: string;
    dominant_energy: string;
    favorable_actions: string[];
  } | null>(null);

  // Haptic feedback for engagement
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      let duration: number;
      if (intensity === 'heavy') {
        duration = 100;
      } else if (intensity === 'medium') {
        duration = 50;
      } else {
        duration = 25;
      }
      navigator.vibrate(duration);
    }
  };

  // Fetch global feed items with filters
  const fetchGlobalFeed = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetchGlobalFeed(pageNum, filters, currentUserId);

      if (reset) {
        setFeedItems(data.items);
      } else {
        setFeedItems(prev => [...prev, ...data.items]);
      }

      setHasMore(data.has_more);
      setPlanetaryContext(data.planetary_context);

    } catch (err: unknown) {
      console.error('Global feed fetch error:', err);
      const message = axios.isAxiosError(err) ? err.response?.data?.error : String(err);
      setError(message || 'Failed to load cosmic universe feed');
    } finally {
      setLoading(false);
    }
  }, [filters, currentUserId]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
    setPage(1);
    // Refetch with new filters
    setTimeout(() => fetchGlobalFeed(1, true), 100);
  };

  // Handle engagement actions
  const handleEngagement = async (
    action: 'like' | 'comment' | 'share' | 'save',
    itemId: string
  ) => {
    try {
      triggerHapticFeedback('light');

      if (action === 'like') {
        const response = await axios.post(`${API_URL}/api/v1/posts/${itemId}/like`, {
          user_id: currentUserId
        });

        // Update local state optimistically
        setFeedItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  engagement: {
                    ...item.engagement,
                    likes: response.data.message === 'Post liked successfully'
                      ? item.engagement.likes + 1
                      : Math.max(0, item.engagement.likes - 1)
                  }
                }
              : item
          )
        );
      }

    } catch (err: unknown) {
      console.error(`${action} error:`, err);
      const message = axios.isAxiosError(err) ? err.response?.data?.error : String(err);
      setError(message || `Failed to ${action} post`);
    }
  };

  // Render filter panel
  const renderFilters = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Cosmic Filters
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          {/* Zodiac Signs Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Zodiac Signs</h4>
            <div className="grid grid-cols-3 gap-2">
              {ZODIAC_SIGNS.map(sign => (
                <label key={sign} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.zodiacSigns.includes(sign)}
                    onChange={(e) => handleFilterChange('zodiacSigns', sign, e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">{sign}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Elements Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Elements</h4>
            <div className="flex space-x-4">
              {ELEMENTS.map(element => (
                <label key={element} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.elements.includes(element)}
                    onChange={(e) => handleFilterChange('elements', element, e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">{element}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Content Types Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Content Types</h4>
            <div className="flex flex-wrap gap-2">
              {['user_post', 'sigil', 'tarot', 'zodiac', 'video', 'prompt'].map(type => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.contentTypes.includes(type)}
                    onChange={(e) => handleFilterChange('contentTypes', type, e.target.checked)}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render different content types
  const renderFeedItem = (item: FeedItem) => {
    const element = ZODIAC_ELEMENTS[item.metadata.zodiac_sign] || 'Fire';
    const planetColor = 'text-yellow-500'; // Default for now

    return (
      <div
        key={item.id}
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out opacity-0 animate-fadeInUp relative overflow-hidden"
      >
        {/* Constellation overlay placeholder */}
        {/* <ConstellationOverlay
          zodiacSign={item.metadata.zodiac_sign}
          element={element}
          className="absolute inset-0 pointer-events-none opacity-20"
        /> */}

        {/* Header with author and context */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {item.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-white font-medium">{item.author}</span>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{item.metadata.zodiac_sign}</span>
                <span className="text-gray-500">•</span>
                <span className={`px-2 py-1 rounded text-xs ${getElementClasses(element)}`}>
                  {element}
                </span>
                <span className="text-gray-500">•</span>
                <span className={planetColor}>{item.metadata.planetary_hour}</span>
              </div>
            </div>
          </div>
          {item.metadata.is_featured && (
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          )}
        </div>

        {/* Content rendering based on type */}
        <div className="mb-4 relative z-10">
          {item.type === 'user_post' && (
            <p className="text-gray-300 whitespace-pre-wrap">
              {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
            </p>
          )}

          {item.type === 'sigil' && (
            <div className="bg-gray-800 rounded-lg p-4">
              <SigilGenerator
                userId={item.user_id}
                zodiacSign={item.metadata.zodiac_sign}
                tarotCard={typeof item.content === 'object' && item.content && 'tarot' in item.content ? item.content.tarot as string : undefined}
              />
            </div>
          )}

          {item.type === 'tarot' && (
            <div className="text-center">
              <div className="text-6xl mb-2">🃏</div>
              <p className="text-white font-medium">
                {typeof item.content === 'object' && item.content && 'tarot_card' in item.content ? String(item.content.tarot_card) : 'Mystic Card'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {typeof item.content === 'object' && item.content && 'description' in item.content ? String(item.content.description) : 'A cosmic revelation awaits...'}
              </p>
            </div>
          )}

          {item.type === 'video' && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <video
                src={typeof item.content === 'object' && item.content && 'url' in item.content ? String(item.content.url) : ''}
                className="w-full h-48 object-cover"
                controls
                muted
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {item.type === 'prompt' && (
            <ArchetypeJourney
              userId={item.user_id}
              zodiacSign={item.metadata.zodiac_sign}
              tarotCard={typeof item.content === 'object' && item.content && 'tarot' in item.content ? String(item.content.tarot) : undefined}
              planetaryHour={item.metadata.planetary_hour}
            />
          )}
        </div>

        {/* Planetary context hint */}
        {planetaryContext && (
          <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-800/50 rounded relative z-10">
            🌌 {planetaryContext.dominant_energy} • {planetaryContext.current_hour}
          </div>
        )}

        {/* Engagement buttons */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={() => handleEngagement('like', item.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                item.engagement.likes > 0
                  ? 'text-red-400 bg-red-900/20'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${item.engagement.likes > 0 ? 'fill-current' : ''}`}
              />
              <span className="text-sm">{item.engagement.likes}</span>
            </button>

            {/* Comment Button */}
            <button
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
              onClick={() => {
                // Toggle comments (simplified - in real app you'd show/hide comment thread)
                const commentsVisible = document.getElementById(`comments-${item.id}`)?.classList.contains('hidden');
                document.getElementById(`comments-${item.id}`)?.classList.toggle('hidden', !commentsVisible);
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{item.engagement.comments}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleEngagement('share', item.id)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-400 hover:text-green-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{item.engagement.shares}</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={() => handleEngagement('save', item.id)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            aria-label="Save post"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Comments Section */}
        <div id={`comments-${item.id}`} className="hidden mt-3 pt-3 border-t border-gray-700 relative z-10">
          <div className="text-sm text-gray-400">
            Comments feature coming soon to this planetary hour 🌟
          </div>
        </div>
      </div>
    );
  };

  // Initialize feed
  useEffect(() => {
    fetchGlobalFeed(1, true);
  }, [fetchGlobalFeed]);

  // Loading state
  if (loading && feedItems.length === 0) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error && feedItems.length === 0) {
    return (
      <div className={className}>
        <ErrorMessage message={error} onRetry={() => fetchGlobalFeed(1, true)} />
      </div>
    );
  }

  return (
    <div className={`star-universe-feed ${className}`}>
      {/* Filters */}
      {renderFilters()}

      {/* Planetary Context Header */}
      {planetaryContext && (
        <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">Universal Cosmic Influence</span>
          </div>
          <p className="text-gray-300 text-sm">{planetaryContext.dominant_energy}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-400">Favorable actions: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {planetaryContext.favorable_actions.slice(0, 3).map((action: string) => (
                <span key={action} className="text-xs bg-purple-700/40 text-purple-200 px-2 py-1 rounded">
                  {action}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed Items */}
      <InfiniteScroll
        dataLength={feedItems.length}
        next={() => {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchGlobalFeed(nextPage);
        }}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        }
        endMessage={
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400">You&apos;ve reached the edge of the universe 🌌</p>
            <p className="text-sm text-gray-500 mt-1">More cosmic content awaits in the next planetary hour</p>
          </div>
        }
        className="space-y-4"
      >
        {feedItems.map(item => renderFeedItem(item))}
      </InfiniteScroll>

      {/* Error state for additional loads */}
      {error && feedItems.length > 0 && (
        <div className="mt-4">
          <ErrorMessage
            message="Failed to load more universal content"
            onRetry={() => fetchGlobalFeed(page, false)}
          />
        </div>
      )}
    </div>
  );
};

export default StarUniverseFeed;