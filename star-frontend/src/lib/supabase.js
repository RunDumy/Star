import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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