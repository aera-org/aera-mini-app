import TelegramWebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';

import { getCharacters } from '@/api/characters';
import type { ICharacter } from '@/common/types';
import { Text } from '@/components';

import s from './CharactersPage.module.scss';

type LoadState = 'idle' | 'loading' | 'error' | 'success';

export function CharactersPage() {
  const [state, setState] = useState<LoadState>('idle');
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchCharacters = async () => {
      setState('loading');
      setError(null);
      try {
        const data = await getCharacters();
        if (!alive) return;
        setCharacters(data.sort((a, b) => a.name.localeCompare(b.name)));
        setState('success');
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load');
        setState('error');
      }
    };

    void fetchCharacters();

    return () => {
      alive = false;
    };
  }, []);

  const handleCardClick = (character: ICharacter) => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    if (!botUsername) {
      console.error('VITE_BOT_USERNAME is not set');
      return;
    }

    const payload = `character_${character.id}`;
    TelegramWebApp.openTelegramLink(
      `https://t.me/${botUsername}?start=${encodeURIComponent(payload)}`,
    );
    TelegramWebApp.close();
  };

  return (
    <div className={s.container}>
      {state === 'loading' ? <Text variant="span">Loading...</Text> : null}
      {state === 'error' ? (
        <Text variant="span">{error || 'Failed to load characters'}</Text>
      ) : null}
      {state === 'success' ? (
        <div className={s.grid}>
          {characters.map((character) => (
            <div
              className={s.card}
              key={character.id}
              onClick={() => handleCardClick(character)}
            >
              <div className={s.imageWrap}>
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className={s.avatar}
                  draggable={false}
                />
              </div>
              <div className={s.cardBody}>
                <Text variant="span" className={s.name}>
                  {character.name}
                </Text>
                <div className={s.description}>{character.description}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
