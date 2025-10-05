'use client';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { supabase } from '@/lib/supabase';
import AgoraUIKit from 'agora-react-uikit';
import { useEffect, useState } from 'react';

interface LiveStream {
  id: string;
  title: string;
  channel_name: string;
  agora_token: string;
  username: string;
  zodiac_sign: string;
  is_active: boolean;
}

interface AgoraUIKitLiveStreamProps {
  streamId: string;
  isHost?: boolean;
}

export function AgoraUIKitLiveStream({ streamId, isHost = false }: AgoraUIKitLiveStreamProps) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, currentUser } = useCollaboration();

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (!session) {
          setError('Please log in to view live streams');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/live-stream/${streamId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const { stream: streamData } = await response.json();
          setStream(streamData);
        } else {
          setError('Stream not found or inactive');
        }
      } catch (err) {
        setError('Failed to load stream');
        console.error('Error fetching stream:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [streamId]);

  // Join stream chat room
  useEffect(() => {
    if (socket && stream) {
      socket.emit('join_stream', { streamId: stream.id });
    }
  }, [socket, stream]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/50 rounded-lg">
        <div className="text-white">Loading stream...</div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/50 rounded-lg">
        <div className="text-red-400">{error || 'Stream not available'}</div>
      </div>
    );
  }

  const rtcProps = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
    channel: stream.channel_name,
    token: stream.agora_token,
  };

  const callbacks = {
    EndCall: async () => {
      if (isHost) {
        // End the stream
        const { data: { session } } = await supabase!.auth.getSession();
        if (session) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/live-stream/${streamId}/end`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      }
      // Handle end call
      console.log('Call ended');
    },
  };

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-900 to-blue-900">
        <h2 className="text-white text-xl font-bold">{stream.title}</h2>
        <p className="text-gray-300">Hosted by {stream.username} ({stream.zodiac_sign})</p>
      </div>

      <div className="relative">
        <AgoraUIKit
          rtcProps={rtcProps}
          callbacks={callbacks}
          styleProps={{
            UIKitContainer: {
              height: '600px',
              width: '100%',
            },
            localBtnContainer: {
              backgroundColor: '#1a1a1a',
            },
            localBtnStyles: {
              muteLocalAudio: { backgroundColor: '#4a5568' },
              muteLocalVideo: { backgroundColor: '#4a5568' },
              switchCamera: { backgroundColor: '#4a5568' },
              endCall: { backgroundColor: '#e53e3e' },
            },
          }}
        />

        {/* Stream Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <p className="text-xs text-gray-300 mt-1">Cosmic Stream</p>
        </div>
      </div>
    </div>
  );
}