'use client';

import { useState } from 'react';
import Link from 'next/link';
import StarBackground from '../components/StarBackground';
import { login } from '../lib/api';
import DOMPurify from 'dompurify';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const cleanUsername = DOMPurify.sanitize(username);
      const cleanPassword = DOMPurify.sanitize(password);
      const data = await login({ username: cleanUsername, password: cleanPassword });
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      setMessage(data?.message || 'Logged in!');
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <StarBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-black/50 p-6 shadow-lg backdrop-blur">
          <h1 className="mb-4 text-center text-2xl font-bold">Login to Star App</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="sr-only" htmlFor="username">Username</label>
            <input
              id="username"
              className="w-full rounded border border-gray-600 bg-transparent p-2"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="Username"
              required
            />
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              className="w-full rounded border border-gray-600 bg-transparent p-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              required
            />
            <button
              className="w-full rounded bg-blue-600 p-2 hover:bg-blue-500"
              type="submit"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-3 text-center text-sm text-gray-200">{message}</p>}
          <p className="mt-4 text-center text-sm">
            New here? <Link href="/register" className="text-blue-400 underline">Create an account</Link>
          </p>
        </div>
      </div>
    </StarBackground>
  );
}
