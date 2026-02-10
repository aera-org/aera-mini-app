import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { buyGift, getGifts } from '@/api/gifts';
import airIcon from '@/assets/mini/air.png';
import type { IGift } from '@/common/types';
import { Text } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './GiftsPage.module.scss';

export function GiftsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!location.hash || gifts.length === 0) return;
    const giftId = decodeURIComponent(location.hash.replace('#', '').trim());
    if (!giftId) return;
    const exists = gifts.some((gift) => gift.id === giftId);
    if (!exists) return;

    let timeoutId: number | undefined;
    let retryId: number | undefined;
    const tryHighlight = (attempt: number) => {
      const element = document.querySelector(
        `[data-gift-id="${giftId}"]`,
      ) as HTMLElement | null;
      if (!element) {
        if (attempt < 3) {
          retryId = window.setTimeout(() => {
            tryHighlight(attempt + 1);
          }, 120);
        }
        return;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(giftId);
      timeoutId = window.setTimeout(() => {
        setHighlightedId((current) => (current === giftId ? null : current));
      }, 1800);
    };

    const rafId = window.requestAnimationFrame(() => tryHighlight(0));
    return () => {
      window.cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (retryId) window.clearTimeout(retryId);
    };
  }, [gifts, location.hash]);

  const renderGiftCard = (gift: IGift) => {
    return (
      <div
        className={`${s.card} ${
          highlightedId === gift.id ? s.highlighted : ''
        }`}
        key={gift.id}
        data-gift-id={gift.id}
      >
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
            {gifts.filter((gift) => !gift.isBought).map(renderGiftCard)}
          </div>

          {gifts.some((gift) => gift.isBought) ? (
            <div className={s.ownedSection}>
              <Text variant="span" className={s.ownedTitle}>
                Owned
              </Text>
              <div className={s.grid}>
                {gifts.filter((gift) => gift.isBought).map(renderGiftCard)}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
