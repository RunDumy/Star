/**
 * Real-time Cosmic Spotify Player for STAR Platform
 * Enhanced with lunar phases, tarot synchronization, and real-time updates
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    Headphones,
    Moon,
    Music,
    Pause,
    Play,
    SkipBack, SkipForward,
    Sparkles
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../lib/AuthContext';

interface CosmicTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration_ms: number;
    energy_level: number;
    cosmic_mood: string;
    elemental_energy: string;
    tarot_influence?: string;
    lunar_resonance?: number;
    preview_url?: string;
    external_url?: string;
    spotify_uri?: string;
}

interface RealTimeSession {
    session_id: string;
    host_user: string;
    current_track: CosmicTrack | null;
    playlist_id: string;
    participants: string[];
    cosmic_sync_level: number;
    lunar_phase: string;
    created_at: string;
}

interface LunarPhase {
    phase: string;
    illumination: number;
    description: string;
    cosmic_energy: string;
}

interface RealTimeCosmicSpotifyPlayerProps {
    className?: string;
    sessionId?: string;
    isHost?: boolean;
    tarotCards?: Array<any>;
}

export const RealTimeCosmicSpotifyPlayer: React.FC<RealTimeCosmicSpotifyPlayerProps> = ({
    className = '',
    sessionId,
    isHost = false,
    tarotCards
}) => {
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<CosmicTrack | null>(null);
    const [session, setSession] = useState<RealTimeSession | null>(null);
    const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
    const [playlist, setPlaylist] = useState<CosmicTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

    // Spotify OAuth and Web Playbook SDK state
    const [spotifyAuth, setSpotifyAuth] = useState<{
        isAuthenticated: boolean;
        user_id?: string;
        profile?: any;
        access_token?: string;
    }>({ isAuthenticated: false });
    const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [playerState, setPlayerState] = useState<any>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLButtonElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // WebSocket connection for real-time synchronization
    const { socket, isConnected, sendMessage } = useWebSocket(`/cosmic-music/${sessionId}`);

    // Update connection status based on WebSocket state
    useEffect(() => {
        if (isConnected) {
            setConnectionStatus('connected');
        } else if (socket) {
            setConnectionStatus('connecting');
        } else {
            setConnectionStatus('disconnected');
        }
    }, [isConnected, socket]);

    // Initialize session and lunar data
    useEffect(() => {
        initializeSession();
        fetchLunarPhase();
    }, [sessionId]);

    // WebSocket event handlers
    useEffect(() => {
        if (!socket) return;

        socket.on('track_changed', handleTrackChange);
        socket.on('playback_state', handlePlaybackState);
        socket.on('session_updated', handleSessionUpdate);
        socket.on('cosmic_sync', handleCosmicSync);
        socket.on('participant_joined', handleParticipantJoined);

        return () => {
            socket.off('track_changed');
            socket.off('playback_state');
            socket.off('session_updated');
            socket.off('cosmic_sync');
            socket.off('participant_joined');
        };
    }, [socket]);

    // Audio progress tracking
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const updateProgress = () => {
            if (audio.duration) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                setProgress(progressPercent);

                // Sync progress with other participants
                if (isHost && isConnected) {
                    sendMessage('progress_update', {
                        progress: progressPercent,
                        currentTime: audio.currentTime,
                        timestamp: Date.now()
                    });
                }
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
        };
    }, [currentTrack, isHost, isConnected, sendMessage]);

    const initializeSession = async () => {
        if (!sessionId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const sessionData = await response.json();
                setSession(sessionData);
                if (sessionData.current_track) {
                    setCurrentTrack(sessionData.current_track);
                }
            }
        } catch (error) {
            console.error('Failed to initialize session:', error);
            setError('Failed to connect to music session');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLunarPhase = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/lunar-phase`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const lunarData = await response.json();
                setLunarPhase(lunarData);
            }
        } catch (error) {
            console.error('Failed to fetch lunar phase:', error);
        }
    };

    const createCosmicPlaylist = async () => {
        if (!user?.zodiac_sign) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/cosmic-playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    zodiac_sign: user.zodiac_sign,
                    lunar_phase: lunarPhase?.phase,
                    tarot_cards: tarotCards,
                    intention: 'cosmic_synchronization',
                    user_id: user.id
                }),
            }); if (response.ok) {
                const playlistData = await response.json();
                setPlaylist(playlistData.tracks);
                setCurrentTrack(playlistData.tracks[0]);
                setCurrentIndex(0);
            }
        } catch (error) {
            console.error('Failed to create cosmic playlist:', error);
            setError('Failed to create cosmic playlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrackChange = useCallback((data: { track: CosmicTrack; index: number }) => {
        setCurrentTrack(data.track);
        setCurrentIndex(data.index);

        if (audioRef.current && data.track.preview_url) {
            audioRef.current.src = data.track.preview_url;
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [isPlaying]);

    const handlePlaybackState = useCallback((data: { isPlaying: boolean; progress: number }) => {
        setIsPlaying(data.isPlaying);
        setProgress(data.progress);

        if (audioRef.current) {
            if (data.isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, []);

    const handleSessionUpdate = useCallback((sessionData: RealTimeSession) => {
        setSession(sessionData);
    }, []);

    const handleCosmicSync = useCallback((syncData: any) => {
        // Handle cosmic synchronization events
        console.log('Cosmic sync event:', syncData);
    }, []);

    const handleParticipantJoined = useCallback((participantData: any) => {
        if (session) {
            setSession({
                ...session,
                participants: [...session.participants, participantData.user_id]
            });
        }
    }, [session]);

    const togglePlayback = async () => {
        // Use Spotify Web Playbook SDK if authenticated and available
        if (spotifyAuth.isAuthenticated && spotifyPlayer && deviceId) {
            try {
                await toggleSpotifyPlaybook();
                return;
            } catch (error) {
                console.error('Spotify playbook control failed, falling back to preview:', error);
                // Fall through to preview playbook
            }
        }

        // Fallback to preview audio playbook
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (audioRef.current) {
            if (newIsPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }

        // Sync with other participants
        if (isHost && isConnected) {
            sendMessage('playback_control', {
                action: newIsPlaying ? 'play' : 'pause',
                timestamp: Date.now(),
                source: spotifyAuth.isAuthenticated ? 'spotify' : 'preview'
            });
        }
    };

    const nextTrack = () => {
        if (currentIndex < playlist.length - 1) {
            const newIndex = currentIndex + 1;
            const newTrack = playlist[newIndex];

            setCurrentIndex(newIndex);
            setCurrentTrack(newTrack);

            if (isHost && isConnected) {
                sendMessage('track_change', {
                    track: newTrack,
                    index: newIndex,
                    timestamp: Date.now()
                });
            }
        }
    };

    const previousTrack = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const newTrack = playlist[newIndex];

            setCurrentIndex(newIndex);
            setCurrentTrack(newTrack);

            if (isHost && isConnected) {
                sendMessage('track_change', {
                    track: newTrack,
                    index: newIndex,
                    timestamp: Date.now()
                });
            }
        }
    };

    // ===== SPOTIFY OAUTH & WEB PLAYBOOK SDK FUNCTIONS =====

    const initiateSpotifyOAuth = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/oauth/login`);
            const data = await response.json();

            if (data.success) {
                // Open OAuth window
                const popup = window.open(data.auth_url, 'spotify-oauth', 'width=500,height=600');

                // Listen for callback
                const messageListener = (event: MessageEvent) => {
                    if (event.origin !== window.location.origin) return;

                    if (event.data.type === 'SPOTIFY_OAUTH_SUCCESS') {
                        setSpotifyAuth({
                            isAuthenticated: true,
                            user_id: event.data.user_id,
                            profile: event.data.profile,
                            access_token: event.data.access_token
                        });
                        initializeSpotifyPlayer(event.data.access_token);
                        popup?.close();
                        window.removeEventListener('message', messageListener);
                    } else if (event.data.type === 'SPOTIFY_OAUTH_ERROR') {
                        setError('Spotify authentication failed');
                        popup?.close();
                        window.removeEventListener('message', messageListener);
                    }
                };

                window.addEventListener('message', messageListener);

                // Clean up if popup is closed manually
                const checkClosed = setInterval(() => {
                    if (popup?.closed) {
                        window.removeEventListener('message', messageListener);
                        clearInterval(checkClosed);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to initiate Spotify OAuth:', error);
            setError('Failed to start Spotify authentication');
        }
    };

    const initializeSpotifyPlayer = async (accessToken: string) => {
        try {
            // Load Spotify Web Playbook SDK
            if (!window.Spotify) {
                await loadSpotifySDK();
            }

            const player = new window.Spotify.Player({
                name: `STAR Cosmic Player - ${user?.username || 'User'}`,
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(accessToken);
                },
                volume: 0.5
            });

            // Error handling
            player.addListener('initialization_error', ({ message }: any) => {
                console.error('Spotify Player initialization error:', message);
                setError('Failed to initialize Spotify player');
            });

            player.addListener('authentication_error', ({ message }: any) => {
                console.error('Spotify Player auth error:', message);
                setError('Spotify authentication expired');
                // Try to refresh token
                refreshSpotifyToken();
            });

            player.addListener('account_error', ({ message }: any) => {
                console.error('Spotify Player account error:', message);
                setError('Spotify Premium required for playbook control');
            });

            player.addListener('playback_error', ({ message }: any) => {
                console.error('Spotify Player playbook error:', message);
            });

            // Ready
            player.addListener('ready', ({ device_id }: any) => {
                console.log('Spotify Player ready with device ID:', device_id);
                setDeviceId(device_id);
                setSpotifyPlayer(player);
            });

            // Not ready
            player.addListener('not_ready', ({ device_id }: any) => {
                console.log('Spotify Player device has gone offline:', device_id);
                setDeviceId(null);
            });

            // Player state changes
            player.addListener('player_state_changed', (state: any) => {
                if (!state) return;

                setPlayerState(state);
                setIsPlaying(!state.paused);

                // Sync with other participants
                if (isHost && isConnected && state.track_window.current_track) {
                    const spotifyTrack = state.track_window.current_track;
                    const cosmicTrack: CosmicTrack = {
                        id: spotifyTrack.id,
                        name: spotifyTrack.name,
                        artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
                        album: spotifyTrack.album.name,
                        duration_ms: spotifyTrack.duration_ms,
                        energy_level: Math.random(), // TODO: Get from Spotify Audio Features
                        cosmic_mood: 'harmonious',
                        elemental_energy: 'air',
                        spotify_uri: spotifyTrack.uri
                    };

                    sendMessage('spotify_track_change', {
                        track: cosmicTrack,
                        position: state.position,
                        is_playing: !state.paused,
                        timestamp: Date.now()
                    });
                }
            });

            // Connect to the player
            await player.connect();

        } catch (error) {
            console.error('Failed to initialize Spotify player:', error);
            setError('Failed to setup Spotify player');
        }
    };

    const loadSpotifySDK = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.Spotify) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            script.onload = () => {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve();
                };
            };

            script.onerror = () => {
                reject(new Error('Failed to load Spotify SDK'));
            };

            document.head.appendChild(script);
        });
    };

    const refreshSpotifyToken = async () => {
        if (!spotifyAuth.user_id) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/oauth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: spotifyAuth.user_id })
            });

            if (response.ok) {
                const data = await response.json();
                // Token refreshed, player will automatically use new token
                console.log('Spotify token refreshed successfully');
            } else {
                // Refresh failed, need to re-authenticate
                setSpotifyAuth({ isAuthenticated: false });
                setError('Please reconnect to Spotify');
            }
        } catch (error) {
            console.error('Failed to refresh Spotify token:', error);
            setSpotifyAuth({ isAuthenticated: false });
            setError('Please reconnect to Spotify');
        }
    };

    const playSpotifyTrack = async (trackUri: string) => {
        if (!spotifyPlayer || !deviceId) {
            setError('Spotify player not ready');
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${spotifyAuth.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [trackUri]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to play track');
            }
        } catch (error) {
            console.error('Failed to play Spotify track:', error);
            setError('Failed to play track');
        }
    };

    const toggleSpotifyPlaybook = async () => {
        if (!spotifyPlayer) {
            setError('Spotify player not ready');
            return;
        }

        try {
            await spotifyPlayer.togglePlay();
        } catch (error) {
            console.error('Failed to toggle Spotify playbook:', error);
            setError('Failed to control playbook');
        }
    };

    // Check for existing Spotify authentication on component mount
    useEffect(() => {
        const checkSpotifyAuth = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/oauth/user-tokens/${user.id}`);

                if (response.ok) {
                    const data = await response.json();
                    setSpotifyAuth({
                        isAuthenticated: true,
                        user_id: user.id,
                        profile: data.profile,
                        access_token: data.access_token
                    });
                    initializeSpotifyPlayer(data.access_token);
                }
            } catch (error) {
                console.error('Failed to check Spotify auth:', error);
            }
        };

        checkSpotifyAuth();
    }, [user?.id]);

    // ===== END SPOTIFY OAUTH & WEB PLAYBOOK SDK FUNCTIONS =====

    const getEnergyColor = (energy: number) => {
        if (energy > 0.8) return 'from-red-500 to-orange-500';
        if (energy > 0.6) return 'from-orange-500 to-yellow-500';
        if (energy > 0.4) return 'from-yellow-500 to-green-500';
        if (energy > 0.2) return 'from-green-500 to-blue-500';
        return 'from-blue-500 to-purple-500';
    };

    const getElementalGlow = (element: string) => {
        switch (element?.toLowerCase()) {
            case 'fire': return 'shadow-red-500/30';
            case 'water': return 'shadow-blue-500/30';
            case 'air': return 'shadow-yellow-500/30';
            case 'earth': return 'shadow-green-500/30';
            default: return 'shadow-purple-500/30';
        }
    };

    return (
        <motion.div
            className={`cosmic-spotify-player ${className}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={currentTrack?.preview_url}
                onEnded={nextTrack}
                preload="metadata"
            >
                <track kind="captions" src="" label="No captions available" />
            </audio>

            {/* Main Player Interface */}
            <div className={`
                relative bg-gradient-to-br from-gray-900/95 to-black/95 
                backdrop-blur-xl rounded-3xl p-6 shadow-2xl
                ${currentTrack ? getElementalGlow(currentTrack.elemental_energy) : 'shadow-purple-500/30'}
                border border-white/10
            `}>
                {/* Connection Status */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${(() => {
                        switch (connectionStatus) {
                            case 'connected': return 'bg-green-400';
                            case 'connecting': return 'bg-yellow-400';
                            default: return 'bg-red-400';
                        }
                    })()}`} />
                    <span className="text-xs text-gray-400">
                        {(() => {
                            switch (connectionStatus) {
                                case 'connected': return 'Cosmic Sync Active';
                                case 'connecting': return 'Connecting...';
                                default: return 'Offline Mode';
                            }
                        })()}
                    </span>
                    {session && (
                        <span className="text-xs text-gray-400 ml-auto">
                            {session.participants.length} cosmic travelers
                        </span>
                    )}
                </div>

                {/* Spotify Authentication Section */}
                {!spotifyAuth.isAuthenticated ? (
                    <motion.div
                        className="text-center mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Music className="w-5 h-5 text-green-400" />
                            <h4 className="text-lg font-semibold text-green-400">Connect to Spotify</h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">
                            Unlock the full cosmic music experience with Spotify Premium
                        </p>
                        <motion.button
                            onClick={initiateSpotifyOAuth}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Connecting...' : 'Connect Spotify'}
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="flex items-center gap-3 mb-4 p-2 bg-green-500/10 rounded-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-400">Spotify Connected</p>
                            <p className="text-xs text-gray-400">
                                {spotifyAuth.profile?.display_name || 'Premium User'}
                            </p>
                        </div>
                        {deviceId && (
                            <div className="text-xs text-green-400">
                                🎵 Ready
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Lunar Phase Indicator */}
                {lunarPhase && (
                    <motion.div
                        className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Moon className="w-4 h-4 text-blue-300" />
                        <span className="text-sm text-blue-300">{lunarPhase.phase}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                            {Math.round(lunarPhase.illumination * 100)}% illuminated
                        </span>
                    </motion.div>
                )}

                {/* Track Information */}
                <AnimatePresence mode="wait">
                    {currentTrack ? (
                        <motion.div
                            key={currentTrack.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center mb-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-1">
                                {currentTrack.name}
                            </h3>
                            <p className="text-gray-300 mb-2">{currentTrack.artist}</p>
                            <div className="flex items-center justify-center gap-4 text-xs">
                                <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getEnergyColor(currentTrack.energy_level)
                                    } text-white`}>
                                    Energy: {Math.round(currentTrack.energy_level * 100)}%
                                </span>
                                <span className="px-2 py-1 rounded-full bg-purple-500/30 text-purple-300">
                                    {currentTrack.cosmic_mood}
                                </span>
                                <span className="px-2 py-1 rounded-full bg-blue-500/30 text-blue-300">
                                    {currentTrack.elemental_energy}
                                </span>
                            </div>
                            {currentTrack.tarot_influence && (
                                <motion.div
                                    className="mt-2 text-sm text-amber-300"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Sparkles className="w-4 h-4 inline mr-1" />
                                    Tarot: {currentTrack.tarot_influence}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center mb-6"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <Music className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-gray-400">Ready for cosmic harmonization</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Bar */}
                {currentTrack && (
                    <div className="mb-6">
                        <div className="relative">
                            <progress
                                value={progress}
                                max={100}
                                className="w-full h-2 opacity-0 absolute inset-0"
                            />
                            <button
                                ref={progressRef}
                                aria-label="Seek track position"
                                className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-none border-none p-0"
                                onClick={(e) => {
                                    if (audioRef.current && progressRef.current) {
                                        const rect = progressRef.current.getBoundingClientRect();
                                        const clickX = e.clientX - rect.left;
                                        const percentage = clickX / rect.width;
                                        const newTime = percentage * audioRef.current.duration;
                                        audioRef.current.currentTime = newTime;
                                    }
                                }}
                            >
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${getEnergyColor(currentTrack.energy_level)}`}
                                    style={{ width: `${progress}%` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </button>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{Math.floor((progress / 100) * duration / 60)}:{String(Math.floor(((progress / 100) * duration) % 60)).padStart(2, '0')}</span>
                            <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                        </div>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={previousTrack}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SkipBack className="w-5 h-5 text-white" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlayback}
                        disabled={!currentTrack?.preview_url}
                        className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 disabled:opacity-50"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                        ) : (
                            <Play className="w-6 h-6 text-white ml-0.5" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextTrack}
                        disabled={currentIndex === playlist.length - 1}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SkipForward className="w-5 h-5 text-white" />
                    </motion.button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={createCosmicPlaylist}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm hover:from-purple-400 hover:to-pink-400 disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        {isLoading ? 'Creating...' : 'Generate Cosmic Mix'}
                    </motion.button>

                    {currentTrack && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => currentTrack.external_url && window.open(currentTrack.external_url, '_blank')}
                            className="px-4 py-2 bg-green-500 rounded-full text-white text-sm hover:bg-green-400"
                        >
                            <Headphones className="w-4 h-4 inline mr-2" />
                            Open in Spotify
                        </motion.button>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center"
                    >
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 text-red-200 hover:text-white"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RealTimeCosmicSpotifyPlayer;