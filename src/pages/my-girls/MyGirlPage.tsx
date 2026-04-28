import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { getCustomCharacters } from '@/api/girls';
import customScenarioImage from '@/assets/mini/custom-horizontal.png';
import type { ICharacter } from '@/common/types';
import { formatPersonality } from '@/common/utils';
import { CharacterDetails, Loader, Typography } from '@/components';
import s from '@/components/character-details/CharacterDetails.module.scss';

export function MyGirlPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const cachedCharacters =
    queryClient.getQueryData<ICharacter[]>(['characters', 'custom']) ?? [];
  const cachedCharacter = cachedCharacters.find(
    (character) => character.id === id,
  );
  const {
    data: characters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['characters', 'custom'],
    queryFn: getCustomCharacters,
    enabled: !cachedCharacter,
  });

  const character = useMemo(
    () =>
      cachedCharacter ??
      characters.find((customCharacter) => customCharacter.id === id),
    [cachedCharacter, characters, id],
  );

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Loader />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">
            {error instanceof Error
              ? error.message
              : 'Failed to load custom character'}
          </Typography>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">Character not found</Typography>
        </div>
      </div>
    );
  }

  return (
    <CharacterDetails
      className={s.custom}
      character={character}
      heroImageUrl={character.avatarUrl}
      description={formatPersonality(character.personality)}
      getScenarioImageUrl={(scenario) => scenario.openingImageUrl}
      createScenarioCard={{
        imageUrl: customScenarioImage,
        title: '✨ Your Scenario',
        description:
          'Role, setting, lingerie... Whatever you wish.',
        priceAir: 39,
        onClick: () => {},
      }}
    />
  );
}
