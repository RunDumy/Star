'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Users, Lightbulb, Star } from 'lucide-react';
import CosmicButton from './CosmicButton';
import CosmicModal from './CosmicModal';
import CosmicCard from './CosmicCard';

interface MentorMessage {
  id: string;
  type: 'tip' | 'wisdom' | 'question';
  title: string;
  content: string;
}

interface MentorOverlayProps {
  isVisible?: boolean;
  mentor?: {
    name: string;
    archetypal_alignment: string;
  };
  response?: string;
  mood?: string;
  actions?: string[];
  voiceFeatures?: any;
  onVoicePlay?: () => void;
  onClose?: () => void;
}

const mentorMessages: MentorMessage[] = [
  {
    id: '1',
    type: 'tip',
    title: 'Welcome to Your Cosmic Journey',
    content: 'Your birth chart is like a cosmic blueprint of your soul\'s journey. Each aspect reveals a piece of your divine purpose.',
  },
  {
    id: '2',
    type: 'wisdom',
    title: 'The Stars Whisper Secrets',
    content: 'When interpreting your chart, remember that every challenge marked by Saturn is an opportunity for spiritual growth.',
  },
  {
    id: '3',
    type: 'question',
    title: 'Reflect on Your Lunar Path',
    content: 'Have you noticed how the moon cycles in your life mirror your emotional journey? What lessons does she bring you?',
  },
  {
    id: '4',
    type: 'tip',
    title: 'Venus and Mars Dance',
    content: 'The relationship between Venus and Mars shows how you love and desire. When in harmony, love flows naturally.',
  },
  {
    id: '5',
    type: 'wisdom',
    title: 'Mercury\'s Quick Mind',
    content: 'Mercury shows your communication style. In air signs, your thoughts soar; in earth signs, they ground into wisdom.',
  },
];

export default function MentorOverlay({
  isVisible = false,
  mentor,
  response,
  mood,
  actions,
  voiceFeatures,
  onVoicePlay,
  onClose
}: MentorOverlayProps) {
  const isDynamic = mentor && response;
  const [showOverlay, setShowOverlay] = useState(isVisible || !!isDynamic);
  const [currentMessage, setCurrentMessage] = useState<MentorMessage | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isDynamic && mentorMessages.length > 0) {
      setCurrentMessage(mentorMessages[messageIndex]);
    }
  }, [messageIndex, isDynamic]);

  useEffect(() => {
    if (isDynamic) {
      setShowOverlay(true);
    } else if (isVisible !== undefined) {
      setShowOverlay(isVisible);
    }
  }, [isVisible, isDynamic]);

  const nextMessage = () => {
    if (messageIndex < mentorMessages.length - 1) {
      setMessageIndex(messageIndex + 1);
    } else {
      setShowOverlay(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-6 h-6 text-cosmic-gold" />;
      case 'wisdom':
        return <Star className="w-6 h-6 text-cosmic-accent" />;
      case 'question':
        return <Users className="w-6 h-6 text-cosmic-glow" />;
      default:
        return <Star className="w-6 h-6 text-cosmic-gold" />;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setShowOverlay(false);
    }
  };

  if (!showOverlay || (!isDynamic && !currentMessage)) return null;

  return (
    <CosmicModal
      isOpen={showOverlay}
      onClose={handleClose}
      title={isDynamic ? `Mentor: ${mentor?.name}` : "Cosmic Mentor Wisdom"}
    >
      <div className="space-y-4">
        {isDynamic ? (
          <>
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-cosmic-gold" />
              <div>
                <h3 className="text-lg font-semibold text-star-white">{mentor!.name}</h3>
                <p className="text-sm text-star-dim">{mentor!.archetypal_alignment}</p>
                {mood && <p className="text-sm text-cosmic-pink">Mood: {mood}</p>}
              </div>
            </div>

            <CosmicCard>
              <p className="text-star-dim leading-relaxed">{response}</p>
            </CosmicCard>

            {actions && actions.length > 0 && (
              <CosmicCard>
                <h4 className="text-md font-semibold text-cosmic-blue mb-2">Recommended Actions:</h4>
                <ul className="space-y-1">
                  {actions.map((action, index) => (
                    <li key={index} className="text-star-light text-sm">• {action}</li>
                  ))}
                </ul>
              </CosmicCard>
            )}

            <div className="flex space-x-3">
              {onVoicePlay && voiceFeatures && (
                <CosmicButton onClick={onVoicePlay} variant="secondary" className="flex-1">
                  🎵 Voice Response
                </CosmicButton>
              )}
              <CosmicButton onClick={handleClose} variant="primary" className="flex-1">
                Close
              </CosmicButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              {getIcon(currentMessage!.type)}
              <h3 className="text-lg font-semibold text-star-white">{currentMessage!.title}</h3>
            </div>

            <CosmicCard>
              <p className="text-star-dim leading-relaxed">{currentMessage!.content}</p>
            </CosmicCard>

            <div className="flex space-x-3">
              <CosmicButton onClick={nextMessage} variant="primary" className="flex-1">
                {messageIndex < mentorMessages.length - 1 ? 'Continue Journey' : 'Complete Wisdom'}
              </CosmicButton>
              <CosmicButton onClick={handleClose} variant="secondary" className="flex-1">
                Close for Now
              </CosmicButton>
            </div>

            <div className="text-center text-sm text-star-dim">
              Cosmic Insight {messageIndex + 1} of {mentorMessages.length}
            </div>
          </>
        )}
      </div>
    </CosmicModal>
  );
}
