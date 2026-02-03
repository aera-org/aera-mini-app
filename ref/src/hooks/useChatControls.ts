import { useState, useCallback } from 'react';
import { useAudioRecording } from './useAudioRecording';
import { useVideoRecording } from './useVideoRecording';
import { useInputMode, InputMode } from './useInputMode';
import { useLongPress } from './useLongPress';

interface UseChatControlsReturn {
  // Input mode
  inputMode: InputMode;

  // Recording states
  isRecording: boolean;
  isVideoRecording: boolean;
  recordingTime: number;
  videoRecordingTime: number;
  isLongPressActive: boolean;
  isVideoModalOpen: boolean;

  // Handlers
  voiceButtonHandlers: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
  };
  cameraButtonHandlers: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
  };

  // Modal controls
  setIsVideoModalOpen: (open: boolean) => void;

  // Placeholder text
  getPlaceholderText: () => string;
}

export const useChatControls = (
  onAudioComplete: (audioBlob: Blob) => void,
  onVideoComplete: (videoBlob: Blob) => void
): UseChatControlsReturn => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { inputMode, toggleInputMode } = useInputMode();
  const {
    isRecording,
    recordingTime,
    startAudioRecording,
    stopAudioRecording,
  } = useAudioRecording(onAudioComplete);

  const {
    isRecording: isVideoRecording,
    recordingTime: videoRecordingTime,
    startVideoRecording,
    stopVideoRecording,
  } = useVideoRecording((videoBlob) => {
    onVideoComplete(videoBlob);
    setIsVideoModalOpen(false);
  });

  // Voice button logic
  const voiceLongPress = useLongPress({
    onShortPress: toggleInputMode,
    onLongPressStart: async () => {
      try {
        await startAudioRecording();
      } catch (error) {
        console.error('Failed to start audio recording:', error);
      }
    },
    onLongPressEnd: stopAudioRecording,
  });

  // Camera button logic
  const cameraLongPress = useLongPress({
    onShortPress: toggleInputMode,
    onLongPressStart: async () => {
      try {
        setIsVideoModalOpen(true);
        await startVideoRecording();
      } catch (error) {
        console.error('Failed to start video recording:', error);
        setIsVideoModalOpen(false);
      }
    },
    onLongPressEnd: () => {
      stopVideoRecording();
    },
  });

  const getPlaceholderText = useCallback(() => {
    if (voiceLongPress.isLongPressActive) {
      return 'Recording audio...';
    }
    if (cameraLongPress.isLongPressActive) {
      return 'Recording video...';
    }
    if (isRecording || isVideoRecording) {
      return 'Release outside this field to cancel';
    }
    return inputMode === 'voice' ? 'Message...' : 'Message...';
  }, [
    voiceLongPress.isLongPressActive,
    cameraLongPress.isLongPressActive,
    isRecording,
    isVideoRecording,
    inputMode,
  ]);

  return {
    inputMode,
    isRecording,
    isVideoRecording,
    recordingTime,
    videoRecordingTime,
    isLongPressActive:
      voiceLongPress.isLongPressActive || cameraLongPress.isLongPressActive,
    isVideoModalOpen,
    voiceButtonHandlers: voiceLongPress.handlers,
    cameraButtonHandlers: cameraLongPress.handlers,
    setIsVideoModalOpen,
    getPlaceholderText,
  };
};
