import TelegramWebApp from '@twa-dev/sdk';
import { useTranslation } from 'react-i18next';

import { Typography } from '@/components';

import s from './AffiliatePage.module.scss';

export function AffiliatePage() {
  const { t } = useTranslation();
  const affiliateUrl = import.meta.env.VITE_AFFILIATE_URL?.trim();
  const isAffiliateDisabled = !affiliateUrl;
  const paragraphs = t('affiliate.body', { returnObjects: true }) as string[];

  const handleBecomePartnerClick = () => {
    if (!affiliateUrl) {
      console.error(t('affiliate.disabledError'));
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
      <section className={s.card}>
        <div className={s.copy}>
          <Typography
            as="h1"
            variant="display-lg"
            family="brand"
            weight={600}
            className={s.title}
          >
            {t('affiliate.title')}
          </Typography>
          <div className={s.text}>
            {paragraphs.map((paragraph) => (
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
            {t('affiliate.cta')}
          </Typography>
        </button>
      </section>
    </div>
  );
}
