// Comprehensive numerology service for STAR platform
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types for numerology responses
export interface NumerologyProfile {
    core_numbers: {
        life_path: {
            number: number;
            description: string;
            traits: string[];
            challenges: string[];
        };
        destiny: {
            number: number;
            description: string;
            meaning: string;
        };
        soul_urge: {
            number: number;
            description: string;
            desires: string[];
        };
        personality: {
            number: number;
            description: string;
            impression: string;
        };
    };
    current_cycles: {
        personal_year: PersonalYear;
        personal_month: PersonalMonth;
    };
    elemental_profile: {
        primary_element: string;
        secondary_element: string;
        element_balance: Record<string, number>;
    };
    chakra_profile: {
        primary_chakras: Array<[string, number]>;
        activation_sequence: string[];
    };
    crystal_profile: {
        primary_crystals: string[];
        secondary_crystals: string[];
        daily_carry_recommendation: string;
    };
}

export interface PersonalYear {
    number: number;
    theme_data: {
        theme: string;
        focus: string;
        opportunities: string;
        challenges: string;
        advice: string;
    };
}

export interface PersonalMonth {
    number: number;
    monthly_focus: {
        focus: string;
        energy_level: string;
        recommended_actions: string[];
    };
}

export interface CosmicAlignment {
    zodiac_element: string;
    numerology_element: string;
    alignment_score: number;
    alignment_description: string;
    integration_advice: string;
}

export interface NumerologyCompatibility {
    user_profile: {
        name: string;
        core_numbers: NumerologyProfile['core_numbers'];
    };
    other_profile: {
        name: string;
        core_numbers: NumerologyProfile['core_numbers'];
    };
    compatibility_breakdown: Record<string, {
        compatibility_score: number;
        description: string;
        advice: string;
    }>;
    overall_compatibility: {
        score: number;
        level: string;
        description: string;
        strongest_area: string;
        growth_area: string;
    };
    relationship_insights: {
        relationship_strengths: string[];
        growth_opportunities: string[];
        communication_style: string;
        conflict_resolution: string;
        shared_goals: string[];
        individual_growth: string[];
    };
}

export interface FeedRecommendations {
    current_cycles: {
        personal_year: PersonalYear;
        personal_month: PersonalMonth;
    };
    feed_recommendations: {
        content_types: string[];
        hashtags: string[];
        post_themes: string[];
        engagement_timing: string;
        collaboration_suggestions: string[];
    };
    compatible_users: Array<{
        username: string;
        personal_year: number;
        compatibility_score: number;
    }>;
    daily_insight: {
        daily_number: number;
        insight: string;
        recommended_action: string;
        cosmic_timing: string;
    };
    cosmic_timing: {
        year_timing: {
            best_for: string;
            avoid: string;
        };
        month_timing: {
            best_for: string;
            avoid: string;
        };
        integration_advice: string;
    };
}

export interface PersonalizedRecommendations {
    immediate_actions: string[];
    weekly_focus: string[];
    monthly_themes: string[];
    yearly_goals: string[];
    spiritual_practices: string[];
    crystal_work: string[];
}

