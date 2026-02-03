import classNames from 'classnames';
import { useState } from 'react';

import { Text } from '../../components/text';
import { CharacterModal } from '../../components/character-modal';
import FuelSection from '../../components/header-main/components/FuelSection';
import { usePage } from '../../context/pageContext';
import { useCharacterContext } from '../../context/characterContext';
import { PAGES } from '../../constants/page';
import { Character } from '../../types/character';
import { getCharacterImage } from '../../utils/characterUtils';
import question from '../../assets/header/question.png';

import s from './index.module.css';
import Loading from '../loading';
import { Button } from '@/components/button';

interface StoreCardProps {
  character: Character;
  onClick: () => void;
}

const StoreCard = ({ character, onClick }: StoreCardProps) => {
  const imageUrl = getCharacterImage(character);

  return (
    <div className={s.storeCard} onClick={onClick}>
      <div className={s.cardImageContainer}>
        <img src={imageUrl} alt={character.name} className={s.cardImage} />
      </div>
      <div className={s.cardName}>{character.name}</div>
    </div>
  );
};

interface CharactersListProps {
  handleTopUpClick: () => void;
}

const CharactersList = ({ handleTopUpClick }: CharactersListProps) => {
  const { page, setPage } = usePage();
  const {
    characters,
    loading: charactersLoading,
    error: charactersError,
    refetch,
  } = useCharacterContext();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleRetry = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refetch characters:', error);
      // Fallback to error page if refetch fails
      setTimeout(() => {
        sessionStorage.setItem('previousPath', window.location.pathname);
        window.location.href = '/error';
      }, 1500);
    }
  };

  const handleCardClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedCharacter(null);
  };

  // Show loading if characters are still loading
  if (charactersLoading) {
    return <Loading />;
  }

  // Show error if there's an error
  if (charactersError) {
    return (
      <div className={s.container}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Failed to load characters</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={classNames(s.container, {
          isHidden: page !== PAGES.HOME_PAGE,
        })}
      >
        <div className={s.topSection}>
          <Button
              className={s.questionBtn}
              label={
                <img
                  src={question}
                  className={s.question}
                  alt="question_icon"
                  draggable={false}
                />
              }
              type="text"
              onClick={() => {
                if (PAGES.GIRLS !== page) setPage(PAGES.GUIDE);
              }}
            />
          <FuelSection onTopUpClick={handleTopUpClick} />
        </div>

        <div className={s.header}>
          <Text color="white" variant="h1">
            Characters
          </Text>
          <Text variant="span" color="white">
            Choose your girl and start playing
          </Text>
        </div>

        <div className={s.cardsGrid}>
          {characters.map((character) => (
            <StoreCard
              key={character.name}
              character={character}
              onClick={() => handleCardClick(character)}
            />
          ))}
        </div>
      </div>

      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          isOpen={isOpenModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default CharactersList;
