/**
 * Test Suite for Enhanced Cosmic Analytics Dashboard
 * Comprehensive tests for analytics visualization and data processing
 */

import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import EnhancedCosmicAnalyticsDashboard from '../components/cosmic/EnhancedCosmicAnalyticsDashboard';
import enhancedAnalyticsService from '../lib/services/EnhancedAnalyticsService';

// Mock Chart.js
jest.mock('chart.js', () => ({
    Chart: {
        register: jest.fn(),
        defaults: {
            plugins: {
                legend: { labels: { color: '#000' } }
            }
        }
    },
    CategoryScale: jest.fn(),
    LinearScale: jest.fn(),
    PointElement: jest.fn(),
    LineElement: jest.fn(),
    BarElement: jest.fn(),
    Title: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    ArcElement: jest.fn(),
    RadialLinearScale: jest.fn()
}));

jest.mock('react-chartjs-2', () => ({
    Line: ({ data, options }: any) => (
        <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
            Line Chart: {data.datasets?.[0]?.label}
        </div>
    ),
    Bar: ({ data, options }: any) => (
        <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
            Bar Chart: {data.datasets?.[0]?.label}
        </div>
    ),
    Doughnut: ({ data, options }: any) => (
        <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)}>
            Doughnut Chart: {data.datasets?.[0]?.label}
        </div>
    ),
    Radar: ({ data, options }: any) => (
        <div data-testid="radar-chart" data-chart-data={JSON.stringify(data)}>
            Radar Chart: {data.datasets?.[0]?.label}
        </div>
    )
}));

// Mock services
jest.mock('../lib/services/EnhancedAnalyticsService');
jest.mock('../lib/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user-123',
            username: 'CosmicAnalyst',
            zodiacSign: 'scorpio'
        },
        token: 'mock-jwt-token'
    })
}));

// Mock analytics service
const mockAnalyticsService = enhancedAnalyticsService as jest.Mocked<typeof enhancedAnalyticsService>;

// Sample test data
const mockDashboardData = {
    metrics: {
        total_users: 1337,
        daily_active_users: 456,
        weekly_retention: 78.5,
        average_session_duration: 24.5,
        cosmic_interactions: 8924,
        spotify_integrations: 234,
        tarot_readings: 567,
        real_time_sessions: 89
    },
    engagement_trends: [
        { timestamp: '2024-01-15T10:00:00Z', engagement_score: 85, user_count: 120, session_duration: 25.5 },
        { timestamp: '2024-01-15T11:00:00Z', engagement_score: 92, user_count: 145, session_duration: 28.2 },
        { timestamp: '2024-01-15T12:00:00Z', engagement_score: 88, user_count: 132, session_duration: 26.8 }
    ],
    cosmic_analytics: {
        zodiac_engagement: {
            aries: 15.2,
            taurus: 12.8,
            gemini: 18.5,
            cancer: 14.1,
            leo: 16.9,
            virgo: 11.3,
            libra: 13.7,
            scorpio: 19.2,
            sagittarius: 12.1,
            capricorn: 10.8,
            aquarius: 17.4,
            pisces: 14.6
        },
        elemental_preferences: {
            fire: 35.2,
            earth: 22.8,
            air: 28.1,
            water: 33.9
        },
        lunar_activity_correlation: 0.78,
        tarot_draw_patterns: {
            major_arcana: 45.2,
            minor_arcana: 54.8,
            daily_draws: 32.1,
            relationship_spreads: 28.7
        },
        cosmic_sync_events: 142,
        energy_flow_trends: [65, 72, 68, 75, 81, 77, 83]
    },
    top_content: [
        { id: 'content1', title: 'Cosmic Meditation Guide', engagement_score: 94.5, views: 2847 },
        { id: 'content2', title: 'Tarot Reading Basics', engagement_score: 91.2, views: 2156 },
        { id: 'content3', title: 'Lunar Phase Calendar', engagement_score: 87.8, views: 1923 }
    ],
    user_growth: [
        { date: '2024-01-10', new_users: 45, total_users: 1200 },
        { date: '2024-01-11', new_users: 52, total_users: 1252 },
        { date: '2024-01-12', new_users: 38, total_users: 1290 }
    ]
};

const mockUserInsights = {
    engagement_score: 87.5,
    active_hours: [8, 12, 14, 18, 20, 22],
    favorite_elements: ['water', 'earth'],
    cosmic_affinity: {
        tarot: 0.92,
        astrology: 0.78,
        numerology: 0.65,
        meditation: 0.84
    },
    predicted_interests: ['lunar_cycles', 'crystal_healing', 'sacred_geometry'],
    recommendation_tags: ['introspective', 'spiritual_growth', 'cosmic_alignment'],
    personalization_score: 0.89,
    last_updated: '2024-01-15T15:30:00Z'
};

