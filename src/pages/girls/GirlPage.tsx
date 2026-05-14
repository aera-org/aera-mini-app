import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { getGirls } from '@/api/girls';
import {
  CharacterType,
  type ICharacter,
  isCharacterType,
} from '@/common/types';
import { compareScenarios, sortGirlsForCatalog } from '@/common/utils';
import { CharacterDetails, Loader, Typography } from '@/components';
import s from '@/components/character-details/CharacterDetails.module.scss';

export function GirlPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const rawType = searchParams.get('type') ?? '';
  const selectedType = isCharacterType(rawType)
    ? rawType
    : CharacterType.Realistic;
  const cachedGirls = sortGirlsForCatalog(
    queryClient.getQueryData<ICharacter[]>(['girls', selectedType]) ?? [],
  );
  const cachedGirl = cachedGirls.find((character) => character.id === id);
  const {
    data: girls = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['girls', selectedType],
    queryFn: () => getGirls(selectedType),
    enabled: !cachedGirl,
    select: sortGirlsForCatalog,
  });

  const girl = useMemo(
    () => cachedGirl ?? girls.find((character) => character.id === id),
    [cachedGirl, girls, id],
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
            {error instanceof Error ? error.message : 'Failed to load girl'}
          </Typography>
        </div>
      </div>
    );
  }

  if (!girl) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">Girl not found</Typography>
        </div>
      </div>
    );
  }

  return (
    <CharacterDetails
      character={girl}
      heroImageUrl={girl.promoImgUrl ?? girl.avatarUrl}
      getScenarioImageUrl={(scenario) => scenario.promoImgHorizontalUrl}
      scenarioComparator={compareScenarios}
    />
  );
}
