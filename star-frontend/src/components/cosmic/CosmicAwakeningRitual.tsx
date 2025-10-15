// star-frontend/src/components/cosmic/CosmicAwakeningRitual.tsx
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface ZodiacSigns {
    western: string;
    chinese: string;
    vedic: string;
    mayan: string;
    galacticTone: number;
}

interface CosmicProfile {
    id: string;
    userId: string;
    zodiacSigns: ZodiacSigns;
    numerology: {
        lifePathNumber: number;
        personalYear?: number;
    };
    archetype?: {
        primary: string;
        secondary?: string;
        mentor: string;
    };
    sigils: any[];
    soundtrack?: {
        elementalPlaylist: string;
        spotifyConnected: boolean;
    };
    onboardingComplete: boolean;
    ritualPhase: string;
}

interface CosmicAwakeningRitualProps {
    onProfileCreated: (profile: CosmicProfile) => void;
}

const ARCHETYPES = {
    seeker: {
        name: 'The Seeker',
        description: 'You quest for hidden knowledge and cosmic truth',
        aura: 'from-blue-500 to-indigo-600',
        mentor: 'the_wandering_sage',
        rituals: ['meditation', 'journaling', 'stargazing']
    },
    guardian: {
        name: 'The Guardian',
        description: 'You protect and nurture the cosmic order',
        aura: 'from-green-500 to-emerald-600',
        mentor: 'the_protective_mother',
        rituals: ['grounding', 'healing', 'community_service']
    },
    rebel: {
        name: 'The Rebel',
        description: 'You challenge boundaries and create new realities',
        aura: 'from-red-500 to-orange-600',
        mentor: 'the_revolutionary_fire',
        rituals: ['activism', 'creativity', 'transformation']
    },
    mystic: {
        name: 'The Mystic',
        description: 'You channel divine wisdom and spiritual insight',
        aura: 'from-purple-500 to-violet-600',
        mentor: 'the_wise_serpent',
        rituals: ['tarot', 'meditation', 'shadow_work']
    }
};

const GALACTIC_TONES = {
    1: { name: 'Magnetic', description: 'Initiates with purpose and attraction', color: '#ff4d4d' },
    2: { name: 'Lunar', description: 'Embraces polarity and challenge', color: '#4d4dff' },
    3: { name: 'Electric', description: 'Activates with dynamic energy', color: '#4dff4d' },
    4: { name: 'Self-Existing', description: 'Defines with form and structure', color: '#ffcc4d' },
    5: { name: 'Overtone', description: 'Empowers with radiant command', color: '#ff4dcc' },
    6: { name: 'Rhythmic', description: 'Balances with equality and rhythm', color: '#4dffff' },
    7: { name: 'Resonant', description: 'Attunes with universal harmony', color: '#cc4dff' },
    8: { name: 'Galactic', description: 'Aligns with integrity and truth', color: '#4dccff' },
    9: { name: 'Solar', description: 'Pulses with intention and realization', color: '#ff994d' },
    10: { name: 'Planetary', description: 'Manifests with perfection', color: '#994dff' },
    11: { name: 'Spectral', description: 'Liberates with dissolution', color: '#ff4d99' },
    12: { name: 'Crystal', description: 'Universalizes with cooperation', color: '#4d99ff' },
    13: { name: 'Cosmic', description: 'Transcends with universal connection', color: '#ffffff' }
};

