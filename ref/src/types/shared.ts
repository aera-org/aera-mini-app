// Common types used across the application

export type GenericApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type ApiError = {
  message: string;
  code?: number;
  stack?: string;
  data?: unknown;
};

export type LoadingState = {
  isLoading: boolean;
  error: string | null;
};

export type ModalData = {
  title: string;
  progress: number;
  value: number;
  price: number;
  color: 'pink' | 'yellow';
  src: string;
  isPercent: boolean;
};

export type ProcessingState = {
  isProcessing: boolean;
  message: string;
  status: 'loading' | 'success' | 'error';
  allowManualClose: boolean;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type SortParams = {
  field: string;
  direction: 'asc' | 'desc';
};

export type FilterParams = {
  [key: string]: string | number | boolean;
};

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Event types
export type ClickEvent = React.MouseEvent<HTMLElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type KeyboardEvent = React.KeyboardEvent<HTMLElement>;

// Component props types
export type BaseComponentProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type ButtonProps = BaseComponentProps & {
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'text';
};

export type ModalProps = BaseComponentProps & {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

// API types
export type RequestConfig = {
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
};

export type ApiRequest<T = any> = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: T;
  config?: RequestConfig;
};

// Cache types
export type CacheEntry<T = any> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export type CacheConfig = {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
};

// Validation types
export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Theme types
export type Theme = 'light' | 'dark';

export type ThemeConfig = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  success: string;
  warning: string;
};

// Localization types
export type Locale = 'en' | 'uk' | 'ru';

export type TranslationKey = string;

export type TranslationParams = Record<string, string | number>;

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate';

export type AnimationConfig = {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
};

// Media types
export type MediaType = 'image' | 'video' | 'audio';

export type MediaConfig = {
  type: MediaType;
  src: string;
  alt?: string;
  preload?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

// Error boundary types
export type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error | undefined;
};

export type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};
