'use client';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, currentUser } = useCollaboration();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const { notifications: notifs } = await response.json();
        setNotifications(notifs);
      }
    };

    fetchNotifications();

    socket.emit('join_notifications', { user_id: currentUser?.id });
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        className: "bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30",
      });
    });

    return () => socket.off('notification');
  }, [socket, currentUser]);

  const handleMarkRead = async (notificationId: string) => {
    const { data: { session } } = await supabase!.auth.getSession();
    if (!session) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
  };

  return (
    <div className="fixed top-4 right-4 max-w-xs w-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-4 text-white shadow-2xl cosmic-glow z-50">
      <h4 className="font-semibold mb-4 text-cyan-200">🌟 Cosmic Notifications</h4>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {notifications.length === 0 && (
          <div className="text-gray-400 text-sm">No new cosmic messages...</div>
        )}
        {notifications.map((notification) => (
          <button
            key={notification.id}
            className={`w-full text-left p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
              notification.is_read ? 'bg-gray-700/50' : 'bg-purple-500/30'
            }`}
            onClick={() => !notification.is_read && handleMarkRead(notification.id)}
            disabled={notification.is_read}
          >
            <div className="text-sm">{notification.message}</div>
            <div className="text-xs text-gray-400">
              {new Date(notification.created_at).toLocaleTimeString()}
            </div>
          </button>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}