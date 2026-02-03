import { ReactNode } from 'react';
import classNames from 'classnames';
import '../../App.css';

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
  // **Props
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

  const getClassNames = () => {
    return classNames(
      { [s[variant] || '']: variant },
      { [s.upperCase || '']: upperCase },
      { [s.nowrap || '']: nowrap },
      { [s.ellipsis || '']: ellipsis },
      { [s[weight] || '']: weight },
      { [s.center || '']: center },
      { [s[color] || '']: color },
      { [className || '']: className }
    );
  };

  if (variant === 'h1') {
    return (
      <h1 className={getClassNames()} {...rest}>
        {children}
      </h1>
    );
  }
  if (variant === 'h2') {
    return (
      <h2 className={getClassNames()} {...rest}>
        {children}
      </h2>
    );
  }
  if (variant === 'h3') {
    return (
      <h3 className={getClassNames()} {...rest}>
        {children}
      </h3>
    );
  }
  if (variant === 'h4') {
    return (
      <h4 className={getClassNames()} {...rest}>
        {children}
      </h4>
    );
  }

  return (
    <span className={getClassNames()} {...rest}>
      {children}
    </span>
  );
};
