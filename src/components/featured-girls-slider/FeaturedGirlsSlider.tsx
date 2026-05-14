import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import { GiftIcon, MessageIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import type { ICharacter } from '@/common/types';
import { cn } from '@/common/utils';
import { IconButton, Typography } from '@/components';

import s from './FeaturedGirlsSlider.module.scss';

type FeaturedGirlsCustomSlide = {
  backgroundImage: string;
  title: string;
  description: string;
  priceAir: number;
  actionLabel: string;
  onActionClick: () => void;
};

type FeaturedGirlsSliderProps = {
  girls: ICharacter[];
  onMessageClick: (girl: ICharacter) => void;
  onGiftClick: (girl: ICharacter) => void;
  customSlide?: FeaturedGirlsCustomSlide;
};

export function FeaturedGirlsSlider({
  girls,
  onMessageClick,
  onGiftClick,
  customSlide,
}: FeaturedGirlsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateSelectedIndex();
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);
    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  if (girls.length === 0) return null;

  const indicatorCount = girls.length + (customSlide ? 1 : 0);

  const renderGirlSlide = (girl: ICharacter) => {
    const hasNewScenario = (girl.scenarios ?? []).some(
      (scenario) => scenario.isNew && scenario.isActive,
    );
    const backgroundImage = girl.promoImgUrl;

    return (
      <div className={s.slide} key={girl.id}>
        <div
          className={s.slideBackground}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className={s.slideOverlay} />
          <div className={s.content}>
            <div>
              <div className={s.titleRow}>
                <Typography
                  as="span"
                  variant="heading-lg"
                  family="brand"
                  weight={600}
                  className={s.name}
                >
                  {girl.name}
                </Typography>
                {hasNewScenario ? (
                  <span className={s.badge}>
                    <Typography
                      as="span"
                      variant="caption"
                      family="brand"
                      weight={500}
                      className={s.badgeText}
                    >
                      new scenario
                    </Typography>
                  </span>
                ) : null}
              </div>
              <Typography
                as="div"
                variant="body-md"
                family="system"
                weight={400}
                className={s.description}
              >
                {girl.description}
              </Typography>
            </div>
            <div className={s.actions}>
              <button
                type="button"
                className={s.messageButton}
                onClick={() => onMessageClick(girl)}
              >
                <MessageIcon width={20} height={20} />
                <Typography
                  as="span"
                  variant="body-sm"
                  family="brand"
                  weight={500}
                  color="black"
                  className={s.messageButtonText}
                >
                  Message
                </Typography>
              </button>
              <IconButton
                className={s.giftButton}
                aria-label={`Open gifts for ${girl.name}`}
                onClick={() => onGiftClick(girl)}
              >
                <GiftIcon width={20} height={20} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomSlide = () =>
    customSlide ? (
      <div className={s.slide} key="custom-character-slide">
        <div
          className={cn(s.slideBackground, [s.customSlideBackground])}
          style={{ backgroundImage: `url(${customSlide.backgroundImage})` }}
        >
          <div className={s.slideOverlay} />
          <span className={s.customSlidePrice}>
            <img
              src={airIcon}
              alt="air"
              className={s.customSlidePriceIcon}
              draggable={false}
            />
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={500}
              className={s.customSlidePriceText}
            >
              {customSlide.priceAir} AIR
            </Typography>
          </span>
          <div className={s.content}>
            <div>
              <Typography
                as="span"
                variant="heading-lg"
                family="brand"
                weight={600}
                className={s.name}
              >
                {customSlide.title}
              </Typography>
              <Typography
                as="div"
                variant="body-md"
                family="system"
                weight={400}
                className={s.description}
              >
                {customSlide.description}
              </Typography>
            </div>
            <button
              type="button"
              className={s.customSlideButton}
              onClick={customSlide.onActionClick}
            >
              <Typography
                as="span"
                variant="body-sm"
                family="brand"
                weight={600}
                className={s.customSlideButtonText}
              >
                {customSlide.actionLabel}
              </Typography>
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <section className={s.slider}>
      <div className={s.viewport} ref={emblaRef}>
        <div className={s.container}>
          {girls.slice(0, 2).map(renderGirlSlide)}
          {renderCustomSlide()}
          {girls.slice(2).map(renderGirlSlide)}
        </div>
      </div>
      <div className={s.indicator}>
        {Array.from({ length: indicatorCount }).map((_, index) => (
          <button
            key={`indicator-${index}`}
            type="button"
            className={cn(s.indicatorItem, [
              selectedIndex === index ? s.indicatorItemActive : null,
            ])}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
      <div className={s.bottomCard1} />
      <div className={s.bottomCard2} />
    </section>
  );
}
