import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useInfiniteScroll } from '../useInfiniteScroll';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useInfiniteScroll', () => {
    const mockApiUrl = 'http://localhost:5000';
    const mockEndpoint = '/api/v1/feed';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = mockApiUrl;
    });

    it('should fetch initial data on mount', async () => {
        const mockData = [
            { id: 1, content: 'Post 1' },
            { id: 2, content: 'Post 2' }
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() =>
            useInfiniteScroll({
                endpoint: mockEndpoint,
                limit: 10,
                initialLoad: true
            })
        );

        // Initially loading
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toEqual([]);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.hasMore).toBe(false); // Less than limit means no more
        expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiUrl}${mockEndpoint}`, {
            headers: { Authorization: 'Bearer mock-token' },
            params: { limit: 10, offset: 0 }
        });
    });

    it('should load more data when loadMore is called', async () => {
        const initialData = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            content: `Post ${i + 1}`
        }));

        const moreData = Array.from({ length: 10 }, (_, i) => ({
            id: i + 11,
            content: `Post ${i + 11}`
        }));

        mockedAxios.get
            .mockResolvedValueOnce({ data: initialData })
            .mockResolvedValueOnce({ data: moreData });

        const { result } = renderHook(() =>
            useInfiniteScroll({
                endpoint: mockEndpoint,
                limit: 10,
                initialLoad: true
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasMore).toBe(true); // Full page means more available

        // Load more
        act(() => {
            result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(20);
        });

        expect(result.current.data).toEqual([...initialData, ...moreData]);
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh correctly', async () => {
        const initialData = [{ id: 1, content: 'Post 1' }];
        const refreshData = [{ id: 2, content: 'New Post' }];

        mockedAxios.get
            .mockResolvedValueOnce({ data: initialData })
            .mockResolvedValueOnce({ data: refreshData });

        const { result } = renderHook(() =>
            useInfiniteScroll({
                endpoint: mockEndpoint,
                limit: 10,
                initialLoad: true
            })
        );

        await waitFor(() => {
            expect(result.current.data).toEqual(initialData);
        });

        // Refresh
        act(() => {
            result.current.refresh();
        });

        await waitFor(() => {
            expect(result.current.data).toEqual(refreshData);
        });

        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() =>
            useInfiniteScroll({
                endpoint: mockEndpoint,
                limit: 10,
                initialLoad: true
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Network error');
        expect(result.current.hasMore).toBe(false);
        expect(result.current.data).toEqual([]);
    });

    it('should not load more when already loading', async () => {
        const mockData = [{ id: 1, content: 'Post 1' }];

        // Make the first request hang
        let resolveFirstRequest: (value: any) => void;
        const firstRequestPromise = new Promise(resolve => {
            resolveFirstRequest = resolve;
        });

        mockedAxios.get.mockReturnValueOnce(firstRequestPromise);

        const { result } = renderHook(() =>
            useInfiniteScroll({
                endpoint: mockEndpoint,
                limit: 10,
                initialLoad: true
            })
        );

        // Try to load more while initial load is pending
        act(() => {
            result.current.loadMore();
        });

        // Should only have made one request
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

        // Resolve the first request
        resolveFirstRequest!({ data: mockData });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });
});