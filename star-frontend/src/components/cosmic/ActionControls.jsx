import { useCollaboration } from '@/contexts/CollaborationContext';
import {
  AZTEC_ZODIAC_ACTIONS,
  CHINESE_ZODIAC_ACTIONS,
  getActionColor,
  MAYAN_ZODIAC_ACTIONS,
  VEDIC_ZODIAC_ACTIONS,
  WESTERN_ZODIAC_ACTIONS
} from '@/lib/zodiacActions';
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
    // Support multi-system zodiac preferences
    const preferredSystem = currentUser?.zodiac_system || currentUser?.preferred_zodiac_system || 'chinese';

    let zodiacSign;
    let actionSource;

    switch (preferredSystem) {
      case 'western':
        zodiacSign = currentUser?.western_zodiac || 'Aries';
        actionSource = WESTERN_ZODIAC_ACTIONS;
        break;
      case 'vedic':
        zodiacSign = currentUser?.vedic_zodiac || 'Mesha';
        actionSource = VEDIC_ZODIAC_ACTIONS;
        break;
      case 'mayan':
        zodiacSign = currentUser?.mayan_zodiac || 'Imix';
        actionSource = MAYAN_ZODIAC_ACTIONS;
        break;
      case 'aztec':
        zodiacSign = currentUser?.aztec_zodiac || 'Cipactli';
        actionSource = AZTEC_ZODIAC_ACTIONS;
        break;
      default: // 'chinese'
        zodiacSign = currentUser?.chinese_zodiac || 'Rat';
        actionSource = CHINESE_ZODIAC_ACTIONS;
    }

    return actionSource[zodiacSign] || actionSource.Rat || actionSource.Aries || actionSource.Mesha || actionSource.Imix || actionSource.Cipactli;
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
              {(() => {
                const preferredSystem = currentUser?.zodiac_system || currentUser?.preferred_zodiac_system || 'chinese';
                let displaySign;

                switch (preferredSystem) {
                  case 'western':
                    displaySign = currentUser?.western_zodiac || 'Aries';
                    break;
                  case 'vedic':
                    displaySign = currentUser?.vedic_zodiac || 'Mesha';
                    break;
                  case 'mayan':
                    displaySign = currentUser?.mayan_zodiac || 'Imix';
                    break;
                  case 'aztec':
                    displaySign = currentUser?.aztec_zodiac || 'Cipactli';
                    break;
                  default:
                    displaySign = currentUser?.chinese_zodiac || 'Rat';
                }
                return displaySign;
              })()} Spirit ({currentUser?.zodiac_system || currentUser?.preferred_zodiac_system || 'chinese'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionControls;
