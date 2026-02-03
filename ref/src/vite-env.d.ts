/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_API_URL: string;
  readonly VITE_GA4_ID: string;
  readonly VITE_URL: string;
  readonly VITE_ADMIN_TOKEN: string;
  readonly VITE_TELEGRAM_APP_LINK: string;
  readonly VITE_S3_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
