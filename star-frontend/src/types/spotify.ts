/**
 * Spotify Web Playbook SDK Types
 * Type definitions for the Spotify Web Playbook SDK
 */

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady?: () => void;
        Spotify?: {
            Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
        };
    }
}

interface SpotifyPlayerOptions {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
    enableMediaSession?: boolean;
}

interface SpotifyPlayer {
    addListener(event: string, callback: (data: any) => void): boolean;
    removeListener(event: string, callback?: (data: any) => void): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<SpotifyPlayerState | null>;
    getVolume(): Promise<number>;
    nextTrack(): Promise<void>;
    pause(): Promise<void>;
    previousTrack(): Promise<void>;
    resume(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    setName(name: string): Promise<void>;
    setVolume(volume: number): Promise<void>;
    togglePlay(): Promise<void>;
}

interface SpotifyPlayerState {
    context: {
        uri: string;
        metadata: any;
    };
    disallows: {
        pausing: boolean;
        peeking_next: boolean;
        peeking_prev: boolean;
        resuming: boolean;
        seeking: boolean;
        skipping_next: boolean;
        skipping_prev: boolean;
        toggling_repeat_context: boolean;
        toggling_shuffle: boolean;
        toggling_repeat_track: boolean;
        transferring_playback: boolean;
    };
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
        current_track: SpotifyTrack;
        next_tracks: SpotifyTrack[];
        previous_tracks: SpotifyTrack[];
    };
}

interface SpotifyTrack {
    id: string;
    uri: string;
    name: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    is_playable: boolean;
    media_type: string;
    type: string;
    uid: string;
    linked_from_uri?: string;
    linked_from?: {
        uri: string;
        id: string;
    };
}

interface SpotifyArtist {
    name: string;
    uri: string;
}

interface SpotifyAlbum {
    name: string;
    uri: string;
    images: SpotifyImage[];
}

interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export type {
    SpotifyAlbum, SpotifyArtist, SpotifyImage, SpotifyPlayer,
    SpotifyPlayerOptions,
    SpotifyPlayerState,
    SpotifyTrack
};
