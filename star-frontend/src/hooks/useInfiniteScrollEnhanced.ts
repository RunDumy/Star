import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseInfiniteScrollOptions {
    endpoint: string;
    limit?: number;
    initialLoad?: boolean;
    dependencies?: any[];
    enableRealTime?: boolean;
    filters?: {
        zodiacSigns?: string[];
        interests?: string[];
        postTypes?: string[];
        searchQuery?: string;
    };
    enableVirtual?: boolean;
    cacheKey?: string;
}

interface UseInfiniteScrollReturn {
    data: any[];
    loading: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => void;
    refresh: () => void;
    loadMoreRef: (node: HTMLDivElement | null) => void;
    isConnected: boolean;
    newPostsCount: number;
    loadNewPosts: () => void;
    setFilters: (filters: any) => void;
    virtualData?: {
        totalCount: number;
        startIndex: number;
        endIndex: number;
    };
}

// Cache management for offline support
class FeedCache {
    private dbName = 'star-cosmic-feed';
    private version = 1;
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('posts')) {
                    const store = db.createObjectStore('posts', { keyPath: 'id' });
                    store.createIndex('timestamp', 'created_at');
                    store.createIndex('zodiac', 'zodiac');
                }
            };
        });
    }

    async cachePosts(posts: any[], key: string): Promise<void> {
        if (!this.db) return;

        const transaction = this.db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');

        for (const post of posts) {
            await store.put({ ...post, cacheKey: key, cachedAt: Date.now() });
        }
    }

    async getCachedPosts(key: string, limit: number, offset: number): Promise<any[]> {
        if (!this.db) return [];

        const transaction = this.db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        const posts: any[] = [];

        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const allPosts = request.result
                    .filter(post => post.cacheKey === key)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(offset, offset + limit);
                resolve(allPosts);
            };
            request.onerror = () => resolve([]);
        });
    }
}

export const useInfiniteScroll = ({
    endpoint,
    limit = 10,
    initialLoad = true,
    dependencies = [],
    enableRealTime = true,
    filters = {},
    enableVirtual = false,
    cacheKey = 'default'
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(initialLoad);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [pendingPosts, setPendingPosts] = useState<any[]>([]);
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [virtualData, setVirtualData] = useState({
        totalCount: 0,
        startIndex: 0,
        endIndex: limit
    });

    const observer = useRef<IntersectionObserver | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const cacheRef = useRef<FeedCache>(new FeedCache());
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Initialize cache
    useEffect(() => {
        cacheRef.current.init();
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        if (!enableRealTime) return;

        const socket = io(API_URL, {
            transports: ['websocket', 'polling'],
            upgrade: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('🌌 Connected to cosmic feed updates');

            // Join feed room based on filters
            const roomKey = `feed:${JSON.stringify(currentFilters)}`;
            socket.emit('join_feed_room', roomKey);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('🌙 Disconnected from cosmic feed');
        });

        socket.on('new_post', (post: any) => {
            // Check if post matches current filters
            if (matchesFilters(post, currentFilters)) {
                setPendingPosts(prev => [post, ...prev]);
                setNewPostsCount(prev => prev + 1);
            }
        });

        socket.on('post_updated', (updatedPost: any) => {
            setData(prev => prev.map(post =>
                post.id === updatedPost.id ? updatedPost : post
            ));
        });

        socket.on('post_deleted', (postId: string) => {
            setData(prev => prev.filter(post => post.id !== postId));
        });

        return () => {
            socket.disconnect();
        };
    }, [enableRealTime, currentFilters, API_URL]);

    const matchesFilters = (post: any, filters: any): boolean => {
        if (filters.zodiacSigns && filters.zodiacSigns.length > 0) {
            if (!filters.zodiacSigns.includes(post.zodiac)) return false;
        }

        if (filters.postTypes && filters.postTypes.length > 0) {
            if (!filters.postTypes.includes(post.type)) return false;
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchableText = [
                post.content,
                post.username,
                typeof post.content === 'object' ? post.content.interpretation : ''
            ].join(' ').toLowerCase();

            if (!searchableText.includes(query)) return false;
        }

        return true;
    };

    const fetchData = useCallback(async (currentOffset: number, reset: boolean = false) => {
        try {
            setError(null);
            if (reset) {
                setLoading(true);
            }

            // Try to get cached data first when offline
            if (!navigator.onLine) {
                const cachedData = await cacheRef.current.getCachedPosts(
                    `${endpoint}:${JSON.stringify(currentFilters)}`,
                    limit,
                    currentOffset
                );

                if (cachedData.length > 0) {
                    if (reset) {
                        setData(cachedData);
                        setOffset(cachedData.length);
                    } else {
                        setData(prev => [...prev, ...cachedData]);
                        setOffset(prev => prev + cachedData.length);
                    }
                    setHasMore(cachedData.length === limit);
                    setLoading(false);
                    return;
                }
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    limit,
                    offset: currentOffset,
                    ...currentFilters
                }
            });

            const newData = response.data;

            // Cache the fetched data
            await cacheRef.current.cachePosts(
                newData,
                `${endpoint}:${JSON.stringify(currentFilters)}`
            );

            if (reset) {
                setData(newData);
                setOffset(newData.length);
            } else {
                setData(prev => [...prev, ...newData]);
                setOffset(prev => prev + newData.length);
            }

            // If we got fewer items than requested, we've reached the end
            setHasMore(newData.length === limit);

            // Update virtual scrolling data
            if (enableVirtual) {
                setVirtualData(prev => ({
                    ...prev,
                    totalCount: prev.totalCount + newData.length,
                    endIndex: Math.min(prev.endIndex + newData.length, prev.totalCount)
                }));
            }

        } catch (err: any) {
            console.error('Failed to fetch data:', err);
            setError(err.message || 'Failed to load data');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [endpoint, limit, API_URL, currentFilters, enableVirtual]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        fetchData(offset);
    }, [fetchData, loading, hasMore, offset]);

    const refresh = useCallback(() => {
        setOffset(0);
        setHasMore(true);
        setNewPostsCount(0);
        setPendingPosts([]);
        fetchData(0, true);
    }, [fetchData]);

    const loadNewPosts = useCallback(() => {
        if (pendingPosts.length === 0) return;

        setData(prev => [...pendingPosts, ...prev]);
        setPendingPosts([]);
        setNewPostsCount(0);
    }, [pendingPosts]);

    const setFilters = useCallback((newFilters: any) => {
        setCurrentFilters(newFilters);
        setOffset(0);
        setHasMore(true);
        setData([]);

        // Update WebSocket room
        if (socketRef.current) {
            const roomKey = `feed:${JSON.stringify(newFilters)}`;
            socketRef.current.emit('join_feed_room', roomKey);
        }

        // Fetch with new filters
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
            rootMargin: '200px'
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // Initial load and dependency updates
    useEffect(() => {
        if (initialLoad) {
            refresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoad, ...dependencies]);

    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    return {
        data,
        loading,
        hasMore,
        error,
        loadMore,
        refresh,
        loadMoreRef,
        isConnected,
        newPostsCount,
        loadNewPosts,
        setFilters,
        virtualData: enableVirtual ? virtualData : undefined
    };
};

export default useInfiniteScroll;