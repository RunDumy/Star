// Supabase stub - migrated to Azure Cosmos DB
// This is a compatibility layer for the migration process

export const supabase = {
    auth: {
        async getUser() {
            // Return mock user data or implement Azure authentication
            return {
                data: {
                    user: null
                }
            };
        },
        async signOut() {
            // Implement Azure logout or redirect
            return Promise.resolve();
        },
        onAuthStateChange(callback) {
            // Mock auth state change listener
            return {
                data: { subscription: null },
                unsubscribe: () => { }
            };
        }
    },
    from(table) {
        // Mock database operations - replace with Azure API calls
        return {
            select(columns) {
                return {
                    eq(column, value) {
                        return {
                            single() {
                                return Promise.resolve({ data: null, error: null });
                            }
                        };
                    }
                };
            },
            insert(data) {
                return Promise.resolve({ data: null, error: null });
            },
            update(data) {
                return {
                    eq(column, value) {
                        return Promise.resolve({ data: null, error: null });
                    }
                };
            },
            delete() {
                return {
                    eq(column, value) {
                        return Promise.resolve({ data: null, error: null });
                    }
                };
            }
        };
    },
    channel(channelName) {
        // Mock real-time channel - replace with SignalR or Socket.IO
        return {
            on(event, callback) {
                return this;
            },
            subscribe(callback) {
                if (callback) callback();
                return this;
            },
            unsubscribe() {
                return Promise.resolve();
            }
        };
    },
    removeChannel(channel) {
        // Mock channel removal
        return Promise.resolve();
    }
};