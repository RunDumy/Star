import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PostCreation } from '../PostCreation';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('PostCreation', () => {
  const mockOnPostCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the post creation form', () => {
    render(<PostCreation onPostCreated={mockOnPostCreated} />);

    expect(screen.getByPlaceholderText('Share your cosmic thoughts...')).toBeInTheDocument();
    expect(screen.getByText('📷 Image')).toBeInTheDocument();
    expect(screen.getByText('🎥 Video')).toBeInTheDocument();
    expect(screen.getByText('🌟 Post')).toBeInTheDocument();
  });

  it('submits a text post successfully', async () => {
    const mockSession = { access_token: 'test-token' };
    const mockSupabase = require('@/lib/supabase').supabase;
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<PostCreation onPostCreated={mockOnPostCreated} />);

    const textarea = screen.getByPlaceholderText('Share your cosmic thoughts...');
    const submitButton = screen.getByText('🌟 Post');

    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    expect(mockOnPostCreated).toHaveBeenCalled();
  });

  it('handles file uploads', () => {
    render(<PostCreation onPostCreated={mockOnPostCreated} />);

    const imageInput = screen.getByLabelText('📷 Image');
    const videoInput = screen.getByLabelText('🎥 Video');

    expect(imageInput).toHaveAttribute('accept', 'image/*');
    expect(videoInput).toHaveAttribute('accept', 'video/mp4,video/webm');
  });
});