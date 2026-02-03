import TelegramWebApp from '@twa-dev/sdk';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const initData = import.meta.env.VITE_AUTH || TelegramWebApp.initData;

  if (initData) {
    headers.set('X-Telegram-Init-Data', initData);
  }

  const url = baseUrl ? `${baseUrl}${input}` : input;

  return fetch(url, {
    ...init,
    headers,
  });
}
