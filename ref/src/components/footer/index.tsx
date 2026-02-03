import { usePage } from '../../context/pageContext';
import { icons as iconsCache } from '../../assets/icons';
import { useUser } from '../../context/userContext';
import { useCharacterContext } from '../../context/characterContext';

import s from './index.module.css';
import { Button } from '../button';
import { Text } from '../text';

import TelegramWebApp from '@twa-dev/sdk';

export default function Footer() {
  const { user } = useUser();
  const { setPage } = usePage();
  const { getCharacterByName } = useCharacterContext();
  const icons = [
    { title: 'Game', icon: iconsCache.heart },
    { title: 'Gifts', icon: iconsCache.gifts },
    { title: 'Chat', icon: iconsCache.chat, withPadding: true },
    { title: 'Tasks', icon: iconsCache.tasks },
    { title: 'Bag', icon: iconsCache.bag },
  ];

  return (
    <div className={s.footer}>
      {icons
        .filter(({ title }) => title !== 'HomePage')
        .map(({ title, icon, withPadding }) => {
          return (
            <div
              key={title}
              className={s.navItem}
              onClick={() => {
                if (title === 'Chat') {
                  const currentCharacter = user?.data.girl
                    ? getCharacterByName(user.data.girl)
                    : null;
                  if (currentCharacter?.bot_username) {
                    TelegramWebApp.openTelegramLink(
                      `https://t.me/${currentCharacter.bot_username}`
                    );
                  }
                } else {
                  setPage(title);
                }
              }}
            >
              <Button
                style={{ padding: withPadding ? '4px' : 0 }}
                label={
                  <img src={icon} alt={`icon-${title}`} draggable={false} />
                }
                className={s.navButton}
              />
              <Text variant="small">{title}</Text>
            </div>
          );
        })}
    </div>
  );
}