const mockPredictiveInsights = [
    {
        type: 'engagement_trend',
        title: 'Rising Cosmic Engagement',
        description: 'User engagement with cosmic content is trending upward',
        confidence: 0.89,
        impact_score: 8.2,
        suggested_action: 'Increase cosmic content frequency',
        cosmic_correlation: 'new_moon_phase',
        trend_direction: 'up' as const,
        timeframe: 'next_7_days'
    },
    {
        type: 'user_behavior',
        title: 'Evening Meditation Peak',
        description: 'Users are most active during evening meditation hours',
        confidence: 0.94,
        impact_score: 7.8,
        suggested_action: 'Schedule live sessions during peak hours',
        trend_direction: 'stable' as const,
        timeframe: 'ongoing'
    }
];

describe('EnhancedCosmicAnalyticsDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock responses
        mockAnalyticsService.getDashboardData.mockResolvedValue(mockDashboardData);
        mockAnalyticsService.getUserInsights.mockResolvedValue(mockUserInsights);
        mockAnalyticsService.getPredictiveInsights.mockResolvedValue(mockPredictiveInsights);
        mockAnalyticsService.getRealTimeData.mockResolvedValue({
            active_users: 42,
            current_sessions: 7,
            live_interactions: 156,
            cosmic_events: 23
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders the analytics dashboard interface', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic analytics dashboard/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/overview/i)).toBeInTheDocument();
            expect(screen.getByText(/personal insights/i)).toBeInTheDocument();
            expect(screen.getByText(/cosmic analytics/i)).toBeInTheDocument();
            expect(screen.getByText(/predictions/i)).toBeInTheDocument();
        });

        it('displays loading state initially', () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            expect(screen.getByText(/loading cosmic insights/i)).toBeInTheDocument();
        });

        it('shows error state when data loading fails', async () => {
            mockAnalyticsService.getDashboardData.mockRejectedValueOnce(new Error('API Error'));

            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic disturbance detected/i)).toBeInTheDocument();
            });
        });
    });

    describe('Tab Navigation', () => {
        it('switches between tabs correctly', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic analytics dashboard/i)).toBeInTheDocument();
            });

            // Click on Personal Insights tab
            const personalTab = screen.getByText(/personal insights/i);
            fireEvent.click(personalTab);

            await waitFor(() => {
                expect(screen.getByText(/engagement score/i)).toBeInTheDocument();
            });

            // Click on Cosmic Analytics tab
            const cosmicTab = screen.getByText(/cosmic analytics/i);
            fireEvent.click(cosmicTab);

            await waitFor(() => {
                expect(screen.getByText(/zodiac engagement/i)).toBeInTheDocument();
            });
        });

        it('maintains tab state during data refresh', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const personalTab = screen.getByText(/personal insights/i);
                fireEvent.click(personalTab);
            });

            // Trigger refresh
            const refreshButton = screen.getByLabelText(/refresh analytics/i);
            fireEvent.click(refreshButton);

            await waitFor(() => {
                expect(screen.getByText(/engagement score/i)).toBeInTheDocument();
            });
        });
    });

    describe('Overview Tab', () => {
        it('displays key metrics correctly', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText('1,337')).toBeInTheDocument(); // total_users
                expect(screen.getByText('456')).toBeInTheDocument(); // daily_active_users
                expect(screen.getByText('78.5%')).toBeInTheDocument(); // weekly_retention
                expect(screen.getByText('24.5 min')).toBeInTheDocument(); // average_session_duration
            });
        });

        it('renders engagement trends chart', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByTestId('line-chart')).toBeInTheDocument();
            });
        });

        it('shows top content list', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText(/cosmic meditation guide/i)).toBeInTheDocument();
                expect(screen.getByText(/tarot reading basics/i)).toBeInTheDocument();
                expect(screen.getByText(/lunar phase calendar/i)).toBeInTheDocument();
            });
        });
    });

    describe('Personal Insights Tab', () => {
        it('displays user engagement metrics', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const personalTab = screen.getByText(/personal insights/i);
            fireEvent.click(personalTab);

            await waitFor(() => {
                expect(screen.getByText('87.5')).toBeInTheDocument(); // engagement_score
                expect(screen.getByText(/personalization score/i)).toBeInTheDocument();
            });
        });

        it('shows cosmic affinity radar chart', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const personalTab = screen.getByText(/personal insights/i);
            fireEvent.click(personalTab);

            await waitFor(() => {
                expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
            });
        });

        it('displays recommended interests', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const personalTab = screen.getByText(/personal insights/i);
            fireEvent.click(personalTab);

            await waitFor(() => {
                expect(screen.getByText(/lunar_cycles/i)).toBeInTheDocument();
                expect(screen.getByText(/crystal_healing/i)).toBeInTheDocument();
                expect(screen.getByText(/sacred_geometry/i)).toBeInTheDocument();
            });
        });
    });

    describe('Cosmic Analytics Tab', () => {
        it('displays zodiac engagement distribution', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const cosmicTab = screen.getByText(/cosmic analytics/i);
            fireEvent.click(cosmicTab);

            await waitFor(() => {
                expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
                expect(screen.getByText(/zodiac engagement/i)).toBeInTheDocument();
            });
        });

        it('shows elemental preferences chart', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const cosmicTab = screen.getByText(/cosmic analytics/i);
            fireEvent.click(cosmicTab);

            await waitFor(() => {
                expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
            });
        });

        it('displays lunar correlation metric', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const cosmicTab = screen.getByText(/cosmic analytics/i);
            fireEvent.click(cosmicTab);

            await waitFor(() => {
                expect(screen.getByText('0.78')).toBeInTheDocument(); // lunar_activity_correlation
                expect(screen.getByText(/lunar correlation/i)).toBeInTheDocument();
            });
        });
    });

    describe('Predictions Tab', () => {
        it('displays predictive insights', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const predictionsTab = screen.getByText(/predictions/i);
            fireEvent.click(predictionsTab);

            await waitFor(() => {
                expect(screen.getByText(/rising cosmic engagement/i)).toBeInTheDocument();
                expect(screen.getByText(/evening meditation peak/i)).toBeInTheDocument();
            });
        });

        it('shows confidence scores for predictions', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const predictionsTab = screen.getByText(/predictions/i);
            fireEvent.click(predictionsTab);

            await waitFor(() => {
                expect(screen.getByText('89%')).toBeInTheDocument(); // confidence: 0.89
                expect(screen.getByText('94%')).toBeInTheDocument(); // confidence: 0.94
            });
        });

        it('displays suggested actions', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            const predictionsTab = screen.getByText(/predictions/i);
            fireEvent.click(predictionsTab);

            await waitFor(() => {
                expect(screen.getByText(/increase cosmic content frequency/i)).toBeInTheDocument();
                expect(screen.getByText(/schedule live sessions during peak hours/i)).toBeInTheDocument();
            });
        });
    });

    describe('Timeframe Selection', () => {
        it('updates data when timeframe changes', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const timeframeSelect = screen.getByLabelText(/timeframe/i);
                fireEvent.change(timeframeSelect, { target: { value: '30d' } });
            });

            expect(mockAnalyticsService.getDashboardData).toHaveBeenCalledWith('30d', undefined);
        });

        it('persists timeframe selection across tab changes', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const timeframeSelect = screen.getByLabelText(/timeframe/i);
                fireEvent.change(timeframeSelect, { target: { value: '30d' } });
            });

            const personalTab = screen.getByText(/personal insights/i);
            fireEvent.click(personalTab);

            const timeframeSelectAfter = screen.getByLabelText(/timeframe/i);
            expect((timeframeSelectAfter as HTMLSelectElement).value).toBe('30d');
        });
    });

    describe('Data Refresh', () => {
        it('refreshes data when refresh button is clicked', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const refreshButton = screen.getByLabelText(/refresh analytics/i);
                fireEvent.click(refreshButton);
            });

            expect(mockAnalyticsService.getDashboardData).toHaveBeenCalledTimes(2);
        });

        it('shows loading state during refresh', async () => {
            // Make the service call take longer
            mockAnalyticsService.getDashboardData.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 1000))
            );

            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const refreshButton = screen.getByLabelText(/refresh analytics/i);
                fireEvent.click(refreshButton);
            });

            expect(screen.getByText(/loading cosmic insights/i)).toBeInTheDocument();
        });
    });

    describe('Data Export', () => {
        it('triggers data export when export button is clicked', async () => {
            mockAnalyticsService.exportData.mockResolvedValue(new Blob(['test data'], { type: 'application/json' }));

            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const exportButton = screen.getByLabelText(/export analytics/i);
                fireEvent.click(exportButton);
            });

            expect(mockAnalyticsService.exportData).toHaveBeenCalledWith('dashboard', '7d', 'json');
        });

        it('handles export errors gracefully', async () => {
            mockAnalyticsService.exportData.mockRejectedValueOnce(new Error('Export failed'));

            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const exportButton = screen.getByLabelText(/export analytics/i);
                fireEvent.click(exportButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/export failed/i)).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('provides proper ARIA labels for all interactive elements', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByLabelText(/timeframe/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/refresh analytics/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/export analytics/i)).toBeInTheDocument();
            });
        });

        it('supports keyboard navigation', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                const firstTab = screen.getByText(/overview/i);
                firstTab.focus();
                expect(firstTab).toHaveFocus();
            });
        });

        it('announces data updates to screen readers', async () => {
            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(screen.getByText(/analytics loaded/i)).toBeInTheDocument();
            });
        });
    });

    describe('Real-time Updates', () => {
        it('updates real-time metrics periodically', async () => {
            jest.useFakeTimers();

            render(<EnhancedCosmicAnalyticsDashboard />);

            await waitFor(() => {
                expect(mockAnalyticsService.getRealTimeData).toHaveBeenCalledTimes(1);
            });

            // Fast-forward time to trigger update
            act(() => {
                jest.advanceTimersByTime(10000);
            });

            await waitFor(() => {
                expect(mockAnalyticsService.getRealTimeData).toHaveBeenCalledTimes(2);
            });

            jest.useRealTimers();
        });

        it('cleans up real-time updates on unmount', () => {
            jest.useFakeTimers();

            const { unmount } = render(<EnhancedCosmicAnalyticsDashboard />);

            unmount();

            // Advance time to ensure no more calls happen
            act(() => {
                jest.advanceTimersByTime(20000);
            });

            expect(mockAnalyticsService.getRealTimeData).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });
    });
});