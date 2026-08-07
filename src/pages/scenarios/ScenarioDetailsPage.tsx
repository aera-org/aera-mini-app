import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  getScenario,
  getScenarioMedia,
  getScenarioMediaTotals,
  SCENARIO_MEDIA_DEFAULT_TAKE,
  scenarioKeys,
  unblurScenarioVideo,
  unlockScenario,
} from '@/api/scenarios';
import {
  CrossIcon,
  ImageIcon,
  LockIcon,
  MessageIcon,
  PlayIcon,
  SparklesIcon,
  VideoIcon,
} from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import {
  ContentItemType,
  type IScenarioDetails,
  type IScenarioMedia,
  type MediaQuery,
  type Paginated,
  SCENARIO_CONTENT_PRICE,
  VIDEO_PRICE,
} from '@/common/types';
import { capitalize, cn } from '@/common/utils';
import {
  Loader,
  type ScenarioGalleryItem,
  ScenarioMediaGallery,
  Typography,
} from '@/components';
import { useUser } from '@/context/UserContext';

import s from './ScenarioDetailsPage.module.scss';

type ScenarioMediaTab = ContentItemType.Image | ContentItemType.Video;
type ScenarioMediaInfiniteData = InfiniteData<
  Paginated<IScenarioMedia>,
  MediaQuery
>;

const MEDIA_TABS = [
  { label: 'Images', value: ContentItemType.Image },
  { label: 'Videos', value: ContentItemType.Video },
] satisfies Array<{ label: string; value: ScenarioMediaTab }>;

const DOCK_SCROLL_THRESHOLD = 280;

function isScenarioMediaTab(value: string | null): value is ScenarioMediaTab {
  return value === ContentItemType.Image || value === ContentItemType.Video;
}

function getMediaUrl(media: IScenarioMedia) {
  if (media.type === ContentItemType.Video) {
    return media.previewUrl ?? media.url;
  }

  return media.url;
}

function getUnlockErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to unlock content';
}

function shouldRedirectToStore(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('air') ||
    message.includes('balance') ||
    message.includes('buy_credits') ||
    message.includes('credit') ||
    message.includes('insufficient') ||
    message.includes('payment') ||
    message.includes('402') ||
    message.includes('subscribe')
  );
}

function replaceScenarioMediaItem(
  data: ScenarioMediaInfiniteData | undefined,
  nextMedia: IScenarioMedia,
): ScenarioMediaInfiniteData | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.map((media) =>
        media.id === nextMedia.id ? nextMedia : media,
      ),
    })),
  };
}

