import { CommentSection } from '@/components/cosmic/CommentSection';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the required dependencies
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/contexts/CollaborationContext', () => ({
  useCollaboration: jest.fn(),
}));

describe('CommentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    const mockUseInfiniteQuery = require('@tanstack/react-query').useInfiniteQuery;
    const mockUseInView = require('react-intersection-observer').useInView;
    const mockUseCollaboration = require('@/contexts/CollaborationContext').useCollaboration;

    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'loading',
    });

    mockUseInView.mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });

    mockUseCollaboration.mockReturnValue({
      socket: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
    });

    render(<CommentSection postId="123" />);

    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', () => {
    const mockUseInfiniteQuery = require('@tanstack/react-query').useInfiniteQuery;
    const mockUseInView = require('react-intersection-observer').useInView;
    const mockUseCollaboration = require('@/contexts/CollaborationContext').useCollaboration;

    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'error',
    });

    mockUseInView.mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });

    mockUseCollaboration.mockReturnValue({
      socket: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
    });

    render(<CommentSection postId="123" />);

    expect(screen.getByText('Error loading comments!')).toBeInTheDocument();
  });

  it('renders comments when data is available', async () => {
    const mockUseInfiniteQuery = require('@tanstack/react-query').useInfiniteQuery;
    const mockUseInView = require('react-intersection-observer').useInView;
    const mockUseCollaboration = require('@/contexts/CollaborationContext').useCollaboration;

    const mockComments = [
      {
        id: '1',
        content: 'Great post!',
        username: 'User1',
        zodiac_sign: 'Aries',
        created_at: '2025-10-05T12:00:00Z',
      },
      {
        id: '2',
        content: 'Love this!',
        username: 'User2',
        zodiac_sign: 'Leo',
        created_at: '2025-10-05T13:00:00Z',
      },
    ];

    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ comments: mockComments }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'success',
    });

    mockUseInView.mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });

    mockUseCollaboration.mockReturnValue({
      socket: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
    });

    render(<CommentSection postId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Great post!')).toBeInTheDocument();
      expect(screen.getByText('Love this!')).toBeInTheDocument();
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  it('shows "no more comments" when there are no more pages', () => {
    const mockUseInfiniteQuery = require('@tanstack/react-query').useInfiniteQuery;
    const mockUseInView = require('react-intersection-observer').useInView;
    const mockUseCollaboration = require('@/contexts/CollaborationContext').useCollaboration;

    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ comments: [] }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'success',
    });

    mockUseInView.mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });

    mockUseCollaboration.mockReturnValue({
      socket: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
    });

    render(<CommentSection postId="123" />);

    expect(screen.getByText('No more comments to load.')).toBeInTheDocument();
  });
});