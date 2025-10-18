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
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
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

// Collaboration API functions
export const collaborationAPI = {
  updatePosition: (position: { x: number; y: number; z: number; rotation?: number }) =>
    api.post('/api/v1/collaboration/position', position),

  createConstellation: (data: {
    name: string;
    stars: any[];
    connections: any[];
    color?: string;
    is_public?: boolean;
  }) => api.post('/api/v1/constellations', data),

  getConstellations: () => api.get('/api/v1/constellations'),
};

export const postsAPI = {
  getPosts: () => api.get('/api/v1/posts'),
  createPost: (postData: any) => api.post('/api/v1/posts', postData),
};

export const zodiacAPI = {
  getNumbers: () => api.get('/api/v1/zodiac-numbers'),

  // Zodiac Arena API
  shareArenaResult: (battleData: {
    winner: string;
    battle_duration: number;
    participant_signs: string[];
    damage_dealt?: number;
  }) => api.post('/api/v1/zodiac-arena/result', battleData),

  // Zodiac Arena Store API
  getStoreItems: () => api.get('/api/v1/zodiac-arena/store'),

  purchaseItem: (purchaseData: {
    item_id: string;
    type: 'BOOST' | 'COSMETIC';
    value: number;
  }) => api.post('/api/v1/zodiac-arena/store', purchaseData),
};

// ========== COSMIC INTELLIGENCE API FUNCTIONS ==========

export interface LunarGuidance {
  moon_phase: string;
  moon_mansion: string;
  mansion_meaning: string;
  void_of_course: boolean;
  illumination: string;
  lunar_day: number;
  best_activities: string[];
  meditation_focus: string;
  mantras: string[];
  element_emphasis: string;
  cosmic_weather: string;
}

export interface MentorGuidance {
  mentor: string;
  archetype: string;
  mood: string;
  response: string;
  lunar_influence: string;
  symbolic_animal: string;
  elemental_affirmation: string;
  ritual_suggestion: string;
  timestamp: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'lunar_cycle' | 'elemental_sequence' | 'mythological_archetype';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  duration_days: number;
  lunar_phase_alignment: string[];
  elemental_focus: string[];
  success_criteria: string[];
  rewards: {
    cosmic_energy: number;
    badges: string[];
    mentor_sessions: number;
  };
  progress: {
    current_step: number;
    total_steps: number;
    completed_at?: string;
    success_probability: number;
  };
  created_at: string;
  expires_at?: string;
}

export interface CosmicStats {
  user_id: string;
  total_quests_completed: number;
  current_active_quests: number;
  mentor_sessions: number;
  lunar_cycles_tracked: number;
  cosmic_energy_level: number;
  elemental_balance: Record<string, number>;
  zodiac_compatibility_score: number;
  engagement_streak: number;
  achievements_unlocked: string[];
  last_activity: string;
}

export const cosmicAPI = {
  // Lunar Intelligence
  getLunarGuidance: (date?: string): Promise<LunarGuidance> =>
    api.get('/api/v1/lunar/guidance', { params: date ? { date } : {} }),

  getLunarAlchemy: (date?: string): Promise<any> =>
    api.get('/api/v1/lunar/alchemy', { params: date ? { date } : {} }),

  // Archetypal Mentors
  getMentorGuidance: (question: string, userData?: any): Promise<MentorGuidance> =>
    api.post('/api/v1/mentors/guidance', { question, user_data: userData }),

  getMentorHistory: (limit: number = 10): Promise<MentorGuidance[]> =>
    api.get('/api/v1/mentors/history', { params: { limit } }),

  // Ritual Quests
  getRecommendedQuests: (userData?: any): Promise<Quest[]> =>
    api.post('/api/v1/quests/recommend', { user_data: userData }),

  getActiveQuests: (): Promise<Quest[]> =>
    api.get('/api/v1/quests/active'),

  startQuest: (questId: string): Promise<Quest> =>
    api.post(`/api/v1/quests/${questId}/start`),

  updateQuestProgress: (questId: string, progress: any): Promise<Quest> =>
    api.put(`/api/v1/quests/${questId}/progress`, progress),

  completeQuest: (questId: string, results: any): Promise<any> =>
    api.post(`/api/v1/quests/${questId}/complete`, results),

  // Cosmic Statistics
  getCosmicStats: (): Promise<CosmicStats> =>
    api.get('/api/v1/cosmic/stats'),

  getCosmicAchievements: (): Promise<any[]> =>
    api.get('/api/v1/cosmic/achievements'),

  // Social Feed Integration
  shareQuestProgress: (questId: string, message?: string): Promise<any> =>
    api.post('/api/v1/social/quest-share', { quest_id: questId, message }),

  shareMentorInsight: (mentorName: string, insight: string): Promise<any> =>
    api.post('/api/v1/social/mentor-share', { mentor: mentorName, insight }),

  shareLunarEvent: (eventType: string, details: any): Promise<any> =>
    api.post('/api/v1/social/lunar-share', { event_type: eventType, details }),
};
