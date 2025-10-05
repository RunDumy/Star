import { createClient } from '@supabase/supabase-js';
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const CollaborationContext = createContext();

export const CollaborationProvider = ({ children, roomId = 'cosmic-collaboration' }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [avatars, setAvatars] = useState(new Map());
  const [constellations, setConstellations] = useState(new Map());
  const [userPresence, setUserPresence] = useState(null);
  const heartbeatRef = useRef(null);
  const userIdRef = useRef(null);

  // Generate or get user ID
  const getUserId = useCallback(() => {
    if (!userIdRef.current) {
      userIdRef.current = localStorage.getItem('cosmic-user-id') ||
        `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cosmic-user-id', userIdRef.current);
    }
    return userIdRef.current;
  }, []);

  // Process presence state into users map
  const processPresenceState = useCallback((presenceState) => {
    const users = new Map();
    Object.values(presenceState).forEach((presences) => {
      presences.forEach((presence) => {
        users.set(presence.id, presence);
      });
    });
    return users;
  }, []);

  // Initialize user presence
  const initializePresence = useCallback(async () => {
    const userId = getUserId();
    const userData = {
      id: userId,
      name: `Cosmic Explorer ${userId.slice(-4)}`,
      avatar: {
        position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        shape: ['sphere', 'cube', 'pyramid'][Math.floor(Math.random() * 3)],
        size: 0.5,
      },
      lastSeen: new Date().toISOString(),
      roomId,
    };

    setCurrentUser(userData);
    setUserPresence(userData);

    // Join presence channel
    const channel = supabase.channel(`cosmic-presence-${roomId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Handle presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = processPresenceState(presenceState);
        setOnlineUsers(users);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userData);
        }
      });

    // Handle avatar updates
    const avatarChannel = supabase.channel(`cosmic-avatars-${roomId}`)
      .on('broadcast', { event: 'avatar-update' }, ({ payload }) => {
        setAvatars(prev => new Map(prev).set(payload.userId, payload.avatar));
      })
      .on('broadcast', { event: 'constellation-update' }, ({ payload }) => {
        setConstellations(prev => new Map(prev).set(payload.constellationId, payload.constellation));
      })
      .subscribe();

    // Start heartbeat to maintain presence
    heartbeatRef.current = setInterval(async () => {
      await channel.track({
        ...userData,
        lastSeen: new Date().toISOString(),
      });
    }, 30000); // Update every 30 seconds

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      channel.unsubscribe();
      avatarChannel.unsubscribe();
    };
  }, [roomId, getUserId, processPresenceState]);

  // Update user avatar
  const updateAvatar = useCallback(async (avatarData) => {
    if (!currentUser) return;

    const updatedAvatar = { ...currentUser.avatar, ...avatarData };
    const updatedUser = { ...currentUser, avatar: updatedAvatar };

    setCurrentUser(updatedUser);
    setUserPresence(updatedUser);

    // Broadcast avatar update
    await supabase.channel(`cosmic-avatars-${roomId}`).send({
      type: 'broadcast',
      event: 'avatar-update',
      payload: {
        userId: currentUser.id,
        avatar: updatedAvatar,
      },
    });
  }, [currentUser, roomId]);

  // Create constellation
  const createConstellation = useCallback(async (constellationData) => {
    if (!currentUser) return null;

    const constellationId = `constellation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const constellation = {
      id: constellationId,
      creatorId: currentUser.id,
      name: constellationData.name || 'New Constellation',
      stars: constellationData.stars || [],
      connections: constellationData.connections || [],
      theme: constellationData.theme || 'default',
      createdAt: new Date().toISOString(),
      collaborators: [currentUser.id],
    };

    setConstellations(prev => new Map(prev).set(constellationId, constellation));

    // Broadcast constellation creation
    await supabase.channel(`cosmic-avatars-${roomId}`).send({
      type: 'broadcast',
      event: 'constellation-update',
      payload: {
        constellationId,
        constellation,
      },
    });

    return constellationId;
  }, [currentUser, roomId]);

  // Update constellation
  const updateConstellation = useCallback(async (updatedConstellation) => {
    if (!currentUser || !updatedConstellation.id) return;

    setConstellations(prev => {
      const newMap = new Map(prev);
      newMap.set(updatedConstellation.id, updatedConstellation);

      // Broadcast update
      supabase.channel(`cosmic-avatars-${roomId}`).send({
        type: 'broadcast',
        event: 'constellation-update',
        payload: {
          constellationId: updatedConstellation.id,
          constellation: updatedConstellation,
        },
      });

      return newMap;
    });
  }, [currentUser, roomId]);

  // Delete constellation
  const deleteConstellation = useCallback(async (constellationId) => {
    if (!currentUser) return;

    setConstellations(prev => {
      const newMap = new Map(prev);
      newMap.delete(constellationId);

      // Broadcast deletion (you might want to handle this differently)
      supabase.channel(`cosmic-avatars-${roomId}`).send({
        type: 'broadcast',
        event: 'constellation-update',
        payload: {
          constellationId,
          constellation: null, // Indicates deletion
        },
      });

      return newMap;
    });
  }, [currentUser, roomId]);

  // Get users in current room
  const getUsersInRoom = useCallback(() => {
    return Array.from(onlineUsers.values());
  }, [onlineUsers]);

  // Get constellations in current room
  const getConstellations = useCallback(() => {
    return Array.from(constellations.values());
  }, [constellations]);

  // Initialize on mount
  useEffect(() => {
    const cleanup = initializePresence();
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [initializePresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(() => ({
    // State
    onlineUsers,
    currentUser,
    isConnected,
    avatars,
    constellations,
    userPresence,

    // Actions
    updateAvatar,
    createConstellation,
    updateConstellation,
    getUsersInRoom,
    getConstellations,

    // Utilities
    roomId,
  }), [
    onlineUsers,
    currentUser,
    isConnected,
    avatars,
    constellations,
    userPresence,
    updateAvatar,
    createConstellation,
    updateConstellation,
    getUsersInRoom,
    getConstellations,
    roomId,
  ]);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

CollaborationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  roomId: PropTypes.string,
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};