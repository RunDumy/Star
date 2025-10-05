"use client";

import { useAuth } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: number;
  user_id: string;
  content: string;
  media_url?: string;
  zodiac_sign: string;
  created_at: string;
  profiles: { display_name: string };
  like_count: number;
  liked_by_user: boolean;
  comments: { id: number; user_id: string; content: string; created_at: string; profiles: { display_name: string } }[];
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`, {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        const data = await response.json();
        if (data.posts) setPosts(data.posts);
        setLoading(false);
      } catch (err) {
        setError("Failed to load posts");
        setLoading(false);
      }
    };

    fetchPosts();

    // Subscribe to real-time updates
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const postsChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [user]);

  const createPost = async () => {
    if (!newPost.trim()) {
      setError("Post content is required");
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ content: newPost, media_url: newMediaUrl || undefined }),
      });
      const data = await response.json();
      if (data.success) {
        setNewPost("");
        setNewMediaUrl("");
        setError("");
        // Posts will update via real-time subscription
      } else {
        setError(data.error || "Failed to create post");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const toggleLike = async (postId: number, liked: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}` },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, liked_by_user: data.liked, like_count: post.like_count + (data.liked ? 1 : -1) }
            : post
        ));
      }
    } catch (err) {
        setError("Failed to update like");
    }
  };

  const addComment = async (postId: number) => {
    const content = newComments[postId]?.trim();
    if (!content) {
      setError("Comment content is required");
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (data.success) {
        setNewComments({ ...newComments, [postId]: "" });
        // Comments will update via real-time subscription
      } else {
        setError(data.error || "Failed to add comment");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl">Please Log In</h1>
        <p>Access the cosmic feed after signing in.</p>
      </div>
    );
  }

  if (loading) return <p className="text-white p-4">Loading cosmic feed...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Link href="/home" className="text-blue-400 hover:underline mb-4 inline-block">
        Back to Cosmic Home
      </Link>
      <h1 className="text-3xl font-bold mb-4">Cosmic Feed ({user.zodiacSign || "Unknown"})</h1>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your cosmic thoughts..."
          className="w-full p-2 rounded bg-gray-900 text-white mb-2"
          rows={4}
        />
        <input
          type="text"
          value={newMediaUrl}
          onChange={(e) => setNewMediaUrl(e.target.value)}
          placeholder="Optional Spotify track URL (e.g., https://open.spotify.com/track/xyz)"
          className="w-full p-2 rounded bg-gray-900 text-white mb-2"
        />
        <button
          onClick={createPost}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Post
        </button>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 bg-gray-800 rounded-lg relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: `url(/constellations/${post.zodiac_sign.toLowerCase()}.png)`,
              backgroundSize: 'cover',
            }} />
            <p className="font-semibold">{post.profiles.display_name} ({post.zodiac_sign})</p>
            <p className="mt-1">{post.content}</p>
            {(() => {
              const spotifyMatch = post.media_url?.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
              return spotifyMatch && (
                <iframe
                  src={`https://open.spotify.com/embed/track/${spotifyMatch[1]}`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="mt-2 rounded"
                />
              );
            })()}
            <div className="mt-2 flex space-x-4">
              <button
                onClick={() => toggleLike(post.id, post.liked_by_user)}
                className={`flex items-center ${post.liked_by_user ? 'text-red-500' : 'text-gray-400'} hover:text-red-600`}
              >
                <svg className="w-5 h-5 mr-1" fill={post.liked_by_user ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.like_count} Likes
              </button>
              <button className="text-gray-400 hover:text-blue-600">
                {post.comments.length} Comments
              </button>
            </div>
            <div className="mt-2">
              {post.comments.map((comment) => (
                <p key={comment.id} className="text-sm text-gray-300">
                  <span className="font-semibold">{comment.profiles.display_name}:</span> {comment.content}
                </p>
              ))}
              <div className="mt-2 flex">
                <input
                  type="text"
                  value={newComments[post.id] || ""}
                  onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 rounded bg-gray-900 text-white mr-2"
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
