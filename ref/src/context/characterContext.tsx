import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { characterApi } from '../api/character';
import { Character } from '../types/character';

interface CharacterContextType {
  characters: Character[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCharacterByName: (name: string) => Character | undefined;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export const useCharacterContext = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error(
      'useCharacterContext must be used within a CharacterProvider'
    );
  }
  return context;
};

interface CharacterProviderProps {
  children: React.ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({
  children,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allCharacters = await characterApi.getAllCharacters();
      setCharacters(allCharacters);
    } catch (err) {
      setError('Failed to fetch characters');
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCharacterByName = useCallback(
    (name: string): Character | undefined =>
      characters.find((char) => char.name === name),
    [characters]
  );

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const value: CharacterContextType = {
    characters,
    loading,
    error,
    refetch: fetchCharacters,
    getCharacterByName,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};
