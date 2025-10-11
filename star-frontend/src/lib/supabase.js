import { createClient } from '@supabase/supabase-js';

// Supabase client (keeping for backward compatibility - migrated to Azure Cosmos DB)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User profile functions
export async function getProfile(userId) {
  try {
    // Mock implementation - replace with Azure Cosmos DB call
    console.log('Getting profile for user:', userId);
    return {
      id: userId,
      name: 'Cosmic Explorer',
      zodiacSign: 'aries',
      avatar: null,
      bio: 'Exploring the cosmos...',
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

export async function getFriends(userId) {
  try {
    // Mock implementation - replace with Azure Cosmos DB call
    console.log('Getting friends for user:', userId);
    return [];
  } catch (error) {
    console.error('Error getting friends:', error);
    throw error;
  }
}

export async function getPosts(userId) {
  try {
    // Mock implementation - replace with Azure Cosmos DB call
    console.log('Getting posts for user:', userId);
    return [];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
}

export async function sendFriendRequest(fromUserId, toUserId) {
  try {
    // Mock implementation - replace with Azure Cosmos DB call
    console.log('Sending friend request from', fromUserId, 'to', toUserId);
    return { success: true };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

// Auth hook (placeholder - using AuthContext instead)
export function useAuth() {
  // This should be replaced with the actual AuthContext
  console.warn('useAuth from lib/supabase is deprecated. Use AuthContext instead.');
  return {
    user: null,
    loading: false,
    signIn: async () => {},
    signOut: async () => {},
  };
}