import { useState, useRef, useEffect } from 'react';
import { icons } from '@/assets/icons';
import s from './VideoPlayer.module.css';

interface VideoPlayerProps {
  videoBlob: Blob;
}

export default function VideoPlayer({ videoBlob }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  // const [currentTime, setCurrentTime] = useState(0);
  // const [duration, setDuration] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Create and cleanup blob URL
  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  // Enable user interaction for Telegram
  useEffect(() => {
    const enableInteraction = () => {
      setHasUserInteracted(true);
    };

    document.addEventListener('touchstart', enableInteraction, { once: true });
    document.addEventListener('click', enableInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', enableInteraction);
      document.removeEventListener('click', enableInteraction);
    };
  }, []);

  const handleLoadedMetadata = () => {
    // if (videoRef.current) {
    //   setDuration(videoRef.current.duration);
    // }
  };

  const handleTimeUpdate = () => {
    // if (videoRef.current) {
    //   setCurrentTime(videoRef.current.currentTime);
    // }
  };

  const handlePlay = async () => {
    if (videoRef.current) {
      setHasUserInteracted(true);

      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          // For Telegram WebApp compatibility - use a simpler approach
          videoRef.current.muted = true;

          // Create a new promise that handles abort properly
          const playVideo = () => {
            return new Promise((resolve, reject) => {
              if (!videoRef.current) {
                reject(new Error('Video element not available'));
                return;
              }

              const video = videoRef.current;

              const onCanPlay = () => {
                video.removeEventListener('canplay', onCanPlay);
                video.removeEventListener('error', onError);

                const playPromise = video.play();
                if (playPromise) {
                  playPromise.then(resolve).catch(reject);
                } else {
                  resolve(undefined);
                }
              };

              const onError = (e: Event) => {
                video.removeEventListener('canplay', onCanPlay);
                video.removeEventListener('error', onError);
                reject(e);
              };

              video.addEventListener('canplay', onCanPlay, { once: true });
              video.addEventListener('error', onError, { once: true });

              // Trigger load
              video.load();
            });
          };

          await playVideo();
          setIsPlaying(true);

          // Try to unmute after successful play
          if (hasUserInteracted) {
            setTimeout(() => {
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.muted = false;
              }
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error playing video:', error);
        // Check if it's an abort error or unsupported
        if (
          error instanceof Error &&
          (error.name === 'AbortError' || error.name === 'NotSupportedError')
        ) {
          setHasPlaybackError(true);
        }
        setIsPlaying(false);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // setCurrentTime(0);
  };

  // const formatTime = (time: number) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  // };

  // Don't render anything if no video source
  if (!videoSrc) {
    return (
      <div className={s.videoContainer}>
        <div className={s.videoWrapper}>
          <div className={s.loadingMessage}>Loading video...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.videoContainer}>
      <div className={s.videoWrapper}>
        <video
          ref={videoRef}
          className={s.video}
          src={videoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => {
            console.error('Video error:', e);
            setHasPlaybackError(true);
          }}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          controls={hasPlaybackError}
          muted={true}
          autoPlay={false}
          loop={false}
        />
        {!hasPlaybackError && videoSrc && (
          <div className={s.overlay} onClick={handlePlay}>
            {!isPlaying && (
              <div className={s.playButton}>
                <img src={icons.playIcon} alt="play" />
              </div>
            )}
          </div>
        )}
        {hasPlaybackError && (
          <div
            className={s.errorMessage}
            onClick={() => {
              // Try to download the video file as fallback
              const a = document.createElement('a');
              a.href = videoSrc;
              a.download = `video_${Date.now()}.webm`;
              a.click();
            }}
          >
            Video playback not supported. Tap to download.
          </div>
        )}
      </div>
    </div>
  );
}
