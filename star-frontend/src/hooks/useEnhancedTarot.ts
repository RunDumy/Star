// Enhanced Tarot React Hook
// Provides easy access to enhanced tarot functionality in React components

import { useCallback, useEffect, useState } from 'react';
import { CosmicInfluences, enhancedTarotService, TarotReading, TarotSpread } from '../lib/services/EnhancedTarotService';

interface UseEnhancedTarotReturn {
    // State
    availableSpreads: Record<string, TarotSpread>;
    cosmicInfluences: CosmicInfluences | null;
    currentReading: TarotReading | null;
    readingHistory: TarotReading[];
    dailyGuidance: any;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadSpreads: () => Promise<void>;
    loadCosmicInfluences: () => Promise<void>;
    performReading: (spreadType: string, question: string) => Promise<TarotReading>;
    loadReadingHistory: () => Promise<void>;
    getDailyGuidance: () => Promise<void>;
    shareReading: (readingId: string, shareType: 'feed' | 'profile', message?: string) => Promise<void>;
    addReflection: (readingId: string, reflection: string, tags?: string[]) => Promise<void>;
    getCardMeanings: (cardName: string) => Promise<any>;
    clearError: () => void;
}

export const useEnhancedTarot = (userZodiac?: string, numerologyData?: any): UseEnhancedTarotReturn => {
    // State
    const [availableSpreads, setAvailableSpreads] = useState<Record<string, TarotSpread>>({});
    const [cosmicInfluences, setCosmicInfluences] = useState<CosmicInfluences | null>(null);
    const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
    const [readingHistory, setReadingHistory] = useState<TarotReading[]>([]);
    const [dailyGuidance, setDailyGuidance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Error handler
    const handleError = useCallback((error: any) => {
        const errorMessage = error?.message || 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Enhanced Tarot Hook Error:', error);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load available spreads
    const loadSpreads = useCallback(async () => {
        try {
            setIsLoading(true);
            clearError();

            const response = await enhancedTarotService.getAvailableSpreads();
            setAvailableSpreads(response.spreads);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [clearError, handleError]);

    // Load cosmic influences
    const loadCosmicInfluences = useCallback(async () => {
        try {
            clearError();

            const influences = await enhancedTarotService.getCosmicInfluences();
            setCosmicInfluences(influences);
        } catch (error) {
            handleError(error);
        }
    }, [clearError, handleError]);

    // Perform tarot reading
    const performReading = useCallback(async (spreadType: string, question: string): Promise<TarotReading> => {
        try {
            setIsLoading(true);
            clearError();

            const reading = await enhancedTarotService.performTarotReading({
                spread_type: spreadType,
                question: question.trim(),
                zodiac_context: {
                    user_zodiac: userZodiac,
                    numerology_data: numerologyData
                }
            });

            setCurrentReading(reading);

            // Add to history
            setReadingHistory(prev => [reading, ...prev.slice(0, 9)]);

            return reading;
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [userZodiac, numerologyData, clearError, handleError]);

    // Load reading history
    const loadReadingHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            clearError();

            const response = await enhancedTarotService.getTarotReadings(10, 0);
            setReadingHistory(response.readings);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [clearError, handleError]);

    // Get daily guidance
    const getDailyGuidance = useCallback(async () => {
        try {
            clearError();

            const response = await enhancedTarotService.getDailyGuidance();
            setDailyGuidance(response.daily_guidance);
        } catch (error) {
            handleError(error);
        }
    }, [clearError, handleError]);

    // Share reading
    const shareReading = useCallback(async (readingId: string, shareType: 'feed' | 'profile', message?: string) => {
        try {
            setIsLoading(true);
            clearError();

            await enhancedTarotService.shareReading({
                reading_id: readingId,
                share_type: shareType,
                message
            });
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [clearError, handleError]);

    // Add reflection
    const addReflection = useCallback(async (readingId: string, reflection: string, tags?: string[]) => {
        try {
            setIsLoading(true);
            clearError();

            await enhancedTarotService.addReflection({
                reading_id: readingId,
                reflection: reflection.trim(),
                tags
            });

            // Update current reading if it matches
            if (currentReading?.reading_id === readingId) {
                // Could fetch updated reading here if needed
            }
        } catch (error) {
            handleError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentReading, clearError, handleError]);

    // Get card meanings
    const getCardMeanings = useCallback(async (cardName: string) => {
        try {
            clearError();

            return await enhancedTarotService.getCardMeanings(cardName);
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, [clearError, handleError]);

    // Load initial data on mount
    useEffect(() => {
        const initializeData = async () => {
            await Promise.all([
                loadSpreads(),
                loadCosmicInfluences(),
                loadReadingHistory(),
                getDailyGuidance()
            ]);
        };

        initializeData();
    }, [loadSpreads, loadCosmicInfluences, loadReadingHistory, getDailyGuidance]);

    return {
        // State
        availableSpreads,
        cosmicInfluences,
        currentReading,
        readingHistory,
        dailyGuidance,
        isLoading,
        error,

        // Actions
        loadSpreads,
        loadCosmicInfluences,
        performReading,
        loadReadingHistory,
        getDailyGuidance,
        shareReading,
        addReflection,
        getCardMeanings,
        clearError
    };
};

// Simplified hook for just daily guidance
export const useDailyTarotGuidance = () => {
    const [guidance, setGuidance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGuidance = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await enhancedTarotService.getDailyGuidance();
                setGuidance(response.daily_guidance);
            } catch (error: any) {
                setError(error.message || 'Failed to load daily guidance');
            } finally {
                setIsLoading(false);
            }
        };

        loadGuidance();
    }, []);

    return { guidance, isLoading, error };
};

// Hook for cosmic influences only
export const useCosmicInfluences = () => {
    const [influences, setInfluences] = useState<CosmicInfluences | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshInfluences = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const newInfluences = await enhancedTarotService.getCosmicInfluences();
            setInfluences(newInfluences);
        } catch (error: any) {
            setError(error.message || 'Failed to load cosmic influences');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshInfluences();
    }, [refreshInfluences]);

    return {
        influences,
        isLoading,
        error,
        refresh: refreshInfluences
    };
};

// Hook for reading history only
export const useTarotHistory = (limit = 10) => {
    const [history, setHistory] = useState<TarotReading[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const loadHistory = useCallback(async (offset = 0) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await enhancedTarotService.getTarotReadings(limit, offset);

            if (offset === 0) {
                setHistory(response.readings);
            } else {
                setHistory(prev => [...prev, ...response.readings]);
            }

            setHasMore(response.has_more);
        } catch (error: any) {
            setError(error.message || 'Failed to load reading history');
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        loadHistory(0);
    }, [loadHistory]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            loadHistory(history.length);
        }
    }, [isLoading, hasMore, history.length, loadHistory]);

    return {
        history,
        isLoading,
        error,
        hasMore,
        loadMore,
        refresh: () => loadHistory(0)
    };
};

export default useEnhancedTarot;