'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StarBackground from '../../components/StarBackground';
import { followUser, fetchProfile } from '../../lib/api';

type Engagement = {
  sparks: number;
  echoes?: number;
};

type PostItem = {
  id: number;
  content: string;
  created_at: string;
  engagement: Engagement;
};

type ProfileResponse = {
  profile: {
    username: string;
    zodiac_sign: string;
    chinese_zodiac?: string;
    vedic_zodiac?: string;
    bio?: string;
    join_date: string;
  };
  posts: PostItem[];
};

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProfile(id as string)
      .then((res) => setData(res))
      .catch(() => setMessage('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const onFollow = async () => {
    if (!id) return;
    try {
      const res = await followUser(id as string);
      setMessage(res?.message || 'Followed');
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Failed to follow');
    }
  };

  return (
    <StarBackground>
      <div className="cosmic-container relative z-10 p-4 text-white">
        {loading && <p>Loading…</p>}
        {!loading && data && (
          <>
            <h1 className="mb-2 text-2xl font-bold">{data.profile.username}&apos;s Profile</h1>
            <p className="mb-2">Zodiac: {data.profile.zodiac_sign}</p>
            {data.profile.bio && <p className="mb-2">Bio: {data.profile.bio}</p>}
            <button onClick={onFollow} className="mb-4 rounded bg-blue-600 p-2 hover:bg-blue-500">
              Follow
            </button>
            <h2 className="mb-2 text-xl font-semibold">Posts</h2>
            {data.posts.map((post) => (
              <div key={post.id} className="mb-3 rounded border border-gray-700 p-3">
                <p>{post.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()} — Sparks: {post.engagement.sparks}
                </p>
              </div>
            ))}
          </>
        )}
        {!loading && !data && <p>Profile not found.</p>}
        {message && <p className="mt-3 text-sm text-gray-200">{message}</p>}
      </div>
    </StarBackground>
  );
}
