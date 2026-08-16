import {
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { LockIcon, PauseIcon, PlayIcon } from '@/assets/icons';
import { cn } from '@/common/utils';

import s from './ScenarioMediaGallery.module.scss';

export type ScenarioGalleryItemType = 'image' | 'video';

export type ScenarioGalleryItem = {
  alt?: string;
  id: string;
  isBlurred?: boolean;
  previewUrl?: string | null;
  type: ScenarioGalleryItemType;
  url: string;
};

type ScenarioMediaGalleryProps = {
  activeId: string | null;
  items: ScenarioGalleryItem[];
  open: boolean;
  onActiveChange: (id: string) => void;
  onClose: () => void;
};

type VideoState = {
  duration: number;
  itemId: string | null;
  paused: boolean;
};

type TouchGesture = {
  pointerId: number;
  startX: number;
  startY: number;
};

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
const TOUCH_SWIPE_THRESHOLD_PX = 50;
const TOUCH_SWIPE_AXIS_RATIO = 1.2;
const TOUCH_TAP_THRESHOLD_PX = 10;
const TOUCH_CLOSE_THRESHOLD_PX = 70;
const WHEEL_NAVIGATION_THRESHOLD = 24;
const WHEEL_NAVIGATION_COOLDOWN_MS = 500;

function formatRemainingTime(duration: number, currentTime: number) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return '-00:00';
  }

  const remainingSeconds = Math.max(0, Math.ceil(duration - currentTime));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `-${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function GalleryPreview({
  className,
  item,
  showPlayIcon = false,
}: {
  className?: string;
  item: ScenarioGalleryItem;
  showPlayIcon?: boolean;
}) {
  if (item.type === 'video') {
    if (!item.previewUrl) {
      return (
        <span className={cn(s.previewPlaceholder, [className])}>
          {showPlayIcon ? <PlayIcon aria-hidden="true" /> : null}
        </span>
      );
    }

    return (
      <img
        alt=""
        className={className}
        decoding="async"
        loading="lazy"
        src={item.previewUrl}
        draggable={false}
      />
    );
  }

  return (
    <img
      alt={item.alt ?? ''}
      className={className}
      decoding="async"
      src={item.url}
      draggable={false}
    />
  );
}

export function ScenarioMediaGallery({
  activeId,
  items,
  open,
  onActiveChange,
  onClose,
}: ScenarioMediaGalleryProps) {
  const { t } = useTranslation();
  const activeIndex = activeId
    ? items.findIndex((item) => item.id === activeId)
    : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const touchGestureRef = useRef<TouchGesture | null>(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const wheelLockedUntilRef = useRef(0);
  const navigateRef = useRef<(direction: 'next' | 'previous') => void>(() => {});
  const onCloseRef = useRef(onClose);
  const [videoState, setVideoState] = useState<VideoState>({
    duration: 0,
    itemId: null,
    paused: false,
  });
  const [hiddenChromeItemId, setHiddenChromeItemId] = useState<string | null>(
    null,
  );
  const activeVideoState =
    videoState.itemId === activeItem?.id
      ? videoState
      : {
          duration: 0,
          itemId: activeItem?.id ?? null,
          paused: false,
        };
  const isChromeVisible = hiddenChromeItemId !== activeItem?.id;

  const navigate = useCallback(
    (direction: 'next' | 'previous') => {
      if (items.length === 0) {
        return;
      }

      const nextIndex =
        direction === 'next'
          ? (activeIndex + 1) % items.length
          : (activeIndex - 1 + items.length) % items.length;

      onActiveChange(items[nextIndex].id);
    },
    [activeIndex, items, onActiveChange],
  );
  const closeGallery = useCallback(() => {
    setHiddenChromeItemId(null);
    onClose();
  }, [onClose]);
  const updateVideoControls = useCallback(
    (video: HTMLVideoElement) => {
      const duration = video.duration || activeVideoState.duration || 0;
      const currentTime = video.currentTime || 0;
      const progress = progressRef.current;
      const time = timeRef.current;

      if (progress) {
        const percent =
          duration > 0
            ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
            : 0;

        progress.value = String(Math.min(currentTime, duration || 0));
        progress.max = String(duration || 0);
        progress.disabled = duration <= 0;
        progress.style.setProperty('--video-progress', `${percent}%`);
      }

      if (time) {
        time.textContent = formatRemainingTime(duration, currentTime);
      }
    },
    [activeVideoState.duration],
  );

  useEffect(() => {
    navigateRef.current = navigate;
    onCloseRef.current = closeGallery;
  }, [closeGallery, navigate]);

  useEffect(() => {
    if (!open || items.length === 0 || activeItem) {
      return;
    }

    onActiveChange(items[0].id);
  }, [activeItem, items, onActiveChange, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const root = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyWidth = body.style.width;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.width = '100%';

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.width = previousBodyWidth;

      if (scrollX !== 0 || scrollY !== 0) {
        window.scrollTo(scrollX, scrollY);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || items.length < 2) {
      return undefined;
    }

    const gallery = galleryRef.current;

    if (!gallery) {
      return undefined;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia(MOBILE_MEDIA_QUERY).matches
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;

      if (
        target?.closest(
          '[data-gallery-gesture-ignore], button, input, select, textarea',
        )
      ) {
        return;
      }

      if (
        Math.abs(event.deltaY) < WHEEL_NAVIGATION_THRESHOLD ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        Date.now() < wheelLockedUntilRef.current
      ) {
        return;
      }

      wheelLockedUntilRef.current =
        Date.now() + WHEEL_NAVIGATION_COOLDOWN_MS;
      navigateRef.current(event.deltaY > 0 ? 'next' : 'previous');
    };

    gallery.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      gallery.removeEventListener('wheel', handleWheel);
    };
  }, [items.length, open]);

  useEffect(
    () => () => {
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        navigateRef.current('previous');
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        navigateRef.current('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activeItem) {
      return;
    }

    const thumbnail = thumbnailRefs.current.get(activeItem.id);

    if (!thumbnail) {
      return;
    }

    const shouldReduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    thumbnail.scrollIntoView?.({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [activeItem, open]);

  useEffect(() => {
    const video = activeVideoRef.current;

    if (!video || !open) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    updateVideoControls(video);
    void video.play().catch(() => {
      setVideoState({
        duration: video.duration || 0,
        itemId: activeItem?.id ?? null,
        paused: true,
      });
    });
  }, [activeItem?.id, open, updateVideoControls]);

  if (!open || !activeItem) {
    return null;
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;

    if (!target?.closest('[data-gallery-content]')) {
      closeGallery();
    }
  };
  const suppressNextClick = () => {
    suppressClickRef.current = true;

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
    }

    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 350);
  };
  const handleTouchPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;

    if (
      target?.closest(
        '[data-gallery-gesture-ignore], button, input, select, textarea',
      )
    ) {
      return;
    }

    touchGestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const clearTouchGesture = () => {
    touchGestureRef.current = null;
  };
  const handleTouchPointerUp = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const gesture = touchGestureRef.current;

    if (
      !gesture ||
      event.pointerType !== 'touch' ||
      event.pointerId !== gesture.pointerId
    ) {
      return;
    }

    clearTouchGesture();
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (
      deltaY >= TOUCH_CLOSE_THRESHOLD_PX &&
      Math.abs(deltaY) > Math.abs(deltaX) * TOUCH_SWIPE_AXIS_RATIO
    ) {
      event.preventDefault();
      suppressNextClick();
      closeGallery();
      return;
    }

    if (
      Math.abs(deltaX) < TOUCH_SWIPE_THRESHOLD_PX ||
      Math.abs(deltaX) <= Math.abs(deltaY) * TOUCH_SWIPE_AXIS_RATIO
    ) {
      const isMobile =
        typeof window.matchMedia === 'function' &&
        window.matchMedia(MOBILE_MEDIA_QUERY).matches;
      const isTap =
        Math.abs(deltaX) <= TOUCH_TAP_THRESHOLD_PX &&
        Math.abs(deltaY) <= TOUCH_TAP_THRESHOLD_PX;

      if (isMobile && isTap) {
        event.preventDefault();
        suppressNextClick();
        setHiddenChromeItemId((current) =>
          current === activeItem?.id ? null : activeItem?.id ?? null,
        );
      }

      return;
    }

    if (items.length < 2) {
      return;
    }

    event.preventDefault();
    suppressNextClick();
    navigate(deltaX < 0 ? 'next' : 'previous');
  };
  const handleVideoToggle = () => {
    const video = activeVideoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play().catch(() => {
        setVideoState((state) => ({
          ...state,
          itemId: activeItem.id,
          paused: true,
        }));
      });
      return;
    }

    video.pause();
  };
  const handleVideoSeek = (nextTime: number) => {
    const video = activeVideoRef.current;

    if (!video || !Number.isFinite(nextTime)) {
      return;
    }

    video.currentTime = nextTime;
    updateVideoControls(video);
  };

  return createPortal(
    <div
      aria-label={t('gallery.mediaGallery')}
      aria-modal="true"
      className={s.gallery}
      data-chrome-visible={isChromeVisible ? 'true' : 'false'}
      data-has-thumbnails={items.length > 1}
      ref={galleryRef}
      role="dialog"
      onClickCapture={(event) => {
        if (!suppressClickRef.current) {
          return;
        }

        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        aria-hidden="true"
        className={s.backdrop}
        data-gallery-backdrop="true"
      >
        <GalleryPreview className={s.backdropMedia} item={activeItem} />
      </div>

      <main
        className={s.stage}
        data-gallery-stage="true"
        onPointerCancel={clearTouchGesture}
        onPointerDown={handleTouchPointerDown}
        onPointerUp={handleTouchPointerUp}
      >
        <div className={s.mediaFrame}>
          <div
            className={cn(s.mediaShell, [], {
              [s.mediaShellVideo]: activeItem.type === 'video',
            })}
            data-gallery-content="true"
            data-video-paused={
              activeItem.type === 'video' && activeVideoState.paused
                ? 'true'
                : undefined
            }
          >
            {activeItem.type === 'video' ? (
              <video
                aria-label={t('gallery.activeVideo')}
                autoPlay
                className={cn(s.media, [], {
                  [s.mediaBlurred]: Boolean(activeItem.isBlurred),
                })}
                loop
                muted
                playsInline
                poster={activeItem.previewUrl ?? undefined}
                preload="metadata"
                ref={activeVideoRef}
                src={activeItem.url}
                onClick={handleVideoToggle}
                onLoadedMetadata={(event) => {
                  const { duration } = event.currentTarget;

                  setVideoState((state) => ({
                    ...state,
                    duration: duration || 0,
                    itemId: activeItem.id,
                  }));
                  updateVideoControls(event.currentTarget);
                }}
                onPause={(event) => {
                  setVideoState((state) => ({
                    ...state,
                    itemId: activeItem.id,
                    paused: true,
                  }));
                  updateVideoControls(event.currentTarget);
                }}
                onPlay={(event) => {
                  setVideoState((state) => ({
                    ...state,
                    itemId: activeItem.id,
                    paused: false,
                  }));
                  updateVideoControls(event.currentTarget);
                }}
                onTimeUpdate={(event) => {
                  updateVideoControls(event.currentTarget);
                }}
              />
            ) : (
              <GalleryPreview
                className={cn(s.media, [], {
                  [s.mediaBlurred]: Boolean(activeItem.isBlurred),
                })}
                item={activeItem}
              />
            )}

            {activeItem.isBlurred ? (
              <span aria-hidden="true" className={s.lockOverlay}>
                <LockIcon />
              </span>
            ) : null}

            {activeItem.type === 'video' ? (
              <span className={s.videoControls}>
                <button
                  aria-label={
                    activeVideoState.paused
                      ? t('gallery.playVideo')
                      : t('gallery.pauseVideo')
                  }
                  className={s.videoControlButton}
                  type="button"
                  onClick={handleVideoToggle}
                >
                  {activeVideoState.paused ? (
                    <PlayIcon aria-hidden="true" />
                  ) : (
                    <PauseIcon aria-hidden="true" />
                  )}
                </button>
                <input
                  aria-label={t('gallery.videoProgress')}
                  className={s.videoProgress}
                  defaultValue={0}
                  disabled={activeVideoState.duration <= 0}
                  max={activeVideoState.duration || 0}
                  min={0}
                  ref={progressRef}
                  step="0.01"
                  type="range"
                  onChange={(event) => {
                    handleVideoSeek(event.currentTarget.valueAsNumber);
                  }}
                />
                <span className={s.videoTime} ref={timeRef}>
                  -00:00
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </main>

      {items.length > 1 ? (
        <aside
          aria-label={t('gallery.thumbnails')}
          className={s.thumbnails}
          data-gallery-content="true"
          data-gallery-gesture-ignore="true"
        >
          {items.map((item, index) => {
            const active = item.id === activeItem.id;

            return (
              <button
                aria-label={t('gallery.openMedia', { index: index + 1 })}
                aria-current={active ? 'true' : undefined}
                className={cn(s.thumbnail, [], {
                  [s.thumbnailActive]: active,
                })}
                key={item.id}
                ref={(node) => {
                  if (node) {
                    thumbnailRefs.current.set(item.id, node);
                    return;
                  }

                  thumbnailRefs.current.delete(item.id);
                }}
                type="button"
                onClick={() => onActiveChange(item.id)}
              >
                <GalleryPreview
                  className={s.thumbnailMedia}
                  item={item}
                  showPlayIcon={item.type === 'video'}
                />
              </button>
            );
          })}
        </aside>
      ) : null}
    </div>,
    document.body,
  );
}
