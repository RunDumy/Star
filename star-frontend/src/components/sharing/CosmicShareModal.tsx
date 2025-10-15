import { AnimatePresence, motion } from 'framer-motion';
import {
    Copy,
    Download,
    Facebook,
    Instagram,
    Link,
    MessageCircle,
    Share2,
    Sparkles,
    Twitter,
    Wand2
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ShareableContent {
    id: string;
    type: 'tarot-reading' | 'cosmic-profile' | 'constellation' | 'live-stream' | 'thought-orb';
    title: string;
    description: string;
    data: any;
    image?: string;
    url?: string;
}

interface CosmicShareModalProps {
    content: ShareableContent;
    isOpen: boolean;
    onClose: () => void;
    onShare?: (platform: string, content: ShareableContent) => void;
}

export const CosmicShareModal: React.FC<CosmicShareModalProps> = ({
    content,
    isOpen,
    onClose,
    onShare
}) => {
    const [activeTab, setActiveTab] = useState<'social' | 'link' | 'canvas'>('social');
    const [shareUrl, setShareUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const generateShareUrl = useCallback(() => {
        const baseUrl = window.location.origin;
        const params = new URLSearchParams({
            type: content.type,
            id: content.id,
            t: Date.now().toString()
        });
        setShareUrl(`${baseUrl}/shared/${content.type}?${params}`);
    }, [content.type, content.id]);

    useEffect(() => {
        if (isOpen) {
            generateShareUrl();
        }
    }, [isOpen, generateShareUrl]);

    const generateCosmicCanvas = async () => {
        setIsGenerating(true);
        try {
            // Create a cosmic-themed visual representation of the content
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 800;
            canvas.height = 600;

            // Cosmic background
            const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
            gradient.addColorStop(0, '#1a1a3a');
            gradient.addColorStop(0.5, '#0a0a2a');
            gradient.addColorStop(1, '#000010');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 600);

            // Add stars
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 800;
                const y = Math.random() * 600;
                const size = Math.random() * 2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${Math.random() * 60 + 180}, 70%, ${70 + Math.random() * 30}%)`;
                ctx.fill();
            }

            // Content-specific visualization
            if (content.type === 'tarot-reading') {
                drawTarotVisualization(ctx, content.data);
            } else if (content.type === 'cosmic-profile') {
                drawCosmicProfileVisualization(ctx, content.data);
            }

            // Title and description
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText(content.title, 400, 100);

            ctx.font = '18px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(content.description, 400, 140);

            const imageUrl = canvas.toDataURL('image/png');
            setGeneratedImage(imageUrl);
        } catch (error) {
            console.error('Error generating cosmic canvas:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const drawTarotVisualization = (ctx: CanvasRenderingContext2D, data: any) => {
        // Draw tarot cards in a spread pattern
        const cards = data.cards || [];
        const centerX = 400;
        const centerY = 350;

        cards.slice(0, 5).forEach((card: any, index: number) => {
            const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
            const radius = 120;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Draw card
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);

            // Card background
            const cardGradient = ctx.createLinearGradient(-30, -45, 30, 45);
            cardGradient.addColorStop(0, '#4a90e2');
            cardGradient.addColorStop(1, '#7b68ee');
            ctx.fillStyle = cardGradient;
            ctx.fillRect(-30, -45, 60, 90);

            // Card border
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(-30, -45, 60, 90);

            // Card title
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(card.name?.slice(0, 12) || 'Card', 0, 0);

            ctx.restore();
        });
    };

    const drawCosmicProfileVisualization = (ctx: CanvasRenderingContext2D, data: any) => {
        // Draw zodiac constellation
        const centerX = 400;
        const centerY = 350;
        const radius = 100;

        // Draw zodiac wheel
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();

            // Connect to center
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Center orb
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        centerGradient.addColorStop(0, '#7b68ee');
        centerGradient.addColorStop(1, '#4a90e2');
        ctx.fillStyle = centerGradient;
        ctx.fill();
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            // Show toast notification
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const downloadImage = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.download = `cosmic-${content.type}-${content.id}.png`;
            link.href = generatedImage;
            link.click();
        }
    };

    const shareToSocialPlatform = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(content.title);

        let shareUrlPlatform = '';

        switch (platform) {
            case 'twitter':
                shareUrlPlatform = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=StarPlatform,Cosmic,Tarot`;
                break;
            case 'facebook':
                shareUrlPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&title=${encodedTitle}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct sharing, copy link instead
                copyToClipboard();
                return;
            case 'whatsapp':
                shareUrlPlatform = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
                break;
            default:
                return;
        }

        window.open(shareUrlPlatform, '_blank', 'width=600,height=400');
        onShare?.(platform, content);
    };

    const tabs = [
        { id: 'social', label: 'Social', icon: Share2 },
        { id: 'link', label: 'Link', icon: Link },
        { id: 'canvas', label: 'Cosmic Art', icon: Wand2 }
    ];

    const socialPlatforms = [
        { id: 'twitter', name: 'Twitter', icon: Twitter, colorClass: 'text-blue-400 border-blue-400/30' },
        { id: 'facebook', name: 'Facebook', icon: Facebook, colorClass: 'text-blue-500 border-blue-500/30' },
        { id: 'instagram', name: 'Instagram', icon: Instagram, colorClass: 'text-pink-500 border-pink-500/30' },
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, colorClass: 'text-green-500 border-green-500/30' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                <h2 className="text-2xl font-bold text-white">Share Your Cosmic Experience</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Preview */}
                        <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-2">{content.title}</h3>
                            <p className="text-white/80">{content.description}</p>
                            <div className="mt-2 text-sm text-cyan-400">
                                Type: {content.type.replace('-', ' ').toUpperCase()}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-1 mb-6 bg-black/30 rounded-lg p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${activeTab === tab.id
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === 'social' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {socialPlatforms.map((platform) => (
                                        <button
                                            key={platform.id}
                                            onClick={() => shareToSocialPlatform(platform.id)}
                                            className={`flex items-center space-x-3 p-4 bg-black/30 rounded-lg border hover:border-white/30 transition-all hover:bg-black/50 ${platform.colorClass}`}
                                        >
                                            <platform.icon className="w-6 h-6" />
                                            <span className="text-white font-medium">{platform.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'link' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-black/30 rounded-lg border border-white/10">
                                        <label htmlFor="shareUrl" className="block text-sm font-medium text-white/80 mb-2">
                                            Shareable Link
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="shareUrl"
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                placeholder="Generating shareable link..."
                                                title="Shareable URL for your cosmic content"
                                                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-sm text-white/60">
                                        Share this link to allow others to view your cosmic experience directly.
                                    </div>
                                </div>
                            )}

                            {activeTab === 'canvas' && (
                                <div className="space-y-4">
                                    {!generatedImage ? (
                                        <div className="text-center">
                                            <button
                                                onClick={generateCosmicCanvas}
                                                disabled={isGenerating}
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-colors disabled:opacity-50"
                                            >
                                                <Wand2 className="w-5 h-5" />
                                                <span>{isGenerating ? 'Generating...' : 'Generate Cosmic Art'}</span>
                                            </button>
                                            <p className="mt-3 text-white/60">
                                                Create a beautiful cosmic visualization of your content
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <div className="mx-auto rounded-lg border border-white/20 max-w-full overflow-hidden">
                                                <img
                                                    src={generatedImage}
                                                    alt="Generated cosmic art visualization"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={downloadImage}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download</span>
                                                </button>
                                                <button
                                                    onClick={() => setGeneratedImage(null)}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                                                >
                                                    <Wand2 className="w-4 h-4" />
                                                    <span>Regenerate</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook for easy sharing integration
export const useCosmicShare = () => {
    const [shareModal, setShareModal] = useState<{
        content: ShareableContent | null;
        isOpen: boolean;
    }>({
        content: null,
        isOpen: false
    });

    const openShare = (content: ShareableContent) => {
        setShareModal({ content, isOpen: true });
    };

    const closeShare = () => {
        setShareModal({ content: null, isOpen: false });
    };

    const ShareModal = shareModal.content ? (
        <CosmicShareModal
            content={shareModal.content}
            isOpen={shareModal.isOpen}
            onClose={closeShare}
            onShare={(platform, content) => {
                console.log(`Shared ${content.title} on ${platform}`);
                // Track analytics
            }}
        />
    ) : null;

    return {
        openShare,
        closeShare,
        ShareModal,
        isOpen: shareModal.isOpen
    };
};

export default CosmicShareModal;