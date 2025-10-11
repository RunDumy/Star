'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StarBackground from '../../components/StarBackground';
// import { useAuth } from '../../../lib/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type User = {
  id: string;
  username: string;
  zodiac_sign: string;
  full_name?: string;
};

type Friend = {
  id: string;
  display_name: string;
  zodiac_sign: string;
  bio: string;
  avatar_url: string;
  friendship_date: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    zodiac_sign: string;
    avatar_url: string;
  };
};

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  zodiac_sign: string;
  bio: string;
  avatar_url: string;
  created_at: string;
};

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  // const { user: currentUser } = useAuth();
  const currentUser: User | null = null; // Temporary

  useEffect(() => {
    if (!id) return;

    const loadProfileData = async () => {
      try {
        setLoading(true);

        // Load profile
        const profileResponse = await fetch(`${API_URL}/api/v1/profiles/${id}`);
        const profileData = await profileResponse.json();
        setProfile({
          ...profileData,
          zodiac_sign: profileData.zodiac_sign,
          avatar_url: profileData.avatar_url,
          display_name: profileData.display_name,
          user_id: profileData.user_id
        });

        // Load friends
        const friendsResponse = await fetch(`${API_URL}/api/v1/friends/${id}`);
        const friendsData = await friendsResponse.json();
        setFriends(friendsData || []);

        // Load posts
        const postsResponse = await fetch(`${API_URL}/api/v1/posts?user_id=${id}`);
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);

        // Check if current user is friends with this profile
        // if (currentUser) {
        //   const friendCheck = friendsData?.find((friend: Friend) => friend.id === currentUser.id);
        //   setIsFriend(!!friendCheck);
        // }

      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id, currentUser]);

  const onFollow = async () => {
    // if (!id || !currentUser) return;
    // try {
    //   const response = await fetch(`${API_URL}/api/v1/friends/request`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${currentUser.id}`,
    //     },
    //     body: JSON.stringify({ friend_id: id }),
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     setMessage('Friend request sent!');
    //     setIsFriend(true);
    //   } else {
    //     setMessage(data.error || 'Failed to send friend request');
    //   }
    // } catch (error) {
    //   setMessage('Failed to send friend request');
    // }
  };

  if (loading) {
    return (
      <StarBackground>
        <div className="cosmic-container relative z-10 flex min-h-screen items-center justify-center p-4 text-white">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
            <p>Loading cosmic profile...</p>
          </div>
        </div>
      </StarBackground>
    );
  }

  if (!profile) {
    return (
      <StarBackground>
        <div className="cosmic-container relative z-10 flex min-h-screen items-center justify-center p-4 text-white">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Profile Not Found</h1>
            <p>The cosmic entity you&apos;re seeking doesn&apos;t exist in this dimension.</p>
          </div>
        </div>
      </StarBackground>
    );
  }

  return (
    <StarBackground>
      <div className="cosmic-container relative z-10 p-4 text-white">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border border-purple-500/30 bg-black/20 p-6 backdrop-blur-sm">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-24 w-24 rounded-full border-2 border-purple-400"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-purple-400 bg-purple-900/50">
                  <span className="text-2xl font-bold text-purple-300">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-purple-300">{profile.display_name}</h1>
              <p className="mb-2 text-lg text-blue-300">✨ {profile.zodiac_sign}</p>
              {profile.bio && <p className="mb-4 text-gray-300">{profile.bio}</p>}
              <p className="text-sm text-gray-400">
                Joined: {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            {/* {currentUser && currentUser.id !== id && ( */}
              <button
                onClick={onFollow}
                disabled={isFriend}
                className={`rounded-lg px-6 py-2 font-semibold transition-colors ${
                  isFriend
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                {isFriend ? 'Friends' : 'Connect'}
              </button>
            {/* )} */}
          </div>
        </div>

        {/* Cosmic Network Visualization */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-purple-300">Cosmic Network</h2>
          <div className="rounded-lg border border-purple-500/30 bg-black/20 p-4 backdrop-blur-sm">
            {/* <CosmicNetwork userId={id as string} /> */}
            <p className="text-center text-gray-400 py-8">
              Cosmic Network visualization coming soon...
            </p>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-purple-300">
            Cosmic Connections ({friends.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-lg border border-purple-500/20 bg-black/10 p-4 backdrop-blur-sm hover:border-purple-400/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/profile/${friend.id}`)}
              >
                <div className="flex items-center space-x-3">
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt={friend.display_name}
                      className="h-12 w-12 rounded-full border border-purple-400"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-400 bg-purple-900/50">
                      <span className="text-lg font-bold text-purple-300">
                        {friend.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-purple-300">{friend.display_name}</h3>
                    <p className="text-sm text-blue-300">{friend.zodiac_sign}</p>
                  </div>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">
                No cosmic connections yet. Be the first star in their constellation!
              </p>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-purple-300">Cosmic Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-purple-500/20 bg-black/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start space-x-3">
                  {post.profiles?.avatar_url ? (
                    <img
                      src={post.profiles.avatar_url}
                      alt={post.profiles.display_name}
                      className="h-10 w-10 rounded-full border border-purple-400"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400 bg-purple-900/50">
                      <span className="font-bold text-purple-300">
                        {post.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-purple-300">
                        {post.profiles?.display_name || 'Unknown'}
                      </h3>
                      <span className="text-sm text-blue-300">
                        {post.profiles?.zodiac_sign || 'Unknown'}
                      </span>
                    </div>
                    <p className="mb-2 text-gray-200">{post.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No posts yet. The cosmos awaits their first message!
              </p>
            )}
          </div>
        </div>

        {message && (
          <div className="fixed bottom-4 right-4 rounded-lg bg-purple-900/90 px-4 py-2 text-white backdrop-blur-sm">
            {message}
          </div>
        )}
      </div>
    </StarBackground>
  );
}
