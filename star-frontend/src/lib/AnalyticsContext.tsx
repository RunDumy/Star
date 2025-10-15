/**
 * STAR Platform Analytics Context
 * =============================
 * 
 * React context for managing analytics state and providing
 * analytics functionality throughout the application.
 */

import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Types
interface EngagementEvent {
    event_type: string;
    metadata?: Record<string, any>;
    session_id?: string;
    duration?: number;
    location?: {
        page: string;
        section?: string;
    };
}

interface AnalyticsContextType {
    // State
    isTrackingEnabled: boolean;
    sessionId: string;

    // Methods
    trackEvent: (event: EngagementEvent) => Promise<boolean>;
    trackBatch: (events: EngagementEvent[]) => Promise<boolean>;
    setTrackingEnabled: (enabled: boolean) => void;

    // Analytics data
    engagementScore: number;
    favoriteElements: string[];
    predictedInterests: string[];

    // Loading states
    loading: boolean;
    error: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within AnalyticsProvider');
    }
    return context;
};

interface AnalyticsProviderProps {
    children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
    // State
    const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const [engagementScore, setEngagementScore] = useState(50);
    const [favoriteElements, setFavoriteElements] = useState<string[]>([]);
    const [predictedInterests, setPredictedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Batch tracking queue
    const [eventQueue, setEventQueue] = useState<EngagementEvent[]>([]);

    // Get API headers
    const getHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // Track individual event
    const trackEvent = useCallback(async (event: EngagementEvent): Promise<boolean> => {
        if (!isTrackingEnabled) return false;

        try {
            const headers = getHeaders();
            if (!headers.Authorization) {
                console.warn('No authentication token available for analytics');
                return false;
            }

            const payload = {
                ...event,
                session_id: event.session_id || sessionId,
                timestamp: new Date().toISOString()
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/track`,
                payload,
                { headers }
            );

            return true;
        } catch (err: any) {
            console.error('Failed to track event:', err);

            // Add to queue for retry if it's a network issue
            if (err.code === 'NETWORK_ERROR' || err.response?.status >= 500) {
                setEventQueue(prev => [...prev, event]);
            }

            return false;
        }
    }, [isTrackingEnabled, sessionId, getHeaders]);

    // Track multiple events in batch
    const trackBatch = useCallback(async (events: EngagementEvent[]): Promise<boolean> => {
        if (!isTrackingEnabled || events.length === 0) return false;

        try {
            const headers = getHeaders();
            if (!headers.Authorization) {
                console.warn('No authentication token available for batch tracking');
                return false;
            }

            const payload = {
                events: events.map(event => ({
                    ...event,
                    session_id: event.session_id || sessionId,
                    timestamp: new Date().toISOString()
                }))
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/batch-track`,
                payload,
                { headers }
            );

            return true;
        } catch (err: any) {
            console.error('Failed to track batch events:', err);
            return false;
        }
    }, [isTrackingEnabled, sessionId, getHeaders]);

    // Load user insights
    const loadUserInsights = useCallback(async () => {
        try {
            setLoading(true);
            const headers = getHeaders();

            if (!headers.Authorization) {
                return;
            }

            const userId = localStorage.getItem('user_id');
            if (!userId) {
                return;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/insights/${userId}`,
                { headers }
            );

            const insights = response.data.insights;
            if (insights) {
                setEngagementScore(insights.engagement_score || 50);
                setFavoriteElements(insights.favorite_elements || []);
                setPredictedInterests(insights.predicted_interests || []);
            }

            setError(null);
        } catch (err: any) {
            console.error('Failed to load user insights:', err);
            setError(err.response?.data?.error || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    // Process queued events
    const processEventQueue = useCallback(async () => {
        if (eventQueue.length === 0) return;

        const success = await trackBatch(eventQueue);
        if (success) {
            setEventQueue([]);
        }
    }, [eventQueue, trackBatch]);

    // Auto-track page views
    useEffect(() => {
        const handleRouteChange = () => {
            trackEvent({
                event_type: 'page_view',
                metadata: {
                    path: window.location.pathname,
                    referrer: document.referrer
                },
                location: {
                    page: window.location.pathname
                }
            });
        };

        // Track initial page load
        handleRouteChange();

        // Listen for route changes
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, [trackEvent]);

    // Load insights on mount
    useEffect(() => {
        loadUserInsights();
    }, [loadUserInsights]);

    // Process queue periodically
    useEffect(() => {
        const interval = setInterval(processEventQueue, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [processEventQueue]);

    // Auto-track session start
    useEffect(() => {
        trackEvent({
            event_type: 'session_start',
            metadata: {
                session_id: sessionId,
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`
            }
        });

        // Track session end on unmount
        return () => {
            trackEvent({
                event_type: 'session_end',
                metadata: {
                    session_id: sessionId,
                    session_duration: Date.now() - parseInt(sessionId.split('_')[1])
                }
            });
        };
    }, [sessionId, trackEvent]);

