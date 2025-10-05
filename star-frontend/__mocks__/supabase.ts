export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null })
  },
  from: () => ({
    select: () => ({ single: async () => ({ data: null, error: null }) }),
    insert: () => ({ select: async () => ({ data: null, error: null }) }),
    update: () => ({ select: async () => ({ data: null, error: null }) }),
    order: () => ({ range: async () => ({ data: [], error: null }) })
  })
};
export default supabase;
