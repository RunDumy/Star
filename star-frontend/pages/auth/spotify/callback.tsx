/**
 * Spotify OAuth Callback Page
 * Handles the OAuth redirect and communicates with the parent window
 */

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const SpotifyCallback: React.FC = () => {
    const router = useRouter();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing Spotify authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { code, state, error } = router.query;

                if (error) {
                    setStatus('error');
                    setMessage(`Authentication failed: ${error}`);
                    window.opener?.postMessage({
                        type: 'SPOTIFY_OAUTH_ERROR',
                        error: error as string
                    }, window.location.origin);
                    return;
                }

                if (!code || !state) {
                    setStatus('error');
                    setMessage('Missing authorization code or state parameter');
                    window.opener?.postMessage({
                        type: 'SPOTIFY_OAUTH_ERROR',
                        error: 'Missing parameters'
                    }, window.location.origin);
                    return;
                }

                // Exchange code for tokens
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/oauth/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code as string,
                        state: state as string
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage('Authentication successful! You can close this window.');

                    // Get user tokens for immediate use
                    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/spotify/oauth/user-tokens/${data.user_id}`);
                    const tokenData = await tokenResponse.json();

                    window.opener?.postMessage({
                        type: 'SPOTIFY_OAUTH_SUCCESS',
                        user_id: data.user_id,
                        profile: data.profile,
                        access_token: tokenData.access_token
                    }, window.location.origin);

                    // Close window after a brief delay
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Authentication failed');
                    window.opener?.postMessage({
                        type: 'SPOTIFY_OAUTH_ERROR',
                        error: data.error || 'Authentication failed'
                    }, window.location.origin);
                }
            } catch (error) {
                console.error('Spotify callback error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred');
                window.opener?.postMessage({
                    type: 'SPOTIFY_OAUTH_ERROR',
                    error: 'Network error'
                }, window.location.origin);
            }
        };

        if (router.isReady) {
            handleCallback();
        }
    }, [router.isReady, router.query]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    {status === 'processing' && (
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    )}
                    {status === 'success' && (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h1 className="text-xl font-bold text-white mb-2">
                    {status === 'processing' && 'Connecting to Spotify'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Authentication Failed'}
                </h1>

                <p className="text-gray-300 text-sm">
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => window.close()}
                        className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                    >
                        Close Window
                    </button>
                )}
            </div>
        </div>
    );
};

export default SpotifyCallback;