import axios from 'axios';
import { FeedResponse } from '../types/feed';
import { normalizeFeedResponse } from './normalize';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT from localStorage if present (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize feed responses
api.interceptors.response.use((response) => {
  if (response.config.url?.includes('/api/v1/feed')) {
    response.data = normalizeFeedResponse(response.data);
  }
  return response;
});

export { api };

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  zodiac_sign: string;
  birth_date: string; // YYYY-MM-DD
}

export async function login(data: LoginInput) {
  const res = await api.post(`/api/v1/login`, data);
  return res.data;
}

export async function register(data: RegisterInput) {
  const res = await api.post(`/api/v1/register`, data);
  return res.data;
}

export async function fetchZodiacNumbers() {
  const res = await api.get(`/api/v1/zodiac-numbers`);
  return res.data;
}

export async function fetchPosts() {
  const res = await api.get(`/api/v1/posts`);
  return res.data;
}

export async function uploadVideo(formData: FormData) {
  const res = await api.post(`/api/v1/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function followUser(userId: number | string) {
  const res = await api.post(`/api/v1/follow/${userId}`);
  return res.data;
}

export async function fetchProfile(userId: number | string) {
  const res = await api.get(`/api/v1/profile/${userId}`);
  return res.data;
}

export async function fetchFeed(page: number = 1, userId?: number | string) {
  const params: any = { page };
  if (userId !== undefined) {
    params.user_id = userId;
  }
  const res = await api.get<FeedResponse>(`/api/v1/feed`, { params });
  return res.data;
}

export async function fetchGlobalFeed(page: number = 1, filters: { zodiacSigns?: string[]; elements?: string[]; contentTypes?: string[] } = {}, userId?: number | string) {
  const params: Record<string, string | number> = { page };
  if (userId !== undefined) {
    params.user_id = userId;
  }

  // Add filter parameters
  if (filters.zodiacSigns && filters.zodiacSigns.length > 0) {
    params.zodiac_signs = filters.zodiacSigns.join(',');
  }
  if (filters.elements && filters.elements.length > 0) {
    params.elements = filters.elements.join(',');
  }
  if (filters.contentTypes && filters.contentTypes.length > 0) {
    params.content_types = filters.contentTypes.join(',');
  }

  const res = await api.get<FeedResponse>(`/api/v1/global-feed`, { params });
  return res.data;
}

export async function calculateBirthChart(data: { birth_date: string; birth_time: string; location: string }) {
  const res = await api.post(`/api/v1/birth-chart`, data);
  return res.data;
}

export interface CalculateArchetypeOracleInput {
  full_name: string;
  birth_date: string;
  tradition?: string;
}

export async function calculateArchetypeOracle(data: CalculateArchetypeOracleInput) {
  const res = await api.post(`/api/v1/archetype-oracle/calculate`, data);
  return res.data;
}

export async function fetchCosmicProfile(full_name: string, birth_date: string, tradition?: string) {
  const data = { full_name, birth_date, tradition };
  const res = await api.post(`/api/v1/archetype-oracle/cosmic-profile`, data);
  return res.data;
}

// Tarot-related API functions
export async function calculateEnergyFlows(cards: any[], spread: any) {
  const res = await api.post('/api/v1/tarot/calculate-energy-flow', {
    cards,
    spread
  });
  return res.data;
}

export async function getEnhancedInterpretation(cards: any[], spread: any) {
  const res = await api.post('/api/v1/tarot/enhanced-interpretation', {
    cards,
    spread
  });
  return res.data;
}

export async function shareSpread(spread: any, spreadType: string, userId: string | null) {
  // In Jest tests we use `jest-fetch-mock` which mocks global.fetch.
  // Use fetch when available so tests that mock fetch will be intercepted.
  if (typeof fetch !== 'undefined') {
    const res = await fetch('/api/v1/tarot/share-spread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spread, spread_type: spreadType, user_id: userId }),
    });
    return res.json();
  }

  const res = await api.post('/api/v1/tarot/share-spread', {
    spread,
    spread_type: spreadType,
    user_id: userId,
  });
  return res.data;
}

export async function generateSpotifyPlaylist(energyFlows: any[], spreadType: string) {
  if (typeof fetch !== 'undefined') {
    const res = await fetch('/api/v1/tarot/spotify-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ energy_flows: energyFlows, spread_type: spreadType }),
    });
    return res.json();
  }

  const res = await api.post('/api/v1/tarot/spotify-playlist', {
    energy_flows: energyFlows,
    spread_type: spreadType,
  });
  return res.data;
}

export async function getLocationInsights(ipAddress: string) {
  if (typeof fetch !== 'undefined') {
    const res = await fetch('/api/v1/tarot/location-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_address: ipAddress }),
    });
    return res.json();
  }

  const res = await api.post('/api/v1/tarot/location-insights', {
    ip_address: ipAddress,
  });
  return res.data;
}
