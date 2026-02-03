import { useState, useEffect } from 'react';
import { icons } from '@/assets/icons';
import s from './TelegramWebAudioPlayer.module.css';

interface TelegramWebAudioPlayerProps {
  audioBlob: Blob;
}

export default function TelegramWebAudioPlayer({
  audioBlob,
}: TelegramWebAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [_currentTime, setCurrentTime] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(
    null
  );
  const [startTime, setStartTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);

  useEffect(() => {
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    setAudioContext(context);

    audioBlob
      .arrayBuffer()
      .then((arrayBuffer) => {
        context
          .decodeAudioData(arrayBuffer)
          .then((buffer) => {
            setAudioBuffer(buffer);
            setDuration(buffer.duration);
          })
          .catch((error) => {
            console.error(
              '🎵 TelegramWebAudio: Failed to decode audio:',
              error
            );
          });
      })
      .catch((error) => {
        console.error('🎵 TelegramWebAudio: Failed to convert blob:', error);
      });

    return () => {
      if (context) {
        context.close();
      }
    };
  }, [audioBlob]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && audioBuffer) {
      interval = setInterval(() => {
        if (audioContext && startTime > 0) {
          const elapsed = audioContext.currentTime - startTime + pauseTime;
          setCurrentTime(Math.min(elapsed, audioBuffer.duration));
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, audioBuffer, audioContext, startTime, pauseTime]);

  const handlePlay = () => {
    if (!audioContext || !audioBuffer) {
      return;
    }

    if (isPlaying) {
      if (sourceNode) {
        sourceNode.stop();
        setSourceNode(null);
      }

      const elapsed = audioContext.currentTime - startTime + pauseTime;
      setPauseTime(elapsed);
      setIsPlaying(false);
    } else {
      try {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          setIsPlaying(false);
          setSourceNode(null);
          setCurrentTime(0);
          setPauseTime(0);
        };

        const resumeTime = pauseTime > 0 ? pauseTime : 0;
        source.start(0, resumeTime);
        setSourceNode(source);
        setIsPlaying(true);
        setStartTime(audioContext.currentTime - resumeTime);
      } catch (error) {
        console.error('🎵 TelegramWebAudio: Failed to start playback:', error);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        padding: '12px',
      }}
    >
      <div className={s.tgWebAudioPlayer}>
        <button
          onClick={handlePlay}
          className={s.playBtn}
          disabled={!audioBuffer}
          style={{
            cursor: audioBuffer ? 'pointer' : 'not-allowed',
          }}
        >
          {isPlaying ? (
            <img alt="icon_play" src={icons.pauseIcon} />
          ) : (
            <img alt="icon_play" src={icons.playIcon} />
          )}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
            {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
