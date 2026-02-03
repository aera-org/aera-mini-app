import { FC, useState } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import ProcessingModal from '../processingModal';
import { usePayment } from '../../hooks/usePayment';
import { PaymentCurrency } from '../../lib/paymentService';
import { useUser } from '../../context/userContext';
import electra from '../../assets/girls/electra.webp';

import s from './index.module.css';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnlockModal: FC<UnlockModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment } = usePayment();
  const { user } = useUser();

  const handleConfirm = async () => {
    if (!user) {
      return;
    }

    setIsProcessing(true);
    try {
      await processPayment(user, 'unlock_content', {
        id: 'electra_content',
        price: 12,
        name: 'Electra Content',
        currency: PaymentCurrency.XTR,
        girl: user.data.girl,
      });
    } catch (error) {
      console.error('Failed to unlock content:', error);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={s.modalContent}>
          <div className={s.imageContainer}>
            <img src={electra} alt="Electra" className={s.girlImage} />
          </div>

          <Text color="white" variant="h2" className={s.title}>
            Confirm Your Purchase
          </Text>
          <div>
            <Text color="white" center className={s.description}>
              By purchasing you agree to the
            </Text>
            <Text color="white" center className={s.terms}>
              Terms of Service.
            </Text>
          </div>

          <Button
            className={s.confirmBtn}
            onClick={handleConfirm}
            label={
              <div className={s.btnContent}>
                <Text color="white" variant="h3">
                  Confirm and Pay 12$
                </Text>
              </div>
            }
          />
        </div>
      </Modal>

      <ProcessingModal isOpen={isProcessing} message="Processing payment..." />
    </>
  );
};

export default UnlockModal;
