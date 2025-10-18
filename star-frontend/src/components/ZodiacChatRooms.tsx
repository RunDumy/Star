'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Flame, MessageCircle, Mountain, Send, Users, Waves, Wind } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

interface ZodiacRoom {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  signs: string[];
  traits: string[];
  is_user_element: boolean;
  online_count: number;
  recent_activity: number;
  user_zodiac: string;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    zodiac_sign: string;
  };
}

interface RoomMember {
  id: string;
  username: string;
  zodiac_sign: string;
  is_online: boolean;
  cosmic_effect: string;
}

const elementIcons = {
  fire: Flame,
  earth: Mountain,
  air: Wind,
  water: Waves
};

const zodiacEmojis = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
};

export default function ZodiacChatRooms() {
  const [rooms, setRooms] = useState<ZodiacRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom);
      fetchMembers(selectedRoom);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/v1/zodiac-rooms');
      setRooms(response.data.rooms);

      // Auto-select user's element room
      const userRoom = response.data.rooms.find((room: ZodiacRoom) => room.is_user_element);
      if (userRoom) {
        setSelectedRoom(userRoom.id);
      }
    } catch (error) {
      console.error('Failed to fetch zodiac rooms:', error);
    }
  };

  const fetchMessages = async (element: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/zodiac-rooms/${element}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (element: string) => {
    try {
      const response = await api.get(`/api/v1/zodiac-rooms/${element}/members`);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;

    setSending(true);
    try {
      await api.post(`/api/v1/zodiac-rooms/${selectedRoom}/messages`, {
        content: newMessage.trim()
      });

      setNewMessage('');
      // Refresh messages
      fetchMessages(selectedRoom);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoomBackgroundClass = (roomId: string) => {
    switch (roomId) {
      case 'fire': return 'bg-red-900/20';
      case 'earth': return 'bg-green-900/20';
      case 'air': return 'bg-blue-900/20';
      case 'water': return 'bg-purple-900/20';
      default: return 'bg-gray-800/20';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const getZodiacEmoji = (sign: string) => {
    return zodiacEmojis[sign.toLowerCase() as keyof typeof zodiacEmojis] || '⭐';
  };

  const renderMessages = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading cosmic conversations...</p>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 text-gray-500 mx-auto mb-4">⭐</div>
          <p className="text-gray-400">No messages yet. Be the first to share your cosmic wisdom!</p>
        </div>
      );
    }

    return messages.map((message) => (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {message.profiles?.username?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium">
              {message.profiles?.username || 'Unknown'}
            </span>
            <span className="text-gray-400 text-sm">
              {getZodiacEmoji(message.profiles?.zodiac_sign || '')}
            </span>
            <span className="text-gray-500 text-xs">
              {formatTime(message.created_at)}
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MessageCircle className="w-10 h-10 text-purple-400" />
            Zodiac Chat Rooms
          </h1>
          <p className="text-gray-300 text-lg">Connect with souls of your elemental tribe</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Room Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">Elemental Tribes</h3>
              <div className="space-y-3">
                {rooms.map((room) => {
                  const IconComponent = elementIcons[room.id as keyof typeof elementIcons];
                  return (
                    <motion.button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${selectedRoom === room.id
                          ? 'border-yellow-400 bg-yellow-900/30'
                          : 'border-gray-600 hover:border-yellow-300'
                        } ${room.is_user_element ? 'ring-2 ring-purple-400/50' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-6 h-6" style={{ color: room.color }} />
                        <div className="text-left">
                          <div className="text-white font-medium">{room.name}</div>
                          {room.is_user_element && (
                            <div className="text-xs text-purple-300">Your Tribe</div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-300 text-sm mb-1">{room.description}</div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{room.online_count} online</span>
                          <span>{room.recent_activity} active</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedRoom ? (
                <motion.div
                  key={selectedRoom}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-lg border border-purple-500/20 h-[600px] flex flex-col"
                >
                  {/* Chat Header */}
                  {rooms.find(r => r.id === selectedRoom) && (
                    <div
                      className={`p-4 border-b border-gray-700 rounded-t-lg ${getRoomBackgroundClass(selectedRoom || '')}`}
                    >
                      <div className="flex items-center gap-3">
                        {React.createElement(elementIcons[selectedRoom as keyof typeof elementIcons], {
                          className: "w-6 h-6",
                          style: { color: rooms.find(r => r.id === selectedRoom)?.color }
                        })}
                        <div>
                          <h3 className="text-white font-semibold">
                            {rooms.find(r => r.id === selectedRoom)?.name}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {rooms.find(r => r.id === selectedRoom)?.signs.map(sign =>
                              `${getZodiacEmoji(sign)} ${sign.charAt(0).toUpperCase() + sign.slice(1)}`
                            ).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Share your cosmic thoughts..."
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-lg border border-purple-500/20 h-[600px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select Your Tribe</h3>
                    <p className="text-gray-400">Choose an elemental chat room to join the cosmic conversation</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Members Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tribe Members
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50">
                    <div className={`w-3 h-3 rounded-full ${member.is_online ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{member.username}</div>
                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        {getZodiacEmoji(member.zodiac_sign)}
                        {member.zodiac_sign.charAt(0).toUpperCase() + member.zodiac_sign.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No members online</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}