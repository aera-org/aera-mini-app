import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { getCustomCharacters } from '@/api/girls';
import customScenarioImage from '@/assets/mini/custom-horizontal.png';
import type { ICharacter } from '@/common/types';
import { CharacterDetails, Loader, Typography } from '@/components';
import s from '@/components/character-details/CharacterDetails.module.scss';
import { useUser } from '@/context/user-context';

const SCENARIO_CREATE_PRICE = 39;

export function MyGirlPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
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
              : t('girls.errors.customCharacter')}
          </Typography>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">{t('girls.girlNotFound')}</Typography>
        </div>
      </div>
    );
  }

  const scenarioCreatePrice = character.scenarios.length
    ? SCENARIO_CREATE_PRICE
    : 0;

  const handleCreateScenarioClick = () => {
    if (scenarioCreatePrice > 0 && (user?.air ?? 0) < scenarioCreatePrice) {
      navigate('/store');
      return;
    }

    navigate(`/my-girls/${character.id}/scenarios/create`);
  };

  return (
    <CharacterDetails
      className={s.custom}
      character={character}
      heroImageUrl={character.avatarUrl}
      description={character.personality
        .map((personality) => t(`create.options.${personality}`))
        .join(', ')}
      getScenarioImageUrl={(scenario) => scenario.openingImageUrl}
      createScenarioCard={{
        imageUrl: customScenarioImage,
        title: `✨ ${t('girls.yourScenario')}`,
        description: t('girls.yourScenarioDescription'),
        priceAir: scenarioCreatePrice || undefined,
        onClick: handleCreateScenarioClick,
      }}
    />
  );
}
