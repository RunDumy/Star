"use client";

import { supabase } from "@/lib/supabase";
import Image from 'next/image';
import { useEffect, useState } from "react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  preview_url: string | null;
}

export default function SpotifyStats({ userId }: { userId: string }) {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const fetchSpotifyData = async () => {
      try {
        setLoading(true);
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select(`spotify_access_token`)
          .eq("user_id", userId)
          .single();

        if (pErr || !profile?.spotify_access_token) {
          if (mounted) setError("Connect Spotify to see music stats.");
          return;
        }

        const accessToken = profile.spotify_access_token;

        const topResp = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const topJson = await topResp.json();
        if (mounted) setTopTracks(topJson.items || []);

        const nowResp = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (nowResp.ok) {
          const nowJson = await nowResp.json();
          if (mounted) setCurrentlyPlaying(nowJson.item || null);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError("Failed to fetch Spotify data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSpotifyData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) return <div className="mt-6 p-4 text-sm text-gray-300">Loading music...</div>;
  if (error) return <div className="mt-6 p-4 text-sm text-red-400">{error}</div>;

  return (
    <div className="mt-6 rounded-lg border border-purple-600/20 bg-black/10 p-4">
      <h3 className="text-lg font-semibold text-purple-300 mb-3">Cosmic Tunes</h3>

      {currentlyPlaying && (
            <div className="flex items-center gap-4 mb-3">
              {currentlyPlaying.album?.images?.[0]?.url ? (
                <div className="relative w-16 h-16">
                  <Image src={currentlyPlaying.album.images[0].url} alt={`${currentlyPlaying.name} album`} fill sizes="64px" className="rounded" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-gray-700" />
              )}
          <div>
            <div className="font-semibold">{currentlyPlaying.name}</div>
            <div className="text-sm text-gray-300">{currentlyPlaying.artists?.map(a => a.name).join(', ')}</div>
                {currentlyPlaying.preview_url && (
                  <audio controls src={currentlyPlaying.preview_url} className="mt-2" aria-label={`Preview of ${currentlyPlaying.name} by ${currentlyPlaying.artists?.map(a => a.name).join(', ')}`}>
                    <track kind="captions" srcLang="en" />
                  </audio>
                )}
          </div>
        </div>
      )}

      <div>
        <div className="text-sm text-gray-400 mb-2">Top tracks (recent)</div>
        <ul className="space-y-2">
          {topTracks.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              {t.album?.images?.[2]?.url ? (
                <div className="relative w-10 h-10">
                  <Image src={t.album.images[2].url} alt={`${t.name} thumbnail`} fill sizes="40px" className="rounded" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-gray-700" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-gray-400">{t.artists?.map(a => a.name).join(', ')}</div>
              </div>
              {t.preview_url && (
                <audio controls src={t.preview_url} className="w-36" aria-label={`Preview of ${t.name} by ${t.artists?.map(a => a.name).join(', ')}`}>
                  <track kind="captions" srcLang="en" />
                </audio>
              )}
            </li>
          ))}
          {topTracks.length === 0 && <li className="text-sm text-gray-400">No top tracks available.</li>}
        </ul>
      </div>

      <div className="mt-4">
        <a href="/api/auth/spotify" className="inline-block bg-green-600 text-white px-3 py-1 rounded">Connect Spotify</a>
      </div>
    </div>
  );
}
