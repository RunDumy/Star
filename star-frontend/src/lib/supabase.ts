import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables.')
}

// Only create client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper functions for common operations
export const getCurrentUser = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

// Profile operations
export const getProfile = async (userId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: any) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createProfile = async (profile: any) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data
}

// Friends operations
export const getFriends = async (userId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      profiles!friends_friend_id_fkey (
        display_name,
        zodiac_sign,
        bio,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted')

  if (error) throw error
  return data
}

export const sendFriendRequest = async (userId: string, friendId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const acceptFriendRequest = async (userId: string, friendId: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('user_id', friendId)
    .eq('friend_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Posts operations
export const getPosts = async (userId?: string, limit = 20, offset = 0) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (
        display_name,
        zodiac_sign,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const createPost = async (post: any) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data
}

// Interactions operations
export const addInteraction = async (interaction: any) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('interactions')
    .insert(interaction)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getInteractions = async (userId: string, limit = 50) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      profiles!interactions_target_user_id_fkey (
        display_name,
        zodiac_sign
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}