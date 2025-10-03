'use client';

import { useCallback, PropsWithChildren } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function StarBackground({ children }: PropsWithChildren) {
  const particlesInit = useCallback(async (engine: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    await loadFull(engine);
  }, []);

  return (
    <div className="starry-background relative min-h-screen">
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: 'transparent' },
          fpsLimit: 60,
          particles: {
            number: { value: 80, density: { enable: true, area: 800 } },
            color: { value: '#ffffff' },
            size: { value: 2, random: true },
            move: { enable: true, speed: 0.5, direction: 'none', outModes: { default: 'out' } },
            opacity: { value: 0.6, random: true, animation: { enable: true, speed: 1, minimumValue: 0.2 } },
            links: { enable: false }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 } }
          },
          detectRetina: true
        }}
      />
      {/* Planet Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5">
        <div className="planet venus" />
        <div className="planet mars" />
        <div className="planet jupiter" />
      </div>
      <div className="comet" />
      {children}
    </div>
  );
}
