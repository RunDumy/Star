/**
 * Enhanced Spotify Hook for STAR Platform
 * Cosmic music curation and playlist management
 */

import { useCallback, useEffect, useState } from 'react';
import spotifyService, {
    CosmicMood,
    CosmicPlaylist,
    DailySoundtrack,
    TarotPlaylistRequest,
} from '../lib/services/EnhancedSpotifyService';

interface UseEnhancedSpotifyReturn {
    // State
    isLoading: boolean;
    error: string | null;
    isSpotifyConnected: boolean;
    currentPlaylist: CosmicPlaylist | null;
    dailySoundtrack: DailySoundtrack | null;
    userPlaylists: CosmicPlaylist[];
    cosmicMoods: CosmicMood[];
    elementalGenres: Record<string, string[]>;

    // Actions
    connectSpotify: () => Promise<void>;
    handleSpotifyCallback: (code: string) => Promise<boolean>;
    createCosmicPlaylist: (intention?: string, userProfile?: any) => Promise<CosmicPlaylist | null>;
    getDailyCosmicSoundtrack: (zodiacSign?: string, lifePathNumber?: number, personalYearNumber?: number) => Promise<DailySoundtrack | null>;
    createTarotPlaylist: (tarotData: TarotPlaylistRequest) => Promise<CosmicPlaylist | null>;
    loadUserPlaylists: () => Promise<void>;
    loadCosmicMoods: () => Promise<void>;
    loadElementalGenres: () => Promise<void>;
    clearError: () => void;
    openTrack: (externalUrl: string) => void;
}

export const useEnhancedSpotify = (): UseEnhancedSpotifyReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState<CosmicPlaylist | null>(null);
    const [dailySoundtrack, setDailySoundtrack] = useState<DailySoundtrack | null>(null);
    const [userPlaylists, setUserPlaylists] = useState<CosmicPlaylist[]>([]);
    const [cosmicMoods, setCosmicMoods] = useState<CosmicMood[]>([]);
    const [elementalGenres, setElementalGenres] = useState<Record<string, string[]>>({});

    // Check Spotify connection status on mount
    useEffect(() => {
        const checkSpotifyConnection = () => {
            // Check if user has Spotify token stored
            const spotifyToken = localStorage.getItem('spotify_access_token');
            setIsSpotifyConnected(!!spotifyToken);
        };

        checkSpotifyConnection();
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleError = useCallback((err: any) => {
        const errorMessage = err?.response?.data?.error || err?.message || 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Spotify operation error:', err);
    }, []);

    const connectSpotify = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { auth_url } = await spotifyService.getAuthUrl();

            // Redirect to Spotify authorization
            window.location.href = auth_url;

        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const handleSpotifyCallback = useCallback(async (code: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const { success } = await spotifyService.handleCallback(code);

            if (success) {
                setIsSpotifyConnected(true);
                // Store connection status
                localStorage.setItem('spotify_connected', 'true');
                return true;
            }

            return false;

        } catch (err) {
            handleError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const createCosmicPlaylist = useCallback(async (
        intention: string = 'daily_harmony',
        userProfile?: any
    ): Promise<CosmicPlaylist | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { playlist } = await spotifyService.createCosmicPlaylist(intention, userProfile);

            setCurrentPlaylist(playlist);

            // Add to user playlists if saved
            if (playlist.saved) {
                setUserPlaylists(prev => [playlist, ...prev]);
            }

            return playlist;

        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const getDailyCosmicSoundtrack = useCallback(async (
        zodiacSign?: string,
        lifePathNumber?: number,
        personalYearNumber?: number
    ): Promise<DailySoundtrack | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { daily_soundtrack } = await spotifyService.getDailyCosmicSoundtrack(
                zodiacSign,
                lifePathNumber,
                personalYearNumber
            );

            setDailySoundtrack(daily_soundtrack);
            return daily_soundtrack;

        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const createTarotPlaylist = useCallback(async (
        tarotData: TarotPlaylistRequest
    ): Promise<CosmicPlaylist | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { tarot_playlist } = await spotifyService.createTarotPlaylist(tarotData);

            setCurrentPlaylist(tarot_playlist);
            return tarot_playlist;

        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const loadUserPlaylists = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { playlists } = await spotifyService.getUserPlaylists();
            setUserPlaylists(playlists);

        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const loadCosmicMoods = useCallback(async () => {
        try {
            setError(null);

            const { cosmic_moods } = await spotifyService.getCosmicMoods();
            setCosmicMoods(cosmic_moods);

        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const loadElementalGenres = useCallback(async () => {
        try {
            setError(null);

            const { elemental_genres } = await spotifyService.getElementalGenres();
            setElementalGenres(elemental_genres);

        } catch (err) {
            handleError(err);
        }
    }, [handleError]);

    const openTrack = useCallback((externalUrl: string) => {
        spotifyService.openTrack(externalUrl);
    }, []);

    // Load initial data
    useEffect(() => {
        if (isSpotifyConnected) {
            loadUserPlaylists();
        }
        loadCosmicMoods();
        loadElementalGenres();
    }, [isSpotifyConnected, loadUserPlaylists, loadCosmicMoods, loadElementalGenres]);

    return {
        // State
        isLoading,
        error,
        isSpotifyConnected,
        currentPlaylist,
        dailySoundtrack,
        userPlaylists,
        cosmicMoods,
        elementalGenres,

        // Actions
        connectSpotify,
        handleSpotifyCallback,
        createCosmicPlaylist,
        getDailyCosmicSoundtrack,
        createTarotPlaylist,
        loadUserPlaylists,
        loadCosmicMoods,
        loadElementalGenres,
        clearError,
        openTrack,
    };
};

export default useEnhancedSpotify;