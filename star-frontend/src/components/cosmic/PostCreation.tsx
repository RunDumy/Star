'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function PostCreation({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !image && !video) return;

    setIsSubmitting(true);
    if (!supabase) {
      console.error('Supabase client not available');
      setIsSubmitting(false);
      return;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      console.error('No session found:', error);
      setIsSubmitting(false);
      return;
    }
    const session = data.session;
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create post');
      setContent('');
      setImage(null);
      setVideo(null);
      setTags([]);
      setTagInput('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 parallax-layer cosmic-post-creation">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your cosmic thoughts..."
        className="bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white w-full max-w-xs cosmic-float-3d focus:outline-none focus:ring-2 focus:ring-purple-400"
        rows={4}
      />
      <div className="mt-2">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add zodiac tags (e.g., Aries, Taurus)..."
            className="bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-purple-600/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex space-x-4 mt-2">
        <label className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
          <span>📷 Image</span>
        </label>
        <label className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 cursor-pointer">
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            className="hidden"
          />
          <span>🎥 Video</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 hover:translateZ(10px) ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Posting...' : '🌟 Post'}
      </button>
    </form>
  );
}