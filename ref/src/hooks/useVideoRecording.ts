import { useState, useRef, useCallback } from 'react';

interface UseVideoRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  startVideoRecording: () => Promise<void>;
  stopVideoRecording: () => void;
}

const MAX_RECORDING_TIME = 60; // 1 minute in seconds

export const useVideoRecording = (
  onVideoComplete: (videoBlob: Blob) => void
): UseVideoRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startVideoRecording = useCallback(async () => {
    try {
      console.log('🎥 Starting video recording...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Choose the best supported MIME type for recording
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options.mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        options.mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      console.log(
        '🎥 Using MIME type for recording:',
        options.mimeType || 'default'
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🎥 Video recording stopped, creating blob...');
        // Use the same MIME type as used for recording
        const mimeType = options.mimeType || 'video/webm';

        const videoBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log(
          '🎥 Created video blob with type:',
          mimeType,
          'size:',
          videoBlob.size
        );
        onVideoComplete(videoBlob);

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            // Auto-stop recording
            stopVideoRecording();
            return MAX_RECORDING_TIME;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('🎥 Failed to start video recording:', error);
      throw error;
    }
  }, [onVideoComplete]);

  const stopVideoRecording = useCallback(() => {
    console.log('🎥 Stopping video recording...');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingTime,
    startVideoRecording,
    stopVideoRecording,
  };
};
