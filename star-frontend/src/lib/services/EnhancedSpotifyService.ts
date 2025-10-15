/**
 * Enhanced Spotify Service for STAR Platform
 * Cosmic music curation and playlist management
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface CosmicTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration_ms: number;
    energy_level: number;
    cosmic_mood: string;
    elemental_energy: string;
    preview_url?: string;
    external_url?: string;
}

export interface CosmicPlaylist {
    id: string;
    name: string;
    description: string;
    cosmic_theme: string;
    duration_minutes: number;
    track_count: number;
    elemental_balance: Record<string, number>;
    energy_flow: number[];
    tracks: CosmicTrack[];
    saved?: boolean;
}

export interface CosmicMood {
    id: string;
    name: string;
    description: string;
    element: string;
    energy_level: number;
}

export interface TarotPlaylistRequest {
    tarot_cards: Array<{
        card: {
            name: string;
            suit: string;
            is_reversed: boolean;
        };
    }>;
    user_profile?: {
        zodiac_sign?: string;
        life_path_number?: number;
        personal_year_number?: number;
    };
}

export interface DailySoundtrack {
    id: string;
    name: string;
    description: string;
    cosmic_theme: string;
    duration_minutes: number;
    track_count: number;
    elemental_balance: Record<string, number>;
    daily_energy_guidance: {
        dominant_element: string;
        energy_level: string;
        cosmic_advice: string;
    };
    tracks: CosmicTrack[];
}

class EnhancedSpotifyService {
    private api = axios.create({
        baseURL: `${API_BASE_URL}/api/v1/spotify`,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        // Add auth interceptor
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('star_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('Spotify API error:', error.response?.data || error.message);
                throw error;
            }
        );
    }

    /**
     * Get Spotify authorization URL for user authentication
     */
    async getAuthUrl(): Promise<{ auth_url: string; message: string }> {
        try {
            const response = await this.api.get('/auth-url');
            return response.data;
        } catch (error) {
            throw new Error('Failed to get Spotify authorization URL');
        }
    }

    /**
     * Handle Spotify authorization callback
     */
    async handleCallback(code: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.api.post('/callback', { code });
            return response.data;
        } catch (error) {
            throw new Error('Failed to complete Spotify authorization');
        }
    }

    /**
     * Create a personalized cosmic playlist
     */
    async createCosmicPlaylist(
        cosmicIntention: string = 'daily_harmony',
        userProfile?: {
            zodiac_sign?: string;
            life_path_number?: number;
            personal_year_number?: number;
        }
    ): Promise<{ success: boolean; playlist: CosmicPlaylist; message: string }> {
        try {
            const response = await this.api.post('/cosmic-playlist', {
                cosmic_intention: cosmicIntention,
                user_profile: userProfile,
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to create cosmic playlist');
        }
    }

    /**
     * Get personalized daily cosmic soundtrack
     */
    async getDailyCosmicSoundtrack(
        zodiacSign?: string,
        lifePathNumber?: number,
        personalYearNumber?: number
    ): Promise<{
        success: boolean;
        daily_soundtrack: DailySoundtrack;
        cosmic_timing_advice: {
            current_phase: string;
            optimal_listening: string;
            cosmic_message: string;
        };
        message: string;
    }> {
        try {
            const params = new URLSearchParams();
            if (zodiacSign) params.append('zodiac_sign', zodiacSign);
            if (lifePathNumber) params.append('life_path_number', lifePathNumber.toString());
            if (personalYearNumber) params.append('personal_year_number', personalYearNumber.toString());

            const response = await this.api.get(`/daily-soundtrack?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get daily cosmic soundtrack');
        }
    }

    /**
     * Create playlist based on tarot reading energy
     */
    async createTarotPlaylist(
        tarotData: TarotPlaylistRequest
    ): Promise<{
        success: boolean;
        tarot_playlist: CosmicPlaylist & {
            tarot_inspiration: {
                dominant_suit: string;
                energy_level: number;
                reversed_percentage: number;
                musical_theme: string;
                recommended_mood: string;
            };
        };
        message: string;
    }> {
        try {
            const response = await this.api.post('/tarot-playlist', tarotData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create tarot-inspired playlist');
        }
    }

    /**
     * Get user's saved cosmic playlists
     */
    async getUserPlaylists(): Promise<{
        success: boolean;
        playlists: CosmicPlaylist[];
        count: number;
    }> {
        try {
            const response = await this.api.get('/playlists');
            return response.data;
        } catch (error) {
            throw new Error('Failed to get user playlists');
        }
    }

    /**
     * Get available cosmic moods for playlist creation
     */
    async getCosmicMoods(): Promise<{
        success: boolean;
        cosmic_moods: CosmicMood[];
        message: string;
    }> {
        try {
            const response = await this.api.get('/cosmic-moods');
            return response.data;
        } catch (error) {
            throw new Error('Failed to get cosmic moods');
        }
    }

    /**
     * Get music genres associated with each element
     */
    async getElementalGenres(): Promise<{
        success: boolean;
        elemental_genres: Record<string, string[]>;
        message: string;
    }> {
        try {
            const response = await this.api.get('/elemental-genres');
            return response.data;
        } catch (error) {
            throw new Error('Failed to get elemental genres');
        }
    }

    /**
     * Open Spotify track in external app or web player
     */
    openTrack(externalUrl: string): void {
        if (externalUrl) {
            window.open(externalUrl, '_blank');
        }
    }

    /**
     * Format duration from milliseconds to MM:SS
     */
    formatDuration(durationMs: number): string {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get energy level description
     */
    getEnergyDescription(energyLevel: number): string {
        if (energyLevel >= 0.8) return 'Very High Energy';
        if (energyLevel >= 0.6) return 'High Energy';
        if (energyLevel >= 0.4) return 'Medium Energy';
        if (energyLevel >= 0.2) return 'Low Energy';
        return 'Very Calm';
    }

    /**
     * Get element color for UI
     */
    getElementColor(element: string): string {
        const colors: Record<string, string> = {
            fire: '#FF6B35',
            water: '#4ECDC4',
            air: '#FFD93D',
            earth: '#6BCF7F',
            spirit: '#9B59B6',
        };
        return colors[element] || '#95A5A6';
    }

    /**
     * Calculate dominant element from elemental balance
     */
    getDominantElement(elementalBalance: Record<string, number>): string {
        return Object.entries(elementalBalance).reduce((a, b) =>
            elementalBalance[a[0]] > elementalBalance[b[0]] ? a : b
        )[0];
    }

    /**
     * Generate playlist summary for sharing
     */
    generatePlaylistSummary(playlist: CosmicPlaylist): string {
        const dominantElement = this.getDominantElement(playlist.elemental_balance);
        const avgEnergy = playlist.energy_flow.reduce((a, b) => a + b, 0) / playlist.energy_flow.length;

        return `🎵 ${playlist.name} - A ${dominantElement} energy playlist with ${playlist.track_count} cosmic tracks (${playlist.duration_minutes} min). ${this.getEnergyDescription(avgEnergy)} vibes for ${playlist.cosmic_theme}.`;
    }
}

// Create and export singleton instance
export const spotifyService = new EnhancedSpotifyService();
export default spotifyService;