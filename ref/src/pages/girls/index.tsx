import s from './index.module.css';
import { useState, useEffect } from 'react';

import { Text } from '../../components/text';
import { Button } from '../../components/button';
import { PAGES } from '../../constants/page';
import { usePage } from '../../context/pageContext';
import { useUser } from '../../context/userContext';
import { useCharacterContext } from '../../context/characterContext';
import { userApi } from '../../api/user';
import { Character } from '../../types/character';
import { getCharacterTransparentImage } from '../../utils/characterUtils';

import classNames from 'classnames';

import Loading from '../loading';
import { useProcessing } from '../../context/processingContext';
import ErrorPage from '../error-page';

const shuffleArray = (array: Character[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    if (temp && newArray[j]) {
      newArray[i] = newArray[j]!;
      newArray[j] = temp;
    }
  }
  return newArray;
};

export default function Girls() {
  const { setPage } = usePage();
  const { user, isLoading, updateUser } = useUser();
  const {
    characters,
    loading: charactersLoading,
    error: charactersError,
    refetch,
  } = useCharacterContext();
  const [shuffledCharacters, setShuffledCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [retryAttempted, setRetryAttempted] = useState(false);
  const { showProcessing, hideProcessing } = useProcessing();

  useEffect(() => {
    if (!isLoading && user?.data?.girl) {
      setPage(PAGES.HOME_PAGE);
    }
  }, [user?.data?.girl, setPage, isLoading]);

  // Process characters when they change
  useEffect(() => {
    if (characters.length > 0) {
      const shuffled = shuffleArray(characters);
      setShuffledCharacters(shuffled);
      if (shuffled[0]) {
        setSelectedCharacter(shuffled[0]);
      }
      setRetryAttempted(false);
    }
  }, [characters]);

  const handleRetry = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refetch characters:', error);
    }
  };

  const handleGirlSelect = async (characterId: string) => {
    try {
      setLoading(true);

      const result = await userApi.selectGirl(characterId);

      if (result.success) {
        const selectedCharacter = characters.find(
          (character) => character.name === characterId
        );
        if (selectedCharacter) {
          setSelectedCharacter(selectedCharacter);
        }
        if (updateUser) {
          await updateUser();
        }
        setPage(PAGES.HOME_PAGE);
      } else {
        showProcessing(`${result.message || 'Failed to update girl'}`);
        setTimeout(() => {
          hideProcessing();
        }, 1500);
      }
    } catch (err) {
      showProcessing(`Failed to update girl`);
      setTimeout(() => {
        hideProcessing();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get character image
  const getCharacterImage = (character: Character) => {
    return getCharacterTransparentImage(character);
  };

  // Show loading if characters are still loading or if we're processing a selection
  if (isLoading || loading || charactersLoading) {
    return <Loading />;
  }

  // Show error if there's an error and we've attempted retry
  if (charactersError && retryAttempted) {
    return <ErrorPage onRetry={handleRetry} />;
  }

  return (
    <div
      className={classNames(s.girlsWrap, {
        isError: shuffledCharacters.length > 0,
      })}
      style={{
        padding: shuffledCharacters.length > 0 ? ' 0 15px 0 15px;' : '0',
      }}
    >
      {shuffledCharacters.length > 0 ? (
        <>
          <div className={s.girlsContainerWrap}>
            <div className={s.girlsContainer}>
              {shuffledCharacters.map((character) => {
                const isSelected = selectedCharacter?.name === character.name;
                return (
                  <div
                    key={character.name}
                    className={classNames(s.girlsCard, {
                      [s.selected || '']: isSelected,
                    })}
                    onClick={() => setSelectedCharacter(character)}
                  >
                    <img
                      src={getCharacterImage(character)}
                      alt={character.name}
                    />
                    <div className={s.overlay}>
                      {!isSelected && (
                        <Button
                          className={s.button}
                          onClick={() => setSelectedCharacter(character)}
                          label={
                            <Text color="white" variant="small">
                              {character.name}
                            </Text>
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={s.girlsDescriptionWrap}>
            <div className={s.girlsDescription}>
              <Text className={s.girlName} color="white" variant="h2">
                {selectedCharacter?.name}
              </Text>
              {selectedCharacter?.description && (
                <Text className={s.girlText} color="white" variant="small">
                  {selectedCharacter?.description || 'No description available'}
                </Text>
              )}
            </div>
            <div className={s.letsGoBtn}>
              <Button
                className={s.btn}
                onClick={() =>
                  selectedCharacter && handleGirlSelect(selectedCharacter.name)
                }
                label={
                  <Text color="white" variant="small">
                    Let's go
                  </Text>
                }
              />
            </div>
          </div>
        </>
      ) : (
        <ErrorPage onRetry={handleRetry} />
      )}
    </div>
  );
}
