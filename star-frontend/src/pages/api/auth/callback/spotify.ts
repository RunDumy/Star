import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    console.error('Spotify auth error:', error);
    return res.redirect('/profile?spotify_error=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  // Get code_verifier from cookie
  const cookies = req.headers.cookie || '';
  const codeVerifierMatch = cookies.match(/spotify_code_verifier=([^;]+)/);
  if (!codeVerifierMatch) {
    return res.status(400).json({ error: 'Code verifier missing' });
  }
  const codeVerifier = codeVerifierMatch[1];

  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/spotify';

  try {
    // Get the user's JWT token from cookies (assuming it's set)
    const authTokenMatch = cookies.match(/sb-[^;]+-auth-token=([^;]+)/);
    if (!authTokenMatch) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const authToken = authTokenMatch[1];

    // Exchange code for tokens via backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(`${backendUrl}/api/spotify/token`, {
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Clear the code_verifier cookie
    res.setHeader('Set-Cookie', 'spotify_code_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

    return res.redirect('/profile?spotify_connected=true');
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } }; message?: string };
    console.error('Failed to exchange Spotify token:', error.response?.data || error.message || err);
    const errorMsg = error.response?.data?.error || 'Failed to connect Spotify';
    return res.redirect('/profile?spotify_error=' + encodeURIComponent(errorMsg));
  }
}
