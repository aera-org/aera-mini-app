import { cn } from '@/common/utils';

import s from './IntimacyScale.module.scss';

export const INTIMACY_SEGMENTS = 8;

type IntimacyScaleProps = {
  stageIndex: number | null;
  className?: string;
};

export function IntimacyScale({ stageIndex, className }: IntimacyScaleProps) {
  return (
    <div className={cn(s.scale, [className])} aria-hidden>
      {Array.from({ length: INTIMACY_SEGMENTS }, (_, index) => {
        const isActiveSegment = stageIndex !== null && index <= stageIndex;
        const isCurrentSegment = stageIndex !== null && index === stageIndex;

        return (
          <span
            key={index}
            className={cn(s.segment, [
              isActiveSegment ? s.segmentActive : null,
              isCurrentSegment ? s.segmentCurrent : null,
            ])}
          />
        );
      })}
    </div>
  );
}
