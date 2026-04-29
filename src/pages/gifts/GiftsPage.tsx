import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { buyGift, getGifts, sendGift } from '@/api/gifts';
import { GiftIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import type { IGift } from '@/common/types';
import { Card, Loader, Typography } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './GiftsPage.module.scss';

type GiftAction = 'buy' | 'gift' | 'owned';

export function GiftsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();
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

  const buyMutation = useMutation({
    mutationFn: buyGift,
    onSuccess: (result) => {
      if (result.shouldClose === true) {
        TelegramWebApp.close();
        return;
      }

      if (!result.success) return;

      void queryClient.invalidateQueries({ queryKey: ['gifts'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const sendGiftMutation = useMutation({
    mutationFn: sendGift,
    onSuccess: () => {
      TelegramWebApp.close();
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const getGiftAction = (gift: IGift): GiftAction => {
    if (!gift.isBought) return 'buy';
    return user?.hasActiveChat ? 'gift' : 'owned';
  };

  const handleGiftAction = (gift: IGift) => {
    const action = getGiftAction(gift);

    if (action === 'owned') return;

    if (action === 'gift') {
      sendGiftMutation.mutate(gift.id);
      return;
    }

    const currentAir = user?.air ?? 0;
    if (currentAir < gift.price) {
      navigate('/store');
      return;
    }

    buyMutation.mutate(gift.id);
  };

  useEffect(() => {
    if (!location.hash || gifts.length === 0) return;
    const giftId = decodeURIComponent(
      location.hash.split('?')[0].replace('#', '').trim(),
    );
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
    const action = getGiftAction(gift);
    const isPending =
      (buyMutation.isPending && buyMutation.variables === gift.id) ||
      (sendGiftMutation.isPending && sendGiftMutation.variables === gift.id);
    const isDisabled = action === 'owned' || isPending;
    const buttonText =
      action === 'buy' ? 'Buy' : action === 'gift' ? 'Gift' : 'Owned';

    return (
      <Card
        className={`${s.card} ${
          highlightedId === gift.id ? s.highlighted : ''
        }`}
        variant="accent"
        key={gift.id}
        data-gift-id={gift.id}
      >
        <div className={s.iconWrap}>
          <img
            src={gift.imgUrl}
            alt={gift.name}
            className={s.image}
            draggable={false}
          />
        </div>
        <div className={s.body}>
          <Typography
            as="span"
            variant="body-sm"
            family="brand"
            weight={500}
            className={s.name}
          >
            {gift.name}
          </Typography>
          <Typography
            as="div"
            variant="caption"
            family="system"
            weight={400}
            color="muted"
            className={s.description}
          >
            {gift.description}
          </Typography>
          <button
            type="button"
            className={s.giftButton}
            onClick={() => handleGiftAction(gift)}
            disabled={isDisabled}
          >
            <GiftIcon width={20} height={20} className={s.giftIcon} />
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={500}
              color="black"
              className={s.giftButtonText}
            >
              {buttonText}
            </Typography>
          </button>
          <div className={s.priceRow}>
            <img
              src={airIcon}
              alt="air"
              className={s.airIcon}
              draggable={false}
            />
            <Typography
              as="span"
              variant="caption"
              family="system"
              weight={600}
              className={s.price}
            >
              {gift.price}
            </Typography>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={s.container}>
      {isLoading ? <Loader /> : null}
      {isError ? (
        <Typography variant="body-md">
          {error instanceof Error ? error.message : 'Failed to load gifts'}
        </Typography>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className={s.grid}>
            {gifts.filter((gift) => !gift.isBought).map(renderGiftCard)}
          </div>

          {gifts.some((gift) => gift.isBought) ? (
            <div className={s.ownedSection}>
              <Typography as="span" variant="heading-sm" className={s.ownedTitle}>
                Owned
              </Typography>
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
