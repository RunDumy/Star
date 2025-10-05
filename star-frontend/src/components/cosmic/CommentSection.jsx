// star-frontend/src/components/cosmic/CommentSection.jsx
'use client';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { supabase } from '@/lib/supabase';
import { useInfiniteQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export function CommentSection({ postId }) {
  const { ref, inView } = useInView();
  const { socket } = useCollaboration();
  const [comments, setComments] = useState([]);

  const fetchComments = async ({ pageParam = 1 }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${process.env.VITE_API_URL}/api/v1/comments/${postId}?page=${pageParam}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: fetchComments,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.comments.length < 20) return undefined;
      return allPages.length + 1;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    socket.emit('join_post', { post_id: postId });
    socket.on('new_comment', (comment) => {
      if (comment.post_id === postId) {
        setComments((prev) => [comment, ...prev]);
      }
    });
    return () => {
      socket.off('new_comment');
    };
  }, [socket, postId]);

  useEffect(() => {
    const channel = supabase.channel(`comments:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comment', filter: `post_id=eq.${postId}` }, (payload) => {
        setComments((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [postId]);

  if (status === 'loading') return <div className="text-cyan-200">Loading comments...</div>;
  if (status === 'error') return <div className="text-red-400">Error loading comments!</div>;

  return (
    <div className="space-y-4">
      {comments.concat(data?.pages.flatMap(page => page.comments) || []).map((comment, index) => (
        <div
          key={`${comment.id}-${index}`}
          className="cosmic-post-3d cosmic-glow rounded-lg border border-cyan-500/30 p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-lg depth-3"
          style={{ transform: `translateZ(${10 + index * 5}px)` }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {comment.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="text-white font-semibold">{comment.username || 'Cosmic Traveler'}</div>
              <div className="text-gray-400 text-xs">{comment.zodiac_sign}</div>
            </div>
          </div>
          <p className="text-white">{comment.content}</p>
          <div className="text-gray-400 text-xs mt-2">
            {new Date(comment.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
      <div ref={ref} className="text-center">
        {isFetchingNextPage && <div className="text-cyan-200">Loading more comments...</div>}
        {!hasNextPage && <div className="text-gray-500">No more comments to load.</div>}
      </div>
    </div>
  );
}

CommentSection.propTypes = {
  postId: PropTypes.string.isRequired,
};