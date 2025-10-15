/**
 * Oracle API Client for STAR Frontend
 * Provides easy access to Oracle divination features
 */

import axios, { AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ORACLE_API_URL = `${API_BASE_URL}/api/v1/oracle`

// Types for Oracle API responses
export interface OracleHealthResponse {
    status: string
    timestamp: string
    engine_status: string
    capabilities: string[]
}

export interface TarotCard {
    name: string
    suit: string
    number: number | null
    upright: boolean
    position: string
    keywords: string[]
    interpretation: string
    astrological_correspondence: string
    kabbalistic_correspondence: string
}

export interface TarotReading {
    spread: string
    question: string | null
    cards: TarotCard[]
    overall_interpretation: string
    timestamp: string
    reading_id: string
}

export interface MoonPhase {
    phase_name: string
    phase_percentage: number
    next_new_moon: string
    next_full_moon: string
    current_sign: string
    guidance: string
    energy_type: string
    recommended_actions: string[]
}

export interface NatalChart {
    sun_sign: string
    moon_sign: string
    rising_sign: string
    houses: any[]
    aspects: any[]
    interpretation: string
    birth_data: {
        date: string
        place: string
        coordinates: [number, number]
    }
}

export interface NumerologyProfile {
    life_path: number
    expression: number
    soul_urge: number
    personality: number
    birth_day: number
    karmic_debt_numbers: number[]
    pinnacles: number[]
    challenges: number[]
    personal_years: any[]
    interpretation: string
}

export interface IChingReading {
    question: string | null
    hexagram_number: number
    hexagram_name: string
    chinese_name: string
    trigrams: {
        upper: string
        lower: string
    }
    judgment: string
    image: string
    interpretation: string
    changing_lines: number[]
    resulting_hexagram: number | null
}

export interface CompleteOracleSession {
    session_id: string
    timestamp: string
    natal_chart: NatalChart
    tarot_reading: TarotReading
    numerology: NumerologyProfile
    iching: IChingReading
    moon_guidance: MoonPhase
    overall_synthesis: string
    recommendations: string[]
}

/**
 * Oracle API Client Class
 */
export class OracleAPIClient {
    private authToken: string | null = null

    constructor(authToken?: string) {
        this.authToken = authToken || null
    }

    /**
     * Set authentication token
     */
    setAuthToken(token: string): void {
        this.authToken = token
    }

    /**
     * Get request headers with authentication
     */
    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`
        }

        return headers
    }

    /**
     * Handle API errors consistently
     */
    private handleError(error: any, operation: string): never {
        console.error(`Oracle API Error (${operation}):`, error.response?.data || error.message)
        throw new Error(error.response?.data?.message || `Failed to ${operation}`)
    }

    /**
     * Check Oracle engine health
     */
    async getHealth(): Promise<OracleHealthResponse> {
        try {
            const response: AxiosResponse<OracleHealthResponse> = await axios.get(
                `${ORACLE_API_URL}/health`
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'check Oracle health')
        }
    }

    /**
     * Get Oracle engine status and capabilities
     */
    async getStatus(): Promise<any> {
        try {
            const response = await axios.get(`${ORACLE_API_URL}/status`)
            return response.data
        } catch (error) {
            this.handleError(error, 'get Oracle status')
        }
    }

    /**
     * Get available tarot spreads
     */
    async getTarotSpreads(): Promise<string[]> {
        try {
            const response = await axios.get(`${ORACLE_API_URL}/tarot/spreads`)
            return response.data.spreads
        } catch (error) {
            this.handleError(error, 'get tarot spreads')
        }
    }

    /**
     * Create enhanced tarot reading
     */
    async getTarotReading(spread?: string, question?: string): Promise<TarotReading> {
        try {
            const response: AxiosResponse<TarotReading> = await axios.post(
                `${ORACLE_API_URL}/tarot/reading`,
                { spread, question },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'get tarot reading')
        }
    }

    /**
     * Calculate natal chart
     */
    async getNatalChart(birthDate: string, birthPlace: string): Promise<NatalChart> {
        try {
            const response: AxiosResponse<NatalChart> = await axios.post(
                `${ORACLE_API_URL}/astrology/natal-chart`,
                { birth_date: birthDate, birth_place: birthPlace },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'calculate natal chart')
        }
    }

    /**
     * Calculate planetary aspects
     */
    async getAspects(birthDate: string, birthPlace: string, orbTolerance?: number): Promise<any> {
        try {
            const response = await axios.post(
                `${ORACLE_API_URL}/astrology/aspects`,
                { birth_date: birthDate, birth_place: birthPlace, orb_tolerance: orbTolerance },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'calculate aspects')
        }
    }

    /**
     * Calculate current transits
     */
    async getTransits(birthDate: string, birthPlace: string, daysAhead?: number): Promise<any> {
        try {
            const response = await axios.post(
                `${ORACLE_API_URL}/astrology/transits`,
                { birth_date: birthDate, birth_place: birthPlace, days_ahead: daysAhead },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'calculate transits')
        }
    }

    /**
     * Get current moon phase
     */
    async getCurrentMoon(): Promise<MoonPhase> {
        try {
            const response: AxiosResponse<MoonPhase> = await axios.get(
                `${ORACLE_API_URL}/moon/current`
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'get current moon phase')
        }
    }

    /**
     * Get lunar guidance for specific date
     */
    async getLunarGuidance(date?: string): Promise<any> {
        try {
            const params = date ? { date } : {}
            const response = await axios.get(`${ORACLE_API_URL}/moon/guidance`, { params })
            return response.data
        } catch (error) {
            this.handleError(error, 'get lunar guidance')
        }
    }

    /**
     * Calculate advanced numerology profile
     */
    async getNumerology(name: string, birthDate: string): Promise<NumerologyProfile> {
        try {
            const response: AxiosResponse<NumerologyProfile> = await axios.post(
                `${ORACLE_API_URL}/numerology/calculate`,
                { name, birth_date: birthDate },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'calculate numerology')
        }
    }

    /**
     * Cast I Ching hexagram
     */
    async castIChing(question?: string): Promise<IChingReading> {
        try {
            const response: AxiosResponse<IChingReading> = await axios.post(
                `${ORACLE_API_URL}/iching/cast`,
                { question },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'cast I Ching')
        }
    }

    /**
     * Create complete oracle session
     */
    async getCompleteSession(
        name: string,
        birthDate: string,
        birthPlace: string,
        question?: string
    ): Promise<CompleteOracleSession> {
        try {
            const response: AxiosResponse<CompleteOracleSession> = await axios.post(
                `${ORACLE_API_URL}/session/complete`,
                { name, birth_date: birthDate, birth_place: birthPlace, question },
                { headers: this.getHeaders() }
            )
            return response.data
        } catch (error) {
            this.handleError(error, 'create complete oracle session')
        }
    }
}

// Singleton instance
export const oracleAPI = new OracleAPIClient()

// React Hook for Oracle API
export function useOracleAPI(authToken?: string) {
    const client = new OracleAPIClient(authToken)

    return {
        client,
        // Helper methods
        setAuthToken: (token: string) => client.setAuthToken(token),

        // Quick access methods
        getHealth: () => client.getHealth(),
        getTarotReading: (spread?: string, question?: string) =>
            client.getTarotReading(spread, question),
        getNatalChart: (birthDate: string, birthPlace: string) =>
            client.getNatalChart(birthDate, birthPlace),
        getCurrentMoon: () => client.getCurrentMoon(),
        getNumerology: (name: string, birthDate: string) =>
            client.getNumerology(name, birthDate),
        castIChing: (question?: string) => client.castIChing(question),
        getCompleteSession: (name: string, birthDate: string, birthPlace: string, question?: string) =>
            client.getCompleteSession(name, birthDate, birthPlace, question)
    }
}

export default OracleAPIClient