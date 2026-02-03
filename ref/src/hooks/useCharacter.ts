import { useState, useEffect, useCallback } from 'react';
import { useCharacterContext } from '../context/characterContext';
import { Character } from '../types/character';

export const useCharacter = (characterId?: string) => {
  const { loading: charactersLoading, error: charactersError, getCharacterByName } = useCharacterContext();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterByName = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const foundCharacter = getCharacterByName(name);
      if (foundCharacter) {
        // Transform the character data to match our local interface
        const filteredCharacter: Character = {
          name: foundCharacter.name,
          description: foundCharacter.description || '',
          bot_username: foundCharacter.bot_username || '',
          s3_files: {
            idle: foundCharacter.s3_files.idle,
            rub: foundCharacter.s3_files.rub,
            dance: foundCharacter.s3_files.dance,
            store_image: foundCharacter.s3_files.store_image,
            store_image_transparent:
              foundCharacter.s3_files.store_image_transparent,
          },
        };
        setCharacter(filteredCharacter);
      } else {
        setError('Character not found');
      }
    } catch (err) {
      setError('Failed to fetch character');
      console.error('Error fetching character:', err);
    } finally {
      setLoading(false);
    }
  }, [getCharacterByName]);

  // Only fetch by ID if characterId is provided
  useEffect(() => {
    if (characterId) {
      // For now, we'll use fetchCharacterByName with a different approach
      // You can implement fetchCharacterById later if needed
    }
  }, [characterId]);

  return {
    character,
    loading: loading || charactersLoading,
    error: error || charactersError,
    fetchCharacterByName,
    refetch: () =>
      character ? fetchCharacterByName(character.name) : undefined,
  };
};
