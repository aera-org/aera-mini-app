import classNames from 'classnames';
import Card from '../../components/card';
import storeItem from '../../assets/storeItem.png';

import s from './index.module.css';

type CardItem = {
  label: React.ReactNode;
  userHave?: boolean;
  image?: string;
  bgImage?: string;
  price?: number;
  stars?: number;
  jumps?: number;
  id?: number;
  soon?: boolean;
};

const CardsList = ({
  items,
  className,
  onCardClick,
}: {
  items: CardItem[];
  className?: string;
  onCardClick?: (item: CardItem) => void;
}) => {
  return (
    <div className={classNames(s.cards, className)}>
      {items.map((item) => {
        const {
          label,
          userHave,
          image = storeItem,
          bgImage,
          stars,
          jumps,
          id,
          price,
          soon,
        } = item;
        if (!label) return null;

        return (
          <Card
            key={typeof label === 'string' ? label : Math.random().toString()}
            userHave={userHave || false}
            bgImage={bgImage || ''}
            label={label}
            image={image || ''}
            price={price || 0}
            stars={stars || 0}
            id={id || 0}
            jumps={jumps || 0}
            soon={soon || false}
            onClick={() => onCardClick && onCardClick(item)}
          />
        );
      })}
    </div>
  );
};

export default CardsList;
