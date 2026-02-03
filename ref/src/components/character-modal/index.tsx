import { FC } from 'react';
import TelegramWebApp from '@twa-dev/sdk';

import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import { useUser } from '../../context/userContext';
import { Character } from '../../types/character';
import { getCharacterImage } from '../../utils/characterUtils';
import { icons } from '../../assets/icons';

import s from './index.module.css';
import { PAGES } from '@/constants/page';
import { usePage } from '@/context/pageContext';

interface Props {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterModal: FC<Props> = ({ character, isOpen, onClose }) => {
  const { user, setUser } = useUser();
  const { setPage } = usePage();

  const handleOpenChat = () => {
    if (character?.bot_username) {
      TelegramWebApp.openTelegramLink(`https://t.me/${character.bot_username}`);
    }
  };

  const goToGame = () => {
    if (!user) return;

    setUser({
      ...user,
      data: {
        ...user.data,
        girl: character.name,
      },
    });

    setPage(PAGES.GAME);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={s.modalContent}>
          <Text color="white" variant="h2">
            {character.name}
          </Text>

          <div className={s.imageContainer}>
            <img
              src={getCharacterImage(character)}
              alt={character.name}
              className={s.giftImage}
            />
          </div>

          <div className={s.buttonsContainer}>
            <Button
              className={s.jumpBtn}
              onClick={handleOpenChat}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={icons.chat} alt="Chat Icon" />
                  <Text color="white" variant="small">
                    Open Chat
                  </Text>
                </div>
              }
            />

            <Button
              className={s.starBtn}
              onClick={goToGame}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={icons.heart} alt="Game Icon" />
                  <Text color="white" variant="small">
                    Play Game
                  </Text>
                </div>
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
