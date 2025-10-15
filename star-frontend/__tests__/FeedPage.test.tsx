import FeedPage from "@/pages/feed";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/AuthContext", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/lib/AuthContext";

global.fetch = jest.fn();

global.fetch = jest.fn();

describe("FeedPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", email: "test@example.com", zodiacSign: "Aries" },
    });
  });

  it("displays login message when user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<FeedPage />);
    expect(screen.getByText(/Please Log In/i)).toBeInTheDocument();
  });

  it("renders posts with Spotify embeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        posts: [
          {
            id: 1,
            user_id: "1",
            content: "Feeling cosmic!",
            media_url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            zodiac_sign: "Aries",
            created_at: "2025-10-04T12:00:00Z",
            profiles: { display_name: "Test User" },
            like_count: 5,
            liked_by_user: true,
            comments: [{ id: 1, user_id: "2", content: "Great post!", profiles: { display_name: "Other User" } }],
          },
        ],
      }),
    });

    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText(/Feeling cosmic!/i)).toBeInTheDocument();
      expect(screen.getByText(/Test User \(Aries\)/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Likes/i)).toBeInTheDocument();
      expect(screen.getByText(/Great post!/i)).toBeInTheDocument();
      expect(screen.getByText(/Other User:/i)).toBeInTheDocument();
      expect(screen.getByText(/1 Comments/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Spotify Embed/i)).toBeInTheDocument();
    });
  });

  it("creates a new post", async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url.endsWith("/api/v1/posts") && options.method === "POST") {
        return Promise.resolve({
          json: async () => ({ success: true, post: { id: 2, content: "New post" } }),
        });
      }
      return Promise.resolve({ json: async () => ({ posts: [] }) });
    });

    render(<FeedPage />);
    fireEvent.change(screen.getByPlaceholderText(/Share your cosmic thoughts/i), {
      target: { value: "New post" },
    });
    fireEvent.click(screen.getByText(/Post/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/posts"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ content: "New post", media_url: undefined }),
        })
      );
    });
  });
});