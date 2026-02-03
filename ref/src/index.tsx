import './sentry.ts';
import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './index.css';
import './i18n/config';

import ReactGA from 'react-ga4';

// Global error handlers for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Log to Sentry in production
    if (import.meta.env.PROD) {
      Sentry.captureException(event.reason, {
        tags: {
          type: 'unhandled_promise_rejection',
        },
        extra: {
          promise: event.promise,
          reason: event.reason,
        },
      });
    }

    // Prevent the default browser behavior
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // Log to Sentry in production
    if (import.meta.env.PROD) {
      Sentry.captureException(event.error, {
        tags: {
          type: 'global_error',
        },
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    }
  });
}

if (import.meta.env.VITE_GA4_ID)
  ReactGA.initialize(import.meta.env.VITE_GA4_ID as string);

const root = createRoot(document.getElementById('root') as HTMLElement);

// Use Sentry ErrorBoundary only in production
const AppWrapper = import.meta.env.PROD ? (
  <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
    <App />
  </Sentry.ErrorBoundary>
) : (
  <App />
);

root.render(<StrictMode>{AppWrapper}</StrictMode>);
