'use client';

import { useState } from 'react';
import StarBackground from '../components/StarBackground';
import { register } from '../lib/api';
import DOMPurify from 'dompurify';

const ZODIACS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [zodiacSign, setZodiacSign] = useState('Aries');
  const [birthDate, setBirthDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const cleanUsername = DOMPurify.sanitize(username);
      const cleanPassword = DOMPurify.sanitize(password);
      const data = await register({
        username: cleanUsername,
        password: cleanPassword,
        zodiac_sign: zodiacSign,
        birth_date: birthDate,
      });
      setMessage(data?.message || 'Registered!');
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <StarBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-black/50 p-6 shadow-lg backdrop-blur">
          <h1 className="mb-4 text-center text-2xl font-bold">Register for Star App</h1>
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
              minLength={6}
            />
            <label className="sr-only" htmlFor="zodiac">Zodiac Sign</label>
            <select
              id="zodiac"
              className="w-full rounded border border-gray-600 bg-transparent p-2"
              value={zodiacSign}
              onChange={(e) => setZodiacSign(e.target.value)}
              aria-label="Zodiac Sign"
            >
              {ZODIACS.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="birthdate">Birth Date</label>
            <input
              id="birthdate"
              className="w-full rounded border border-gray-600 bg-transparent p-2"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              aria-label="Birth Date"
              required
            />
            <button
              className="w-full rounded bg-blue-600 p-2 hover:bg-blue-500"
              type="submit"
            >
              Register
            </button>
          </form>
          {message && <p className="mt-3 text-center text-sm text-gray-200">{message}</p>}
          <p className="mt-4 text-center text-sm">
            Have an account? <a href="/login" className="text-blue-400 underline">Login</a>
          </p>
        </div>
      </div>
    </StarBackground>
  );
}
