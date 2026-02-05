import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { buyGift, getGifts } from '@/api/gifts';
import airIcon from '@/assets/mini/air.png';
import type { IGift } from '@/common/types';
import { Text } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './GiftsPage.module.scss';

export function GiftsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const {
    data: gifts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['gifts'],
    queryFn: getGifts,
  });

  const handleBuy = (gift: IGift) => {
    const currentAir = user?.air ?? 0;
    if (gift.isBought) return;
    if (currentAir < gift.price) {
      navigate('/store');
      return;
    }

    void (async () => {
      try {
        setBuyingId(gift.id);
        await buyGift(gift.id);
        queryClient.invalidateQueries({ queryKey: ['gifts'] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
      } catch (err) {
        console.error(err);
      } finally {
        setBuyingId(null);
      }
    })();
  };

  return (
    <div className={s.container}>
      {isLoading ? <Text variant="span">Loading...</Text> : null}
      {isError ? (
        <Text variant="span">
          {error instanceof Error ? error.message : 'Failed to load gifts'}
        </Text>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.grid}>
            {gifts
              .filter((gift) => !gift.isBought)
              .map((gift) => {
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
                    <button
                      type="button"
                      className={s.priceButton}
                      onClick={() => handleBuy(gift)}
                      disabled={gift.isBought || buyingId === gift.id}
                    >
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

          {gifts.some((gift) => gift.isBought) ? (
            <div className={s.ownedSection}>
              <Text variant="span" className={s.ownedTitle}>
                Owned
              </Text>
              <div className={s.grid}>
                {gifts
                  .filter((gift) => gift.isBought)
                  .map((gift) => {
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
                        <button
                          type="button"
                          className={s.priceButton}
                          onClick={() => handleBuy(gift)}
                          disabled={gift.isBought || buyingId === gift.id}
                        >
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
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
