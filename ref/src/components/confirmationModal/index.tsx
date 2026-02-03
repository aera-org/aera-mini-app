import { FC } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';

import s from './index.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={s.modalContent}>
        <Text color="white" variant="h2" center>
          {title}
        </Text>

        <Text color="white" center className={s.message}>
          {message}
        </Text>

        <div className={s.buttonsContainer}>
          <Button
            className={s.cancelBtn}
            onClick={handleCancel}
            label={cancelText}
          />

          <Button
            className={s.confirmBtn}
            onClick={handleConfirm}
            label={confirmText}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
