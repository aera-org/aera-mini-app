import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

const CACHE_NAME = 'media-cache-v1';

const initCache = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    return cache;
  } catch (error) {
    return null;
  }
};

export const useMediaCache = (url: string, cache = true) => {
  const [isCached, setIsCached] = useState(!cache);
  const [isLoading, setIsLoading] = useState(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheMedia = async () => {
      try {
        setIsLoading(true);
        setIsCached(false);
        const cache = await initCache();
        if (!cache) {
          throw new Error('Failed to initialize cache');
        }

        // Перевіряємо чи є в кеші
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
          setIsCached(true);
          return;
        }

        // Якщо немає в кеші, завантажуємо
        const response = await fetch(url);
        await cache.put(url, response.clone());
        setIsCached(true);
      } catch (err) {
        logger.error('Failed to cache media', { error: String(err) });
        setError(err instanceof Error ? err.message : 'Failed to cache media');
      } finally {
        setIsLoading(false);
      }
    };

    if (cache) {
      cacheMedia();
    }
  }, [url, cache]);

  return { isCached, isLoading, error };
};
