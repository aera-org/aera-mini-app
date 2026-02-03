import { FC } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import s from './index.module.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitTime?: number;
  price?: number;
}

export const ErrorModal: FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  price = 250,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={s.container}>
        <Text variant="h1" className={s.title || ''}>
          Oops! Something went wrong
        </Text>
        <Text variant="h2" className={s.subtitle || ''}>
          Don't worry, we're working on it
        </Text>
        <Text variant="span" className={s.waitText || ''}>
          Please wait a moment and try again
        </Text>
        <Button
          className={s.button || ''}
          onClick={onClose}
          label={
            <Text variant="h3" color="white">
              Close
            </Text>
          }
        />
        <Button
          className={s.buyButton}
          onClick={onClose}
          label={
            <div className={s.buttonContent}>
              <span className={s.star}>★</span>
              <Text variant="h3" color="white">
                {price}
              </Text>
            </div>
          }
        />
        <Button
          className={s.waitButton}
          onClick={onClose}
          label={<Text variant="span">Wait</Text>}
        />
      </div>
    </Modal>
  );
};
