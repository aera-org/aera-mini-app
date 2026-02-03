import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import s from './AudioRecorder.module.css';
import classNames from 'classnames';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  children?: React.ReactNode;
}

export default function AudioRecorder({
  onRecordingComplete,
  onRecordingStateChange,
  children,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      video: false,
      audio: true,
    });

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (status === 'stopped' && mediaBlobUrl) {
      fetch(mediaBlobUrl)
        .then((response) => response.blob())
        .then((blob) => {
          console.log(
            'Sending audio blob:',
            blob.size,
            'bytes, type:',
            blob.type
          );
          onRecordingComplete(blob);

          clearBlobUrl();
          setIsRecording(false);
          setRecordingTime(0);
        })
        .catch((error) => {
          console.error('Error processing audio blob:', error);
        });
    }
  }, [status, mediaBlobUrl, onRecordingComplete, clearBlobUrl]);

  const handleMouseDown = () => {
    console.log('Starting recording...');
    startRecording();
    setIsRecording(true);
    setRecordingTime(0);
    onRecordingStateChange?.(true);
  };

  const handleMouseUp = () => {
    console.log('Stopping recording...');
    stopRecording();
    setIsRecording(false);
    onRecordingStateChange?.(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <>
      {
        <div
          className={classNames(s.recordingState, {
            //@ts-ignore
            [s.recording]: isRecording,
          })}
        >
          <span className={s.recordingTime}>{formatTime(recordingTime)}</span>
        </div>
      }
      <button
        className={`${s.voiceBtn} ${isRecording ? s.recording : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={status === 'acquiring_media'}
      >
        {children}
      </button>
    </>
  );
}
