import { useGazeNavigation } from '@/hooks/useGazeNavigation';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useGesture } from '@use-gesture/react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

export const GazeVoiceNavigator = ({
  children,
  onNavigate,
  onCommand,
  gazeOptions = {},
  voiceOptions = {},
  className = '',
  showDebug = false,
}) => {
  const [navigationMode, setNavigationMode] = useState('gaze'); // 'gaze', 'voice', 'combined'
  const [isActive, setIsActive] = useState(false);

  // Gaze navigation hook
  const gaze = useGazeNavigation({
    ...gazeOptions,
  });

  // Voice commands hook with navigation commands
  const defaultVoiceCommands = {
    'start navigation': () => setIsActive(true),
    'stop navigation': () => setIsActive(false),
    'gaze mode': () => setNavigationMode('gaze'),
    'voice mode': () => setNavigationMode('voice'),
    'combined mode': () => setNavigationMode('combined'),
    'go up': (data) => handleNavigation('up', data),
    'go down': (data) => handleNavigation('down', data),
    'go left': (data) => handleNavigation('left', data),
    'go right': (data) => handleNavigation('right', data),
    'zoom in': (data) => handleNavigation('zoomIn', data),
    'zoom out': (data) => handleNavigation('zoomOut', data),
    'center': (data) => handleNavigation('center', data),
    'next': (data) => handleNavigation('next', data),
    'previous': (data) => handleNavigation('previous', data),
    'select': (data) => handleNavigation('select', data),
  };

  const voice = useVoiceCommands({
    ...voiceOptions,
    commands: { ...defaultVoiceCommands, ...voiceOptions.commands },
    onCommandRecognized: (commandData) => {
      if (onCommand) {
        onCommand(commandData);
      }
    },
  });

  // Handle navigation actions
  const handleNavigation = useCallback((direction, data) => {
    if (!isActive) return;

    const navigationData = {
      type: navigationMode,
      direction,
      source: data.fuzzy ? 'voice-fuzzy' : 'voice-exact',
      timestamp: data.timestamp,
      confidence: data.confidence,
      gazePosition: gaze.gazeTarget,
    };

    if (onNavigate) {
      onNavigate(navigationData);
    }
  }, [isActive, navigationMode, onNavigate, gaze.gazeTarget]);

  // Gesture handling for mobile navigation
  const gestureHandlers = useGesture({
    onDrag: ({ movement: [mx, my], velocity }) => {
      if (!isActive || navigationMode === 'voice') return;

      const threshold = 50;
      const absMx = Math.abs(mx);
      const absMy = Math.abs(my);

      if (absMx > threshold || absMy > threshold) {
        let direction;
        let confidence;

        if (absMx > absMy) {
          direction = mx > 0 ? 'right' : 'left';
          confidence = Math.min(absMx / 200, 1);
        } else {
          direction = my > 0 ? 'down' : 'up';
          confidence = Math.min(absMy / 200, 1);
        }

        const navigationData = {
          type: 'gesture',
          direction,
          source: 'gesture-drag',
          timestamp: Date.now(),
          confidence,
          velocity,
        };

        if (onNavigate) {
          onNavigate(navigationData);
        }
      }
    },
    onPinch: ({ offset: [scale] }) => {
      if (!isActive || navigationMode === 'voice') return;

      const direction = scale > 1 ? 'zoomIn' : 'zoomOut';
      const navigationData = {
        type: 'gesture',
        direction,
        source: 'gesture-pinch',
        timestamp: Date.now(),
        confidence: Math.min(Math.abs(scale - 1), 1),
        scale,
      };

      if (onNavigate) {
        onNavigate(navigationData);
      }
    },
    onWheel: ({ movement: [, my] }) => {
      if (!isActive || navigationMode === 'voice') return;

      const direction = my > 0 ? 'zoomOut' : 'zoomIn';
      const navigationData = {
        type: 'gesture',
        direction,
        source: 'gesture-wheel',
        timestamp: Date.now(),
        confidence: Math.min(Math.abs(my) / 100, 1),
        delta: my,
      };

      if (onNavigate) {
        onNavigate(navigationData);
      }
    },
  });

  // Calculate navigation direction from gaze
  const getGazeDirection = useCallback((gazeDirection) => {
    if (!gazeDirection) return null;

    const { x, y } = gazeDirection;

    // Determine navigation direction based on gaze
    if (Math.abs(x) > Math.abs(y)) {
      if (x > 0.3) return 'right';
      if (x < -0.3) return 'left';
    } else {
      if (y > 0.3) return 'down';
      if (y < -0.3) return 'up';
    }

    return null;
  }, []);

  // Handle gaze-based navigation
  useEffect(() => {
    if (!isActive || navigationMode === 'voice') return;

    const direction = getGazeDirection(gaze.gazeDirection);

    if (gaze.isGazing && direction) {
      const navigationData = {
        type: 'gaze',
        direction,
        source: 'gaze',
        timestamp: Date.now(),
        confidence: gaze.gazeProgress,
        gazePosition: gaze.gazeTarget,
      };

      if (onNavigate) {
        onNavigate(navigationData);
      }
    }
  }, [gaze.isGazing, gaze.gazeDirection, gaze.gazeProgress, gaze.gazeTarget, isActive, navigationMode, onNavigate, getGazeDirection]);

  // Auto-start voice listening when in voice or combined mode
  useEffect(() => {
    if (isActive && (navigationMode === 'voice' || navigationMode === 'combined')) {
      voice.startListening();
    } else {
      voice.stopListening();
    }
  }, [isActive, navigationMode, voice]);

  return (
    <div className={`gaze-voice-navigator ${className}`} {...gestureHandlers()}>
      {/* Navigation controls */}
      <div className="navigation-controls" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`nav-toggle ${isActive ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            margin: '4px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: isActive ? '#4CAF50' : '#f5f5f5',
            color: isActive ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          {isActive ? 'Stop Navigation' : 'Start Navigation'}
        </button>

        {isActive && (
          <div className="mode-controls">
            <button
              onClick={() => setNavigationMode('gaze')}
              className={navigationMode === 'gaze' ? 'active' : ''}
              style={{
                padding: '4px 8px',
                margin: '2px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: navigationMode === 'gaze' ? '#2196F3' : '#f5f5f5',
                color: navigationMode === 'gaze' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Gaze
            </button>
            <button
              onClick={() => setNavigationMode('voice')}
              className={navigationMode === 'voice' ? 'active' : ''}
              style={{
                padding: '4px 8px',
                margin: '2px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: navigationMode === 'voice' ? '#2196F3' : '#f5f5f5',
                color: navigationMode === 'voice' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Voice
            </button>
            <button
              onClick={() => setNavigationMode('combined')}
              className={navigationMode === 'combined' ? 'active' : ''}
              style={{
                padding: '4px 8px',
                margin: '2px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: navigationMode === 'combined' ? '#2196F3' : '#f5f5f5',
                color: navigationMode === 'combined' ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Combined
            </button>
          </div>
        )}
      </div>

      {/* Debug information */}
      {showDebug && isActive && (
        <div
          className="debug-info"
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 1000,
          }}
        >
          <div>Mode: {navigationMode}</div>
          <div>Gaze: {gaze.isGazing ? 'Active' : 'Inactive'}</div>
          <div>Voice: {voice.isListening ? 'Listening' : 'Inactive'}</div>
          <div>Transcript: {voice.transcript || 'None'}</div>
          <div>Last Command: {voice.lastCommand?.command || 'None'}</div>
          {gaze.gazeTarget && (
            <div>Gaze Position: ({gaze.gazeTarget.x.toFixed(0)}, {gaze.gazeTarget.y.toFixed(0)})</div>
          )}
        </div>
      )}

      {/* Gaze indicator */}
      {isActive && (navigationMode === 'gaze' || navigationMode === 'combined') && gaze.gazeTarget && (
        <div
          className="gaze-indicator"
          style={{
            position: 'fixed',
            left: gaze.gazeTarget.x - 25,
            top: gaze.gazeTarget.y - 25,
            width: '50px',
            height: '50px',
            border: `2px solid ${gaze.isGazing ? '#4CAF50' : '#FFC107'}`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 999,
            opacity: 0.7,
            transition: 'border-color 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 40%, ${gaze.isGazing ? '#4CAF50' : '#FFC107'} 70%)`,
              animation: gaze.isGazing ? 'pulse 1s infinite' : 'none',
            }}
          />
        </div>
      )}

      {/* Render children */}
      {children}
    </div>
  );
};

GazeVoiceNavigator.propTypes = {
  children: PropTypes.node,
  onNavigate: PropTypes.func,
  onCommand: PropTypes.func,
  gazeOptions: PropTypes.object,
  voiceOptions: PropTypes.object,
  className: PropTypes.string,
  showDebug: PropTypes.bool,
};