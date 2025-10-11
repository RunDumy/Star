import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';

const CollaborationContext = createContext();

const collaborationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: new Map(action.payload) };
    case 'UPDATE_USER_POSITION':
      const newUsers = new Map(state.onlineUsers);
      newUsers.set(action.payload.userId, action.payload);
      return { ...state, onlineUsers: newUsers };
    case 'ADD_CONSTELLATION':
      const newConstellations = new Map(state.constellations);
      newConstellations.set(action.payload.id, action.payload);
      return { ...state, constellations: newConstellations };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'ADD_RECENT_ACTION':
      return { 
        ...state, 
        recentActions: [action.payload, ...state.recentActions.slice(0, 9)] // Keep last 10 actions
      };
    default:
      return state;
  }
};

export const CollaborationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(collaborationReducer, {
    onlineUsers: new Map(),
    constellations: new Map(),
    currentUser: null,
    socket: null,
    isConnected: false,
    recentActions: []
  });

  useEffect(() => {
    // Connect to Flask SocketIO
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to collaboration server');
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Join cosmic collaboration room
      socket.emit('join_cosmic_collaboration', {
        user_id: localStorage.getItem('userId') || 'anonymous'
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('user_position_update', (data) => {
      dispatch({
        type: 'UPDATE_USER_POSITION',
        payload: {
          userId: data.user_id,
          name: data.username,
          position: data.position,
          rotation: data.rotation
        }
      });
    });

    socket.on('constellation_created', (data) => {
      dispatch({
        type: 'ADD_CONSTELLATION',
        payload: data.constellation
      });
    });

    socket.on('collaboration_state', (data) => {
      // Initialize with current state
      if (data.online_users) {
        const usersMap = new Map();
        data.online_users.forEach(user => {
          usersMap.set(user.user_id, {
            userId: user.user_id,
            name: `User ${user.user_id.slice(-4)}`,
            position: [user.x || 0, user.y || 0, user.z || 0],
            rotation: user.rotation || 0
          });
        });
        dispatch({ type: 'SET_ONLINE_USERS', payload: usersMap });
      }

      if (data.constellations) {
        const constellationsMap = new Map();
        data.constellations.forEach(constellation => {
          constellationsMap.set(constellation.id, constellation);
        });
        // Update constellations state
        data.constellations.forEach(constellation => {
          dispatch({ type: 'ADD_CONSTELLATION', payload: constellation });
        });
      }
    });

    socket.on('cosmic_collaboration_joined', (data) => {
      console.log('Joined cosmic collaboration:', data);
    });

    socket.on('action_notification', (data) => {
      dispatch({
        type: 'ADD_RECENT_ACTION',
        payload: {
          id: Date.now(),
          userId: data.user_id,
          username: data.username,
          action: data.action,
          actionType: data.action_type,
          timestamp: data.timestamp
        }
      });
    });

    dispatch({ type: 'SET_SOCKET', payload: socket });

    return () => socket.disconnect();
  }, []);

  const updateUserPosition = async (position, rotation = 0) => {
    if (!state.currentUser) return;

    try {
      await axios.post('/api/v1/collaboration/position', {
        x: position[0],
        y: position[1],
        z: position[2],
        rotation
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const createConstellation = async (constellationData) => {
    try {
      const response = await axios.post('/api/v1/constellations', constellationData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create constellation:', error);
      throw error;
    }
  };

  const triggerZodiacAction = async (actionType, room = 'cosmos') => {
    try {
      const response = await axios.post('/api/v1/action', {
        action_type: actionType,
        room: room
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to trigger zodiac action:', error);
      throw error;
    }
  };

  const getUsersInRoom = () => {
    return Array.from(state.onlineUsers.values());
  };

  const getConstellations = () => {
    return Array.from(state.constellations.values());
  };

  return (
    <CollaborationContext.Provider value={{
      ...state,
      updateUserPosition,
      createConstellation,
      triggerZodiacAction,
      getUsersInRoom,
      getConstellations
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};

CollaborationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};