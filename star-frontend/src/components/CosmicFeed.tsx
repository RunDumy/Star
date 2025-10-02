'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { animated, useSpring } from '@react-spring/web';
import axios from 'axios';
import { Heart, MessageCircle, Share2, Bookmark, Star, Sparkles } from 'lucide-react';
import { FeedItem, FeedResponse, ZodiacActions } from '../types/feed';
import SigilGenerator from './SigilGenerator';
import ArchetypeJourney from './ArchetypeJourney';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CosmicFeedProps {
  userId: string;
  className?: string;
}

// Zodiac-specific action terminology and styling
const ZODIAC_ACTIONS: ZodiacActions = {
  'Aries': { comment: 'Blare', like: 'Ram', follow: 'Dash', share: 'Charge' },
  'Taurus': { comment: 'Moo', like: 'Stamp', follow: 'Bond', share: 'Ground' },
  'Gemini': { comment: 'Chirp', like: 'Clap', follow: 'Sync', share: 'Twin' },
  'Cancer': { comment: 'Whisper', like: 'Pinch', follow: 'Embrace', share: 'Shelter' },
  'Leo': { comment: 'Roar', like: 'Paw', follow: 'Stride', share: 'Radiate' },
  'Virgo': { comment: 'Hum', like: 'Point', follow: 'Guide', share: 'Organize' },
  'Libra': { comment: 'Chime', like: 'Sway', follow: 'Blend', share: 'Balance' },
  'Scorpio': { comment: 'Hiss', like: 'Flick', follow: 'Dive', share: 'Intensify' },
  'Sagittarius': { comment: 'Yelp', like: 'Kick', follow: 'Wander', share: 'Explore' },
  'Capricorn': { comment: 'Bleat', like: 'Nudge', follow: 'Climb', share: 'Build' },
  'Aquarius': { comment: 'Buzz', like: 'Tap', follow: 'Flow', share: 'Innovate' },
  'Pisces': { comment: 'Splash', like: 'Flutter', follow: 'Drift', share: 'Dream' }
};

// Element-based color schemes
const ELEMENT_COLORS = {
  Fire: 'from-red-500 to-orange-500',
  Earth: 'from-green-500 to-brown-500',
  Air: 'from-blue-400 to-cyan-400',
  Water: 'from-purple-500 to-indigo-500'
};

// Planetary hour color mappings
const PLANET_COLORS = {
  Sun: 'text-yellow-500',
  Moon: 'text-blue-300',
  Mercury: 'text-gray-400',
  Venus: 'text-pink-500',
  Mars: 'text-red-500',
  Jupiter: 'text-purple-600',
  Saturn: 'text-gray-600'
};

const CosmicFeed: React.FC<CosmicFeedProps> = ({ userId, className = '' }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planetaryContext, setPlanetaryContext] = useState<{
    current_hour: string;
    dominant_energy: string;
    favorable_actions: string[];
  } | null>(null);

  // Haptic feedback for engagement
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity === 'heavy' ? 100 : intensity === 'medium' ? 50 : 25);
    }
  };

  // Fetch feed items
  const fetchFeed = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<FeedResponse>(`${API_URL}/api/v1/feed`, {
        params: { page: pageNum, user_id: userId }
      });

      const { data } = response;

      if (reset) {
        setFeedItems(data.items);
      } else {
        setFeedItems(prev => [...prev, ...data.items]);
      }

      setHasMore(data.has_more);
      setPlanetaryContext(data.planetary_context);

    } catch (err: any) {
      console.error('Feed fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load cosmic feed');
    } finally {
      setLoading(false);
    }
  };

  // Handle engagement actions (like, comment, share, save)
  const handleEngagement = async (
    action: 'like' | 'comment' | 'share' | 'save',
    itemId: string,
    commentText?: string
  ) => {
    try {
      triggerHapticFeedback('light');

      if (action === 'like') {
        const response = await axios.post(`${API_URL}/api/v1/posts/${itemId}/like`, {
          user_id: userId
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
      } else if (action === 'comment' && commentText) {
        const response = await axios.post(`${API_URL}/api/v1/posts/${itemId}/comment`, {
          user_id: userId,
          comment: commentText
        });

        // Update comment count
        setFeedItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  engagement: {
                    ...item.engagement,
                    comments: item.engagement.comments + 1
                  }
                }
              : item
          )
        );
      }

    } catch (err: any) {
      console.error(`${action} error:`, err);
      setError(`Failed to ${action} post`);
    }
  };

  // Render different content types
  const renderFeedItem = (item: FeedItem) => {
    const actions = ZODIAC_ACTIONS[item.metadata.zodiac_sign] || ZODIAC_ACTIONS.Aries;
    const planetColor = PLANET_COLORS[item.metadata.planetary_hour as keyof typeof PLANET_COLORS] || 'text-gray-500';

    return (
      <div
        key={item.id}
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out opacity-0 animate-fadeInUp"
      >
        {/* Header with author and context */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {item.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-white font-medium">{item.author}</span>
              <span className={`ml-2 text-xs ${planetColor}`}>
                {item.metadata.zodiac_sign} • {item.metadata.planetary_hour}
              </span>
            </div>
          </div>
          {item.metadata.is_featured && (
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          )}
        </div>

        {/* Content rendering based on type */}
        <div className="mb-4">
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
              userId={parseInt(item.user_id)}
              zodiacSign={item.metadata.zodiac_sign}
              tarotCard={typeof item.content === 'object' && item.content && 'tarot' in item.content ? String(item.content.tarot) : undefined}
              planetaryHour={item.metadata.planetary_hour}
            />
          )}
        </div>

        {/* Planetary context hint */}
        {planetaryContext && (
          <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-800/50 rounded">
            🌌 {planetaryContext.dominant_energy} • {planetaryContext.current_hour}
          </div>
        )}

        {/* Engagement buttons */}
        <div className="flex items-center justify-between">
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
              <span className="text-xs">{actions.like}</span>
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
              <span className="text-xs">{actions.comment}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleEngagement('share', item.id)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-400 hover:text-green-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs">{actions.share}</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={() => handleEngagement('save', item.id)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Comments Section (hidden by default, toggled above) */}
        <div id={`comments-${item.id}`} className="hidden mt-3 pt-3 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Comments feature coming soon to this planetary hour 🌟
          </div>
        </div>
      </div>
    );
  };

  // Initialize feed
  useEffect(() => {
    fetchFeed(1, true);
  }, [userId]);

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
        <ErrorMessage message={error} onRetry={() => fetchFeed(1, true)} />
      </div>
    );
  }

  return (
    <div className={`cosmic-feed ${className}`}>
      {/* Planetary Context Header */}
      {planetaryContext && (
        <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">Current Cosmic Influence</span>
          </div>
          <p className="text-gray-300 text-sm">{planetaryContext.dominant_energy}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-400">Favorable actions: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {planetaryContext.favorable_actions.slice(0, 3).map((action: string, idx: number) => (
                <span key={idx} className="text-xs bg-purple-700/40 text-purple-200 px-2 py-1 rounded">
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
          fetchFeed(nextPage);
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
            <p className="text-gray-400">You've reached the cosmic void 🌌</p>
            <p className="text-sm text-gray-500 mt-1">More content awaits in the next planetary hour</p>
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
            message="Failed to load more content"
            onRetry={() => fetchFeed(page, false)}
          />
        </div>
      )}
    </div>
  );
};

export default CosmicFeed;