export function ScenarioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { refresh, user } = useUser();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledTabRef = useRef<string | null>(null);
  const tabParam = searchParams.get('tab');
  const activeTab = isScenarioMediaTab(tabParam)
    ? tabParam
    : ContentItemType.Image;
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [galleryActiveId, setGalleryActiveId] = useState<string | null>(null);
  const [lockedVideo, setLockedVideo] = useState<IScenarioMedia | null>(null);

  const scenarioQuery = useQuery({
    queryKey: scenarioKeys.detail(id ?? ''),
    queryFn: () => getScenario(id ?? ''),
    enabled: Boolean(id),
  });
  const scenario = scenarioQuery.data ?? null;
  const isLocked = scenario ? !scenario.isUnlocked : false;

  const mediaQuery = useInfiniteQuery({
    queryKey: scenarioKeys.media(id ?? '', activeTab, {
      skip: 0,
      take: SCENARIO_MEDIA_DEFAULT_TAKE,
    }),
    queryFn: ({ pageParam }) =>
      getScenarioMedia(id ?? '', activeTab, pageParam),
    enabled: Boolean(id),
    initialPageParam: {
      skip: 0,
      take: SCENARIO_MEDIA_DEFAULT_TAKE,
    },
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.take;

      if (nextSkip >= lastPage.total) {
        return undefined;
      }

      return {
        skip: nextSkip,
        take: lastPage.take,
      };
    },
    placeholderData: keepPreviousData,
  });

  const totalsQuery = useQuery({
    queryKey: scenarioKeys.mediaTotals(id ?? ''),
    queryFn: () => getScenarioMediaTotals(id ?? ''),
    enabled: Boolean(id) && isLocked,
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockScenario(id ?? ''),
    onSuccess: async (response) => {
      if (response && 'scenario' in response && response.scenario) {
        queryClient.setQueryData(scenarioKeys.detail(id ?? ''), response.scenario);
      } else if (response && 'id' in response) {
        queryClient.setQueryData(
          scenarioKeys.detail(id ?? ''),
          response as IScenarioDetails,
        );
      }

      setIsUnlockModalOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scenarioKeys.detail(id ?? '') }),
        queryClient.invalidateQueries({ queryKey: scenarioKeys.mediaLists() }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        refresh(),
      ]);
    },
    onError: (error) => {
      if (!shouldRedirectToStore(error)) {
        return;
      }

      setIsUnlockModalOpen(false);
      navigate('/store');
    },
  });

  const handleUnlockConfirm = () => {
    if (user && user.air < SCENARIO_CONTENT_PRICE) {
      setIsUnlockModalOpen(false);
      navigate('/store');
      return;
    }

    unlockMutation.mutate();
  };

  const unblurVideoMutation = useMutation({
    mutationFn: (videoId: string) => {
      if (!id) {
        throw new Error('Scenario id is missing');
      }

      return unblurScenarioVideo(id, videoId);
    },
    onSuccess: async (video) => {
      queryClient.setQueriesData<ScenarioMediaInfiniteData>(
        { queryKey: scenarioKeys.mediaLists() },
        (data) => replaceScenarioMediaItem(data, video),
      );

      setLockedVideo(null);
      setGalleryActiveId(video.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scenarioKeys.mediaLists() }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        refresh(),
      ]);
    },
    onError: (error) => {
      if (!shouldRedirectToStore(error)) {
        return;
      }

      setLockedVideo(null);
      navigate('/store');
    },
  });

  const handleVideoUnlockConfirm = () => {
    if (!lockedVideo) return;

    if (user && user.air < VIDEO_PRICE) {
      setLockedVideo(null);
      navigate('/store');
      return;
    }

    unblurVideoMutation.mutate(lockedVideo.id);
  };

  const handleLockedVideoOpen = (video: IScenarioMedia) => {
    unblurVideoMutation.reset();
    setLockedVideo(video);
  };

  const handleVideoUnlockClose = () => {
    if (unblurVideoMutation.isPending) return;

    unblurVideoMutation.reset();
    setLockedVideo(null);
  };

  const mediaItems = useMemo(
    () => mediaQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [mediaQuery.data],
  );
  const galleryItems = useMemo<ScenarioGalleryItem[]>(
    () =>
      mediaItems
        .filter((media) => !media.isBlurred)
        .map((media) => ({
          alt: scenario?.name,
          id: media.id,
          previewUrl: media.previewUrl,
          type: media.type === ContentItemType.Video ? 'video' : 'image',
          url: media.url,
        })),
    [mediaItems, scenario?.name],
  );
  const activeGalleryItem = galleryActiveId
    ? galleryItems.find((item) => item.id === galleryActiveId)
    : null;
  const canLoadMore =
    Boolean(mediaQuery.hasNextPage) && !mediaQuery.isFetchingNextPage;
  const heroImageUrl =
    scenario?.promoImgUrl || scenario?.openingImageUrl || scenario?.character.avatarUrl;
  const characterPersonality = scenario?.character.personality
    ? scenario.character.personality.map(capitalize).join(', ')
    : '';
  const mediaErrorMessage =
    mediaQuery.error instanceof Error
      ? mediaQuery.error.message
      : 'Failed to load media';

  useEffect(() => {
    if (!scenario || !id || !isScenarioMediaTab(tabParam)) return;
    if (
      mediaQuery.isLoading ||
      mediaQuery.isFetching ||
      mediaQuery.isPlaceholderData
    ) {
      return;
    }

    const scrollKey = `${id}:${activeTab}`;
    if (lastScrolledTabRef.current === scrollKey) return;

    lastScrolledTabRef.current = scrollKey;
    let secondFrameId: number | null = null;
    const firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        tabsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      if (secondFrameId !== null) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [
    activeTab,
    id,
    mediaQuery.dataUpdatedAt,
    mediaQuery.isFetching,
    mediaQuery.isLoading,
    mediaQuery.isPlaceholderData,
    scenario,
    tabParam,
  ]);

  const handleTabChange = (tab: ScenarioMediaTab) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', tab);
    setSearchParams(nextSearchParams);
  };

  const handleStartChat = () => {
    if (!scenario) return;

    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    if (!botUsername) {
      console.error('VITE_BOT_USERNAME is not set');
      return;
    }
    if (!scenario.slug) {
      console.error('Scenario slug is missing');
      return;
    }

    TelegramWebApp.openTelegramLink(
      `https://t.me/${botUsername}?start=s_${scenario.slug}`,
    );
    TelegramWebApp.close();
  };

  if (scenarioQuery.isLoading) {
    return (
      <div className={s.page}>
        <div className={s.stateContainer}>
          <Loader />
        </div>
      </div>
    );
  }

  if (scenarioQuery.isError || !scenario || !id) {
    return (
      <div className={s.page}>
        <div className={s.stateContainer}>
          <Typography variant="body-md">
            {scenarioQuery.error instanceof Error
              ? scenarioQuery.error.message
              : 'Failed to load scenario'}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div
      className={s.page}
      onScroll={(event) => {
        setIsDockVisible(event.currentTarget.scrollTop > DOCK_SCROLL_THRESHOLD);
      }}
    >
      <section className={s.hero}>
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={scenario.name}
            className={s.heroImage}
            draggable={false}
          />
        ) : null}
        <div className={s.heroGlow} aria-hidden="true" />
        <div className={s.profilePanel}>
          <div className={s.visualSpacer} aria-hidden="true" />
          <div className={s.copy}>
            <Typography
              as="h1"
              variant="display-xl"
              family="brand"
              weight={600}
              className={s.title}
            >
              {scenario.name}
            </Typography>
            <Typography
              as="span"
              variant="heading-sm"
              family="brand"
              weight={500}
              className={s.characterName}
            >
              {scenario.character.name}
            </Typography>
          </div>

          <div className={s.actions}>
            <button type="button" className={s.chatButton} onClick={handleStartChat}>
              <MessageIcon width={18} height={18} />
              <span>Chat</span>
            </button>
            <button type="button" className={s.generateButton} disabled>
              <SparklesIcon width={18} height={18} />
              <span>Generate</span>
            </button>
          </div>

          <div className={s.unlockIntro}>
            <div className={s.metaRow}>
              <span>
                {typeof scenario.character.age === 'number'
                  ? `Age: ${scenario.character.age}`
                  : ''}
              </span>
              <span>{characterPersonality}</span>
            </div>
            <Typography
              as="p"
              variant="body-lg"
              family="system"
              weight={400}
              className={s.description}
            >
              {scenario.description}
            </Typography>
          </div>

          {isLocked ? (
            <button
              type="button"
              className={s.unlockButton}
              onClick={() => setIsUnlockModalOpen(true)}
            >
              <LockIcon />
              <span>Unlock all</span>
              <strong className={s.unlockPrice}>
                <img src={airIcon} alt="" draggable={false} />
                {SCENARIO_CONTENT_PRICE}
              </strong>
            </button>
          ) : null}
        </div>
      </section>

      <section className={s.mediaSection}>
        <div
          className={s.tabs}
          ref={tabsRef}
          role="tablist"
          aria-label="Scenario media"
        >
          {MEDIA_TABS.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(s.tabButton, [], { [s.tabButtonActive]: isActive })}
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.value === ContentItemType.Image ? (
                  <ImageIcon width={14} height={14} />
                ) : (
                  <VideoIcon width={14} height={14} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {mediaQuery.isLoading ? (
          <div className={s.stateContainer}>
            <Loader />
          </div>
        ) : null}

        {mediaQuery.isError ? (
          <div className={s.mediaMessage}>
            <Typography variant="body-md">{mediaErrorMessage}</Typography>
            <button
              type="button"
              className={s.secondaryAction}
              onClick={() => {
                void mediaQuery.refetch();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!mediaQuery.isLoading && !mediaQuery.isError && !mediaItems.length ? (
          <div className={s.mediaMessage}>
            <Typography variant="body-md">
              No {activeTab === ContentItemType.Image ? 'images' : 'videos'} yet
            </Typography>
          </div>
        ) : null}

        {mediaItems.length ? (
          <div className={s.grid}>
            {mediaItems.map((media) => (
              <button
                key={media.id}
                type="button"
                className={cn(s.tile, [], { [s.tileLocked]: media.isBlurred })}
                aria-label={
                  media.isBlurred
                    ? 'Unlock scenario media'
                    : 'Open scenario media'
                }
                onClick={() => {
                  if (media.isBlurred) {
                    if (media.type === ContentItemType.Video) {
                      handleLockedVideoOpen(media);
                      return;
                    }

                    setIsUnlockModalOpen(true);
                    return;
                  }

                  setGalleryActiveId(media.id);
                }}
              >
                {activeTab === ContentItemType.Video ? (
                  <video
                    className={cn(s.tileMedia, [], {
                      [s.tileMediaBlurred]: media.isBlurred,
                    })}
                    muted
                    playsInline
                    poster={media.previewUrl ?? undefined}
                    preload="metadata"
                    src={media.url}
                  />
                ) : (
                  <img
                    src={getMediaUrl(media)}
                    alt=""
                    className={s.tileMedia}
                    loading="lazy"
                    draggable={false}
                  />
                )}
                {activeTab === ContentItemType.Video && !media.isBlurred ? (
                  <span className={s.playBadge}>
                    <PlayIcon />
                  </span>
                ) : null}
                {media.isBlurred ? (
                  <span className={s.lockOverlay}>
                    <LockIcon />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {mediaQuery.hasNextPage ? (
          <button
            type="button"
            className={s.loadMoreButton}
            disabled={!canLoadMore}
            onClick={() => {
              void mediaQuery.fetchNextPage();
            }}
          >
            {mediaQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        ) : null}
      </section>

      {isLocked ? (
        <div
          className={s.bottomDock}
          data-visible={isDockVisible}
          aria-hidden={!isDockVisible}
        >
          <button
            type="button"
            className={s.bottomDockButton}
            tabIndex={isDockVisible ? undefined : -1}
            onClick={() => setIsUnlockModalOpen(true)}
          >
            <LockIcon />
            <span>Unlock all</span>
            <strong className={s.unlockPrice}>
              <img src={airIcon} alt="" draggable={false} />
              {SCENARIO_CONTENT_PRICE}
            </strong>
          </button>
        </div>
      ) : null}

      {isUnlockModalOpen ? (
        <div
          className={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scenario-unlock-title"
          onClick={() => setIsUnlockModalOpen(false)}
        >
          <div className={s.modal} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={s.modalClose}
              aria-label="Close unlock modal"
              onClick={() => setIsUnlockModalOpen(false)}
            >
              <CrossIcon width={18} height={18} />
            </button>
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt=""
                className={s.modalImage}
                draggable={false}
              />
            ) : null}
            <div className={s.modalShade} aria-hidden="true" />
            <div className={s.modalContent}>
              <Typography
                id="scenario-unlock-title"
                as="h2"
                variant="display-lg"
                family="brand"
                weight={600}
                className={s.modalTitle}
              >
                {scenario.name}
              </Typography>
              <Typography
                as="p"
                variant="body-md"
                family="system"
                className={s.modalDescription}
              >
                Unlock all content including future generations.
              </Typography>
              <div className={s.totalsRow}>
                <span>
                  <ImageIcon width={18} height={18} />
                  <strong>{totalsQuery.data?.images ?? '-'}</strong>
                  <small>Images</small>
                </span>
                <span>
                  <VideoIcon width={18} height={18} />
                  <strong>{totalsQuery.data?.videos ?? '-'}</strong>
                  <small>Videos</small>
                </span>
              </div>
              <span className={s.futureBadge}>+ all future content</span>
              {unlockMutation.isError ? (
                <Typography variant="caption" className={s.unlockError}>
                  {getUnlockErrorMessage(unlockMutation.error)}
                </Typography>
              ) : null}
              <button
                type="button"
                className={s.modalUnlockButton}
                disabled={unlockMutation.isPending}
                onClick={handleUnlockConfirm}
              >
                <LockIcon />
                <span>
                  {unlockMutation.isPending
                    ? 'Unlocking...'
                    : 'Unlock all Content'}
                </span>
                {!unlockMutation.isPending ? (
                  <strong className={s.unlockPrice}>
                    <img src={airIcon} alt="" draggable={false} />
                    {SCENARIO_CONTENT_PRICE}
                  </strong>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lockedVideo ? (
        <div
          className={s.videoUnlockOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scenario-video-unlock-title"
          onClick={handleVideoUnlockClose}
        >
          <div
            className={s.videoUnlockModal}
            onClick={(event) => event.stopPropagation()}
          >
            {lockedVideo.previewUrl ? (
              <img
                src={lockedVideo.previewUrl}
                alt=""
                className={s.videoUnlockMedia}
                draggable={false}
              />
            ) : (
              <video
                className={s.videoUnlockMedia}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
                src={lockedVideo.url}
              />
            )}
            <div className={s.videoUnlockShade} aria-hidden="true" />
            <div className={s.videoUnlockContent}>
              <span className={s.videoUnlockLock} aria-hidden="true">
                <PlayIcon />
              </span>
              {unblurVideoMutation.isError ? (
                <Typography variant="caption" className={s.unlockError}>
                  {getUnlockErrorMessage(unblurVideoMutation.error)}
                </Typography>
              ) : null}
              <button
                type="button"
                className={s.videoUnlockButton}
                disabled={unblurVideoMutation.isPending}
                onClick={handleVideoUnlockConfirm}
              >
                <LockIcon />
                <span>
                  {unblurVideoMutation.isPending ? 'Unlocking...' : 'Unlock video'}
                </span>
                {!unblurVideoMutation.isPending ? (
                  <strong className={s.unlockPrice}>
                    <img src={airIcon} alt="" draggable={false} />
                    {VIDEO_PRICE}
                  </strong>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ScenarioMediaGallery
        activeId={activeGalleryItem?.id ?? null}
        items={galleryItems}
        open={Boolean(activeGalleryItem)}
        onActiveChange={setGalleryActiveId}
        onClose={() => setGalleryActiveId(null)}
      />
    </div>
  );
}
