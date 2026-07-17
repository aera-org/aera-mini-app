import { useQuery } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useMemo, useState } from 'react';

import { getReferral } from '@/api/referral';
import { SendIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { cn } from '@/common/utils';
import { Loader, Typography } from '@/components';

import s from './EarnPage.module.scss';

const AFFILIATE_PARAGRAPHS = [
  'Hello, we are the AERA team.',
  'We are scaling fast and looking for long-term partners who can bring consistent, high-volume traffic to our product.',
  'If you run Telegram channels or social media platforms, we’re actively buying traffic and building strategic partnerships.',
  'Fill out the form below, and our team will contact you to discuss placements and collaboration.',
];

const REFERRAL_GOAL = 10;
const COPY_FEEDBACK_MS = 1500;

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const didCopy = document.execCommand('copy');
    if (!didCopy) {
      throw new Error('Copy command failed');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

export function EarnPage() {
  const [isCopied, setIsCopied] = useState(false);
  const affiliateUrl = import.meta.env.VITE_AFFILIATE_URL?.trim();
  const isAffiliateDisabled = !affiliateUrl;
  const {
    data: referral,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['referral'],
    queryFn: getReferral,
  });

  const referredCount = referral?.referredCount ?? 0;
  const filledSegments = Math.min(Math.max(referredCount, 0), REFERRAL_GOAL);
  const remainingCount = Math.max(REFERRAL_GOAL - referredCount, 0);
  const progressSegments = useMemo(
    () => Array.from({ length: REFERRAL_GOAL }, (_, index) => index),
    [],
  );
  const isInviteDisabled = isLoading || !referral?.link;

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, COPY_FEEDBACK_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCopied]);

  const handleInviteClick = () => {
    if (!referral?.link) return;

    void copyTextToClipboard(referral.link)
      .then(() => {
        setIsCopied(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleBecomePartnerClick = () => {
    if (!affiliateUrl) {
      console.error('VITE_AFFILIATE_URL is not set');
      return;
    }

    if (typeof TelegramWebApp.openLink === 'function') {
      TelegramWebApp.openLink(affiliateUrl);
      return;
    }

    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={s.page}>
      <section className={s.referralCard}>
        <div className={s.referralHeader}>
          <div className={s.referralCopy}>
            <Typography
              as="div"
              variant="label"
              family="brand"
              weight={700}
              className={s.referralEyebrow}
            >
              Give 100 - Get 100
            </Typography>

            <Typography
              as="h1"
              variant="heading-lg"
              family="brand"
              weight={600}
              className={s.referralTitle}
            >
              Share AERA, earn AIR
            </Typography>
          </div>

          <button
            type="button"
            className={s.inviteButton}
            onClick={handleInviteClick}
            disabled={isInviteDisabled}
          >
            <SendIcon width={18} height={18} aria-hidden />
            <span>{isCopied ? 'Copied' : 'Invite'}</span>
          </button>
        </div>

        <Typography
          as="p"
          variant="body-sm"
          family="system"
          weight={400}
          className={s.referralBody}
        >
          You both get <strong>100</strong>
          <img
            src={airIcon}
            alt="AIR"
            className={s.inlineAirIcon}
            draggable={false}
          />{' '}
          when they subscribe. Hit 10 referrals and unlock a{' '}
          <strong>1,000</strong> bonus.
        </Typography>

        <div className={s.progressBlock}>
          <div
            className={s.progressSegments}
            aria-label={`${filledSegments} of ${REFERRAL_GOAL} referrals completed`}
          >
            {progressSegments.map((segment) => (
              <span
                key={segment}
                className={cn(s.progressSegment, [], {
                  [s.progressSegmentFilled]: segment < filledSegments,
                })}
              />
            ))}
          </div>

          <div className={s.progressLabels}>
            <Typography
              as="span"
              variant="body-sm"
              family="system"
              weight={500}
              className={s.progressLabel}
            >
              <strong>{referredCount}</strong> referred
            </Typography>
            <Typography
              as="span"
              variant="body-sm"
              family="system"
              weight={500}
              className={s.progressLabel}
            >
              <strong>{remainingCount}</strong> to go for <strong>1k</strong>{' '}
              bonus
            </Typography>
          </div>
        </div>

        {isLoading ? <Loader /> : null}
        {isError ? (
          <Typography
            as="p"
            variant="caption"
            family="system"
            weight={500}
            className={s.errorText}
          >
            {error instanceof Error ? error.message : 'Failed to load referral'}
          </Typography>
        ) : null}
      </section>

      <section className={s.card}>
        <div className={s.copy}>
          <Typography
            as="h2"
            variant="display-lg"
            family="brand"
            weight={600}
            className={s.title}
          >
            Become Affiliate
          </Typography>
          <div className={s.text}>
            {AFFILIATE_PARAGRAPHS.map((paragraph) => (
              <Typography
                key={paragraph}
                as="p"
                variant="body-md"
                family="system"
                weight={400}
                className={s.paragraph}
              >
                {paragraph}
              </Typography>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={s.cta}
          onClick={handleBecomePartnerClick}
          disabled={isAffiliateDisabled}
        >
          <Typography
            as="span"
            variant="body-sm"
            family="system"
            weight={500}
            color="white"
            className={s.ctaText}
          >
            🤝🏻 Become a Partner
          </Typography>
        </button>
      </section>
    </div>
  );
}
