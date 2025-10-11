// platforms/star-app/src/components/cosmic/EnhancedCosmicUI.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Moon, Settings, Star, Sun, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

// Context and Hooks
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

// Data
import { ELEMENT_COLORS, ZODIAC_SYSTEMS } from '@/lib/zodiacSystems';

// Enhanced Cosmic UI Component
export const EnhancedCosmicUI = ({
  selectedElement,
  activeMode,
  onModeChange,
  voiceActive,
  onElementSelect
}) => {
  const { theme, updateTheme } = useCosmicTheme();
  const { onlineUsers, currentUser, constellations } = useCollaboration();
  const { isListening, startListening, stopListening } = useVoiceCommands();

  const [uiMode, setUiMode] = useState('minimal'); // minimal, expanded, full
  const [activePanel, setActivePanel] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [systemStats, setSystemStats] = useState({
    western: 0,
    chinese: 0,
    vedic: 0
  });

  // Update system stats based on online users
  useEffect(() => {
    const stats = { western: 0, chinese: 0, vedic: 0 };
    Array.from(onlineUsers.keys()).forEach((userId, index) => {
      const systemIndex = index % 3;
      if (systemIndex === 0) stats.western++;
      else if (systemIndex === 1) stats.chinese++;
      else stats.vedic++;
    });
    setSystemStats(stats);
  }, [onlineUsers]);

  // Voice command handlers
  const voiceCommands = {
    'show menu': () => setUiMode('expanded'),
    'hide menu': () => setUiMode('minimal'),
    'open social': () => setActivePanel('social'),
    'open settings': () => setActivePanel('settings'),
    'change theme': () => updateTheme({ ...theme, mode: theme.mode === 'dark' ? 'light' : 'dark' }),
    'select western': () => onElementSelect('WESTERN'),
    'select chinese': () => onElementSelect('CHINESE'),
    'select vedic': () => onElementSelect('VEDIC')
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top Navigation Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 p-4 pointer-events-auto"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TopNavigationBar
          uiMode={uiMode}
          onModeChange={setUiMode}
          voiceActive={voiceActive}
          onVoiceToggle={isListening ? stopListening : startListening}
          systemStats={systemStats}
        />
      </motion.div>

      {/* Left Side Panel */}
      <AnimatePresence>
        {uiMode !== 'minimal' && (
          <motion.div
            className="absolute left-4 top-20 bottom-20 w-80 pointer-events-auto"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <LeftSidePanel
              activePanel={activePanel}
              onPanelChange={setActivePanel}
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              activeMode={activeMode}
              onModeChange={onModeChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Panel */}
      <AnimatePresence>
        {uiMode === 'full' && (
          <motion.div
            className="absolute right-4 top-20 bottom-20 w-80 pointer-events-auto"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <RightSidePanel
              onlineUsers={onlineUsers}
              constellations={constellations}
              notifications={notifications}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BottomActionBar
          activeMode={activeMode}
          onModeChange={onModeChange}
          voiceActive={voiceActive}
        />
      </motion.div>

      {/* Floating Notifications */}
      <div className="absolute top-20 right-4 space-y-2 pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
              }}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Voice Command Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <VoiceIndicator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Top Navigation Bar Component
const TopNavigationBar = ({
  uiMode,
  onModeChange,
  voiceActive,
  onVoiceToggle,
  systemStats
}) => {
  const { theme } = useCosmicTheme();

  return (
    <motion.div
      className="flex items-center justify-between bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/10"
      whileHover={{ scale: 1.02 }}
    >
      {/* Left Section - System Stats */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Western: {systemStats.western}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Chinese: {systemStats.chinese}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Vedic: {systemStats.vedic}</span>
        </div>
      </div>

      {/* Center Section - Title */}
      <div className="text-center">
        <h1 className="text-white text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          STAR COSMOS
        </h1>
        <p className="text-white/60 text-xs">Multi-System Zodiac Universe</p>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-3">
        {/* Voice Control */}
        <motion.button
          className={`p-2 rounded-full ${voiceActive ? 'bg-purple-500' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onVoiceToggle}
        >
          <Zap className={`w-4 h-4 ${voiceActive ? 'text-white' : 'text-white/60'}`} />
        </motion.button>

        {/* UI Mode Toggle */}
        <motion.button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const modes = ['minimal', 'expanded', 'full'];
            const currentIndex = modes.indexOf(uiMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            onModeChange(modes[nextIndex]);
          }}
        >
          {uiMode === 'minimal' && <Moon className="w-4 h-4 text-white/60" />}
          {uiMode === 'expanded' && <Sun className="w-4 h-4 text-white/60" />}
          {uiMode === 'full' && <Star className="w-4 h-4 text-white/60" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Left Side Panel Component
const LeftSidePanel = ({
  activePanel,
  onPanelChange,
  selectedElement,
  onElementSelect,
  activeMode,
  onModeChange
}) => {
  const panels = [
    { id: 'systems', label: 'Zodiac Systems', icon: Star },
    { id: 'elements', label: 'Elements', icon: Zap },
    { id: 'modes', label: 'Interaction Modes', icon: Settings },
    { id: 'social', label: 'Social', icon: Users }
  ];

  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 h-full overflow-hidden"
      layout
    >
      {/* Panel Tabs */}
      <div className="flex border-b border-white/10">
        {panels.map(panel => {
          const Icon = panel.icon;
          return (
            <motion.button
              key={panel.id}
              className={`flex-1 p-3 text-center transition-colors ${
                activePanel === panel.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onPanelChange(activePanel === panel.id ? null : panel.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{panel.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="p-4 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {activePanel === 'systems' && (
            <motion.div
              key="systems"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ZodiacSystemsPanel
                selectedElement={selectedElement}
                onElementSelect={onElementSelect}
              />
            </motion.div>
          )}
          {activePanel === 'elements' && (
            <motion.div
              key="elements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ElementsPanel />
            </motion.div>
          )}
          {activePanel === 'modes' && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <InteractionModesPanel
                activeMode={activeMode}
                onModeChange={onModeChange}
              />
            </motion.div>
          )}
          {activePanel === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SocialPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Zodiac Systems Panel
const ZodiacSystemsPanel = ({ selectedElement, onElementSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Zodiac Systems</h3>
      {Object.entries(ZODIAC_SYSTEMS).map(([system, data]) => (
        <motion.div
          key={system}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedElement === system
              ? 'bg-purple-500/20 border border-purple-500/50'
              : 'bg-white/5 hover:bg-white/10'
          }`}
          onClick={() => onElementSelect(system)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{system}</span>
            <span className="text-white/60 text-sm">{data.signs.length} signs</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(data.elements).map(([element, signs]) => (
              <span
                key={element}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: ELEMENT_COLORS[element]?.primary + '20',
                  color: ELEMENT_COLORS[element]?.primary
                }}
              >
                {element}: {signs.length}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Elements Panel
const ElementsPanel = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Cosmic Elements</h3>
      {Object.entries(ELEMENT_COLORS).map(([element, colors]) => (
        <motion.div
          key={element}
          className="p-3 rounded-lg bg-white/5"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors.primary }}
            ></div>
            <span className="text-white font-medium capitalize">{element}</span>
          </div>
          <div className="flex space-x-2 mt-2">
            <div
              className="flex-1 h-2 rounded-full"
              style={{ backgroundColor: colors.secondary }}
            ></div>
            <div
              className="flex-1 h-2 rounded-full"
              style={{ backgroundColor: colors.accent }}
            ></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Interaction Modes Panel
const InteractionModesPanel = ({ activeMode, onModeChange }) => {
  const modes = [
    { id: 'explore', label: 'Explore', description: 'Free navigation and discovery' },
    { id: 'social', label: 'Social', description: 'Connect with other users' },
    { id: 'create', label: 'Create', description: 'Build constellations and content' },
    { id: 'collaborate', label: 'Collaborate', description: 'Work together on projects' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Interaction Modes</h3>
      {modes.map(mode => (
        <motion.div
          key={mode.id}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            activeMode === mode.id
              ? 'bg-blue-500/20 border border-blue-500/50'
              : 'bg-white/5 hover:bg-white/10'
          }`}
          onClick={() => onModeChange(mode.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-white font-medium">{mode.label}</div>
          <div className="text-white/60 text-sm">{mode.description}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Social Panel
const SocialPanel = () => {
  const { onlineUsers } = useCollaboration();

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Online Users</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Array.from(onlineUsers.keys()).map(userId => (
          <motion.div
            key={userId}
            className="flex items-center space-x-3 p-2 rounded-lg bg-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userId.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-white text-sm">User {userId.slice(0, 6)}</div>
              <div className="text-white/60 text-xs">Online</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Right Side Panel Component
const RightSidePanel = ({ onlineUsers, constellations, notifications }) => {
  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 h-full overflow-hidden"
      layout
    >
      <div className="p-4 h-full overflow-y-auto">
        <h3 className="text-white font-semibold mb-4">Activity Feed</h3>
        <div className="space-y-3">
          {/* Recent Activity Items */}
          <div className="text-white/60 text-sm">No recent activity</div>
        </div>
      </div>
    </motion.div>
  );
};

// Bottom Action Bar Component
const BottomActionBar = ({ activeMode, onModeChange, voiceActive }) => {
  const actions = [
    { id: 'explore', icon: Star, label: 'Explore' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'create', icon: Zap, label: 'Create' },
    { id: 'voice', icon: MessageCircle, label: 'Voice', special: true }
  ];

  return (
    <motion.div
      className="flex items-center space-x-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10"
      whileHover={{ scale: 1.02 }}
    >
      {actions.map(action => {
        const Icon = action.icon;
        const isActive = action.special ? voiceActive : activeMode === action.id;

        return (
          <motion.button
            key={action.id}
            className={`p-3 rounded-full transition-colors ${
              isActive
                ? 'bg-purple-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => {
              if (action.special) {
                // Handle voice toggle
              } else {
                onModeChange(action.id);
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon className="w-5 h-5" />
          </motion.button>
        );
      })}
    </motion.div>
  );
};

// Notification Toast Component
const NotificationToast = ({ notification, onDismiss, index }) => {
  return (
    <motion.div
      className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-white/10 min-w-64"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-white text-sm font-medium">{notification.title}</div>
          <div className="text-white/60 text-xs">{notification.message}</div>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Voice Indicator Component
const VoiceIndicator = () => {
  return (
    <motion.div
      className="bg-purple-500/20 backdrop-blur-md rounded-full p-4 border border-purple-500/50"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          className="w-3 h-3 bg-purple-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <span className="text-purple-300 text-sm font-medium">Listening...</span>
      </div>
    </motion.div>
  );
};

export default EnhancedCosmicUI;