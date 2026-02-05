import { useQuery } from '@tanstack/react-query';

import { getGifts } from '@/api/gifts';
import airIcon from '@/assets/mini/air.png';
import { Text } from '@/components';

import s from './GiftsPage.module.scss';

export function GiftsPage() {
  const {
    data: gifts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['gifts'],
    queryFn: getGifts,
  });

  return (
    <div className={s.container}>
      {isLoading ? <Text variant="span">Loading...</Text> : null}
      {isError ? (
        <Text variant="span">
          {error instanceof Error ? error.message : 'Failed to load gifts'}
        </Text>
      ) : null}

      {!isLoading && !isError ? (
        <div className={s.grid}>
          {gifts.map((gift) => {
            return (
              <div className={s.card} key={gift.id}>
                <div className={s.header}>
                  <Text variant="span" className={s.name}>
                    {gift.name}
                  </Text>
                </div>
                <div className={s.content}>
                  <img
                    src={gift.imgUrl}
                    alt={gift.name}
                    className={s.image}
                    draggable={false}
                  />
                </div>
                <div className={s.description}>{gift.description}</div>

                <button type="button" className={s.priceButton}>
                  <span className={s.price}>{gift.price}</span>
                  <img
                    src={airIcon}
                    alt="air"
                    className={s.airIcon}
                    draggable={false}
                  />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
