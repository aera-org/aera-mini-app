import { keepPreviousData, useQuery } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
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
import { useUser } from '@/context/UserContext';

import { CharacterTypeSwitch } from './CharacterTypeSwitch';
import s from './GirlsPage.module.scss';

const CHARACTER_CREATE_PRICE = 99;

type ScenarioWithGirl = {
  girl: ICharacter;
  scenario: IScenario;
};

export function GirlsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawType = searchParams.get('type') ?? '';
  const selectedType = isCharacterType(rawType)
    ? rawType
    : CharacterType.Realistic;
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
    if ((user?.air ?? 0) < CHARACTER_CREATE_PRICE) {
      navigate('/store');
      return;
    }

    navigate('/my-girls/create');
  };

  const handleTypeChange = (value: CharacterType) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('type', value);
    setSearchParams(nextSearchParams);
  };

  const handleActiveScenarioClick = (scenario: IScenario) => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    if (!botUsername) {
      console.error('VITE_BOT_USERNAME is not set');
      return;
    }
    if (!scenario.slug) {
      console.error('Scenario slug is missing');
      return;
    }

    TelegramWebApp.openTelegramLink(
      `https://t.me/${botUsername}?start=s_${scenario.slug}`,
    );
    TelegramWebApp.close();
  };

  const featuredGirls = girls.filter((girl) => girl.isFeatured);

  const compareScenarioEntries = (a: ScenarioWithGirl, b: ScenarioWithGirl) => {
    const scenarioResult = compareScenarios(a.scenario, b.scenario);
    if (scenarioResult !== 0) {
      return scenarioResult;
    }

    return compareGirlsByTopScenarioAndName(a.girl, b.girl);
  };

  const newScenarios = girls
    .flatMap((girl) =>
      (girl.scenarios ?? []).map((scenario) => ({
        girl,
        scenario,
      })),
    )
    .filter((item) => item.scenario.isNew && item.scenario.isActive === true)
    .sort(compareScenarioEntries);

  const comingSoonScenarios = girls
    .flatMap((girl) =>
      (girl.scenarios ?? []).map((scenario) => ({
        girl,
        scenario,
      })),
    )
    .filter((item) => item.scenario.isNew && item.scenario.isActive === false)
    .sort(compareScenarioEntries);

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
          {CHARACTER_CREATE_PRICE} AIR
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
              Create your own dream partner
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
              Try now
            </Typography>
          </button>
        </div>
      </div>
    </Card>
  );

  const renderScenarioItem = ({ girl, scenario }: ScenarioWithGirl) => (
    <button
      type="button"
      className={s.scenarioItem}
      key={`${girl.id}-${scenario.id}`}
      onClick={() => handleActiveScenarioClick(scenario)}
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
            handleActiveScenarioClick(scenario);
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
              customSlide={{
                backgroundImage: customCharacterImage,
                title: 'Your Character',
                description: 'Create your own dream partner',
                priceAir: CHARACTER_CREATE_PRICE,
                actionLabel: 'Try now',
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
            {featuredGirls.length ? (
              <div className={s.featuredRow}>
                {featuredGirls.slice(0, 2).map(renderGirlCard)}
                {renderCreateCharacterCard('featured-create-character')}
                {featuredGirls.slice(2).map(renderGirlCard)}
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
            <div className={s.grid}>
              {girls.slice(0, 3).map(renderGirlCard)}
              {renderCreateCharacterCard('grid-create-character')}
              {girls.slice(3).map(renderGirlCard)}
            </div>
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
