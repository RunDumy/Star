import { useSpring, animated } from '@react-spring/web';

const LoadingSpinner: React.FC = () => {
  const spin = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 2000 },
  });

  return (
    <output className="flex items-center justify-center p-4" aria-label="Loading cosmic data">
      <animated.div
        style={{ transform: spin.rotate.to((r) => `rotate(${r}deg)`) }}
        className="relative w-16 h-16"
      >
        {/* Starfield spinner */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent" />
        <div className="absolute w-4 h-4 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 top-0 left-6" />
        <div className="absolute w-3 h-3 rounded-full bg-yellow-300 shadow-md shadow-yellow-300/50 bottom-2 right-4" />
        <div className="absolute w-2 h-2 rounded-full bg-yellow-200 shadow-sm shadow-yellow-200/50 top-4 right-2" />
      </animated.div>
      <span>Generating cosmic insights</span>
    </output>
  );
};

export default LoadingSpinner;
