'use client';

import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface NotificationMetadata {
  cosmic_effect?: string;
  sender_username?: string;
  sender_zodiac?: string;
  group_id?: string;
}

interface CosmicNotificationsProps {
  className?: string;
}

// Shooting Star Component
const ShootingStar = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white rounded-full"
    initial={{ x: -10, y: -10, opacity: 0 }}
    animate={{
      x: [0, 100],
      y: [0, 100],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 10 + 5,
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

// Constellation Pattern Component
const ConstellationPattern = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Constellation lines */}
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="constellation" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Ursa Major (Big Dipper) */}
      <path d="M50,50 L80,45 L110,60 L140,55 L170,70 L200,65 L230,80"
        stroke="url(#constellation)" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Orion's Belt */}
      <path d="M250,120 L280,125 L310,120"
        stroke="url(#constellation)" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Random connecting lines */}
      <path d="M100,200 L130,180 L160,190 L190,170"
        stroke="url(#constellation)" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>

    {/* Shooting stars */}
    {Array.from({ length: 3 }).map((_, i) => (
      <ShootingStar key={Math.random().toString(36).slice(2, 11)} delay={i * 3} />
    ))}
  </div>
);

export default function CosmicNotifications({ className = '' }: Readonly<CosmicNotificationsProps>) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/notifications?limit=20');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.notifications.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/v1/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getNotificationIcon = (type: string, metadata?: NotificationMetadata) => {
    const cosmicEffect = metadata?.cosmic_effect;
    switch (type) {
      case 'like':
        return cosmicEffect === 'fiery_burst' ? '�' : cosmicEffect === 'golden_shine' ? '✨' : '�💫';
      case 'comment':
        return cosmicEffect === 'wind_whisper' ? '🌬️' : cosmicEffect === 'dreamy_wave' ? '🌊' : '💬';
      case 'follow':
        return cosmicEffect === 'electric_spark' ? '⚡' : cosmicEffect === 'mystical_shadow' ? '🌑' : '⭐';
      case 'cosmic_signal':
        return cosmicEffect === 'cosmic_twinkle' ? '�' : '�🌌';
      case 'star_points':
        return '✨';
      case 'level_up':
        return '🚀';
      case 'group_chat':
        return getGroupChatIcon(metadata);
      default:
        return '🔔';
    }
  };

  const getGroupChatIcon = (metadata?: NotificationMetadata) => {
    const effect = metadata?.cosmic_effect;
    switch (effect) {
      case 'fiery_burst': return '🔥💬';
      case 'earth_glow': return '🌍💬';
      case 'wind_whisper': return '🌪️💬';
      case 'water_ripple': return '🌊💬';
      case 'golden_shine': return '🌟💬';
      case 'crystal_clarity': return '💎💬';
      case 'balance_harmony': return '⚖️💬';
      case 'mystical_shadow': return '🌑💬';
      case 'arrow_light': return '🏹💬';
      case 'mountain_steady': return '🏔️💬';
      case 'electric_spark': return '⚡💬';
      case 'dreamy_wave': return '🌊💬';
      default: return '💬';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-2xl border border-purple-500/20 z-50"
          >
            <ConstellationPattern />
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
              <h3 className="text-lg font-semibold text-white">Cosmic Signals</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </motion.button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                  title="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  Loading signals...
                </div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">🌌</div>
                  <p>No cosmic signals yet</p>
                  <p className="text-sm">Your notifications will appear here</p>
                </div>
              )}
              {!loading && notifications.length > 0 && (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors ${!notification.is_read ? 'bg-purple-900/20' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white text-sm">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <motion.button
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}