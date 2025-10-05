import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface ConnectionRequest {
  id: string;
  other_username: string;
  other_id: number;
  status: string;
  zodiac_sign?: string;
  compatibility_score?: number;
}

interface MatchmakingModalProps {
  isOpen: boolean;
  connection: ConnectionRequest | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
  loading: boolean;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  connection,
  onAccept,
  onReject,
  onClose,
  loading
}) => {
  if (!connection) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 rounded-xl w-11/12 max-w-md border border-gold-400/20 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-400">Cosmic Connection</h3>
              <button
                onClick={onClose}
                className="text-purple-300 hover:text-white transition-colors"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            {/* Connection Details */}
            <div className="mb-6 p-4 bg-purple-800/30 rounded-lg border border-purple-600/30">
              <h4 className="text-lg font-semibold text-white mb-2">{connection.other_username}</h4>
              {connection.zodiac_sign && (
                <p className="text-purple-200 mb-1">Sign: {connection.zodiac_sign}</p>
              )}
              {connection.compatibility_score && (
                <p className="text-yellow-300 mb-1">Compatibility: {connection.compatibility_score}%</p>
              )}
              <p className="text-purple-300 text-sm">
                Connection Status: <span className="capitalize">{connection.status}</span>
              </p>
            </div>

            {/* Accept/Reject Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={onAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Accepting...' : 'Accept'}
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
