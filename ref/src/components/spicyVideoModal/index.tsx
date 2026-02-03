import { FC } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import s from './index.module.css';

interface SpicyVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => void;
  price: number;
}

const SpicyVideoModal: FC<SpicyVideoModalProps> = ({
  isOpen,
  onClose,
  onBuy,
  price,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={s.container}>
        <Text variant="h1" className={s.title}>
          Spicy content
        </Text>
        <Text variant="h2" className={s.subtitle}>
          Private dance
        </Text>
        <Text variant="span" className={s.waitText}>
          Wanna see my dance for you?..
        </Text>
        <Button
          className={s.buyButton}
          onClick={onBuy}
          label={
            <div className={s.buttonContent}>
              <span className={s.star}>★</span>
              <Text variant="h3" color="white">
                {price}
              </Text>
            </div>
          }
        />
      </div>
    </Modal>
  );
};

export default SpicyVideoModal;
