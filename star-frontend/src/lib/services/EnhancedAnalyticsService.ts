/**
 * Enhanced Analytics Service for STAR Platform
 * Handles data fetching and processing for analytics dashboard
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AnalyticsTimeframe {
    timeframe: '24h' | '7d' | '30d' | '90d';
    start_date?: string;
    end_date?: string;
}

export interface DashboardMetrics {
    total_users: number;
    daily_active_users: number;
    weekly_retention: number;
    average_session_duration: number;
    cosmic_interactions: number;
    spotify_integrations: number;
    tarot_readings: number;
    real_time_sessions: number;
}

export interface UserInsights {
    engagement_score: number;
    active_hours: number[];
    favorite_elements: string[];
    cosmic_affinity: Record<string, number>;
    predicted_interests: string[];
    recommendation_tags: string[];
    personalization_score: number;
    last_updated: string;
}

export interface PredictiveInsight {
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact_score: number;
    suggested_action: string;
    cosmic_correlation?: string;
    trend_direction: 'up' | 'down' | 'stable';
    timeframe: string;
}

export interface CosmicAnalytics {
    zodiac_engagement: Record<string, number>;
    elemental_preferences: Record<string, number>;
    lunar_activity_correlation: number;
    tarot_draw_patterns: Record<string, number>;
    cosmic_sync_events: number;
    energy_flow_trends: number[];
}

export interface EngagementTrend {
    timestamp: string;
    engagement_score: number;
    user_count: number;
    session_duration: number;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    engagement_trends: EngagementTrend[];
    cosmic_analytics: CosmicAnalytics;
    top_content: Array<{
        id: string;
        title: string;
        engagement_score: number;
        views: number;
    }>;
    user_growth: Array<{
        date: string;
        new_users: number;
        total_users: number;
    }>;
}

class EnhancedAnalyticsService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get comprehensive dashboard data
     */
    async getDashboardData(timeframe: string = '7d', userId?: string): Promise<DashboardData> {
        try {
            const params = new URLSearchParams({ timeframe });
            if (userId) params.append('user_id', userId);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/dashboard?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            throw new Error('Failed to load dashboard data');
        }
    }

    /**
     * Get user-specific insights
     */
    async getUserInsights(userId: string, timeframe: string = '7d'): Promise<UserInsights> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/user-insights`,
                {
                    headers: this.getAuthHeaders(),
                    params: { user_id: userId, timeframe }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch user insights:', error);
            throw new Error('Failed to load user insights');
        }
    }

    /**
     * Get predictive insights
     */
    async getPredictiveInsights(timeframe: string = '7d', userId?: string): Promise<PredictiveInsight[]> {
        try {
            const params = new URLSearchParams({ timeframe });
            if (userId) params.append('user_id', userId);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/predictions?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.predictions || [];
        } catch (error) {
            console.error('Failed to fetch predictive insights:', error);
            throw new Error('Failed to load predictive insights');
        }
    }

    /**
     * Get cosmic analytics data
     */
    async getCosmicAnalytics(timeframe: string = '7d'): Promise<CosmicAnalytics> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/cosmic`,
                {
                    headers: this.getAuthHeaders(),
                    params: { timeframe }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch cosmic analytics:', error);
            throw new Error('Failed to load cosmic analytics');
        }
    }

    /**
     * Get engagement trends over time
     */
    async getEngagementTrends(timeframe: string = '7d', userId?: string): Promise<EngagementTrend[]> {
        try {
            const params = new URLSearchParams({ timeframe });
            if (userId) params.append('user_id', userId);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/engagement-trends?${params.toString()}`,
                { headers: this.getAuthHeaders() }
            );

            return response.data.trends || [];
        } catch (error) {
            console.error('Failed to fetch engagement trends:', error);
            throw new Error('Failed to load engagement trends');
        }
    }

    /**
     * Get real-time analytics data
     */
    async getRealTimeData(): Promise<{
        active_users: number;
        current_sessions: number;
        live_interactions: number;
        cosmic_events: number;
    }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/real-time`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch real-time data:', error);
            throw new Error('Failed to load real-time data');
        }
    }

    /**
     * Get user behavior analysis
     */
    async getUserBehaviorAnalysis(userId: string, timeframe: string = '7d'): Promise<{
        session_patterns: Array<{
            hour: number;
            activity_level: number;
            common_actions: string[];
        }>;
        content_preferences: Record<string, number>;
        interaction_patterns: Record<string, number>;
        cosmic_correlations: Record<string, number>;
    }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/user-behavior`,
                {
                    headers: this.getAuthHeaders(),
                    params: { user_id: userId, timeframe }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch user behavior analysis:', error);
            throw new Error('Failed to load user behavior analysis');
        }
    }

    /**
     * Get content performance metrics
     */
    async getContentPerformance(timeframe: string = '7d'): Promise<Array<{
        content_id: string;
        content_type: string;
        title: string;
        views: number;
        engagement_score: number;
        completion_rate: number;
        cosmic_resonance: number;
    }>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/content-performance`,
                {
                    headers: this.getAuthHeaders(),
                    params: { timeframe }
                }
            );

            return response.data.content || [];
        } catch (error) {
            console.error('Failed to fetch content performance:', error);
            throw new Error('Failed to load content performance');
        }
    }

    /**
     * Export analytics data
     */
    async exportData(
        type: 'dashboard' | 'user-insights' | 'cosmic' | 'all',
        timeframe: string = '7d',
        format: 'json' | 'csv' = 'json'
    ): Promise<Blob> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/export`,
                {
                    headers: this.getAuthHeaders(),
                    params: { type, timeframe, format },
                    responseType: 'blob'
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to export data:', error);
            throw new Error('Failed to export analytics data');
        }
    }

    /**
     * Get system health metrics
     */
    async getSystemHealth(): Promise<{
        api_response_time: number;
        database_health: 'healthy' | 'degraded' | 'unhealthy';
        cache_hit_rate: number;
        error_rate: number;
        active_connections: number;
    }> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/analytics/system-health`,
                { headers: this.getAuthHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to fetch system health:', error);
            throw new Error('Failed to load system health metrics');
        }
    }

    /**
     * Subscribe to real-time analytics updates
     */
    subscribeToRealTimeUpdates(
        callback: (data: any) => void,
        types: string[] = ['engagement', 'users', 'cosmic']
    ): () => void {
        // Implementation would depend on WebSocket setup
        // For now, return a cleanup function
        const interval = setInterval(async () => {
            try {
                const realTimeData = await this.getRealTimeData();
                callback(realTimeData);
            } catch (error) {
                console.error('Real-time update failed:', error);
            }
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }
}

// Create and export singleton instance
const enhancedAnalyticsService = new EnhancedAnalyticsService();
export default enhancedAnalyticsService;