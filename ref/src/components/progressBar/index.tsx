import { FC } from 'react';

import s from './index.module.css';

interface ProgressBarProps {
  progress: number;
  isBlocks?: boolean;
  steps?: number;
  currentStep?: number;
  fillPercent?: number;
  showText?: boolean;
  text?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({
  progress,
  isBlocks,
  steps,
  currentStep = 0,
  fillPercent = 0,
  showText = false,
  text,
}) => {
  if (isBlocks && steps) {
    const stepArray = Array.from({ length: steps }, (_, i) => i);
    return (
      <div className={s.blocksProgressBar}>
        {stepArray.map((i) => (
          <div key={i} className={s.blocksProgressBarSegment}>
            <div
              className={s.fill}
              style={{
                width:
                  i < currentStep
                    ? '100%'
                    : i === currentStep
                    ? `${fillPercent}%`
                    : '0%',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);

  return (
    <div className={s.progresBar}>
      <div
        className={s.progresBarValue}
        style={{
          width: `${normalizedProgress}%`,
        }}
      />
      {showText && text && (
        <div className={s.progressText}>
          {text}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
