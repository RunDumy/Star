import UniversalSpaceLayout from '@/components/UniversalSpaceLayout';

export default function UniversalSpaceTest() {
    return (
        <UniversalSpaceLayout currentPage="Universal Space Test">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">
                    🌌 Universal Space Layout Test
                </h1>

                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                    <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
                        Welcome to the Cosmic Shell
                    </h2>

                    <p className="text-white/90 mb-6 leading-relaxed">
                        This page is wrapped in the UniversalSpaceLayout component, which provides:
                    </p>

                    <ul className="text-white/80 space-y-2 mb-8">
                        <li>• Persistent 3D planetary navigation across all pages</li>
                        <li>• Pure black void background with cosmic aesthetics</li>
                        <li>• Planet-to-page routing with mythic transitions</li>
                        <li>• Semi-transparent content overlay</li>
                        <li>• Orbital mechanics and archetypal associations</li>
                    </ul>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-purple-300 mb-3">
                                🪐 Planetary Navigation
                            </h3>
                            <p className="text-sm text-white/70">
                                Click on planets in the 3D space to navigate between different realms of the STAR platform.
                                Each planet represents a different aspect of your cosmic journey.
                            </p>
                        </div>

                        <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500/30">
                            <h3 className="text-lg font-semibold text-blue-300 mb-3">
                                🌟 Mythic Experience
                            </h3>
                            <p className="text-sm text-white/70">
                                Every page becomes a ritualized portal in a living mythic universe.
                                Experience the cosmos as an emotionally intelligent, spiritually resonant journey.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-yellow-400 font-medium">
                            Navigate by clicking planets • Current realm: Universal Space Test
                        </p>
                    </div>
                </div>
            </div>
        </UniversalSpaceLayout>
    );
}