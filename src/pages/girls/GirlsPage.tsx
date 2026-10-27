import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getGirls } from '@/api/girls';
import customCharacterImage from '@/assets/characters/custom.jpg';
import { MessageIcon, MessageMoreIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import {
  CharacterType,
  type ICharacter,
  type IScenario,
  isCharacterType,
} from '@/common/types';
import {
  compareGirlsByTopScenarioAndName,
  compareScenarios,
  sortGirlsForCatalog,
} from '@/common/utils';
import {
  Card,
  FeaturedGirlsSlider,
  IconButton,
  Loader,
  Typography,
} from '@/components';
import { CUSTOM_CHARACTER_CREATE_PRICE } from '@/consts';

import { CharacterTypeSwitch } from './CharacterTypeSwitch';
import s from './GirlsPage.module.scss';

type ScenarioWithGirl = {
  girl: ICharacter;
  scenario: IScenario;
};

const SCENARIOS_PAGE_SIZE = 10;

export function GirlsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawType = searchParams.get('type') ?? '';
  const selectedType = isCharacterType(rawType)
    ? rawType
    : CharacterType.Realistic;
  const [scenarioPages, setScenarioPages] = useState({
    type: selectedType,
    pages: 1,
  });
  const scenariosSentinelRef = useRef<HTMLDivElement>(null);
  const {
    data: girls = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['girls', selectedType],
    queryFn: () => getGirls(selectedType),
    placeholderData: keepPreviousData,
    select: sortGirlsForCatalog,
  });

  const handleCardClick = (character: ICharacter) => {
    navigate(`/girls/${character.id}?type=${selectedType}`);
  };

  const handleCreateCharacterClick = () => {
    navigate('/my-girls/create');
  };

  const handleTypeChange = (value: CharacterType) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('type', value);
    setSearchParams(nextSearchParams);
  };

  const handleActiveScenarioClick = (scenario: IScenario) => {
    navigate(`/scenarios/${scenario.id}`);
  };

  const featuredGirls = girls.filter((girl) => girl.isFeatured);

  const compareScenarioEntries = (a: ScenarioWithGirl, b: ScenarioWithGirl) => {
    const scenarioResult = compareScenarios(a.scenario, b.scenario);
    if (scenarioResult !== 0) {
      return scenarioResult;
    }

    return compareGirlsByTopScenarioAndName(a.girl, b.girl);
  };

  const activeScenarios = girls
    .flatMap((girl) =>
      (girl.scenarios ?? []).map((scenario) => ({
        girl,
        scenario,
      })),
    )
    .filter((item) => item.scenario.isActive === true)
    .sort(compareScenarioEntries);

  // Switching the character type starts the list from the first page again
  const loadedPages =
    scenarioPages.type === selectedType ? scenarioPages.pages : 1;
  const visibleScenarios = activeScenarios.slice(
    0,
    loadedPages * SCENARIOS_PAGE_SIZE,
  );
  const hasMoreScenarios = visibleScenarios.length < activeScenarios.length;

  useEffect(() => {
    const sentinel = scenariosSentinelRef.current;
    if (!hasMoreScenarios || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setScenarioPages({ type: selectedType, pages: loadedPages + 1 });
      },
      { rootMargin: '300px' },
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreScenarios, loadedPages, selectedType]);

  const comingSoonScenarios = girls
    .flatMap((girl) =>
      (girl.scenarios ?? []).map((scenario) => ({
        girl,
        scenario,
      })),
    )
    .filter((item) => item.scenario.isNew && item.scenario.isActive === false)
    .sort(compareScenarioEntries);

  const renderScenarioCard = ({ girl, scenario }: ScenarioWithGirl) => (
    <Card
      className={s.card}
      variant="neutral"
      backgroundImage={scenario.promoImgUrl}
      key={`${girl.id}-${scenario.id}`}
      onClick={() => handleActiveScenarioClick(scenario)}
    >
      {scenario.isNew ? (
        <span className={s.newBadge}>
          <Typography
            as="span"
            variant="caption"
            family="brand"
            weight={500}
            className={s.newBadgeText}
          >
            {t('girls.newScenario')}
          </Typography>
        </span>
      ) : null}
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
              {scenario.shortDescription}
            </Typography>
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={600}
              className={s.name}
            >
              {scenario.name}
            </Typography>
          </div>
          <IconButton
            aria-label={`Open scenario ${scenario.name}`}
            className={s.messageButton}
            onClick={(event) => {
              event.stopPropagation();
              handleActiveScenarioClick(scenario);
            }}
          >
            <MessageIcon width={18} height={18} />
          </IconButton>
        </div>
      </div>
    </Card>
  );

  const renderCreateCharacterCard = (key: string) => (
    <Card
      className={`${s.card} ${s.createCard}`}
      variant="neutral"
      backgroundImage={customCharacterImage}
      key={key}
      onClick={handleCreateCharacterClick}
    >
      <span className={s.createCardPrice}>
        <img
          src={airIcon}
          alt="air"
          className={s.createCardPriceIcon}
          draggable={false}
        />
        <Typography
          as="span"
          variant="body-sm"
          family="brand"
          weight={500}
          className={s.createCardPriceText}
        >
          {CUSTOM_CHARACTER_CREATE_PRICE} AIR
        </Typography>
      </span>
      <div className={s.cardBody}>
        <div className={s.createCardContent}>
          <div className={`${s.textColumn} ${s.createCardTextColumn}`}>
            <Typography
              as="div"
              variant="caption"
              family="system"
              weight={400}
              className={s.description}
            >
          {t('girls.createPartner')}
            </Typography>
          </div>
          <button
            type="button"
            className={s.createCardButton}
            onClick={(event) => {
              event.stopPropagation();
              handleCreateCharacterClick();
            }}
          >
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={600}
              className={s.createCardButtonText}
            >
              {t('girls.tryNow')}
            </Typography>
          </button>
        </div>
      </div>
    </Card>
  );

  const renderCharacterItem = (character: ICharacter) => (
    <button
      type="button"
      className={s.characterItem}
      key={character.id}
      onClick={() => handleCardClick(character)}
    >
      <Card
        className={s.characterThumb}
        variant="neutral"
        backgroundImage={character.avatarUrl}
      >
        <IconButton
          aria-label={t('girls.openChatWith', { name: character.name })}
          className={s.characterMessageButton}
          onClick={(event) => {
            event.stopPropagation();
            handleCardClick(character);
          }}
        >
          <MessageMoreIcon width={12} height={12} />
        </IconButton>
      </Card>
      <div className={s.characterMeta}>
        <Typography
          as="span"
          variant="body-sm"
          family="brand"
          weight={600}
          className={s.characterName}
        >
          {character.name}
        </Typography>
        <Typography
          as="span"
          variant="body-md"
          family="system"
          weight={400}
          className={s.characterDescription}
        >
          {character.description}
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
                {t('girls.comingSoon')}
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
            {error instanceof Error ? error.message : t('girls.errors.girls')}
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
              onScenarioClick={handleActiveScenarioClick}
              customSlide={{
                backgroundImage: customCharacterImage,
                title: t('girls.yourCharacter'),
                description: t('girls.createPartner'),
                priceAir: CUSTOM_CHARACTER_CREATE_PRICE,
                actionLabel: t('girls.tryNow'),
                onActionClick: handleCreateCharacterClick,
              }}
            />
          ) : null}
          <div className={s.container}>
            <CharacterTypeSwitch
              value={selectedType}
              onChange={handleTypeChange}
              disabled={isFetching}
            />
            {girls.length ? (
              <section className={s.charactersSection}>
                <Typography
                  as="span"
                  variant="heading-sm"
                  family="brand"
                  weight={500}
                  className={s.charactersTitle}
                >
                  {t('girls.characters')}
                </Typography>
                <div className={s.charactersList}>
                  {girls.map(renderCharacterItem)}
                </div>
              </section>
            ) : null}
            <div className={s.grid}>
              {renderCreateCharacterCard('grid-create-character')}
              {visibleScenarios.map(renderScenarioCard)}
            </div>
            {hasMoreScenarios ? (
              <div ref={scenariosSentinelRef} className={s.scrollSentinel} />
            ) : null}
            {!hasMoreScenarios && comingSoonScenarios.length ? (
              <section className={s.comingSoonSection}>
                <Typography
                  as="span"
                  variant="heading-sm"
                  family="brand"
                  weight={500}
                  className={s.comingSoonSectionTitle}
                >
                  {t('girls.comingSoonScenarios')}
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
