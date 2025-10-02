import { useSpring, animated } from '@react-spring/web';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.div
      style={fadeIn}
      className="bg-red-900/50 border border-red-400 text-starlight p-4 rounded-lg flex flex-col items-center"
      role="alert"
      aria-label="Error message"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          className="mt-2 bg-yellow-400 text-void px-3 py-1 rounded-lg hover:bg-yellow-300 transition font-medium"
          onClick={onRetry}
          aria-label="Retry API request"
        >
          Retry
        </button>
      )}
    </animated.div>
  );
};

export default ErrorMessage;
