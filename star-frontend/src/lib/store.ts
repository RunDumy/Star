import { create } from "zustand";

interface CosmicState {
  mood: { mood: string; intensity: number };
  setMood: (mood: { mood: string; intensity: number }) => void;
  notifications: { id: string; message: string; urgency: string }[];
  setNotifications: (notifications: { id: string; message: string; urgency: string }[]) => void;
  orbs: { id: string; message: string; emotionalTone: string; anonymity: boolean; timestamp: string; responses: any[] }[];
  setOrbs: (orbs: { id: string; message: string; emotionalTone: string; anonymity: boolean; timestamp: string; responses: any[] }[]) => void;
  connections: { id: string; name: string; zodiac: string; emotionalState: string; engagement: number }[];
  setConnections: (connections: { id: string; name: string; zodiac: string; emotionalState: string; engagement: number }[]) => void;
  posts: { id: string; content: string; author: string; zodiacEmoji: string; emotionalTone: string; timestamp: string }[];
  setPosts: (posts: { id: string; content: string; author: string; zodiacEmoji: string; emotionalTone: string; timestamp: string }[]) => void;
}

export const useStore = create<CosmicState>((set) => ({
  mood: { mood: "Neutral", intensity: 0.5 },
  setMood: (mood) => set({ mood }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  orbs: [],
  setOrbs: (orbs) => set({ orbs }),
  connections: [],
  setConnections: (connections) => set({ connections }),
  posts: [],
  setPosts: (posts) => set({ posts }),
}));