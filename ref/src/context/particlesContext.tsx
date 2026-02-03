import React, { createContext, useState } from 'react';

interface Particle {
  identifier: number;
  x: number;
  y: number;
  payload: React.ReactNode;
  time: number;
  lifetime: number;
  dead: boolean;
  persistAfterLifetime: boolean;
}

export const ParticlesContext = createContext<{
  particles: Particle[];
  addParticle: (
    identifier: number | null,
    x: number,
    y: number,
    payload: React.ReactNode,
    lifetime: number,
    persistAfterLifetime?: boolean
  ) => void;
  addParticleByTouch: (
    event: TouchEvent | MouseEvent,
    payload: React.ReactNode,
    lifetime: number,
    maxCount: number
  ) => number;
} | null>(null);

export const useParticlesContext = () => {
  const context = React.useContext(ParticlesContext);

  if (!context) {
    throw new Error(
      'useParticlesContext must be used within a ParticlesProvider'
    );
  }

  return context;
};

export const ParticlesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const addParticle = (
    identifier: number | null,
    x: number,
    y: number,
    payload: React.ReactNode,
    lifetime: number,
    persistAfterLifetime = false
  ) => {
    const newParticle = {
      identifier: identifier || Date.now(),
      x,
      y,
      payload,
      time: Date.now(),
      lifetime,
      dead: false,
      persistAfterLifetime,
    };

    setParticles((currentParticles) => [...currentParticles, newParticle]);

    setTimeout(() => {
      setParticles((currentEffects) =>
        currentEffects.filter((particle) => particle.time !== newParticle.time)
      );
    }, lifetime);
  };

  const addParticleByTouch = (
    event: TouchEvent | MouseEvent,
    payload: React.ReactNode,
    lifetime: number,
    maxCount: number
  ) => {
    if (event.type === 'click' || event instanceof MouseEvent) {
      const mouseEvent = event as MouseEvent;
      addParticle(
        null,
        mouseEvent.clientX,
        mouseEvent.clientY,
        payload,
        lifetime
      );
      return 1;
    }

    const touchEvent = event as TouchEvent;

    if (!touchEvent.touches || touchEvent.touches.length === 0) {
      return 0;
    }

    const touches = Array.from(touchEvent.touches).filter(
      (touch) => !particles.some((p) => p.identifier === touch.identifier)
    );

    touches.slice(0, maxCount).forEach((touch) => {
      addParticle(
        touch.identifier,
        touch.clientX,
        touch.clientY,
        payload,
        lifetime
      );
    });

    return Math.min(touches.length, maxCount);
  };

  const value = {
    particles,
    addParticle,
    addParticleByTouch,
  };

  return (
    <ParticlesContext.Provider value={value}>
      <ParticlesRenderer />
      {children}
    </ParticlesContext.Provider>
  );
};

export function ParticlesRenderer() {
  const { particles } = useParticlesContext();

  return (
    <>
      {particles.map((particle: Particle) => (
        <span
          key={particle.identifier}
          style={{
            left: particle.x,
            top: particle.y,
            position: 'fixed',
            zIndex: 5,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            animation: 'float-up 1s ease-out forwards',
          }}
        >
          {particle.payload}
        </span>
      ))}
    </>
  );
}
