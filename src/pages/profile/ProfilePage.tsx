import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { patchMe } from '@/api/me';
import { getReferral } from '@/api/referral';
import {
  CheckIcon,
  ChevronRightIcon,
  CrossIcon,
  GlobeIcon,
  SendIcon,
  UserCogIcon,
} from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import { type IUser, Language } from '@/common/types';
import { cn, getSubscriptionRemaining } from '@/common/utils';
import { Loader, Typography } from '@/components';
import { useUser } from '@/context/user-context';
import i18n from '@/i18n/config';

import s from './ProfilePage.module.scss';

const REFERRAL_GOAL = 10;
const COPY_FEEDBACK_MS = 1500;

const LANGUAGE_OPTIONS = [
  { value: Language.EN, label: 'English' },
  { value: Language.Ru, label: 'Русский' },
  { value: Language.Es, label: 'Español' },
  { value: Language.Fr, label: 'Français' },
  { value: Language.De, label: 'Deutsch' },
  { value: Language.It, label: 'Italiano' },
  { value: Language.Pl, label: 'Polski' },
] as const;

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

function formatSubscribedUntil(value: string | null | undefined, language: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useUser();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const remaining = getSubscriptionRemaining(user?.subscribedUntil);
  const subscribedUntilLabel = formatSubscribedUntil(
    user?.subscribedUntil,
    i18n.language,
  );
  const currentLanguage =
    LANGUAGE_OPTIONS.find((option) => option.value === user?.languageUI) ??
    LANGUAGE_OPTIONS[0];

  const languageMutation = useMutation({
    mutationFn: (languageUI: Language) => patchMe({ languageUI }),
    onSuccess: async (_result, languageUI) => {
      queryClient.setQueryData<IUser>(['me'], (current) =>
        current ? { ...current, languageUI } : current,
      );
      await i18n.changeLanguage(languageUI);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsLanguageModalOpen(false);
    },
  });

  return (
    <div className={s.page}>
      <section className={s.panel}>
        <Typography
          as="h1"
          variant="heading-lg"
          family="brand"
          weight={600}
          className={s.title}
        >
          {t('profile.title')}
        </Typography>

        <div className={s.rows}>
          <div className={s.statusRow}>
            <div>
              <Typography
                as="span"
                variant="caption"
                family="system"
                className={s.rowLabel}
              >
                {t('profile.subscription')}
              </Typography>
              <Typography
                as="span"
                variant="body-md"
                family="brand"
                weight={600}
                className={s.rowValue}
              >
                {remaining.active
                  ? t(remaining.key, { count: remaining.count })
                  : t(remaining.key)}
              </Typography>
              {remaining.active && subscribedUntilLabel ? (
                <Typography
                  as="span"
                  variant="caption"
                  family="system"
                  className={s.rowMeta}
                >
                  {subscribedUntilLabel}
                </Typography>
              ) : null}
            </div>
            {!remaining.active ? (
              <button
                type="button"
                className={s.subscribeButton}
                onClick={() => navigate('/bag')}
              >
                {t('common.subscribe')}
              </button>
            ) : null}
          </div>

          <div className={s.infoRow}>
            <div>
              <Typography
                as="span"
                variant="caption"
                family="system"
                className={s.rowLabel}
              >
                {t('profile.airBalance')}
              </Typography>
              <span className={s.airValue}>
                <img src={airIcon} alt="" draggable={false} />
                <Typography
                  as="span"
                  variant="body-md"
                  family="brand"
                  weight={600}
                  className={s.rowValue}
                >
                  {user?.air ?? 0} {t('common.air')}
                </Typography>
              </span>
            </div>
          </div>

          <button
            type="button"
            className={s.actionRow}
            onClick={() => {
              languageMutation.reset();
              setIsLanguageModalOpen(true);
            }}
          >
            <span className={s.actionIcon}>
              <GlobeIcon width={20} height={20} />
            </span>
            <span className={s.actionText}>
              <Typography
                as="span"
                variant="caption"
                family="system"
                className={s.rowLabel}
              >
                {t('profile.language')}
              </Typography>
              <Typography
                as="span"
                variant="body-md"
                family="brand"
                weight={600}
                className={s.rowValue}
              >
                {currentLanguage.label}
              </Typography>
            </span>
            <ChevronRightIcon width={20} height={20} className={s.chevron} />
          </button>

          <button
            type="button"
            className={s.actionRow}
            onClick={() => navigate('/affiliate')}
          >
            <span className={s.actionIcon}>
              <UserCogIcon width={20} height={20} />
            </span>
            <span className={s.actionText}>
              <Typography
                as="span"
                variant="body-md"
                family="brand"
                weight={600}
                className={s.rowValue}
              >
                {t('profile.affiliate')}
              </Typography>
            </span>
            <ChevronRightIcon width={20} height={20} className={s.chevron} />
          </button>
        </div>
      </section>

      <ReferralCard />

      {isLanguageModalOpen ? (
        <LanguageModal
          currentLanguage={user?.languageUI ?? Language.EN}
          isSaving={languageMutation.isPending}
          savingLanguage={languageMutation.variables}
          error={
            languageMutation.error instanceof Error
              ? languageMutation.error.message
              : languageMutation.isError
                ? t('profile.errors.language')
                : null
          }
          onClose={() => {
            if (languageMutation.isPending) return;
            setIsLanguageModalOpen(false);
          }}
          onSelect={(language) => languageMutation.mutate(language)}
        />
      ) : null}
    </div>
  );
}

