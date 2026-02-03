import { Character } from '../types/character';

/**
 * Get character image URL with fallback to static images
 * @param character - The character object
 * @returns The image URL string
 */
export const getCharacterImage = (character: Character): string => {
  // Try to get store_image from S3 files
  if (character.s3_files?.store_image?.key) {
    const s3Url = import.meta.env.VITE_S3_URL;

    if (s3Url) {
      // Remove trailing slash if exists and add proper separator
      const cleanS3Url = s3Url.replace(/\/$/, '');
      return `https://${cleanS3Url}/${character.s3_files.store_image.key}`;
    }
    // Fallback to direct S3 URL if no env variable
    return `https://cdn.bubblejump.ai/${character.s3_files.store_image.key}`;
  }

  // Fallback to static images based on character name
  const characterImages: Record<string, string> = {
    Electra: '/src/assets/girls/electra.webp',
    Angel: '/src/assets/girls/angel.webp',
    Eliza: '/src/assets/girls/eliza.webp',
    Olivia: '/src/assets/girls/olivia.webp',
  };

  return characterImages[character.name] || '/src/assets/girls/olivia.webp';
};

/**
 * Get character image URL for transparent store images
 * @param character - The character object
 * @returns The image URL string
 */
export const getCharacterTransparentImage = (character: Character): string => {
  // Try to get store_image_transparent from S3 files
  if (character.s3_files?.store_image_transparent?.key) {
    const s3Url = import.meta.env.VITE_S3_URL;

    if (s3Url) {
      // Remove trailing slash if exists and add proper separator
      const cleanS3Url = s3Url.replace(/\/$/, '');
      return `https://${cleanS3Url}/${character.s3_files.store_image_transparent.key}`;
    }
    // Fallback to direct S3 URL if no env variable
    return `https://your-s3-bucket.s3.amazonaws.com/${character.s3_files.store_image_transparent.key}`;
  }

  // Fallback to regular store image
  return getCharacterImage(character);
};
