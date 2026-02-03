import s from './index.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className,
}: SkeletonProps) => {
  return (
    <div
      className={`${s.skeleton} ${className || ''}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};
