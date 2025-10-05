"use client";

import { CosmicFeed3D } from "@/components/CosmicFeed3D";
import { useAuth } from "@/lib/AuthContext";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Link href="/home" className="text-blue-400 hover:underline mb-4 inline-block p-4">
        Back to Cosmic Home
      </Link>

      {/* Post Creation Form */}
      <div className="max-w-2xl mx-auto mb-8 p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/30">
        <h2 className="text-xl font-bold text-white mb-4">Share Your Cosmic Thoughts</h2>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your cosmic thoughts..."
          className="w-full p-3 rounded-lg bg-gray-900/50 text-white mb-3 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
          rows={4}
        />
        <input
          type="text"
          value={newMediaUrl}
          onChange={(e) => setNewMediaUrl(e.target.value)}
          placeholder="Optional Spotify track URL (e.g., https://open.spotify.com/track/xyz)"
          className="w-full p-3 rounded-lg bg-gray-900/50 text-white mb-3 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
        />
        <button
          onClick={createPost}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Post to the Cosmos
        </button>
      </div>

      {/* 3D Cosmic Feed */}
      <CosmicFeed3D
        posts={posts.map(post => ({
          id: post.id,
          content: post.content,
          username: post.profiles.display_name,
          zodiac_sign: post.zodiac_sign,
          image_url: post.media_url,
          spark_count: post.like_count,
          echo_count: 0, // Not implemented yet
          comment_count: post.comments.length,
          created_at: post.created_at
        }))}
      />
    </div>
  );
}
