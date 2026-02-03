import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useUser } from '../../context/userContext';
import { useCharacter } from '../../hooks/useCharacter';
import classNames from 'classnames';
import { logger } from '../../utils/logger';

const VideoComponent = memo(
  ({
    isRubbing,
    isIdle,
    isUndress,
  }: {
    isRubbing: boolean;
    isIdle: boolean;
    isUndress: boolean;
  }) => {
    // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
    const { user } = useUser();
    const { character, loading, error, fetchCharacterByName } = useCharacter();
    const [lastFetchedGirl, setLastFetchedGirl] = useState<string | null>(null);

    // Memoize fetchCharacterByName to prevent unnecessary dependency changes
    const stableFetchCharacter = useCallback(
      (girlName: string) => {
        fetchCharacterByName(girlName);
      },
      [fetchCharacterByName]
    );

    // Memoize video URLs to prevent recalculation on every render
    const videoUrls = useMemo(() => {
      if (!character) return { idle: null, rub: null, dance: null };

      const s3Url = import.meta.env.VITE_S3_URL ?? 'cdn.bubblejump.ai';
      const getVideoUrl = (videoType: 'idle' | 'rub' | 'dance') => {
        if (
          s3Url &&
          character.s3_files[videoType]?.exists &&
          character.s3_files[videoType]?.key
        ) {
          return `https://${s3Url}/${character.s3_files[videoType].key}`;
        }
        return null;
      };

      return {
        idle: getVideoUrl('idle'),
        rub: getVideoUrl('rub'),
        dance: getVideoUrl('dance'),
      };
    }, [character]);

    // Log character only when it changes (not on every render)
    useEffect(() => {
      if (character && process.env.NODE_ENV === 'development') {
        // Temporarily commented out to debug React child error
        // console.log(
        //   `🎬 VideoComponent: Character "${character.name}" loaded with ${
        //     Object.keys(character.s3_files).length
        //   } video files`
        // );
      }
    }, [character]);

    // Fetch character data when user's girl changes
    useEffect(() => {
      if (user?.data?.girl && lastFetchedGirl !== user.data.girl) {
        // Only fetch if we haven't fetched this girl yet
        setLastFetchedGirl(user.data.girl);
        stableFetchCharacter(user.data.girl);
      }
    }, [user?.data?.girl, lastFetchedGirl, stableFetchCharacter]);

    // NOW conditional returns are safe - after all hooks
    if (loading) {
      return <div>Loading character...</div>;
    }

    if (error && !character) {
      return <div>Failed to load character</div>;
    }

    if (!character) {
      return <div>No character selected</div>;
    }

    return (
      <>
        {videoUrls.idle && <Video play={isIdle} url={videoUrls.idle} />}
        {videoUrls.rub && <Video play={isRubbing} url={videoUrls.rub} />}
        {videoUrls.dance && <Video play={isUndress} url={videoUrls.dance} />}
      </>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.isRubbing === nextProps.isRubbing &&
      prevProps.isIdle === nextProps.isIdle &&
      prevProps.isUndress === nextProps.isUndress
    );
  }
);

VideoComponent.displayName = 'VideoComponent';

export default VideoComponent;

const Video = memo(({ play, url }: { play: boolean; url: string | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      if (play && isLoaded) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            logger.error('Failed to play video', error);
            // On iOS, try playing again after user interaction
            document.body.addEventListener(
              'touchstart',
              () => {
                video
                  .play()
                  .catch((e) =>
                    logger.error('Failed to play video after touch', e)
                  );
              },
              { once: true }
            );
          });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [play, isLoaded]);

  // Preload the video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      className={classNames('video')}
      loop
      muted
      playsInline
      autoPlay={play}
      preload="auto"
      webkit-playsinline="true"
      style={{
        opacity: play ? 1 : 0,
        display: play ? 'block' : 'none',
      }}
      width="100%"
      height="100%"
      onLoadedData={() => setIsLoaded(true)}
      onError={(e) =>
        logger.error('Failed to load video', { error: String(e) })
      }
    >
      {url && <source src={url} type="video/mp4" />}
      {/* Add WebM version if available */}
      {/* {url.replace('.mp4', '.webm') && <source src={url.replace('.mp4', '.webm')} type="video/webm" />} */}
      Your browser does not support the video tag.
    </video>
  );
});

Video.displayName = 'Video';
