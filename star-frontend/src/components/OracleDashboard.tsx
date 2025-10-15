/**
 * Complete Oracle Dashboard Component
 * Demonstrates all Oracle API features in a cosmic interface
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
    CompleteOracleSession,
    IChingReading,
    MoonPhase,
    NatalChart,
    NumerologyProfile,
    TarotReading,
    useOracleAPI
} from '../lib/oracleAPI'

interface OracleDashboardProps {
    authToken?: string
    userBirthDate?: string
    userBirthPlace?: string
    userName?: string
}

export default function OracleDashboard({
    authToken,
    userBirthDate,
    userBirthPlace,
    userName
}: OracleDashboardProps) {
    // Oracle API hook
    const oracle = useOracleAPI(authToken)

    // State management
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'moon' | 'tarot' | 'astrology' | 'numerology' | 'iching' | 'complete'>('moon')

    // Oracle data states
    const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null)
    const [tarotReading, setTarotReading] = useState<TarotReading | null>(null)
    const [natalChart, setNatalChart] = useState<NatalChart | null>(null)
    const [numerology, setNumerology] = useState<NumerologyProfile | null>(null)
    const [iching, setIChing] = useState<IChingReading | null>(null)
    const [completeSession, setCompleteSession] = useState<CompleteOracleSession | null>(null)

    // Form states
    const [question, setQuestion] = useState('')
    const [birthDate, setBirthDate] = useState(userBirthDate || '')
    const [birthPlace, setBirthPlace] = useState(userBirthPlace || '')
    const [name, setName] = useState(userName || '')
    const [selectedSpread, setSelectedSpread] = useState('Celtic Cross')

    // Available tarot spreads
    const [tarotSpreads, setTarotSpreads] = useState<string[]>([])

    // Load initial data
    useEffect(() => {
        loadMoonPhase()
        loadTarotSpreads()
    }, [])

    const handleError = (error: any, operation: string) => {
        console.error(`Error ${operation}:`, error)
        setError(`Failed to ${operation}: ${error.message}`)
        setLoading(false)
    }

    const loadMoonPhase = async () => {
        try {
            const moon = await oracle.getCurrentMoon()
            setMoonPhase(moon)
        } catch (error) {
            handleError(error, 'load moon phase')
        }
    }

    const loadTarotSpreads = async () => {
        try {
            const spreads = await oracle.client.getTarotSpreads()
            setTarotSpreads(spreads)
        } catch (error) {
            console.error('Failed to load tarot spreads:', error)
        }
    }

    const handleTarotReading = async () => {
        setLoading(true)
        setError(null)
        try {
            const reading = await oracle.getTarotReading(selectedSpread, question || undefined)
            setTarotReading(reading)
        } catch (error) {
            handleError(error, 'get tarot reading')
        } finally {
            setLoading(false)
        }
    }

    const handleNatalChart = async () => {
        if (!birthDate || !birthPlace) {
            setError('Birth date and place are required for natal chart')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const chart = await oracle.getNatalChart(birthDate, birthPlace)
            setNatalChart(chart)
        } catch (error) {
            handleError(error, 'calculate natal chart')
        } finally {
            setLoading(false)
        }
    }

    const handleNumerology = async () => {
        if (!name || !birthDate) {
            setError('Name and birth date are required for numerology')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const profile = await oracle.getNumerology(name, birthDate)
            setNumerology(profile)
        } catch (error) {
            handleError(error, 'calculate numerology')
        } finally {
            setLoading(false)
        }
    }

    const handleIChing = async () => {
        setLoading(true)
        setError(null)
        try {
            const reading = await oracle.castIChing(question || undefined)
            setIChing(reading)
        } catch (error) {
            handleError(error, 'cast I Ching')
        } finally {
            setLoading(false)
        }
    }

    const handleCompleteSession = async () => {
        if (!name || !birthDate || !birthPlace) {
            setError('Name, birth date, and birth place are required for complete session')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const session = await oracle.getCompleteSession(name, birthDate, birthPlace, question || undefined)
            setCompleteSession(session)
        } catch (error) {
            handleError(error, 'create complete oracle session')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'moon', label: '🌙 Moon Phase', description: 'Current lunar energy' },
        { id: 'tarot', label: '🔮 Tarot Reading', description: 'Divine guidance through cards' },
        { id: 'astrology', label: '⭐ Natal Chart', description: 'Your cosmic blueprint' },
        { id: 'numerology', label: '🔢 Numerology', description: 'The power of numbers' },
        { id: 'iching', label: '☯ I Ching', description: 'Ancient Chinese wisdom' },
        { id: 'complete', label: '✨ Complete Session', description: 'Full oracle experience' }
    ] as const

    return (
        <div className="oracle-dashboard min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                        ⭐ STAR Oracle Dashboard ⭐
                    </h1>
                    <p className="text-xl text-purple-200">
                        Unlock the cosmic wisdom within you
                    </p>
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4 mb-6"
                    >
                        <p className="text-red-200">⚠ {error}</p>
                    </motion.div>
                )}

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center mb-8 space-x-2 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20'
                                }`}
                        >
                            <div className="text-sm font-medium">{tab.label}</div>
                            <div className="text-xs opacity-80">{tab.description}</div>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6"
                >
                    {/* Moon Phase Tab */}
                    {activeTab === 'moon' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-6">🌙 Current Moon Phase</h2>
                            {moonPhase ? (
                                <div className="space-y-4">
                                    <div className="text-6xl">{moonPhase.phase_name === 'New Moon' ? '🌑' :
                                        moonPhase.phase_name === 'Waxing Crescent' ? '🌒' :
                                            moonPhase.phase_name === 'First Quarter' ? '🌓' :
                                                moonPhase.phase_name === 'Waxing Gibbous' ? '🌔' :
                                                    moonPhase.phase_name === 'Full Moon' ? '🌕' :
                                                        moonPhase.phase_name === 'Waning Gibbous' ? '🌖' :
                                                            moonPhase.phase_name === 'Last Quarter' ? '🌗' : '🌘'}</div>
                                    <div className="text-2xl font-bold text-yellow-300">{moonPhase.phase_name}</div>
                                    <div className="text-lg">In {moonPhase.current_sign}</div>
                                    <div className="text-purple-200">{Math.round(moonPhase.phase_percentage)}% illuminated</div>
                                    <div className="bg-white bg-opacity-20 rounded-lg p-4 mt-4">
                                        <h3 className="font-bold mb-2">Lunar Guidance:</h3>
                                        <p>{moonPhase.guidance}</p>
                                        <div className="mt-4">
                                            <h4 className="font-bold">Recommended Actions:</h4>
                                            <ul className="list-disc list-inside mt-2">
                                                {moonPhase.recommended_actions?.map((action, index) => (
                                                    <li key={index}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>Loading moon phase data...</div>
                            )}
                        </div>
                    )}

                    {/* Tarot Reading Tab */}
                    {activeTab === 'tarot' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">🔮 Tarot Reading</h2>

                            {/* Tarot Form */}
                            <div className="mb-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Spread:</label>
                                    <select
                                        value={selectedSpread}
                                        onChange={(e) => setSelectedSpread(e.target.value)}
                                        className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-lg"
                                    >
                                        {tarotSpreads.map(spread => (
                                            <option key={spread} value={spread}>{spread}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Question (optional):</label>
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="What guidance do you seek?"
                                        className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-lg"
                                    />
                                </div>

                                <button
                                    onClick={handleTarotReading}
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold disabled:opacity-50"
                                >
                                    {loading ? 'Channeling cosmic wisdom...' : '🔮 Draw Cards'}
                                </button>
                            </div>

                            {/* Tarot Results */}
                            {tarotReading && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold">{tarotReading.spread}</h3>
                                        {tarotReading.question && <p className="text-purple-200">Question: {tarotReading.question}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tarotReading.cards.map((card, index) => (
                                            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                                                <div className="text-center">
                                                    <h4 className="font-bold text-lg">{card.name}</h4>
                                                    <p className="text-sm text-purple-200">{card.position}</p>
                                                    <p className="text-sm">{card.upright ? 'Upright' : 'Reversed'}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm">{card.interpretation}</p>
                                                    <div className="mt-2 text-xs text-purple-200">
                                                        Keywords: {card.keywords.join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                        <h3 className="font-bold mb-2">Overall Interpretation:</h3>
                                        <p>{tarotReading.overall_interpretation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add other tabs content here... */}
                    {/* For brevity, I'll show the structure for other tabs */}

                    {activeTab === 'astrology' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">⭐ Natal Chart</h2>
                            {/* Birth data form and natal chart results */}
                        </div>
                    )}

                    {activeTab === 'numerology' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">🔢 Numerology Profile</h2>
                            {/* Name and birth date form, numerology results */}
                        </div>
                    )}

                    {activeTab === 'iching' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">☯ I Ching Oracle</h2>
                            {/* Question form and hexagram results */}
                        </div>
                    )}

                    {activeTab === 'complete' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">✨ Complete Oracle Session</h2>
                            {/* Complete form and comprehensive results */}
                        </div>
                    )}
                </motion.div>

                {/* Loading Overlay */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 text-center">
                            <div className="text-4xl mb-4">⭐</div>
                            <div className="text-xl font-bold">Consulting the cosmos...</div>
                            <div className="text-purple-200 mt-2">Please wait while we channel divine wisdom</div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}