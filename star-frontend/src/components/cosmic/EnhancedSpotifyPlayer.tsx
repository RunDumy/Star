/**
 * Enhanced Spotify Player Component for STAR Platform
 * Cosmic music curation and playlist management interface
 */

import React, { useEffect, useState } from 'react';
import { useEnhancedSpotify } from '../../hooks/useEnhancedSpotify';
import { useAuth } from '../../lib/AuthContext';
import { CosmicTrack } from '../../lib/services/EnhancedSpotifyService';

interface EnhancedSpotifyPlayerProps {
    className?: string;
    tarotCards?: Array<{
        card: {
            name: string;
            suit: string;
            is_reversed: boolean;
        };
    }>;
}

const EnhancedSpotifyPlayer: React.FC<EnhancedSpotifyPlayerProps> = ({
    className = '',
    tarotCards,
}) => {
    const { user } = useAuth();
    const {
        isLoading,
        error,
        isSpotifyConnected,
        currentPlaylist,
        dailySoundtrack,
        userPlaylists,
        cosmicMoods,
        connectSpotify,
        createCosmicPlaylist,
        getDailyCosmicSoundtrack,
        createTarotPlaylist,
        loadUserPlaylists,
        clearError,
        openTrack,
    } = useEnhancedSpotify();

    const [activeTab, setActiveTab] = useState<'daily' | 'create' | 'library' | 'tarot'>('daily');
    const [selectedMood, setSelectedMood] = useState<string>('daily_harmony');
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);

    // Load daily soundtrack on component mount
    useEffect(() => {
        if (isSpotifyConnected && user?.profile) {
            getDailyCosmicSoundtrack(
                user.profile.zodiac_sign,
                user.profile.life_path_number,
                user.profile.personal_year_number
            );
        }
    }, [isSpotifyConnected, user, getDailyCosmicSoundtrack]);

    const handleConnectSpotify = async () => {
        await connectSpotify();
    };

    const handleCreatePlaylist = async () => {
        const userProfile = {
            zodiac_sign: user?.profile?.zodiac_sign || 'scorpio',
            life_path_number: user?.profile?.life_path_number || 8,
            personal_year_number: user?.profile?.personal_year_number || 1,
        };

        await createCosmicPlaylist(selectedMood, userProfile);
    };

    const handleCreateTarotPlaylist = async () => {
        if (!tarotCards || tarotCards.length === 0) {
            return;
        }

        const userProfile = {
            zodiac_sign: user?.profile?.zodiac_sign || 'scorpio',
            life_path_number: user?.profile?.life_path_number || 8,
        };

        await createTarotPlaylist({
            tarot_cards: tarotCards,
            user_profile: userProfile,
        });

        setActiveTab('tarot');
    };

    const handleTrackPlay = (track: CosmicTrack) => {
        if (track.external_url) {
            openTrack(track.external_url);
            setPlayingTrack(track.id);
        }
    };

    const getElementIcon = (element: string): string => {
        const icons: Record<string, string> = {
            fire: '🔥',
            water: '🌊',
            air: '💨',
            earth: '🌍',
            spirit: '✨',
        };
        return icons[element] || '🎵';
    };

    const getEnergyBar = (energy: number): JSX.Element => (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${energy * 100}%` }}
            />
        </div>
    );

    const renderTrackList = (tracks: CosmicTrack[], showEnergy = true): JSX.Element => (
        <div className="space-y-2 max-h-64 overflow-y-auto">
            {tracks.map((track, index) => (
                <div
                    key={track.id}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${playingTrack === track.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    onClick={() => handleTrackPlay(track)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                <span className="text-lg">{getElementIcon(track.elemental_energy)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {track.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {track.artist} • {track.album}
                                    </p>
                                </div>
                            </div>
                            {showEnergy && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Energy</span>
                                        <span className="font-medium">{Math.round(track.energy_level * 100)}%</span>
                                    </div>
                                    {getEnergyBar(track.energy_level)}
                                </div>
                            )}
                        </div>
                        <div className="ml-3 flex-shrink-0">
                            <button
                                className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                                title="Play on Spotify"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 5v10l7-5-7-5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderElementalBalance = (balance: Record<string, number>): JSX.Element => (
        <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(balance).map(([element, percentage]) => (
                <div key={element} className="flex items-center space-x-2">
                    <span className="text-lg">{getElementIcon(element)}</span>
                    <span className="capitalize font-medium">{element}</span>
                    <span className="text-gray-600">{Math.round(percentage * 100)}%</span>
                </div>
            ))}
        </div>
    );

    if (!isSpotifyConnected) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.75 11.5c-.15.24-.42.35-.68.35-.13 0-.26-.03-.38-.1-.37-.21-4.05-2.44-4.05-2.44s-.12-.07-.12-.16c0-.09.05-.16.12-.16 0 0 3.68-2.23 4.05-2.44.37-.21.85-.08 1.06.29.21.37.08.85-.29 1.06l-2.71 1.63 2.71 1.63c.37.21.5.69.29 1.06z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Cosmic Music Experience
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Connect your Spotify account to unlock personalized cosmic playlists curated based on your zodiac sign, numerology, and tarot readings.
                    </p>
                    <button
                        onClick={handleConnectSpotify}
                        disabled={isLoading}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading ? 'Connecting...' : 'Connect Spotify'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">🎵</span>
                    Cosmic Music Studio
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    AI-curated playlists aligned with your cosmic energy
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start">
                        <p className="text-red-800 text-sm">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-red-600 hover:text-red-800 ml-2"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 px-6">
                <nav className="flex space-x-6">
                    {[
                        { id: 'daily', label: 'Daily Soundtrack', icon: '🌅' },
                        { id: 'create', label: 'Create Playlist', icon: '✨' },
                        { id: 'library', label: 'Your Library', icon: '📚' },
                        ...(tarotCards ? [{ id: 'tarot', label: 'Tarot Playlist', icon: '🔮' }] : []),
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'daily' && (
                    <div>
                        {dailySoundtrack ? (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {dailySoundtrack.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {dailySoundtrack.description}
                                    </p>

                                    {/* Daily Guidance */}
                                    <div className="bg-white rounded-lg p-3 mb-3">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            ✨ Today's Cosmic Energy Guidance
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                            {dailySoundtrack.daily_energy_guidance.cosmic_advice}
                                        </p>
                                    </div>

                                    {/* Elemental Balance */}
                                    <div className="bg-white rounded-lg p-3">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            🌟 Elemental Balance
                                        </h4>
                                        {renderElementalBalance(dailySoundtrack.elemental_balance)}
                                    </div>
                                </div>

                                {/* Track List */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Tracks ({dailySoundtrack.track_count} • {dailySoundtrack.duration_minutes} min)
                                    </h4>
                                    {renderTrackList(dailySoundtrack.tracks)}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">🎶</div>
                                <p className="text-gray-600">Loading your daily cosmic soundtrack...</p>
                                {isLoading && (
                                    <div className="mt-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Create Cosmic Playlist
                            </h3>

                            {/* Mood Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose Your Cosmic Mood
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {cosmicMoods.map((mood) => (
                                        <button
                                            key={mood.id}
                                            onClick={() => setSelectedMood(mood.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${selectedMood === mood.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span>{getElementIcon(mood.element)}</span>
                                                <span className="font-medium text-sm">{mood.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">{mood.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreatePlaylist}
                                disabled={isLoading}
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isLoading ? 'Creating Playlist...' : 'Create Cosmic Playlist'}
                            </button>
                        </div>

                        {currentPlaylist && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    ✨ {currentPlaylist.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    {currentPlaylist.description}
                                </p>
                                {renderTrackList(currentPlaylist.tracks)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'library' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Your Cosmic Library
                            </h3>
                            <button
                                onClick={loadUserPlaylists}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                                Refresh
                            </button>
                        </div>

                        {userPlaylists.length > 0 ? (
                            <div className="space-y-3">
                                {userPlaylists.map((playlist) => (
                                    <div key={playlist.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">{playlist.name}</h4>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {playlist.cosmic_theme}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{playlist.description}</p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>{playlist.track_count} tracks</span>
                                            <span>{playlist.duration_minutes} min</span>
                                            <span>
                                                {Object.entries(playlist.elemental_balance)
                                                    .sort(([, a], [, b]) => b - a)[0][0]} dominant
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">🎵</div>
                                <p className="text-gray-600">No saved playlists yet</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Create some cosmic playlists to see them here
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tarot' && tarotCards && (
                    <div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                🔮 Tarot-Inspired Playlist
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                A cosmic soundtrack curated based on your tarot reading's energy and symbolism.
                            </p>
                            <button
                                onClick={handleCreateTarotPlaylist}
                                disabled={isLoading}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Creating...' : 'Generate Tarot Playlist'}
                            </button>
                        </div>

                        {currentPlaylist && currentPlaylist.cosmic_theme === 'tarot_inspired' && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {currentPlaylist.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    {currentPlaylist.description}
                                </p>
                                {renderTrackList(currentPlaylist.tracks)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedSpotifyPlayer;