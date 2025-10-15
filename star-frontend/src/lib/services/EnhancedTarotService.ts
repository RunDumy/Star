// Enhanced Tarot Service
// Handles all API interactions with the enhanced tarot backend

interface TarotCard {
    id: string;
    name: string;
    suit: string;
    element: string;
    image_url: string;
    upright_meaning: string;
    reversed_meaning: string;
    is_reversed: boolean;
    cosmic_influences?: {
        planetary_ruler: string;
        zodiac_association: string;
        numerological_value: number;
        chakra_connection: string;
    };
    elemental_energy?: {
        fire: number;
        water: number;
        air: number;
        earth: number;
    };
}

interface TarotSpread {
    id: string;
    name: string;
    description: string;
    positions: string[];
    card_count: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface TarotReading {
    reading_id: string;
    spread_type: string;
    spread_name: string;
    cards: TarotCard[];
    positions: string[];
    ai_interpretation: {
        summary: string;
        detailed_analysis: string;
        key_themes: string[];
        guidance: string;
        timeline: string;
        numerology_connection: string;
    };
    cosmic_timing: {
        optimal_actions: string[];
        planetary_advice: string;
        elemental_balance: string;
    };
    energy_flow: {
        dominant_element: string;
        energy_level: number;
        flow_direction: string;
    };
    numerology_guidance: string;
    follow_up_recommendations: string[];
    created_at: string;
}

interface CosmicInfluences {
    cosmic_influences: {
        current_transits: string[];
        personal_resonance: number;
        energy_level: string;
    };
    planetary_influences: any[];
    optimal_reading_times: string[];
    moon_phase: {
        phase_name: string;
        influence: string;
    };
    user_zodiac: string;
}

class EnhancedTarotService {
    private baseUrl: string;
    private token: string | null;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        this.token = null;

        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Enhanced Tarot API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Get all available enhanced tarot spreads
    async getAvailableSpreads(): Promise<{ spreads: Record<string, TarotSpread>; cosmic_timing: any }> {
        return this.makeRequest('/api/v1/tarot/enhanced-spreads');
    }

