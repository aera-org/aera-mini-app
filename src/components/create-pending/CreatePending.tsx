import { useTranslation } from 'react-i18next';

import heartIcon from '@/assets/mini/heart-white.png';
import { cn } from '@/common/utils';
import { Typography } from '@/components/text';

import s from './CreatePending.module.scss';

type CreatePendingProps = {
  title: string;
  description?: string;
  className?: string;
};

export function CreatePending({
  title,
  description,
  className,
}: CreatePendingProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(s.page, [className])}>
      <div className={s.content}>
        <div className={s.visual} aria-hidden>
          <span className={s.ring} />
          <span className={s.glow} />
          <img src={heartIcon} alt="" className={s.heart} draggable={false} />
        </div>
        <Typography
          as="h1"
          variant="heading-lg"
          family="brand"
          weight={600}
          className={s.title}
        >
          {title}
        </Typography>
        <Typography
          as="p"
          variant="body-md"
          family="system"
          className={s.text}
        >
          {description ?? t('common.pendingDescription')}
        </Typography>
        <div className={s.dots} aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
