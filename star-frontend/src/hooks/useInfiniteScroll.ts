import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
    endpoint: string;
    limit?: number;
    initialLoad?: boolean;
    dependencies?: any[];
}

interface UseInfiniteScrollReturn {
    data: any[];
    loading: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => void;
    refresh: () => void;
    loadMoreRef: (node: HTMLDivElement | null) => void;
}

export const useInfiniteScroll = ({
    endpoint,
    limit = 10,
    initialLoad = true,
    dependencies = []
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(initialLoad);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);

    const observer = useRef<IntersectionObserver | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchData = useCallback(async (currentOffset: number, reset: boolean = false) => {
        try {
            setError(null);
            if (reset) {
                setLoading(true);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    limit,
                    offset: currentOffset
                }
            });

            // Handle different response structures
            let newData: any[];
            if (response.data.posts) {
                // For /api/v1/posts endpoint
                newData = response.data.posts;
            } else if (Array.isArray(response.data)) {
                // For direct array responses
                newData = response.data;
            } else {
                // Fallback for other structures
                newData = response.data.data || [];
            }

            if (reset) {
                setData(newData);
                setOffset(newData.length);
            } else {
                setData(prev => [...prev, ...newData]);
                setOffset(prev => prev + newData.length);
            }

            // If we got fewer items than requested, we've reached the end
            setHasMore(newData.length === limit);

        } catch (err: any) {
            console.error('Failed to fetch data:', err);
            setError(err.message || 'Failed to load data');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [endpoint, limit, API_URL]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        fetchData(offset);
    }, [fetchData, loading, hasMore, offset]);

    const refresh = useCallback(() => {
        setOffset(0);
        setHasMore(true);
        fetchData(0, true);
    }, [fetchData]);

    // Intersection Observer ref callback
    const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px' // Start loading when 200px from the trigger
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // Initial load and dependency updates
    useEffect(() => {
        if (initialLoad) {
            refresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoad, ...dependencies]);    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    return {
        data,
        loading,
        hasMore,
        error,
        loadMore,
        refresh,
        loadMoreRef
    };
};

export default useInfiniteScroll;