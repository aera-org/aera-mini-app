import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import TelegramWebApp from '@twa-dev/sdk';
import { enc, SHA256 } from 'crypto-js';
import { ApiError } from '../types/shared';
import { logger } from '../utils/logger';

/**
 * Generates a unique session ID using crypto.randomUUID or fallback
 * @returns A unique session ID string
 */
const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return (
      'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  );
};

/**
 * Gets or creates a session ID that persists for the browser session
 * @returns The session ID for the current session
 */
const getSessionId = (): string => {
  const SESSION_KEY = 'app_session_id';

  if (typeof window === 'undefined') {
    return 'server_session';
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

const API_BASE_URL =
    import.meta.env.VITE_ENV === 'development'
        ? '/api'
        : import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Using ApiError from shared types

export const errorHandler = (error: unknown): ApiError => {
  logger.error('API error handler', { error: String(error) });
  return { message: 'Unknown error' };
};

/**
 * Calculates a SHA-256 hash for request parameters and timestamp
 * @param params - Request parameters (body or query string)
 * @param timestamp - Request timestamp in milliseconds
 * @returns SHA-256 hash as a hex string
 */
export const calculateRequestHash = (
    params: string | Record<string, unknown> | undefined,
    timestamp: number
): string => {
  const paramsString =
      typeof params === 'string' ? params : JSON.stringify(params || {});

  const dataToHash = paramsString + timestamp;
  return SHA256(dataToHash).toString(enc.Hex);
};

const requestHandler = async (
    request: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  if (typeof window !== 'undefined') {
    // Extract and add bot parameter to all requests BEFORE hash calculation
    // Use cached bot ID from sessionStorage for better performance
    const botParam = sessionStorage.getItem('activeBotId') ||
                     new URLSearchParams(window.location.search).get('bot') ||
                     'aera';
    if (!request.params) {
      request.params = {};
    }
    request.params.bot = botParam;

    console.log('request.params.bot', request.params.bot);

    // Skip security middleware in development environment
    if (import.meta.env.VITE_ENV !== 'development') {
      // Generate timestamp for request
      const timestamp = Date.now();
      request.headers['X-Request-Timestamp'] = timestamp.toString();

      // Calculate hash based on request parameters and timestamp
      // IMPORTANT: This now includes the 'bot' parameter we just added
      let requestParams: string | Record<string, unknown> | undefined;
      if (['GET', 'DELETE'].includes(request.method?.toUpperCase() || '')) {
        // For GET/DELETE: use query parameters (including bot param)
        requestParams = new URLSearchParams(request.params).toString();
      } else {
        // For POST/PUT/PATCH: use request body
        requestParams = request.data;
      }

      const hash = calculateRequestHash(requestParams, timestamp);
      request.headers['X-Request-Hash'] = hash;
    }
  }

  // Add session ID to all requests
  const sessionId = getSessionId();
  request.headers['X-Session-ID'] = sessionId;

  // Add Telegram init data to all requests
  const initData = TelegramWebApp.initData;
  if (initData) {
    request.headers['web-app-init-data'] = initData;
  }

  // Add admin token for admin routes
  if (request.url?.startsWith('/admin/')) {
    request.headers['X-Admin-Token'] = import.meta.env.VITE_ADMIN_TOKEN;
  }

  return request;
};

const responseHandler = (response: AxiosResponse): AxiosResponse => {
  return response;
};

apiClient.interceptors.request.use(
    (request) => requestHandler(request),
    (error) => Promise.reject(errorHandler(error))
);

apiClient.interceptors.response.use(
    (response) => responseHandler(response),
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      logger.error('API request failed', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      });
      return Promise.reject(errorHandler(error));
    }
);

export default apiClient;