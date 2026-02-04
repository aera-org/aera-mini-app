import TelegramWebApp from '@twa-dev/sdk';
import { useQuery } from '@tanstack/react-query';

import { getCharacters } from '@/api/characters';
import type { ICharacter } from '@/common/types';
import { Text } from '@/components';

import s from './CharactersPage.module.scss';

export function CharactersPage() {
  const {
    data: characters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
    select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  });

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
      {isLoading ? <Text variant="span">Loading...</Text> : null}
      {isError ? (
        <Text variant="span">
          {error instanceof Error ? error.message : 'Failed to load characters'}
        </Text>
      ) : null}
      {!isLoading && !isError ? (
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