// Service class for all numerology operations
export class NumerologyService {
    private static getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Get comprehensive numerology profile
    static async getComprehensiveProfile(
        fullName?: string,
        birthDate?: string
    ): Promise<{
        cosmic_profile: NumerologyProfile;
        user_context: {
            user_id: string;
            zodiac_sign: string;
            profile_completion: number;
        };
        personalized_recommendations: PersonalizedRecommendations;
        next_steps: string[];
    }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/numerology/comprehensive`,
                { full_name: fullName, birth_date: birthDate },
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error getting comprehensive numerology profile:', error);
            throw new Error(error.response?.data?.error || 'Failed to get numerology profile');
        }
    }

    // Get personal year analysis
    static async getPersonalYearAnalysis(year?: number): Promise<{
        personal_year: PersonalYear;
        personal_month: PersonalMonth;
        yearly_forecast: any;
        actionable_insights: {
            current_focus: string;
            key_opportunities: string[];
            potential_challenges: string[];
            best_days: string[];
            avoid_dates: string[];
            zodiac_numerology_synergy: string;
        };
        cosmic_alignment: CosmicAlignment;
    }> {
        try {
            const params = year ? { year: year.toString() } : {};
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/numerology/personal-year`,
                {
                    headers: this.getAuthHeaders(),
                    params
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error getting personal year analysis:', error);
            throw new Error(error.response?.data?.error || 'Failed to get personal year analysis');
        }
    }

    // Calculate numerology compatibility
    static async calculateCompatibility(
        otherUserId?: string,
        otherName?: string,
        otherBirthDate?: string
    ): Promise<NumerologyCompatibility> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/numerology/compatibility`,
                {
                    other_user_id: otherUserId,
                    other_name: otherName,
                    other_birth_date: otherBirthDate
                },
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error calculating numerology compatibility:', error);
            throw new Error(error.response?.data?.error || 'Failed to calculate compatibility');
        }
    }

    // Get numerology-based feed recommendations
    static async getFeedRecommendations(): Promise<FeedRecommendations> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/numerology/feed-recommendations`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error getting numerology feed recommendations:', error);
            throw new Error(error.response?.data?.error || 'Failed to get feed recommendations');
        }
    }

    // Get daily numerology insight for dashboard
    static async getDailyInsight(): Promise<{
        daily_number: number;
        insight: string;
        recommended_action: string;
        cosmic_timing: string;
    }> {
        try {
            const feedRecs = await this.getFeedRecommendations();
            return feedRecs.daily_insight;
        } catch (error: any) {
            console.error('Error getting daily insight:', error);
            throw new Error('Failed to get daily insight');
        }
    }

    // Get numerology-based content suggestions for posting
    static async getContentSuggestions(): Promise<{
        content_types: string[];
        hashtags: string[];
        post_themes: string[];
        engagement_timing: string;
    }> {
        try {
            const feedRecs = await this.getFeedRecommendations();
            return feedRecs.feed_recommendations;
        } catch (error: any) {
            console.error('Error getting content suggestions:', error);
            throw new Error('Failed to get content suggestions');
        }
    }

    // Get compatible users for networking
    static async getCompatibleUsers(): Promise<Array<{
        username: string;
        personal_year: number;
        compatibility_score: number;
    }>> {
        try {
            const feedRecs = await this.getFeedRecommendations();
            return feedRecs.compatible_users;
        } catch (error: any) {
            console.error('Error getting compatible users:', error);
            throw new Error('Failed to get compatible users');
        }
    }

    // Get cosmic timing recommendations
    static async getCosmicTiming(): Promise<{
        year_timing: { best_for: string; avoid: string };
        month_timing: { best_for: string; avoid: string };
        integration_advice: string;
    }> {
        try {
            const feedRecs = await this.getFeedRecommendations();
            return feedRecs.cosmic_timing;
        } catch (error: any) {
            console.error('Error getting cosmic timing:', error);
            throw new Error('Failed to get cosmic timing');
        }
    }

    // Calculate Life Path Number (client-side utility)
    static calculateLifePathNumber(birthDate: Date): number {
        const day = birthDate.getDate();
        const month = birthDate.getMonth() + 1;
        const year = birthDate.getFullYear();

        // Add all digits until single digit (except master numbers 11, 22, 33)
        let sum = day + month + year;

        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            const digits = sum.toString().split('').map(Number);
            sum = digits.reduce((acc, digit) => acc + digit, 0);
        }

        return sum;
    }

    // Calculate Destiny Number from name (client-side utility)
    static calculateDestinyNumber(fullName: string): number {
        const letterValues: Record<string, number> = {
            A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
            J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
            S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
        };

        let sum = 0;
        const cleanName = fullName.replace(/[^A-Za-z]/g, '').toUpperCase();

        for (const letter of cleanName) {
            sum += letterValues[letter] || 0;
        }

        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            const digits = sum.toString().split('').map(Number);
            sum = digits.reduce((acc, digit) => acc + digit, 0);
        }

        return sum;
    }

    // Get numerology element mapping
    static getNumerologyElement(number: number): string {
        const elementMap: Record<number, string> = {
            1: 'Fire', 2: 'Water', 3: 'Air', 4: 'Earth', 5: 'Air',
            6: 'Earth', 7: 'Water', 8: 'Fire', 9: 'Fire',
            11: 'Air', 22: 'Earth', 33: 'Fire'
        };

        return elementMap[number] || 'Unknown';
    }

    // Get numerology description (client-side utility)
    static getNumerologyDescription(number: number, type: 'life_path' | 'destiny' | 'soul_urge' | 'personality'): string {
        const descriptions: Record<string, Record<number, string>> = {
            life_path: {
                1: "The Leader - Independent, pioneering, and innovative",
                2: "The Collaborator - Cooperative, diplomatic, and peace-loving",
                3: "The Creative - Artistic, expressive, and optimistic",
                4: "The Builder - Practical, reliable, and hardworking",
                5: "The Adventurer - Freedom-loving, curious, and versatile",
                6: "The Nurturer - Caring, responsible, and family-oriented",
                7: "The Seeker - Spiritual, analytical, and introspective",
                8: "The Achiever - Ambitious, business-minded, and material-focused",
                9: "The Humanitarian - Compassionate, generous, and globally-minded",
                11: "The Intuitive - Psychic, inspirational, and spiritually aware",
                22: "The Master Builder - Practical visionary with global impact",
                33: "The Master Teacher - Spiritually gifted healer and teacher"
            },
            destiny: {
                1: "Your mission is to lead and pioneer new paths",
                2: "You're meant to bring harmony and cooperation to others",
                3: "Your purpose is creative expression and inspiring joy",
                4: "You're here to build stable foundations and systems",
                5: "Your path involves promoting freedom and progressive change",
                6: "You're meant to nurture and heal your community",
                7: "Your mission is to seek truth and share spiritual wisdom",
                8: "You're destined to achieve material success and empower others",
                9: "Your purpose is humanitarian service and global healing",
                11: "You're meant to inspire and uplift humanity's consciousness",
                22: "Your mission is to manifest grand visions into reality",
                33: "You're here to teach universal love and compassion"
            },
            soul_urge: {
                1: "You crave independence and leadership opportunities",
                2: "You desire harmony, partnership, and peaceful cooperation",
                3: "You yearn for creative expression and social connection",
                4: "You need security, order, and practical accomplishment",
                5: "You crave freedom, adventure, and varied experiences",
                6: "You desire to nurture, heal, and create beauty in the world",
                7: "You seek spiritual understanding and inner wisdom",
                8: "You want material success and recognition for achievements",
                9: "You desire to serve humanity and make a global impact",
                11: "You crave spiritual illumination and inspiring others",
                22: "You want to build something of lasting universal significance",
                33: "You desire to heal and teach through unconditional love"
            },
            personality: {
                1: "Others see you as confident, independent, and pioneering",
                2: "You appear gentle, diplomatic, and naturally cooperative",
                3: "People perceive you as creative, charming, and optimistic",
                4: "Others view you as reliable, practical, and trustworthy",
                5: "You seem adventurous, dynamic, and freedom-loving",
                6: "People see you as caring, responsible, and nurturing",
                7: "You appear mysterious, wise, and spiritually inclined",
                8: "Others perceive you as successful, authoritative, and business-minded",
                9: "People see you as compassionate, generous, and globally aware",
                11: "You appear intuitive, inspirational, and spiritually gifted",
                22: "Others view you as a practical visionary with grand plans",
                33: "People perceive you as a wise teacher and natural healer"
            }
        };

        return descriptions[type]?.[number] || `Numerology number ${number} - exploring your cosmic significance`;
    }

    // Format numerology data for display
    static formatNumerologyData(profile: NumerologyProfile) {
        return {
            lifePathSummary: `Life Path ${profile.core_numbers.life_path.number}: ${this.getNumerologyDescription(profile.core_numbers.life_path.number, 'life_path')}`,
            currentYear: `Personal Year ${profile.current_cycles.personal_year.number}: ${profile.current_cycles.personal_year.theme_data.theme}`,
            currentMonth: `Personal Month ${profile.current_cycles.personal_month.number}: ${profile.current_cycles.personal_month.monthly_focus.focus}`,
            primaryElement: profile.elemental_profile.primary_element,
            primaryChakra: profile.chakra_profile.primary_chakras[0]?.[0] || 'Unknown',
            dailyCrystal: profile.crystal_profile.daily_carry_recommendation
        };
    }
}

export default NumerologyService;