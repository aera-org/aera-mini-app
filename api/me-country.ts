export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'PATCH') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const country = request.headers.get('x-vercel-ip-country');
  if (!country) {
    return new Response(null, { status: 204 });
  }

  const initData = request.headers.get('x-telegram-init-data');
  if (!initData) {
    return new Response('Missing X-Telegram-Init-Data', { status: 401 });
  }

  const rawBaseUrl = process.env.VITE_API_URL || '';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  if (!baseUrl) {
    return new Response('Missing VITE_API_URL', { status: 500 });
  }

  const response = await fetch(`${baseUrl}/me`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      'x-telegram-init-data': initData,
    },
    body: JSON.stringify({ country }),
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