    // Keyboard shortcut tracking
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                trackEvent({
                    event_type: 'keyboard_shortcut',
                    metadata: {
                        key: event.key,
                        modifier: event.ctrlKey ? 'ctrl' : 'cmd'
                    }
                });
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [trackEvent]);

    // Context value
    const contextValue: AnalyticsContextType = {
        // State
        isTrackingEnabled,
        sessionId,

        // Methods
        trackEvent,
        trackBatch,
        setTrackingEnabled: setIsTrackingEnabled,

        // Analytics data
        engagementScore,
        favoriteElements,
        predictedInterests,

        // Loading states
        loading,
        error
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    );
};

// High-level tracking hooks for common events
export const useEventTracking = () => {
    const { trackEvent } = useAnalytics();

    return {
        trackPostView: (postId: string, authorId: string) =>
            trackEvent({
                event_type: 'post_view',
                metadata: { post_id: postId, author_id: authorId },
                location: { page: 'feed' }
            }),

        trackPostLike: (postId: string, authorId: string) =>
            trackEvent({
                event_type: 'post_like',
                metadata: { post_id: postId, author_id: authorId },
                location: { page: 'feed' }
            }),

        trackPostComment: (postId: string, commentLength: number) =>
            trackEvent({
                event_type: 'post_comment',
                metadata: { post_id: postId, comment_length: commentLength },
                location: { page: 'feed' }
            }),

        trackTarotDraw: (spreadType: string, cardCount: number) =>
            trackEvent({
                event_type: 'tarot_draw',
                metadata: { spread_type: spreadType, card_count: cardCount },
                location: { page: 'tarot' }
            }),

        trackNumerologyCalc: (calculationType: string) =>
            trackEvent({
                event_type: 'numerology_calc',
                metadata: { calculation_type: calculationType },
                location: { page: 'numerology' }
            }),

        trackProfileView: (targetUserId: string) =>
            trackEvent({
                event_type: 'profile_view',
                metadata: { target_user_id: targetUserId },
                location: { page: 'profile' }
            }),

        trackCollaboration: (sessionType: string, participantCount: number) =>
            trackEvent({
                event_type: 'collaboration_join',
                metadata: { session_type: sessionType, participant_count: participantCount },
                location: { page: 'collaboration' }
            }),

        trackSpotifyPlay: (trackId: string, mood: string) =>
            trackEvent({
                event_type: 'spotify_play',
                metadata: { track_id: trackId, mood },
                location: { page: 'music' }
            }),

        trackCosmosNavigation: (destination: string, method: string) =>
            trackEvent({
                event_type: 'cosmos_navigation',
                metadata: { destination, navigation_method: method },
                location: { page: 'cosmos' }
            }),

        trackFeedScroll: (scrollDepth: number, timeSpent: number) =>
            trackEvent({
                event_type: 'feed_scroll',
                metadata: { scroll_depth: scrollDepth, time_spent: timeSpent },
                location: { page: 'feed' },
                duration: timeSpent
            }),

        trackSearch: (query: string, resultsCount: number) =>
            trackEvent({
                event_type: 'search_query',
                metadata: { query: query.length > 50 ? query.substring(0, 50) + '...' : query, results_count: resultsCount },
                location: { page: 'search' }
            })
    };
};

// Performance tracking hook
export const usePerformanceTracking = () => {
    const { trackEvent } = useAnalytics();

    const trackPageLoad = useCallback((pageName: string, loadTime: number) => {
        trackEvent({
            event_type: 'page_performance',
            metadata: {
                page_name: pageName,
                load_time: loadTime,
                performance_rating: loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'moderate' : 'slow'
            },
            duration: loadTime / 1000
        });
    }, [trackEvent]);

    const trackApiCall = useCallback((endpoint: string, responseTime: number, success: boolean) => {
        trackEvent({
            event_type: 'api_performance',
            metadata: {
                endpoint,
                response_time: responseTime,
                success,
                performance_rating: responseTime < 500 ? 'fast' : responseTime < 2000 ? 'moderate' : 'slow'
            },
            duration: responseTime / 1000
        });
    }, [trackEvent]);

    return { trackPageLoad, trackApiCall };
};

export default AnalyticsProvider;