import axios from 'axios';

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
