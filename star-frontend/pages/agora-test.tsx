import UniversalSpaceLayout from '@/components/UniversalSpaceLayout';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import to avoid SSR issues
const AgoraUIKitLiveStream = dynamic(
  () => import('@/components/cosmic/AgoraUIKitLiveStream').then(mod => ({ default: mod.AgoraUIKitLiveStream })),
  { ssr: false }
);

export default function AgoraTestPage() {
  return (
    <UniversalSpaceLayout currentPage="Agora Test Realm">
      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🌟 AgoraRTC Test Page
          </h1>

          <div className="text-white mb-6">
            <h2 className="text-xl font-semibold mb-4">Agora Configuration Status:</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_AGORA_APP_ID ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL ? '✅ Configured' : '❌ Missing'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Live Stream:</h2>
            <p className="text-gray-300 mb-4">
              To test the Agora integration, first create a live stream in the Collaborative Cosmos page,
              then use the stream ID below to join the stream.
            </p>

            <div className="bg-gray-800 p-4 rounded-lg">
              <label htmlFor="streamId" className="block text-white mb-2">Enter Stream ID:</label>
              <input
                type="text"
                id="streamId"
                placeholder="e.g., abc123-def456-ghi789"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
              />
              <button
                onClick={() => {
                  const streamId = (document.getElementById('streamId') as HTMLInputElement)?.value;
                  if (streamId) {
                    globalThis.location.href = `/live-stream/${streamId}`;
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Join Stream
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/collaborative-cosmos"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Collaborative Cosmos
            </Link>
          </div>
        </div>
      </div>
    </UniversalSpaceLayout>
  );
}