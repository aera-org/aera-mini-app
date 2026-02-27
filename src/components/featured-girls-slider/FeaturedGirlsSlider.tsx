import { useCallback, useEffect, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import { GiftIcon, MessageIcon } from '@/assets/icons';
import type { ICharacter } from '@/common/types';
import { cn } from '@/common/utils';
import { IconButton, Typography } from '@/components';

import s from './FeaturedGirlsSlider.module.scss';

type FeaturedGirlsSliderProps = {
  girls: ICharacter[];
  onMessageClick: (girl: ICharacter) => void;
};

export function FeaturedGirlsSlider({
  girls,
  onMessageClick,
}: FeaturedGirlsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false });
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

  return (
    <section className={s.slider}>
      <div className={s.viewport} ref={emblaRef}>
        <div className={s.container}>
          {girls.map((girl) => {
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
                      >
                        <GiftIcon width={20} height={20} />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={s.indicator}>
        {girls.map((girl, index) => (
          <button
            key={`indicator-${girl.id}`}
            type="button"
            className={cn(s.indicatorItem, [
              selectedIndex === index ? s.indicatorItemActive : null,
            ])}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
