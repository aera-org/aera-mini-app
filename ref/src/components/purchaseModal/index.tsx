import { FC, useState } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import Modal from '../modal';
import ProcessingModal from '../processingModal';
import ConfirmationModal from '../confirmationModal';
import { useCurrency } from '../../hooks/useCurrency';
import whiteStar from '../../assets/icons/whiteStar.png';
import { usePayment } from '../../hooks/usePayment';
import { PaymentCurrency } from '../../lib/paymentService';
import { useUser } from '../../context/userContext';

import s from './index.module.css';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  label: React.ReactNode;
  stars: number;
  jumps: number;
  id: number;
  title?: string;
  onPurchaseWithStars?: (
    id: number,
    price: number,
    name: string
  ) => Promise<void>;
  onPurchaseWithJumps?: (
    id: number,
    price: number,
    name: string
  ) => Promise<void>;
  customStarsPrice?: number;
  customJumpsPrice?: number;
  onRedirectToGifts?: () => void;
}

const PurchaseModal: FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  image,
  label,
  stars,
  jumps,
  id,
  title = 'Purchase Gift',
  onPurchaseWithStars,
  onPurchaseWithJumps,
  customStarsPrice,
  customJumpsPrice,
  onRedirectToGifts,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { processPayment } = usePayment();
  const { user } = useUser();
  const { icon: currencyIcon, name: currencyName } = useCurrency();

  const handlePurchaseWithStars = async () => {
    if (!user) {
      return;
    }

    setIsPurchasing(true);

    if (onPurchaseWithStars) {
      await onPurchaseWithStars(id, customStarsPrice || stars, String(label));
    } else {
      await processPayment(user, 'gift_stars', {
        id,
        price: customStarsPrice || stars,
        name: String(label),
        currency: PaymentCurrency.XTR,
        girl: user.data.girl,
      });
    }

    setIsPurchasing(false);
    onClose();
  };

  const handlePurchaseWithJumps = async () => {
    if (!user) {
      return;
    }

    const requiredJumps = customJumpsPrice || jumps;
    
    if (user.jumps < requiredJumps) {
      setShowConfirmation(true);
      return;
    }

    setIsPurchasing(true);

    if (onPurchaseWithJumps) {
      await onPurchaseWithJumps(id, customJumpsPrice || jumps, String(label));
    } else {
      await processPayment(user, 'gift_jumps', {
        id,
        price: customJumpsPrice || jumps,
        name: String(label),
        currency: PaymentCurrency.JUMPS,
        girl: user.data.girl,
      });
    }

    setIsPurchasing(false);
    onClose();
  };

  const handleConfirmStarsPayment = () => {
    handlePurchaseWithStars();
  };

  const handleCancelStarsPayment = () => {
    if (onRedirectToGifts) {
      onRedirectToGifts();
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !showConfirmation} onClose={onClose}>
        <div className={s.modalContent}>
          <Text color="white" variant="h2">
            {title}
          </Text>

          <div className={s.imageContainer}>
            <img src={image} alt={String(label)} className={s.giftImage} />
          </div>

          <Text color="white" center>
            {label}
          </Text>

          <div className={s.buttonsContainer}>
            <Button
              className={s.jumpBtn}
              onClick={handlePurchaseWithJumps}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={currencyIcon} alt="currencyIcon" />
                  <Text color="white" variant="small">
                    {(customJumpsPrice || jumps || 0).toLocaleString()}
                  </Text>
                </div>
              }
            />

            <Button
              className={s.starBtn}
              onClick={handlePurchaseWithStars}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={whiteStar} alt="starIcon" />
                  <Text color="white" variant="small">
                    {Math.floor(
                      customStarsPrice || stars || 0
                    ).toLocaleString()}
                  </Text>
                </div>
              }
            />
          </div>
        </div>
      </Modal>

      <ProcessingModal isOpen={isPurchasing} message="Processing purchase..." />
      
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={`Not Enough ${currencyName}`}
        message={`You don't have enough ${currencyName}. Pay with Stars?`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleConfirmStarsPayment}
        onCancel={handleCancelStarsPayment}
      />
    </>
  );
};

export default PurchaseModal;
