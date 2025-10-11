import { useCollaboration } from '@/contexts/CollaborationContext';
import { CHINESE_ZODIAC_ACTIONS, getActionColor } from '@/lib/zodiacActions';
import { useEffect, useState } from 'react';

const ActionControls = ({ currentUser, onActionTriggered }) => {
  const { triggerZodiacAction, recentActions } = useCollaboration();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleActionClick = async (actionType) => {
    if (isThrottled) return;

    try {
      setIsThrottled(true);
      const result = await triggerZodiacAction(actionType);
      onActionTriggered?.(result);

      // Reset throttle after animation duration
      setTimeout(() => setIsThrottled(false), 1000);
    } catch (error) {
      console.error('Failed to trigger action:', error);
      setIsThrottled(false);
    }
  };

  const getZodiacActions = () => {
    const zodiacSign = currentUser?.chinese_zodiac || 'Rat';
    return CHINESE_ZODIAC_ACTIONS[zodiacSign] || CHINESE_ZODIAC_ACTIONS.Rat;
  };

  const actions = getZodiacActions();

  if (!isClient) {
    return null; // Prevent SSR issues
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Recent Actions Feed */}
      <div className="mb-4 max-w-xs">
        {recentActions.slice(0, 3).map((action) => (
          <div
            key={action.id}
            className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-2 mb-2 text-xs animate-fade-in"
          >
            <span className="text-purple-300 font-medium">{action.username}</span>
            <span className="text-white/70"> performed </span>
            <span className="text-yellow-300">{action.action}</span>
          </div>
        ))}
      </div>

      {/* Main Action Controls */}
      <div className="bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Zodiac Actions</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-300 hover:text-purple-100 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        <div className={`grid gap-2 transition-all duration-300 ${isExpanded ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {Object.entries(actions).map(([actionType, actionName]) => (
            <button
              key={actionType}
              onClick={() => handleActionClick(actionType)}
              disabled={isThrottled}
              className={`
                relative group px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-200 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isThrottled ? 'animate-pulse' : ''}
              `}
              style={{
                backgroundColor: getActionColor(currentUser?.zodiacSign, actionName),
                boxShadow: `0 0 10px ${getActionColor(currentUser?.zodiacSign, actionName)}40`
              }}
            >
              <span className="text-white drop-shadow-lg">
                {actionName}
              </span>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"
                   style={{ backgroundColor: getActionColor(currentUser?.zodiacSign, actionName) }} />

              {/* Active indicator */}
              {isThrottled && (
                <div className="absolute inset-0 rounded-lg border-2 border-white/30 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* Zodiac Sign Display */}
        <div className="mt-3 pt-3 border-t border-purple-500/30">
          <div className="text-center">
            <span className="text-purple-300 text-xs">
              {currentUser?.chinese_zodiac || 'Rat'} Spirit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionControls;