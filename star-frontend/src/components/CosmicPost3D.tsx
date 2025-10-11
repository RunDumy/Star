'use client';
import { MessageCircle, Share2, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import LazyLoad from 'react-lazyload';
import { SparkButton3D } from './SparkButton3D';
import { CommentSection } from './cosmic/CommentSection';

interface CosmicPost3DProps {
  post: {
    id: number;
    content: string;
    username: string;
    zodiac_sign: string;
    image_url?: string;
    video_url?: string;
    hls_url?: string;
    spark_count: number;
    echo_count: number;
    comment_count: number;
    created_at: string;
  };
  index: number;
}

export function CosmicPost3D({ post, index }: CosmicPost3DProps) {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const postRef = useRef<HTMLDivElement>(null);

  // Determine animation class based on post index for variety
  const getAnimationClass = () => {
    const animations = [
      'cosmic-float-3d',
      'cosmic-float-3d-reverse',
      'cosmic-float-3d-slow'
    ];
    return animations[index % animations.length];
  };

  // Mouse move handler for interactive 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!postRef.current) return;

    const rect = postRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Calculate 3D transform based on mouse position
  const get3DTransform = () => {
    const rotateX = mousePosition.y * 10; // Tilt on X axis
    const rotateY = mousePosition.x * -10; // Tilt on Y axis
    const translateZ = Math.abs(mousePosition.x + mousePosition.y) * 20; // Depth on Z axis

    return {
      '--mouse-rotate-x': `${rotateX}deg`,
      '--mouse-rotate-y': `${rotateY}deg`,
      '--mouse-translate-z': `${translateZ}px`,
    };
  };

  return (
    <article
      ref={postRef}
      className={`
        cosmic-post-3d cosmic-glow rounded-2xl border border-purple-500/30 p-6 shadow-2xl
        bg-gradient-to-br from-purple-900/30 to-blue-900/20 backdrop-blur-lg
        ${getAnimationClass()}
      `}
      // eslint-disable-next-line react/style-prop-object
      style={get3DTransform() as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Header with Depth Layers */}
      <header className="flex items-center justify-between mb-4 depth-1">
        <div className="flex items-center space-x-3">
          {/* 3D Avatar with floating effect */}
          <div
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold cosmic-pulse depth-3"
            // eslint-disable-next-line @next/next/no-css-in-js
            style={{
              '--depth-mouse-z': `${mousePosition.x * 5}px`
            } as React.CSSProperties}
          >
            {post.username.charAt(0).toUpperCase()}
          </div>
          <div className="depth-2">
            <div className="text-white font-semibold">{post.username}</div>
            <div className="text-purple-300 text-sm">{post.zodiac_sign}</div>
          </div>
        </div>
        <time className="text-gray-400 text-sm depth-1">
          {new Date(post.created_at).toLocaleDateString()}
        </time>
      </header>

      {/* 3D Content with Interactive Depth */}
      <button
        className={`text-white mb-4 transition-all duration-300 depth-2 text-left ${
          isExpanded ? '' : 'line-clamp-3'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        // eslint-disable-next-line
        style={{
          '--depth-mouse-z': `${Math.abs(mousePosition.y) * 5}px`
        } as React.CSSProperties}
        aria-expanded={isExpanded}
      >
        {post.content}
      </button>

      {/* 3D Media with Parallax Effect */}
      {post.image_url && (
        <figure
          className="mb-4 rounded-xl overflow-hidden border border-purple-500/30 depth-3"
          // eslint-disable-next-line
          style={{
            '--depth-mouse-z': `${Math.abs(mousePosition.x) * 10}px`
          } as React.CSSProperties}
        >
          <img
            src={post.image_url}
            alt="Post media"
            className="w-full h-auto max-h-96 object-cover transition-transform duration-700 hover:scale-110"
          />
        </figure>
      )}

      {post.video_url && (
        <figure
          className="mb-4 rounded-xl overflow-hidden border border-purple-500/30 depth-3"
          // eslint-disable-next-line
          style={{
            '--depth-mouse-z': `${Math.abs(mousePosition.x) * 10}px`
          } as React.CSSProperties}
        >
          <LazyLoad height={384} offset={100}>
            {post.hls_url || post.video_url ? (
              <video
                src={post.hls_url || post.video_url}
                controls
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : post.image_url ? (
              <img
                src={post.image_url}
                alt={post.content}
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : null}
          </LazyLoad>
        </figure>
      )}

      {/* 3D Engagement Stats */}
      <div
        className="flex justify-between items-center text-sm text-gray-400 mb-4 depth-1"
        // eslint-disable-next-line
        style={{
          '--depth-mouse-z': `${Math.abs(mousePosition.y) * 3}px`
        } as React.CSSProperties}
      >
        <div className="flex space-x-4">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>{post.spark_count}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Share2 className="w-4 h-4" />
            <span>{post.echo_count}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comment_count}</span>
          </span>
        </div>
      </div>

      {/* 3D Action Buttons */}
      <div
        className="flex space-x-4 border-t border-purple-500/20 pt-4 depth-2"
        // eslint-disable-next-line
        style={{
          '--depth-mouse-z': `${Math.abs(mousePosition.x) * 4}px`
        } as React.CSSProperties}
      >
        <SparkButton3D
          isSparked={false} // This would come from props/state
          sparkCount={post.spark_count}
          onSpark={() => console.log('Spark clicked')}
          size="md"
          variant="cosmic"
        />

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110 hover:translateZ(10px)"
          aria-label="Toggle comments"
          aria-expanded={!!showComments}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors transform hover:scale-110 hover:translateZ(10px)"
          aria-label="Echo this post"
        >
          <Share2 className="w-5 h-5" />
          <span>Echo</span>
        </button>
      </div>

      {/* 3D Comments Section */}
      {showComments && (
        <section
          className="mt-4 border-t border-purple-500/20 pt-4 depth-4"
          // eslint-disable-next-line
          style={{
            '--depth-mouse-z': '0px'
          } as React.CSSProperties}
        >
          <CommentSection postId={post.id.toString()} />
        </section>
      )}
    </article>
  );
}