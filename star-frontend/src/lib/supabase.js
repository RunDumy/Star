import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

function getSupabaseClient() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            // Instead of throwing, create a mock client that won't work but won't crash
            console.warn('Supabase environment variables not available, using mock client')
            supabaseClient = {
                auth: {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
                    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
                    signOut: () => Promise.resolve({ error: null })
                },
                from: () => ({
                    select: () => ({ data: null, error: new Error('Supabase not configured') }),
                    insert: () => ({ data: null, error: new Error('Supabase not configured') }),
                    update: () => ({ data: null, error: new Error('Supabase not configured') }),
                    delete: () => ({ data: null, error: new Error('Supabase not configured') })
                })
            }
        } else {
            supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
        }
    }
    return supabaseClient
}

// Always export a client object, but delay actual initialization
export const supabase = getSupabaseClient()

// Auth helpers
export const auth = {
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return { data: { user }, error: null }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}

// Database helpers
export const db = {
    from(table) {
        return supabase.from(table)
    }
}

// Real-time helpers (using Supabase Realtime)
export const realtime = {
    channel(channelName) {
        return supabase.channel(channelName)
    },
    removeChannel(channel) {
        return supabase.removeChannel(channel)
    }
}