import TelegramWebApp from '@twa-dev/sdk';

import { Typography } from '@/components';

import s from './AffiliatePage.module.scss';

const AFFILIATE_PARAGRAPHS = [
  'Hello, we are the AERA team.',
  'We are scaling fast and looking for long-term partners who can bring consistent, high-volume traffic to our product.',
  'If you run Telegram channels or social media platforms, we’re actively buying traffic and building strategic partnerships.',
  'Fill out the form below, and our team will contact you to discuss placements and collaboration.',
];

export function AffiliatePage() {
  const affiliateUrl = import.meta.env.VITE_AFFILIATE_URL?.trim();
  const isDisabled = !affiliateUrl;

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
      <section className={s.card}>
        <div className={s.copy}>
          <Typography
            as="h1"
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
          disabled={isDisabled}
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
