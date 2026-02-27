import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { getGirls } from '@/api/girls';
import { MessageIcon, MessageMoreIcon } from '@/assets/icons';
import type { ICharacter, IScenario } from '@/common/types';
import {
  Card,
  FeaturedGirlsSlider,
  IconButton,
  Loader,
  Typography,
} from '@/components';

import s from './GirlsPage.module.scss';

type ScenarioWithGirl = {
  girl: ICharacter;
  scenario: IScenario;
};

export function GirlsPage() {
  const navigate = useNavigate();
  const {
    data: girls = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['girls'],
    queryFn: getGirls,
    select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const handleCardClick = (character: ICharacter) => {
    navigate(`/girls/${character.id}`);
  };

  const featuredGirls = girls.filter((girl) => girl.isFeatured);

  const newScenarios = useMemo(() => {
    const parseDate = (value: string) => {
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return girls
      .flatMap((girl) =>
        (girl.scenarios ?? []).map((scenario) => ({
          girl,
          scenario,
        })),
      )
      .filter((item) => item.scenario.isNew && item.scenario.isActive === true)
      .sort(
        (a, b) =>
          parseDate(b.scenario.createdAt) - parseDate(a.scenario.createdAt),
      );
  }, [girls]);

  const comingSoonScenarios = useMemo(
    () =>
      girls
        .flatMap((girl) =>
          (girl.scenarios ?? []).map((scenario) => ({
            girl,
            scenario,
          })),
        )
        .filter(
          (item) => item.scenario.isNew && item.scenario.isActive === false,
        ),
    [girls],
  );

  const renderGirlCard = (character: ICharacter) => (
    <Card
      className={s.card}
      variant="neutral"
      backgroundImage={character.avatarUrl}
      key={character.id}
      onClick={() => handleCardClick(character)}
    >
      <div className={s.cardBody}>
        <div className={s.contentRow}>
          <div className={s.textColumn}>
            <Typography
              as="div"
              variant="caption"
              family="system"
              weight={400}
              className={s.description}
            >
              {character.description}
            </Typography>
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={600}
              className={s.name}
            >
              {character.name}
            </Typography>
          </div>
          <IconButton
            aria-label={`Open chat with ${character.name}`}
            className={s.messageButton}
            onClick={(event) => {
              event.stopPropagation();
              handleCardClick(character);
            }}
          >
            <MessageIcon width={18} height={18} />
          </IconButton>
        </div>
      </div>
    </Card>
  );

  const renderScenarioItem = ({ girl, scenario }: ScenarioWithGirl) => (
    <button
      type="button"
      className={s.scenarioItem}
      key={`${girl.id}-${scenario.id}`}
      onClick={() => handleCardClick(girl)}
    >
      <Card
        className={s.scenarioThumb}
        variant="neutral"
        backgroundImage={scenario.promoImgUrl}
      >
        <IconButton
          aria-label={`Open scenario ${scenario.name}`}
          className={s.scenarioMessageButton}
          onClick={(event) => {
            event.stopPropagation();
            handleCardClick(girl);
          }}
        >
          <MessageMoreIcon width={12} height={12} />
        </IconButton>
      </Card>
      <div className={s.scenarioMeta}>
        <Typography
          as="span"
          variant="body-sm"
          family="brand"
          weight={600}
          className={s.scenarioName}
        >
          {scenario.name}
        </Typography>
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={400}
          className={s.scenarioDescription}
        >
          {scenario.shortDescription}
        </Typography>
      </div>
    </button>
  );

  const renderComingSoonScenario = ({ girl, scenario }: ScenarioWithGirl) => (
    <button
      type="button"
      className={s.comingSoonCardButton}
      key={`coming-soon-${girl.id}-${scenario.id}`}
      onClick={() => handleCardClick(girl)}
    >
      <Card
        className={s.comingSoonCard}
        variant="neutral"
        backgroundImage={scenario.promoImgHorizontalUrl}
      >
        <div className={s.comingSoonCardBody}>
          <div className={s.comingSoonRow}>
            <div className={s.comingSoonTextBlock}>
              <Typography
                as="span"
                variant="heading-lg"
                family="brand"
                weight={600}
                className={s.comingSoonName}
              >
                {scenario.name}
              </Typography>
              <Typography
                as="span"
                variant="body-md"
                family="system"
                weight={400}
                className={s.comingSoonDescription}
              >
                {scenario.shortDescription}
              </Typography>
            </div>
            <span className={s.comingSoonBadge}>
              <Typography
                as="span"
                variant="body-sm"
                family="brand"
                weight={500}
                className={s.comingSoonBadgeText}
              >
                coming soon
              </Typography>
            </span>
          </div>
        </div>
      </Card>
    </button>
  );

  return (
    <div className={s.page}>
      {isLoading ? (
        <div className={s.container}>
          <Loader />
        </div>
      ) : null}
      {isError ? (
        <div className={s.container}>
          <Typography variant="body-md">
            {error instanceof Error ? error.message : 'Failed to load girls'}
          </Typography>
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <>
          {featuredGirls.length ? (
            <FeaturedGirlsSlider
              girls={featuredGirls}
              onMessageClick={(girl) => handleCardClick(girl)}
              onGiftClick={() => navigate('/gifts')}
            />
          ) : null}
          <div className={s.container}>
            {featuredGirls.length ? (
              <div className={s.featuredRow}>
                {featuredGirls.map(renderGirlCard)}
              </div>
            ) : null}
            {newScenarios.length ? (
              <section className={s.newScenariosSection}>
                <Typography
                  as="span"
                  variant="heading-sm"
                  family="brand"
                  weight={500}
                  className={s.newScenariosTitle}
                >
                  New scenarios
                </Typography>
                <div className={s.newScenariosList}>
                  {newScenarios.map(renderScenarioItem)}
                </div>
              </section>
            ) : null}
            <div className={s.grid}>{girls.map(renderGirlCard)}</div>
            {comingSoonScenarios.length ? (
              <section className={s.comingSoonSection}>
                <Typography
                  as="span"
                  variant="heading-sm"
                  family="brand"
                  weight={500}
                  className={s.comingSoonSectionTitle}
                >
                  Coming soon scenarios
                </Typography>
                <div className={s.comingSoonList}>
                  {comingSoonScenarios.map(renderComingSoonScenario)}
                </div>
              </section>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