const CosmicAwakeningRitual: React.FC<CosmicAwakeningRitualProps> = ({ onProfileCreated }) => {
    const [phase, setPhase] = useState<'portal' | 'birth' | 'mirrors' | 'archetype' | 'sigil' | 'profile' | 'resonance' | 'complete'>('portal');
    const [formData, setFormData] = useState({
        birthdate: '',
        birthtime: '',
        email: '',
        username: '',
        password: ''
    });
    const [zodiacSigns, setZodiacSigns] = useState<ZodiacSigns | null>(null);
    const [selectedArchetype, setSelectedArchetype] = useState<string>('');
    const [sigilOptions, setSigilOptions] = useState<any[]>([]);
    const [selectedSigil, setSelectedSigil] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Phase 1: Portal Entry
    const renderPortalPhase = () => (
        <motion.div
            key="portal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center space-y-8"
        >
            <div className="relative">
                <motion.div
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🌌
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    The Cosmic Awakening
                </h1>
                <p className="text-xl text-purple-300 max-w-md mx-auto">
                    "Every soul carries a unique stellar signature, written in the language of time and space.
                    Welcome to your cosmic awakening."
                </p>
            </div>

            <motion.button
                onClick={() => setPhase('birth')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 rounded-full text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Begin Your Journey
            </motion.button>
        </motion.div>
    );

    // Phase 2: Cosmic Birth Moment
    const renderBirthPhase = () => (
        <motion.div
            key="birth"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-purple-400">
                    The Cosmic Birth Moment
                </h2>
                <p className="text-lg text-purple-300">
                    "When did your soul choose to enter this realm?"
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="birthdate" className="block text-sm font-medium text-purple-300 mb-2">
                        Birth Date
                    </label>
                    <input
                        id="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                        className="w-full p-4 bg-purple-900/50 border border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none text-white text-lg"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="birthtime" className="block text-sm font-medium text-purple-300 mb-2">
                        Birth Time (Optional - for precise calculations)
                    </label>
                    <input
                        id="birthtime"
                        type="time"
                        value={formData.birthtime}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthtime: e.target.value }))}
                        className="w-full p-4 bg-purple-900/50 border border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none text-white text-lg"
                    />
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={() => setPhase('portal')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleZodiacCalculation}
                        disabled={!formData.birthdate}
                        className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Calculating...' : 'Reveal My Cosmic Signature'}
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Phase 3: The Five Cosmic Mirrors
    const renderMirrorsPhase = () => (
        <motion.div
            key="mirrors"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-purple-400">
                    The Five Cosmic Mirrors
                </h2>
                <p className="text-lg text-purple-300">
                    "Your soul reflects through five ancient mirrors of wisdom..."
                </p>
            </div>

            {zodiacSigns && (
                <div className="grid md:grid-cols-2 gap-6">
                    <ZodiacMirror
                        title="🔥 The Western Mirror"
                        subtitle="The Greeks saw your essence as..."
                        sign={zodiacSigns.western}
                        description={`You are the ${zodiacSigns.western}, wielding its transformative power.`}
                    />

                    <ZodiacMirror
                        title="🐉 The Eastern Mirror"
                        subtitle="The ancients of the Middle Kingdom recognized your spirit as..."
                        sign={zodiacSigns.chinese}
                        description={`Like the ${zodiacSigns.chinese}, you embody its ancient wisdom.`}
                    />

                    <ZodiacMirror
                        title="🎵 The Galactic Mirror"
                        subtitle="The Maya heard your soul's frequency as..."
                        sign={`Tone ${zodiacSigns.galacticTone}: ${GALACTIC_TONES[zodiacSigns.galacticTone as keyof typeof GALACTIC_TONES]?.name}`}
                        description={GALACTIC_TONES[zodiacSigns.galacticTone as keyof typeof GALACTIC_TONES]?.description || ''}
                    />

                    <ZodiacMirror
                        title="🕉️ The Vedic Mirror"
                        subtitle="The seers of ancient India divined your path as..."
                        sign={zodiacSigns.vedic}
                        description="Your dharma flows through this ancient wisdom."
                    />

                    <div className="md:col-span-2">
                        <ZodiacMirror
                            title="🌙 The Mayan Mirror"
                            subtitle="The keepers of time recognized your day sign as..."
                            sign={zodiacSigns.mayan}
                            description="Your sacred day sign bridges earthly and cosmic time."
                        />
                    </div>
                </div>
            )}

            <div className="flex space-x-4">
                <button
                    onClick={() => setPhase('birth')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={() => setPhase('archetype')}
                    className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                    Continue to Archetypal Alignment
                </button>
            </div>
        </motion.div>
    );

    // Phase 4: Archetypal Alignment
    const renderArchetypePhase = () => (
        <motion.div
            key="archetype"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-purple-400">
                    The Archetypal Awakening
                </h2>
                <p className="text-lg text-purple-300">
                    "Now we weave these cosmic threads into the tapestry of your unique archetype..."
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(ARCHETYPES).map(([key, archetype]) => (
                    <motion.div
                        key={key}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedArchetype === key
                            ? 'border-purple-400 bg-purple-900/50'
                            : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                            }`}
                        onClick={() => setSelectedArchetype(key)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${archetype.aura} mx-auto mb-4 flex items-center justify-center text-2xl`}>
                            ✨
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">{archetype.name}</h3>
                        <p className="text-purple-300 text-center text-sm">{archetype.description}</p>
                    </motion.div>
                ))}
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={() => setPhase('mirrors')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={generateSigils}
                    disabled={!selectedArchetype || isLoading}
                    className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Weaving Your Sigils...' : 'Generate Sacred Sigils'}
                </button>
            </div>
        </motion.div>
    );

    // Phase 5: Sigil Selection
    const renderSigilPhase = () => (
        <motion.div
            key="sigil"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-purple-400">
                    Your Cosmic Sigil Awaits
                </h2>
                <p className="text-lg text-purple-300">
                    "These sacred symbols carry the essence of your {zodiacSigns?.western} {selectedArchetype} spirit..."
                </p>
            </div>

            {sigilOptions.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {sigilOptions.map((sigil, index) => (
                        <motion.div
                            key={sigil.id}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedSigil === sigil.id
                                ? 'border-purple-400 bg-purple-900/50'
                                : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                                }`}
                            onClick={() => setSelectedSigil(sigil.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                                🔮
                            </div>
                            <h3 className="text-lg font-bold text-center mb-2">
                                Sigil Variant {index + 1}
                            </h3>
                            <p className="text-purple-300 text-center text-sm">
                                {sigil.metadata.element.charAt(0).toUpperCase() + sigil.metadata.element.slice(1)} Element
                            </p>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-purple-300">
                    Generating your cosmic sigils...
                </div>
            )}

            <div className="flex space-x-4">
                <button
                    onClick={() => setPhase('archetype')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={() => setPhase('profile')}
                    disabled={!selectedSigil}
                    className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue with Selected Sigil
                </button>
            </div>
        </motion.div>
    );

    // Phase 6: Profile Creation
    const renderProfilePhase = () => (
        <motion.div
            key="profile"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-purple-400">
                    Complete Your Cosmic Identity
                </h2>
                <p className="text-lg text-purple-300">
                    "Final steps to manifest your digital constellation..."
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-purple-300 mb-2">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full p-4 bg-purple-900/50 border border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none text-white"
                        placeholder="Choose your cosmic handle"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-4 bg-purple-900/50 border border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none text-white"
                        placeholder="your.cosmic.address@universe.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full p-4 bg-purple-900/50 border border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none text-white"
                        placeholder="Your secret cosmic key"
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 text-red-300">
                    {error}
                </div>
            )}

            <div className="flex space-x-4">
                <button
                    onClick={() => setPhase('sigil')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleRegistration}
                    disabled={!formData.username || !formData.email || !formData.password || !selectedSigil || isLoading}
                    className="flex-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Your Cosmos...' : 'Enter the Cosmos'}
                </button>
            </div>
        </motion.div>
    );

    const handleZodiacCalculation = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/zodiac-calculator`, {
                birthdate: formData.birthdate,
                birthtime: formData.birthtime
            });

            setZodiacSigns(response.data);
            setPhase('mirrors');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to calculate zodiac signs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateSigils = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/sigils`, {
                user_id: `temp_${Date.now()}`, // Temporary ID for ritual
                zodiac_signs: zodiacSigns,
                archetype: selectedArchetype,
                variations: 3
            });

            setSigilOptions(response.data.sigils);
            setPhase('sigil');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate sigils. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistration = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
                ...formData,
                zodiacSigns,
                archetype: {
                    primary: selectedArchetype,
                    mentor: ARCHETYPES[selectedArchetype as keyof typeof ARCHETYPES]?.mentor,
                    rituals: ARCHETYPES[selectedArchetype as keyof typeof ARCHETYPES]?.rituals
                },
                selectedSigil: sigilOptions.find(s => s.id === selectedSigil)
            });

            onProfileCreated(response.data.profile);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 text-white max-w-4xl w-full border border-purple-500/30"
                layout
            >
                <AnimatePresence mode="wait">
                    {phase === 'portal' && renderPortalPhase()}
                    {phase === 'birth' && renderBirthPhase()}
                    {phase === 'mirrors' && renderMirrorsPhase()}
                    {phase === 'archetype' && renderArchetypePhase()}
                    {phase === 'sigil' && renderSigilPhase()}
                    {phase === 'profile' && renderProfilePhase()}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// Helper component for zodiac mirrors
const ZodiacMirror: React.FC<{
    title: string;
    subtitle: string;
    sign: string;
    description: string;
}> = ({ title, subtitle, sign, description }) => (
    <motion.div
        className="bg-black/30 border border-purple-500/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h3 className="text-lg font-bold text-purple-400 mb-2">{title}</h3>
        <p className="text-sm text-purple-300 mb-3">{subtitle}</p>
        <div className="text-2xl font-bold text-white mb-2">{sign}</div>
        <p className="text-sm text-gray-300">{description}</p>
    </motion.div>
);

export default CosmicAwakeningRitual;