    // Perform enhanced tarot reading
    async performTarotReading(request: {
        spread_type: string;
        question: string;
        zodiac_context?: {
            user_zodiac?: string;
            numerology_data?: any;
        };
    }): Promise<TarotReading> {
        return this.makeRequest('/api/v1/tarot/enhanced-draw', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Get specific tarot reading by ID
    async getTarotReading(readingId: string): Promise<TarotReading> {
        const response = await this.makeRequest(`/api/v1/tarot/readings/${readingId}`);
        return response.reading;
    }

    // Get user's tarot reading history
    async getTarotReadings(limit = 20, offset = 0): Promise<{ readings: TarotReading[]; has_more: boolean }> {
        return this.makeRequest(`/api/v1/tarot/readings?limit=${limit}&offset=${offset}`);
    }

    // Get comprehensive card meanings
    async getCardMeanings(cardName: string): Promise<{
        card: TarotCard;
        zodiac_interpretation: string;
        elemental_correspondences: any;
        timing_information: any;
    }> {
        return this.makeRequest(`/api/v1/tarot/card-meanings?card_name=${encodeURIComponent(cardName)}`);
    }

    // Get current cosmic influences for tarot readings
    async getCosmicInfluences(): Promise<CosmicInfluences> {
        return this.makeRequest('/api/v1/tarot/cosmic-influences');
    }

    // Get daily tarot guidance
    async getDailyGuidance(): Promise<{ daily_guidance: any; is_cached: boolean }> {
        return this.makeRequest('/api/v1/tarot/daily-guidance');
    }

    // Share a tarot reading
    async shareReading(request: {
        reading_id: string;
        share_type: 'feed' | 'profile';
        message?: string;
    }): Promise<{ shared_post_id: string; message: string }> {
        return this.makeRequest('/api/v1/tarot/share-reading', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Add personal reflection to a reading
    async addReflection(request: {
        reading_id: string;
        reflection: string;
        tags?: string[];
    }): Promise<{ reflection_id: string; message: string }> {
        return this.makeRequest('/api/v1/tarot/reflection', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Get tarot reading statistics
    async getTarotStatistics(): Promise<{ statistics: any }> {
        return this.makeRequest('/api/v1/tarot/statistics');
    }

    // Health check for enhanced tarot system
    async healthCheck(): Promise<{
        status: string;
        engine_loaded: boolean;
        total_cards: number;
        available_spreads: number;
    }> {
        return this.makeRequest('/api/v1/tarot/health');
    }

    // Utility method to update authentication token
    updateToken(token: string | null): void {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    // Generate preview for tarot reading sharing
    generateReadingPreview(reading: TarotReading): {
        title: string;
        description: string;
        keyCard: TarotCard | null;
        themes: string[];
    } {
        const keyCard = reading.cards?.[0] || null;
        const themes = reading.ai_interpretation?.key_themes || [];

        return {
            title: `${reading.spread_name} Reading`,
            description: reading.ai_interpretation?.summary?.substring(0, 150) + '...' || 'Cosmic guidance revealed',
            keyCard,
            themes: themes.slice(0, 3)
        };
    }

    // Calculate reading cosmic energy score
    calculateCosmicEnergy(reading: TarotReading): number {
        if (!reading.energy_flow) return 50;

        const { energy_level } = reading.energy_flow;
        return Math.round(energy_level);
    }

    // Get elemental balance from cards
    getElementalBalance(cards: TarotCard[]): Record<string, number> {
        const elements = { fire: 0, water: 0, air: 0, earth: 0 };

        cards.forEach(card => {
            if (card.elemental_energy) {
                Object.entries(card.elemental_energy).forEach(([element, value]) => {
                    elements[element as keyof typeof elements] += value;
                });
            } else {
                // Basic element mapping if detailed data not available
                const elementMap: Record<string, keyof typeof elements> = {
                    'Fire': 'fire',
                    'Water': 'water',
                    'Air': 'air',
                    'Earth': 'earth',
                    'Wands': 'fire',
                    'Cups': 'water',
                    'Swords': 'air',
                    'Pentacles': 'earth'
                };

                const cardElement = elementMap[card.element] || elementMap[card.suit];
                if (cardElement) {
                    elements[cardElement] += 25; // Default 25% per card
                }
            }
        });

        // Normalize to percentages
        const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            Object.keys(elements).forEach(element => {
                elements[element as keyof typeof elements] = Math.round((elements[element as keyof typeof elements] / total) * 100);
            });
        }

        return elements;
    }

    // Format reading date for display
    formatReadingDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `${Math.round(diffInHours)} hours ago`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.round(diffInHours / 24)} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Get spread difficulty color
    getSpreadDifficultyColor(difficulty: TarotSpread['difficulty']): string {
        switch (difficulty) {
            case 'beginner': return 'green';
            case 'intermediate': return 'yellow';
            case 'advanced': return 'red';
            default: return 'gray';
        }
    }

    // Generate cosmic timing recommendation
    generateTimingRecommendation(cosmicInfluences: CosmicInfluences): string {
        const { moon_phase, optimal_reading_times, cosmic_influences } = cosmicInfluences;

        if (optimal_reading_times?.length > 0) {
            return `Best time for readings: ${optimal_reading_times[0]}. ` +
                `Current moon phase (${moon_phase?.phase_name || 'Unknown'}) ` +
                `brings ${cosmic_influences?.energy_level || 'balanced'} energy.`;
        }

        return 'The cosmic energies are aligned for meaningful readings at this time.';
    }
}

// Create singleton instance
export const enhancedTarotService = new EnhancedTarotService();

// Export types for use in components
export type {
    CosmicInfluences, TarotCard, TarotReading, TarotSpread
};

export default EnhancedTarotService;