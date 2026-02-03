import { type ReactNode } from 'react';

import s from './index.module.css';

type CommonText = {
  children?: ReactNode;
  color?: 'white' | 'error' | 'black';
  weight?: 400 | 600;
  upperCase?: boolean;
  nowrap?: boolean;
  center?: boolean;
  ellipsis?: boolean;
  className?: string | undefined;
};

type VariantTypography = CommonText & {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span' | 'small';
  fontSize?: never;
};

type CustomTypography = CommonText & {
  fontSize: { min: number; max: number };
  variant?: never;
};

export type TextProps = CustomTypography | VariantTypography;

export const Text = (props: TextProps) => {
  const {
    weight = 400,
    color = 'white',
    className,
    variant = 'span',
    ellipsis = false,
    nowrap = false,
    fontSize,
    upperCase,
    center,
    children,
    ...rest
  } = props;

  const style =
    fontSize && 'min' in fontSize
      ? {
          fontSize: `clamp(${fontSize.min}px, 2vw, ${fontSize.max}px)`,
          ...(rest as { style?: React.CSSProperties }).style,
        }
      : (rest as { style?: React.CSSProperties }).style;

  const classes = [
    variant ? s[variant] : null,
    upperCase ? s.upperCase : null,
    nowrap ? s.nowrap : null,
    ellipsis ? s.ellipsis : null,
    weight ? s[weight] : null,
    center ? s.center : null,
    color ? s[color] : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'h1') {
    return (
      <h1 className={classes} {...rest} style={style}>
        {children}
      </h1>
    );
  }
  if (variant === 'h2') {
    return (
      <h2 className={classes} {...rest} style={style}>
        {children}
      </h2>
    );
  }
  if (variant === 'h3') {
    return (
      <h3 className={classes} {...rest} style={style}>
        {children}
      </h3>
    );
  }
  if (variant === 'h4') {
    return (
      <h4 className={classes} {...rest} style={style}>
        {children}
      </h4>
    );
  }

  return (
    <span className={classes} {...rest} style={style}>
      {children}
    </span>
  );
};
