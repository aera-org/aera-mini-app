import { useState, useEffect } from 'react';

interface CacheResult {
  isCached: boolean;
  isLoading: boolean;
  error: string | null;
}

async function cacheImage(imageUrl: string): Promise<void> {
  // Пропускаємо кешування для data URLs
  if (imageUrl?.startsWith('data:')) {
    return;
  }

  const cache = await caches.open('image-cache-v1');
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  await cache.put(imageUrl, response);
}

async function checkImageCache(imageUrl: string): Promise<boolean> {
  // Data URLs завжди вважаються "закешованими"
  if (imageUrl?.startsWith('data:')) {
    return true;
  }

  const cache = await caches.open('image-cache-v1');
  const response = await cache.match(imageUrl);
  return !!response;
}

export function useImageCache(imageUrl: string): CacheResult {
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const cacheAndCheck = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Якщо це data URL, просто позначаємо як закешований
        if (imageUrl?.startsWith('data:')) {
          setIsCached(true);
          setIsLoading(false);
          return;
        }

        // Перевіряємо чи зображення вже в кеші
        const isInCache = await checkImageCache(imageUrl);

        if (!isInCache) {
          // Якщо не в кеші, кешуємо
          await cacheImage(imageUrl);
        }

        if (mounted) {
          setIsCached(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Unknown error occurred'
          );
          setIsCached(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    cacheAndCheck();

    return () => {
      mounted = false;
    };
  }, [imageUrl]);

  return { isCached, isLoading, error };
}
