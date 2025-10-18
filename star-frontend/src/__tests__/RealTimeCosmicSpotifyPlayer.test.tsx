/**
 * Test Suite for Enhanced Cosmic Spotify Integration
 * Comprehensive tests for real-time music sync and cosmic audio features
 */

import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RealTimeCosmicSpotifyPlayer from '../components/cosmic/RealTimeCosmicSpotifyPlayer';
import cosmicWebSocketService from '../lib/services/CosmicWebSocketService';
import enhancedAnalyticsService from '../lib/services/EnhancedAnalyticsService';

// Mock dependencies
jest.mock('../lib/services/CosmicWebSocketService');
jest.mock('../lib/services/EnhancedAnalyticsService');
jest.mock('../lib/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user-123',
            username: 'CosmicTestUser',
            zodiacSign: 'scorpio'
        },
        token: 'mock-jwt-token'
    })
}));

// Mock Spotify Web Playback SDK
const mockSpotifyPlayer = {
    connect: jest.fn(() => Promise.resolve(true)),
    disconnect: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    getCurrentState: jest.fn(() => Promise.resolve({
        position: 45000,
        duration: 180000,
        paused: false,
        track_window: {
            current_track: {
                id: 'test-track-123',
                name: 'Cosmic Harmony',
                artists: [{ name: 'Stellar Sounds' }],
                album: {
                    name: 'Galactic Vibes',
                    images: [{ url: 'https://example.com/album-art.jpg' }]
                }
            }
        }
    })),
    resume: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    seek: jest.fn(() => Promise.resolve()),
    setVolume: jest.fn(() => Promise.resolve())
};

(window as any).Spotify = {
    Player: jest.fn(() => mockSpotifyPlayer)
};

