import angel from '@/assets/characters/angel.webp';
import electra from '@/assets/characters/electra.webp';
import eliza from '@/assets/characters/eliza.webp';
import olivia from '@/assets/characters/olivia.webp';
import type { ICharacter } from '@/common/types';
import { Text } from '@/components';

import s from './CharactersPage.module.scss';

const characters: ICharacter[] = [
  {
    id: 'electra',
    name: 'Electra',
    description: 'Sharp, playful, and dangerously curious.',
    avatarUrl: electra,
    emoji: '',
  },
  {
    id: 'angel',
    name: 'Angel',
    description: 'Soft charm with a bold streak.',
    avatarUrl: angel,
    emoji: '',
  },
  {
    id: 'olivia',
    name: 'Olivia',
    description: 'Calm voice, deep vibes, late-night energy.',
    avatarUrl: olivia,
    emoji: '',
  },
  {
    id: 'eliza',
    name: 'Eliza',
    description: 'Confident, teasing, always in control.',
    avatarUrl: eliza,
    emoji: '',
  },
];

export function CharactersPage() {
  return (
    <div className={s.container}>
      <div className={s.grid}>
        {characters.map((character) => (
          <div className={s.card} key={character.id}>
            <div className={s.imageWrap}>
              <img
                src={character.avatarUrl}
                alt={character.name}
                className={s.avatar}
                draggable={false}
              />
            </div>
            <div className={s.cardBody}>
              <Text variant="span" className={s.name}>
                {character.name}
              </Text>
              <div className={s.description}>{character.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
