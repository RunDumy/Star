import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Dynamically import the Agora UIKit component
const AgoraUIKitLiveStream = dynamic(
  () => import('@/components/cosmic/AgoraUIKitLiveStream').then(mod => ({ default: mod.AgoraUIKitLiveStream })),
  { ssr: false }
);

export default function LiveStreamPage() {
  const router = useRouter();
  const { streamId } = router.query;
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Check if user is the host of this stream
    // This would typically come from your authentication/user context
    const checkHostStatus = async () => {
      // For demo purposes, we'll assume the user is a viewer
      // In a real app, you'd check if the current user created this stream
      setIsHost(false);
    };

    if (streamId) {
      checkHostStatus();
    }
  }, [streamId]);

  if (!streamId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Stream...</h1>
          <p>Please wait while we connect you to the cosmic broadcast.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                🌟 Cosmic Live Stream
              </h1>
              <p className="text-gray-300">
                {isHost ? 'You are broadcasting to the cosmos' : 'Watching the cosmic broadcast'}
              </p>
            </div>

            <AgoraUIKitLiveStream
              streamId={streamId as string}
              isHost={isHost}
            />

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/collaborative-cosmos')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Return to Collaborative Cosmos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}