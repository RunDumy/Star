import { motion } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';

interface SigilData {
    id: string;
    userId: string;
    zodiacBase: string;
    archetypeModifier: string;
    points: number[][];
    strokes: number[][][];
    metadata: {
        zodiac_sign: string;
        archetype: string;
        element: string;
        generated_at: string;
    };
    imageUrl: string;
    createdAt: string;
}

const SigilGenerator: React.FC = () => {
    const [sigil, setSigil] = useState<SigilData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateSigil = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please log in to generate a sigil');
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sigils/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }); const data = await response.json();

            if (data.status === 'success') {
                setSigil(data.sigil);
            } else {
                setError(data.message || 'Failed to generate sigil');
            }
        } catch (error) {
            console.error('Error generating sigil:', error);
            setError('Failed to generate sigil. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSigilOnCanvas = useCallback(() => {
        if (!sigil || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas with cosmic background
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set drawing properties for sigil
        ctx.strokeStyle = '#fef3c7'; // amber-100
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw the geometric sigil using points and strokes
        if (sigil.strokes && sigil.strokes.length > 0) {
            sigil.strokes.forEach((stroke: number[][]) => {
                if (stroke.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(stroke[0][0], stroke[0][1]);
                    for (let i = 1; i < stroke.length; i++) {
                        ctx.lineTo(stroke[i][0], stroke[i][1]);
                    }
                    ctx.stroke();
                }
            });
        }

        // Draw individual points if no strokes
        if (sigil.points && sigil.points.length > 0 && (!sigil.strokes || sigil.strokes.length === 0)) {
            ctx.fillStyle = '#fef3c7';
            sigil.points.forEach((point: number[]) => {
                ctx.beginPath();
                ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Add sigil information text
        ctx.fillStyle = '#fef3c7';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${sigil.metadata.zodiac_sign} - ${sigil.metadata.archetype}`, canvas.width / 2, canvas.height - 40);

        // Add element symbol
        ctx.font = '12px serif';
        ctx.fillText(`Element: ${sigil.metadata.element}`, canvas.width / 2, canvas.height - 20);
    }, [sigil]);

    React.useEffect(() => {
        if (sigil) {
            renderSigilOnCanvas();
        }
    }, [sigil, renderSigilOnCanvas]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sigil-generator p-6 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-amber-500/20"
        >
            <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">
                Cosmic Sigil Generator
            </h2>

            <div className="flex flex-col items-center space-y-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateSigil}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Generating...' : 'Generate Sigil'}
                </motion.button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20"
                    >
                        {error}
                    </motion.div>
                )}

                {sigil && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="sigil-display flex flex-col items-center space-y-4"
                    >
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={500}
                            className="border border-amber-500/30 rounded-lg shadow-2xl bg-slate-800"
                        />

                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-amber-300 mb-2">
                                {sigil.metadata.zodiac_sign} Sigil
                            </h3>
                            <p className="text-slate-300">
                                Archetype: {sigil.metadata.archetype}
                            </p>
                            <p className="text-slate-300">
                                Element: {sigil.metadata.element}
                            </p>
                            <p className="text-slate-400 text-sm">
                                Created: {new Date(sigil.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default SigilGenerator;
