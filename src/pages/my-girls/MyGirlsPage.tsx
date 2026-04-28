import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { getCustomCharacters } from '@/api/girls';
import customCharacterImage from '@/assets/characters/custom.jpg';
import { MessageIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import type { ICharacter } from '@/common/types';
import { formatPersonality } from '@/common/utils';
import { Card, IconButton, Loader, Typography } from '@/components';
import { useUser } from '@/context/UserContext';

import s from './MyGirlsPage.module.scss';

const CHARACTER_CREATE_PRICE = 99;

export function MyGirlsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    data: characters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['characters', 'custom'],
    queryFn: getCustomCharacters,
    select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const handleCardClick = (character: ICharacter) => {
    navigate(`/my-girls/${character.id}`);
  };

  const handleCreateCharacterClick = () => {
    if ((user?.air ?? 0) < CHARACTER_CREATE_PRICE) {
      navigate('/store');
      return;
    }

    navigate('/my-girls/create');
  };

  const renderCharacterCard = (character: ICharacter) => (
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
              {formatPersonality(character.personality)}
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

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div
          className={s.heroBackground}
          style={{ backgroundImage: `url(${customCharacterImage})` }}
        >
          <div className={s.heroOverlay} />
          <div className={s.heroContent}>
            <div className={s.heroCopy}>
            <div className={s.priceBadge}>
              <img
                src={airIcon}
                alt="air"
                className={s.priceIcon}
                draggable={false}
              />
              <Typography
                as="span"
                variant="body-sm"
                family="brand"
                weight={500}
                className={s.priceText}
              >
                99 AIR
              </Typography>
            </div>
              <Typography
                as="h1"
                variant="heading-lg"
                family="brand"
                weight={600}
                className={s.heroTitle}
              >
                Your Character
              </Typography>
              <Typography
                as="p"
                variant="body-md"
                family="system"
                weight={400}
                className={s.heroDescription}
              >
                Create your own dream partner
              </Typography>
            </div>
            <button
              type="button"
              className={s.createButton}
              onClick={handleCreateCharacterClick}
            >
              <Typography
                as="span"
                variant="body-sm"
                family="brand"
                weight={500}
                color="black"
                className={s.createButtonText}
              >
                Create Her
              </Typography>
            </button>
          </div>
        </div>
        <div className={s.bottomCard1} />
        <div className={s.bottomCard2} />
      </section>

      {isLoading ? (
        <div className={s.container}>
          <Loader />
        </div>
      ) : null}
      {isError ? (
        <div className={s.container}>
          <Typography variant="body-md">
            {error instanceof Error
              ? error.message
              : 'Failed to load custom characters'}
          </Typography>
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <div className={s.container}>
          <div className={s.grid}>{characters.map(renderCharacterCard)}</div>
        </div>
      ) : null}
    </div>
  );
}
