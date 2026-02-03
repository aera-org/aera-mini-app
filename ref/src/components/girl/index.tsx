import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/userContext';
import { useParticlesContext } from '../../context/particlesContext';
import { Text } from '../text';
import TelegramWebApp from '@twa-dev/sdk';
import s from './index.module.css';
import HandIcon from '../../assets/hand.svg';
import VideoComponent from './video';
import { useEnergy } from '../../context/energyContext';

interface GirlProps {
  children?: React.ReactNode;
}

interface Position {
  x: number;
  y: number;
}

function calculateDistance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export const Girl: React.FC<GirlProps> = ({ children }) => {
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [moveDistance, setMoveDistance] = useState(0);
  const [showHandGuide, setShowHandGuide] = useState(false);
  const handGuideTimer = useRef<NodeJS.Timeout>();
  const [isRubbing, setIsRubbing] = useState(false);
  // const [isIdle, setIsIdle] = useState(true);

  const { hasEnoughEnergy, convertEnergy, isBoostActive, isUndressActive } =
    useEnergy();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const { user, setUser } = useUser();
  const { addParticleByTouch } = useParticlesContext();
  const touchThreshold = 100;

  // Hand guide timer logic
  useEffect(() => {
    startHandGuideTimer();
    return () => {
      if (handGuideTimer.current) {
        clearTimeout(handGuideTimer.current);
      }
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restart timer when rubbing state changes
  useEffect(() => {
    if (!isRubbing && !startPos) {
      startHandGuideTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRubbing, startPos]);

  const startHandGuideTimer = () => {
    if (handGuideTimer.current) {
      clearTimeout(handGuideTimer.current);
    }
    handGuideTimer.current = setTimeout(() => {
      if (!isRubbing && !startPos) {
        setShowHandGuide(true);
      }
    }, 10000); // 10 seconds
  };

  const hideHandGuide = () => {
    setShowHandGuide(false);
  };

  // Energy and particles calculation
  const updateUser = (points: number) => {
    if (!user?.data?.energy || !setUser) return;
    const multiplier = isBoostActive ? 2 : isUndressActive ? 10 : 1;
    convertEnergy(points * multiplier, isBoostActive, isUndressActive);
    if (TelegramWebApp?.HapticFeedback) {
      TelegramWebApp?.HapticFeedback.impactOccurred('soft');
    }
    // Add particles
    try {
      const touch = new Touch({
        identifier: Date.now(),
        target: document.body,
        clientX: startPos?.x || 0,
        clientY: startPos?.y || 0,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 0,
        force: 0.5,
      });
      const touchEvent = new TouchEvent('touchstart', {
        cancelable: true,
        bubbles: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        shiftKey: false,
      });
      addParticleByTouch(
        touchEvent,
        <Text variant="small" color="white">
          +{points * multiplier}
        </Text>,
        1000,
        1
      );
    } catch (e) {
      // Fallback to MouseEvent if Touch is not supported
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: startPos?.x || 0,
        clientY: startPos?.y || 0,
        bubbles: true,
        cancelable: true,
      });
      addParticleByTouch(
        mouseEvent,
        <Text variant="small" color="white">
          +{points * multiplier}
        </Text>,
        1000,
        1
      );
    }
  };

  // Touch/mouse logic
  const handleStart = (pos: Position) => {
    if (hasEnoughEnergy() || isBoostActive) {
      setStartPos(pos);
      setMoveDistance(0);
      setIsRubbing(true);
      // setIsIdle(false);
      hideHandGuide();
    }
  };

  const handleMove = (currentPos: Position) => {
    if (!user?.data?.energy || !setUser) return;
    if (!hasEnoughEnergy()) {
      handleEnd();
      return;
    }
    if (startPos) {
      const distance = calculateDistance(currentPos, startPos);
      const newDistance = moveDistance + distance;
      const points = Math.floor(newDistance / touchThreshold);
      if (points > 0) {
        updateUser(points);
        setMoveDistance(newDistance % touchThreshold);
      } else {
        setMoveDistance(newDistance);
      }
      setStartPos(currentPos);
    }
  };

  const handleEnd = () => {
    setIsRubbing(false);
    // setIsIdle(true);
    setMoveDistance(0);
    setStartPos(null);
    startHandGuideTimer();
  };

  // Touch events
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches[0]) {
      handleStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  };
  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches[0]) {
      handleMove({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  };

  // Mouse events
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true);
    handleStart({ x: event.clientX, y: event.clientY });
  };
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isMouseDown) {
      handleMove({ x: event.clientX, y: event.clientY });
    }
  };
  const handleMouseUp = () => {
    if (isMouseDown) {
      handleEnd();
      setIsMouseDown(false);
    }
  };
  const handleMouseLeave = () => {
    if (isMouseDown) {
      handleEnd();
      setIsMouseDown(false);
    }
  };

  return (
    <>
      <div
        className={s.girlContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <VideoComponent
          isRubbing={isRubbing && !isUndressActive}
          isIdle={!isRubbing && !isUndressActive}
          isUndress={isUndressActive}
        />
        <img
          src={HandIcon}
          alt="Hand guide"
          className={`hand-guide ${showHandGuide ? 'visible' : ''}`}
        />
      </div>
    </>
  );
};