// Mock Audio API
const mockAudio = {
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(),
    load: jest.fn(),
    currentTime: 0,
    duration: 180,
    volume: 0.8,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

(window as any).Audio = jest.fn(() => mockAudio);

// Mock WebSocket service
const mockWebSocketService = cosmicWebSocketService as jest.Mocked<typeof cosmicWebSocketService>;
mockWebSocketService.isConnected = jest.fn(() => true);
mockWebSocketService.syncMusicState = jest.fn();
mockWebSocketService.onMusicSync = jest.fn(() => () => { });
mockWebSocketService.joinCosmicSession = jest.fn();
mockWebSocketService.onCosmicEvent = jest.fn(() => () => { });

// Mock Analytics service
const mockAnalyticsService = enhancedAnalyticsService as jest.Mocked<typeof enhancedAnalyticsService>;
mockAnalyticsService.getRealTimeData = jest.fn(() => Promise.resolve({
    active_users: 42,
    current_sessions: 7,
    live_interactions: 156,
    cosmic_events: 23
}));

describe('RealTimeCosmicSpotifyPlayer', () => {
    const defaultProps = {
        sessionId: 'cosmic-session-123',
        isHost: true,
        className: 'test-cosmic-player',
        tarotCards: [
            { id: 'card1', name: 'The Star', energy: 'cosmic' },
            { id: 'card2', name: 'The Moon', energy: 'intuitive' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock API responses with proper URLs
        (globalThis.fetch as any) = jest.fn((url: string) => {
            if (url.includes('/api/v1/spotify/session/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        session_id: 'cosmic-session-123',
                        host_user: 'user123',
                        current_track: null,
                        playlist_id: 'cosmic-playlist',
                        participants: ['user123', 'user456'],
                        cosmic_sync_level: 85,
                        lunar_phase: 'waxing_crescent',
                        created_at: new Date().toISOString()
                    })
                } as Response);
            }
            if (url.includes('/api/v1/spotify/lunar-phase')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        phase: 'waxing_crescent',
                        illumination: 0.25,
                        description: 'New beginnings and cosmic growth',
                        cosmic_energy: 'expansive'
                    })
                } as Response);
            }
            if (url.includes('/api/v1/spotify/cosmic-playlist')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        tracks: [
                            {
                                id: 'track1',
                                name: 'Cosmic Journey',
                                artist: 'Stellar Sounds',
                                album: 'Galaxy Dreams',
                                duration_ms: 240000,
                                energy_level: 0.8,
                                cosmic_mood: 'transcendent',
                                elemental_energy: 'air'
                            }
                        ]
                    })
                } as Response);
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        // Reset localStorage
        Object.defineProperty(globalThis, 'localStorage', {
            value: {
                getItem: jest.fn(() => 'mock-spotify-token'),
                setItem: jest.fn(),
                removeItem: jest.fn()
            },
            writable: true
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders the cosmic player interface', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/ready for cosmic harmonization/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/cosmic travelers/i)).toBeInTheDocument();
        });

        it('displays loading state initially', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            expect(screen.getByText(/connecting/i)).toBeInTheDocument();
        });

        it('shows error state when Spotify fails to load', async () => {
            mockSpotifyPlayer.connect.mockRejectedValueOnce(new Error('Spotify connection failed'));

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic connection disrupted/i)).toBeInTheDocument();
            });
        });
    });

    describe('Music Playback Controls', () => {
        it('handles play/pause button clicks', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/cosmic spotify player/i)).toBeInTheDocument();
            });

            const playButton = screen.getByLabelText(/pause cosmic playback/i);
            fireEvent.click(playButton);

            expect(mockSpotifyPlayer.pause).toHaveBeenCalled();
            expect(mockWebSocketService.syncMusicState).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_playing: false,
                    cosmic_phase: expect.any(String)
                })
            );
        });

        it('handles volume adjustment', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const volumeSlider = screen.getByLabelText(/cosmic volume/i);
                fireEvent.change(volumeSlider, { target: { value: '0.6' } });
            });

            expect(mockSpotifyPlayer.setVolume).toHaveBeenCalledWith(0.6);
        });

        it('handles track seeking', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const progressSlider = screen.getByLabelText(/track progress/i);
                fireEvent.change(progressSlider, { target: { value: '90' } });
            });

            // Should seek to 90 seconds (90000ms)
            expect(mockSpotifyPlayer.seek).toHaveBeenCalledWith(90000);
        });
    });

    describe('Real-time Synchronization', () => {
        it('syncs music state when host makes changes', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const playButton = screen.getByLabelText(/pause cosmic playback/i);
                fireEvent.click(playButton);
            });

            expect(mockWebSocketService.syncMusicState).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_playing: false,
                    position: expect.any(Number),
                    timestamp: expect.any(Number)
                })
            );
        });

        it('responds to incoming sync events from other users', async () => {
            let musicSyncCallback: (data: any) => void = () => { };
            mockWebSocketService.onMusicSync.mockImplementation((callback) => {
                musicSyncCallback = callback;
                return () => { };
            });

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} isHost={false} />);

            // Simulate incoming sync event
            act(() => {
                musicSyncCallback({
                    track_id: 'new-track-456',
                    position: 60000,
                    is_playing: true,
                    timestamp: Date.now(),
                    cosmic_phase: 'new_moon'
                });
            });

            await waitFor(() => {
                expect(mockSpotifyPlayer.seek).toHaveBeenCalledWith(60000);
                expect(mockSpotifyPlayer.resume).toHaveBeenCalled();
            });
        });
    });

    describe('Cosmic Integration Features', () => {
        it('displays lunar phase information', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/lunar phase/i)).toBeInTheDocument();
            });
        });

        it('shows cosmic energy visualization', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/energy flow/i)).toBeInTheDocument();
            });
        });

        it('adapts display based on tarot cards', async () => {
            const tarotProps = {
                ...defaultProps,
                tarotCards: [
                    { id: 'star', name: 'The Star', energy: 'hopeful' },
                    { id: 'moon', name: 'The Moon', energy: 'mysterious' }
                ]
            };
            render(<RealTimeCosmicSpotifyPlayer {...tarotProps} />);

            await waitFor(() => {
                expect(screen.getByText(/tarot influence/i)).toBeInTheDocument();
            });
        });
    });

    describe('Collaborative Features', () => {
        it('joins cosmic session on component mount', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(mockWebSocketService.joinCosmicSession).toHaveBeenCalledWith(
                    'cosmic-session-123',
                    expect.objectContaining({
                        user_id: 'test-user-123',
                        zodiac_sign: 'scorpio'
                    })
                );
            });
        });

        it('displays participant count', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/participants in cosmic harmony/i)).toBeInTheDocument();
            });
        });

        it('shows host indicator when user is host', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} isHost={true} />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic conductor/i)).toBeInTheDocument();
            });
        });
    });

    describe('Tarot Integration Features', () => {
        it('displays tarot influence when cards provided', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/tarot influence/i)).toBeInTheDocument();
            });
        });

        it('shows cosmic metrics with tarot cards', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic resonance/i)).toBeInTheDocument();
            });
        });

        it('handles missing tarot cards gracefully', async () => {
            const propsWithoutTarot = { ...defaultProps, tarotCards: [] };
            render(<RealTimeCosmicSpotifyPlayer {...propsWithoutTarot} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/cosmic spotify player/i)).toBeInTheDocument();
            });
        });
    }); describe('Error Handling', () => {
        it('handles Spotify SDK initialization errors gracefully', async () => {
            (globalThis as any).Spotify = undefined;

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/spotify sdk not available/i)).toBeInTheDocument();
            });
        }); it('handles WebSocket connection errors', async () => {
            mockWebSocketService.isConnected.mockReturnValue(false);

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic connection unstable/i)).toBeInTheDocument();
            });
        });

        it('retries failed operations', async () => {
            mockSpotifyPlayer.resume.mockRejectedValueOnce(new Error('Playback failed'));
            mockSpotifyPlayer.resume.mockResolvedValueOnce();

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const playButton = screen.getByLabelText(/resume cosmic playback/i);
                fireEvent.click(playButton);
            });

            // Should retry the operation
            await waitFor(() => {
                expect(mockSpotifyPlayer.resume).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Accessibility', () => {
        it('provides proper ARIA labels for all controls', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/cosmic spotify player/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/cosmic volume/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/track progress/i)).toBeInTheDocument();
            });
        });

        it('supports keyboard navigation', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const playButton = screen.getByLabelText(/pause cosmic playback/i);
                playButton.focus();
                expect(playButton).toHaveFocus();
            });
        });

        it('announces state changes to screen readers', async () => {
            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/now playing/i)).toBeInTheDocument();
            });
        });
    });

    describe('Performance', () => {
        it('debounces rapid sync updates', async () => {
            jest.useFakeTimers();

            render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await waitFor(() => {
                const progressSlider = screen.getByLabelText(/track progress/i);

                // Rapid slider changes
                fireEvent.change(progressSlider, { target: { value: '30' } });
                fireEvent.change(progressSlider, { target: { value: '35' } });
                fireEvent.change(progressSlider, { target: { value: '40' } });
            });

            // Fast-forward debounce timer
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // Should only sync once after debounce
            expect(mockWebSocketService.syncMusicState).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });

        it('cleans up resources on unmount', () => {
            const { unmount } = render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            unmount();

            expect(mockSpotifyPlayer.disconnect).toHaveBeenCalled();
        });
    });
});