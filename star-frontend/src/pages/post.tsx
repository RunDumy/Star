'use client';

import { useState } from 'react';
import StarBackground from '../components/StarBackground';
import { uploadVideo } from '../lib/api';
import DOMPurify from 'dompurify';

export default function Post() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage('Please select a video.');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const cleanContent = DOMPurify.sanitize(content);
      formData.append('content', cleanContent);
      const res = await uploadVideo(formData);
      setMessage(res?.message || 'Video posted!');
      setContent('');
      setFile(null);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Failed to post video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarBackground>
      <div className="cosmic-container relative z-10 p-4 text-white">
        <h1 className="mb-4 text-center text-2xl font-bold">Create Cosmic Post</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="sr-only" htmlFor="content">Post content</label>
          <textarea
            id="content"
            className="w-full rounded border border-gray-600 bg-transparent p-2"
            placeholder="What's your zodiac vibe?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Post content"
            rows={4}
          />
          <label className="sr-only" htmlFor="file">Video upload</label>
          <input
            id="file"
            className="w-full rounded border border-gray-600 bg-transparent p-2"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            aria-label="Video upload"
          />
          <button
            className="w-full rounded bg-blue-600 p-2 hover:bg-blue-500 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Posting…' : 'Post Video'}
          </button>
        </form>
        {message && <p className="mt-3 text-center text-sm text-gray-200">{message}</p>}
      </div>
    </StarBackground>
  );
}