function ReferralCard() {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
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

  return (
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
            {t('referral.eyebrow')}
          </Typography>

          <Typography
            as="h2"
            variant="heading-lg"
            family="brand"
            weight={600}
            className={s.referralTitle}
          >
            {t('referral.title')}
          </Typography>
        </div>

        <button
          type="button"
          className={s.inviteButton}
          onClick={handleInviteClick}
          disabled={isInviteDisabled}
        >
          <SendIcon width={18} height={18} aria-hidden />
          <span>{isCopied ? t('referral.copied') : t('referral.invite')}</span>
        </button>
      </div>

      <Typography
        as="p"
        variant="body-sm"
        family="system"
        weight={400}
        className={s.referralBody}
      >
        {t('referral.bodyStart')}
        <strong>100</strong>
        <img
          src={airIcon}
          alt={t('common.air')}
          className={s.inlineAirIcon}
          draggable={false}
        />{' '}
        {t('referral.bodyEnd')}
        <strong>1,000</strong>
        {t('referral.bodySuffix')}
      </Typography>

      <div className={s.progressBlock}>
        <div
          className={s.progressSegments}
          aria-label={t('referral.ariaProgress', {
            filled: filledSegments,
            goal: REFERRAL_GOAL,
          })}
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
            <strong>{referredCount}</strong> {t('referral.referredSuffix')}
          </Typography>
          <Typography
            as="span"
            variant="body-sm"
            family="system"
            weight={500}
            className={s.progressLabel}
          >
            {t('referral.remaining', {
              bonus: '1k',
              count: remainingCount,
            })}
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
          {error instanceof Error ? error.message : t('profile.errors.referral')}
        </Typography>
      ) : null}
    </section>
  );
}

type LanguageModalProps = {
  currentLanguage: Language;
  error: string | null;
  isSaving: boolean;
  savingLanguage?: Language;
  onClose: () => void;
  onSelect: (language: Language) => void;
};

function LanguageModal({
  currentLanguage,
  error,
  isSaving,
  savingLanguage,
  onClose,
  onSelect,
}: LanguageModalProps) {
  const { t } = useTranslation();

  return (
    <div className={s.modalOverlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={s.modal} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={s.modalClose}
          aria-label={t('common.close')}
          onClick={onClose}
          disabled={isSaving}
        >
          <CrossIcon width={18} height={18} />
        </button>
        <Typography
          as="h2"
          variant="heading-md"
          family="brand"
          weight={600}
          className={s.modalTitle}
        >
          {t('profile.changeLanguage')}
        </Typography>
        <div className={s.languageList}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isCurrent = option.value === currentLanguage;
            const isPending = isSaving && savingLanguage === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(s.languageOption, [], {
                  [s.languageOptionActive]: isCurrent,
                })}
                disabled={isSaving}
                onClick={() => {
                  if (isCurrent) {
                    onClose();
                    return;
                  }
                  onSelect(option.value);
                }}
              >
                <span>{option.label}</span>
                {isCurrent ? <CheckIcon width={18} height={18} /> : null}
                {isPending ? (
                  <Typography as="span" variant="caption" className={s.saving}>
                    {t('common.saving')}
                  </Typography>
                ) : null}
              </button>
            );
          })}
        </div>
        {error ? (
          <Typography as="p" variant="caption" className={s.errorText}>
            {error}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
