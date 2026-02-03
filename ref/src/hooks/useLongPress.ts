import { useState, useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onShortPress: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  delay?: number;
}

interface UseLongPressReturn {
  isLongPressActive: boolean;
  isMousePressed: boolean;
  handlers: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
  };
}

export const useLongPress = ({
  onShortPress,
  onLongPressStart,
  onLongPressEnd,
  delay = 300,
}: UseLongPressOptions): UseLongPressReturn => {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [clickStartTime, setClickStartTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = useCallback(() => {
    const startTime = Date.now();
    setClickStartTime(startTime);
    setIsMousePressed(true);

    console.log('🖱️ Press started');

    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Long press timeout triggered');
      setIsLongPressActive(true);
      onLongPressStart();
    }, delay);
  }, [onLongPressStart, delay]);

  const endPress = useCallback(() => {
    console.log('🖱️ Press ended, isMousePressed:', isMousePressed);

    if (!isMousePressed) return;

    // Скасувати таймер якщо він ще працює
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const endTime = Date.now();
    const pressDuration = clickStartTime ? endTime - clickStartTime : 0;

    console.log(
      '⏱️ Press duration:',
      pressDuration,
      'ms, isLongPressActive:',
      isLongPressActive
    );

    if (pressDuration < delay && !isLongPressActive) {
      // Короткий клік
      onShortPress();
    } else if (isLongPressActive) {
      // Завершити довгий клік
      onLongPressEnd();
    }

    setClickStartTime(null);
    setIsLongPressActive(false);
    setIsMousePressed(false);
  }, [
    isMousePressed,
    clickStartTime,
    delay,
    isLongPressActive,
    onShortPress,
    onLongPressEnd,
  ]);

  const cancelPress = useCallback(() => {
    console.log('❌ Press cancelled');

    // Скасувати таймер якщо він ще працює
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLongPressActive) {
      // Завершити довгий клік
      onLongPressEnd();
    }

    setClickStartTime(null);
    setIsLongPressActive(false);
    setIsMousePressed(false);
  }, [isLongPressActive, onLongPressEnd]);

  return {
    isLongPressActive,
    isMousePressed,
    handlers: {
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: cancelPress,
      onTouchStart: startPress,
      onTouchEnd: endPress,
    },
  };
};
