import {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import s from './index.module.css';

type CommonTypography = {
  children?: ReactNode;
  as?: ElementType;
  color?: 'white' | 'error' | 'black' | 'muted' | 'inherit';
  weight?: 400 | 500 | 600 | 700 | 800;
  upperCase?: boolean;
  nowrap?: boolean;
  center?: boolean;
  ellipsis?: boolean;
  className?: string;
  style?: CSSProperties;
  family?: 'system' | 'brand';
} & Omit<HTMLAttributes<HTMLElement>, 'color'>;

type TypographyVariant =
  | 'display-xl'
  | 'display-lg'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'caption'
  | 'label';

type LegacyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span' | 'small';

type VariantTypography = CommonTypography & {
  variant?: TypographyVariant | LegacyVariant;
  fontSize?: never;
};

type CustomTypography = CommonTypography & {
  fontSize: { min: number; max: number };
  variant?: never;
};

export type TypographyProps = CustomTypography | VariantTypography;

const variantClassMap: Record<TypographyVariant | LegacyVariant, string> = {
  'display-xl': s.displayXl,
  'display-lg': s.displayLg,
  'heading-lg': s.headingLg,
  'heading-md': s.headingMd,
  'heading-sm': s.headingSm,
  'body-lg': s.bodyLg,
  'body-md': s.bodyMd,
  'body-sm': s.bodySm,
  caption: s.caption,
  label: s.label,
  h1: s.displayXl,
  h2: s.displayLg,
  h3: s.headingSm,
  h4: s.headingSm,
  h5: s.headingSm,
  span: s.bodyMd,
  small: s.caption,
};

const variantTagMap: Record<TypographyVariant | LegacyVariant, ElementType> = {
  'display-xl': 'h1',
  'display-lg': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'body-lg': 'p',
  'body-md': 'span',
  'body-sm': 'span',
  caption: 'span',
  label: 'span',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  span: 'span',
  small: 'span',
};

export const Typography = (props: TypographyProps) => {
  const {
    weight = 400,
    color = 'white',
    as,
    family,
    className,
    variant = 'body-md',
    ellipsis = false,
    nowrap = false,
    fontSize,
    upperCase,
    center,
    children,
    ...rest
  } = props;

  const style: CSSProperties | undefined =
    fontSize && 'min' in fontSize
      ? {
          fontSize: `clamp(${fontSize.min}px, 2vw, ${fontSize.max}px)`,
          ...rest.style,
        }
      : rest.style;

  const classes = [
    variantClassMap[variant],
    upperCase ? s.upperCase : null,
    nowrap ? s.nowrap : null,
    ellipsis ? s.ellipsis : null,
    weight ? s[weight] : null,
    center ? s.center : null,
    color ? s[color] : null,
    family ? s[family] : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = as ?? variantTagMap[variant] ?? 'span';
  return (
    <Component className={classes} {...rest} style={style}>
      {children}
    </Component>
  );
};

export const Text = Typography;
