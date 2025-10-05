'use client';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { supabase } from '@/lib/supabase';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface LiveStream {
  id: string;
  title: string;
  description: string;
  host_id: string;
  host_username: string;
  is_live: boolean;
  viewer_count: number;
  created_at: string;
}

export function LiveStreamViewer({ streamId }: { streamId: string }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { socket, currentUser } = useCollaboration();
  const rtcClient = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrack = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteVideoTrack = useRef<IRemoteVideoTrack | null>(null);

  useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/live-stream/${streamId}`);
      if (response.ok) {
        const { stream: streamData } = await response.json();
        setStream(streamData);
      }
    };

    const fetchChatMessages = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stream-chat/${streamId}`);
      if (response.ok) {
        const { messages } = await response.json();
        setChatMessages(messages);
      }
    };

    fetchStream();
    fetchChatMessages();

    // Join stream room for real-time updates
    socket.emit('join_stream', { stream_id: streamId, user_id: currentUser?.id });
    socket.on('stream_update', (updatedStream: LiveStream) => {
      setStream(updatedStream);
    });
    socket.on('chat_message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('stream_update');
      socket.off('chat_message');
    };
  }, [streamId, socket, currentUser]);

  const joinStream = async () => {
    if (!stream || !currentUser) return;

    try {
      // Initialize Agora client
      rtcClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Mock token generation (in production, get from backend)
      const token = 'mock_token_' + Date.now();

      await rtcClient.current.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        streamId,
        token,
        currentUser.id
      );

      // Create and publish local tracks (for host)
      if (stream.host_id === currentUser.id) {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localVideoTrack.current = audioTrack; // Store audio track for now
        await rtcClient.current.publish([audioTrack, videoTrack]);
      }

      // Subscribe to remote tracks
      rtcClient.current.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await rtcClient.current!.subscribe(user, mediaType);
        if (mediaType === 'video') {
          remoteVideoTrack.current = user.videoTrack!;
          remoteVideoTrack.current?.play('remote-video');
        }
      });

      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join stream:', error);
    }
  };

  const leaveStream = async () => {
    if (rtcClient.current) {
      await rtcClient.current.leave();
      if (localVideoTrack.current) {
        localVideoTrack.current.close();
      }
      if (remoteVideoTrack.current) {
        remoteVideoTrack.current.stop();
      }
    }
    setIsJoined(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const { data: { session } } = await supabase!.auth.getSession();
    if (!session) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stream-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        stream_id: streamId,
        message: newMessage,
      }),
    });

    if (response.ok) {
      setNewMessage('');
    }
  };

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg">
        <div className="text-cyan-200">Loading cosmic stream...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-6 text-white cosmic-glow">
      <div className="flex gap-6">
        {/* Video Stream */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-cyan-200">{stream.title}</h3>
            <p className="text-gray-300">{stream.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-400">Host: {stream.host_username}</span>
              <span className="text-sm text-gray-400">👁️ {stream.viewer_count} viewers</span>
              {stream.is_live && <span className="text-red-400 text-sm animate-pulse">🔴 LIVE</span>}
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {isJoined ? (
              <div id="remote-video" className="w-full h-full"></div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={joinStream}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🌟 Join Cosmic Stream
                </button>
              </div>
            )}
          </div>

          {isJoined && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={leaveStream}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Leave Stream
              </button>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="w-80 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold mb-4 text-cyan-200">💫 Cosmic Chat</h4>

          <div className="h-96 overflow-y-auto mb-4 space-y-2">
            {chatMessages.map((message) => (
              <div key={message.id} className="bg-gray-700/50 p-2 rounded-lg">
                <div className="text-sm font-semibold text-purple-300">{message.username}</div>
                <div className="text-sm">{message.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Share your cosmic thoughts..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}