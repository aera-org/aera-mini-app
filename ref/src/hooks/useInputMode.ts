import { useState, useCallback } from 'react';

export type InputMode = 'voice' | 'camera';

interface UseInputModeReturn {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
}

export const useInputMode = (
  initialMode: InputMode = 'voice'
): UseInputModeReturn => {
  const [inputMode, setInputMode] = useState<InputMode>(initialMode);

  const toggleInputMode = useCallback(() => {
    const newMode = inputMode === 'voice' ? 'camera' : 'voice';
    setInputMode(newMode);
    console.log('🔄 Switching input mode to:', newMode);
  }, [inputMode]);

  return {
    inputMode,
    setInputMode,
    toggleInputMode,
  };
};
