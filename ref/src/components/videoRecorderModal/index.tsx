import { useRef, useEffect } from 'react';
import s from './index.module.css';

interface VideoRecorderModalProps {
  isOpen: boolean;
  isRecording: boolean;
  recordingTime: number;
}

const MAX_RECORDING_TIME = 60; // 1 minute in seconds

export default function VideoRecorderModal({
  isOpen,
  isRecording,
  recordingTime,
}: VideoRecorderModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get user media stream for preview
  useEffect(() => {
    if (isOpen && !streamRef.current) {
      startCamera();
    } else if (!isOpen && streamRef.current) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false, // Only for preview, actual recording is handled by the hook
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera for preview:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={s.modalOverlay}>
      <div className={s.recordingInterface}>
        <div className={s.recordingCircle}>
          <video
            ref={videoRef}
            className={s.circularVideo}
            autoPlay
            muted
            playsInline
          />
          {isRecording && (
            <svg className={s.progressRing} viewBox="0 0 100 100">
              <circle className={s.progressBackground} cx="50" cy="50" r="45" />
              <circle
                className={s.progressBar}
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${
                    (recordingTime / MAX_RECORDING_TIME) * 795
                  } 795`,
                }}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
